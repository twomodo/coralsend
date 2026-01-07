'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'glow';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-slate-800/50 backdrop-blur-sm',
      elevated: 'bg-slate-800/80 backdrop-blur-md shadow-xl',
      bordered: 'bg-slate-800/50 backdrop-blur-sm border border-slate-700',
      glow: 'bg-slate-800/50 backdrop-blur-sm border border-teal-500/30 shadow-lg shadow-teal-500/10',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-6',
          variants[variant],
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

