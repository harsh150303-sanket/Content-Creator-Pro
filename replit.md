# Workspace

## Overview

pnpm workspace monorepo using TypeScript. AI-powered blog writing platform (BlogFlow) for agencies managing multiple clients.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Replit Auth (OpenID Connect with PKCE)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── blog-writer/        # React + Vite frontend (BlogFlow)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── replit-auth-web/    # Replit Auth browser package
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     
├── tsconfig.base.json      
├── tsconfig.json           
└── package.json            
```

## Features

- **Authentication**: Replit Auth (login/logout)
- **Client Management**: CRUD for client profiles (name, website, industry, target audience, tone of voice)
- **Blog Management**: Create, edit, delete blog posts per client
- **AI Blog Generation**: Generate SEO-optimized blog posts using OpenAI gpt-5.2
- **Search Console**: Connect Google Search Console (siteUrl) and view keyword data
- **SEO Scoring**: Auto-calculated word count and SEO scores

## Database Schema

- `users` / `sessions` (auth) — from replit-auth template
- `clients` — client profiles with userId FK, website, industry, tone, search console status
- `blog_posts` — blog posts with clientId FK, title, content, metadata, status, SEO fields

## API Routes

All routes at `/api`:
- `GET /api/auth/user` — current auth user
- `GET /api/login`, `GET /api/callback`, `GET /api/logout` — OIDC auth flow
- `GET/POST /api/clients` — list/create clients
- `GET/PUT/DELETE /api/clients/:id` — get/update/delete client
- `GET/POST /api/clients/:clientId/blogs` — list/create blogs
- `POST /api/clients/:clientId/blogs/generate` — AI blog generation
- `GET/PUT/DELETE /api/clients/:clientId/blogs/:id` — get/update/delete blog
- `POST /api/clients/:clientId/search-console/connect` — connect search console
- `GET /api/clients/:clientId/search-console/keywords` — keyword data

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. Run codegen: `pnpm --filter @workspace/api-spec run codegen`. Push DB schema: `pnpm --filter @workspace/db run push`.
