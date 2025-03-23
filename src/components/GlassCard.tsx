
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  variant?: 'default' | 'dark';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  variant = 'default'
}) => {
  return (
    <div
      className={cn(
        variant === 'default' ? 'glass' : 'glass-dark',
        'rounded-lg p-6',
        hoverEffect && 'transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
