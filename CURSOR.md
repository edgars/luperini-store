# Contexto do projeto — E-commerce

## Visão geral

Estamos construindo um **e-commerce de produtos físicos** com painel administrativo simples, projetado para ser operado por pessoas sem perfil técnico. O sistema tem duas faces: a **loja pública** (vitrine responsiva para compradores) e o **painel admin** (gestão completa do negócio).

O objetivo é entregar um MVP funcional e depois evoluir incrementalmente. Nenhuma feature deve ser over-engineered — prefira sempre a solução mais simples que resolve o problema.

---

## Stack técnica

| Camada | Tecnologia | Observações |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR/SSG para vitrine, Server Actions para admin |
| Linguagem | TypeScript (strict mode) | Sem `any` — use tipos explícitos |
| Banco de dados | Supabase (Postgres) | RLS habilitado em todas as tabelas |
| Auth | Supabase Auth | OAuth Google + magic link + e-mail/senha |
| Storage de imagens | Supabase Storage | Bucket `product-images`, policies por role |
| ORM | Drizzle ORM | Schema em `src/db/schema.ts` |
| UI components | shadcn/ui | Tema customizado em `src/components/ui/` |
| Estilização | Tailwind CSS v4 | Mobile-first, breakpoints: sm/md/lg/xl |
| E-mail transacional | Resend | Templates React Email em `src/emails/` |
| Pagamentos | Mercado Pago (principal) + Stripe (opcional) | Webhooks em `/api/webhooks/` |
| CEP / endereços | ViaCEP (gratuito) | `https://viacep.com.br/ws/{cep}/json/` |
| Frete | Melhor Envio (V2) | MVP usa frete fixo/grátis configurável |
| Deploy | Vercel | Edge Runtime para rotas de vitrine |
| Variáveis de ambiente | `.env.local` (local), Vercel env (prod) | Nunca commitar secrets |

---

## Estrutura de diretórios

```
src/
├── app/
│   ├── (store)/              # Grupo de rotas da loja pública
│   │   ├── layout.tsx        # Layout com header/footer da loja
│   │   ├── page.tsx          # Home / vitrine
│   │   ├── produtos/
│   │   │   ├── page.tsx      # Listagem com filtros
│   │   │   └── [slug]/
│   │   │       └── page.tsx  # Página do produto
│   │   ├── carrinho/
│   │   │   └── page.tsx
│   │   └── checkout/
│   │       └── page.tsx
│   │
│   ├── (admin)/              # Grupo de rotas do painel admin
│   │   ├── layout.tsx        # Layout com sidebar de navegação admin
│   │   ├── admin/
│   │   │   ├── page.tsx      # Dashboard / visão geral
│   │   │   ├── produtos/
│   │   │   │   ├── page.tsx          # Lista de produtos
│   │   │   │   ├── novo/page.tsx     # Criar produto
│   │   │   │   └── [id]/page.tsx     # Editar produto
│   │   │   ├── pedidos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── clientes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── envios/
│   │   │   │   └── page.tsx
│   │   │   ├── tickets/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── financeiro/
│   │   │   │   └── page.tsx
│   │   │   └── configuracoes/
│   │   │       └── page.tsx
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── mercadopago/route.ts
│   │   │   └── stripe/route.ts
│   │   └── cep/
│   │       └── [cep]/route.ts        # Proxy para ViaCEP
│   │
│   └── auth/
│       ├── login/page.tsx
│       ├── cadastro/page.tsx
│       └── callback/route.ts         # OAuth callback Supabase
│
├── components/
│   ├── ui/                   # shadcn/ui components customizados
│   ├── store/                # Componentes da loja (ProductCard, Cart, etc.)
│   └── admin/                # Componentes do admin (DataTable, StatsCard, etc.)
│
├── db/
│   ├── schema.ts             # Schema Drizzle (fonte da verdade)
│   ├── index.ts              # Client Drizzle + Supabase
│   └── migrations/           # Gerado por drizzle-kit
│
├── emails/                   # Templates React Email
│   ├── order-confirmed.tsx
│   ├── order-shipped.tsx
│   ├── ticket-reply.tsx
│   └── welcome.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # createBrowserClient
│   │   └── server.ts         # createServerClient (cookies)
│   ├── mercadopago.ts
│   ├── resend.ts
│   ├── viacep.ts
│   └── utils.ts              # cn(), formatCurrency(), formatDate()
│
├── hooks/                    # React hooks customizados
│   ├── use-cart.ts
│   └── use-cep.ts
│
└── types/
    └── index.ts              # Tipos globais (inferidos do schema Drizzle)
```

---

## Schema do banco de dados

O schema completo está em `src/db/schema.ts`. As tabelas principais são:

### Tabelas

**`users`** — Clientes da loja (vinculados ao Supabase Auth)
- `id` (uuid, FK → auth.users)
- `name`, `email`, `phone`
- `created_at`, `updated_at`

**`addresses`** — Endereços dos clientes
- `id`, `user_id` (FK)
- `label` (ex: "Casa", "Trabalho")
- `zip_code`, `street`, `number`, `complement`, `neighborhood`, `city`, `state`
- `is_default` (boolean)

**`categories`** — Categorias de produtos
- `id`, `name`, `slug`, `description`, `image_url`
- `parent_id` (FK self-ref — subcategorias)

**`products`** — Produtos
- `id`, `name`, `slug`, `description`
- `category_id` (FK)
- `cost_price` (em centavos), `sale_price` (em centavos)
- `margin` (calculado: `((sale_price - cost_price) / sale_price) * 100`)
- `sku`, `barcode`
- `status` (enum: `active` | `inactive` | `draft`)
- `created_at`, `updated_at`

**`product_variants`** — Variantes (tamanho, cor, etc.)
- `id`, `product_id` (FK)
- `name` (ex: "P / Azul")
- `sku`, `cost_price`, `sale_price`, `stock`
- `attributes` (jsonb — `{ "tamanho": "P", "cor": "Azul" }`)

**`product_images`** — Imagens dos produtos
- `id`, `product_id` (FK)
- `url`, `alt`, `position` (ordem na galeria)
- `type` (enum: `cover` | `gallery` | `thumbnail`)
- `width`, `height` (px da imagem original)

**`orders`** — Pedidos
- `id`, `order_number` (string legível, ex: "PED-2024-0001")
- `user_id` (FK, nullable — guest checkout)
- `guest_email`, `guest_name` (para guest checkout)
- `status` (enum: `pending_payment` | `paid` | `preparing` | `shipped` | `delivered` | `cancelled` | `refunded`)
- `subtotal`, `discount`, `shipping_cost`, `total` (em centavos)
- `coupon_id` (FK, nullable)
- `shipping_address` (jsonb — snapshot do endereço no momento da compra)
- `notes_internal`, `notes_customer`
- `paid_at`, `created_at`, `updated_at`

**`order_items`** — Itens do pedido
- `id`, `order_id` (FK), `product_id` (FK), `variant_id` (FK, nullable)
- `product_name`, `variant_name` (snapshot)
- `unit_price`, `cost_price`, `quantity`, `total`

**`payments`** — Pagamentos
- `id`, `order_id` (FK)
- `provider` (enum: `mercadopago` | `stripe`)
- `provider_payment_id` (ID externo)
- `method` (enum: `pix` | `credit_card` | `debit_card` | `boleto`)
- `status` (enum: `pending` | `approved` | `rejected` | `refunded`)
- `amount`, `installments`
- `pix_qr_code`, `pix_qr_code_text` (para Pix)
- `boleto_url`, `boleto_due_date`
- `paid_at`, `created_at`

**`shipments`** — Envios
- `id`, `order_id` (FK)
- `carrier` (ex: "Correios", "Jadlog")
- `service` (ex: "PAC", "SEDEX")
- `tracking_code`
- `status` (enum: `pending` | `posted` | `in_transit` | `delivered` | `returned`)
- `shipped_at`, `delivered_at`, `estimated_delivery`
- `label_url` (URL da etiqueta, se houver)

**`tickets`** — Tickets de suporte
- `id`, `ticket_number`
- `order_id` (FK, nullable)
- `user_id` (FK, nullable)
- `guest_email` (para clientes sem conta)
- `subject`, `status` (enum: `open` | `in_progress` | `resolved` | `closed`)
- `priority` (enum: `low` | `normal` | `high`)
- `created_at`, `updated_at`, `resolved_at`

**`ticket_messages`** — Mensagens dos tickets
- `id`, `ticket_id` (FK)
- `sender_type` (enum: `customer` | `admin`)
- `sender_id` (FK, nullable)
- `content` (text)
- `created_at`

**`coupons`** — Cupons de desconto (V2)
- `id`, `code` (único)
- `type` (enum: `percentage` | `fixed`)
- `value` (em centavos ou percentual)
- `min_order_value` (em centavos, nullable)
- `max_uses`, `used_count`
- `valid_from`, `valid_until`
- `is_active`

**`audit_log`** — Log de auditoria
- `id`, `table_name`, `record_id`
- `action` (enum: `insert` | `update` | `delete`)
- `old_values`, `new_values` (jsonb)
- `user_id` (quem fez a ação)
- `created_at`

> **Importante:** Todos os valores monetários são armazenados em **centavos** (inteiros). Use a função `formatCurrency()` em `src/lib/utils.ts` para exibição.

---

## Regras de negócio críticas

### Preços e margens
- Sempre armazenar preços em centavos (inteiro) — nunca float
- Margem bruta = `((sale_price - cost_price) / sale_price) * 100`
- Exibir margem em tempo real enquanto o admin edita os preços
- Alertar visualmente se margem < 20% (configurável em settings)

### Estoque
- Baixa de estoque ocorre ao confirmar pagamento (status → `paid`), não ao criar pedido
- Devolução de estoque automática ao cancelar pedido
- Estoque mínimo configurável por variante — alerta no dashboard quando atingir

### Imagens de produtos
- Resolução recomendada por tipo:
  - `cover`: 800×800px (quadrado, obrigatório)
  - `gallery`: 1200×800px (landscape)
  - `thumbnail`: 400×400px (quadrado)
- Ao fazer upload, validar proporção e mostrar aviso se fora do ideal
- Converter automaticamente para WebP antes de salvar no Storage
- Nomear arquivos: `{product_id}/{type}-{timestamp}.webp`

### Guest checkout
- Não exigir cadastro para comprar
- Coletar apenas: nome, e-mail, telefone, endereço
- Criar conta automaticamente após compra com magic link por e-mail
- Vincular histórico de compras ao criar conta

### Pedidos
- `order_number` gerado no formato `PED-{ANO}-{SEQUENCIAL_4_DIGITOS}`
- Snapshot de endereço e preços no momento da compra (nunca FK dinâmica)
- Mudanças de status disparam e-mail automático ao cliente
- Log de cada mudança de status em `audit_log`

### Segurança e acesso
- RLS habilitado em todas as tabelas
- Clientes veem apenas seus próprios dados
- Admin tem papel `admin` no Supabase (verificado via `user_metadata.role`)
- Rotas admin protegidas por middleware em `src/middleware.ts`
- Webhooks de pagamento verificados por assinatura (nunca confiar apenas no payload)

---

## Convenções de código

### Componentes
```tsx
// Prefira Server Components por padrão
// Use 'use client' apenas quando necessário (interatividade, hooks)

// Nomenclatura: PascalCase para componentes
// Arquivos: kebab-case (product-card.tsx)

// Props: sempre tipar explicitamente
interface ProductCardProps {
  product: typeof products.$inferSelect
  showMargin?: boolean // apenas para admin
}
```

### Server Actions
```tsx
// Todas as actions em src/app/(admin)/admin/[modulo]/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'

export async function updateProductAction(id: string, data: UpdateProductInput) {
  // 1. Validar autenticação (admin)
  // 2. Validar dados com Zod
  // 3. Executar operação no DB
  // 4. Revalidar path afetado
  // 5. Retornar { success: true } ou { error: string }
}
```

### Formatação de dados
```ts
// src/lib/utils.ts
export const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

export const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date))

// NUNCA exibir centavos diretamente — sempre usar formatCurrency()
```

### Tratamento de erros
```ts
// Nunca lançar erros sem catch em Server Actions
// Sempre retornar objetos tipados: { data } | { error }
// Log de erros no servidor, mensagem amigável para o usuário
```

---

## Padrões de UX para o painel admin

O admin é usado por pessoas **não técnicas**. Seguir sempre:

- **Labels claros em português** — sem jargão técnico. "Preço de custo" não "cost_price"
- **Feedback imediato** — toast de sucesso/erro em toda ação. Nunca silenciar resultados
- **Confirmação antes de ações destrutivas** — deletar produto, cancelar pedido
- **Estados de loading** — skeleton ou spinner em toda operação async
- **Valores monetários sempre formatados** — R$ 1.234,56 (nunca 123456 ou 1234.56)
- **Datas sempre em pt-BR** — DD/MM/AAAA HH:MM
- **Campos obrigatórios marcados** com asterisco e validados inline (não só no submit)
- **Mensagens de erro humanas** — "Informe o preço de venda" não "sale_price is required"
- **Guias visuais de imagem** — mostrar preview e indicar se está fora da proporção ideal

### Cores de status (consistentes em todo o sistema)
- Pedido pendente: amarelo (`warning`)
- Pedido pago: azul (`info`)
- Pedido enviado: roxo (`purple`)
- Pedido entregue: verde (`success`)
- Pedido cancelado: vermelho (`destructive`)
- Ticket aberto: laranja
- Ticket resolvido: verde

---

## Variáveis de ambiente necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Apenas server-side

# Banco (Drizzle)
DATABASE_URL=                   # Connection string Supabase Postgres

# Pagamentos
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=              # Opcional
STRIPE_WEBHOOK_SECRET=          # Opcional

# E-mail
RESEND_API_KEY=
RESEND_FROM_EMAIL=loja@seudominio.com.br

# App
NEXT_PUBLIC_APP_URL=https://seusite.com.br
NEXT_PUBLIC_STORE_NAME=Nome da Loja
```

---

## Ordem de desenvolvimento sugerida (MVP)

1. **Setup base** — Supabase, Drizzle schema, Auth, middleware de proteção de rotas
2. **Catálogo admin** — CRUD de categorias e produtos com upload de imagens
3. **Vitrine pública** — Home, listagem e página de produto (SSG)
4. **Auth de clientes** — Cadastro, login, guest checkout
5. **Carrinho** — Estado client-side com persistência em localStorage/cookie
6. **Checkout** — Endereço (CEP), resumo, pagamento (Pix primeiro)
7. **Webhook de pagamento** — Confirmação automática, e-mail de confirmação
8. **Gestão de pedidos (admin)** — Lista, detalhe, atualização de status
9. **Envios** — Registro de rastreio, notificação automática ao cliente
10. **Tickets** — Canal de suporte vinculado ao pedido
11. **Dashboard financeiro** — KPIs de receita, margem, produtos mais vendidos
12. **CRM básico** — Perfil completo do cliente com histórico

---

## O que NÃO fazer (anti-patterns)

- Não usar `useEffect` para buscar dados — use Server Components e `fetch`
- Não armazenar preços como float — sempre centavos (integer)
- Não confiar no payload do webhook de pagamento sem verificar assinatura
- Não expor `SUPABASE_SERVICE_ROLE_KEY` no client
- Não fazer mutações diretamente em Client Components — use Server Actions
- Não duplicar lógica de negócio entre client e server — centralize em `src/lib/`
- Não criar rotas de API desnecessárias — App Router + Server Actions resolve a maioria dos casos
- Não usar `any` em TypeScript — use inferência do schema Drizzle