import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Logo({
  size = 36,
  withText = true,
  href = '/',
  className,
  glow = false,
}: {
  size?: number;
  withText?: boolean;
  href?: string | null;
  className?: string;
  glow?: boolean;
}) {
  const content = (
    <span className={cn('group inline-flex items-center gap-2.5', className)}>
      <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
        {glow && (
          <span
            className="glow-orb absolute inset-[-35%] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
        )}
        <Image
          src="/icon.png"
          alt="XylemmOBS logo"
          width={size}
          height={size}
          className="relative z-10 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6"
          priority
        />
      </span>
      {withText && (
        <span className="font-pixel text-sm tracking-wide text-charcoal-50 sm:text-base">
          XylemmOBS
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="transition-opacity hover:opacity-90">
      {content}
    </Link>
  );
}
