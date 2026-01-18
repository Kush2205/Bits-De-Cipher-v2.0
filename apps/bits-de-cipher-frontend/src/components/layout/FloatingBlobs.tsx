import { useMemo } from "react";

interface Blob {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  color: string;
  opacity: number;
}

interface FloatingBlobsProps {
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  className?: string;
}

const FloatingBlobs = ({
  count = 6,
  colors = ["#10b981", "#22c55e"],
  minSize = 200,
  maxSize = 400,
  className = "",
}: FloatingBlobsProps) => {
  const blobs = useMemo<Blob[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * (maxSize - minSize) + minSize,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 15, // 15-25s
      delay: Math.random() * -20,
      color: colors[i % colors.length],
      opacity: Math.random() * 0.15 + 0.1, // 0.1-0.25
    }));
  }, [count, colors, minSize, maxSize]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blob-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10"
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      {blobs.map((blob) => (
        <div
          key={blob.id}
          className="absolute rounded-full blur-3xl animate-blob"
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            backgroundColor: blob.color,
            opacity: blob.opacity,
            animationDuration: `${blob.duration}s`,
            animationDelay: `${blob.delay}s`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      <style>{`
        @keyframes blob {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: translate(-45%, -55%) scale(1.05) rotate(90deg);
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 40% 70% 50%;
            transform: translate(-55%, -45%) scale(0.95) rotate(180deg);
          }
          75% {
            border-radius: 40% 30% 60% 50% / 70% 50% 40% 60%;
            transform: translate(-50%, -50%) scale(1.02) rotate(270deg);
          }
        }

        .animate-blob {
          animation: blob linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FloatingBlobs;
