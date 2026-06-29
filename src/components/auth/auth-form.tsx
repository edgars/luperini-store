"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/types";

type AuthFormProps = {
  action: (
    prevState: ActionResult,
    formData: FormData,
  ) => Promise<ActionResult>;
  submitLabel: string;
  redirect?: string;
  showPassword?: boolean;
  children?: React.ReactNode;
};

const initialState: ActionResult = { success: false, error: "" };

export function AuthForm({
  action,
  submitLabel,
  showPassword = true,
  children,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {children}

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      {showPassword && (
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            minLength={6}
          />
        </div>
      )}

      {state.success === false && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {state.success === true && (
        <p className="text-sm text-muted-foreground">
          Link enviado! Verifique seu e-mail.
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Aguarde..." : submitLabel}
      </Button>
    </form>
  );
}
