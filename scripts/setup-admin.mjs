#!/usr/bin/env node
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const email = process.env.INITIAL_ADMIN_EMAIL ?? "admin@luperini.com.br";
const password = process.env.INITIAL_ADMIN_PASSWORD ?? "Poli#123";

const headers = {
  apikey: secretKey,
  Authorization: `Bearer ${secretKey}`,
  "Content-Type": "application/json",
};

async function listUsers() {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers,
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.msg ?? "Falha ao listar usuários");
  return body.users ?? [];
}

const users = await listUsers();
const existing = users.find((user) => user.email === email);

if (existing) {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${existing.id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      password,
      email_confirm: true,
      app_metadata: { role: "admin" },
      user_metadata: { name: "Admin" },
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.msg ?? "Falha ao atualizar admin");
  console.log("Admin atualizado:", email);
} else {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Admin" },
      app_metadata: { role: "admin" },
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.msg ?? "Falha ao criar admin");
  console.log("Admin criado:", email);
}

const login = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: {
    apikey: publishableKey,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
});

const loginBody = await login.json();
console.log(
  login.ok ? "Login OK" : `Login falhou: ${loginBody.msg ?? loginBody.error_code}`,
);

if (login.ok) {
  const claims = JSON.parse(
    Buffer.from(loginBody.access_token.split(".")[1], "base64url").toString(),
  );
  console.log("Role no JWT:", claims.app_metadata?.role ?? "(sem role)");
}
