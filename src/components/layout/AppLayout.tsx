import type { ReactNode } from "react";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <div className="max-w-md mx-auto pb-20">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
