
import React from 'react';
import { useApp } from '../Store';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
}

export const MobileButton: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', icon: Icon, className = '', style, ...props 
}) => {
  const { theme } = useApp();

  let baseStyle: React.CSSProperties = {
    transition: 'all 0.2s ease',
  };

  // Changed font-display to font-sans for cleaner look and set font-bold
  let classes = `rounded-xl font-sans font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95 ${className} `;

  if (size === 'sm') classes += 'py-2 px-4 text-sm ';
  if (size === 'md') classes += 'py-3 px-6 text-base ';
  if (size === 'lg') classes += 'py-4 px-8 text-lg ';

  if (variant === 'primary') {
    baseStyle = { ...baseStyle, backgroundColor: theme.primary, color: '#fff' };
  } else if (variant === 'secondary') {
    baseStyle = { ...baseStyle, backgroundColor: theme.secondary, color: '#fff' };
  } else {
    baseStyle = { ...baseStyle, backgroundColor: 'transparent', border: `2px solid ${theme.primary}`, color: theme.text };
  }

  return (
    <button style={{...baseStyle, ...style}} className={classes} {...props}>
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ 
  children, className = '', onClick 
}) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${className} ${onClick ? 'active:bg-gray-50 cursor-pointer' : ''}`}
  >
    {children}
  </div>
);

export const Badge: React.FC<{ text: string, color?: string }> = ({ text, color }) => {
  const { theme } = useApp();
  return (
    <span 
      className="px-2 py-1 rounded-md text-xs font-bold text-white font-sans"
      style={{ backgroundColor: color || theme.secondary }}
    >
      {text}
    </span>
  );
};
