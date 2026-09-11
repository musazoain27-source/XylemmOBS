import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Logo({
  size = 36,
  withText = true,
  href = '/',
  className,
}: {
  size?: number;
  withText?: boolean;
  href?: string | null;
  className?: string;
}) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image src="/logo.png" alt="XylemmOBS logo" width={size} height={size} className="rounded-full" priority />
      {withText && (
        <span className="font-pixel text-sm tracking-wide text-charcoal-50 sm:text-base">
          XylemmOBS
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="transition-opacity hover:opacity-85">
      {content}
    </Link>
  );
}
