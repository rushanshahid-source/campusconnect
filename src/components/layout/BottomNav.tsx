import { useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Home, Store, Handshake, MessageSquare, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/market", icon: Store, label: "Market" },
  { path: "/deals", icon: Handshake, label: "Deals" },
  { path: "/chat", icon: MessageSquare, label: "Chat" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Don't show bottom nav on landing page
  if (currentPath === "/" || currentPath === "/login" || currentPath === "/register") return null;

  const elevated = user?.role === "admin" || user?.role === "moderator";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F1A]/95 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 pb-safe">
        {[...navItems, ...(elevated ? [{ path: "/control-center", icon: ShieldCheck, label: "Control" }] : [])].map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#6366F1]/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                size={22}
                className={`relative z-10 transition-colors ${
                  isActive ? "text-[#6366F1]" : "text-gray-400"
                }`}
              />
              <span
                className={`relative z-10 text-[10px] font-medium transition-colors ${
                  isActive ? "text-[#6366F1]" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
