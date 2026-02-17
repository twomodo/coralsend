import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { extractRoomId, isValidUUID } from '@/lib/utils';
import { WelcomeView } from '@/components/welcome/WelcomeView';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'CoralSend - Fast Private File Transfer',
  description:
    'Share files directly between devices with WebRTC. No account, no cloud storage, and encrypted in transit.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CoralSend - Fast Private File Transfer',
    description:
      'Share files directly between devices with WebRTC. No account, no cloud storage, and encrypted in transit.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoralSend - Fast Private File Transfer',
    description:
      'Share files directly between devices with WebRTC. No account, no cloud storage, and encrypted in transit.',
  },
};

type PageSearchParams = {
  room?: string | string[];
  'share-target'?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  const roomParam = firstParam(params.room);
  const shareTarget = firstParam(params['share-target']);

  if (roomParam) {
    const roomId = extractRoomId(roomParam) || roomParam.toUpperCase();
    if (/^[A-Z0-9]{6}$/.test(roomId) || isValidUUID(roomId)) {
      redirect(`/room/${roomId}`);
    }
  }

  if (shareTarget === '1') {
    redirect('/app?share-target=1');
  }

  const siteUrl = getSiteUrl();
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CoralSend',
    url: siteUrl,
    description:
      'Transfer files securely and directly between devices. No sign-up, no storage, just secure peer-to-peer file sharing.',
  };

  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CoralSend',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    url: siteUrl,
    description:
      'Create a room, share the link, and send files straight to another device over encrypted WebRTC channels.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
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
