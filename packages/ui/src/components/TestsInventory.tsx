import { useEffect, useState } from 'react';

import { Download, Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { testCatalogApi } from '../services/apiClient';
import { Test } from '../services/types';
import { usePermissionsStore } from '../stores/permissionsStore';
import { useTestsStore, selectFilteredTests } from '../stores/testsStore';

import { CreateTestDialog } from './CreateTestDialog';
import { FilterConfig, SearchAndFilters } from './SearchAndFilters';
import { TestDetail } from './TestDetail';
import { Badge } from './ui/badge';
import { Button, buttonVariants } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { cn } from './ui/utils';

const ITEMS_PER_PAGE = 10;

const STATUS_BADGE_VARIANTS: Record<string, string> = {
  PASSED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  SKIPPED: 'bg-yellow-100 text-yellow-800',
  BLOCKED: 'bg-gray-100 text-gray-800',
};

export function TestsInventory() {
  const hasPermission = usePermissionsStore(s => s.hasPermission);

  // Store state
  const tests = useTestsStore(s => s.tests);
  const filteredTests = useTestsStore(useShallow(selectFilteredTests));
  const searchTerm = useTestsStore(s => s.searchTerm);
  const filterFlow = useTestsStore(s => s.filterFlow);
  const filterStatus = useTestsStore(s => s.filterStatus);
  const filterRuntime = useTestsStore(s => s.filterRuntime);
  const filterTeam = useTestsStore(s => s.filterTeam);
  const selectedTestIds = useTestsStore(s => s.selectedTestIds);
  const currentPage = useTestsStore(s => s.currentPage);
  const selectAllPages = useTestsStore(s => s.selectAllPages);
  const selectedTest = useTestsStore(s => s.selectedTest);
  const editingTest = useTestsStore(s => s.editingTest);
  const showDeleteDialog = useTestsStore(s => s.showDeleteDialog);
  const testToDelete = useTestsStore(s => s.testToDelete);

  // Store actions
  const setSearchTerm = useTestsStore(s => s.setSearchTerm);
  const setFilterFlow = useTestsStore(s => s.setFilterFlow);
  const setFilterStatus = useTestsStore(s => s.setFilterStatus);
  const setFilterRuntime = useTestsStore(s => s.setFilterRuntime);
  const setFilterTeam = useTestsStore(s => s.setFilterTeam);
  const clearFilters = useTestsStore(s => s.clearFilters);
  const setSelectedTest = useTestsStore(s => s.setSelectedTest);
  const setEditingTest = useTestsStore(s => s.setEditingTest);
  const toggleTestSelection = useTestsStore(s => s.toggleTestSelection);
  const selectAllOnPage = useTestsStore(s => s.selectAllOnPage);
  const selectAllTests = useTestsStore(s => s.selectAllTests);
  const clearSelection = useTestsStore(s => s.clearSelection);
  const setCurrentPage = useTestsStore(s => s.setCurrentPage);
  const setSelectAllPages = useTestsStore(s => s.setSelectAllPages);
  const setShowDeleteDialog = useTestsStore(s => s.setShowDeleteDialog);
  const setTestToDelete = useTestsStore(s => s.setTestToDelete);
  const setTests = useTestsStore(s => s.setTests);
  const addTest = useTestsStore(s => s.addTest);
  const updateTest = useTestsStore(s => s.updateTest);
  const deleteTest = useTestsStore(s => s.deleteTest);
  const bulkDelete = useTestsStore(s => s.bulkDelete);
  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadTests = async () => {
    try {
      setIsLoadingTests(true);
      setLoadError(null);
      const records = await testCatalogApi.list();
      setTests(records);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Failed to load tests'
      );
    } finally {
      setIsLoadingTests(false);
    }
  };

  useEffect(() => {
    void loadTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTests = filteredTests.slice(startIndex, endIndex);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      if (selectAllPages) {
        selectAllTests(filteredTests.map(test => test.id));
      } else {
        selectAllOnPage(
          true,
          paginatedTests.map(test => test.id)
        );
      }
    } else {
      if (selectAllPages) {
        clearSelection();
      } else {
        selectAllOnPage(
          false,
          paginatedTests.map(test => test.id)
        );
      }
    }
  };

  const handleSelectTest = (testId: string, checked: boolean) => {
    toggleTestSelection(testId, checked);
  };

  // Selection state helpers
  const isCurrentPageSelected =
    paginatedTests.length > 0 &&
    paginatedTests.every(test => selectedTestIds.has(test.id));
  const isAllPagesSelected =
    filteredTests.length > 0 &&
    filteredTests.every(test => selectedTestIds.has(test.id));
  const isAllSelected = selectAllPages
    ? isAllPagesSelected
    : isCurrentPageSelected;
  const isIndeterminate = selectedTestIds.size > 0 && !isAllSelected;
  const selectedCount = selectedTestIds.size;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge
        className={STATUS_BADGE_VARIANTS[status] || 'bg-gray-100 text-gray-800'}
      >
        {status}
      </Badge>
    );
  };

  const generateTestsYaml = () => {
    const testsToExport =
      selectedCount > 0
        ? tests.filter(test => selectedTestIds.has(test.id))
        : filteredTests.length > 0
          ? filteredTests
          : tests;

    const yaml = `# Tests Inventory Export
# Generated: ${new Date().toISOString()}
# Total Tests: ${testsToExport.length}
# Selected Tests: ${selectedCount > 0 ? selectedCount : 'All filtered'}

tests:
${testsToExport
  .map(
    test => `  - id: ${test.id}
    name: ${test.name}
    version: ${test.version}
    flow: ${test.flow}
    team: ${test.team}
    labels:
      flow: ${test.labels.flow}
      intent: ${test.labels.intent}
      experience: ${test.labels.experience}
      project: ${test.labels.project}
    dataRequirements:
${test.dataRequirements.map(req => `      - ${req}`).join('\n')}
    supportedRuntimes:
${test.supportedRuntimes.map(runtime => `      - ${runtime}`).join('\n')}
    lastModified: ${test.lastModified}${
      test.lastExecution
        ? `
    lastExecution:
      date: ${test.lastExecution.date}
      status: ${test.lastExecution.status}
      runtime: ${test.lastExecution.runtime}`
        : ''
    }
    dialogGroupIdFile:
      bucket: my-test-dialogs
      path: tests/${test.labels.flow.toLowerCase()}-flow/${test.id.toLowerCase()}.yaml`
  )
  .join('\n')}`;

    return yaml;
  };

  const exportYaml = () => {
    if (selectedCount === 0) {
      alert('Please select at least one test to export');
      return;
    }

    const yaml = generateTestsYaml();
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename =
      selectedCount > 0
        ? `tests-selected-${selectedCount}-${timestamp}.yaml`
        : `tests-inventory-${timestamp}.yaml`;

    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter configuration for SearchAndFilters component
  const filterConfigs: FilterConfig[] = [
    {
      key: 'flow',
      label: 'FLOW',
      placeholder: 'Flow',
      value: filterFlow,
      onChange: setFilterFlow,
      variant: 'multi',
      options: [
        { value: 'all', label: 'All flows' },
        { value: 'Payment', label: 'Payment' },
        { value: 'Login', label: 'Login' },
        { value: 'Transfer', label: 'Transfer' },
        { value: 'Inquiry', label: 'Inquiry' },
        { value: 'Activation', label: 'Activation' },
      ],
    },
    {
      key: 'status',
      label: 'STATUS',
      placeholder: 'Status',
      value: filterStatus,
      onChange: setFilterStatus,
      variant: 'multi',
      options: [
        { value: 'all', label: 'All' },
        { value: 'passed', label: 'Passed' },
        { value: 'failed', label: 'Failed' },
        { value: 'never', label: 'Never Run' },
      ],
    },
    {
      key: 'runtime',
      label: 'RUNTIME',
      placeholder: 'Runtime',
      value: filterRuntime,
      onChange: setFilterRuntime,
      variant: 'multi',
      options: [
        { value: 'all', label: 'All' },
        { value: 'OCP Testing Studio', label: 'OCP Testing Studio' },
        { value: 'Xero', label: 'Xero' },
        { value: 'Sierra', label: 'Sierra' },
      ],
    },
    {
      key: 'team',
      label: 'TEAM',
      placeholder: 'Team',
      value: filterTeam,
      onChange: setFilterTeam,
      variant: 'multi',
      options: [
        { value: 'all', label: 'All teams' },
        { value: 'QA Team', label: 'QA Team' },
        { value: 'Core Team', label: 'Core Team' },
        { value: 'Mobile Team', label: 'Mobile Team' },
        { value: 'Web Team', label: 'Web Team' },
      ],
    },
  ];

  if (isLoadingTests) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-lg border bg-white">
        <div className="text-sm text-gray-600">Loading tests...</div>
      </div>
    );
  }

  const handleSoftDelete = (test: Test) => {
    setTestToDelete(test);
    setShowDeleteDialog(true);
  };

  const handleCreateTest = async (newTest: Test) => {
    const created = await testCatalogApi.create(newTest);
    addTest(created);
  };

  const handleUpdateTest = async (updated: Test) => {
    const result = await testCatalogApi.update(updated);
    updateTest(result);
  };

  const confirmDelete = async () => {
    if (testToDelete) {
      try {
        await testCatalogApi.delete(testToDelete.id);
        deleteTest(testToDelete.id);
      } catch (error) {
        alert(
          `Error deleting test: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCount === 0) {
      alert('Please select at least one test to delete');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedCount} test${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`
      )
    ) {
      try {
        await testCatalogApi.bulkDelete(Array.from(selectedTestIds));
        bulkDelete(selectedTestIds);
      } catch (error) {
        alert(
          `Error deleting selected tests: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tests Inventory</h2>
          <p className="text-gray-600">Test Cases and Scenarios Management</p>
        </div>
        <div className="flex gap-2">
          {hasPermission('create_tests') && (
            <CreateTestDialog onTestCreated={handleCreateTest}>
              <div
                className={cn(
                  buttonVariants({ variant: 'default', size: 'default' })
                )}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Test
              </div>
            </CreateTestDialog>
          )}
          {hasPermission('export_tests') && (
            <Button
              size="sm"
              variant="outline"
              onClick={exportYaml}
              disabled={selectedCount === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              {selectedCount > 0
                ? `Export YAML (${selectedCount})`
                : 'Export YAML'}
            </Button>
          )}
          {hasPermission('delete_tests') && selectedCount > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => void handleBulkDelete()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedCount})
            </Button>
          )}
        </div>
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-red-700">
                Failed to load API data: {loadError}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void loadTests()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  {selectedCount} test{selectedCount !== 1 ? 's' : ''} selected
                </Badge>
                <span className="text-sm text-blue-700">Ready to export</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search tests..."
        filters={filterConfigs}
        onClearFilters={clearFilters}
        filteredCount={filteredTests.length}
        totalCount={tests.length}
        itemType="tests"
        selectedCount={selectedCount}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={handleSelectAll}
        selectAllLabel="Select all"
      />

      {/* Tests Table */}
      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-12 align-middle">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      ref={el => {
                        if (el)
                          (el as HTMLInputElement).indeterminate =
                            isIndeterminate;
                      }}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Flow</TableHead>
                <TableHead>Labels</TableHead>
                <TableHead>Required Data</TableHead>
                <TableHead>Runtimes</TableHead>
                <TableHead>Last Execution</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTests.map(test => (
                <TableRow key={test.id}>
                  <TableCell className="align-middle">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedTestIds.has(test.id)}
                        onCheckedChange={checked =>
                          handleSelectTest(test.id, checked as boolean)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div>
                      <div className="font-medium">{test.id}</div>
                      <div className="text-xs text-gray-500">{test.team}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={test.name}>
                      {test.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {test.flow}
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
                    <div className="flex max-w-xs flex-wrap gap-1">
                      {test.dataRequirements.map((requirement, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-blue-100 text-xs text-blue-800"
                        >
                          {requirement}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {test.supportedRuntimes.slice(0, 2).join(', ')}
                      {test.supportedRuntimes.length > 2 && ' ...'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {test.lastExecution ? (
                      <div className="space-y-1">
                        {getStatusBadge(test.lastExecution.status)}
                        <div className="text-xs text-gray-500">
                          {new Date(
                            test.lastExecution.date
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {test.lastExecution.runtime}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">Never Run</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{test.version}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger
                          className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' })
                          )}
                          onClick={() => setSelectedTest(test)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </DialogTrigger>
                        <DialogContent className="flex h-[90vh] !w-[50vw] !max-w-[50vw] flex-col bg-gradient-to-br from-white to-gray-50 p-0 sm:!max-w-[50vw]">
                          <DialogHeader className="shrink-0 border-b border-gray-200 px-6 pb-4 pt-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <DialogTitle className="text-2xl font-bold text-gray-900">
                                    Test Details of {test.id}
                                  </DialogTitle>
                                  <Badge
                                    variant="outline"
                                    className="px-3 py-1"
                                  >
                                    {test.version}
                                  </Badge>
                                  <Badge
                                    className={`px-3 py-1 ${
                                      test.lastExecution?.status === 'PASSED'
                                        ? 'bg-green-100 text-green-800'
                                        : test.lastExecution?.status ===
                                            'FAILED'
                                          ? 'bg-red-100 text-red-800'
                                          : test.lastExecution?.status ===
                                              'SKIPPED'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : test.lastExecution?.status ===
                                                'BLOCKED'
                                              ? 'bg-gray-100 text-gray-800'
                                              : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {test.lastExecution?.status || 'Never Run'}
                                  </Badge>
                                </div>
                                <DialogDescription className="text-lg font-medium text-gray-700">
                                  {test.name}
                                </DialogDescription>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>
                                    Team:{' '}
                                    <span className="font-medium text-gray-700">
                                      {test.team}
                                    </span>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Modified:{' '}
                                    <span className="font-medium text-gray-700">
                                      {new Date(
                                        test.lastModified
                                      ).toLocaleDateString()}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {hasPermission('edit_tests') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingTest(test)}
                                    className="hover:bg-blue-50"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Button>
                                )}
                                {hasPermission('delete_tests') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSoftDelete(test)}
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </DialogHeader>
                          <div className="flex-1 overflow-hidden p-6">
                            <div className="h-full overflow-y-auto">
                              {selectedTest && (
                                <TestDetail test={selectedTest} />
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {hasPermission('edit_tests') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTest(test)}
                          title="Edit test"
                          className="hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}

                      {hasPermission('delete_tests') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSoftDelete(test)}
                          title="Delete test"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
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
                      id="select-all-pages"
                      checked={selectAllPages}
                      onCheckedChange={checked => {
                        setSelectAllPages(checked as boolean);
                        if (checked && selectedCount === 0) {
                          selectAllTests(filteredTests.map(test => test.id));
                        }
                      }}
                    />
                    <label
                      htmlFor="select-all-pages"
                      className="text-muted-foreground cursor-pointer text-sm"
                    >
                      Select across all pages
                    </label>
                  </div>
                )}
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => setCurrentPage(page as number)}
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
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Test Dialog */}
      {editingTest && (
        <CreateTestDialog
          onTestCreated={handleUpdateTest}
          editTest={editingTest}
          onClose={() => setEditingTest(null)}
        >
          <div></div>
        </CreateTestDialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Test
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this test? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {testToDelete && (
            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="font-medium text-red-900">
                  {testToDelete.id}
                </div>
                <div className="mt-1 text-sm text-red-700">
                  {testToDelete.name}
                </div>
                <div className="mt-2 text-xs text-red-600">
                  Team: {testToDelete.team} • Version: {testToDelete.version}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => void confirmDelete()}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Test
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
