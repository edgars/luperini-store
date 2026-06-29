"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import {
  SocialLinkIcon,
  socialThumbClass,
} from "@/components/store/social-link-thumb";
import { SocialVideoEmbed } from "@/components/store/social-video-embed";
import { StripePlaceholder } from "@/components/store/stripe-placeholder";
import {
  getSocialOpenLabel,
  getSocialPlatformLabel,
  parseSocialVideoUrl,
} from "@/lib/social-video-links";
import type {
  StoreProductImage,
  StoreProductSocialEmbed,
} from "@/lib/store/get-product-by-slug";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: StoreProductImage[];
  socialEmbeds?: StoreProductSocialEmbed[];
  productName: string;
};

type SocialItem = {
  id: string;
  url: string;
  platform: StoreProductSocialEmbed["platform"];
  label: string;
};

type ActiveView =
  | { kind: "image"; index: number }
  | { kind: "social"; index: number };

const ZOOM_FACTOR = 2.5;

export function ProductGallery({
  images,
  socialEmbeds = [],
  productName,
}: ProductGalleryProps) {
  const socialItems = useMemo<SocialItem[]>(
    () =>
      socialEmbeds.map((embed) => {
        const parsed = parseSocialVideoUrl(embed.url);

        return {
          id: embed.id,
          url: parsed?.url ?? embed.url,
          platform: parsed?.platform ?? embed.platform,
          label: parsed?.label ?? "Vídeo",
        };
      }),
    [socialEmbeds],
  );

  const [activeView, setActiveView] = useState<ActiveView>(() =>
    images.length > 0
      ? { kind: "image", index: 0 }
      : socialEmbeds.length > 0
        ? { kind: "social", index: 0 }
        : { kind: "image", index: 0 },
  );
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const activeImage =
    activeView.kind === "image" ? (images[activeView.index] ?? images[0]) : null;
  const activeSocial =
    activeView.kind === "social"
      ? (socialItems[activeView.index] ?? socialItems[0])
      : null;
  const activeSocialLink = activeSocial
    ? parseSocialVideoUrl(activeSocial.url)
    : null;

  const hasMultipleImages = images.length > 1;
  const zoomSource = activeImage?.originalUrl ?? activeImage?.url;

  const goToImage = useCallback(
    (direction: "prev" | "next") => {
      if (!hasMultipleImages) return;

      setActiveView((current) => {
        if (current.kind !== "image") return current;

        const nextIndex =
          direction === "prev"
            ? current.index === 0
              ? images.length - 1
              : current.index - 1
            : current.index === images.length - 1
              ? 0
              : current.index + 1;

        return { kind: "image", index: nextIndex };
      });
      setIsZooming(false);
    },
    [hasMultipleImages, images.length],
  );

  function selectImage(index: number) {
    setActiveView({ kind: "image", index });
    setIsZooming(false);
  }

  function selectSocial(index: number) {
    setActiveView({ kind: "social", index });
    setIsZooming(false);
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!zoomSource || activeView.kind !== "image") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  }

  const showingSocial = activeView.kind === "social" && activeSocial;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-2xl bg-store-charcoal/5",
            showingSocial ? "aspect-[4/5] min-h-[520px]" : "aspect-[3/4]",
          )}
          onMouseEnter={() => {
            if (activeView.kind === "image") setIsZooming(true);
          }}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
        >
          {showingSocial ? (
            <>
              <SocialVideoEmbed
                url={activeSocial.url}
                title={`${activeSocial.label} — ${productName}`}
              />
              <a
                href={activeSocial.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-center gap-2 rounded-full bg-store-charcoal/80 px-4 py-2 font-store-sans text-[11px] uppercase tracking-[0.16em] text-white transition-opacity hover:bg-store-charcoal"
              >
                <SocialLinkIcon
                  platform={activeSocial.platform}
                  className="h-3.5 w-3.5"
                />
                {activeSocialLink
                  ? getSocialOpenLabel(activeSocialLink)
                  : "Abrir link"}
              </a>
            </>
          ) : activeImage ? (
            <>
              <Image
                src={activeImage.url}
                alt={activeImage.alt ?? productName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={cn(
                  "object-cover object-center transition-opacity duration-200",
                  isZooming ? "opacity-0" : "opacity-100",
                )}
              />

              {isZooming && zoomSource && (
                <div
                  className="absolute inset-0 bg-no-repeat"
                  style={{
                    backgroundImage: `url(${zoomSource})`,
                    backgroundSize: `${ZOOM_FACTOR * 100}%`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                  aria-hidden
                />
              )}

              {isZooming && (
                <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
                  <span className="rounded-full bg-store-charcoal/70 px-3 py-1 font-store-sans text-[10px] uppercase tracking-[0.18em] text-white">
                    Detalhe ampliado
                  </span>
                </div>
              )}
            </>
          ) : (
            <StripePlaceholder className="h-full w-full rounded-2xl">
              <span className="absolute inset-0 flex items-center justify-center font-store-sans text-[10px] uppercase tracking-[0.22em] text-store-charcoal/35">
                Sem imagem
              </span>
            </StripePlaceholder>
          )}
        </div>

        {activeView.kind === "image" && hasMultipleImages && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => goToImage("prev")}
              className="absolute top-1/2 left-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-store-charcoal/15 bg-store-cream/95 text-store-charcoal transition-opacity hover:opacity-80"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              onClick={() => goToImage("next")}
              className="absolute top-1/2 right-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-store-charcoal/15 bg-store-cream/95 text-store-charcoal transition-opacity hover:opacity-80"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => selectImage(index)}
              aria-label={`Foto ${index + 1}`}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border transition-opacity",
                activeView.kind === "image" && activeView.index === index
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

      {socialItems.length > 0 && (
        <div className="space-y-3 border-t border-store-charcoal/10 pt-4">
          <p className="font-store-sans text-[11px] uppercase tracking-[0.22em] text-store-charcoal/45">
            Redes sociais
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {socialItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectSocial(index)}
                aria-label={`${getSocialPlatformLabel(item.platform)} — ${item.label}`}
                className={cn(
                  "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border transition-opacity",
                  activeView.kind === "social" && activeView.index === index
                    ? "border-store-charcoal"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <div
                  className={cn(
                    "flex h-full w-full flex-col items-center justify-center px-1",
                    socialThumbClass(item.platform),
                  )}
                >
                  <SocialLinkIcon platform={item.platform} className="h-4 w-4" />
                  <span className="mt-1 text-center font-store-sans text-[9px] uppercase tracking-[0.12em]">
                    {getSocialPlatformLabel(item.platform)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
