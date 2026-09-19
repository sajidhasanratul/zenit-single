import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'cyan' | 'green' | 'slate' | 'none';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = 'none', interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-cardBg/70 backdrop-blur-md border border-borderSlate rounded-xl p-6 transition-all duration-300",
          {
            "shadow-neoSlate": glow === 'slate',
            "shadow-neoCyan": glow === 'cyan',
            "shadow-neoGreen": glow === 'green',
            "hover:-translate-x-[2px] hover:-translate-y-[2px] hover:border-accentCyan/30": interactive && glow === 'none',
            "hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-neoCyan hover:border-accentCyan/40": interactive && glow === 'cyan',
            "hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-neoGreen hover:border-accentGreen/40": interactive && glow === 'green',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
