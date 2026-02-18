'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateRoomButtonProps {
  onClick: () => void;
  className?: string;
}

export function CreateRoomButton({ onClick, className }: CreateRoomButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full group relative bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-teal-400/50 hover:from-teal-500/20 hover:to-cyan-500/20 transition-all',
        className
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform">
          <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div className="text-left">
          <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">Create Room</h3>
          <p className="text-[var(--text-muted)] text-xs sm:text-sm">Start a new sharing session</p>
        </div>
      </div>
    </button>
  );
}
