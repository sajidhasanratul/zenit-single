import React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  suffix?: string;
  displayValue?: string;
}

export function Slider({
  className,
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  suffix = '',
  displayValue,
  ...props
}: SliderProps) {
  return (
    <div className={cn("space-y-2 w-full", className)}>
      <div className="flex justify-between items-center text-sm font-display">
        {label && <span className="text-textMuted font-medium">{label}</span>}
        <span className="text-accentCyan font-bold font-sans">
          {displayValue !== undefined ? displayValue : `${value.toLocaleString()}${suffix}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-borderSlate rounded-lg appearance-none cursor-pointer accent-accentCyan focus:outline-none"
        {...props}
      />
    </div>
  );
}
