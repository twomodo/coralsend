'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useStore } from '@/store/store';
import { useEnsureDevice } from '@/hooks/useAppInit';
import { useRoomActions } from '@/hooks/useRoomActions';
import { GuideStepper } from '@/components/guide/GuideStepper';
import { Step1Room } from '@/components/guide/Step1Room';
import { Step2Share } from '@/components/guide/Step2Share';
import { Step3Outbox } from '@/components/guide/Step3Outbox';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

export default function GuidePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [guideRoomId, setGuideRoomId] = useState<string | null>(null);

  useEnsureDevice();
  const { createRoomCode } = useRoomActions();
  const { connect, shareFile, cleanup } = useWebRTC();
  const currentRoom = useStore((s) => s.currentRoom);

  const handleCreateRoom = () => {
    const roomId = createRoomCode();
    setGuideRoomId(roomId);
    connect(roomId, true);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 1) {
      router.push('/app');
      return;
    }
    cleanup();
    useStore.getState().leaveRoom();
    setStep(1);
    setGuideRoomId(null);
    router.push('/app');
  };

  const handleSkipDemo = () => {
    setStep(3);
  };

  const handleEnterRoom = () => {
    if (currentRoom) {
      router.push(`/room/${currentRoom.id}`);
    }
  };

  const inRoom = currentRoom && guideRoomId && currentRoom.id === guideRoomId;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-auto">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col max-w-md mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <GuideStepper currentStep={step} />
          <div className="w-14" />
        </header>

        <div className="flex-1 flex flex-col justify-center py-4">
          {step === 1 && <Step1Room onCreateRoom={handleCreateRoom} />}

          {step === 2 && inRoom && currentRoom && (
            <Step2Share
              room={currentRoom}
              onNext={() => setStep(3)}
              onSkipDemo={handleSkipDemo}
            />
          )}

          {step === 3 && inRoom && (
            <Step3Outbox
              room={currentRoom}
              onShareFile={shareFile}
              onEnterRoom={handleEnterRoom}
            />
          )}
        </div>

      </div>
    </main>
  );
}
