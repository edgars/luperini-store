import Image from "next/image";
import Link from "next/link";

import { StoreSearchTrigger } from "@/components/store/store-search-trigger";
import { StoreSocialLinks } from "@/components/store/store-social-links";
import { defaultHomeNavLinks, type StoreNavLink } from "@/lib/store/home-config";
import {
  hasLinkedSocialSettings,
  type SocialSettingsValue,
} from "@/lib/store/social-config";
import { cn } from "@/lib/utils";

interface StoreHeaderProps {
  cartCount?: number;
  navLinks?: StoreNavLink[];
  socialSettings?: SocialSettingsValue;
}

export function StoreHeader({
  cartCount = 0,
  navLinks = [...defaultHomeNavLinks],
  socialSettings,
}: StoreHeaderProps) {
  return (
    <header className="bg-store-cream">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            className="relative z-10 shrink-0 transition-opacity hover:opacity-70"
          >
            <Image
              src="/logo-preta.svg"
              alt="Luperini"
              width={488}
              height={208}
              priority
              className="h-10 w-auto sm:h-12 lg:h-[3.75rem]"
            />
          </Link>

          <nav
            aria-label="Categorias"
            className="hidden justify-center gap-6 lg:flex xl:gap-10"
          >
            {navLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={cn(
                  "font-store-sans text-[11px] uppercase tracking-[0.18em] text-store-charcoal",
                  "transition-opacity hover:opacity-60",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-3.5 sm:gap-5">
            {socialSettings && hasLinkedSocialSettings(socialSettings) ? (
              <>
                <StoreSocialLinks
                  settings={socialSettings}
                  onlyLinked
                  variant="header"
                />
                <span
                  aria-hidden
                  className="h-3 w-px shrink-0 bg-store-charcoal/15"
                />
              </>
            ) : null}
            <StoreSearchTrigger />
            <Link
              href="/carrinho"
              className="font-store-sans text-[11px] uppercase tracking-[0.18em] text-store-charcoal transition-opacity hover:opacity-60"
            >
              Sacola{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
          </div>
        </div>

        <nav
          aria-label="Categorias mobile"
          className="mt-4 flex gap-5 overflow-x-auto pb-1 lg:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={`mobile-${link.href}-${link.label}`}
              href={link.href}
              className="shrink-0 font-store-sans text-[10px] uppercase tracking-[0.16em] text-store-charcoal/80 transition-opacity hover:opacity-60"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
