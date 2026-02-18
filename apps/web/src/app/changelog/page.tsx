'use client';

import Link from 'next/link';
import { SOCIAL_LINKS, APP_VERSION } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';

export default function ChangelogPage() {
  const githubUrl = SOCIAL_LINKS.github;
  const releasesUrl = githubUrl ? `${githubUrl.replace(/\/*$/, '')}/releases` : '';

  return (
    <main className="page-shell">
      <div className="page-glow" />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-400 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">Changelog</h1>
        <p className="text-slate-400 text-sm mb-8">
          Release history and updates. Current version: v{APP_VERSION}
        </p>
        {releasesUrl ? (
          <>
            <p className="text-slate-300 text-sm leading-relaxed">
              Full release notes and version history are available on GitHub.
            </p>
            <Link
              href={releasesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
            >
              View releases on GitHub →
            </Link>
          </>
        ) : (
          <p className="text-slate-500 text-sm">GitHub URL is not configured.</p>
        )}
      </div>
    </main>
  );
}
