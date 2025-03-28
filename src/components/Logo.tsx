
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showAlpha?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '', showAlpha = false }) => {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-10',
    large: 'h-12'
  };

  return (
    <Link to="/" className={`flex items-center ${className}`}>
      {/* Logo content */}
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-bold text-[#ea384c] ${size === 'small' ? 'text-xl' : size === 'medium' ? 'text-2xl' : 'text-3xl'}`}>
            SURRENDERED
          </span>
          <span className={`font-light text-white ml-1 ${size === 'small' ? 'text-xl' : size === 'medium' ? 'text-2xl' : 'text-3xl'}`}>
            SINNER FITNESS
          </span>
        </div>
        
        {showAlpha && (
          <div className="flex items-center mt-0.5">
            <span className="text-xs text-gray-400">Premium fitness solutions</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default Logo;
