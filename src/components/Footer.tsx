import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-sand-dark/70">
      <div className="page-container flex flex-col items-center gap-6 py-14 text-center">
        <Link href="/" className="font-serif text-3xl font-light tracking-wide text-sand">
          Aromática
        </Link>
        <div className="h-px w-10 bg-gold/60" />
        <p className="max-w-sm text-sm leading-relaxed">
          Perfumería de autor. Fragancias elegidas con paciencia para quienes cuentan historias con
          su aroma.
        </p>
        <p className="text-[0.62rem] uppercase tracking-[0.3em] text-sand-dark/50">
          © {new Date().getFullYear()} Aromática
        </p>
      </div>
    </footer>
  );
}
