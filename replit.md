# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

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

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo React Native app (MyFlowerCompanion)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## MyFlowerCompanion Mobile App (`artifacts/mobile`)

A companion planting mobile app for iOS and Android built with Expo.

### Features
- **Multiple Gardens**: Create, name, and manage multiple gardens (default names: "Garden 1", "Garden 2", etc.)
- **Plant Management**: Add/remove plants (flowers, herbs, vegetables) per garden
- **Companion Suggestions**: AI-curated companion flower recommendations based on plants in the garden
- **Zone Support**: USDA planting zone auto-detect (via GPS), ZIP code lookup, or manual selection (zones 1–13)
- **Include Herbs/Vegetables**: Per-garden toggles to include or exclude herbs and vegetables from companion results
- **Persistent Storage**: All gardens saved via AsyncStorage (no account needed)
- **Reset Garden**: Confirm-gated reset to clear all plants from a garden
- **Delete Garden**: Confirm-gated garden deletion

### Key Files
- `app/_layout.tsx` — Root layout with providers (GardenProvider, QueryClient, etc.)
- `app/(tabs)/index.tsx` — Gardens list screen (home tab)
- `app/(tabs)/settings.tsx` — Zone settings screen
- `app/garden/[id].tsx` — Garden detail screen (plants, toggles, reset)
- `app/garden/add-plant.tsx` — Plant search and add screen
- `app/garden/companions.tsx` — Companion flower results screen
- `context/GardenContext.tsx` — State management with AsyncStorage persistence
- `data/plants.ts` — All plant data and companion relationships (built-in, no API needed)
- `constants/colors.ts` — App color theme (green/terracotta palette)

### Packages
- `expo-location` — GPS-based zone auto-detection
- `@react-native-async-storage/async-storage` — Persistent garden storage

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes at `/api`.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval config.

Run codegen: `pnpm --filter @workspace/api-spec run codegen`
