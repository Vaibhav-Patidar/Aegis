def _truncate(text: str, max_chars: int = 150) -> str:
    text = str(text)
    return text[:max_chars] + "..." if len(text) > max_chars else text


def build_diagnosis_prompt(alert_text: str, similar_incidents: list[dict], service_name: str, severity: str) -> list[dict]:
    context_blocks = ""

    if similar_incidents:
        for i, inc in enumerate(similar_incidents[:2], 1):
            steps_raw = inc.get("resolution_steps", [])
            first_step = _truncate(steps_raw[0], 80) if steps_raw else "N/A"
            alert = _truncate(inc.get("alert_text", "N/A"), 120)
            rc = _truncate(inc.get("root_cause", "N/A"), 150)
            context_blocks += (
                f"\n--- Incident {i} ---\n"
                f"Alert: {alert}\n"
                f"Root Cause: {rc}\n"
                f"Resolution Step 1: {first_step}\n"
            )
    else:
        context_blocks = "\nNo similar incidents found in memory.\n"

    system_message = {
        "role": "system",
        "content": (
            "You are a senior Site Reliability Engineer with deep expertise in "
            "distributed systems, microservices, and production incident response. "
            "You have access to a historical incident memory system that provides "
            "similar past incidents for context. "
            "You must ALWAYS respond with valid JSON only. No markdown formatting, "
            "no code fences, no explanation text outside the JSON structure. "
            "Use the provided similar incidents to inform your diagnosis. "
            "Be specific and technical in your analysis. Avoid generic or vague responses."
        ),
    }

    user_message = {
        "role": "user",
        "content": (
            f"Service Name: {service_name}\n"
            f"Suggested Severity: {severity}\n\n"
            f"Similar historical incidents:\n{context_blocks}\n\n"
            f"CURRENT ALERT:\n{alert_text}\n\n"
            "Analyze this alert using the historical context above and respond with "
            "ONLY this JSON structure:\n"
            "{\n"
            '  "root_cause": "specific technical root cause based on the alert and historical patterns",\n'
            '  "confidence": 0.0,\n'
            '  "resolution_steps": ["step 1", "step 2", "step 3"],\n'
            '  "mttr_estimate_mins": 0,\n'
            '  "reasoning": "explanation of why this is the likely cause based on memory"\n'
            "}\n\n"
            "Instruction: If no similar incidents were available, set confidence lower and note "
            "that no historical memory was available in the reasoning field."
        ),
    }

    return [system_message, user_message]

