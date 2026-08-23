import { useNavigate, useLocation, Link } from "react-router";
import { motion } from "framer-motion";
import { Mail, Lock, User, GraduationCap, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? "";
  const utils = trpc.useUtils();
  const { isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");

  const register = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/dashboard");
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({
      name,
      email,
      password,
      university: university || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366F1] to-[#10B981] p-[2px] mb-4">
            <div className="w-full h-full rounded-full bg-[#0B0F1A] flex items-center justify-center">
              <Shield size={28} className="text-[#10B981]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-gray-400 mt-1">Join your campus community</p>
        </div>

        {/* Register Card */}
        <div className="bg-[#1A1F2E] rounded-2xl p-6 border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <Input
                required
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12 bg-[#0B0F1A] border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <Input
                type="email"
                required
                autoComplete="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-[#0B0F1A] border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-[#0B0F1A] border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            <div className="relative">
              <GraduationCap
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <Input
                placeholder="University (optional)"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="pl-10 h-12 bg-[#0B0F1A] border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            {register.error && (
              <p className="text-sm text-red-400">{register.error.message}</p>
            )}

            <Button
              type="submit"
              disabled={register.isPending}
              className="w-full h-12 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#0EA372] hover:to-[#047857] text-white font-medium rounded-xl disabled:opacity-60"
            >
              {register.isPending ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-[#6366F1] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 text-sm text-[#6366F1] hover:underline"
        >
          Back to home
        </button>
      </motion.div>
    </div>
  );
}
