"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

interface StoreBackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function StoreBackButton({
  href,
  label = "Voltar",
  className,
}: StoreBackButtonProps) {
  const router = useRouter();

  const classes = cn(
    "inline-flex items-center gap-1.5 font-store-sans text-[11px] uppercase tracking-[0.18em] text-store-charcoal/70 transition-opacity hover:opacity-70",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        <ChevronLeft className="size-3.5" aria-hidden />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={classes}>
      <ChevronLeft className="size-3.5" aria-hidden />
      {label}
    </button>
  );
}
