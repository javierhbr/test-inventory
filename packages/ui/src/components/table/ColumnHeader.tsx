import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { Button } from '../ui/button';
import { cn } from '../ui/utils';

export interface ColumnHeaderProps {
  title: string;
  columnKey: string;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc' | null;
  setSort: (column: string | null, direction: 'asc' | 'desc' | null) => void;
  className?: string;
}

export function ColumnHeader({
  title,
  columnKey,
  sortColumn,
  sortDirection,
  setSort,
  className,
}: ColumnHeaderProps) {
  const isSorted = sortColumn === columnKey;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="data-[state=open]:bg-accent -ml-3 h-8"
        onClick={() => {
          if (isSorted && sortDirection === 'asc') setSort(columnKey, 'desc');
          else if (isSorted && sortDirection === 'desc') setSort(null, null);
          else setSort(columnKey, 'asc');
        }}
      >
        <span>{title}</span>
        {isSorted && sortDirection === 'desc' ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : isSorted && sortDirection === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    </div>
  );
}
