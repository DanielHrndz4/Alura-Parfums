import React from 'react';
import { WhenToWearItem } from '../../types/perfume';
import { getFragranticaSeasonColor } from '../../services/geminiService';

interface WhenToWearCardProps {
  items?: WhenToWearItem[];
  className?: string;
  variant?: 'dark' | 'light';
}

export const WhenToWearCard: React.FC<WhenToWearCardProps> = ({
  items = [],
  className = '',
  variant = 'dark',
}) => {
  if (!items || items.length === 0) return null;

  // Render authentic icons for each category
  const renderIcon = (id: string) => {
    const s = id.toLowerCase();
    if (s.includes('inviern') || s.includes('winter')) {
      // Snowflake
      return (
        <svg className="w-7 h-7 text-[#9CA3AF] group-hover:text-[#5AC8FA] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
          <polyline points="10 4 12 2 14 4" />
          <polyline points="10 20 12 22 14 20" />
          <polyline points="4 10 2 12 4 14" />
          <polyline points="20 10 22 12 20 14" />
        </svg>
      );
    }
    if (s.includes('primaver') || s.includes('spring')) {
      // Spring Leaf
      return (
        <svg className="w-7 h-7 text-[#9CA3AF] group-hover:text-[#98E266] transition-colors" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A9.49 9.49 0 0 0 11 18c6.07 0 10-4.14 10-10V3h-5c-4.97 0-9 4.03-9 9 0 .34.02.67.06 1A14.9 14.9 0 0 1 17 8z" />
        </svg>
      );
    }
    if (s.includes('veran') || s.includes('summer')) {
      // Beach Umbrella
      return (
        <svg className="w-7 h-7 text-[#9CA3AF] group-hover:text-[#F87171] transition-colors" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12h9v7a1.5 1.5 0 0 0 3 0v-7h8c0-5.52-4.48-10-10-10zm-1 3.16c-2.82.47-5 2.65-5.65 5.34C6.8 9.53 8.7 8.32 11 7.74V5.16zm2 0v2.58c2.3.58 4.2 1.79 5.65 2.76-.65-2.69-2.83-4.87-5.65-5.34z" />
        </svg>
      );
    }
    if (s.includes('otoñ') || s.includes('oton') || s.includes('autumn') || s.includes('fall')) {
      // Autumn Maple Leaf
      return (
        <svg className="w-7 h-7 text-[#9CA3AF] group-hover:text-[#F6BA62] transition-colors" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.5 13.5L19 11l.5-2-3 1-1.5-2.5-1.5 1.5V6l-1.5-3-1.5 3v3L9 7.5 7.5 10l-3-1 .5 2-2.5 2.5 2.5 1.5-1 2.5 3 .5 1 3 2.5-1.5L11 22h2l-.5-3 2.5 1.5 1-3 3-.5-1-2.5 2.5-1.5z" />
        </svg>
      );
    }
    if (s.includes('día') || s.includes('dia') || s.includes('day')) {
      // Radiant Sun
      return (
        <svg className="w-7 h-7 text-[#9CA3AF] group-hover:text-[#F59E0B] transition-colors" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
        </svg>
      );
    }
    // Night Moon with stars
    return (
      <svg className="w-7 h-7 text-[#9CA3AF] group-hover:text-[#85B6D4] transition-colors" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.3 2a10 10 0 0 0-.19 14 10 10 0 0 0 11.89 2.5A10.02 10.02 0 0 1 12.3 2z" />
        <circle cx="19" cy="5" r="1" />
        <circle cx="21" cy="9" r="0.75" />
      </svg>
    );
  };

  const isDark = variant === 'dark';

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 transition-all shadow-md ${
        isDark
          ? 'bg-[#181A20] border border-[#2D3139]'
          : 'bg-[#FAF8F5] border border-[#E6DED1]'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          {/* Yellow Clock Icon */}
          <span className="w-5 h-5 rounded-full border-[1.8px] border-[#F59E0B] flex items-center justify-center text-[#F59E0B]">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6l4 2" />
            </svg>
          </span>
          <h4
            className={`text-xs font-bold uppercase tracking-[0.16em] ${
              isDark ? 'text-gray-100' : 'text-[#775a00]'
            }`}
          >
            Cuándo Usarlo
          </h4>
        </div>
        <span className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wider hidden sm:inline-block">
          Votación Fragrantica
        </span>
      </div>

      {/* 6 Categories Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 pt-4">
        {items.map((item) => {
          const color = item.color || getFragranticaSeasonColor(item.id);
          const pct = Math.max(8, Math.min(100, item.percentage));
          const displayVote = item.votes || `${item.percentage}%`;

          return (
            <div
              key={item.id}
              className="flex flex-col items-center text-center group cursor-default"
            >
              {/* Icon */}
              <div className="h-8 flex items-center justify-center mb-1 transition-transform group-hover:scale-110">
                {renderIcon(item.id)}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-medium capitalize mb-2 line-clamp-1 ${
                  isDark ? 'text-gray-200' : 'text-[#2C2826]'
                }`}
              >
                {item.name}
              </span>

              {/* Progress bar pill */}
              <div
                className={`w-full h-2 rounded-full overflow-hidden p-[1px] ${
                  isDark ? 'bg-[#2E333D]' : 'bg-[#E0D7C6]'
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>

              {/* Votes count */}
              <span
                className="text-[11px] font-bold font-mono mt-1.5 tracking-tight transition-transform group-hover:scale-105"
                style={{ color }}
              >
                {displayVote}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
