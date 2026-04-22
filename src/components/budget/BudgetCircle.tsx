import { formatARS } from "@/lib/utils";

interface BudgetCircleProps {
  percentage: number;    // 0-100
  spentCentavos: number;
  budgetCentavos: number;
  leftCentavos: number;
}

export function BudgetCircle({
  percentage,
  spentCentavos,
  budgetCentavos,
  leftCentavos,
}: BudgetCircleProps) {
  const radius = 88;
  const stroke = 14;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference * (1 - Math.min(percentage, 100) / 100);

  return (
    <div className="card-purple-gradient rounded-3xl p-6 text-white">
      {/* Circular progress */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg width={radius * 2} height={radius * 2} style={{ transform: "rotate(-90deg)" }}>
            {/* Background track */}
            <circle
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={stroke}
            />
            {/* Progress arc */}
            <circle
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              fill="none"
              stroke="#AEEA00"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black tracking-tighter leading-none">
              {Math.round(percentage)}%
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/60 mt-1">
              Used this month
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center divide-x divide-white/20">
        <div className="flex-1 text-center">
          <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-1">Spent</p>
          <p className="text-base font-black tabular-nums text-red-300">{formatARS(spentCentavos)}</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-1">Budget</p>
          <p className="text-base font-black tabular-nums">{formatARS(budgetCentavos)}</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-1">Left</p>
          <p className="text-base font-black tabular-nums text-lime">{formatARS(leftCentavos)}</p>
        </div>
      </div>
    </div>
  );
}
