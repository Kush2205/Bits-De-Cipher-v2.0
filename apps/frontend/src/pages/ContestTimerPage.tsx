import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gfglogo from "../../public/logo.png"
import { Instagram } from 'lucide-react';
const TARGET_DATE = "2026-01-16T21:00:00+05:30";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ContestTimerPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isStarted, setIsStarted] = useState(false);

  const calculateTimeLeft = () => {
    const difference = +new Date(TARGET_DATE) - +new Date();
    
    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
      setIsStarted(false);
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setIsStarted(true);
    }
  };

  useEffect(() => {
    calculateTimeLeft();
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimerBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative bg-[#0d0e12] border border-white/10 rounded-2xl p-4 w-20 sm:w-28 h-24 sm:h-32 flex items-center justify-center overflow-hidden shadow-xl shadow-emerald-900/10 group">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-emerald-500/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000"></div>
        <span className="text-3xl sm:text-5xl font-black text-emerald-400 font-mono">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
        {label}
      </span>
    </div>
  );

  const Separator = () => (
    <div className="hidden sm:flex flex-col justify-start h-32 pt-8">
        <span className="text-4xl text-white/20 font-black animate-pulse">:</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05060a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
       {/* Ambient Background Glows */}
       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none"></div>
       <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="relative z-10 bg-[#0d0e12]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-2xl max-w-4xl w-full overflow-hidden">
        
        {/* Border Animation */}
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
             <div className="absolute -inset-full bg-linear-to-r from-transparent via-emerald-500/10 to-transparent animate-[spin_6s_linear_infinite]"></div>
        </div>

        {/* --- BRANDING HEADER --- */}
        <div className="relative mb-10 flex flex-col items-center">
            {/* GFG Student Chapter Badge */}
            <div className="mb-6 px-4 py-1.5 rounded-full">
                {/* <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-emerald-500/80">
                    GFG Student Chapter
                </p> */}
                <img src={gfglogo} alt="GFG Student Chapter" className="h-25 w-25" />
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter uppercase">
                    Bits <span className="text-emerald-400">De</span> Cipher
                </h1>
            </div>
            <div className="h-px w-full max-w-50 mx-auto bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
        </div>

        {!isStarted ? (
          <div className="relative animate-in fade-in duration-700">
            <h2 className="text-gray-400 uppercase tracking-[0.3em] text-[10px] sm:text-xs font-black mb-10 flex items-center justify-center gap-3">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Contest Starting In
            </h2>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <TimerBlock value={timeLeft.days} label="Days" />
              <Separator />
              <TimerBlock value={timeLeft.hours} label="Hours" />
              <Separator />
              <TimerBlock value={timeLeft.minutes} label="Minutes" />
              <Separator />
              <TimerBlock value={timeLeft.seconds} label="Seconds" />
            </div>

            <p className="text-zinc-400 sm:text-xs mt-12 font-mono uppercase tracking-widest font-bold">
                Beyond this timer lies the truth. Are you prepared to de-cipher it?
            </p>
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-300">
                  for more insider updates on contest follow
                </span>
              </div>

              <a 
                href="https://www.instagram.com/gfg_rgipt/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-500/40"
              >
                <Instagram size={20} className="text-emerald-400" />
                <span className="text-[12px] font-bold text-gray-300 group-hover:text-white tracking-tight">
                  @gfg_rgipt
                </span>
                <svg 
                  className="w-3 h-3 text-emerald-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        ) : (
          <div className="relative animate-in zoom-in duration-500 py-8">
             <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 -mt-10 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                 <svg className="w-10 h-10 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
             </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight uppercase">
              Systems Online
            </h2>
            <p className="text-gray-400 text-sm sm:text-lg mb-10 font-mono">
              The contest has begun.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 p-0.5 font-bold text-white shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all duration-300"
            >
              <span className="relative rounded-2xl bg-[#0d0e12] bg-opacity-90 px-12 py-5 transition-all duration-300 group-hover:bg-opacity-0 group-hover:text-white">
                <span className="relative flex items-center gap-3 uppercase tracking-[0.2em] text-sm">
                    Enter Contest
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
              </span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>
    </div>
  );
};

export default ContestTimerPage;