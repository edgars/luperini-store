"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  SocialLinkIcon,
  socialThumbClass,
} from "@/components/store/social-link-thumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getSocialPlatformLabel,
  parseSocialVideoUrl,
  validateSocialVideoUrl,
  type SocialPlatform,
} from "@/lib/social-video-links";
import { cn } from "@/lib/utils";
import type { ProductSocialEmbed } from "@/types";

type SocialLinkDraft = {
  id?: string;
  url: string;
  platform: SocialPlatform;
  label: string;
};

type ProductSocialLinksFieldProps = {
  existingLinks?: ProductSocialEmbed[];
};

function toDraft(link: ProductSocialEmbed): SocialLinkDraft {
  const parsed = parseSocialVideoUrl(link.url);

  return {
    id: link.id,
    url: parsed?.url ?? link.url,
    platform: parsed?.platform ?? link.platform,
    label: parsed?.label ?? "Vídeo",
  };
}

function serializeLinks(links: { id?: string; url: string }[]) {
  return JSON.stringify(links.map(({ id, url }) => ({ id, url })));
}

export function ProductSocialLinksField({
  existingLinks = [],
}: ProductSocialLinksFieldProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [links, setLinks] = useState<SocialLinkDraft[]>(() =>
    existingLinks.map((link) => toDraft(link)),
  );
  const [draftUrl, setDraftUrl] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);

  useEffect(() => {
    setLinks(existingLinks.map((link) => toDraft(link)));
  }, [existingLinks]);

  const serializedLinks = useMemo(
    () => serializeLinks(links.map(({ id, url }) => ({ id, url }))),
    [links],
  );

  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = serializedLinks;
    }
  }, [serializedLinks]);

  function buildLinksForSubmit(currentLinks: SocialLinkDraft[], pendingDraft: string) {
    const result: { id?: string; url: string }[] = currentLinks.map(({ id, url }) => ({
      id,
      url,
    }));

    const trimmedDraft = pendingDraft.trim();
    if (!trimmedDraft) return result;

    const parsed = parseSocialVideoUrl(trimmedDraft);
    if (!parsed) return result;

    const alreadyListed = result.some(
      (link) => parseSocialVideoUrl(link.url)?.url === parsed.url,
    );

    if (!alreadyListed) {
      result.push({ url: parsed.url });
    }

    return result;
  }

  useEffect(() => {
    const hiddenInput = hiddenInputRef.current;
    if (!hiddenInput) return;

    const form = hiddenInput.closest("form");
    if (!form) return;

    const handleSubmit = () => {
      hiddenInput.value = serializeLinks(
        buildLinksForSubmit(links, draftUrl),
      );
    };

    form.addEventListener("submit", handleSubmit, { capture: true });
    return () => form.removeEventListener("submit", handleSubmit, { capture: true });
  }, [links, draftUrl]);

  function normalizeUrl(raw: string) {
    const parsed = parseSocialVideoUrl(raw);
    return parsed?.url ?? null;
  }

  function isDuplicate(url: string, skipIndex?: number) {
    const normalized = normalizeUrl(url);
    if (!normalized) return false;

    return links.some((link, index) => {
      if (skipIndex !== undefined && index === skipIndex) return false;
      return normalizeUrl(link.url) === normalized;
    });
  }

  function addLink() {
    const error = validateSocialVideoUrl(draftUrl);
    if (error) {
      setDraftError(error);
      return;
    }

    const parsed = parseSocialVideoUrl(draftUrl);
    if (!parsed) return;

    if (isDuplicate(parsed.url)) {
      setDraftError("Este link já foi adicionado.");
      return;
    }

    setLinks((current) => [
      ...current,
      {
        url: parsed.url,
        platform: parsed.platform,
        label: parsed.label,
      },
    ]);
    setDraftUrl("");
    setDraftError(null);
  }

  function updateLink(index: number, url: string) {
    setLinks((current) =>
      current.map((link, linkIndex) =>
        linkIndex === index ? { ...link, url } : link,
      ),
    );
  }

  function commitLinkEdit(index: number) {
    const link = links[index];
    if (!link) return;

    const error = validateSocialVideoUrl(link.url);
    if (error) {
      setDraftError(error);
      return;
    }

    const parsed = parseSocialVideoUrl(link.url);
    if (!parsed) return;

    if (isDuplicate(parsed.url, index)) {
      setDraftError("Este link já foi adicionado.");
      return;
    }

    setLinks((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              id: item.id,
              url: parsed.url,
              platform: parsed.platform,
              label: parsed.label,
            }
          : item,
      ),
    );
    setDraftError(null);
  }

  function removeLink(index: number) {
    setLinks((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setDraftError(null);
  }

  return (
    <div className="space-y-4 md:col-span-2">
      <input
        ref={hiddenInputRef}
        type="hidden"
        name="socialLinksJson"
        defaultValue={serializedLinks}
        readOnly
      />

      <div className="space-y-2">
        <Label htmlFor="socialDraftUrl">Instagram e TikTok</Label>
        <p className="text-xs text-muted-foreground">
          Cole o link, clique em <strong>Adicionar</strong> (ou salve direto — o
          link na caixa também entra). Aparecem como miniaturas abaixo da galeria
          na loja.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="socialDraftUrl"
            name="socialDraftUrl"
            value={draftUrl}
            placeholder="https://www.instagram.com/reel/..."
            onChange={(event) => {
              setDraftUrl(event.target.value);
              setDraftError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addLink();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addLink}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
        {draftError && <p className="text-sm text-destructive">{draftError}</p>}
      </div>

      {links.length > 0 ? (
        <div className="space-y-2">
          {links.map((link, index) => (
            <div
              key={link.id ?? `draft-${index}`}
              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                  socialThumbClass(link.platform),
                )}
              >
                <SocialLinkIcon platform={link.platform} className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {getSocialPlatformLabel(link.platform)} · {link.label}
                </p>
                <Input
                  value={link.url}
                  onChange={(event) => updateLink(index, event.target.value)}
                  onBlur={() => commitLinkEdit(index)}
                />
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => removeLink(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum link de Instagram ou TikTok ainda.
        </p>
      )}
    </div>
  );
}
