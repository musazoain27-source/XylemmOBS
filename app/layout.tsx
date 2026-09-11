import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'XylemmOBS Support',
  description: 'Ask questions, report issues, request features, and help improve XylemmOBS.',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-charcoal-950">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
