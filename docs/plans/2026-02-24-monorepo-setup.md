# Monorepo Setup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the existing single-package React app into an npm workspaces monorepo with `packages/ui` (existing React code) and `packages/api` (AWS Lambda + Middy + TypeScript).

**Architecture:** npm workspaces at the root with two packages. The UI package keeps all existing React/Vite/Tailwind code untouched. The API package is a new AWS Lambda project using Middy middleware framework with TypeScript, esbuild for bundling, and Vitest for testing.

**Tech Stack:** npm workspaces, Vite 4.5, React 18, Tailwind 3, Zustand 5, AWS Lambda, Middy, esbuild, Vitest

---

### Task 1: Create monorepo root package.json

**Files:**

- Modify: `package.json` (replace entirely)

**Step 1: Replace root package.json with workspaces config**

The root `package.json` becomes a workspace root. All dependencies move to `packages/ui/package.json`. The root only has workspaces config and convenience scripts.

```json
{
  "name": "test-inventory",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev:ui": "npm run dev -w packages/ui",
    "dev:api": "npm run dev -w packages/api",
    "build:ui": "npm run build -w packages/ui",
    "build:api": "npm run build -w packages/api",
    "build": "npm run build -w packages/ui && npm run build -w packages/api",
    "lint": "npm run lint -w packages/ui",
    "format": "prettier --write \"packages/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"packages/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "prepare": "husky install"
  },
  "devDependencies": {
    "husky": "^8.0.3",
    "lint-staged": "^15.0.2",
    "prettier": "^3.0.3",
    "prettier-plugin-tailwindcss": "^0.5.7"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx,json,css,md}": ["prettier --write"]
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

**Step 2: Commit**

```bash
git add package.json
git commit -m "feat: convert root package.json to npm workspaces"
```

---

### Task 2: Create packages/ui directory and move React code

**Files:**

- Create: `packages/ui/package.json`
- Move: `src/` → `packages/ui/src/`
- Move: `public/` → `packages/ui/public/`
- Move: `index.html` → `packages/ui/index.html`
- Move: `vite.config.ts` → `packages/ui/vite.config.ts`
- Move: `tsconfig.json` → `packages/ui/tsconfig.json`
- Move: `tsconfig.node.json` → `packages/ui/tsconfig.node.json`
- Move: `tailwind.config.js` → `packages/ui/tailwind.config.js`
- Move: `postcss.config.mjs` → `packages/ui/postcss.config.mjs`
- Move: `.eslintrc.json` → `packages/ui/.eslintrc.json`

**Step 1: Create packages/ui directory**

```bash
mkdir -p packages/ui
```

**Step 2: Create packages/ui/package.json**

All former root dependencies go here:

```json
{
  "name": "@test-inventory/ui",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@base-ui-components/react": "^1.0.0-beta.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "cmdk": "^1.1.1",
    "embla-carousel-react": "^8.0.0-rc22",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-day-picker": "^9.9.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.62.0",
    "react-resizable-panels": "^3.0.5",
    "recharts": "^2.8.0",
    "sonner": "^1.0.3",
    "tailwind-merge": "^1.14.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.7.0",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@types/node": "^24.3.0",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "@vitejs/plugin-react": "^4.1.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-import-resolver-typescript": "^3.10.1",
    "eslint-plugin-import": "^2.32.0",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "eslint-plugin-unused-imports": "^4.2.0",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^4.5.0"
  }
}
```

**Step 3: Move all UI source and config files**

```bash
git mv src packages/ui/src
git mv public packages/ui/public
git mv index.html packages/ui/index.html
git mv vite.config.ts packages/ui/vite.config.ts
git mv tsconfig.json packages/ui/tsconfig.json
git mv tsconfig.node.json packages/ui/tsconfig.node.json
git mv tailwind.config.js packages/ui/tailwind.config.js
git mv postcss.config.mjs packages/ui/postcss.config.mjs
git mv .eslintrc.json packages/ui/.eslintrc.json
```

**Step 4: Update packages/ui/vite.config.ts — fix \_\_dirname alias**

The `@/` alias must point to `./src` relative to the ui package. No changes needed since `__dirname` will resolve correctly from the new location. However, confirm the `base` path is still correct.

The file should remain:

```ts
import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  base: '/test-inventory/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
        },
      },
    },
  },
});
```

No edits needed — `__dirname` and relative `./src` work correctly.

**Step 5: Update packages/ui/tsconfig.json paths**

The `baseUrl` and `paths` must be relative to the new location. The `include` stays as `["src"]`. The `references` path stays as `["./tsconfig.node.json"]`. No changes needed since all paths are already relative.

**Step 6: Update packages/ui/.eslintrc.json — fix tsconfig project path**

The `import/resolver` > `typescript` > `project` path is already `"./tsconfig.json"` which is relative, so no change needed.

**Step 7: Commit**

```bash
git add packages/ui/
git commit -m "feat: move React app into packages/ui workspace"
```

---

### Task 3: Clean up root-level files that moved

**Files:**

- Remove from root: `app.json`, `system.json`, `users.json` (these are duplicates of what's in `config/`)
- Move: `config/` → `packages/ui/config/` (if UI-specific) OR keep at root (if shared)
- Keep at root: `.prettierrc`, `.prettierignore`, `.gitignore`, `.husky/`, `.github/`, `docs/`, `guidelines/`, `examples/`, `README-service-layer.md`, `Attributions.md`

**Step 1: Move config directory into packages/ui (it contains mock/config data for the UI)**

```bash
git mv config packages/ui/config
```

**Step 2: Remove root-level JSON files that duplicate config/ content**

Check if `app.json`, `system.json`, `users.json` at root are the same as those in `config/`. If they are duplicates, remove the root copies. If different, move them to the appropriate package.

```bash
# These root-level files appear to be standalone config — move to ui if UI-related
git mv app.json packages/ui/app.json 2>/dev/null || true
git mv system.json packages/ui/system.json 2>/dev/null || true
git mv users.json packages/ui/users.json 2>/dev/null || true
```

**Step 3: Delete old node_modules and package-lock.json (will be regenerated)**

```bash
rm -rf node_modules package-lock.json
```

**Step 4: Update .prettierignore for monorepo**

```
dist
node_modules
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
coverage
*.min.js
*.min.css
package-lock.json
```

**Step 5: Update .gitignore — add monorepo patterns**

Add these lines at the end of .gitignore:

```
# Monorepo
packages/*/node_modules
packages/*/dist
.cdk.out
cdk.out
```

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: clean up root after monorepo restructure"
```

---

### Task 4: Create packages/api scaffolding (AWS Lambda + Middy)

**Files:**

- Create: `packages/api/package.json`
- Create: `packages/api/tsconfig.json`
- Create: `packages/api/src/handlers/health.ts`
- Create: `packages/api/src/lib/middleware.ts`
- Create: `packages/api/vitest.config.ts`
- Create: `packages/api/tests/handlers/health.test.ts`

**Step 1: Create packages/api/package.json**

```json
{
  "name": "@test-inventory/api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/local.ts",
    "build": "node esbuild.config.mjs",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint . --ext ts --report-unused-disable-directives --max-warnings 0",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@middy/core": "^5.5.0",
    "@middy/http-error-handler": "^5.5.0",
    "@middy/http-json-body-parser": "^5.5.0",
    "@middy/http-cors": "^5.5.0"
  },
  "devDependencies": {
    "@types/aws-lambda": "^8.10.145",
    "@types/node": "^24.3.0",
    "esbuild": "^0.24.0",
    "tsx": "^4.19.0",
    "typescript": "^5.2.2",
    "vitest": "^2.1.0"
  }
}
```

**Step 2: Create packages/api/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 3: Create packages/api/esbuild.config.mjs**

```js
import { build } from 'esbuild';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

// Auto-discover all handler files
function getEntryPoints(dir) {
  const entries = {};
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isFile() && file.endsWith('.ts')) {
      const name = file.replace('.ts', '');
      entries[`handlers/${name}`] = fullPath;
    }
  }
  return entries;
}

await build({
  entryPoints: getEntryPoints('src/handlers'),
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: 'node',
  target: 'node20',
  outdir: 'dist',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: ['@aws-sdk/*'],
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
});

console.log('Build complete');
```

**Step 4: Create packages/api/src/lib/middleware.ts**

A shared Middy middleware stack that all handlers will use:

```ts
import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';

import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Handler,
} from 'aws-lambda';

export type ApiHandler = Handler<
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
>;

export function createHandler(handler: ApiHandler) {
  return middy(handler)
    .use(jsonBodyParser())
    .use(httpErrorHandler())
    .use(cors());
}
```

**Step 5: Create packages/api/src/handlers/health.ts**

```ts
import { createHandler } from '../lib/middleware';

import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

export const handler = createHandler(
  async (_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
      }),
    };
  }
);
```

**Step 6: Create packages/api/vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 7: Create packages/api/tests/handlers/health.test.ts**

```ts
import { describe, it, expect } from 'vitest';
import { handler } from '../../src/handlers/health';

describe('health handler', () => {
  it('returns 200 with status ok', async () => {
    const event = {
      version: '2.0',
      routeKey: 'GET /health',
      rawPath: '/health',
      rawQueryString: '',
      headers: {},
      requestContext: {
        accountId: '123456789012',
        apiId: 'api-id',
        domainName: 'id.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'id',
        http: {
          method: 'GET',
          path: '/health',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test',
        },
        requestId: 'id',
        routeKey: 'GET /health',
        stage: '$default',
        time: '01/Jan/2024:00:00:00 +0000',
        timeEpoch: 1704067200000,
      },
      isBase64Encoded: false,
    };

    const result = await handler(event as any, {} as any, () => {});
    const body = JSON.parse((result as any).body);

    expect((result as any).statusCode).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});
```

**Step 8: Commit**

```bash
git add packages/api/
git commit -m "feat: scaffold packages/api with AWS Lambda + Middy + Vitest"
```

---

### Task 5: Update GitHub Actions workflow for monorepo

**Files:**

- Modify: `.github/workflows/deploy.yml`

**Step 1: Update deploy.yml to work with monorepo structure**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  pull_request:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint UI
        run: npm run lint -w packages/ui

      - name: Build UI
        run: npm run build -w packages/ui

      - name: Build API
        run: npm run build -w packages/api

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './packages/ui/dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "chore: update GitHub Actions for monorepo structure"
```

---

### Task 6: Update lint-staged for monorepo paths

**Files:**

- Modify: root `package.json` (lint-staged config)
- Modify: `.husky/pre-commit`

**Step 1: Verify lint-staged in root package.json**

The lint-staged config in the root `package.json` (written in Task 1) already uses generic glob patterns (`*.{ts,tsx}`) which work from any directory. Since eslint is installed per-workspace, we need to make sure lint-staged runs the right eslint for each workspace.

Update root `package.json` lint-staged to:

```json
"lint-staged": {
  "packages/ui/**/*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "packages/api/**/*.ts": [
    "prettier --write"
  ],
  "*.{js,jsx,json,css,md}": [
    "prettier --write"
  ]
}
```

**Step 2: Husky pre-commit stays the same**

The existing `.husky/pre-commit` runs `npx lint-staged` which is correct.

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: update lint-staged for monorepo paths"
```

---

### Task 7: Install dependencies and verify builds

**Step 1: Install all workspace dependencies**

```bash
npm install
```

**Step 2: Verify UI builds**

```bash
npm run build -w packages/ui
```

Expected: Vite build succeeds, output in `packages/ui/dist/`.

**Step 3: Verify API builds**

```bash
npm run build -w packages/api
```

Expected: esbuild bundles `handlers/health.mjs` into `packages/api/dist/`.

**Step 4: Verify API tests pass**

```bash
npm test -w packages/api
```

Expected: 1 test passes.

**Step 5: Verify UI dev server starts**

```bash
npm run dev -w packages/ui
```

Expected: Vite dev server starts on port 3000.

**Step 6: Commit lock file**

```bash
git add package-lock.json
git commit -m "chore: regenerate package-lock.json for monorepo"
```

---

## Summary of final directory structure

```
test-inventory/
├── .github/workflows/deploy.yml
├── .gitignore
├── .husky/pre-commit
├── .prettierrc
├── .prettierignore
├── package.json              ← workspaces root
├── package-lock.json
├── docs/
├── guidelines/
├── examples/
├── Attributions.md
├── README-service-layer.md
├── packages/
│   ├── ui/
│   │   ├── .eslintrc.json
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.mjs
│   │   ├── index.html
│   │   ├── public/
│   │   ├── config/
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── components/
│   │   │   ├── data/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   └── styles/
│   │   ├── app.json
│   │   ├── system.json
│   │   └── users.json
│   └── api/
│       ├── package.json
│       ├── tsconfig.json
│       ├── esbuild.config.mjs
│       ├── vitest.config.ts
│       ├── src/
│       │   ├── handlers/
│       │   │   └── health.ts
│       │   └── lib/
│       │       └── middleware.ts
│       └── tests/
│           └── handlers/
│               └── health.test.ts
```
