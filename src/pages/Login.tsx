import { useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { Mail, Lock, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.auth.login.useMutation({
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
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366F1] to-[#10B981] p-[2px] mb-4"
          >
            <div className="w-full h-full rounded-full bg-[#0B0F1A] flex items-center justify-center">
              <Shield size={28} className="text-[#6366F1]" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1A1F2E] rounded-2xl p-6 border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-[#0B0F1A] border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            {login.error && (
              <p className="text-sm text-red-400">{login.error.message}</p>
            )}

            <Button
              type="submit"
              disabled={login.isPending}
              className="w-full h-12 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#5558E0] hover:to-[#4338CA] text-white font-medium rounded-xl disabled:opacity-60"
            >
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-[#6366F1] hover:underline">
                Create one
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
