"use client";

import { parseSocialVideoUrl } from "@/lib/social-video-links";
import { cn } from "@/lib/utils";

type SocialVideoEmbedProps = {
  url: string;
  title?: string;
  className?: string;
};

export function SocialVideoEmbed({ url, title, className }: SocialVideoEmbedProps) {
  const parsed = parseSocialVideoUrl(url);

  if (!parsed?.embedUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center">
        <p className="font-store-sans text-sm text-store-charcoal/60">
          Não foi possível carregar o vídeo aqui. Use o botão abaixo para abrir
          no app.
        </p>
      </div>
    );
  }

  return (
    <iframe
      src={parsed.embedUrl}
      title={title ?? "Vídeo"}
      className={cn("h-full w-full border-0", className)}
      loading="lazy"
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
