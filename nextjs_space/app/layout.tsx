// Root Layout - ENTARC MVP
// Main application shell with providers
// Includes Google Analytics integration

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'ENTARC — Autonomous Venture Intelligence Agent on Arc',
  description: 'AI-driven autonomous venture intelligence agent with milestone-based USDC streaming, adaptive portfolio management, and social signal intelligence on Arc Network.',
  keywords: ['ENTARC', 'Autonomous Agent', 'Venture Intelligence', 'AI', 'Arc Network', 'Circle', 'USDC', 'Pre-TGE', 'Web3'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://entarc.xyz',
    title: 'ENTARC — Autonomous Venture Intelligence Agent on Arc',
    description: 'First autonomous AI agent on Arc Network. Discovers pre-TGE projects, analyzes 5 signal sources, manages USDC investments via milestone-based escrow. Powered by Circle Agent Stack.',
    siteName: 'ENTARC',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'ENTARC — Autonomous Venture Intelligence Agent on Arc Network',
      type: 'image/png',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ENTARC — Autonomous Venture Intelligence Agent on Arc',
    description: 'First autonomous AI agent on Arc Network. Discovers pre-TGE projects, analyzes signals, manages USDC via milestone-based escrow.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'ENTARC — Autonomous Venture Intelligence Agent on Arc Network',
    }],
    creator: '@izzetcakmak',
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
        
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
