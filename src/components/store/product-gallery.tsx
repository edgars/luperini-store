"use client";

import Image from "next/image";
import { useState } from "react";

import { StripePlaceholder } from "@/components/store/stripe-placeholder";
import { cn } from "@/lib/utils";
import type { StoreProductImage } from "@/lib/store/get-product-by-slug";

type ProductGalleryProps = {
  images: StoreProductImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-store-charcoal/5">
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.alt ?? productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
        ) : (
          <StripePlaceholder className="h-full w-full rounded-2xl">
            <span className="absolute inset-0 flex items-center justify-center font-store-sans text-[10px] uppercase tracking-[0.22em] text-store-charcoal/35">
              Sem imagem
            </span>
          </StripePlaceholder>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border transition-opacity",
                index === activeIndex
                  ? "border-store-charcoal"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={image.url}
                alt={image.alt ?? `${productName} ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
