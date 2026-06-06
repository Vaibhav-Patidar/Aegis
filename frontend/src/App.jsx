import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import Dashboard from "./pages/Dashboard";
import Diagnose from "./pages/Diagnose";
import Memory from "./pages/Memory";
import Runbooks from "./pages/Runbooks";
import Logs from "./pages/Logs";
import CommandCenter from "./pages/CommandCenter";
import Architecture from "./pages/Architecture";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import { X } from "lucide-react";

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded border backdrop-blur-sm transition-all animate-slide-in ${
        type === "error"
          ? "bg-error/10 border-error/50 text-error"
          : type === "success"
          ? "bg-primary/10 border-primary/50 text-primary"
          : "bg-surface-container border-outline-variant text-on-surface"
      }`}
    >
      <span className="text-body-base font-inter flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}

export default function App() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 ml-sidebar-width flex flex-col min-h-screen">
          <TopBar />
          <main className="flex-1 p-container-padding bg-background">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/diagnose" element={<Diagnose />} />
              <Route path="/memory" element={<Memory />} />
              <Route path="/runbooks" element={<Runbooks />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/command-center" element={<CommandCenter />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
          </main>
        </div>

        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
