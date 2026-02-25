import { ShoppingCart, Trash2, X } from 'lucide-react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

import { FLOW_OPTIONS, PaginationPage } from './utils';

import type { ExecutionBuilderViewModel } from './useExecutionBuilderViewModel';

type ExecutionCartPanelProps = Pick<
  ExecutionBuilderViewModel,
  | 'cart'
  | 'clearCart'
  | 'cartSearchFilter'
  | 'setCartSearchFilter'
  | 'cartStartIndex'
  | 'cartEndIndex'
  | 'filteredCart'
  | 'handleRemoveFiltered'
  | 'paginatedCart'
  | 'removeFromCart'
  | 'cartTotalPages'
  | 'cartCurrentPage'
  | 'setCartCurrentPage'
  | 'cartPageNumbers'
>;

const CartPagination = ({
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

export function ExecutionCartPanel({
  cart,
  clearCart,
  cartSearchFilter,
  setCartSearchFilter,
  cartStartIndex,
  cartEndIndex,
  filteredCart,
  handleRemoveFiltered,
  paginatedCart,
  removeFromCart,
  cartTotalPages,
  cartCurrentPage,
  setCartCurrentPage,
  cartPageNumbers,
}: ExecutionCartPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Execution Cart ({cart.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={clearCart}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {cart.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p>No tests in cart</p>
            <p className="text-sm">Select tests from the left list</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
              <div className="flex flex-1 items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Filter by Flow:
                </label>
                <Select
                  value={cartSearchFilter}
                  onValueChange={value => setCartSearchFilter(value as string)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Flows</SelectItem>
                    {FLOW_OPTIONS.map(flow => (
                      <SelectItem key={flow} value={flow}>
                        {flow}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">
                  Showing {cartStartIndex + 1} to{' '}
                  {Math.min(cartEndIndex, filteredCart.length)} of{' '}
                  {filteredCart.length} items
                </span>
              </div>
              {cartSearchFilter !== 'all' && filteredCart.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveFiltered}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Filtered ({filteredCart.length})
                </Button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test</TableHead>
                    <TableHead>Data Requirements</TableHead>
                    <TableHead>Assigned Test Data</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCart.map(item => (
                    <TableRow key={item.test.id}>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">
                            {item.test.id}
                          </div>
                          <div className="text-xs text-gray-600">
                            {item.test.labels.flow}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {item.test.dataRequirements.slice(0, 2).join(', ')}
                          {item.test.dataRequirements.length > 2 && ' ...'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.assignedTestData ? (
                          <div className="text-xs">
                            <div className="font-mono">
                              {item.assignedTestData.id}
                            </div>
                            <div className="text-gray-500">
                              {item.assignedTestData.referenceId}
                            </div>
                            <Badge className="bg-green-100 text-xs text-green-800">
                              {item.assignedTestData.status}
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Not assigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.test.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {cartTotalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-muted-foreground text-sm">
                  Showing {cartStartIndex + 1} to{' '}
                  {Math.min(cartEndIndex, filteredCart.length)} of{' '}
                  {filteredCart.length} items
                </p>

                <CartPagination
                  currentPage={cartCurrentPage}
                  totalPages={cartTotalPages}
                  pageNumbers={cartPageNumbers}
                  onSetPage={setCartCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
