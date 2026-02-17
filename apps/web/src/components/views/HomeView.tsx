'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/store';
import { getShortName } from '@/lib/deviceId';
import {
  Logo,
  Button,
  Card,
  QRScanner,
  RoomHistory,
  CreateRoomButton,
  SocialLinks,
} from '@/components/ui';
import { APP_VERSION } from '@/lib/constants';
import {
  QrCode,
  ClipboardPaste,
  AlertCircle,
  X,
  ArrowLeft,
  User,
  BookOpen,
  Rocket,
} from 'lucide-react';

interface HomeViewProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomIdOrUrl: string) => void;
  onPasteLink: () => Promise<void>;
}

export function HomeView({ onCreateRoom, onJoinRoom, onPasteLink }: HomeViewProps) {
  const [showScanner, setShowScanner] = useState(false);
  const deviceId = useStore((s) => s.deviceId);
  const error = useStore((s) => s.error);
  const pendingShareFiles = useStore((s) => s.pendingShareFiles);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Handle connection errors
  useEffect(() => {
    if (error) {
      setLinkError(error);
      useStore.getState().setError(null);
    }
  }, [error]);

  const handleJoinRoom = (roomIdOrUrl: string) => {
    setShowScanner(false);
    onJoinRoom(roomIdOrUrl);
  };

  return (
    <div className="h-screen flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex-shrink-0 p-3 sm:p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-400 hover:text-teal-400 transition-colors text-xs sm:text-sm"
              aria-label="Home"
            >
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              href="/guide"
              className="flex items-center gap-1.5 text-slate-400 hover:text-teal-400 transition-colors text-xs sm:text-sm"
              aria-label="Getting Started guide"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Guide</span>
            </Link>
          </div>
          {deviceId && (
            <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/50 rounded-full py-1 pl-2.5 pr-3">
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                  My Device
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {getShortName(deviceId)}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-teal-400" />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 overflow-y-auto">
        <div className="w-full max-w-md space-y-3 sm:space-y-4">
          {/* Logo and tagline */}
          <div className="text-center space-y-2">
            <Logo size="md" className="justify-center" />
            <p className="text-slate-400 text-sm sm:text-base">Multi-Peer File Sharing</p>
          </div>

          {/* Error message */}
          {linkError && (
            <Card variant="bordered" className="border-red-500/30 bg-red-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-400 text-sm">{linkError}</p>
                </div>
                <button onClick={() => setLinkError(null)}>
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </Card>
          )}

          {/* Pending share files (from PWA share_target) */}
          {pendingShareFiles.length > 0 && (
            <Card variant="bordered" className="border-teal-500/30 bg-teal-500/5">
              <p className="text-teal-400 text-sm">
                You have {pendingShareFiles.length} file{pendingShareFiles.length !== 1 ? 's' : ''} to share. Create or join a room to send them.
              </p>
            </Card>
          )}

          {/* Scanner view */}
          {showScanner ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setShowScanner(false)}>
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </div>

              <Card variant="bordered" className="overflow-hidden p-0">
                <QRScanner onScan={handleJoinRoom} onError={(e) => setLinkError(e)} />
              </Card>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-slate-900 px-4 text-sm text-slate-500">or</span>
                </div>
              </div>

              <Button variant="secondary" className="w-full" onClick={onPasteLink}>
                <ClipboardPaste className="w-4 h-4" />
                Paste Room Code
              </Button>
            </div>
          ) : (
            /* Main actions */
            <div className="space-y-3 animate-in fade-in slide-in-from-left duration-200">
              <CreateRoomButton onClick={onCreateRoom} />

              {/* Getting Started */}
              <Link
                href="/guide"
                className="block w-full group relative bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-teal-500/30 hover:bg-slate-800/80 transition-all"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-700 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-teal-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Getting Started</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">Step-by-step guide to share files</p>
                  </div>
                </div>
              </Link>

              {/* Join Room */}
              <button
                onClick={() => setShowScanner(true)}
                className="w-full group relative bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-slate-600 hover:bg-slate-800/80 transition-all"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-700 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <QrCode className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Join Room</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">Scan QR code or enter code</p>
                  </div>
                </div>
              </button>

              {/* Room History */}
              <RoomHistory onRejoin={handleJoinRoom} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 py-3 px-4 flex flex-col items-center gap-2 text-slate-500 text-[10px] sm:text-xs">
        <p>Files are transferred directly between devices</p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span>v{APP_VERSION}</span>
          <Link href="/guide" className="hover:text-teal-400 transition-colors">
            Guide
          </Link>
          <SocialLinks iconSize={16} />
        </div>
      </footer>
    </div>
  );
}
