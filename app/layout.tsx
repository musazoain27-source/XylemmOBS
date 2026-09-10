import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'XylemmOBS — Support',
  description:
    'Recording answers, questions, and private issue reports for XylemmOBS.',
  icons: { icon: '/logo.png' },
  referrer: 'no-referrer',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
