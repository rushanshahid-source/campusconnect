import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  ChevronLeft, Heart, Share2, MapPin, Shield,
  Calendar, Zap, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { PLACEHOLDER_IMAGE, onImageError } from "@/lib/imageFallback";
import AppLayout from "@/components/layout/AppLayout";

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);
  const [selectedDates, setSelectedDates] = useState<number[]>([3, 4, 5]);

  const { data: item } = trpc.items.byId.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  const createDeal = trpc.deals.create.useMutation({
    onSuccess: () => {
      setShowQR(true);
    },
  });

  if (!item) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full"
          />
        </div>
      </AppLayout>
    );
  }

  const handleReserve = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    createDeal.mutate({
      sellerId: item.ownerId,
      itemId: item.id,
      amount: String(Number(item.price) * selectedDates.length),
      meetupLocation: "Student Service Center (H-12)",
    });
  };

  const days = selectedDates.length;
  const totalPrice = Number(item.price) * days;

  return (
    <AppLayout>
      <div className="relative">
        {/* Image Header */}
        <div className="relative h-72">
          <img
            src={item.image || PLACEHOLDER_IMAGE}
            onError={onImageError}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-black/30" />

          {/* Top Buttons */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <button
              onClick={() => navigate("/market")}
              className="p-2.5 bg-black/40 backdrop-blur-lg rounded-full"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <div className="flex gap-2">
              <button className="p-2.5 bg-black/40 backdrop-blur-lg rounded-full">
                <Heart size={20} className="text-white" />
              </button>
              <button className="p-2.5 bg-black/40 backdrop-blur-lg rounded-full">
                <Share2 size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Secure Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2"
          >
            <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30 backdrop-blur-lg">
              <Shield size={12} className="mr-1" /> Secure Escrow Protected
            </Badge>
          </motion.div>
        </div>

        {/* Content */}
        <div className="px-4 -mt-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1F2E] rounded-2xl p-4 border border-white/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-xl font-bold">{item.title}</h1>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-400">{item.campus || item.university}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#10B981]">Rs. {item.price}</p>
                <p className="text-xs text-gray-500">/{item.priceType.replace("_", " ")}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {item.tags?.split(",").map((tag) => (
                <span key={tag} className="px-2 py-1 bg-[#252B3D] rounded-lg text-[10px] text-gray-400">
                  {tag.trim()}
                </span>
              )) || (
                <>
                  <span className="px-2 py-1 bg-[#252B3D] rounded-lg text-[10px] text-gray-400">{item.category}</span>
                  <span className="px-2 py-1 bg-[#252B3D] rounded-lg text-[10px] text-gray-400">{item.condition}</span>
                </>
              )}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4"
          >
            <h2 className="text-sm font-semibold mb-2">Description</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
          </motion.div>

          {/* Owner Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 bg-[#1A1F2E] rounded-xl p-3 border border-white/5 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#10B981] flex items-center justify-center">
              <span className="text-white font-bold text-sm">FK</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Fatima Zahra</p>
              <p className="text-xs text-gray-500">School of Arts & Design (SADA)</p>
            </div>
            <Button variant="outline" size="sm" className="bg-[#252B3D] border-white/10 text-xs">
              View Profile
            </Button>
          </motion.div>

          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-[#6366F1]" />
              <h2 className="text-sm font-semibold">Select Rental Dates</h2>
            </div>
            <div className="bg-[#1A1F2E] rounded-xl p-4 border border-white/5">
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
                  <span key={d} className="text-xs text-gray-500 py-1">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {[...Array(31)].map((_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDates.includes(day);
                  const isToday = day === 3;
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDates(selectedDates.filter((d) => d !== day));
                        } else {
                          setSelectedDates([...selectedDates, day]);
                        }
                      }}
                      className={`py-1.5 text-xs rounded-lg transition-all ${
                        isSelected
                          ? "bg-[#6366F1] text-white"
                          : isToday
                          ? "bg-[#6366F1]/20 text-[#6366F1]"
                          : "text-gray-400 hover:bg-[#252B3D]"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Price Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-4 flex items-center justify-between bg-[#1A1F2E] rounded-xl p-4 border border-white/5"
          >
            <div>
              <p className="text-xs text-gray-500">Total Duration</p>
              <p className="text-lg font-semibold">{days} Days</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Price</p>
              <p className="text-xl font-bold text-[#10B981]">Rs. {totalPrice.toLocaleString()}</p>
            </div>
          </motion.div>

          {/* Reserve Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 mb-6"
          >
            <Button
              onClick={handleReserve}
              disabled={createDeal.isPending}
              className="w-full h-14 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#5558E0] hover:to-[#4338CA] text-white font-medium rounded-xl text-base"
            >
              {createDeal.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <span className="flex items-center gap-2">
                  <Zap size={18} /> Reserve Now
                </span>
              )}
            </Button>
          </motion.div>

          {/* QR Section */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-gradient-to-br from-[#10B981]/10 to-[#6366F1]/10 rounded-2xl p-5 border border-[#10B981]/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                  <QrCode size={20} className="text-[#10B981]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#10B981]">Instant QR Handover Ready</h3>
                  <p className="text-xs text-gray-400">No need to wait for manual verification</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 mb-4 flex items-center justify-center">
                <div className="w-32 h-32 bg-[#0B0F1A] rounded-lg flex items-center justify-center">
                  <QrCode size={64} className="text-white" />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                <span className="text-xs text-[#10B981]">Live Transfer Ready</span>
              </div>

              <ol className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-[#6366F1] font-mono">01.</span>
                  Meet at the Student Service Center (H-12)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6366F1] font-mono">02.</span>
                  Inspect gear & scan owner&apos;s phone QR
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6366F1] font-mono">03.</span>
                  Escrow releases payment instantly
                </li>
              </ol>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
