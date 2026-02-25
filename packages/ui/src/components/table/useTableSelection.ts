import { useMemo } from 'react';

interface UseTableSelectionParams {
  selectedIds: Set<string>;
  paginatedIds: string[];
  allFilteredIds: string[];
  selectAllPages: boolean;
}

interface UseTableSelectionResult {
  isAllSelected: boolean;
  isIndeterminate: boolean;
  selectedCount: number;
}

export function useTableSelection({
  selectedIds,
  paginatedIds,
  allFilteredIds,
  selectAllPages,
}: UseTableSelectionParams): UseTableSelectionResult {
  return useMemo(() => {
    const isCurrentPageSelected =
      paginatedIds.length > 0 && paginatedIds.every(id => selectedIds.has(id));
    const isAllPagesSelected =
      allFilteredIds.length > 0 &&
      allFilteredIds.every(id => selectedIds.has(id));
    const isAllSelected = selectAllPages
      ? isAllPagesSelected
      : isCurrentPageSelected;
    const isIndeterminate = selectedIds.size > 0 && !isAllSelected;

    return {
      isAllSelected,
      isIndeterminate,
      selectedCount: selectedIds.size,
    };
  }, [selectedIds, paginatedIds, allFilteredIds, selectAllPages]);
}
