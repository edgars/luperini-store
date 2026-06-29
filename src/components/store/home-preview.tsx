import Image from "next/image";
import Link from "next/link";

import type { HomePageConfig } from "@/lib/store/home-config";
import { cn } from "@/lib/utils";

type HomePreviewProps = {
  config: HomePageConfig;
  preview?: boolean;
  className?: string;
};

function PreviewLink({
  href,
  children,
  className,
  preview,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  preview?: boolean;
}) {
  if (preview) {
    return (
      <span className={cn(className, "cursor-default")}>{children}</span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function HomePreview({
  config,
  preview = true,
  className,
}: HomePreviewProps) {
  const { navLinks, hero } = config;

  return (
    <div className={cn("store-theme overflow-hidden bg-store-cream", className)}>
      <header className="border-b border-store-charcoal/10 bg-store-cream px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <Image
            src="/logo-preta.svg"
            alt="Luperini"
            width={488}
            height={208}
            className="h-7 w-auto"
          />
          <nav
            aria-label="Pré-visualização do menu"
            className="hidden flex-1 justify-center gap-4 md:flex"
          >
            {navLinks.map((link) => (
              <PreviewLink
                key={`${link.href}-${link.label}`}
                href={link.href}
                preview={preview}
                className="font-store-sans text-[9px] uppercase tracking-[0.16em] text-store-charcoal"
              >
                {link.label}
              </PreviewLink>
            ))}
          </nav>
          <div className="font-store-sans text-[9px] uppercase tracking-[0.16em] text-store-charcoal/70">
            Sacola
          </div>
        </div>

        {navLinks.length > 0 && (
          <nav
            aria-label="Menu mobile"
            className="mt-3 flex gap-3 overflow-x-auto md:hidden"
          >
            {navLinks.map((link) => (
              <PreviewLink
                key={`mobile-${link.href}-${link.label}`}
                href={link.href}
                preview={preview}
                className="shrink-0 font-store-sans text-[8px] uppercase tracking-[0.14em] text-store-charcoal/80"
              >
                {link.label}
              </PreviewLink>
            ))}
          </nav>
        )}
      </header>

      <section className="px-4 py-6">
        <div className="grid items-start gap-5 lg:grid-cols-[2fr_3fr]">
          <div className="text-center lg:text-left">
            <p className="font-store-sans text-[9px] uppercase tracking-[0.18em] text-store-charcoal/45">
              {hero.eyebrow}
            </p>
            <h2 className="mt-3 font-store-serif text-2xl leading-tight text-store-charcoal sm:text-3xl">
              {hero.title}
              <span className="mt-1 block font-store-serif italic text-store-gold">
                {hero.titleAccent}
              </span>
            </h2>
            <div
              aria-hidden
              className="mx-auto mt-4 h-px w-8 bg-store-charcoal/25 lg:mx-0"
            />
            <p className="mt-4 font-store-sans text-[11px] leading-relaxed text-store-charcoal/65">
              {hero.description}
            </p>
            <PreviewLink
              href={hero.ctaHref}
              preview={preview}
              className="mt-5 inline-block bg-store-charcoal px-5 py-2.5 font-store-sans text-[8px] uppercase tracking-[0.18em] text-white"
            >
              {hero.ctaLabel}
            </PreviewLink>
          </div>

          <div className="relative aspect-[3/4] min-h-[220px] w-full overflow-hidden rounded-xl">
            <Image
              src={hero.imageUrl}
              alt={hero.title}
              fill
              unoptimized={hero.imageUrl.startsWith("blob:")}
              sizes="400px"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
