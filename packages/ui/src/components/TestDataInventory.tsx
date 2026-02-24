import { useEffect, useState } from 'react';

import { Download, Eye, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { testDataApi } from '../services/apiClient';
import { TestDataRecord } from '../services/types';
import { useHasPermission } from '../stores/permissionsStore';
import {
  selectFilteredTestData,
  useTestDataStore,
} from '../stores/testDataStore';

import { CreateTestDataDialog } from './CreateTestDataDialog';
import { EditTestDataDialog } from './EditTestDataDialog';
import { FilterConfig, SearchAndFilters } from './SearchAndFilters';
import { TestDataDetail } from './TestDataDetail';
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
  Available: 'bg-green-100 text-green-800',
  'In Use': 'bg-blue-100 text-blue-800',
  Consumed: 'bg-red-100 text-red-800',
  Reconditioning: 'bg-yellow-100 text-yellow-800',
  Inactive: 'bg-gray-100 text-gray-800',
};

const SCOPE_BADGE_VARIANTS: Record<string, string> = {
  manual: 'bg-purple-100 text-purple-800',
  automated: 'bg-blue-100 text-blue-800',
  platform: 'bg-orange-100 text-orange-800',
};

export function TestDataInventory() {
  const hasPermission = useHasPermission();

  // Store state
  const testData = useTestDataStore(s => s.testData);
  const filteredTestData = useTestDataStore(useShallow(selectFilteredTestData));
  const searchTerm = useTestDataStore(s => s.searchTerm);
  const filterStatus = useTestDataStore(s => s.filterStatus);
  const filterScope = useTestDataStore(s => s.filterScope);
  const filterAmbiente = useTestDataStore(s => s.filterAmbiente);
  const filterProyecto = useTestDataStore(s => s.filterProyecto);
  const filterTeam = useTestDataStore(s => s.filterTeam);
  const selectedDataIds = useTestDataStore(s => s.selectedDataIds);
  const currentPage = useTestDataStore(s => s.currentPage);
  const selectAllPages = useTestDataStore(s => s.selectAllPages);
  const selectedTestData = useTestDataStore(s => s.selectedTestData);

  // Store actions
  const setSearchTerm = useTestDataStore(s => s.setSearchTerm);
  const setFilterStatus = useTestDataStore(s => s.setFilterStatus);
  const setFilterScope = useTestDataStore(s => s.setFilterScope);
  const setFilterAmbiente = useTestDataStore(s => s.setFilterAmbiente);
  const setFilterProyecto = useTestDataStore(s => s.setFilterProyecto);
  const setFilterTeam = useTestDataStore(s => s.setFilterTeam);
  const clearFilters = useTestDataStore(s => s.clearFilters);
  const setSelectedTestData = useTestDataStore(s => s.setSelectedTestData);
  const setTestData = useTestDataStore(s => s.setTestData);
  const toggleDataSelection = useTestDataStore(s => s.toggleDataSelection);
  const selectAllOnPage = useTestDataStore(s => s.selectAllOnPage);
  const selectAllData = useTestDataStore(s => s.selectAllData);
  const clearSelection = useTestDataStore(s => s.clearSelection);
  const setCurrentPage = useTestDataStore(s => s.setCurrentPage);
  const setSelectAllPages = useTestDataStore(s => s.setSelectAllPages);
  const addTestData = useTestDataStore(s => s.addTestData);
  const updateTestData = useTestDataStore(s => s.updateTestData);
  const deleteTestData = useTestDataStore(s => s.deleteTestData);
  const bulkDelete = useTestDataStore(s => s.bulkDelete);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadTestData = async () => {
    try {
      setIsLoadingData(true);
      setLoadError(null);
      const records = await testDataApi.list();
      setTestData(records);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Failed to load test data'
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    void loadTestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTestData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTestData = filteredTestData.slice(startIndex, endIndex);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      if (selectAllPages) {
        selectAllData(filteredTestData.map(data => data.id));
      } else {
        selectAllOnPage(
          true,
          paginatedTestData.map(data => data.id)
        );
      }
    } else {
      if (selectAllPages) {
        clearSelection();
      } else {
        selectAllOnPage(
          false,
          paginatedTestData.map(data => data.id)
        );
      }
    }
  };

  const handleSelectData = (dataId: string, checked: boolean) => {
    toggleDataSelection(dataId, checked);
  };

  // Selection state helpers
  const isCurrentPageSelected =
    paginatedTestData.length > 0 &&
    paginatedTestData.every(data => selectedDataIds.has(data.id));
  const isAllPagesSelected =
    filteredTestData.length > 0 &&
    filteredTestData.every(data => selectedDataIds.has(data.id));
  const isAllSelected = selectAllPages
    ? isAllPagesSelected
    : isCurrentPageSelected;
  const isIndeterminate = selectedDataIds.size > 0 && !isAllSelected;
  const selectedCount = selectedDataIds.size;

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

  const getScopeBadge = (scope: TestDataRecord['scope']) => {
    return (
      <Badge
        className={`text-xs ${SCOPE_BADGE_VARIANTS[scope.visibility] || 'bg-gray-100 text-gray-800'}`}
      >
        {scope.visibility}
        {scope.platforms &&
          scope.platforms.length > 0 &&
          ` (${scope.platforms.length})`}
      </Badge>
    );
  };

  const handleCreateTestData = async (newTestData: TestDataRecord) => {
    const createdTestData = await testDataApi.create(newTestData);
    addTestData(createdTestData);
  };

  const handleUpdateTestData = async (updatedData: TestDataRecord) => {
    const updatedTestData = await testDataApi.update(updatedData);
    updateTestData(updatedTestData);
  };

  const handleRecondition = async (testDataId: string) => {
    try {
      const updatedTestData = await testDataApi.recondition(testDataId);
      updateTestData(updatedTestData);
    } catch (error) {
      alert(
        `Error reconditioning test data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleDeleteTestData = async (testDataId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this test data? This action cannot be undone.'
      )
    ) {
      try {
        await testDataApi.delete(testDataId);
        deleteTestData(testDataId);
      } catch (error) {
        alert(
          `Error deleting test data: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCount === 0) {
      alert('Please select at least one test data record to delete');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedCount} test data record${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`
      )
    ) {
      try {
        await testDataApi.bulkDelete(Array.from(selectedDataIds));
        bulkDelete(selectedDataIds);
      } catch (error) {
        alert(
          `Error deleting selected test data: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  };

  const generateTestDataYaml = () => {
    const dataToExport =
      selectedCount > 0
        ? testData.filter(data => selectedDataIds.has(data.id))
        : filteredTestData.length > 0
          ? filteredTestData
          : testData;

    const yaml = `# Test Data Inventory Export
# Generated: ${new Date().toISOString()}
# Total Test Data: ${dataToExport.length}
# Selected Test Data: ${selectedCount > 0 ? selectedCount : 'All filtered'}

testData:
${dataToExport
  .map(
    data => `  - id: ${data.id}
    team: ${data.team}
    customer:
      customerId: ${data.customer.customerId}
      name: ${data.customer.name}
      type: ${data.customer.type}
    account:
      accountId: ${data.account.accountId}
      referenceId: ${data.account.referenceId}
      type: ${data.account.type}
      createdAt: ${data.account.createdAt}
    classifications:
${data.classifications.map(cls => `      - ${cls}`).join('\n')}
    labels:
      project: ${data.labels.project}
      environment: ${data.labels.environment}
      dataOwner: ${data.labels.dataOwner}${
        data.labels.group
          ? `
      group: ${data.labels.group}`
          : ''
      }${
        data.labels.source
          ? `
      source: ${data.labels.source}`
          : ''
      }
    scope:
      visibility: ${data.scope.visibility}${
        data.scope.platforms
          ? `
      platforms:
${data.scope.platforms.map(platform => `        - ${platform}`).join('\n')}`
          : ''
      }
    status: ${data.status}${
      data.lastUsed
        ? `
    lastUsed:
      date: ${data.lastUsed.date}
      testId: ${data.lastUsed.testId}
      runtime: ${data.lastUsed.runtime}`
        : ''
    }`
  )
  .join('\n')}`;

    return yaml;
  };

  const exportYaml = () => {
    if (selectedCount === 0) {
      alert('Please select at least one test data record to export');
      return;
    }

    const yaml = generateTestDataYaml();
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename =
      selectedCount > 0
        ? `testdata-selected-${selectedCount}-${timestamp}.yaml`
        : `testdata-inventory-${timestamp}.yaml`;

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
      key: 'status',
      label: 'STATUS',
      placeholder: 'Status',
      value: filterStatus,
      onChange: setFilterStatus,
      variant: 'multi',
      options: [
        { value: 'all', label: 'All statuses' },
        { value: 'Available', label: 'Available' },
        { value: 'In Use', label: 'In Use' },
        { value: 'Consumed', label: 'Consumed' },
        { value: 'Reconditioning', label: 'Reconditioning' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    },
    {
      key: 'scope',
      label: 'SCOPE',
      placeholder: 'Scope',
      value: filterScope,
      onChange: setFilterScope,
      variant: 'multi',
      options: [
        { value: 'all', label: 'All' },
        { value: 'manual', label: 'Manual' },
        { value: 'automated', label: 'Automated' },
        { value: 'platform', label: 'Platform' },
      ],
    },
    {
      key: 'environment',
      label: 'ENVIRONMENT',
      placeholder: 'Environment',
      value: filterAmbiente,
      onChange: setFilterAmbiente,
      variant: 'multi',
      options: [
        { value: 'all', label: 'All' },
        { value: 'QA', label: 'QA' },
        { value: 'Preprod', label: 'Preprod' },
        { value: 'Sandbox', label: 'Sandbox' },
      ],
    },
    {
      key: 'project',
      label: 'PROJECT',
      placeholder: 'Project',
      value: filterProyecto,
      onChange: setFilterProyecto,
      variant: 'multi',
      options: [
        { value: 'all', label: 'All' },
        { value: 'Core Migration', label: 'Core Migration' },
        { value: 'Release Q3', label: 'Release Q3' },
        { value: 'Core Banking', label: 'Core Banking' },
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
        { value: 'all', label: 'All' },
        { value: 'QA-Team', label: 'QA-Team' },
        { value: 'DataTeam', label: 'DataTeam' },
      ],
    },
  ];

  if (isLoadingData) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-lg border bg-white">
        <div className="text-sm text-gray-600">Loading test data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Test Data Inventory
          </h2>
          <p className="mt-1 text-gray-500">
            Manage your test data and banking entities efficiently
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission('create_test_data') && (
            <CreateTestDataDialog onTestDataCreated={handleCreateTestData}>
              <div
                className={cn(
                  buttonVariants({ variant: 'default', size: 'default' })
                )}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Test Data
              </div>
            </CreateTestDataDialog>
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
          {hasPermission('delete_test_data') && selectedCount > 0 && (
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
                onClick={() => void loadTestData()}
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
                  {selectedCount} record{selectedCount !== 1 ? 's' : ''}{' '}
                  selected
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
        searchPlaceholder="Search test data..."
        filters={filterConfigs}
        onClearFilters={clearFilters}
        filteredCount={filteredTestData.length}
        totalCount={testData.length}
        itemType="test data records"
        selectedCount={selectedCount}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={handleSelectAll}
        selectAllLabel="Select all"
      />

      {/* Test Data Table */}
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
                <TableHead>Customer</TableHead>
                <TableHead>Account Ref</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Classifications</TableHead>
                <TableHead>Labels</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTestData.map(data => (
                <TableRow key={data.id}>
                  <TableCell className="align-middle">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedDataIds.has(data.id)}
                        onCheckedChange={checked =>
                          handleSelectData(data.id, checked as boolean)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div>
                      <div className="font-medium">{data.id}</div>
                      <div className="text-xs text-gray-500">{data.team}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{data.customer.name}</div>
                      <div className="text-xs text-gray-500">
                        {data.customer.customerId}
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.customer.type}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {data.account.referenceId}
                  </TableCell>
                  <TableCell>{data.account.type}</TableCell>
                  <TableCell>
                    <div className="flex max-w-xs flex-wrap gap-1">
                      {data.classifications
                        .slice(0, 2)
                        .map((classification, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {classification}
                          </Badge>
                        ))}
                      {data.classifications.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{data.classifications.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {data.labels.project}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {data.labels.environment} • {data.labels.dataOwner}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{data.team}</Badge>
                  </TableCell>
                  <TableCell>
                    {getScopeBadge(data.scope)}
                    {data.scope.platforms && (
                      <div className="mt-1 text-xs text-gray-500">
                        {data.scope.platforms.slice(0, 1).join(', ')}
                        {data.scope.platforms.length > 1 && '...'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(data.status)}</TableCell>
                  <TableCell>
                    {data.lastUsed ? (
                      <div className="text-sm">
                        <div>
                          {new Date(data.lastUsed.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {data.lastUsed.testId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {data.lastUsed.runtime}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Never used</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger
                          className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' })
                          )}
                          onClick={() => setSelectedTestData(data)}
                        >
                          <Eye className="h-4 w-4" />
                        </DialogTrigger>
                        <DialogContent className="flex h-[90vh] !w-[50vw] !max-w-[50vw] flex-col bg-gradient-to-br from-white to-gray-50 p-0 sm:!max-w-[50vw]">
                          <DialogHeader className="shrink-0 border-b border-gray-200 px-6 pb-4 pt-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <DialogTitle className="text-2xl font-bold text-gray-900">
                                    Test Data Details of {data.id}
                                  </DialogTitle>
                                  <Badge
                                    className={`px-3 py-1 ${
                                      data.status === 'Available'
                                        ? 'bg-green-100 text-green-800'
                                        : data.status === 'In Use'
                                          ? 'bg-blue-100 text-blue-800'
                                          : data.status === 'Consumed'
                                            ? 'bg-red-100 text-red-800'
                                            : data.status === 'Reconditioning'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {data.status}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="px-3 py-1"
                                  >
                                    {data.scope.visibility}
                                  </Badge>
                                </div>
                                <DialogDescription className="text-lg font-medium text-gray-700">
                                  {data.customer.name} - {data.customer.type}
                                </DialogDescription>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>
                                    Account:{' '}
                                    <span className="font-mono font-medium text-gray-700">
                                      {data.account.referenceId}
                                    </span>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Team:{' '}
                                    <span className="font-medium text-gray-700">
                                      {data.team}
                                    </span>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Environment:{' '}
                                    <span className="font-medium text-gray-700">
                                      {data.labels.environment}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {data.status === 'Consumed' &&
                                  hasPermission('edit_test_data') && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        void handleRecondition(data.id)
                                      }
                                      className="hover:bg-yellow-50"
                                    >
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Recondition
                                    </Button>
                                  )}
                              </div>
                            </div>
                          </DialogHeader>
                          <div className="flex-1 overflow-hidden p-6">
                            <div className="h-full overflow-y-auto">
                              {selectedTestData && (
                                <TestDataDetail testData={selectedTestData} />
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {hasPermission('edit_test_data') && (
                        <EditTestDataDialog
                          testData={data}
                          onTestDataUpdated={handleUpdateTestData}
                        >
                          <div
                            className={cn(
                              buttonVariants({ variant: 'outline', size: 'sm' })
                            )}
                          >
                            <Pencil className="h-4 w-4" />
                          </div>
                        </EditTestDataDialog>
                      )}

                      {data.status === 'Consumed' &&
                        hasPermission('edit_test_data') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleRecondition(data.id)}
                            className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                            title="Recondition"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}

                      {hasPermission('delete_test_data') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleDeleteTestData(data.id)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
                  {Math.min(endIndex, filteredTestData.length)} of{' '}
                  {filteredTestData.length} results
                </p>
                {filteredTestData.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all-pages-testdata"
                      checked={selectAllPages}
                      onCheckedChange={checked => {
                        setSelectAllPages(checked as boolean);
                        if (checked && selectedCount === 0) {
                          selectAllData(filteredTestData.map(data => data.id));
                        }
                      }}
                    />
                    <label
                      htmlFor="select-all-pages-testdata"
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
    </div>
  );
}
