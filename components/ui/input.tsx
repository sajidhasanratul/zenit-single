import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex w-full rounded-lg border border-borderSlate bg-background/60 px-4 py-2.5 text-textWhite font-sans placeholder:text-textMuted/60 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan/30 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex w-full rounded-lg border border-borderSlate bg-background/60 px-4 py-2.5 text-textWhite font-sans placeholder:text-textMuted/60 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan/30 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
