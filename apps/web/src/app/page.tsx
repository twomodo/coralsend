'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/store';
import { getDeviceId } from '@/lib/deviceId';
import { extractRoomId, isValidUUID } from '@/lib/utils';
import { HomeView } from '@/components/views/HomeView';

// Generate room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function Home() {
  const router = useRouter();
  const deviceId = useStore((s) => s.deviceId);

  // Initialize device ID on mount and clear any old errors
  useEffect(() => {
    const store = useStore.getState();
    if (!deviceId) {
      store.setDeviceId(getDeviceId());
    }
    // Clear any previous connection errors when returning to home
    store.setError(null);
    store.setStatus('idle');
  }, [deviceId]);

  // Handle room parameter in URL on mount (for old links)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');

      if (roomParam) {
        // Redirect to new route format
        const roomId = extractRoomId(roomParam) || roomParam.toUpperCase();
        if (/^[A-Z0-9]{6}$/.test(roomId) || isValidUUID(roomId)) {
          router.replace(`/room/${roomId}`);
        }
      }
    }
  }, [router]);

  // Create new room
  const createRoom = () => {
    const roomId = generateRoomCode();
    // Navigate directly with create flag
    router.push(`/room/${roomId}?create=true`);
  };

  // Join existing room
  const joinRoom = (roomIdOrUrl: string) => {
    let roomId = extractRoomId(roomIdOrUrl) || roomIdOrUrl.toUpperCase();

    // Validate room code (6 alphanumeric characters)
    if (!/^[A-Z0-9]{6}$/.test(roomId) && !isValidUUID(roomId)) {
      useStore.getState().setError('Invalid room code format');
      return;
    }

    // Navigate to room route - the RoomPage will handle the connection
    router.push(`/room/${roomId}`);
  };

  // Paste link from clipboard
  const pasteLink = async () => {
    try {
      const text = await navigator.clipboard.readText();
      joinRoom(text);
    } catch (err) {
      console.error('Clipboard error:', err);
      useStore.getState().setError('Unable to read clipboard');
    }
  };

  // ============ RENDER ============

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="relative z-10">
        <HomeView
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          onPasteLink={pasteLink}
        />
      </div>
    </main>
  );
}
