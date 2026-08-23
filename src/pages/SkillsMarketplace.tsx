import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ChevronLeft, Search, GraduationCap, Star, Clock, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/layout/AppLayout";

const subjects = [
  { id: "all", label: "All" },
  { id: "math", label: "Math" },
  { id: "programming", label: "Programming" },
  { id: "science", label: "Science" },
  { id: "design", label: "Design" },
  { id: "writing", label: "Writing" },
];

export default function SkillsMarketplace() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState("all");

  const { data: tutors } = trpc.tutors.list.useQuery({
    search: search || undefined,
    limit: 50,
  });

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
            <h1 className="text-xl font-bold">Skill Sharing</h1>
            <p className="text-xs text-gray-500">Learn from peer tutors</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search tutors, subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#1A1F2E] border-white/10 text-white placeholder:text-gray-600 h-11"
          />
        </div>

        {/* Subjects */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeSubject === sub.id
                  ? "bg-[#F59E0B] text-white"
                  : "bg-[#1A1F2E] text-gray-400 border border-white/5"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        {/* Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#F59E0B]/10 to-[#EC4899]/10 rounded-xl p-4 border border-[#F59E0B]/20 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center">
              <GraduationCap size={20} className="text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-sm font-medium">Become a Tutor</p>
              <p className="text-xs text-gray-400">Share your skills and earn money</p>
            </div>
            <Button size="sm" className="ml-auto bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs">
              Apply
            </Button>
          </div>
        </motion.div>

        {/* Tutors List */}
        <div className="space-y-3">
          {tutors?.map((tutor, i) => (
            <motion.div
              key={tutor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#1A1F2E] rounded-2xl p-4 border border-white/5"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366F1] to-[#10B981] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">
                    {tutor.title?.charAt(0) || "T"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{tutor.title}</h3>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-[#F59E0B] fill-[#F59E0B]" />
                      <span className="text-xs font-medium">{tutor.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{tutor.bio}</p>

                  {tutor.subjects && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tutor.subjects.split(",").slice(0, 3).map((subj) => (
                        <Badge key={subj} variant="outline" className="border-[#6366F1]/30 text-[#6366F1] text-[10px]">
                          <BookOpen size={8} className="mr-1" />
                          {subj.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#10B981]">
                        Rs. {tutor.hourlyRate}/hr
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock size={10} /> {tutor.totalSessions} sessions
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white text-xs h-8"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {tutors?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <GraduationCap size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-lg mb-2">No tutors found</p>
            <p className="text-sm">Check back later or try a different search</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
