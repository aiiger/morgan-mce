import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { Sparkline } from './Sparkline';

interface FinancialMetricCardProps {
  label: string;
  value: number;
  trend?: {
    value: number;
    type: 'up' | 'down' | 'flat';
  };
  sparklineData?: Array<{ value: number }>;
  gradientFrom?: string;
  gradientTo?: string;
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  format?: 'currency' | 'number' | 'percentage';
}

export const FinancialMetricCard: React.FC<FinancialMetricCardProps> = ({
  label,
  value,
  trend,
  sparklineData,
  gradientFrom = 'from-blue-500',
  gradientTo = 'to-blue-600',
  icon,
  prefix = '',
  suffix = '',
  format = 'currency'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border border-gray-200 group cursor-pointer`}
      style={{
        background: `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        y: -4,
        boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)'
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient Background Accent */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
        style={{
          background: `radial-gradient(circle at ${isHovered ? '50% 50%' : '0% 0%'}, rgba(59, 130, 246, 0.2), transparent 70%)`,
          transition: 'all 0.3s ease'
        }}
      />

      {/* Top Row - Label + Icon */}
      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon && (
            <motion.div
              className="p-2 rounded-lg bg-gray-50"
              animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.div>
          )}
          <span className="text-sm font-bold italic text-gray-500 group-hover:text-gray-700 transition-colors">
            {label}
          </span>
        </div>

        {trend && (
          <motion.div
            className={`flex items-center gap-1 text-xs font-bold italic ${
              trend.type === 'up'
                ? 'text-emerald-400'
                : trend.type === 'down'
                ? 'text-rose-400'
                : 'text-gray-500'
            }`}
            animate={isHovered ? { x: 2 } : { x: 0 }}
          >
            {trend.type === 'up' && <TrendingUp size={14} />}
            {trend.type === 'down' && <TrendingDown size={14} />}
            <span>{trend.value}%</span>
          </motion.div>
        )}
      </div>

      {/* Main Value */}
      <motion.div
        className="relative z-10 mb-4"
        animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-baseline gap-2">
          {prefix && <span className="text-lg text-gray-500">{prefix}</span>}
          <span className="text-4xl font-bold italic text-gray-900 tracking-tight">
            <AnimatedCounter
              value={value}
              format={format}
              decimals={format === 'currency' ? 1 : 2}
            />
          </span>
          {suffix && <span className="text-lg text-gray-500">{suffix}</span>}
        </div>
      </motion.div>

      {/* Sparkline Chart */}
      {sparklineData && sparklineData.length > 0 && (
        <motion.div
          className="relative z-10 h-12 mb-4 -mx-2"
          animate={isHovered ? { opacity: 1 } : { opacity: 0.7 }}
          transition={{ duration: 0.3 }}
        >
          <Sparkline data={sparklineData} color="rgba(59, 130, 246, 0.6)" />
        </motion.div>
      )}

      {/* Bottom Row - Additional Info */}
      <motion.div
        className="relative z-10 text-xs text-gray-500 group-hover:text-gray-500 transition-colors"
        animate={isHovered ? { opacity: 1 } : { opacity: 0.7 }}
      >
        <div className="flex justify-between items-center">
          <span>Last 30 days</span>
          <span className="text-emerald-400 font-bold italic">↑ On Track</span>
        </div>
      </motion.div>

      {/* Glow Effect Border */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, transparent 0%, rgba(59, 130, 246, 0.1) 100%)`,
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};
