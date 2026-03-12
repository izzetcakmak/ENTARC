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
  title: 'ENTARC - Autonomous VC Agent | Arc Network',
  description: 'AI-driven venture capital platform with milestone-based streaming payments on Arc Network. Discover, invest, and manage Web3 projects with intelligent analysis.',
  keywords: ['ENTARC', 'VC', 'Web3', 'AI', 'Arc Network', 'Streaming', 'Milestone', 'Investment'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'ENTARC - Autonomous VC Agent',
    description: 'AI-driven venture capital platform with milestone-based streaming payments',
    siteName: 'ENTARC',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ENTARC - Autonomous VC Agent',
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
