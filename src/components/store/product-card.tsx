import Image from "next/image";
import Link from "next/link";

import { StripePlaceholder } from "@/components/store/stripe-placeholder";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  slug: string;
  priceInCents: number;
  imageUrl?: string | null;
  imageAlt?: string | null;
}

export function ProductCard({
  name,
  slug,
  priceInCents,
  imageUrl,
  imageAlt,
}: ProductCardProps) {
  return (
    <Link href={`/produtos/${slug}`} className="group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <StripePlaceholder className="h-full w-full rounded-2xl">
            <span className="absolute inset-0 flex items-center justify-center font-store-sans text-[10px] uppercase tracking-[0.22em] text-store-charcoal/35">
              Produto
            </span>
          </StripePlaceholder>
        )}
      </div>

      <div className="mt-4">
        <p className="font-store-sans text-sm text-store-charcoal transition-opacity group-hover:opacity-70">
          {name}
        </p>
        <p className="mt-1 font-store-sans text-sm text-store-charcoal/50">
          {formatCurrency(priceInCents)}
        </p>
      </div>
    </Link>
  );
}
