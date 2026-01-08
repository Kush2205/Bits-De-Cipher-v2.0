import type { ReactNode } from 'react';
import PrismaticBurst from './PixelSnowBackground';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05060a] text-white">
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <PrismaticBurst
          animationType="rotate3d"
          intensity={2}
          speed={0.5}
          distort={1.0}
          paused={false}
          offset={{ x: 0, y: 0 }}
          hoverDampness={0.25}
          rayCount={24}
          mixBlendMode="lighten"
          colors={['#10b981', '#84cc16', '#facc15']}
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-0 bg-black/30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        
        {/* ===== HERO SECTION (OUTSIDE CARD) ===== */}
        <div className="mb-10 mt-4 text-center">
          <div className="
              inline-flex items-center gap-2 rounded-full
              border border-green-400/40
              bg-green-500/10
              px-3 py-1
              text-[11px] font-semibold text-green-400
              shadow-[0_0_12px_rgba(16,185,129,0.35)]
            ">
              GFG Student Chapter • Live Contest
            </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-white">
            Bits De Cipher
          </h1>
        </div>

        {/* ===== AUTH CARD ===== */}
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_80px_-40px_rgba(0,0,0,0.9)]">
            
            {/* Inner border */}
            <div className="absolute inset-px rounded-[22px] border border-white/5" />

            {/* Glow blobs */}
            <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-[#10b981]/20 blur-3xl" />
            <div className="absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-[#facc15]/15 blur-3xl" />

            {/* Form content */}
            <div className="relative p-8">
              {children}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
