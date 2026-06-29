import Image from "next/image";
import Link from "next/link";

export function StoreFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-store-charcoal/10 bg-store-cream py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <Link
          href="/"
          className="transition-opacity hover:opacity-70"
        >
          <Image
            src="/logo-preta.svg"
            alt="Luperini"
            width={488}
            height={208}
            className="h-9 w-auto sm:h-10"
          />
        </Link>
        <p className="mt-4 font-store-sans text-[10px] uppercase tracking-[0.15em] text-store-charcoal/50">
          © {year} Luperini Store. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
