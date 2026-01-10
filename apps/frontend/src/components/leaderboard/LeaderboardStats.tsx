interface LeaderboardStatsProps {
  rank?: number | null;
  points?: number;
  questionsSolved?: number;
}

export const LeaderboardStats = ({ rank, points = 0, questionsSolved = 0 }: LeaderboardStatsProps) => {
  const cards = [
    {
      label: 'Your Rank',
      value: rank ? `#${rank}` : '—',
      accent: 'text-emerald-400',
    },
    {
      label: 'Total Points',
      value: points.toLocaleString(),
      accent: 'text-white',
    },
    {
      label: 'Questions Solved',
      value: questionsSolved.toLocaleString(),
      accent: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-gray-800 bg-[#0b0b0b] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{card.label}</p>
          <p className={`mt-2 text-3xl font-semibold ${card.accent}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};
