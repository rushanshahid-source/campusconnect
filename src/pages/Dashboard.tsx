import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Package, BookOpen, GraduationCap, Share2,
  Star, Bell, ChevronRight, Crown
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { ServiceIcon } from "@/lib/serviceLogos";
import { PLACEHOLDER_IMAGE, onImageError } from "@/lib/imageFallback";
import AppLayout from "@/components/layout/AppLayout";

const featureCards = [
  { icon: Package, label: "Item Rentals", desc: "Borrow gear locally", path: "/market", color: "#6366F1" },
  { icon: BookOpen, label: "Academic Marketplace", desc: "Buy/Sell textbooks", path: "/academic", color: "#10B981" },
  { icon: GraduationCap, label: "Skill Sharing", desc: "Tutors & services", path: "/skills", color: "#F59E0B" },
  { icon: Share2, label: "Split Subs", desc: "Netflix & Canva Pro", path: "/subscriptions", color: "#EC4899" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: trendingItems } = trpc.items.trending.useQuery({ limit: 4 });
  const { data: activeSubs } = trpc.subscriptions.list.useQuery({ limit: 3 });

  const trustScore = 9.2;

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-4 pt-6 pb-4"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Salaam, {user?.name?.split(" ")[0] || "Student"}! 👋
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Your campus economy is thriving. You saved <span className="text-[#10B981] font-semibold">Rs. 2,450</span> this month.
            </p>
          </div>
          <button className="relative p-2 bg-[#1A1F2E] rounded-xl border border-white/5">
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </motion.div>

        {/* Trust Score Card */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-[#1A1F2E] to-[#252B3D] rounded-2xl p-4 border border-white/5 mb-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Trust Score</p>
              <h2 className="text-2xl font-bold text-[#10B981]">Excellent</h2>
              <p className="text-xs text-gray-400">Top 2% of Students</p>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1A1F2E" strokeWidth="3" />
                <motion.circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke="#10B981" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${trustScore * 10.5} 100`}
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray: `${trustScore * 10.5} 100` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {trustScore}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-5">
          {featureCards.map((card) => (
            <motion.button
              key={card.label}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(card.path)}
              className="bg-[#1A1F2E] rounded-2xl p-4 border border-white/5 text-left hover:border-white/10 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <card.icon size={20} style={{ color: card.color }} />
              </div>
              <h3 className="text-sm font-semibold">{card.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{card.desc}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Trending Section */}
        <motion.div variants={itemVariants} className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold">Trending at NUST</h2>
              <p className="text-xs text-gray-500">Most requested items this week</p>
            </div>
            <button
              onClick={() => navigate("/market")}
              className="text-xs text-[#6366F1] flex items-center gap-0.5"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {trendingItems?.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/market/${item.id}`)}
                className="w-full flex items-center gap-3 bg-[#1A1F2E] rounded-xl p-3 border border-white/5 text-left"
              >
                <img
                  src={item.image || PLACEHOLDER_IMAGE}
                  onError={onImageError}
                  alt={item.title}
                  className="w-14 h-14 rounded-lg object-cover bg-[#252B3D]"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.category}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={10} className="text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-xs text-gray-400">{item.viewCount} views</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#10B981]">Rs. {item.price}</p>
                  <span className="text-[10px] text-gray-500 capitalize">{item.priceType.replace("_", " ")}</span>
                </div>
              </motion.button>
            ))}
            {!trendingItems?.length && (
              <div className="text-center py-8 text-gray-500 text-sm">No items yet</div>
            )}
          </div>
        </motion.div>

        {/* Active Subscriptions */}
        <motion.div variants={itemVariants} className="mb-5">
          <h2 className="text-lg font-bold mb-3">Active Shared Subscriptions</h2>
          <div className="space-y-2.5">
            {activeSubs?.map((sub) => (
              <motion.div
                key={sub.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/subscriptions")}
                className="bg-[#1A1F2E] rounded-xl p-3 border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <ServiceIcon
                    name={sub.serviceName}
                    tileClassName="w-10 h-10 rounded-lg"
                    imgClassName="w-6 h-6 object-contain"
                  />
                  <div>
                    <h4 className="text-sm font-medium">{sub.serviceName}</h4>
                    <p className="text-xs text-gray-500">{sub.plan}</p>
                    <p className="text-xs text-gray-400">
                      {(sub.filledSlots ?? 0)}/{sub.maxSlots} slots filled
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#6366F1]">Rs. {sub.costPerSlot}</p>
                  <span className="text-[10px] px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded-full">
                    {sub.maxSlots - (sub.filledSlots ?? 0)} left
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Campus Pro Promo */}
        <motion.div
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-[#6366F1]/20 to-[#10B981]/20 rounded-2xl p-4 border border-[#6366F1]/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Crown size={18} className="text-[#F59E0B]" />
            <h3 className="font-semibold">Campus Pro</h3>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            Unlock zero-security-deposit rentals and priority academic matching.
          </p>
          <button className="w-full py-2.5 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            Upgrade - Rs. 999/Sem
          </button>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
