import Logo from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="border-t border-charcoal-800/80 bg-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <Logo size={28} />
        <p className="text-xs text-charcoal-500">
          &copy; {new Date().getFullYear()} XylemmOBS. Not affiliated with Mojang or Microsoft.
        </p>
      </div>
    </footer>
  );
}
