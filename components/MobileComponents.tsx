
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

  // Used font-display (Fredoka) for buttons to give a friendly app feel
  let classes = `rounded-2xl font-display font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95 ${className} `;

  if (size === 'sm') classes += 'py-2 px-4 text-sm ';
  if (size === 'md') classes += 'py-3.5 px-6 text-base ';
  if (size === 'lg') classes += 'py-4 px-8 text-lg ';

  if (variant === 'primary') {
    baseStyle = { ...baseStyle, backgroundColor: theme.primary, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
  } else if (variant === 'secondary') {
    baseStyle = { ...baseStyle, backgroundColor: theme.secondary, color: '#fff' };
  } else {
    baseStyle = { ...baseStyle, backgroundColor: 'transparent', border: `2px solid ${theme.primary}`, color: theme.text };
  }

  return (
    <button style={{...baseStyle, ...style}} className={classes} {...props}>
      {Icon && <Icon size={20} strokeWidth={2.5} />}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ 
  children, className = '', onClick 
}) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-5 ${className} ${onClick ? 'active:bg-slate-50 cursor-pointer transition-colors' : ''}`}
  >
    {children}
  </div>
);

export const Badge: React.FC<{ text: string, color?: string }> = ({ text, color }) => {
  const { theme } = useApp();
  return (
    <span 
      className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white font-display uppercase tracking-wide shadow-sm"
      style={{ backgroundColor: color || theme.secondary }}
    >
      {text}
    </span>
  );
};