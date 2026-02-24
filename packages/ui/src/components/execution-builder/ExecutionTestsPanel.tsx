import { Plus, ShoppingCart, Upload } from 'lucide-react';

import { SearchAndFilters } from '../SearchAndFilters';
import { Badge } from '../ui/badge';
import { Button, buttonVariants } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Textarea } from '../ui/textarea';
import { cn } from '../ui/utils';

import { ITEMS_PER_PAGE, PaginationPage } from './utils';

import type { ExecutionBuilderViewModel } from './useExecutionBuilderViewModel';
import type { Test } from '../../services/types';

type ExecutionTestsPanelProps = Pick<
  ExecutionBuilderViewModel,
  | 'searchTerm'
  | 'setSearchTerm'
  | 'filterConfigs'
  | 'clearFilters'
  | 'filteredTests'
  | 'tests'
  | 'selectedCount'
  | 'isAllSelected'
  | 'isIndeterminate'
  | 'handleSelectAll'
  | 'showCsvDialog'
  | 'setShowCsvDialog'
  | 'csvInput'
  | 'setCsvInput'
  | 'handleCsvImport'
  | 'selectedTests'
  | 'addSelectedToCart'
  | 'paginatedTests'
  | 'handleSelectTest'
  | 'addToCart'
  | 'totalPages'
  | 'startIndex'
  | 'endIndex'
  | 'selectAllPages'
  | 'setSelectAllPages'
  | 'selectAllTests'
  | 'currentPage'
  | 'setCurrentPage'
  | 'pageNumbers'
>;

const PaginationControl = ({
  currentPage,
  totalPages,
  pageNumbers,
  onSetPage,
}: {
  currentPage: number;
  totalPages: number;
  pageNumbers: PaginationPage[];
  onSetPage: (page: number) => void;
}) => (
  <Pagination>
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious
          onClick={() => onSetPage(Math.max(1, currentPage - 1))}
          className={
            currentPage === 1
              ? 'pointer-events-none opacity-50'
              : 'cursor-pointer'
          }
        />
      </PaginationItem>

      {pageNumbers.map((page, index) => (
        <PaginationItem key={`${page}-${index}`}>
          {page === 'ellipsis' ? (
            <PaginationEllipsis />
          ) : (
            <PaginationLink
              onClick={() => onSetPage(page)}
              isActive={currentPage === page}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          )}
        </PaginationItem>
      ))}

      <PaginationItem>
        <PaginationNext
          onClick={() => onSetPage(Math.min(totalPages, currentPage + 1))}
          className={
            currentPage === totalPages
              ? 'pointer-events-none opacity-50'
              : 'cursor-pointer'
          }
        />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
);

export function ExecutionTestsPanel({
  searchTerm,
  setSearchTerm,
  filterConfigs,
  clearFilters,
  filteredTests,
  tests,
  selectedCount,
  isAllSelected,
  isIndeterminate,
  handleSelectAll,
  showCsvDialog,
  setShowCsvDialog,
  csvInput,
  setCsvInput,
  handleCsvImport,
  selectedTests,
  addSelectedToCart,
  paginatedTests,
  handleSelectTest,
  addToCart,
  totalPages,
  startIndex,
  endIndex,
  selectAllPages,
  setSelectAllPages,
  selectAllTests,
  currentPage,
  setCurrentPage,
  pageNumbers,
}: ExecutionTestsPanelProps) {
  return (
    <div className="col-span-5 space-y-4">
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search tests by name or ID..."
        filters={filterConfigs}
        onClearFilters={clearFilters}
        filteredCount={filteredTests.length}
        totalCount={tests.length}
        itemType="tests"
        selectedCount={selectedCount}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={handleSelectAll}
        selectAllLabel="Select all filtered tests"
      />

      <div className="space-y-4">
        <div className="flex gap-2">
          <Dialog open={showCsvDialog} onOpenChange={setShowCsvDialog}>
            <DialogTrigger
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'flex-1'
              )}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Tests from CSV</DialogTitle>
                <DialogDescription>
                  Paste your CSV with testIds to add multiple tests to cart
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Expected format:
                  </label>
                  <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
                    {`testId
TC-00123
TC-00145
TC-00198`}
                  </pre>
                </div>
                <Textarea
                  placeholder="Paste your CSV here..."
                  value={csvInput}
                  onChange={e => setCsvInput(e.target.value)}
                  rows={8}
                />
                <div className="flex gap-2">
                  <Button onClick={handleCsvImport} className="flex-1">
                    Import
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCsvDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {selectedTests.size > 0 && (
            <Button onClick={addSelectedToCart} className="flex-1">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart ({selectedTests.size})
            </Button>
          )}
        </div>
      </div>

      <Card className="flex-1 overflow-hidden border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Available Tests ({filteredTests.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-12 align-middle">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isAllSelected}
                        ref={el => {
                          if (el) (el as any).indeterminate = isIndeterminate;
                        }}
                        onCheckedChange={handleSelectAll}
                      />
                    </div>
                  </TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Labels</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTests.map((test: Test) => (
                  <TableRow key={test.id}>
                    <TableCell className="align-middle">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedTests.has(test.id)}
                          onCheckedChange={checked =>
                            handleSelectTest(test.id, checked === true)
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{test.id}</div>
                        <div
                          className="truncate text-xs text-gray-600"
                          title={test.name}
                        >
                          {test.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {test.labels.flow}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {test.labels.experience}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => addToCart(test)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {totalPages > 1 && (
          <div className="border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-muted-foreground text-sm">
                  Showing {startIndex + 1} to{' '}
                  {Math.min(endIndex, filteredTests.length)} of{' '}
                  {filteredTests.length} results
                </p>
                {filteredTests.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all-pages-execution"
                      checked={selectAllPages}
                      onCheckedChange={checked => {
                        setSelectAllPages(checked === true);
                        if (checked === true && selectedCount === 0) {
                          selectAllTests(filteredTests.map(test => test.id));
                        }
                      }}
                    />
                    <label
                      htmlFor="select-all-pages-execution"
                      className="text-muted-foreground cursor-pointer text-sm"
                    >
                      Select across all pages
                    </label>
                  </div>
                )}
              </div>

              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                pageNumbers={pageNumbers}
                onSetPage={setCurrentPage}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
