'use client';

import { cn, formatFileSize, getFileIcon } from '@/lib/utils';
import { Progress } from './Progress';
import { CheckCircle, AlertCircle, X, FileIcon } from 'lucide-react';
import type { FileTransfer } from '@/store/store';

interface FileCardProps {
  file: FileTransfer;
  onRemove?: () => void;
  className?: string;
}

export function FileCard({ file, onRemove, className }: FileCardProps) {
  const statusColors = {
    pending: 'border-slate-600',
    transferring: 'border-cyan-500/50',
    completed: 'border-teal-500/50',
    error: 'border-red-500/50',
  };

  const statusIcons = {
    pending: null,
    transferring: null,
    completed: <CheckCircle className="w-5 h-5 text-teal-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
  };

  return (
    <div
      className={cn(
        'bg-slate-800/60 rounded-xl p-4 border transition-colors',
        statusColors[file.status],
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* File icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center text-2xl">
          {getFileIcon(file.type)}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-white truncate flex-1">{file.name}</h4>
            {statusIcons[file.status]}
            {onRemove && file.status !== 'transferring' && (
              <button
                onClick={onRemove}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
          
          <p className="text-sm text-slate-400 mt-0.5">
            {formatFileSize(file.size)}
            <span className="mx-2">•</span>
            <span className="capitalize">
              {file.direction === 'send' ? 'Sending' : 'Receiving'}
            </span>
          </p>

          {/* Progress bar for active transfers */}
          {(file.status === 'transferring' || file.status === 'pending') && (
            <div className="mt-3">
              <Progress value={file.progress} size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

