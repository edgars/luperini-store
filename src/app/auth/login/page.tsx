import Link from "next/link";

import { loginAction, signInWithGoogleAction, signInWithMagicLinkAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Luperini Store";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Entrar na {storeName}</CardTitle>
          <CardDescription>
            Acesse sua conta ou use um link mágico por e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {params.message === "check-email" && (
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              Verifique seu e-mail para confirmar o cadastro.
            </p>
          )}

          {params.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Não foi possível autenticar. Tente novamente.
            </p>
          )}

          <AuthForm
            action={loginAction}
            submitLabel="Entrar"
            redirect={params.redirect}
          >
            <input type="hidden" name="redirect" value={params.redirect ?? ""} />
          </AuthForm>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <form action={signInWithGoogleAction}>
            <Button type="submit" variant="outline" className="w-full">
              Continuar com Google
            </Button>
          </form>

          <AuthForm
            action={signInWithMagicLinkAction}
            submitLabel="Enviar link mágico"
            showPassword={false}
          />

          <p className="text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link href="/auth/cadastro" className="font-medium text-foreground underline-offset-4 hover:underline">
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
