
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  variant?: 'default' | 'dark';
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  variant = 'default',
  icon,
  title,
  description
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
      {icon && <div className="mb-4">{icon}</div>}
      {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
      {description && <p className="text-white/80">{description}</p>}
      {children}
    </div>
  );
};

export default GlassCard;
