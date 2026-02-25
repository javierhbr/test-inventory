# Test Data Flavor — Component Architecture

## Overview

The "Create New Test Data" modal uses a **semantic tag system** to define test data characteristics ("flavor"). Customer Type and Account Type are no longer separate dropdowns — they are expressed as semantic tags (`customer-type:primary-user`, `account-type:checking`) inside a unified picker. An optional TDM Recipe combobox lets users pre-fill tags from curated presets.

## Component Graph

```
CreateTestDataDialog
├── TdmRecipeCombobox        (optional, pre-fills tags)
├── ClassificationPicker     (tag input with autocomplete)
├── Labels & Metadata        (project, environment, dataOwner, group, source)
└── Scope & Visibility       (manual / automated / platform)

EditTestDataDialog
└── ClassificationPicker     (same reusable component)
```

## Components

### ClassificationPicker

**File:** `ClassificationPicker.tsx`
**Props:**

| Prop          | Type                       | Description             |
| ------------- | -------------------------- | ----------------------- |
| `value`       | `string[]`                 | Currently selected tags |
| `onChange`    | `(tags: string[]) => void` | Called when tags change |
| `placeholder` | `string?`                  | Input placeholder text  |

**Exports:**

| Export                 | Type                                       | Description                                                    |
| ---------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| `ClassificationPicker` | Component                                  | The picker UI                                                  |
| `extractTagValue`      | `(tags: string[], key: string) => string?` | Extract the value portion of a `key:value` tag                 |
| `SINGULAR_TAG_KEYS`    | `Set<string>`                              | Keys that allow only one tag (`customer-type`, `account-type`) |

**Behavior:**

- Typing filters suggestions (semantic tags first, then plain classifications).
- Semantic tags use `key:value` format with autocomplete drill-down (e.g. type `account-type:` to see all account types).
- Singular tags (`customer-type`, `account-type`) auto-replace when a new value is selected.
- Keyboard navigation: Arrow keys, Enter/comma to add, Escape to dismiss, Backspace to remove last.
- Badges show with edit (pencil) and remove (x) buttons. Semantic tags get indigo styling.

**Semantic Rules (built-in):**

| Key             | Values                                                                           | Singular |
| --------------- | -------------------------------------------------------------------------------- | -------- |
| `customer-type` | `primary-user`, `authorized-user`, `company`, `retail`                           | Yes      |
| `account-type`  | `checking`, `savings`, `credit-card`, `debit-card`, `business`, `line-of-credit` | Yes      |
| `account`       | `primary`, `secondary`                                                           | No       |
| `transactions`  | `pending:<count>`, `completed:<count>`                                           | No       |
| `card`          | `active`, `expired`, `inactive`, `new`                                           | No       |
| `balance`       | `high`, `low`                                                                    | No       |
| `user`          | `primary`, `authorized`, `verified`, `mfa`                                       | No       |

Plus ~35 plain-text classifications (e.g. "Active account", "Expired credit card").

---

### TdmRecipeCombobox

**File:** `TdmRecipeCombobox.tsx`
**Props:**

| Prop       | Type                          | Description                    |
| ---------- | ----------------------------- | ------------------------------ |
| `onSelect` | `(recipe: TdmRecipe) => void` | Called when a recipe is chosen |

**TdmRecipe shape:**

```ts
interface TdmRecipe {
  id: string;
  name: string;
  description: string;
  tags: string[]; // e.g. ["customer-type:primary-user", "account-type:checking"]
}
```

**Built-in recipes:**

| Recipe                   | Key Tags                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Primary Checking Account | `customer-type:primary-user`, `account-type:checking`                              |
| Authorized Savings User  | `customer-type:authorized-user`, `account-type:savings`, `user:mfa`                |
| Business Credit Card     | `customer-type:company`, `account-type:credit-card`, `balance:high`                |
| Retail Debit Card        | `customer-type:retail`, `account-type:debit-card`, `user:verified`                 |
| Expired Card Scenario    | `customer-type:primary-user`, `account-type:credit-card`, `card:expired`           |
| Low Balance Account      | `customer-type:primary-user`, `account-type:checking`, `balance:low`               |
| Business Line of Credit  | `customer-type:company`, `account-type:line-of-credit`, `balance:high`             |
| MFA Verified User        | `customer-type:primary-user`, `account-type:checking`, `user:mfa`, `user:verified` |

Uses `cmdk` Command component for fuzzy search over recipe names and descriptions.

---

### CreateTestDataDialog

**File:** `CreateTestDataDialog.tsx`

The create modal derives `customer.type` and `account.type` for the `TestDataRecord` from the semantic tags — no separate dropdowns. Label maps translate tag values back to display strings:

```
customer-type:primary-user  ->  "Primary user"
account-type:credit-card    ->  "Credit Card"
```

**Validation:** Both `customer-type:` and `account-type:` tags are required before submit.

**Submit flow:**

1. Extract `customerTypeTag` and `accountTypeTag` via `extractTagValue()`.
2. Map to display labels via `CUSTOMER_TYPE_LABELS` / `ACCOUNT_TYPE_LABELS`.
3. Call simulated API, build `TestDataRecord`, pass to `onTestDataCreated`.

---

### EditTestDataDialog

**File:** `EditTestDataDialog.tsx`

Uses `ClassificationPicker` in place of the old comma-separated `Textarea`. Classifications are stored as `string[]` state, passed directly to the picker and to the updated `TestDataRecord` on save.

---

## Data Flow

```
TDM Recipe selected
  └──> tags merged into ClassificationPicker value (singular tags replace)

ClassificationPicker onChange
  └──> selectedClassifications state updated
        ├──> extractTagValue("customer-type") -> customerTypeTag (derived)
        ├──> extractTagValue("account-type")  -> accountTypeTag  (derived)
        └──> used directly in TestDataRecord.classifications

Submit
  └──> customerTypeTag / accountTypeTag mapped to display labels
        └──> TestDataRecord.customer.type / account.type
```
