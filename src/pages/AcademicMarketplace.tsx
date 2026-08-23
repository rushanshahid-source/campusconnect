import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ChevronLeft, Search, BookOpen, FileText, Download, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/layout/AppLayout";

const categories = [
  { id: "all", label: "All" },
  { id: "notes", label: "Notes" },
  { id: "books", label: "Books" },
  { id: "projects", label: "Projects" },
];

export default function AcademicMarketplace() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: items } = trpc.items.list.useQuery({
    category: activeCategory === "all" ? undefined : (activeCategory as any),
    type: "sale",
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
            <h1 className="text-xl font-bold">Academic Marketplace</h1>
            <p className="text-xs text-gray-500">Buy & sell study materials</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search notes, books, projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#1A1F2E] border-white/10 text-white placeholder:text-gray-600 h-11"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-[#10B981] text-white"
                  : "bg-[#1A1F2E] text-gray-400 border border-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#10B981]/10 to-[#6366F1]/10 rounded-xl p-4 border border-[#10B981]/20 mb-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
            <BookOpen size={24} className="text-[#10B981]" />
          </div>
          <div>
            <p className="text-sm font-medium">500+ Academic Resources</p>
            <p className="text-xs text-gray-400">Notes, books, and projects from top students</p>
          </div>
        </motion.div>

        {/* Items List */}
        <div className="space-y-3">
          {items?.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/market/${item.id}`)}
              className="w-full flex items-start gap-3 bg-[#1A1F2E] rounded-xl p-3 border border-white/5 text-left"
            >
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#6366F1]/20 to-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                <FileText size={28} className="text-[#6366F1]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium truncate pr-2">{item.title}</h4>
                  <span className="text-sm font-bold text-[#10B981] whitespace-nowrap">
                    Rs. {item.price}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-white/10 text-[10px] text-gray-400">
                    {item.condition}
                  </Badge>
                  <div className="flex items-center gap-0.5">
                    <Star size={10} className="text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-[10px] text-gray-400">{item.viewCount} views</span>
                  </div>
                  <Download size={12} className="text-gray-600 ml-auto" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {items?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-lg mb-2">No items found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
