# Luperini Store

E-commerce Next.js 15 + Supabase + Drizzle ORM.

## Desenvolvimento local

```bash
cp .env.example .env.local
# Preencha as variáveis (Supabase, DATABASE_URL, etc.)
npm install
npm run dev
```

Scripts úteis:

- `npm run dev:clean` — reinicia o dev server limpando `.next`
- `npm run setup:supabase` — configuração inicial do Supabase
- `npm run setup:admin` — cria usuário admin
- `npm run db:push` — sincroniza schema Drizzle com o banco

Documentação completa do projeto: [`CURSOR.md`](./CURSOR.md).

## Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new).
2. Framework detectado: **Next.js** (nenhuma configuração extra necessária).
3. Node.js: **20.11+** (definido em `.nvmrc` como 22).
4. Configure as variáveis de ambiente no painel da Vercel (Production e Preview):

| Variável | Obrigatória | Observação |
|----------|-------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sim | Chave publishable (`sb_publishable__...`) |
| `SUPABASE_SECRET_KEY` | Sim | Service role / secret key (server-only) |
| `DATABASE_URL` | Sim | **Pooler** Supabase porta **6543** (serverless) |
| `NEXT_PUBLIC_APP_URL` | Sim | URL de produção (ex.: `https://seu-app.vercel.app`) |
| `NEXT_PUBLIC_STORE_NAME` | Não | Nome exibido na loja |

5. No Supabase, adicione a URL de produção em **Authentication → URL Configuration**:
   - Site URL: `https://seu-app.vercel.app`
   - Redirect URLs: `https://seu-app.vercel.app/auth/callback`

6. Faça deploy — o build roda `npm run build` e gera páginas estáticas dos produtos ativos.

### Upload de imagens (admin)

Server Actions aceitam até **4 MB** (`experimental.serverActions.bodySizeLimit` em `next.config.ts`). A dependência `sharp` é empacotada via `serverExternalPackages`.

### Banco em produção

Use sempre a connection string do **Transaction pooler** (`:6543`), não a conexão direta (`db.*.supabase.co`), para evitar esgotamento de conexões nas funções serverless da Vercel.

## Estrutura

- `src/app/(store)/` — vitrine pública
- `src/app/(admin)/admin/` — painel administrativo
- `src/app/auth/` — login e cadastro
- `supabase/migrations/` — SQL (RLS, storage)
