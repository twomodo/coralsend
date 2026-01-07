'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { QRCodeSVG } from 'qrcode.react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useStore } from '@/store/store';
import { getBaseUrl } from '@/lib/constants';
import { extractRoomId, isValidUUID, formatFileSize } from '@/lib/utils';
import { 
  Logo, 
  Button, 
  Card, 
  ConnectionStatus, 
  FileCard, 
  Progress,
  QRScanner,
} from '@/components/ui';
import {
  Send,
  Download,
  Copy,
  Check,
  ClipboardPaste,
  AlertCircle,
  X,
  ArrowLeft,
  FileUp,
  Plus,
  QrCode,
  Link2,
  Smartphone,
  Shield,
  Zap,
} from 'lucide-react';

type View = 'home' | 'send' | 'receive';

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [copySuccess, setCopySuccess] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const { connect, sendFile, cancelTransfer, cleanup } = useWebRTC();
  const { roomId, status, role, files, error, peer } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle room parameter in URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      
      if (roomParam) {
        if (isValidUUID(roomParam)) {
          setLinkError(null);
          setView('receive');
          connect(roomParam, 'receiver');
        } else {
          setLinkError('Invalid room code. Please check the link and try again.');
        }
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [connect]);

  // Handle connection errors
  useEffect(() => {
    if (error && view !== 'home') {
      setLinkError(error);
      setView('home');
      useStore.getState().setError(null);
    }
  }, [error, view]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Start sending mode
  const startSending = () => {
    setLinkError(null);
    const newRoomId = uuidv4();
    setView('send');
    connect(newRoomId, 'sender');
  };

  // Start receiving mode
  const startReceiving = () => {
    setLinkError(null);
    setView('receive');
  };

  // Go back to home
  const goHome = () => {
    cleanup();
    useStore.getState().reset();
    setView('home');
    setLinkError(null);
  };

  // Copy share link
  const copyLink = async () => {
    if (!roomId) return;
    
    try {
      const baseUrl = getBaseUrl();
      const link = `${baseUrl}?room=${roomId}`;
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Paste link from clipboard
  const pasteLink = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const roomIdFromText = extractRoomId(text);
      
      if (roomIdFromText) {
        handleRoomJoin(roomIdFromText);
      } else {
        setLinkError('No valid room code found in clipboard');
      }
    } catch (err) {
      console.error('Clipboard error:', err);
      setLinkError('Unable to read clipboard. Please paste the link manually.');
    }
  };

  // Handle QR scan or room join
  const handleRoomJoin = (roomIdOrUrl: string) => {
    const roomIdValue = extractRoomId(roomIdOrUrl) || roomIdOrUrl;
    
    if (!isValidUUID(roomIdValue)) {
      setLinkError('Invalid room code format');
      return;
    }
    
    setLinkError(null);
    connect(roomIdValue, 'receiver');
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      Array.from(selectedFiles).forEach(file => sendFile(file));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      Array.from(droppedFiles).forEach(file => sendFile(file));
    }
  };

  // Get share URL
  const shareUrl = roomId ? `${getBaseUrl()}?room=${roomId}` : '';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)`,
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 sm:p-6">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            {view !== 'home' ? (
              <Button variant="ghost" size="sm" onClick={goHome}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
            
            {view !== 'home' && <ConnectionStatus status={status} />}
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md space-y-6">
            
            {/* ============ HOME VIEW ============ */}
            {view === 'home' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Logo and tagline */}
                <div className="text-center space-y-4">
                  <Logo size="lg" className="justify-center" />
                  <p className="text-slate-400 text-lg">
                    Secure P2P File Transfer
                  </p>
                </div>

                {/* Error message */}
                {linkError && (
                  <Card variant="bordered" className="border-red-500/30 bg-red-500/5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-400 font-medium text-sm">{linkError}</p>
                      </div>
                      <button onClick={() => setLinkError(null)} className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={startSending}
                    className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500/20 to-teal-500/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Send className="w-8 h-8 text-teal-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">Send</h3>
                      <p className="text-slate-400 text-sm mt-1">Share files</p>
                    </div>
                  </button>

                  <button
                    onClick={startReceiving}
                    className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Download className="w-8 h-8 text-cyan-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">Receive</h3>
                      <p className="text-slate-400 text-sm mt-1">Get files</p>
                    </div>
                  </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="text-center p-3">
                    <Shield className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">End-to-End<br />Encrypted</p>
                  </div>
                  <div className="text-center p-3">
                    <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Direct P2P<br />Transfer</p>
                  </div>
                  <div className="text-center p-3">
                    <Smartphone className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No App<br />Required</p>
                  </div>
                </div>
              </div>
            )}

            {/* ============ SEND VIEW ============ */}
            {view === 'send' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Waiting for peer / QR Code */}
                {(status === 'connecting' || status === 'waiting-peer' || status === 'peer-joined') && (
                  <>
                    <div className="text-center mb-2">
                      <h2 className="text-xl font-semibold text-white">Share this code</h2>
                      <p className="text-slate-400 text-sm mt-1">Scan with another device to connect</p>
                    </div>

                    <Card variant="elevated" className="p-8">
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-xl shadow-xl shadow-teal-500/10">
                          <QRCodeSVG 
                            value={shareUrl}
                            size={200}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                      </div>
                    </Card>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={copyLink}
                      >
                        {copySuccess ? (
                          <>
                            <Check className="w-4 h-4 text-teal-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-center text-slate-400 text-sm">
                      <span className="inline-flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        {status === 'peer-joined' ? 'Establishing connection...' : 'Waiting for peer to connect...'}
                      </span>
                    </div>
                  </>
                )}

                {/* Connected - File upload area */}
                {status === 'connected' && (
                  <>
                    <div className="text-center mb-2">
                      <h2 className="text-xl font-semibold text-teal-400">Connected!</h2>
                      <p className="text-slate-400 text-sm mt-1">Select files to send</p>
                    </div>

                    {/* Drop zone */}
                    <Card 
                      variant={isDragOver ? 'glow' : 'bordered'}
                      className={`relative cursor-pointer transition-all ${
                        isDragOver ? 'border-teal-400 bg-teal-500/10' : ''
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="py-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-2xl flex items-center justify-center">
                          <FileUp className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-white font-medium">Drop files here</p>
                        <p className="text-slate-400 text-sm mt-1">or click to browse</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </Card>
                  </>
                )}

                {/* Transferring */}
                {status === 'transferring' && (
                  <>
                    <div className="text-center mb-2">
                      <h2 className="text-xl font-semibold text-cyan-400">Sending...</h2>
                    </div>

                    <div className="space-y-3">
                      {files.filter(f => f.direction === 'send').map(file => (
                        <FileCard
                          key={file.id}
                          file={file}
                          onRemove={file.status !== 'transferring' ? () => useStore.getState().removeFile(file.id) : undefined}
                        />
                      ))}
                    </div>

                    <Button variant="danger" onClick={cancelTransfer} className="w-full">
                      Cancel Transfer
                    </Button>
                  </>
                )}

                {/* File list when connected */}
                {status === 'connected' && files.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400">Transfer History</h3>
                    {files.map(file => (
                      <FileCard
                        key={file.id}
                        file={file}
                        onRemove={() => useStore.getState().removeFile(file.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============ RECEIVE VIEW ============ */}
            {view === 'receive' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Scanning / Input mode */}
                {status === 'idle' && (
                  <>
                    <div className="text-center mb-2">
                      <h2 className="text-xl font-semibold text-white">Scan QR Code</h2>
                      <p className="text-slate-400 text-sm mt-1">Or paste the share link</p>
                    </div>

                    <Card variant="bordered" className="overflow-hidden p-0">
                      <QRScanner 
                        onScan={handleRoomJoin}
                        onError={(err) => setLinkError(err)}
                      />
                    </Card>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-slate-900 px-4 text-sm text-slate-500">or</span>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={pasteLink}
                    >
                      <ClipboardPaste className="w-4 h-4" />
                      Paste Link from Clipboard
                    </Button>

                    {linkError && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {linkError}
                      </div>
                    )}
                  </>
                )}

                {/* Connecting */}
                {status === 'connecting' && (
                  <Card variant="bordered" className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Connecting...</h2>
                    <p className="text-slate-400 text-sm mt-2">Establishing secure connection</p>
                  </Card>
                )}

                {/* Connected - Waiting for files */}
                {status === 'connected' && (
                  <>
                    <Card variant="glow" className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                        <Check className="w-8 h-8 text-teal-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-teal-400">Connected!</h2>
                      <p className="text-slate-400 text-sm mt-2">Waiting for files...</p>
                    </Card>

                    {files.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-400">Received Files</h3>
                        {files.filter(f => f.direction === 'receive').map(file => (
                          <FileCard key={file.id} file={file} />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Receiving file */}
                {status === 'transferring' && (
                  <>
                    <div className="text-center mb-2">
                      <h2 className="text-xl font-semibold text-cyan-400">Receiving...</h2>
                    </div>

                    <div className="space-y-3">
                      {files.filter(f => f.direction === 'receive').map(file => (
                        <FileCard key={file.id} file={file} />
                      ))}
                    </div>
                  </>
                )}

                {/* Disconnected */}
                {status === 'disconnected' && (
                  <Card variant="bordered" className="text-center py-8 border-red-500/30">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-2xl flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-red-400">Disconnected</h2>
                    <p className="text-slate-400 text-sm mt-2">Connection to peer was lost</p>
                    <Button variant="secondary" className="mt-4" onClick={goHome}>
                      Return Home
                    </Button>
                  </Card>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 text-center text-slate-500 text-xs">
          <p>Files are transferred directly between devices</p>
          <p className="mt-1">No data stored on servers</p>
        </footer>
      </div>
    </main>
  );
}
