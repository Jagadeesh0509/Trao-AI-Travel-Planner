import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { GoogleOAuthWrapper } from '@/components/GoogleOAuthWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Trao — AI Travel Planner',
  description:
    'Generate personalized day-by-day travel itineraries, realistic budgets, hotel recommendations, and smart packing lists — powered by Google Gemini AI.',
  keywords: ['travel planner', 'AI travel', 'itinerary generator', 'trip planner', 'Gemini AI'],
  openGraph: {
    title: 'Trao — AI Travel Planner',
    description: 'Plan your perfect trip with AI-powered itineraries and smart packing lists.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <GoogleOAuthWrapper>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}
