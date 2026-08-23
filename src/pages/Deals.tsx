import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ChevronLeft, Shield, Clock, CheckCircle, AlertCircle, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/layout/AppLayout";

const statusConfig = {
  pending: { color: "#F59E0B", icon: Clock, label: "Pending" },
  in_escrow: { color: "#6366F1", icon: Shield, label: "In Escrow" },
  completed: { color: "#10B981", icon: CheckCircle, label: "Completed" },
  disputed: { color: "#EF4444", icon: AlertCircle, label: "Disputed" },
  cancelled: { color: "#6B7280", icon: AlertCircle, label: "Cancelled" },
};

// Demo deals for visualization
const demoDeals = [
  {
    id: 1,
    itemName: "Canon EOS R5 DSLR",
    amount: "4500.00",
    status: "in_escrow" as const,
    date: "2026-06-01",
    otherParty: "Fatima Zahra",
    type: "rental",
  },
  {
    id: 2,
    itemName: "Calculus II Notes",
    amount: "300.00",
    status: "completed" as const,
    date: "2026-05-28",
    otherParty: "Ahmed Khan",
    type: "purchase",
  },
  {
    id: 3,
    itemName: "Arduino Starter Kit",
    amount: "800.00",
    status: "pending" as const,
    date: "2026-06-04",
    otherParty: "Zara Malik",
    type: "rental",
  },
  {
    id: 4,
    itemName: "Smart Irrigation Project",
    amount: "12500.00",
    status: "in_escrow" as const,
    date: "2026-06-03",
    otherParty: "Ali Raza",
    type: "purchase",
  },
];

export default function Deals() {
  const navigate = useNavigate();
  // const { user } = useAuth();

  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-[#1A1F2E] rounded-xl border border-white/5"
          >
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold">My Deals</h1>
            <p className="text-xs text-gray-500">Track your transactions</p>
          </div>
        </div>

        {/* Escrow Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#6366F1]/20 to-[#10B981]/20 rounded-2xl p-4 border border-[#6366F1]/20 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
              <Shield size={24} className="text-[#6366F1]" />
            </div>
            <div>
              <p className="text-sm font-medium">Escrow Protection Active</p>
              <p className="text-xs text-gray-400">
                All payments are held securely until both parties confirm
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#1A1F2E] rounded-xl p-3 border border-white/5 text-center">
            <p className="text-lg font-bold text-[#6366F1]">12</p>
            <p className="text-[10px] text-gray-500">Total Deals</p>
          </div>
          <div className="bg-[#1A1F2E] rounded-xl p-3 border border-white/5 text-center">
            <p className="text-lg font-bold text-[#10B981]">10</p>
            <p className="text-[10px] text-gray-500">Completed</p>
          </div>
          <div className="bg-[#1A1F2E] rounded-xl p-3 border border-white/5 text-center">
            <p className="text-lg font-bold text-[#F59E0B]">2</p>
            <p className="text-[10px] text-gray-500">In Progress</p>
          </div>
        </div>

        {/* Deals List */}
        <div className="space-y-3">
          {demoDeals.map((deal, i) => {
            const config = statusConfig[deal.status];
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#1A1F2E] rounded-2xl p-4 border border-white/5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium">{deal.itemName}</h3>
                    <p className="text-xs text-gray-500">{deal.otherParty}</p>
                  </div>
                  <Badge
                    style={{
                      backgroundColor: `${config.color}20`,
                      color: config.color,
                      borderColor: `${config.color}30`,
                    }}
                    className="border"
                  >
                    <StatusIcon size={10} className="mr-1" />
                    {config.label}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-lg font-bold" style={{ color: config.color }}>
                      Rs. {deal.amount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{deal.date}</p>
                    <p className="text-[10px] text-gray-600 capitalize">{deal.type}</p>
                  </div>
                </div>

                {deal.status === "in_escrow" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2"
                  >
                    <QrCode size={14} className="text-[#10B981]" />
                    <span className="text-xs text-[#10B981]">QR Handover Ready</span>
                    <span className="ml-auto w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* How Escrow Works */}
        <div className="mt-6 mb-4">
          <h2 className="text-sm font-semibold mb-3">How Escrow Works</h2>
          <div className="space-y-3">
            {[
              { step: "1", title: "Buyer pays", desc: "Funds are held securely in escrow" },
              { step: "2", title: "Exchange items", desc: "Meet on campus and scan QR code" },
              { step: "3", title: "Release funds", desc: "Payment released to seller instantly" },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#6366F1] font-bold text-xs">{s.step}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
