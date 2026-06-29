import Link from "next/link";

import { signUpAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Luperini Store";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Cadastre-se na {storeName}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AuthForm action={signUpAction} submitLabel="Criar conta">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
          </AuthForm>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/auth/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
