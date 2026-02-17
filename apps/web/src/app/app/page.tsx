'use client';

import { useCallback } from 'react';
import { useAppInit } from '@/hooks/useAppInit';
import { useRoomActions } from '@/hooks/useRoomActions';
import { useStore } from '@/store/store';
import { HomeView } from '@/components/views/HomeView';

export default function AppHomePage() {
  useAppInit();
  const { createRoomAndNavigate, joinRoom } = useRoomActions();

  const pasteLink = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      joinRoom(text);
    } catch (err) {
      console.error('Clipboard error:', err);
      useStore.getState().setError('Unable to read clipboard');
    }
  }, [joinRoom]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <div
        className="fixed inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)`,
        }}
      />
      <div className="relative z-10">
        <HomeView
          onCreateRoom={createRoomAndNavigate}
          onJoinRoom={joinRoom}
          onPasteLink={pasteLink}
        />
      </div>
    </main>
  );
}
