import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NexPress',
    template: '%s | NexPress',
  },
  description:
    'Production-grade CMS, builder, and commerce foundations for self-hosted teams.',
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[oklch(0.97_0.006_95)] text-[oklch(0.25_0.018_250)] antialiased">
        {children}
      </body>
    </html>
  );
}
