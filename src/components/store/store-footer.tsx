import Image from "next/image";
import Link from "next/link";

import { StoreSocialLinks } from "@/components/store/store-social-links";
import type { SocialSettingsValue } from "@/lib/store/social-config";

type StoreFooterProps = {
  socialSettings: SocialSettingsValue;
};

export function StoreFooter({ socialSettings }: StoreFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-store-charcoal/10 bg-store-cream py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <Link href="/" className="transition-opacity hover:opacity-70">
          <Image
            src="/logo-preta.svg"
            alt="Luperini"
            width={488}
            height={208}
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <StoreSocialLinks settings={socialSettings} className="mt-6" />

        <p className="mt-6 font-store-sans text-[10px] uppercase tracking-[0.15em] text-store-charcoal/50">
          © {year} Luperini Store. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
