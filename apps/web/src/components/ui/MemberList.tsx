'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { MemberAvatar } from './MemberAvatar';
import { useStore } from '@/store/store';
import { Users, Crown, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface MemberListProps {
  className?: string;
  onRetryConnection?: (deviceId: string) => void;
}

export function MemberList({ className, onRetryConnection }: MemberListProps) {
  const members = useStore((s) => s.currentRoom?.members);
  
  const myInfo = useMemo(() => members?.find(m => m.isMe) || null, [members]);
  const otherMembers = useMemo(() => members?.filter(m => !m.isMe) || [], [members]);
  const allMembers = members || [];

  if (!myInfo) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Users className="w-4 h-4" />
        <span>{allMembers.length} member{allMembers.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-2">
        {/* Me first */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
          <MemberAvatar member={myInfo} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white truncate">
                {myInfo.displayName}
              </span>
              <span className="text-xs text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded">
                You
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{myInfo.deviceId}</p>
          </div>
        </div>

        {/* Other members */}
        {otherMembers.map((member) => (
          <div
            key={member.deviceId}
            className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-slate-800/30 transition-colors"
          >
            <MemberAvatar member={member} size="md" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-white truncate block text-sm sm:text-base">
                {member.displayName}
              </span>
              <p className="text-xs text-slate-500 truncate">{member.deviceId}</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full whitespace-nowrap',
                  member.status === 'online'
                    ? 'text-teal-400 bg-teal-400/10'
                    : member.status === 'connecting'
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-slate-400 bg-slate-400/10'
                )}
              >
                {member.status}
              </span>
              {/* Retry button for offline/connecting members */}
              {member.status !== 'online' && onRetryConnection && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRetryConnection(member.deviceId)}
                  className="p-1 sm:p-1.5 h-auto text-slate-400 hover:text-teal-400"
                  title="Retry connection"
                >
                  <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {otherMembers.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">
            Waiting for others to join...
          </p>
        )}
      </div>
    </div>
  );
}

export function MemberAvatarStack({ className }: { className?: string }) {
  const members = useStore((s) => s.currentRoom?.members);
  const displayMembers = useMemo(() => members?.slice(0, 4) || [], [members]);
  const remaining = (members?.length || 0) - 4;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {displayMembers.map((member) => (
        <MemberAvatar
          key={member.deviceId}
          member={member}
          size="sm"
          showStatus={false}
          className="rounded-full border border-slate-800 bg-slate-900 shadow-sm"
        />
      ))}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300 border border-slate-800 shadow-sm">
          +{remaining}
        </div>
      )}
    </div>
  );
}

