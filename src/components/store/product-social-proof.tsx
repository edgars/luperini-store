"use client";

import { useEffect, useRef, useState } from "react";

import {
  advanceProductViewerState,
  getProductViewerSeedCount,
  productViewerStorageKey,
  readProductViewerState,
  writeProductViewerState,
  type ProductViewerState,
} from "@/lib/store/product-live-viewers";

type ProductSocialProofProps = {
  productSlug: string;
  fakeOrderCount: number;
};

function LiveIndicator() {
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}

function useProductLiveViewers(slug: string) {
  const [liveViewers, setLiveViewers] = useState(() =>
    getProductViewerSeedCount(slug),
  );
  const stateRef = useRef<ProductViewerState | null>(null);

  useEffect(() => {
    const initial = readProductViewerState(slug);
    writeProductViewerState(slug, initial);
    stateRef.current = initial;
    setLiveViewers(initial.count);

    const intervalId = window.setInterval(() => {
      if (!stateRef.current) {
        return;
      }

      const next = advanceProductViewerState(slug, stateRef.current);
      stateRef.current = next;
      setLiveViewers(next.count);
    }, 5_000);

    function handleStorage(event: StorageEvent) {
      if (event.key !== productViewerStorageKey(slug) || !event.newValue) {
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue) as ProductViewerState;
        if (typeof parsed.count !== "number") {
          return;
        }

        stateRef.current = parsed;
        setLiveViewers(parsed.count);
      } catch {
        // ignore corrupted storage
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", handleStorage);
    };
  }, [slug]);

  return liveViewers;
}

export function ProductSocialProof({
  productSlug,
  fakeOrderCount,
}: ProductSocialProofProps) {
  const liveViewers = useProductLiveViewers(productSlug);
  const viewerLabel =
    liveViewers === 1
      ? "1 pessoa está vendo este produto agora"
      : `${liveViewers} pessoas estão vendo este produto agora`;

  return (
    <div className="space-y-2 border-t border-store-charcoal/10 pt-5">
      <div className="flex items-center gap-2.5">
        <LiveIndicator />
        <p className="font-store-sans text-sm text-store-charcoal/75">
          {viewerLabel}
        </p>
      </div>
      {fakeOrderCount > 0 && (
        <p className="font-store-sans text-sm text-store-charcoal/60">
          {fakeOrderCount}{" "}
          {fakeOrderCount === 1
            ? "pessoa já comprou este produto"
            : "pessoas já compraram este produto"}
        </p>
      )}
    </div>
  );
}
