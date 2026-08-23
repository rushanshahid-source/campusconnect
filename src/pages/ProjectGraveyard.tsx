import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ChevronLeft, TrendingUp, Users, GitBranch, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { PLACEHOLDER_IMAGE, onImageError } from "@/lib/imageFallback";
import AppLayout from "@/components/layout/AppLayout";

const categories = [
  { id: "all", label: "All Projects" },
  { id: "hardware", label: "Hardware" },
  { id: "software", label: "Software" },
  { id: "ai_ml", label: "AI/ML" },
  { id: "web_dev", label: "Web Dev" },
  { id: "mobile_app", label: "Mobile" },
  { id: "iot", label: "IoT" },
];

export default function ProjectGraveyard() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: projects } = trpc.projects.list.useQuery({
    category: activeCategory === "all" ? undefined : activeCategory,
    limit: 50,
  });

  const { data: stats } = trpc.projects.stats.useQuery();

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
            <h1 className="text-xl font-bold">Project Graveyard</h1>
            <p className="text-xs text-gray-500">Resurrect abandoned projects</p>
          </div>
        </div>

        {/* Hero Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1A1F2E] to-[#252B3D] rounded-2xl p-4 border border-white/5 mb-4"
        >
          <p className="text-sm text-gray-400">
            One student&apos;s abandoned code is another&apos;s treasure. Securely trade hardware, codebases, and academic assets through verified escrow.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1F2E] rounded-xl p-3 border border-white/5 text-center"
          >
            <GitBranch size={20} className="text-[#6366F1] mx-auto mb-1" />
            <p className="text-lg font-bold">{stats?.totalProjects || 0}+</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Resurrected Projects</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1A1F2E] rounded-xl p-3 border border-white/5 text-center"
          >
            <TrendingUp size={20} className="text-[#10B981] mx-auto mb-1" />
            <p className="text-lg font-bold">Rs. {stats?.totalVolume || "0"}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Escrow Volume</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1A1F2E] rounded-xl p-3 border border-white/5 text-center"
          >
            <Code2 size={20} className="text-[#F59E0B] mx-auto mb-1" />
            <p className="text-lg font-bold">320+</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Live Repo Access</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1A1F2E] rounded-xl p-3 border border-white/5 text-center"
          >
            <Users size={20} className="text-[#EC4899] mx-auto mb-1" />
            <p className="text-lg font-bold">50+</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Collaborators</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-[#6366F1] text-white"
                  : "bg-[#1A1F2E] text-gray-400 border border-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects List */}
        <div className="space-y-3">
          {projects?.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {}}
              className="bg-[#1A1F2E] rounded-2xl overflow-hidden border border-white/5"
            >
              <div className="relative h-40">
                <img
                  src={project.image || PLACEHOLDER_IMAGE}
                  onError={onImageError}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F2E] to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-[#6366F1]/80 text-white backdrop-blur-sm">
                    {project.category.replace("_", "/")}
                  </Badge>
                  <Badge className="bg-[#10B981]/80 text-white backdrop-blur-sm">
                    {project.completion}% Complete
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{project.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{project.description}</p>

                {project.techStack && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.techStack.split(",").map((tech) => (
                      <span key={tech} className="px-2 py-0.5 bg-[#252B3D] rounded text-[10px] text-gray-400">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {project.documentation && (
                  <Badge variant="outline" className="border-[#10B981]/30 text-[#10B981] text-[10px] mb-3">
                    <CheckIcon className="w-3 h-3 mr-1" /> Full Documentation
                  </Badge>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-lg font-bold text-[#10B981]">Rs. {project.price}</p>
                    {project.originalPrice && (
                      <p className="text-xs text-gray-500 line-through">
                        Rs. {project.originalPrice}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to buy flow
                    }}
                  >
                    Buy via Escrow
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {projects?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Code2 size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-lg mb-2">No projects found</p>
            <p className="text-sm">Check back later for new additions</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
