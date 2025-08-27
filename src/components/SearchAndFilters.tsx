import { Search, Filter, X } from 'lucide-react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  placeholder: string;
  options: FilterOption[];
  value: string | string[]; // Support both single and multiple values
  onChange: (value: string | string[]) => void;
  multiple?: boolean; // Flag to enable multiple selection
}

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
  itemType: string; // e.g., "tests", "registros de test data"
  selectedCount: number;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  selectAllLabel: string;
}

export function SearchAndFilters({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  onClearFilters,
  filteredCount,
  totalCount,
  itemType,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  selectAllLabel,
}: SearchAndFiltersProps) {
  const handleMultiSelectChange = (
    filterKey: string,
    optionValue: string,
    isChecked: boolean,
    currentValue: string | string[]
  ) => {
    const filter = filters.find(f => f.key === filterKey);
    if (!filter) return;

    // Handle 'all' option specially
    if (optionValue === 'all') {
      if (isChecked) {
        filter.onChange('all');
      }
      return;
    }

    let newValue: string[];

    if (Array.isArray(currentValue)) {
      if (isChecked) {
        newValue = [...currentValue, optionValue];
      } else {
        newValue = currentValue.filter(v => v !== optionValue);
      }
    } else {
      // Convert single value to array
      if (currentValue === 'all') {
        newValue = isChecked ? [optionValue] : [];
      } else {
        newValue = isChecked ? [currentValue, optionValue] : [currentValue];
      }
    }

    // If no values selected, set to 'all'
    if (newValue.length === 0) {
      filter.onChange('all');
    } else {
      filter.onChange(newValue);
    }
  };

  const removeSelectedValue = (
    filterKey: string,
    valueToRemove: string,
    currentValue: string | string[]
  ) => {
    const filter = filters.find(f => f.key === filterKey);
    if (!filter || !Array.isArray(currentValue)) return;

    const newValue = currentValue.filter(v => v !== valueToRemove);
    if (newValue.length === 0) {
      filter.onChange('all');
    } else {
      filter.onChange(newValue);
    }
  };

  const getSelectedOptionsLabel = (filter: FilterConfig) => {
    if (Array.isArray(filter.value)) {
      if (filter.value.length === 0) return filter.placeholder;
      if (filter.value.length === 1) {
        const option = filter.options.find(
          opt => opt.value === filter.value[0]
        );
        return option?.label || filter.value[0];
      }
      return `${filter.value.length} selected`;
    }

    if (filter.value === 'all') return filter.placeholder;
    const option = filter.options.find(opt => opt.value === filter.value);
    return option?.label || filter.value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filters and Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search Input - Now at the top */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Selected Filters Display */}
        {filters.some(
          filter => Array.isArray(filter.value) && filter.value.length > 0
        ) && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {filters.map(filter => {
                if (!Array.isArray(filter.value) || filter.value.length === 0)
                  return null;

                return filter.value.map(selectedValue => {
                  const option = filter.options.find(
                    opt => opt.value === selectedValue
                  );
                  if (!option) return null;

                  return (
                    <Badge
                      key={`${filter.key}-${selectedValue}`}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span className="text-xs text-muted-foreground">
                        {filter.label}:
                      </span>
                      {option.label}
                      <button
                        onClick={() =>
                          removeSelectedValue(
                            filter.key,
                            selectedValue,
                            filter.value
                          )
                        }
                        className="ml-1 rounded-full p-0.5 hover:bg-secondary-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                });
              })}
            </div>
          </div>
        )}

        {/* Filters Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          {filters.map(filter => (
            <div key={filter.key} className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-gray-500">
                {filter.label}
              </label>
              <Select
                value={
                  Array.isArray(filter.value)
                    ? filter.value.length === 0
                      ? 'all'
                      : filter.value[0]
                    : filter.value
                }
                onValueChange={value => {
                  if (!filter.multiple) {
                    filter.onChange(value as string);
                  }
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue>{getSelectedOptionsLabel(filter)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filter.multiple ? (
                    <>
                      {filter.options.map(option => {
                        const isSelected = Array.isArray(filter.value)
                          ? filter.value.includes(option.value)
                          : filter.value === option.value;

                        return (
                          <div
                            key={option.value}
                            className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent"
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={checked =>
                                handleMultiSelectChange(
                                  filter.key,
                                  option.value,
                                  checked as boolean,
                                  filter.value
                                )
                              }
                            />
                            <label className="flex-1 cursor-pointer text-sm">
                              {option.label}
                            </label>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    filter.options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          ))}

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500">
              ACTIONS
            </label>
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="h-10 w-full"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Summary and Select All */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} {itemType}
          </span>
          {filteredCount > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                ref={el => {
                  if (el && 'indeterminate' in el) {
                    (el as any).indeterminate = isIndeterminate;
                  }
                }}
                onCheckedChange={onSelectAll}
              />
              <span className="text-sm text-gray-600">
                {selectAllLabel} ({filteredCount})
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
