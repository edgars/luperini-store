import Image from "next/image";
import Link from "next/link";

import type { HomePageSettingsValue, StoreNavLink } from "@/lib/store/home-config";

type HeroSectionProps = {
  hero: HomePageSettingsValue["hero"];
};

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="grid items-start gap-10 lg:grid-cols-[2fr_3fr] lg:gap-14 xl:gap-20">
        <div className="mx-auto flex max-w-md flex-col items-center text-center lg:mx-0 lg:max-w-none lg:items-start lg:text-left">
          <p className="font-store-sans text-[11px] uppercase tracking-[0.2em] text-store-charcoal/45">
            {hero.eyebrow}
          </p>

          <h1 className="mt-6 font-store-serif text-[2.5rem] leading-[1.05] text-store-charcoal sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
            {hero.title}
            <span className="mt-1 block font-store-serif italic text-store-gold">
              {hero.titleAccent}
            </span>
          </h1>

          <div
            aria-hidden
            className="mt-7 h-px w-10 bg-store-charcoal/25 sm:w-12"
          />

          <p className="mt-7 max-w-sm font-store-sans text-sm leading-relaxed text-store-charcoal/65 sm:text-[0.9375rem] sm:leading-7">
            {hero.description}
          </p>

          <Link
            href={hero.ctaHref}
            className="mt-9 inline-block bg-store-charcoal px-7 py-3.5 font-store-sans text-[10px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
          >
            {hero.ctaLabel}
          </Link>
        </div>

        <div className="relative aspect-[3/4] min-h-[360px] w-full overflow-hidden rounded-2xl sm:min-h-[420px] lg:min-h-[520px]">
          <Image
            src={hero.imageUrl}
            alt={`${hero.title} ${hero.titleAccent}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}

export type { StoreNavLink };
