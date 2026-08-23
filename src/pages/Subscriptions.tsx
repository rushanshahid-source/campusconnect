import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ChevronLeft, Plus, Users, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { ServiceIcon } from "@/lib/serviceLogos";
import AppLayout from "@/components/layout/AppLayout";

const popularServices = [
  { name: "Netflix", color: "#E50914", icon: "N" },
  { name: "Spotify", color: "#1DB954", icon: "S" },
  { name: "YouTube Premium", color: "#FF0000", icon: "Y" },
  { name: "Canva Pro", color: "#00C4CC", icon: "C" },
  { name: "Adobe CC", color: "#FF0000", icon: "A" },
  { name: "Notion", color: "#000000", icon: "N" },
];

export default function Subscriptions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

  const { data: subscriptions, refetch } = trpc.subscriptions.list.useQuery({ limit: 50 });
  const joinMutation = trpc.subscriptions.join.useMutation({
    onSuccess: () => refetch(),
  });

  const handleJoin = (subId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }
    joinMutation.mutate({ subscriptionId: subId });
  };

  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 bg-[#1A1F2E] rounded-xl border border-white/5"
            >
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Split Subscriptions</h1>
              <p className="text-xs text-gray-500">Share costs with classmates</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate(!showCreate)}
            className="bg-[#6366F1] hover:bg-[#5558E0] text-white"
          >
            <Plus size={16} className="mr-1" /> Create
          </Button>
        </div>

        {/* Savings Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#6366F1]/20 to-[#10B981]/20 rounded-2xl p-4 border border-[#6366F1]/20 mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Your savings this month</p>
              <p className="text-2xl font-bold text-[#10B981]">Rs. 1,850</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#10B981]/20 flex items-center justify-center">
              <Share2 size={24} className="text-[#10B981]" />
            </div>
          </div>
        </motion.div>

        {/* Popular Services */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold mb-3">Popular Services</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {popularServices.map((service) => (
              <motion.button
                key={service.name}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1.5 min-w-[60px]"
              >
                <ServiceIcon
                  name={service.name}
                  tileClassName="w-12 h-12 rounded-xl text-lg"
                  imgClassName="w-7 h-7 object-contain"
                />
                <span className="text-[10px] text-gray-400">{service.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Active Subscriptions */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Available to Join</h2>
          <div className="space-y-3">
            {subscriptions?.map((sub, i) => {
              const filledSlots = sub.filledSlots ?? 0;
              const availableSlots = sub.maxSlots - filledSlots;
              const progress = (filledSlots / sub.maxSlots) * 100;

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#1A1F2E] rounded-2xl p-4 border border-white/5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <ServiceIcon
                        name={sub.serviceName}
                        tileClassName="w-10 h-10 rounded-lg"
                        imgClassName="w-6 h-6 object-contain"
                      />
                      <div>
                        <h3 className="text-sm font-medium">{sub.serviceName}</h3>
                        <p className="text-xs text-gray-500">{sub.plan}</p>
                      </div>
                    </div>
                    <Badge
                      className={
                        availableSlots > 0
                          ? "bg-[#10B981]/20 text-[#10B981]"
                          : "bg-red-500/20 text-red-400"
                      }
                    >
                      {availableSlots} slots left
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-[#252B3D] rounded-full mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-[#6366F1] to-[#10B981] rounded-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-400">
                        {sub.filledSlots}/{sub.maxSlots} members
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#6366F1]">
                        Rs. {sub.costPerSlot}/mo
                      </span>
                      {availableSlots > 0 ? (
                        <Button
                          size="sm"
                          onClick={() => handleJoin(sub.id)}
                          disabled={joinMutation.isPending}
                          className="bg-[#6366F1] hover:bg-[#5558E0] text-white text-xs h-8"
                        >
                          {joinMutation.isPending ? "..." : "Join"}
                        </Button>
                      ) : (
                        <Badge variant="outline" className="border-gray-600 text-gray-500 text-[10px]">
                          Full
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {subscriptions?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Share2 size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-lg mb-2">No active subscriptions</p>
            <p className="text-sm">Create one to start saving!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
