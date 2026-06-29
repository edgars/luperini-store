"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminBackButtonProps {
  href?: string;
  label?: string;
}

export function AdminBackButton({
  href,
  label = "Voltar",
}: AdminBackButtonProps) {
  const router = useRouter();

  const classes = cn(
    buttonVariants({ variant: "ghost", size: "sm" }),
    "-ml-2 h-8 gap-1 px-2",
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        <ChevronLeft className="size-4" aria-hidden />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={() => router.back()}>
      <ChevronLeft className="size-4" aria-hidden />
      {label}
    </button>
  );
}
