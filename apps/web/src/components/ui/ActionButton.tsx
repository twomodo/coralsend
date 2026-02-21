'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  variant?: 'default' | 'primary' | 'danger' | 'teal';
  className?: string;
  iconOnlyOnMobile?: boolean;
}

export function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  title,
  variant = 'default',
  className,
  iconOnlyOnMobile = true,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors border',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variant === 'default' && 'border-[var(--border-soft)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)]',
        variant === 'primary' && 'border-teal-400/30 text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400',
        variant === 'teal' && 'border-teal-500/30 text-teal-400 hover:bg-teal-500/10',
        variant === 'danger' && 'border-red-500/30 text-red-400 hover:bg-red-500/10',
        className
      )}
    >
      {icon}
      <span className={cn(iconOnlyOnMobile && 'hidden sm:inline')}>{label}</span>
    </button>
  );
}
