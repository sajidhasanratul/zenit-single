import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'green' | 'slate' | 'outline' | 'glass';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'cyan', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-display font-bold border border-borderSlate px-5 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accentCyan/50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-accentCyan text-background hover:bg-accentCyan/90 shadow-neoCyan": variant === 'cyan',
            "bg-accentGreen text-background hover:bg-accentGreen/90 shadow-neoGreen": variant === 'green',
            "bg-cardBg text-textWhite hover:bg-borderSlate shadow-neoSlate": variant === 'slate',
            "bg-transparent text-textWhite hover:bg-cardBg/40 border border-textWhite shadow-neoWhite": variant === 'outline',
            "bg-cardBg/60 backdrop-blur-md text-textWhite hover:text-accentCyan hover:border-accentCyan/40": variant === 'glass',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
