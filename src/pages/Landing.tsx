import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, QrCode, Users, Zap, ArrowRight, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const slides = [
  {
    icon: Shield,
    title: "Secure Escrow",
    description: "Payments are held safely until you confirm pickup. No more ghosting, no more scams.",
    color: "#10B981",
  },
  {
    icon: QrCode,
    title: "Instant QR Handover",
    description: "Scan a QR code at the meetup point to instantly verify and complete transactions.",
    color: "#6366F1",
  },
  {
    icon: Users,
    title: "Verified Community",
    description: "Only verified students with institutional emails can join. Trust starts here.",
    color: "#F59E0B",
  },
  {
    icon: Zap,
    title: "Save Money",
    description: "Split subscriptions, rent gear, buy notes. Your campus economy starts here.",
    color: "#EC4899",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(true);
    setTimeout(() => {
      navigate("/register", { state: { email } });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex flex-col">
      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col items-center justify-center px-6 pt-12"
      >
        {/* Animated Logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6366F1] to-[#10B981] p-[2px] mb-6"
        >
          <div className="w-full h-full rounded-full bg-[#0B0F1A] flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap size={36} className="text-[#6366F1]" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-[#10B981] bg-clip-text text-transparent mb-3"
        >
          Campus Connect
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-center text-sm max-w-xs"
        >
          The exclusive peer-to-peer marketplace for your university community.
        </motion.p>
      </motion.div>

      {/* Carousel Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-6 mb-8"
      >
        <p className="text-xs text-gray-500 text-center mb-4 uppercase tracking-wider">How it works</p>
        
        <div className="relative h-48 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-[#1A1F2E] rounded-2xl p-5 border border-white/5"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${slides[currentSlide].color}15` }}
              >
                {(() => {
                  const Icon = slides[currentSlide].icon;
                  return <Icon size={24} style={{ color: slides[currentSlide].color }} />;
                })()}
              </div>
              <h3 className="text-lg font-semibold mb-1">{slides[currentSlide].title}</h3>
              <p className="text-gray-400 text-sm">{slides[currentSlide].description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-6 bg-[#6366F1]" : "w-2 bg-gray-600"
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="px-6 pb-8"
      >
        <form onSubmit={handleMagicLink} className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Institutional Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <Input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-[#1A1F2E] border-white/10 text-white placeholder:text-gray-600 h-12"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <CheckCircle size={14} className="text-[#10B981]" />
              <span className="text-xs text-gray-500">Only verified campus emails allowed.</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#5558E0] hover:to-[#4338CA] text-white font-medium rounded-xl"
          >
            {emailSent ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                <CheckCircle size={18} /> Redirecting...
              </motion.span>
            ) : (
              <span className="flex items-center gap-2">
                Get Magic Link <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <span className="text-[#6366F1] cursor-pointer hover:underline">Terms of Service</span>
          </p>
        </div>

        {/* Alternative Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0B0F1A] px-3 text-gray-500">OR JOIN WITH</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="h-11 bg-[#1A1F2E] border-white/10 text-white hover:bg-[#252B3D]"
            >
              <Users size={16} className="mr-2" /> Sign In
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/register")}
              className="h-11 bg-[#1A1F2E] border-white/10 text-white hover:bg-[#252B3D]"
            >
              <QrCode size={16} className="mr-2" /> Sign Up
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
