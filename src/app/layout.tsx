import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import AppChrome from '@/components/AppChrome';
import type { Metadata } from 'next';
import BootstrapClient from '@/components/BootstrapClient';

export const metadata: Metadata = {
  title: 'Mastering Home Cooking',
  description: 'Content managed via Supabase, deployed on Vercel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body>
        <AppChrome>{children}</AppChrome>
        <BootstrapClient />
      </body>
    </html>
  );
}
