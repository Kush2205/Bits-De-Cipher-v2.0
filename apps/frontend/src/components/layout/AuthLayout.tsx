import type { ReactNode } from "react";
import PrismaticBurst from "./PixelSnowBackground";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05060a] text-white">

    
      {/* ===== Animated Background ===== */}
      <div className="absolute inset-0 z-0">
        <PrismaticBurst
          animationType="rotate3d"
          intensity={1.5}
          speed={0.4}
          distort={0.8}
          paused={false}
          offset={{ x: 0, y: 0 }}
          hoverDampness={0.25}
          rayCount={18}
          mixBlendMode="lighten"
          colors={["#10b981", "#22c55e"]}
        />
      </div>

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* Subtle center glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.25),transparent_60%)]" />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs text-emerald-400">
            GFG Student Chapter · Live Contest
          </div>

          <h1 className="mt-4 text-5xl font-extrabold tracking-tight">
            Bits De{" "}
            <span className="text-emerald-400">Cipher</span>
          </h1>
        </div>

        {/* Card */}
        <div className="w-full max-w-md relative">
          
          {/* Glow behind card */}
          <div className="absolute -inset-8 bg-emerald-500/20 blur-3xl rounded-full" />

          <div className="relative rounded-2xl border border-white/10 bg-[#0d1117]/80 backdrop-blur-xl shadow-2xl p-8">
            {children}
          </div>

        </div>

      </div>
    </div>
  );
};
