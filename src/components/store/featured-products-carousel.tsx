"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProductCard } from "@/components/store/product-card";
import type { StoreProductCard } from "@/lib/store/get-featured-products";
import { cn } from "@/lib/utils";

/** Pixels per second — continuous left scroll speed */
const SCROLL_SPEED_PX_PER_SEC = 80;

type FeaturedProductsCarouselProps = {
  products: StoreProductCard[];
};

function CarouselSlide({
  product,
  className,
  onImageHoverStart,
  onImageHoverEnd,
}: {
  product: StoreProductCard;
  className: string;
  onImageHoverStart: () => void;
  onImageHoverEnd: () => void;
}) {
  return (
    <div className={className}>
      <ProductCard
        name={product.name}
        slug={product.slug}
        priceInCents={product.priceInCents}
        imageUrl={product.imageUrl}
        imageAlt={product.imageAlt}
        images={product.images}
        imageHoverZoom
        onImageHoverStart={onImageHoverStart}
        onImageHoverEnd={onImageHoverEnd}
      />
    </div>
  );
}

export function FeaturedProductsCarousel({
  products,
}: FeaturedProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const loopWidthRef = useRef(0);
  const isPausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const loopProducts = useMemo(
    () => (products.length > 1 ? [...products, ...products] : products),
    [products],
  );

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || products.length <= 1) return;

    const measureLoop = () => {
      loopWidthRef.current = element.scrollWidth / 2;
    };

    measureLoop();

    const resizeObserver = new ResizeObserver(measureLoop);
    resizeObserver.observe(element);
    window.addEventListener("resize", measureLoop);

    let animationId = 0;
    let lastTime: number | null = null;

    const tick = (time: number) => {
      if (lastTime === null) lastTime = time;
      const deltaSeconds = (time - lastTime) / 1000;
      lastTime = time;

      if (!isPausedRef.current && loopWidthRef.current > 0) {
        element.scrollLeft += SCROLL_SPEED_PX_PER_SEC * deltaSeconds;

        if (element.scrollLeft >= loopWidthRef.current) {
          element.scrollLeft -= loopWidthRef.current;
        }

        const slideWidth =
          (element.children[0] as HTMLElement | undefined)?.offsetWidth ?? 1;
        const gap = 24;
        const index =
          Math.round(element.scrollLeft / (slideWidth + gap)) % products.length;
        setActiveIndex(index);
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureLoop);
    };
  }, [products]);

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

  const pauseHandlers = {
    onImageHoverStart: () => setIsPaused(true),
    onImageHoverEnd: () => setIsPaused(false),
  };

  const slideClassName =
    "w-[min(85vw,320px)] shrink-0 sm:w-[calc((100%-3rem)/2)] lg:w-[calc((100%-4rem)/3)]";

  if (products.length === 0) return null;

  return (
    <div className="relative">
      {products.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollByDirection("left")}
            aria-label="Produto anterior"
            className={cn(
              "absolute top-[38%] left-0 z-10 -translate-x-1/2 -translate-y-1/2",
              "hidden h-10 w-10 items-center justify-center rounded-full border border-store-charcoal/15 bg-store-cream text-store-charcoal transition-opacity hover:opacity-80 sm:flex",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDirection("right")}
            aria-label="Próximo produto"
            className={cn(
              "absolute top-[38%] right-0 z-10 translate-x-1/2 -translate-y-1/2",
              "hidden h-10 w-10 items-center justify-center rounded-full border border-store-charcoal/15 bg-store-cream text-store-charcoal transition-opacity hover:opacity-80 sm:flex",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-scroll pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loopProducts.map((product, index) => (
          <CarouselSlide
            key={`${product.slug}-${index}`}
            product={product}
            className={slideClassName}
            {...pauseHandlers}
          />
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
                "h-1.5 rounded-full transition-all duration-500",
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
