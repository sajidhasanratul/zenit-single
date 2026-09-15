import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrackingScripts from '@/components/TrackingScripts';
import { getSettings } from '@/lib/db';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap'
});

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  variable: '--font-plus-jakarta',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'ZenIT Agency - Next-Gen Web Development, CAPI Tracking & AI Automation',
  description: 'High-performance Next.js landing pages, Meta Pixel Conversions API (CAPI) server-side integrations, and 24/7 AI lead qualification pipelines.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const isAdmin = headersList.get('x-is-admin') === 'true';

  let settings = { gtmId: '', pixelId: '' };
  try {
    const dbSettings = getSettings();
    settings = {
      gtmId: dbSettings.gtmId,
      pixelId: dbSettings.pixelId
    };
  } catch (err) {
    console.error('Error fetching database tracking configurations in root layout:', err);
  }

  return (
    <html lang="en">
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans bg-background text-textWhite antialiased`}>
        {/* Dynamic GTM & Meta Pixel script injection */}
        <TrackingScripts gtmId={settings.gtmId} pixelId={settings.pixelId} />
        
        {!isAdmin && <Navbar />}
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            {children}
          </div>
        </div>
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}
