import Link from 'next/link';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-charcoal-950 px-4 text-center">
      <Logo size={56} withText={false} href={null} className="mb-6" />
      <h1 className="font-pixel text-lg text-charcoal-50">404</h1>
      <p className="mt-3 max-w-sm text-sm text-charcoal-400">
        This page doesn't exist, or the submission you're looking for may have been removed.
      </p>
      <Link href="/" className="btn-primary mt-6 text-sm">Back to XylemmOBS Support</Link>
    </div>
  );
}
