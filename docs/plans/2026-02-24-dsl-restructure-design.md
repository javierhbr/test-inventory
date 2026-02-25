# DSL Restructure Design

**Date:** 2026-02-24
**Approach:** Thin API + Client-side Hydration

## Problem

The current DSL system uses flat `SemanticRuleConfig` objects where each rule carries its own `lob` and `category`. The user wants a grouped `DslList` structure where rules are organized by container, and the client can hydrate them into full `SemanticRule` objects with `RegExp`, `parse()`, and `format()` functions.

## Decision Summary

| Decision                         | Choice                              |
| -------------------------------- | ----------------------------------- |
| Where do runtime functions live? | Client-side only                    |
| Who groups the data?             | API returns pre-grouped             |
| Recipes in DslList?              | No — separate type                  |
| Admin regex tester?              | Keep it                             |
| Naming convention                | No "Serialized" prefix on API types |

## Types

### API Types (`packages/api/src/types/domain.ts`)

```typescript
// Rule without lob/category — those live on the container
export interface SemanticRuleConfig {
  id: string;
  key: string;
  regexString: string;
  suggestions: string[];
}

// Grouped container
export interface DslListConfig {
  lob: Lob;
  type: 'flavor' | 'recon';
  items: SemanticRuleConfig[];
}

// TdmRecipeConfig stays unchanged
export interface TdmRecipeConfig {
  id: string;
  lob: Lob;
  name: string;
  description: string;
  tags: string[];
}

// Typed groupings
export type GroupedDsls = Record<string, DslListConfig>;
export type GroupedRecipes = Record<string, TdmRecipeConfig[]>;
```

### Client Types (`packages/ui/src/services/types.ts`)

```typescript
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

## API Response

`GET /api/dsls` returns:

```json
{
  "success": true,
  "data": {
    "grouped": {
      "TestDataFlavorsBANK": { "lob": "BANK", "type": "flavor", "items": [...] },
      "TestDataFlavorsCARD": { "lob": "CARD", "type": "flavor", "items": [...] },
      "TestDataReconBANK":   { "lob": "BANK", "type": "recon",  "items": [...] }
    },
    "recipes": {
      "TDMRecipesBANK": [...],
      "TDMRecipesCARD": [...]
    }
  }
}
```

No more flat `semanticRules[]` or `recipes[]` arrays at the top level.

## Hydration Utility (client-side)

```typescript
function hydrateRule(config: SemanticRuleConfig): SemanticRule {
  const regex = new RegExp(config.regexString, 'i');
  return {
    key: config.key,
    regex,
    parse: match => ({ [config.key]: match[1]?.toLowerCase() ?? '' }),
    format: parsed => `${config.key}:${parsed[config.key]}`,
    suggestions: config.suggestions,
  };
}

function hydrateDslList(config: DslListConfig): DslList {
  return {
    lob: config.lob,
    type: config.type,
    items: config.items.map(hydrateRule),
  };
}
```

Called inside `configService.loadSystemConfig()` after fetching.

## Files to Change

### API Package

| File                                | Change                                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `packages/api/src/types/domain.ts`  | Replace `SemanticRuleConfig` (remove lob/category), add `DslListConfig`, update `GroupedDsls` type, add `GroupedRecipes` |
| `packages/api/src/data/mockDsls.ts` | Restructure from flat arrays to `Record<string, DslListConfig>` and `Record<string, TdmRecipeConfig[]>`                  |
| `packages/api/src/lib/dslRoutes.ts` | Simplify — return pre-grouped mock data directly, no runtime grouping                                                    |

### UI Package

| File                                                               | Change                                                                                              |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `packages/ui/src/services/types.ts`                                | Add `SemanticRule`, `DslList` client types                                                          |
| `packages/ui/src/services/configService.ts`                        | Update `SystemConfig.dsls` shape, add hydration logic, update `loadSystemConfig()`                  |
| `packages/ui/src/components/ClassificationPicker.tsx`              | Use hydrated `SemanticRule` with `.regex`, `.parse()`, `.format()` instead of manual `new RegExp()` |
| `packages/ui/src/components/TdmRecipeCombobox.tsx`                 | Consume grouped recipes, flatten for display                                                        |
| `packages/ui/src/components/configuration/SystemConfiguration.tsx` | Iterate over `Record<string, DslListConfig>` groups, CRUD within groups                             |

## Mock Data Structure

```typescript
// mockDsls.ts
export const mockDslGroups: Record<string, DslListConfig> = {
  TestDataFlavorsBANK: {
    lob: 'BANK', type: 'flavor',
    items: [
      { id: 'rule-customer-type', key: 'customer-type', regexString: '...', suggestions: [...] },
      { id: 'rule-account-type', key: 'account-type', regexString: '...', suggestions: [...] },
      // ...
    ],
  },
  TestDataFlavorsCARD: {
    lob: 'CARD', type: 'flavor',
    items: [
      { id: 'rule-card', key: 'card', regexString: '...', suggestions: [...] },
    ],
  },
  TestDataReconBANK: {
    lob: 'BANK', type: 'recon',
    items: [
      { id: 'rule-schedule', key: 'schedule', regexString: '...', suggestions: [...] },
    ],
  },
};

export const mockRecipeGroups: Record<string, TdmRecipeConfig[]> = {
  TDMRecipesBANK: [/* bank recipes */],
  TDMRecipesCARD: [/* card recipes */],
};
```

## UI Component Impact

### ClassificationPicker

- Receives hydrated `DslList[]` (flattened from all groups)
- `tryParseSemanticTag()` uses `rule.regex` and `rule.parse(match)` directly
- `getSemanticSuggestions()` iterates over flattened `SemanticRule[]` items
- Singular tag enforcement via `rule.key` (unchanged logic)

### TdmRecipeCombobox

- Receives flattened `TdmRecipeConfig[]` from grouped recipes
- Filters by `activeLob` from `useLobStore` (unchanged)

### SystemConfiguration (Admin)

- Iterates `Object.entries(grouped)` to render DSL group sections
- Each group shows `lob` + `type` badges from the container
- Rule CRUD adds/edits/removes items within a specific group
- New group creation supported (pick lob + type)
