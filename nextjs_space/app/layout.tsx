// Root Layout - ARCENT MVP
// Main application shell with providers

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'ARCENT - Autonomous VC Agent | Arc Network',
  description: 'AI-driven venture capital platform with milestone-based streaming payments on Arc Network. Discover, invest, and manage Web3 projects with intelligent analysis.',
  keywords: ['ARCENT', 'VC', 'Web3', 'AI', 'Arc Network', 'Streaming', 'Milestone', 'Investment'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'ARCENT - Autonomous VC Agent',
    description: 'AI-driven venture capital platform with milestone-based streaming payments',
    siteName: 'ARCENT',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARCENT - Autonomous VC Agent',
    description: 'AI-driven venture capital platform on Arc Network',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
