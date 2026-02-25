import React, { useRef, useState } from 'react';

import { BookOpen, Check, ChevronsUpDown, X } from 'lucide-react';

import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';

export interface TdmRecipe {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

const TDM_RECIPES: TdmRecipe[] = [
  {
    id: 'recipe-primary-checking',
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
    id: 'recipe-business-credit',
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
    name: 'Expired Card Scenario',
    description: 'Primary user with an expired credit card for renewal testing',
    tags: [
      'customer-type:primary-user',
      'account-type:credit-card',
      'card:expired',
      'account:primary',
    ],
  },
  {
    id: 'recipe-low-balance',
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
    name: 'MFA Verified User',
    description: 'Fully verified user with MFA for security flow testing',
    tags: [
      'customer-type:primary-user',
      'account-type:checking',
      'user:mfa',
      'user:verified',
      'account:primary',
    ],
  },
];

interface TdmRecipeComboboxProps {
  onSelect: (recipe: TdmRecipe) => void;
}

export function TdmRecipeCombobox({ onSelect }: TdmRecipeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TdmRecipe | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (recipe: TdmRecipe) => {
    setSelected(recipe);
    setOpen(false);
    onSelect(recipe);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        <BookOpen className="mr-1 inline-block h-3.5 w-3.5" />
        TDM Recipe <span className="font-normal text-gray-400">(optional)</span>
      </label>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(!open)}
        className="w-full justify-between font-normal"
      >
        {selected ? (
          <span className="flex items-center gap-2 truncate">
            <span>{selected.name}</span>
            <span className="text-xs text-gray-400">
              ({selected.tags.length} tags)
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">Search for a recipe...</span>
        )}
        <span className="flex items-center gap-1">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ')
                  handleClear(e as unknown as React.MouseEvent);
              }}
              className="rounded-full p-0.5 hover:bg-gray-200"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5 text-gray-400" />
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </span>
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <Command>
            <CommandInput placeholder="Search recipes..." />
            <CommandList>
              <CommandEmpty>No recipe found.</CommandEmpty>
              <CommandGroup>
                {TDM_RECIPES.map(recipe => (
                  <CommandItem
                    key={recipe.id}
                    value={`${recipe.name} ${recipe.description}`}
                    onSelect={() => handleSelect(recipe)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selected?.id === recipe.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{recipe.name}</span>
                      <span className="text-xs text-gray-500">
                        {recipe.description}
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {recipe.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-block rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] text-indigo-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}

      {/* Click-outside to close */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
