import Image from "next/image";

import {
  buildTypographyPreviewCss,
  type TypographySettingsValue,
} from "@/lib/store/typography-config";
import { cn } from "@/lib/utils";

type TypographyPreviewProps = {
  settings: TypographySettingsValue;
  className?: string;
  size?: "default" | "large";
};

export function TypographyPreview({
  settings,
  className,
  size = "default",
}: TypographyPreviewProps) {
  const css = buildTypographyPreviewCss(settings);
  const large = size === "large";

  return (
    <div
      className={cn(
        "typography-preview store-theme overflow-hidden bg-store-cream text-store-charcoal",
        className,
      )}
    >
      <style
        data-typography-preview
        dangerouslySetInnerHTML={{ __html: css }}
      />

      <header
        className={cn(
          "border-b border-store-charcoal/10 bg-store-cream",
          large ? "px-8 py-6" : "px-4 py-4",
        )}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Image
            src="/logo-preta.svg"
            alt="Luperini"
            width={488}
            height={208}
            className={cn("w-auto", large ? "h-10 sm:h-12" : "h-7")}
          />
          <span
            className={cn(
              "font-store-sans uppercase tracking-[0.16em] text-store-charcoal/70",
              large ? "text-[11px]" : "text-[9px]",
            )}
          >
            Sacola
          </span>
        </div>
        <nav
          aria-label="Pré-visualização do menu"
          className={cn(
            "mx-auto flex max-w-5xl gap-4 overflow-x-auto",
            large ? "mt-5 gap-6" : "mt-3",
          )}
        >
          {["Novidades", "Roupas", "Acessórios"].map((label) => (
            <span
              key={label}
              className={cn(
                "shrink-0 font-store-sans uppercase tracking-[0.16em] text-store-charcoal",
                large ? "text-[11px]" : "text-[9px]",
              )}
            >
              {label}
            </span>
          ))}
        </nav>
      </header>

      <section className={cn(large ? "px-8 py-10" : "px-4 py-6")}>
        <div className="mx-auto max-w-5xl">
          <p
            className={cn(
              "font-store-sans uppercase tracking-[0.18em] text-store-charcoal/45",
              large ? "text-[11px]" : "text-[9px]",
            )}
          >
            Nova coleção
          </p>
          <h1
            className={cn(
              "mt-3 font-store-serif leading-tight text-store-charcoal",
              large ? "text-5xl sm:text-6xl" : "text-3xl",
            )}
          >
            Moda atemporal
            <span className="mt-1 block font-store-serif italic text-store-gold">
              com elegância
            </span>
          </h1>
          <h2
            className={cn(
              "mt-6 font-store-serif text-store-charcoal",
              large ? "text-3xl" : "text-xl",
            )}
          >
            Destaques da semana
          </h2>
          <h3
            className={cn(
              "mt-4 font-store-serif text-store-charcoal",
              large ? "text-2xl" : "text-lg",
            )}
          >
            Casaco Rafaella
          </h3>
          <p
            className={cn(
              "mt-3 max-w-xl font-store-sans leading-relaxed text-store-charcoal/65",
              large ? "text-base leading-7" : "text-[11px]",
            )}
          >
            Parágrafo de exemplo com o estilo escolhido para textos, descrições
            de produto e labels da loja.
          </p>
          <div className={cn("mt-5 flex flex-wrap gap-3", large && "mt-8 gap-4")}>
            <span
              className={cn(
                "inline-block bg-store-charcoal font-store-sans uppercase tracking-[0.18em] text-white",
                large ? "px-7 py-3.5 text-[10px]" : "px-5 py-2.5 text-[8px]",
              )}
            >
              Ver coleção
            </span>
            <span
              className={cn(
                "inline-block border border-store-charcoal font-store-sans uppercase tracking-[0.18em] text-store-charcoal",
                large ? "px-7 py-3.5 text-[10px]" : "px-5 py-2.5 text-[8px]",
              )}
            >
              Saiba mais
            </span>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "border-t border-store-charcoal/10",
          large ? "px-8 py-8" : "px-4 py-5",
        )}
      >
        <div className="mx-auto max-w-5xl">
          <p
            className={cn(
              "font-store-sans uppercase tracking-[0.16em] text-store-charcoal/45",
              large ? "text-[11px]" : "text-[9px]",
            )}
          >
            Card de produto
          </p>
          <div className="mt-3 flex gap-3">
            <div
              className={cn(
                "relative shrink-0 overflow-hidden rounded-md bg-store-beige/60",
                large ? "h-28 w-24" : "h-20 w-16",
              )}
            >
              <Image
                src="/logo-preta.svg"
                alt=""
                width={96}
                height={112}
                className="h-full w-full object-contain p-2 opacity-20"
              />
            </div>
            <div>
              <p
                className={cn(
                  "font-store-sans text-store-charcoal",
                  large ? "text-base" : "text-sm",
                )}
              >
                Blusa verde
              </p>
              <p
                className={cn(
                  "mt-1 font-store-sans text-store-charcoal/50",
                  large ? "text-base" : "text-sm",
                )}
              >
                R$ 189,00
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
