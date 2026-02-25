# DSL Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the DSL system from flat `SemanticRuleConfig[]` arrays to grouped `DslListConfig` containers on the API, and hydrated `DslList`/`SemanticRule` objects (with `RegExp`, `parse()`, `format()`) on the client.

**Architecture:** API returns pre-grouped `Record<string, DslListConfig>` and `Record<string, TdmRecipeConfig[]>`. Client hydrates `DslListConfig` into `DslList` with runtime functions. `lob`/`category` fields move from each rule into the `DslListConfig` container.

**Tech Stack:** TypeScript, React, Zustand, Vite, Vitest, shadcn/ui

**Design doc:** `docs/plans/2026-02-24-dsl-restructure-design.md`

---

### Task 1: Update API types in `domain.ts`

**Files:**

- Modify: `packages/api/src/types/domain.ts:119-139`

**Step 1: Replace `SemanticRuleConfig`, `GroupedDsls`, add `DslListConfig` and `GroupedRecipes`**

Replace lines 119-139 with:

```typescript
export interface SemanticRuleConfig {
  id: string;
  key: string;
  regexString: string;
  suggestions: string[];
}

export interface DslListConfig {
  lob: Lob;
  type: 'flavor' | 'recon';
  items: SemanticRuleConfig[];
}

export interface TdmRecipeConfig {
  id: string;
  lob: Lob;
  name: string;
  description: string;
  tags: string[];
}

export type GroupedDsls = Record<string, DslListConfig>;
export type GroupedRecipes = Record<string, TdmRecipeConfig[]>;
```

Key changes: `SemanticRuleConfig` loses `lob` and `category` fields. `DslListConfig` is new. `GroupedDsls` value type changes from `Array<SemanticRuleConfig | TdmRecipeConfig>` to `DslListConfig`. `GroupedRecipes` is new.

**Step 2: Commit**

```bash
git add packages/api/src/types/domain.ts
git commit -m "refactor: update API types — DslListConfig container, remove lob/category from SemanticRuleConfig"
```

---

### Task 2: Restructure mock data in `mockDsls.ts`

**Files:**

- Modify: `packages/api/src/data/mockDsls.ts`

**Step 1: Replace flat arrays with grouped structures**

Replace the entire file content with:

```typescript
import { DslListConfig, TdmRecipeConfig } from '../types/domain';

export const mockDslGroups: Record<string, DslListConfig> = {
  TestDataFlavorsBANK: {
    lob: 'BANK',
    type: 'flavor',
    items: [
      {
        id: 'rule-customer-type',
        key: 'customer-type',
        regexString:
          '^customer-type:(primary-user|authorized-user|company|retail)$',
        suggestions: [
          'customer-type:primary-user',
          'customer-type:authorized-user',
          'customer-type:company',
          'customer-type:retail',
        ],
      },
      {
        id: 'rule-account-type',
        key: 'account-type',
        regexString:
          '^account-type:(checking|savings|credit-card|debit-card|business|line-of-credit)$',
        suggestions: [
          'account-type:checking',
          'account-type:savings',
          'account-type:credit-card',
          'account-type:debit-card',
          'account-type:business',
          'account-type:line-of-credit',
        ],
      },
      {
        id: 'rule-account',
        key: 'account',
        regexString: '^account:(primary|secondary)$',
        suggestions: ['account:primary', 'account:secondary'],
      },
      {
        id: 'rule-transactions',
        key: 'transactions',
        regexString: '^transactions:(pending|completed):(\\d+)$',
        suggestions: ['transactions:pending:', 'transactions:completed:'],
      },
      {
        id: 'rule-balance',
        key: 'balance',
        regexString: '^balance:(high|low)$',
        suggestions: ['balance:high', 'balance:low'],
      },
      {
        id: 'rule-user',
        key: 'user',
        regexString: '^user:(primary|authorized|verified|mfa)$',
        suggestions: [
          'user:primary',
          'user:authorized',
          'user:verified',
          'user:mfa',
        ],
      },
    ],
  },
  TestDataFlavorsCARD: {
    lob: 'CARD',
    type: 'flavor',
    items: [
      {
        id: 'rule-card',
        key: 'card',
        regexString: '^card:(active|expired|inactive|new)$',
        suggestions: [
          'card:active',
          'card:expired',
          'card:inactive',
          'card:new',
        ],
      },
    ],
  },
  TestDataReconBANK: {
    lob: 'BANK',
    type: 'recon',
    items: [
      {
        id: 'rule-schedule',
        key: 'schedule',
        regexString: '^schedule:(month|days|year):(\\d+)$',
        suggestions: ['schedule:month:', 'schedule:days:', 'schedule:year:'],
      },
    ],
  },
};

export const mockRecipeGroups: Record<string, TdmRecipeConfig[]> = {
  TDMRecipesBANK: [
    {
      id: 'recipe-primary-checking',
      lob: 'BANK',
      name: 'Primary Checking Account',
      description: 'Standard primary user with an active checking account',
      tags: [
        'customer-type:primary-user',
        'account-type:checking',
        'account:primary',
        'user:primary',
      ],
    },
    {
      id: 'recipe-authorized-savings',
      lob: 'BANK',
      name: 'Authorized Savings User',
      description: 'Authorized user with a savings account and MFA',
      tags: [
        'customer-type:authorized-user',
        'account-type:savings',
        'user:authorized',
        'user:mfa',
      ],
    },
    {
      id: 'recipe-low-balance',
      lob: 'BANK',
      name: 'Low Balance Account',
      description: 'Primary user with low balance checking for NSF testing',
      tags: [
        'customer-type:primary-user',
        'account-type:checking',
        'balance:low',
        'account:primary',
      ],
    },
    {
      id: 'recipe-business-loc',
      lob: 'BANK',
      name: 'Business Line of Credit',
      description: 'Company with a line of credit and pending transactions',
      tags: [
        'customer-type:company',
        'account-type:line-of-credit',
        'balance:high',
      ],
    },
    {
      id: 'recipe-mfa-verified',
      lob: 'BANK',
      name: 'MFA Verified Customer',
      description: 'Verified retail customer with MFA enabled',
      tags: [
        'customer-type:retail',
        'user:verified',
        'user:mfa',
        'account:primary',
      ],
    },
  ],
  TDMRecipesCARD: [
    {
      id: 'recipe-business-credit',
      lob: 'CARD',
      name: 'Business Credit Card',
      description: 'Company entity with an active credit card and high balance',
      tags: [
        'customer-type:company',
        'account-type:credit-card',
        'card:active',
        'balance:high',
      ],
    },
    {
      id: 'recipe-retail-debit',
      lob: 'CARD',
      name: 'Retail Debit Card',
      description: 'Retail customer with a debit card',
      tags: [
        'customer-type:retail',
        'account-type:debit-card',
        'card:active',
        'user:verified',
      ],
    },
    {
      id: 'recipe-expired-card',
      lob: 'CARD',
      name: 'Expired Card Scenario',
      description:
        'Primary user with an expired credit card for renewal testing',
      tags: [
        'customer-type:primary-user',
        'account-type:credit-card',
        'card:expired',
        'account:primary',
      ],
    },
  ],
};
```

**Step 2: Commit**

```bash
git add packages/api/src/data/mockDsls.ts
git commit -m "refactor: restructure mockDsls to grouped DslListConfig and RecipeGroups"
```

---

### Task 3: Simplify `dslRoutes.ts` to return pre-grouped data

**Files:**

- Modify: `packages/api/src/lib/dslRoutes.ts`

**Step 1: Replace the file to import and return grouped data directly**

Replace the entire file with:

```typescript
import { mockDslGroups, mockRecipeGroups } from '../data/mockDsls';

interface DslRouteResult {
  statusCode: number;
  body: {
    success: boolean;
    data?: any;
    error?: {
      code: string;
      message: string;
    };
  };
}

function normalizePath(path: string): string {
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

export function handleDslHttpRoute(
  method: string,
  rawPath: string
): DslRouteResult | null {
  const path = normalizePath(rawPath);

  if (path === '/api/dsls') {
    if (method === 'GET') {
      return {
        statusCode: 200,
        body: {
          success: true,
          data: {
            grouped: mockDslGroups,
            recipes: mockRecipeGroups,
          },
        },
      };
    }

    return {
      statusCode: 405,
      body: {
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} is not allowed for ${path}`,
        },
      },
    };
  }

  return null;
}
```

Key change: No more runtime grouping logic. The import `GroupedDsls` from types is no longer needed. The response shape changes from `{ semanticRules, recipes, grouped }` to `{ grouped, recipes }`.

**Step 2: Run API tests**

Run: `cd packages/api && npx vitest run`
Expected: All existing tests pass (the DSL endpoint isn't directly tested in `app.test.ts`, but verify no breakage).

**Step 3: Commit**

```bash
git add packages/api/src/lib/dslRoutes.ts
git commit -m "refactor: simplify dslRoutes to return pre-grouped data"
```

---

### Task 4: Add client-side types (`SemanticRule`, `DslList`) to UI types

**Files:**

- Modify: `packages/ui/src/services/types.ts` (append at end)

**Step 1: Add the hydrated client types at the end of the file**

Append after line 156:

```typescript
// --- Hydrated DSL types (client-side only) ---

export interface SemanticRule {
  key: string;
  regex: RegExp;
  parse: (match: RegExpMatchArray) => Record<string, string>;
  format: (parsed: Record<string, string>) => string;
  suggestions: string[];
}

export interface DslList {
  lob: Lob;
  type: 'flavor' | 'recon';
  items: SemanticRule[];
}
```

**Step 2: Commit**

```bash
git add packages/ui/src/services/types.ts
git commit -m "feat: add SemanticRule and DslList hydrated client types"
```

---

### Task 5: Update `configService.ts` — types, hydration, and loading

**Files:**

- Modify: `packages/ui/src/services/configService.ts`

This is a multi-part edit. The changes are:

1. Replace `SemanticRuleConfig` interface (remove `lob`, `category` fields)
2. Add `DslListConfig` interface
3. Update `GroupedDsls` type alias
4. Add `GroupedRecipes` type alias
5. Update `SystemConfig.dsls` shape (remove `semanticRules` and `recipes` flat arrays, keep `grouped` and add `recipes`)
6. Add hydration functions
7. Update `loadSystemConfig()` to use new API response shape and hydrate
8. Update `SYSTEM_CONFIG` default dsls shape

**Step 1: Replace `SemanticRuleConfig` (lines 49-56) — remove `lob` and `category`**

Replace:

```typescript
export interface SemanticRuleConfig {
  id: string; // Used for UI identification
  lob: Lob;
  category: 'Flavor' | 'Recon';
  key: string;
  regexString: string;
  suggestions: string[];
}
```

With:

```typescript
export interface SemanticRuleConfig {
  id: string;
  key: string;
  regexString: string;
  suggestions: string[];
}

export interface DslListConfig {
  lob: Lob;
  type: 'flavor' | 'recon';
  items: SemanticRuleConfig[];
}
```

**Step 2: Replace `GroupedDsls` type (lines 44-47)**

Replace:

```typescript
export type GroupedDsls = Record<
  string, // e.g., 'TestDataFlavorsBANK', 'TestDataReconCARD', 'TDMRecipesBANK'
  Array<SemanticRuleConfig | TdmRecipeConfig>
>;
```

With:

```typescript
export type GroupedDsls = Record<string, DslListConfig>;
export type GroupedRecipes = Record<string, TdmRecipeConfig[]>;
```

**Step 3: Update `SystemConfig.dsls` shape (lines 88-94)**

Replace:

```typescript
  dsls: {
    title: string;
    description: string;
    semanticRules: SemanticRuleConfig[];
    recipes: TdmRecipeConfig[];
    grouped: GroupedDsls;
  };
```

With:

```typescript
dsls: {
  title: string;
  description: string;
  grouped: GroupedDsls;
  recipes: GroupedRecipes;
}
```

**Step 4: Update `SYSTEM_CONFIG` default dsls (lines 285-291)**

Replace:

```typescript
  dsls: {
    title: 'DSLs Management',
    description: 'Manage Domain Specific Languages used across the system for semantic tagging.',
    semanticRules: [],
    recipes: [],
    grouped: {},
  },
```

With:

```typescript
  dsls: {
    title: 'DSLs Management',
    description: 'Manage Domain Specific Languages used across the system for semantic tagging.',
    grouped: {},
    recipes: {},
  },
```

**Step 5: Add hydration functions before the `ConfigService` class (before line 440)**

Insert before `class ConfigService {`:

```typescript
// --- Hydration: convert API config into runtime DslList/SemanticRule ---

import type { SemanticRule, DslList } from './types';

function hydrateRule(config: SemanticRuleConfig): SemanticRule {
  const regex = new RegExp(config.regexString, 'i');
  return {
    key: config.key,
    regex,
    parse: (match: RegExpMatchArray) => ({
      [config.key]: match[1]?.toLowerCase() ?? '',
    }),
    format: (parsed: Record<string, string>) =>
      `${config.key}:${parsed[config.key]}`,
    suggestions: config.suggestions,
  };
}

export function hydrateDslList(config: DslListConfig): DslList {
  return {
    lob: config.lob,
    type: config.type,
    items: config.items.map(hydrateRule),
  };
}

export function hydrateGroupedDsls(
  grouped: GroupedDsls
): Record<string, DslList> {
  const result: Record<string, DslList> = {};
  for (const [key, config] of Object.entries(grouped)) {
    result[key] = hydrateDslList(config);
  }
  return result;
}

export function flattenRulesFromGrouped(grouped: GroupedDsls): SemanticRule[] {
  return Object.values(grouped).flatMap(config =>
    config.items.map(hydrateRule)
  );
}

export function flattenRecipesFromGrouped(
  recipes: GroupedRecipes
): TdmRecipeConfig[] {
  return Object.values(recipes).flat();
}
```

Note: the `import type` should be added at the top of the file with the other imports, not inline. Place `import type { SemanticRule, DslList } from './types';` at line 2 alongside the existing import. Remove the inline import from the hydration block.

**Step 6: Update `loadSystemConfig()` (lines 454-480)**

Replace:

```typescript
  async loadSystemConfig(): Promise<SystemConfig> {
    if (!this.systemConfig) {
      try {
        const response = await fetch('/api/dsls');
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            this.systemConfig = {
              ...SYSTEM_CONFIG,
              dsls: {
                ...SYSTEM_CONFIG.dsls,
                semanticRules: resJson.data.semanticRules || [],
                recipes: resJson.data.recipes || [],
                grouped: resJson.data.grouped || {},
              }
            };
            return this.systemConfig;
          }
        }
      } catch (error) {
        console.error('Failed to load DSLs from API', error);
      }
      // Fallback
      this.systemConfig = SYSTEM_CONFIG;
    }
    return this.systemConfig;
  }
```

With:

```typescript
  async loadSystemConfig(): Promise<SystemConfig> {
    if (!this.systemConfig) {
      try {
        const response = await fetch('/api/dsls');
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            this.systemConfig = {
              ...SYSTEM_CONFIG,
              dsls: {
                ...SYSTEM_CONFIG.dsls,
                grouped: resJson.data.grouped || {},
                recipes: resJson.data.recipes || {},
              },
            };
            return this.systemConfig;
          }
        }
      } catch (error) {
        console.error('Failed to load DSLs from API', error);
      }
      // Fallback
      this.systemConfig = SYSTEM_CONFIG;
    }
    return this.systemConfig;
  }
```

**Step 7: Commit**

```bash
git add packages/ui/src/services/configService.ts
git commit -m "refactor: update configService with DslListConfig types, hydration utils, and new API shape"
```

---

### Task 6: Update `ClassificationPicker.tsx` to use hydrated `SemanticRule`

**Files:**

- Modify: `packages/ui/src/components/ClassificationPicker.tsx`

**Step 1: Update imports (line 5)**

Replace:

```typescript
import { configService, SemanticRuleConfig } from '../services/configService';
```

With:

```typescript
import {
  configService,
  flattenRulesFromGrouped,
} from '../services/configService';
import type { SemanticRule } from '../services/types';
```

**Step 2: Update `tryParseSemanticTag` to use hydrated `SemanticRule` (lines 11-28)**

Replace:

```typescript
function tryParseSemanticTag(
  input: string,
  semanticRules: SemanticRuleConfig[]
): { tag: string; parsed: Record<string, unknown> } | null {
  const trimmed = input.trim();
  for (const rule of semanticRules) {
    try {
      const regex = new RegExp(rule.regexString, 'i');
      const match = trimmed.match(regex);
      if (match) {
        return { tag: trimmed.toLowerCase(), parsed: {} };
      }
    } catch {
      // ignore invalid regexes
    }
  }
  return null;
}
```

With:

```typescript
function tryParseSemanticTag(
  input: string,
  semanticRules: SemanticRule[]
): { tag: string; parsed: Record<string, string> } | null {
  const trimmed = input.trim();
  for (const rule of semanticRules) {
    const match = trimmed.match(rule.regex);
    if (match) {
      return { tag: trimmed.toLowerCase(), parsed: rule.parse(match) };
    }
  }
  return null;
}
```

**Step 3: Update `getSemanticSuggestions` signature (lines 30-46)**

Replace:

```typescript
function getSemanticSuggestions(
  input: string,
  semanticRules: SemanticRuleConfig[]
): string[] {
```

With:

```typescript
function getSemanticSuggestions(
  input: string,
  semanticRules: SemanticRule[]
): string[] {
```

The body stays the same — it already accesses `r.suggestions` and `r.key` which exist on both types.

**Step 4: Update state and loading in the component (line 114 and lines 116-120)**

Replace:

```typescript
const [semanticRules, setSemanticRules] = React.useState<SemanticRuleConfig[]>(
  []
);

React.useEffect(() => {
  configService.loadSystemConfig().then(config => {
    setSemanticRules(config.dsls.semanticRules);
  });
}, []);
```

With:

```typescript
const [semanticRules, setSemanticRules] = React.useState<SemanticRule[]>([]);

React.useEffect(() => {
  configService.loadSystemConfig().then(config => {
    setSemanticRules(flattenRulesFromGrouped(config.dsls.grouped));
  });
}, []);
```

**Step 5: Commit**

```bash
git add packages/ui/src/components/ClassificationPicker.tsx
git commit -m "refactor: ClassificationPicker uses hydrated SemanticRule with regex/parse/format"
```

---

### Task 7: Update `TdmRecipeCombobox.tsx` to use grouped recipes

**Files:**

- Modify: `packages/ui/src/components/TdmRecipeCombobox.tsx`

**Step 1: Update import (line 5)**

Replace:

```typescript
import { configService, TdmRecipeConfig } from '../services/configService';
```

With:

```typescript
import {
  configService,
  flattenRecipesFromGrouped,
  TdmRecipeConfig,
} from '../services/configService';
```

**Step 2: Update loading effect (lines 30-34)**

Replace:

```typescript
React.useEffect(() => {
  configService.loadSystemConfig().then(config => {
    setRecipes(config.dsls.recipes);
  });
}, []);
```

With:

```typescript
React.useEffect(() => {
  configService.loadSystemConfig().then(config => {
    setRecipes(flattenRecipesFromGrouped(config.dsls.recipes));
  });
}, []);
```

**Step 3: Commit**

```bash
git add packages/ui/src/components/TdmRecipeCombobox.tsx
git commit -m "refactor: TdmRecipeCombobox uses flattenRecipesFromGrouped"
```

---

### Task 8: Update `SystemConfiguration.tsx` to use `DslListConfig` groups

**Files:**

- Modify: `packages/ui/src/components/configuration/SystemConfiguration.tsx`

This is the largest change. The component currently:

1. Imports `SemanticRuleConfig` from configService (with `lob`/`category` fields)
2. Builds `localGroupedDsls` by iterating flat arrays and grouping manually
3. CRUD handlers operate on flat `systemConfig.dsls.semanticRules[]` and `systemConfig.dsls.recipes[]`

After the refactor:

1. Import `DslListConfig` and `SemanticRuleConfig` (without `lob`/`category`)
2. `localGroupedDsls` comes directly from `systemConfig.dsls.grouped`
3. CRUD handlers operate on items within specific groups in `systemConfig.dsls.grouped` and `systemConfig.dsls.recipes`

**Step 1: Update imports (lines 5-11)**

Replace:

```typescript
import {
  configService,
  ConfigurationSection,
  SemanticRuleConfig,
  SystemConfig,
  TdmRecipeConfig,
} from '../../services/configService';
```

With:

```typescript
import {
  configService,
  ConfigurationSection,
  DslListConfig,
  SemanticRuleConfig,
  SystemConfig,
  TdmRecipeConfig,
} from '../../services/configService';
```

**Step 2: Update editing state types — `editingRuleData` needs a `groupKey` context**

After `const [editingRuleData, setEditingRuleData] = useState<SemanticRuleConfig | null>(null);` (line 38), add:

```typescript
const [editingRuleGroupKey, setEditingRuleGroupKey] = useState<string | null>(
  null
);
```

After `const [editingRecipeData, setEditingRecipeData] = useState<TdmRecipeConfig | null>(null);` (line 54), add:

```typescript
const [editingRecipeGroupKey, setEditingRecipeGroupKey] = useState<
  string | null
>(null);
```

**Step 3: Replace `localGroupedDsls` memo (lines 58-76)**

Replace:

```typescript
// Group the DSLs dynamically based on what we fetched
const localGroupedDsls = useMemo(() => {
  if (!systemConfig) return {};
  const grouped: Record<
    string,
    Array<SemanticRuleConfig | TdmRecipeConfig>
  > = {};

  systemConfig.dsls.semanticRules.forEach(rule => {
    const prefix =
      rule.category === 'Flavor' ? 'TestDataFlavors' : 'TestDataRecon';
    const key = `${prefix}${rule.lob}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(rule);
  });

  systemConfig.dsls.recipes.forEach(recipe => {
    const key = `TDMRecipes${recipe.lob}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(recipe);
  });

  return grouped;
}, [systemConfig?.dsls.semanticRules, systemConfig?.dsls.recipes]);
```

With:

```typescript
const groupedDsls = systemConfig?.dsls.grouped ?? {};
const groupedRecipes = systemConfig?.dsls.recipes ?? {};
```

**Step 4: Update `handleEditRule` — find rule within groups (lines 156-163)**

Replace:

```typescript
const handleEditRule = (ruleId: string) => {
  const rule = systemConfig?.dsls.semanticRules.find(r => r.id === ruleId);
  if (rule) {
    setEditingRuleId(ruleId);
    setEditingRuleData(JSON.parse(JSON.stringify(rule)));
    setRegexTestInput('');
  }
};
```

With:

```typescript
const handleEditRule = (ruleId: string, groupKey: string) => {
  const group = groupedDsls[groupKey];
  const rule = group?.items.find(r => r.id === ruleId);
  if (rule) {
    setEditingRuleId(ruleId);
    setEditingRuleGroupKey(groupKey);
    setEditingRuleData(JSON.parse(JSON.stringify(rule)));
    setRegexTestInput('');
  }
};
```

**Step 5: Update `handleCancelRuleEdit` (lines 165-170)**

Add `setEditingRuleGroupKey(null);` after `setEditingRuleId(null);`.

**Step 6: Update `handleSaveRule` — save within the group (lines 172-190)**

Replace:

```typescript
const handleSaveRule = () => {
  if (!systemConfig || !editingRuleId || !editingRuleData) return;

  let updatedRules = [...systemConfig.dsls.semanticRules];
  const exists = updatedRules.some(r => r.id === editingRuleId);
  if (exists) {
    updatedRules = updatedRules.map(r =>
      r.id === editingRuleId ? editingRuleData : r
    );
  } else {
    updatedRules.push(editingRuleData);
  }

  setSystemConfig({
    ...systemConfig,
    dsls: { ...systemConfig.dsls, semanticRules: updatedRules },
  });
  setEditingRuleId(null);
  setEditingRuleData(null);
  setHasRuleChanges(false);
};
```

With:

```typescript
const handleSaveRule = () => {
  if (
    !systemConfig ||
    !editingRuleId ||
    !editingRuleData ||
    !editingRuleGroupKey
  )
    return;

  const group = systemConfig.dsls.grouped[editingRuleGroupKey];
  if (!group) return;

  const exists = group.items.some(r => r.id === editingRuleId);
  const updatedItems = exists
    ? group.items.map(r => (r.id === editingRuleId ? editingRuleData : r))
    : [...group.items, editingRuleData];

  setSystemConfig({
    ...systemConfig,
    dsls: {
      ...systemConfig.dsls,
      grouped: {
        ...systemConfig.dsls.grouped,
        [editingRuleGroupKey]: { ...group, items: updatedItems },
      },
    },
  });
  setEditingRuleId(null);
  setEditingRuleGroupKey(null);
  setEditingRuleData(null);
  setHasRuleChanges(false);
};
```

**Step 7: Update `handleDeleteRule` — delete within group (lines 192-201)**

Replace:

```typescript
const handleDeleteRule = (ruleId: string) => {
  if (!systemConfig) return;
  setSystemConfig({
    ...systemConfig,
    dsls: {
      ...systemConfig.dsls,
      semanticRules: systemConfig.dsls.semanticRules.filter(
        r => r.id !== ruleId
      ),
    },
  });
};
```

With:

```typescript
const handleDeleteRule = (ruleId: string, groupKey: string) => {
  if (!systemConfig) return;
  const group = systemConfig.dsls.grouped[groupKey];
  if (!group) return;

  const updatedItems = group.items.filter(r => r.id !== ruleId);
  const updatedGrouped = { ...systemConfig.dsls.grouped };

  if (updatedItems.length === 0) {
    delete updatedGrouped[groupKey];
  } else {
    updatedGrouped[groupKey] = { ...group, items: updatedItems };
  }

  setSystemConfig({
    ...systemConfig,
    dsls: { ...systemConfig.dsls, grouped: updatedGrouped },
  });
};
```

**Step 8: Update `handleAddRule` — needs a target group (lines 203-209)**

Replace:

```typescript
const handleAddRule = () => {
  const newId = `new-rule-${Date.now()}`;
  setEditingRuleId(newId);
  setEditingRuleData({
    id: newId,
    lob: 'BANK',
    category: 'Flavor',
    key: '',
    regexString: '',
    suggestions: [],
  });
  setHasRuleChanges(true);
  setRegexTestInput('');
};
```

With:

```typescript
const handleAddRule = (groupKey: string) => {
  const newId = `new-rule-${Date.now()}`;
  setEditingRuleId(newId);
  setEditingRuleGroupKey(groupKey);
  setEditingRuleData({ id: newId, key: '', regexString: '', suggestions: [] });
  setHasRuleChanges(true);
  setRegexTestInput('');
};
```

**Step 9: Update `handleRuleChange` — remove `lob`/`category` field handling (line 211)**

The function signature stays the same but now `SemanticRuleConfig` no longer has `lob` or `category`, so existing code that calls `handleRuleChange('lob', ...)` or `handleRuleChange('category', ...)` must be removed from the JSX (done in step 11).

**Step 10: Update recipe handlers similarly**

`handleEditRecipe` (lines 249-255): Change to accept `groupKey: string`:

```typescript
const handleEditRecipe = (recipeId: string, groupKey: string) => {
  const group = groupedRecipes[groupKey];
  const recipe = group?.find(r => r.id === recipeId);
  if (recipe) {
    setEditingRecipeId(recipeId);
    setEditingRecipeGroupKey(groupKey);
    setEditingRecipeData(JSON.parse(JSON.stringify(recipe)));
  }
};
```

`handleCancelRecipeEdit`: Add `setEditingRecipeGroupKey(null);`.

`handleSaveRecipe` (lines 263-281): Operate within group:

```typescript
const handleSaveRecipe = () => {
  if (
    !systemConfig ||
    !editingRecipeId ||
    !editingRecipeData ||
    !editingRecipeGroupKey
  )
    return;

  const group = systemConfig.dsls.recipes[editingRecipeGroupKey] ?? [];
  const exists = group.some(r => r.id === editingRecipeId);
  const updatedItems = exists
    ? group.map(r => (r.id === editingRecipeId ? editingRecipeData : r))
    : [...group, editingRecipeData];

  setSystemConfig({
    ...systemConfig,
    dsls: {
      ...systemConfig.dsls,
      recipes: {
        ...systemConfig.dsls.recipes,
        [editingRecipeGroupKey]: updatedItems,
      },
    },
  });
  setEditingRecipeId(null);
  setEditingRecipeGroupKey(null);
  setEditingRecipeData(null);
  setHasRecipeChanges(false);
};
```

`handleDeleteRecipe` (lines 283-292): Delete within group:

```typescript
const handleDeleteRecipe = (recipeId: string, groupKey: string) => {
  if (!systemConfig) return;
  const group = systemConfig.dsls.recipes[groupKey];
  if (!group) return;

  const updatedItems = group.filter(r => r.id !== recipeId);
  const updatedRecipes = { ...systemConfig.dsls.recipes };

  if (updatedItems.length === 0) {
    delete updatedRecipes[groupKey];
  } else {
    updatedRecipes[groupKey] = updatedItems;
  }

  setSystemConfig({
    ...systemConfig,
    dsls: { ...systemConfig.dsls, recipes: updatedRecipes },
  });
};
```

`handleAddRecipe` (lines 294-299): Accept `groupKey`:

```typescript
const handleAddRecipe = (groupKey: string) => {
  const newId = `new-recipe-${Date.now()}`;
  const group = systemConfig?.dsls.recipes[groupKey];
  const lob = group?.[0]?.lob ?? 'BANK';
  setEditingRecipeId(newId);
  setEditingRecipeGroupKey(groupKey);
  setEditingRecipeData({ id: newId, lob, name: '', description: '', tags: [] });
  setHasRecipeChanges(true);
};
```

**Step 11: Update the JSX — Semantic Rules section (lines 487-810)**

Replace the iteration pattern. The current code iterates `Object.entries(localGroupedDsls).filter(...)`. Update to use `Object.entries(groupedDsls)`:

- Replace `localGroupedDsls` references with `groupedDsls`
- Replace `.filter(([groupKey]) => !groupKey.startsWith('TDMRecipes'))` — no longer needed since rules and recipes are in separate objects
- Remove the `as Array<SemanticRuleConfig | TdmRecipeConfig>` cast — items are now typed as `DslListConfig.items` (i.e. `SemanticRuleConfig[]`)
- Remove `const rule = item as SemanticRuleConfig;` cast
- Remove the LOB and Category `<Select>` dropdowns from the rule edit form (lob/category now live on the group container)
- Update `handleEditRule(rule.id)` calls to `handleEditRule(rule.id, groupKey)`
- Update `handleDeleteRule(rule.id)` calls to `handleDeleteRule(rule.id, groupKey)`
- Update `handleAddRule()` calls to `handleAddRule(groupKey)`
- Add a `type` badge next to the `lob` badge in the group header (e.g. `<Badge>{group.type}</Badge>`)

**Step 12: Update the JSX — Recipes section (lines 822-1041)**

Similar changes:

- Replace `localGroupedDsls` iterations with `Object.entries(groupedRecipes)`
- Remove `.filter(([groupKey]) => groupKey.startsWith('TDMRecipes'))` — no longer needed
- Remove `as Array<...>` casts and `const recipe = item as TdmRecipeConfig;` casts
- Update handler calls to include `groupKey`
- Update `handleAddRecipe()` to `handleAddRecipe(groupKey)`

**Step 13: Verify build**

Run: `cd packages/ui && npx vite build`
Expected: Build succeeds with no errors.

**Step 14: Commit**

```bash
git add packages/ui/src/components/configuration/SystemConfiguration.tsx
git commit -m "refactor: SystemConfiguration uses DslListConfig groups for CRUD"
```

---

### Task 9: Run full build and verify

**Files:** None (verification only)

**Step 1: Run API tests**

Run: `cd packages/api && npx vitest run`
Expected: All tests pass.

**Step 2: Run UI build**

Run: `cd packages/ui && npx vite build`
Expected: Build succeeds.

**Step 3: Start dev server and manually verify**

Run: `cd packages/ui && npx vite --port 5173 &`

1. Open browser to `http://localhost:5173`
2. Log in as admin
3. Go to Settings > System Configuration
4. Verify DSLs Management shows grouped rules (TestDataFlavorsBANK, TestDataFlavorsCARD, TestDataReconBANK)
5. Verify each group shows lob + type badges
6. Edit a rule — regex tester should work
7. Check Test Data Inventory — ClassificationPicker should still offer semantic suggestions
8. Check Execution Builder — TDM Recipe combobox should show recipes

**Step 4: Final commit (if any fixups needed)**

```bash
git add -A
git commit -m "fix: address any issues found during manual verification"
```
