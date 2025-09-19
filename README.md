# RANKIOU (Next.js + Supabase)

Este repositório contém o app inicial do RANKIOU (frontend Next.js 14 com Tailwind) e o schema SQL para preparar o Supabase do zero.

## Requisitos
- Node.js 18+
- Conta gratuita no Supabase e Vercel

## Passo 1 — Preparar o Supabase
1. Acesse o painel do Supabase e crie um novo projeto.
2. Vá em SQL Editor e cole o conteúdo de `supabase/schema.sql` e execute.
3. Em Authentication > Providers, ative o Google e configure as credenciais (pode usar o modo Development da própria Google se preferir).
4. Em Authentication > Policies, confirme que as políticas foram criadas pelo script.
5. Em Project Settings > API, copie:
   - `Project URL`
   - `anon public key`

## Passo 2 — Variáveis de ambiente
Crie um arquivo `.env.local` na raiz (use `.env.example` como base):

```
NEXT_PUBLIC_SUPABASE_URL=coloque_sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=coloque_sua_anon_key
PEXELS_API_KEY=
GEMINI_API_KEY=
```

> PEXELS e GEMINI são opcionais agora. Se vazios, o app simula as respostas onde preciso.

## Passo 3 — Rodar localmente
Instale e execute em desenvolvimento:

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

## Passo 4 — Deploy na Vercel (grátis)
1. Importe este repositório no Vercel e crie um novo Project.
2. Na aba Settings > Environment Variables do Vercel, adicione as mesmas variáveis do `.env.local`.
3. Deploy.

## Estrutura
- `src/app` — App Router do Next.js
- `src/components` — Componentes React (serão portados da pasta de referência)
- `src/lib/supabaseClient.ts` — Cliente do Supabase
- `src/types.ts` — Tipos compartilhados
- `supabase/schema.sql` — Script para preparar DB e RLS

## Próximos passos
- Portar os componentes da pasta de referência, conectar as ações a Supabase (auth, enquetes, votos, favoritos) e finalizar as telas.

Caso queira que eu siga portando e conectando tudo agora, me avise e já continuo nesta branch.