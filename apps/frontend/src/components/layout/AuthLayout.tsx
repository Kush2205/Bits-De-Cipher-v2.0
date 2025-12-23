import type { ReactNode } from 'react';
import PrismaticBurst from './PixelSnowBackground';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#05060a] text-white">
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

      <div className="absolute inset-0 z-0 bg-black/20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_80px_-40px_rgba(0,0,0,0.9)]">
          <div className="absolute inset-px rounded-[22px] border border-white/5" />
          
          
          <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-[#10b981]/20 blur-3xl" />
          <div className="absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-[#facc15]/15 blur-3xl" />

          <div className="relative p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};