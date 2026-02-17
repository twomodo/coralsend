'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore, type FileMetadata } from '@/store/store';
import { getBaseUrl } from '@/lib/constants';
import {
  Button,
  Card,
  MemberList,
  MemberAvatarStack,
  FileList,
  Chat,
  RoomSettings,
} from '@/components/ui';
import {
  Plus,
  Copy,
  Check,
  X,
  ArrowLeft,
  FileUp,
  Share2,
  Users,
  Inbox,
  Send,
  Settings,
  ClipboardPaste,
} from 'lucide-react';

// Paste type filter: match file type (same categories as FileList)
const PASTE_ACCEPT_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'text', label: 'Text', match: (t: string) => t.startsWith('text/') },
  { id: 'image', label: 'Images', match: (t: string) => t.startsWith('image/') },
  { id: 'video', label: 'Videos', match: (t: string) => t.startsWith('video/') },
  { id: 'audio', label: 'Audio', match: (t: string) => t.startsWith('audio/') },
] as const;

function acceptFileByFilter(file: File, filterId: string): boolean {
  if (filterId === 'all') return true;
  const category = PASTE_ACCEPT_TYPES.find((c) => c.id === filterId);
  return category && 'match' in category ? category.match(file.type || '') : true;
}

interface RoomViewProps {
  onLeaveRoom: () => void;
  onShareFile: (file: File) => void;
  onRequestFile: (file: FileMetadata) => void;
  onSendChat: (message: string) => void;
  onRetryConnection?: (deviceId: string) => void;
  onCopyTextFile?: (file: FileMetadata) => Promise<boolean>;
}

export function RoomView({ onLeaveRoom, onShareFile, onRequestFile, onSendChat, onRetryConnection, onCopyTextFile }: RoomViewProps) {
  const currentRoom = useStore((s) => s.currentRoom);
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'outbox'>('inbox');
  const [isDragOver, setIsDragOver] = useState(false);
  const [pasteTypeFilter, setPasteTypeFilter] = useState<string>('all');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [isPasting, setIsPasting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentRoom) return null;

  const shareUrl = `${getBaseUrl()}/room/${currentRoom.id}`;

  // Paste from clipboard (keyboard or button): filter and share
  const processPastedFiles = useCallback(
    (files: File[]) => {
      const accepted = files.filter((file) => acceptFileByFilter(file, pasteTypeFilter));
      accepted.forEach((file) => onShareFile(file));
      if (files.length > 0 && accepted.length === 0) {
        setPasteError('No files match the current type filter');
        setTimeout(() => setPasteError(null), 3000);
      }
    },
    [onShareFile, pasteTypeFilter]
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
      // If no files, check for pasted text (selected text from editor, etc.)
      if (files.length === 0) {
        const text = clipboardData.getData('text/plain');
        if (text?.trim() && (pasteTypeFilter === 'all' || pasteTypeFilter === 'text')) {
          files.push(new File([text], 'pasted-text.txt', { type: 'text/plain' }));
        }
      }
      if (files.length === 0) return;
      e.preventDefault();
      processPastedFiles(files);
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [activeTab, processPastedFiles, pasteTypeFilter]);

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
        if (item.types?.find((t) => t.startsWith('image/'))) {
          const imageType = item.types.find((t) => t.startsWith('image/'))!;
          const blob = await item.getType(imageType);
          const ext = imageType.split('/')[1] || 'png';
          files.push(new File([blob], `pasted-image.${ext}`, { type: imageType }));
        } else if (item.types?.includes('text/plain') && (pasteTypeFilter === 'all' || pasteTypeFilter === 'text')) {
          const blob = await item.getType('text/plain');
          const text = await blob.text();
          if (text?.trim()) {
            files.push(new File([text], 'pasted-text.txt', { type: 'text/plain' }));
          }
        }
      }
      if (files.length > 0) {
        processPastedFiles(files);
      } else {
        setPasteError('No image or text in clipboard');
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
      const link = `${getBaseUrl()}/room/${currentRoom.id}`;
      await navigator.clipboard.writeText(link);
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

  return (
    <div className="h-screen flex flex-col animate-in fade-in slide-in-from-right duration-300">
      {/* Header */}
      <header className="p-4 border-b border-slate-800">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onLeaveRoom}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-white">Room {currentRoom.id}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Users className="w-3 h-3" />
                <span>{currentRoom.members.length} members</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MemberAvatarStack />
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowShare(true)}>
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Share modal */}
          {showShare && (
            <Card variant="glow" className="animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Share Room</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowShare(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="bg-white p-3 rounded-xl">
                  <QRCodeSVG value={shareUrl} size={150} level="H" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Room Code</p>
                    <p className="text-2xl font-mono font-bold text-teal-400">{currentRoom.id}</p>
                  </div>
                  <Button variant="secondary" onClick={copyLink} className="w-full sm:w-auto">
                    {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Member list */}
          <Card variant="bordered">
            <MemberList onRetryConnection={onRetryConnection} />
          </Card>

          {/* Tab navigation */}
          <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'inbox'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <Inbox className="w-4 h-4" />
              Inbox
            </button>
            <button
              onClick={() => setActiveTab('outbox')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'outbox'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <Send className="w-4 h-4" />
              Outbox
            </button>
          </div>

          {/* File list */}
          <Card variant="bordered" className="flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col space-y-4">
              {activeTab === 'outbox' && (
                <>
                  {/* Outbox header - same structure as FileList/Inbox header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Send className="w-5 h-5 text-teal-400" />
                      <h3 className="font-semibold text-white">Outbox</h3>
                      <span className="text-sm text-slate-500">
                        ({currentRoom.files.filter((f) => f.direction === 'outbox').length})
                      </span>
                    </div>
                  </div>
                  {/* Outbox toolbar */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-medium text-slate-400">Your Shared Files</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors px-2 py-1 rounded-md hover:bg-teal-400/10"
                        aria-label="Add file"
                        title="Add file"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Add File</span>
                      </button>
                      {canUsePasteButton && (
                        <button
                          type="button"
                          onClick={handlePasteClick}
                          disabled={isPasting}
                          className="flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors px-2 py-1 rounded-md hover:bg-teal-400/10 disabled:opacity-50"
                          aria-label="Paste from clipboard"
                          title="Paste from clipboard"
                        >
                          <ClipboardPaste className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isPasting ? 'Pasting…' : 'Paste'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500">Paste accepts:</span>
                    {PASTE_ACCEPT_TYPES.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPasteTypeFilter(opt.id)}
                        className={`px-2 py-0.5 text-xs rounded transition-colors ${
                          pasteTypeFilter === opt.id
                            ? 'bg-teal-500/20 text-teal-400'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {pasteError && (
                    <p className="text-xs text-red-400">{pasteError}</p>
                  )}
                </>
              )}
              <FileList direction={activeTab} onDownload={onRequestFile} onCopyTextFile={onCopyTextFile} hideHeader={activeTab === 'outbox'} />
            </div>
          </Card>

          {/* Chat */}
          <Chat messages={currentRoom.messages} onSend={onSendChat} />
        </div>
      </div>

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
          className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center"
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <FileUp className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-white">Drop files to share</p>
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
