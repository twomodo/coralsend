import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoralSend - Secure P2P File Transfer',
  description: 'Transfer files securely and directly between devices. No sign-up, no storage, just secure peer-to-peer file sharing.',
  keywords: ['file transfer', 'p2p', 'secure', 'encrypted', 'file sharing', 'webrtc'],
  authors: [{ name: 'CoralSend' }],
  creator: 'CoralSend',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    title: 'CoralSend - Secure P2P File Transfer',
    description: 'Transfer files securely and directly between devices. No sign-up, no storage, just secure peer-to-peer file sharing.',
    siteName: 'CoralSend',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoralSend - Secure P2P File Transfer',
    description: 'Transfer files securely and directly between devices.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CoralSend',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
