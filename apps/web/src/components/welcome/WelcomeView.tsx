'use client';

import Link from 'next/link';
import { useRoomActions } from '@/hooks/useRoomActions';
import { Logo } from '@/components/ui';
import { WelcomeContent } from './WelcomeContent';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const primaryBtn =
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-xl px-6 py-3 text-base bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-400 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg shadow-teal-500/25';
const secondaryBtn =
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-xl px-6 py-3 text-base bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900';

export function WelcomeView() {
  const { createRoomAndNavigate } = useRoomActions();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-10 sm:py-14">
        {/* Hero */}
        <div className="text-center mb-12">
          <Logo size="lg" className="justify-center mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Send files directly. No cloud, no account.
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
            Create a room, share the link, and send files straight to the other device. Everything stays between you and the receiver—encrypted and private.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <button type="button" onClick={createRoomAndNavigate} className={cn(primaryBtn)}>
            Create a room
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link href="/guide" className={cn(secondaryBtn)}>
            Getting started
          </Link>
        </div>

        {/* Features + How it works + Social */}
        <WelcomeContent />
      </div>
    </div>
  );
}
