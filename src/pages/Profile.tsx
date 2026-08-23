import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  ChevronLeft, Settings, LogOut, Star, Package,
  Heart, MessageSquare, Shield, ChevronRight, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";

const menuItems = [
  { icon: Package, label: "My Listings", path: "/market" },
  { icon: Heart, label: "Saved Items", path: "/market" },
  { icon: MessageSquare, label: "Messages", path: "/chat" },
  { icon: Shield, label: "Trust Score", path: "/dashboard" },
  { icon: Crown, label: "Campus Pro", path: "/dashboard" },
  { icon: Settings, label: "Settings", path: "/dashboard" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const trustScore = 9.2;
  const totalDeals = 12;
  const memberSince = "2025";

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[80vh] px-6">
          <div className="w-20 h-20 rounded-full bg-[#1A1F2E] flex items-center justify-center mb-4">
            <Shield size={32} className="text-gray-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Sign in to view your profile</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Join Campus Connect to access all features
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white w-full h-12"
          >
            Get Started
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 bg-[#1A1F2E] rounded-xl border border-white/5"
            >
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
          <button
            onClick={logout}
            className="p-2 bg-red-500/10 rounded-xl border border-red-500/20"
          >
            <LogOut size={18} className="text-red-400" />
          </button>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1A1F2E] to-[#252B3D] rounded-2xl p-5 border border-white/5 mb-5"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366F1] to-[#10B981] flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user?.name?.charAt(0) || "S"}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center border-2 border-[#0B0F1A]">
                <CheckIcon className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{user?.name || "Student"}</h2>
              <p className="text-xs text-gray-400">{user?.email || "student@nust.edu.pk"}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge className="bg-[#6366F1]/20 text-[#6366F1] text-[10px]">
                  {user?.university || "NUST"}
                </Badge>
                <Badge className="bg-[#10B981]/20 text-[#10B981] text-[10px]">
                  {user?.campus || "H-12 Islamabad"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                <span className="text-lg font-bold">{trustScore}</span>
              </div>
              <p className="text-[10px] text-gray-500">Trust Score</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{totalDeals}</p>
              <p className="text-[10px] text-gray-500">Deals</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{memberSince}</p>
              <p className="text-[10px] text-gray-500">Member Since</p>
            </div>
          </div>
        </motion.div>

        {/* Trust Score Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1F2E] rounded-2xl p-4 border border-white/5 mb-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Trust Score Breakdown</h3>
            <span className="text-xs text-[#10B981] font-medium">Top 2%</span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "On-time Returns", value: 98, color: "#10B981" },
              { label: "Communication", value: 95, color: "#6366F1" },
              { label: "Item Condition", value: 92, color: "#F59E0B" },
              { label: "Response Time", value: 88, color: "#EC4899" },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{metric.label}</span>
                  <span className="text-xs font-medium">{metric.value}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#252B3D] rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: metric.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 bg-[#1A1F2E] rounded-xl p-3.5 border border-white/5 text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-[#252B3D] flex items-center justify-center">
                <item.icon size={18} className="text-[#6366F1]" />
              </div>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight size={16} className="text-gray-500" />
            </motion.button>
          ))}
        </div>

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={logout}
          className="w-full mt-4 py-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium"
        >
          Sign Out
        </motion.button>

        <p className="text-center text-[10px] text-gray-600 mt-4">
          Campus Connect v1.0.0
        </p>
      </div>
    </AppLayout>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}
