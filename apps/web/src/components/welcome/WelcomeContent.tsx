import Link from 'next/link';
import { Shield, Smartphone, Share2, UserX, Zap } from 'lucide-react';
import { SocialLinks } from '@/components/ui';
import { APP_VERSION } from '@/lib/constants';

const FEATURES = [
  {
    icon: Zap,
    title: 'P2P transfer',
    description: 'Files go directly between devices. No server storage.',
  },
  {
    icon: Shield,
    title: 'Encrypted in transit',
    description: 'WebRTC uses DTLS so data is protected while moving.',
  },
  {
    icon: Smartphone,
    title: 'PWA',
    description: 'Install on your phone or desktop and use like an app.',
  },
  {
    icon: Share2,
    title: 'Share target',
    description: 'Share files from other apps straight into CoralSend.',
  },
  {
    icon: UserX,
    title: 'No sign-up',
    description: 'Create a room and share the link. No account needed.',
  },
];

export function WelcomeContent() {
  return (
    <div className="space-y-12">
      <section id="features">
        <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
        <ul className="space-y-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="font-medium text-white">{title}</p>
                <p className="text-slate-400 text-sm mt-0.5">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="how-it-works">
        <h2 className="text-xl font-semibold text-white mb-4">How it works</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          CoralSend uses a signaling server only to help your browser connect to the other person&apos;s browser. Room IDs and connection metadata pass through the server; file bytes never do. Once the WebRTC data channel is open, files are sent directly between devices and are encrypted in transit (DTLS).
        </p>
      </section>

      <section className="flex flex-col items-center gap-4 pt-4">
        <p className="text-slate-500 text-xs">v{APP_VERSION}</p>
        <SocialLinks iconSize={20} />
        <Link href="/changelog" className="text-slate-500 hover:text-teal-400 text-sm transition-colors">
          Changelog
        </Link>
      </section>
    </div>
  );
}
