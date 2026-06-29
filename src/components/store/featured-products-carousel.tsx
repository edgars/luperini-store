"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/store/product-card";
import type { StoreProductCard } from "@/lib/store/get-featured-products";
import { cn } from "@/lib/utils";

type FeaturedProductsCarouselProps = {
  products: StoreProductCard[];
};

export function FeaturedProductsCarousel({
  products,
}: FeaturedProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    setCanScrollLeft(element.scrollLeft > 4);
    setCanScrollRight(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 4,
    );

    const children = Array.from(element.children) as HTMLElement[];
    const center = element.scrollLeft + element.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    children.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(center - childCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    updateScrollState();
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products, updateScrollState]);

  function scrollByDirection(direction: "left" | "right") {
    const element = scrollRef.current;
    if (!element) return;

    const firstSlide = element.children[0] as HTMLElement | undefined;
    const gap = 24;
    const amount = firstSlide ? firstSlide.offsetWidth + gap : element.clientWidth;

    element.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  function scrollToIndex(index: number) {
    const element = scrollRef.current;
    if (!element) return;

    const slide = element.children[index] as HTMLElement | undefined;
    if (!slide) return;

    element.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <div className="relative">
      {products.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollByDirection("left")}
            disabled={!canScrollLeft}
            aria-label="Produto anterior"
            className={cn(
              "absolute top-[38%] left-0 z-10 -translate-x-1/2 -translate-y-1/2",
              "hidden h-10 w-10 items-center justify-center rounded-full border border-store-charcoal/15 bg-store-cream text-store-charcoal transition-opacity sm:flex",
              !canScrollLeft && "pointer-events-none opacity-30",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDirection("right")}
            disabled={!canScrollRight}
            aria-label="Próximo produto"
            className={cn(
              "absolute top-[38%] right-0 z-10 translate-x-1/2 -translate-y-1/2",
              "hidden h-10 w-10 items-center justify-center rounded-full border border-store-charcoal/15 bg-store-cream text-store-charcoal transition-opacity sm:flex",
              !canScrollRight && "pointer-events-none opacity-30",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.slug}
            className="w-[min(85vw,320px)] shrink-0 snap-start sm:w-[calc((100%-3rem)/2)] lg:w-[calc((100%-4rem)/3)]"
          >
            <ProductCard
              name={product.name}
              slug={product.slug}
              priceInCents={product.priceInCents}
              imageUrl={product.imageUrl}
              imageAlt={product.imageAlt}
            />
          </div>
        ))}
      </div>

      {products.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {products.map((product, index) => (
            <button
              key={product.slug}
              type="button"
              aria-label={`Ir para ${product.name}`}
              onClick={() => scrollToIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex
                  ? "w-6 bg-store-charcoal"
                  : "w-1.5 bg-store-charcoal/25 hover:bg-store-charcoal/40",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
