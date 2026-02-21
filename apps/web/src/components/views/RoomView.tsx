'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore, type FileMetadata } from '@/store/store';
import { getBaseUrl } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Button,
  MemberList,
  MemberAvatarStack,
  FileList,
  BottomSheet,
  PanelCard,
  ChatMessages,
  ChatInput,
  RoomSettings,
} from '@/components/ui';
import {
  Copy,
  Check,
  ArrowLeft,
  FileUp,
  Share2,
  Users,
  Inbox,
  Send,
  Settings,
  ClipboardPaste,
  MessageSquare,
  ChevronUp,
} from 'lucide-react';

interface RoomViewProps {
  onLeaveRoom: () => void;
  onShareFile: (file: File) => void;
  onRequestFile: (file: FileMetadata) => void;
  onCancelDownload?: (fileId: string) => void;
  onSendChat: (message: string) => void;
  onRetryConnection?: (deviceId: string) => void;
  onCopyTextFile?: (file: FileMetadata) => Promise<boolean>;
}

export function RoomView({ onLeaveRoom, onShareFile, onRequestFile, onCancelDownload, onSendChat, onRetryConnection, onCopyTextFile }: RoomViewProps) {
  const currentRoom = useStore((s) => s.currentRoom);
  const [showMembers, setShowMembers] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'outbox'>('inbox');
  const [isDragOver, setIsDragOver] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [isPasting, setIsPasting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shareUrl = currentRoom ? `${getBaseUrl()}/room/${currentRoom.id}` : '';

  // Paste from clipboard (keyboard or button): share all files without filtering
  const processPastedFiles = useCallback(
    (files: File[]) => {
      files.forEach((file) => onShareFile(file));
    },
    [onShareFile]
  );

  // Paste event (Ctrl+V / Cmd+V) – only when Outbox tab is active
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (activeTab !== 'outbox') return;
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const files: File[] = [];
      if (clipboardData.files?.length) {
        files.push(...Array.from(clipboardData.files));
      }
      if (files.length === 0) {
        const text = clipboardData.getData('text/plain');
        if (text?.trim()) {
          files.push(new File([text], 'pasted-text.txt', { type: 'text/plain' }));
        }
      }
      if (files.length === 0) return;
      e.preventDefault();
      processPastedFiles(files);
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [activeTab, processPastedFiles]);

  // Paste button: Async Clipboard API (for mobile / programmatic paste)
  const handlePasteClick = useCallback(async () => {
    if (typeof navigator?.clipboard?.read !== 'function') {
      setPasteError('Paste from clipboard is not supported in this browser');
      setTimeout(() => setPasteError(null), 3000);
      return;
    }
    setIsPasting(true);
    setPasteError(null);
    try {
      const items = await navigator.clipboard.read();
      const files: File[] = [];
      for (const item of items) {
        // Try every non-text MIME type as a file (images, videos, PDFs, etc.)
        let handledAsBlob = false;
        for (const mimeType of item.types) {
          if (mimeType === 'text/plain') continue;
          try {
            const blob = await item.getType(mimeType);
            const ext = mimeType.split('/')[1]?.split(';')[0] || 'bin';
            const name = `pasted-file.${ext}`;
            files.push(new File([blob], name, { type: mimeType }));
            handledAsBlob = true;
            break;
          } catch { /* type not available */ }
        }
        // Fallback to text if no blob type was handled
        if (!handledAsBlob && item.types?.includes('text/plain')) {
          try {
            const blob = await item.getType('text/plain');
            const text = await blob.text();
            if (text?.trim()) {
              files.push(new File([text], 'pasted-text.txt', { type: 'text/plain' }));
            }
          } catch { /* ignore */ }
        }
      }
      if (files.length > 0) {
        processPastedFiles(files);
      } else {
        setPasteError('Nothing to paste from clipboard');
        setTimeout(() => setPasteError(null), 3000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read clipboard';
      setPasteError(message);
      setTimeout(() => setPasteError(null), 3000);
    } finally {
      setIsPasting(false);
    }
  }, [processPastedFiles]);

  const canUsePasteButton = typeof navigator !== 'undefined' && typeof navigator.clipboard?.read === 'function';

  // Copy share link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => onShareFile(file));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      Array.from(files).forEach((file) => onShareFile(file));
    }
  };

  const roomFiles = currentRoom?.files ?? [];
  const roomMessages = currentRoom?.messages ?? [];
  const inboxCount = roomFiles.filter((f) => f.direction === 'inbox').length;
  const outboxCount = roomFiles.filter((f) => f.direction === 'outbox').length;
  const panelCount = activeTab === 'inbox' ? inboxCount : outboxCount;
  const lastMessage = roomMessages[roomMessages.length - 1];
  const unreadCount = showChat ? 0 : roomMessages.filter((m) => !m.isMe).length;

  if (!currentRoom) return null;

  return (
    <div className="h-dvh flex flex-col animate-in fade-in slide-in-from-right duration-300">
      {/* Header */}
      <header className="px-3 py-2.5 border-b border-[var(--border-soft)] glass-strong">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onLeaveRoom}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-[var(--text-primary)] text-sm">Room {currentRoom.id}</h1>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Users className="w-3 h-3" />
                <span>{currentRoom.members.length} members</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowMembers(true)}
              className="rounded-lg hover:opacity-85 transition-opacity"
              aria-label="Show members"
            >
              <MemberAvatarStack />
            </button>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowShare(true)}>
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 min-h-0 flex flex-col max-w-2xl mx-auto w-full">
        <div className="shrink-0 px-3 pt-2">
          <div className="flex gap-1 glass rounded-lg p-1 border border-[var(--border-soft)]">
            <button
              onClick={() => setActiveTab('inbox')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                activeTab === 'inbox'
                  ? 'bg-teal-500 text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              <Inbox className="w-4 h-4" />
              Inbox
              {inboxCount > 0 && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full transition-colors',
                    activeTab === 'inbox'
                      ? 'bg-white/20 text-white'
                      : 'bg-cyan-500/20 text-cyan-500 dark:text-cyan-300'
                  )}
                >
                  {inboxCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('outbox')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                activeTab === 'outbox'
                  ? 'bg-teal-500 text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              <Send className="w-4 h-4" />
              Outbox
              {outboxCount > 0 && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full transition-colors',
                    activeTab === 'outbox'
                      ? 'bg-white/20 text-white'
                      : 'bg-teal-500/20 text-teal-600 dark:text-teal-300'
                  )}
                >
                  {outboxCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 px-3 py-2">
          <PanelCard
            className="h-full"
            icon={
              activeTab === 'inbox'
                ? <Inbox className="w-5 h-5 text-cyan-400" />
                : <Send className="w-5 h-5 text-teal-400" />
            }
            title={activeTab === 'inbox' ? 'Inbox' : 'Outbox'}
            badge={
              <span className="text-sm text-[var(--text-muted)]">
                ({panelCount})
              </span>
            }
            actions={
              activeTab === 'outbox' ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-medium text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors px-2.5 py-1.5 rounded-md hover:bg-teal-400/10 border border-teal-400/20 min-h-8"
                    aria-label="Add file to share"
                    title="Add file to share"
                  >
                    <FileUp className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                  {canUsePasteButton && (
                    <button
                      type="button"
                      onClick={handlePasteClick}
                      disabled={isPasting}
                      className="flex items-center gap-1.5 text-xs font-medium text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors px-2.5 py-1.5 rounded-md hover:bg-teal-400/10 border border-teal-400/20 min-h-8 disabled:opacity-50"
                      aria-label="Paste from clipboard"
                      title="Paste from clipboard"
                    >
                      <ClipboardPaste className="w-4 h-4" />
                      <span>{isPasting ? 'Pasting…' : 'Paste'}</span>
                    </button>
                  )}
                </div>
              ) : undefined
            }
          >
            {pasteError && <p className="text-xs text-red-400 mb-2">{pasteError}</p>}
            <FileList
              direction={activeTab}
              onDownload={onRequestFile}
              onCancelDownload={onCancelDownload}
              onCopyTextFile={onCopyTextFile}
              hideHeader
              hideFilters
            />
          </PanelCard>
        </div>
      </div>

      {/* Chat ticker row */}
      <div className="shrink-0 max-w-2xl mx-auto w-full px-3 pb-2">
        <button
          onClick={() => setShowChat(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 glass border border-[var(--border-soft)] rounded-xl hover:bg-[var(--surface-glass-strong)] transition-colors shadow-sm"
        >
          <MessageSquare className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <span className="flex-1 text-left text-sm truncate text-[var(--text-primary)]">
            {lastMessage ? lastMessage.text : 'No messages yet'}
          </span>
          {unreadCount > 0 && (
            <span className="bg-teal-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
          <ChevronUp className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        </button>
      </div>

      {/* Members sheet */}
      <BottomSheet
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        title={
          <span className="flex items-center gap-2">
            <span>Members</span>
            <span className="text-sm font-normal text-[var(--text-muted)]">
              ({currentRoom.members.length})
            </span>
          </span>
        }
        icon={<Users className="w-4 h-4 text-[var(--text-muted)]" />}
      >
        <MemberList onRetryConnection={onRetryConnection} />
      </BottomSheet>

      {/* Chat sheet */}
      <BottomSheet
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        title="Chat"
        icon={<MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />}
        footer={<ChatInput onSend={onSendChat} />}
      >
        <ChatMessages messages={roomMessages} />
      </BottomSheet>

      {/* Share sheet */}
      <BottomSheet
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title="Share Room"
        icon={<Share2 className="w-4 h-4 text-[var(--text-muted)]" />}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG value={shareUrl} size={150} level="H" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">Room Code</p>
              <p className="text-2xl font-mono font-bold text-teal-400">{currentRoom.id}</p>
            </div>
            <Button variant="secondary" onClick={copyLink} className="w-full sm:w-auto">
              {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copySuccess ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Drop zone overlay */}
      {isDragOver && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center"
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <FileUp className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-[var(--text-primary)]">Drop files to share</p>
          </div>
        </div>
      )}

      {/* Room Settings Modal */}
      <RoomSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Global drag listener */}
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
      />
    </div>
  );
}
