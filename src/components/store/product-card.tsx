"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { StripePlaceholder } from "@/components/store/stripe-placeholder";
import type { StoreProductCardImage } from "@/lib/store/product-card-images";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  slug: string;
  priceInCents: number;
  imageUrl?: string | null;
  imageAlt?: string | null;
  images?: StoreProductCardImage[];
  imageHoverZoom?: boolean;
  onImageHoverStart?: () => void;
  onImageHoverEnd?: () => void;
}

export function ProductCard({
  name,
  slug,
  priceInCents,
  imageUrl,
  imageAlt,
  images = [],
  imageHoverZoom = false,
  onImageHoverStart,
  onImageHoverEnd,
}: ProductCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const displayImages = useMemo(() => {
    if (images.length > 0) return images;
    if (imageUrl) return [{ url: imageUrl, alt: imageAlt ?? name }];
    return [];
  }, [imageAlt, imageUrl, images, name]);

  const currentImage = displayImages[activeIndex] ?? displayImages[0];
  const hasMultipleImages = displayImages.length > 1;

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!hasMultipleImages) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const segmentWidth = rect.width / displayImages.length;
    const index = Math.min(
      displayImages.length - 1,
      Math.max(0, Math.floor(x / segmentWidth)),
    );

    setActiveIndex(index);
  }

  function handleMouseEnter() {
    setIsHovering(true);
    onImageHoverStart?.();
  }

  function handleMouseLeave() {
    setIsHovering(false);
    setActiveIndex(0);
    onImageHoverEnd?.();
  }

  return (
    <Link href={`/produtos/${slug}`} className="group block">
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {currentImage ? (
          <>
            {displayImages.map((image, index) => (
              <Image
                key={`${image.url}-${index}`}
                src={image.url}
                alt={image.alt ?? name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={cn(
                  "object-cover object-center transition-all duration-500 ease-out",
                  index === activeIndex ? "opacity-100" : "opacity-0",
                  imageHoverZoom && isHovering && index === activeIndex
                    ? "scale-105"
                    : "scale-100",
                )}
              />
            ))}

            {hasMultipleImages && isHovering && (
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 px-3">
                {displayImages.map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      index === activeIndex
                        ? "w-4 bg-white"
                        : "w-1 bg-white/50",
                    )}
                  />
                ))}
              </div>
            )}
          </>
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
