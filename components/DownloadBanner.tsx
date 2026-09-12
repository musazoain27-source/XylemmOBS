import Logo from '@/components/Logo';
import { MOD_RELEASE } from '@/lib/modRelease';

export default function DownloadBanner() {
  return (
    <section className="card-interactive relative flex flex-col items-center gap-6 overflow-hidden p-6 text-center sm:flex-row sm:justify-between sm:p-8 sm:text-left">
      <div className="glow-orb -left-16 top-1/2 h-56 w-56 -translate-y-1/2 opacity-40" />
      <div className="relative flex items-center gap-4">
        <Logo size={52} withText={false} href={null} />
        <div>
          <h2 className="text-lg font-semibold text-charcoal-50">Download XylemmOBS</h2>
          <p className="mt-1 text-sm text-charcoal-400">
            <span className="font-mono text-moss-300">v{MOD_RELEASE.version}</span>
            {' '}&middot; for Minecraft {MOD_RELEASE.minecraftVersion} &middot; {MOD_RELEASE.fileSizeLabel}
          </p>
        </div>
      </div>

      <a
        href={MOD_RELEASE.filePath}
        download
        className="btn-primary relative z-10 w-full shrink-0 text-sm sm:w-auto"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
        </svg>
        Download Now
      </a>
    </section>
  );
}
