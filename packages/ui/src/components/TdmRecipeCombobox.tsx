import React, { useRef, useState } from 'react';

import { BookOpen, Check, ChevronsUpDown, X } from 'lucide-react';

import { configApi } from '../services/apiClient';
import {
  flattenRecipesFromGrouped,
  TdmRecipeConfig,
} from '../services/configService';
import { useLobStore } from '../stores/lobStore';

import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';

// Hardcoded recipes removed in favor of dynamic API fetching

interface TdmRecipeComboboxProps {
  onSelect: (recipes: TdmRecipeConfig[]) => void;
}

export function TdmRecipeCombobox({ onSelect }: TdmRecipeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<TdmRecipeConfig[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeLob } = useLobStore();

  React.useEffect(() => {
    const promise =
      activeLob === 'all' ? configApi.load() : configApi.loadByLob(activeLob);
    promise.then(data => {
      setRecipes(flattenRecipesFromGrouped(data.recipes));
    });
  }, [activeLob]);

  const toggleRecipe = (recipeId: string) => {
    const isSelected = selectedRecipeIds.includes(recipeId);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedRecipeIds.filter(id => id !== recipeId);
    } else {
      newSelection = [...selectedRecipeIds, recipeId];
    }
    setSelectedRecipeIds(newSelection);
    onSelect(
      newSelection.map(id => recipes.find(r => r.id === id)!).filter(Boolean)
    );
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRecipeIds([]);
    onSelect([]);
  };

  const selectedRecipes = React.useMemo(() => {
    return recipes.filter(recipe => selectedRecipeIds.includes(recipe.id));
  }, [recipes, selectedRecipeIds]);

  const selectedRecipeNames = selectedRecipes.map(r => r.name).join(', ');

  const uniqueTags = React.useMemo(() => {
    const tags = new Set<string>();
    selectedRecipes.forEach(recipe => {
      recipe.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [selectedRecipes]);

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
        {selectedRecipeIds.length > 0 ? (
          <span className="flex items-center gap-2 truncate">
            <span>{selectedRecipeNames}</span>
            <span className="text-xs text-gray-400">
              ({uniqueTags.length} tags)
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">Search for a recipe...</span>
        )}
        <span className="flex items-center gap-1">
          {selectedRecipeIds.length > 0 && (
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
                {recipes.map(recipe => (
                  <CommandItem
                    key={recipe.id}
                    value={`${recipe.name} ${recipe.description} ${recipe.tags.join(' ')}`}
                    onSelect={() => toggleRecipe(recipe.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedRecipeIds.includes(recipe.id)
                          ? 'opacity-100'
                          : 'opacity-0'
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
