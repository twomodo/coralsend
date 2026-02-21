'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { logger, type LogEntry, type LogCategory } from '@/lib/logger';
import { useStore } from '@/store/store';
import { cn } from '@/lib/utils';
import { Terminal, X, Trash2, ChevronDown } from 'lucide-react';

const CATEGORY_COLORS: Record<LogCategory, string> = {
  ICE: 'text-cyan-400',
  Transfer: 'text-teal-400',
  Signaling: 'text-violet-400',
  DataChannel: 'text-amber-400',
  General: 'text-slate-400',
};

const LEVEL_COLORS: Record<string, string> = {
  debug: 'text-slate-500',
  info: 'text-slate-300',
  warn: 'text-yellow-400',
  error: 'text-red-400',
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogCategory | 'all'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const members = useStore((s) => s.currentRoom?.members);
  const debugEnabled = useStore((s) => s.debugEnabled);
  const setDebugEnabled = useStore((s) => s.setDebugEnabled);

  useEffect(() => {
    setEntries(logger.getEntries());
    return logger.subscribe(() => setEntries(logger.getEntries()));
  }, []);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, open]);

  // Keyboard shortcut: Ctrl+Shift+D (also enables debug if disabled)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (!debugEnabled) setDebugEnabled(true);
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [debugEnabled, setDebugEnabled]);

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.category === filter);

  const toggleOpen = useCallback(() => setOpen((v) => !v), []);

  // Only render when debug is enabled via Settings
  if (!debugEnabled) return null;

  if (!open) {
    return (
      <button
        onClick={toggleOpen}
        className="fixed bottom-14 left-3 z-40 p-2 rounded-full glass border border-[var(--border-soft)] text-[var(--text-muted)] hover:text-teal-400 transition-colors"
        title="Debug panel (Ctrl+Shift+D)"
      >
        <Terminal className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 max-h-[50vh] flex flex-col glass-strong border-t border-[var(--border-soft)] text-xs font-mono">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border-soft)] shrink-0">
        <Terminal className="w-3.5 h-3.5 text-teal-400" />
        <span className="font-semibold text-[var(--text-primary)]">Debug</span>

        {/* Connection paths */}
        {members?.filter(m => !m.isMe && m.connectionPath).map(m => (
          <span key={m.deviceId} className={cn('text-[10px] px-1.5 py-0.5 rounded', m.connectionPath === 'direct' ? 'text-teal-400 bg-teal-400/10' : 'text-amber-400 bg-amber-400/10')}>
            {m.displayName}: {m.connectionPath}
          </span>
        ))}

        <div className="flex-1" />

        {/* Category filter */}
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as LogCategory | 'all')}
            className="bg-transparent text-[var(--text-muted)] text-[10px] border border-[var(--border-soft)] rounded px-1.5 py-0.5 appearance-none pr-4 cursor-pointer"
          >
            <option value="all">All</option>
            <option value="ICE">ICE</option>
            <option value="Transfer">Transfer</option>
            <option value="Signaling">Signaling</option>
            <option value="DataChannel">DataChannel</option>
            <option value="General">General</option>
          </select>
          <ChevronDown className="w-2.5 h-2.5 absolute right-0.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>

        <button onClick={() => logger.clear()} className="text-[var(--text-muted)] hover:text-red-400" title="Clear logs">
          <Trash2 className="w-3 h-3" />
        </button>
        <button onClick={toggleOpen} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" title="Close (Ctrl+Shift+D)">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Log entries */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-1 space-y-px">
        {filtered.length === 0 && (
          <p className="text-[var(--text-muted)] py-4 text-center">No log entries</p>
        )}
        {filtered.map((entry, i) => (
          <div key={i} className="flex gap-2 leading-relaxed">
            <span className="text-[var(--text-muted)] shrink-0">{formatTime(entry.timestamp)}</span>
            <span className={cn('shrink-0 w-12', LEVEL_COLORS[entry.level])}>{entry.level.toUpperCase()}</span>
            <span className={cn('shrink-0 w-20', CATEGORY_COLORS[entry.category])}>{entry.category}</span>
            <span className="text-[var(--text-primary)]">{entry.message}</span>
            {entry.detail && <span className="text-[var(--text-muted)]">{entry.detail}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
