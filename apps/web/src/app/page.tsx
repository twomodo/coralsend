'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { extractRoomId, isValidUUID } from '@/lib/utils';
import { WelcomeView } from '@/components/welcome/WelcomeView';

export default function WelcomePage() {
  const router = useRouter();

  // If URL has ?room= or ?share-target=1, send to app (which handles room redirect and share_target)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const shareTarget = params.get('share-target');

    if (roomParam) {
      const roomId = extractRoomId(roomParam) || roomParam.toUpperCase();
      if (/^[A-Z0-9]{6}$/.test(roomId) || isValidUUID(roomId)) {
        router.replace(`/room/${roomId}`);
        return;
      }
    }

    if (shareTarget === '1') {
      router.replace('/app?share-target=1');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-auto">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)`,
        }}
      />
      <div className="relative z-10">
        <WelcomeView />
      </div>
    </main>
  );
}
