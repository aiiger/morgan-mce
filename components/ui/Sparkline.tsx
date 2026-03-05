import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: Array<{ value: number }>;
  color?: string;
  height?: number;
  animationDuration?: number;
  trend?: 'up' | 'down' | 'flat';
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = 'var(--color-success)',
  height = 32,
  animationDuration = 1200,
  trend = 'up'
}) => {
  // Determine opacity and stroke based on trend
  const strokeOpacity = trend === 'down' ? 0.4 : 0.8;
  const fillOpacity = trend === 'down' ? 0.1 : 0.25;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={fillOpacity} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color})`}
            fillOpacity={1}
            isAnimationActive={true}
            animationDuration={animationDuration}
            animationEasing="ease-in-out"
            strokeOpacity={strokeOpacity}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
