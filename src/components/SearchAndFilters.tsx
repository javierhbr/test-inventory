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

interface BaseFilterConfig {
  key: string;
  label: string;
  placeholder: string;
  options: FilterOption[];
}

interface SingleSelectFilterConfig extends BaseFilterConfig {
  variant: 'single';
  value: string;
  onChange: (value: string) => void;
}

interface MultiSelectFilterConfig extends BaseFilterConfig {
  variant: 'multi';
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

export type FilterConfig = SingleSelectFilterConfig | MultiSelectFilterConfig;

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
  const isMultiFilter = (
    filter: FilterConfig
  ): filter is MultiSelectFilterConfig => filter.variant === 'multi';

  const getMultiSelectedValues = (value: string | string[]): string[] => {
    if (Array.isArray(value)) {
      return value;
    }

    return value === 'all' ? [] : [value];
  };

  const handleMultiSelectChange = (
    filter: MultiSelectFilterConfig,
    optionValue: string,
    isChecked: boolean
  ) => {
    // Handle 'all' option specially
    if (optionValue === 'all') {
      if (isChecked) {
        filter.onChange('all');
      }
      return;
    }

    const currentValues = getMultiSelectedValues(filter.value);
    const newValue = isChecked
      ? [...new Set([...currentValues, optionValue])]
      : currentValues.filter(v => v !== optionValue);

    // If no values selected, set to 'all'
    if (newValue.length === 0) {
      filter.onChange('all');
    } else {
      filter.onChange(newValue);
    }
  };

  const removeSelectedValue = (
    filter: MultiSelectFilterConfig,
    valueToRemove: string,
  ) => {
    const newValue = getMultiSelectedValues(filter.value).filter(
      v => v !== valueToRemove
    );
    if (newValue.length === 0) {
      filter.onChange('all');
    } else {
      filter.onChange(newValue);
    }
  };

  const getSelectedOptionsLabel = (filter: FilterConfig) => {
    if (isMultiFilter(filter)) {
      const selectedValues = getMultiSelectedValues(filter.value);

      if (selectedValues.length === 0) return filter.placeholder;
      if (selectedValues.length === 1) {
        const option = filter.options.find(
          opt => opt.value === selectedValues[0]
        );
        return option?.label || selectedValues[0];
      }
      return `${selectedValues.length} selected`;
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
          filter =>
            isMultiFilter(filter) && getMultiSelectedValues(filter.value).length > 0
        ) && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {filters.map(filter => {
                if (!isMultiFilter(filter))
                  return null;

                const selectedValues = getMultiSelectedValues(filter.value);
                if (selectedValues.length === 0)
                  return null;

                return selectedValues.map(selectedValue => {
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
                        onClick={() => removeSelectedValue(filter, selectedValue)}
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
                  isMultiFilter(filter)
                    ? getMultiSelectedValues(filter.value)[0] || 'all'
                    : filter.value
                }
                onValueChange={value =>
                  !isMultiFilter(filter)
                    ? filter.onChange(value as string)
                    : undefined
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue>{getSelectedOptionsLabel(filter)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {isMultiFilter(filter) ? (
                    <>
                      {filter.options.map(option => {
                        const selectedValues = getMultiSelectedValues(
                          filter.value
                        );
                        const isSelected =
                          option.value === 'all'
                            ? filter.value === 'all'
                            : selectedValues.includes(option.value);

                        return (
                          <div
                            key={option.value}
                            className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent"
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={checked =>
                                handleMultiSelectChange(
                                  filter,
                                  option.value,
                                  checked === true
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
