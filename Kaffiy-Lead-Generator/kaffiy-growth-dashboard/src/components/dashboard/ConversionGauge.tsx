import { useMemo } from 'react';

interface ConversionGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

export function ConversionGauge({ value, size = 80, strokeWidth = 8 }: ConversionGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const dashOffset = useMemo(() => {
    const clampedValue = Math.min(100, Math.max(0, value));
    return circumference - (clampedValue / 100) * circumference;
  }, [value, circumference]);

  return (
    <div className="gauge-container">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="gauge-bg"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="gauge-fill"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            filter: 'drop-shadow(0 0 6px hsl(var(--cyber-lime) / 0.5))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-foreground">{value}%</span>
      </div>
    </div>
  );
}
