#!/usr/bin/env node
/**
 * Configura Supabase remoto: schema Drizzle, migrations SQL e usuário admin inicial.
 *
 * Requer no .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY
 * - DATABASE_URL
 * - INITIAL_ADMIN_EMAIL (opcional, default: admin@luperini.com.br)
 * - INITIAL_ADMIN_PASSWORD (opcional)
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

config({ path: path.join(root, ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;
const adminEmail =
  process.env.INITIAL_ADMIN_EMAIL ?? "admin@luperini.com.br";
const adminPassword = process.env.INITIAL_ADMIN_PASSWORD ?? "Poli#123";

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

if (!supabaseUrl) fail("NEXT_PUBLIC_SUPABASE_URL não configurada.");
if (!secretKey) {
  fail(
    "SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY não configurada.\n" +
      "   Dashboard → Settings → API Keys → Secret keys",
  );
}
if (!databaseUrl) {
  fail(
    "DATABASE_URL não configurada.\n" +
      "   Dashboard → Connect → Transaction pooler (porta 6543)",
  );
}

console.log("→ Aplicando schema Drizzle (db:push)...");
execSync("npm run db:push", { cwd: root, stdio: "inherit" });

const migrationsDir = path.join(root, "supabase/migrations");
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

console.log("\n→ Executando migrations SQL...");
const sql = postgres(databaseUrl, { prepare: false, max: 1 });

for (const file of migrationFiles) {
  const content = fs.readFileSync(path.join(migrationsDir, file), "utf8");
  console.log(`   • ${file}`);
  await sql.unsafe(content);
}

await sql.end();

console.log("\n→ Configurando usuário admin...");
execSync("node scripts/setup-admin.mjs", { cwd: root, stdio: "inherit" });

console.log("\n✅ Supabase configurado com sucesso.");
console.log(`   Login admin: ${adminEmail}`);
console.log("   Acesse: http://localhost:3000/auth/login");
