
import React from 'react';
import { Link } from 'react-router-dom';

type LogoProps = {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'light';
};

const Logo: React.FC<LogoProps> = ({ size = 'medium', variant = 'default' }) => {
  const sizeClasses = {
    small: 'text-xl h-8',
    medium: 'text-2xl h-10',
    large: 'text-4xl h-16'
  };

  const colorClasses = variant === 'light' ? 'text-white' : 'text-sinner-red';

  return (
    <Link to="/" className="flex items-center">
      <span className={`font-bold ${colorClasses} ${sizeClasses[size]}`}>
        SS<span className="text-white">Fitness</span>
      </span>
    </Link>
  );
};

export default Logo;
