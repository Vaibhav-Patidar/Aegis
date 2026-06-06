import { useNavigate } from "react-router-dom";
import { Search, Bell, HelpCircle, User } from "lucide-react";
import { useState } from "react";

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  return (
    <header className="h-utility-bar-height sticky top-0 z-40 bg-surface border-b border-outline-variant flex justify-between items-center px-gutter w-full">
      <div className="flex items-center gap-2 text-on-surface-variant font-mono text-label-caps uppercase tracking-widest" />

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            className="bg-background border border-outline-variant rounded pl-8 pr-3 py-1.5 font-mono text-data-mono text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none w-64 placeholder:text-on-surface-variant"
            placeholder="Search memory..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <button className="hover:text-primary transition-colors cursor-pointer flex items-center justify-center relative">
            <Bell size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-error rounded-full" />
          </button>
          <button className="hover:text-primary transition-colors cursor-pointer flex items-center justify-center">
            <HelpCircle size={20} />
          </button>
          <div
            className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate("/profile")}
          >
            <User size={16} className="text-on-surface" />
          </div>
        </div>
      </div>
    </header>
  );
}
