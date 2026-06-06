import json
from pathlib import Path
import sys

# Import logic from main
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import classify_root_cause, generate_incident_id

def process_file(filename):
    data_path = Path(__file__).parent / "data" / filename
    if not data_path.exists():
        return
    with open(data_path, "r") as f:
        incidents = json.load(f)

    p_levels = {"CRITICAL": "P1", "HIGH": "P2", "MEDIUM": "P3", "LOW": "P4"}

    for inc in incidents:
        # Add incident_id if missing
        if "incident_id" not in inc or not inc["incident_id"]:
            inc["incident_id"] = generate_incident_id(inc.get("alert_text", ""))
        
        # Add root_cause_category
        rc = inc.get("root_cause", "")
        alert = inc.get("alert_text", "")
        inc["root_cause_category"] = classify_root_cause(rc + " " + alert)
        
        # Add severity_p_level
        sev = inc.get("severity", "MEDIUM")
        inc["severity_p_level"] = p_levels.get(sev, "P3")
        
        # Add short_root_cause
        inc["short_root_cause"] = rc[:72] + ("…" if len(rc) > 72 else "")
        
    with open(data_path, "w") as f:
        json.dump(incidents, f, indent=2)
    print(f"Updated {filename}")

if __name__ == "__main__":
    process_file("incidents.json")
    process_file("incidents2.json")
