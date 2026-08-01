"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { HeroSlide } from "@/lib/store/home-config";
import { cn } from "@/lib/utils";

const AUTOPLAY_INTERVAL_MS = 6000;

type HeroSliderProps = {
  slides: HeroSlide[];
  preview?: boolean;
  compact?: boolean;
  autoplay?: boolean;
};

export function HeroSlider({
  slides,
  preview = false,
  compact = false,
  autoplay = true,
}: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const isHoveredRef = useRef(false);

  const total = slides.length;

  const goTo = useCallback(
    (nextIndex: number) => {
      if (total === 0) return;
      const normalized = ((nextIndex % total) + total) % total;
      setIndex(normalized);
    },
    [total],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!autoplay || total <= 1) return;

    const timer = window.setInterval(() => {
      if (isHoveredRef.current) return;
      setIndex((current) => (current + 1) % total);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [autoplay, total]);

  if (total === 0) return null;

  const heightClasses = compact
    ? "h-[240px] sm:h-[320px]"
    : "h-[420px] sm:h-[520px] lg:h-[620px] xl:h-[680px]";

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-store-charcoal",
        heightClasses,
      )}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      aria-roledescription="carousel"
      aria-label="Hero"
    >
      {slides.map((slide, slideIndex) => {
        const isActive = slideIndex === index;
        const hasCta = Boolean(slide.ctaLabel && slide.ctaHref);
        const ctaClassName = cn(
          "inline-block bg-white/95 text-store-charcoal transition-opacity hover:opacity-85",
          compact
            ? "mt-3 px-4 py-2 font-store-sans text-[9px] uppercase tracking-[0.18em]"
            : "mt-6 px-7 py-3.5 font-store-sans text-[11px] uppercase tracking-[0.2em]",
        );

        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              isActive ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.title || `Slide ${slideIndex + 1}`}
              fill
              priority={slideIndex === 0}
              unoptimized={slide.imageUrl.startsWith("blob:")}
              sizes="100vw"
              className="object-cover object-center"
            />

            {(slide.title || slide.subtitle || hasCta) && (
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/40" />
            )}

            {(slide.title || slide.subtitle || hasCta) && (
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 flex flex-col items-center px-4 text-center text-white",
                  compact ? "pb-6" : "pb-12 sm:pb-16 lg:pb-20",
                )}
              >
                {slide.title && (
                  <h2
                    className={cn(
                      "font-store-serif leading-[0.95] drop-shadow-md",
                      compact
                        ? "text-3xl"
                        : "text-5xl sm:text-6xl lg:text-7xl xl:text-8xl",
                    )}
                  >
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p
                    className={cn(
                      "font-store-sans uppercase tracking-[0.22em] drop-shadow",
                      compact
                        ? "mt-2 text-[10px]"
                        : "mt-4 text-xs sm:text-sm",
                    )}
                  >
                    {slide.subtitle}
                  </p>
                )}
                {hasCta ? (
                  preview ? (
                    <span className={cn(ctaClassName, "cursor-default")}>
                      {slide.ctaLabel}
                    </span>
                  ) : (
                    <Link href={slide.ctaHref} className={ctaClassName}>
                      {slide.ctaLabel}
                    </Link>
                  )
                ) : null}
              </div>
            )}
          </div>
        );
      })}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Slide anterior"
            className={cn(
              "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/70 text-store-charcoal transition-opacity hover:bg-white",
              compact
                ? "left-2 h-7 w-7"
                : "left-4 h-10 w-10 sm:left-6 sm:h-12 sm:w-12",
              "flex items-center justify-center",
            )}
          >
            <ChevronLeft className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Próximo slide"
            className={cn(
              "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/70 text-store-charcoal transition-opacity hover:bg-white",
              compact
                ? "right-2 h-7 w-7"
                : "right-4 h-10 w-10 sm:right-6 sm:h-12 sm:w-12",
              "flex items-center justify-center",
            )}
          >
            <ChevronRight className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
          </button>

          <div
            className={cn(
              "absolute inset-x-0 z-10 flex justify-center gap-2",
              compact ? "bottom-2" : "bottom-4 sm:bottom-6",
            )}
          >
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ir para slide ${slideIndex + 1}`}
                onClick={() => goTo(slideIndex)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  slideIndex === index
                    ? compact
                      ? "w-4 bg-white"
                      : "w-6 bg-white"
                    : "w-1.5 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
