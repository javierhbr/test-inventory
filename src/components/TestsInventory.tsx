import { useMemo, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
// Tabs import removed because it's unused in this file
import { Download, Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { CreateTestDialog } from './CreateTestDialog';
import { FilterConfig, SearchAndFilters } from './SearchAndFilters';
import { TestDetail } from './TestDetail';
import { usePermissions } from '../contexts/PermissionsContext';
import { Checkbox } from './ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';

interface Test {
  id: string;
  name: string;
  flow: string;
  labels: {
    flow: string;
    intent: string;
    experience: string;
    project: string;
  };
  dataRequirements: string[];
  supportedRuntimes: string[];
  lastExecution: {
    date: string;
    status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'BLOCKED';
    runtime: string;
  } | null;
  lastModified: string;
  version: string;
  team: string;
}

const mockTests: Test[] = [
  {
    id: 'TC-00123',
    name: 'Payment of expired card with authorized user',
    flow: 'Payment -> Validation -> Confirmation',
    labels: {
      flow: 'Payment',
      intent: 'Negative',
      experience: 'Mobile',
      project: 'Release Q3',
    },
    dataRequirements: [
      'Expired account',
      'Authorized user',
      'Expired credit card',
    ],
    supportedRuntimes: ['OCP Testing Studio', 'Xero'],
    lastExecution: {
      date: '2025-08-15T10:30:00Z',
      status: 'FAILED',
      runtime: 'OCP Testing Studio',
    },
    lastModified: '2025-08-20T09:15:00Z',
    version: 'v1.2',
    team: 'QA Team',
  },
  {
    id: 'TC-00145',
    name: 'Login validation with active business account',
    flow: 'Login -> Authentication -> Dashboard',
    labels: {
      flow: 'Login',
      intent: 'Positive',
      experience: 'Web',
      project: 'Core Banking',
    },
    dataRequirements: ['Business account', 'Primary user'],
    supportedRuntimes: ['OCP Testing Studio', 'Sierra'],
    lastExecution: {
      date: '2025-08-18T14:22:00Z',
      status: 'PASSED',
      runtime: 'Sierra',
    },
    lastModified: '2025-08-19T16:45:00Z',
    version: 'v2.1',
    team: 'Core Team',
  },
  {
    id: 'TC-00156',
    name: 'Transfer funds between savings accounts',
    flow: 'Transfer -> Validation -> Processing -> Confirmation',
    labels: {
      flow: 'Transfer',
      intent: 'Positive',
      experience: 'Mobile',
      project: 'Banking App',
    },
    dataRequirements: ['Source account', 'Target account', 'Authorized user'],
    supportedRuntimes: ['OCP Testing Studio', 'Xero', 'Sierra'],
    lastExecution: {
      date: '2025-08-19T09:15:00Z',
      status: 'PASSED',
      runtime: 'OCP Testing Studio',
    },
    lastModified: '2025-08-20T10:30:00Z',
    version: 'v1.5',
    team: 'Mobile Team',
  },
  {
    id: 'TC-00167',
    name: 'Account balance inquiry for premium customer',
    flow: 'Inquiry -> Authentication -> Balance Display',
    labels: {
      flow: 'Inquiry',
      intent: 'Positive',
      experience: 'Web',
      project: 'Customer Portal',
    },
    dataRequirements: ['Premium account', 'Verified customer'],
    supportedRuntimes: ['Sierra', 'Xero'],
    lastExecution: {
      date: '2025-08-17T16:45:00Z',
      status: 'PASSED',
      runtime: 'Sierra',
    },
    lastModified: '2025-08-18T08:20:00Z',
    version: 'v2.3',
    team: 'Web Team',
  },
  {
    id: 'TC-00178',
    name: 'Card activation with PIN setup',
    flow: 'Activation -> Verification -> PIN Setup -> Confirmation',
    labels: {
      flow: 'Activation',
      intent: 'Positive',
      experience: 'Mobile',
      project: 'Card Services',
    },
    dataRequirements: ['New card', 'Customer profile', 'Phone verification'],
    supportedRuntimes: ['OCP Testing Studio', 'Xero'],
    lastExecution: {
      date: '2025-08-16T13:30:00Z',
      status: 'FAILED',
      runtime: 'Xero',
    },
    lastModified: '2025-08-19T11:15:00Z',
    version: 'v1.8',
    team: 'QA Team',
  },
  {
    id: 'TC-00189',
    name: 'Payment validation with insufficient funds',
    flow: 'Payment -> Validation -> Error Handling',
    labels: {
      flow: 'Payment',
      intent: 'Negative',
      experience: 'Web',
      project: 'Payment Gateway',
    },
    dataRequirements: ['Low balance account', 'Payment request'],
    supportedRuntimes: ['Sierra', 'OCP Testing Studio'],
    lastExecution: {
      date: '2025-08-20T07:45:00Z',
      status: 'PASSED',
      runtime: 'Sierra',
    },
    lastModified: '2025-08-20T12:00:00Z',
    version: 'v3.1',
    team: 'Core Team',
  },
  {
    id: 'TC-00190',
    name: 'Multi-factor authentication login',
    flow: 'Login -> Primary Auth -> MFA -> Dashboard',
    labels: {
      flow: 'Login',
      intent: 'Positive',
      experience: 'Web',
      project: 'Security Enhancement',
    },
    dataRequirements: ['MFA enabled account', 'Mobile device', 'Email access'],
    supportedRuntimes: ['OCP Testing Studio', 'Sierra', 'Xero'],
    lastExecution: {
      date: '2025-08-19T15:20:00Z',
      status: 'PASSED',
      runtime: 'OCP Testing Studio',
    },
    lastModified: '2025-08-20T14:10:00Z',
    version: 'v2.0',
    team: 'Core Team',
  },
  {
    id: 'TC-00201',
    name: 'International wire transfer initiation',
    flow: 'Transfer -> Compliance Check -> Authorization -> Processing',
    labels: {
      flow: 'Transfer',
      intent: 'Positive',
      experience: 'Web',
      project: 'International Banking',
    },
    dataRequirements: [
      'Premium account',
      'International recipient',
      'Compliance documents',
    ],
    supportedRuntimes: ['Sierra', 'OCP Testing Studio'],
    lastExecution: {
      date: '2025-08-18T11:30:00Z',
      status: 'BLOCKED',
      runtime: 'Sierra',
    },
    lastModified: '2025-08-19T09:45:00Z',
    version: 'v1.0',
    team: 'Web Team',
  },
  {
    id: 'TC-00212',
    name: 'Mobile app biometric login setup',
    flow: 'Activation -> Biometric Registration -> Verification',
    labels: {
      flow: 'Activation',
      intent: 'Positive',
      experience: 'Mobile',
      project: 'Mobile Security',
    },
    dataRequirements: ['Mobile app user', 'Biometric capable device'],
    supportedRuntimes: ['OCP Testing Studio'],
    lastExecution: {
      date: '2025-08-17T14:15:00Z',
      status: 'SKIPPED',
      runtime: 'OCP Testing Studio',
    },
    lastModified: '2025-08-18T16:30:00Z',
    version: 'v1.3',
    team: 'Mobile Team',
  },
  {
    id: 'TC-00223',
    name: 'Account statement generation and download',
    flow: 'Inquiry -> Statement Generation -> Download',
    labels: {
      flow: 'Inquiry',
      intent: 'Positive',
      experience: 'Web',
      project: 'Document Services',
    },
    dataRequirements: ['Active account', 'Statement period data'],
    supportedRuntimes: ['Sierra', 'Xero', 'OCP Testing Studio'],
    lastExecution: {
      date: '2025-08-20T10:00:00Z',
      status: 'PASSED',
      runtime: 'Xero',
    },
    lastModified: '2025-08-20T13:45:00Z',
    version: 'v2.5',
    team: 'Web Team',
  },
  {
    id: 'TC-00234',
    name: 'Credit card payment processing',
    flow: 'Payment -> Card Validation -> Processing -> Receipt',
    labels: {
      flow: 'Payment',
      intent: 'Positive',
      experience: 'Mobile',
      project: 'Card Processing',
    },
    dataRequirements: [
      'Active credit card',
      'Merchant account',
      'Payment amount',
    ],
    supportedRuntimes: ['OCP Testing Studio', 'Xero'],
    lastExecution: {
      date: '2025-08-19T12:45:00Z',
      status: 'PASSED',
      runtime: 'Xero',
    },
    lastModified: '2025-08-20T15:20:00Z',
    version: 'v1.7',
    team: 'QA Team',
  },
  {
    id: 'TC-00245',
    name: 'Password reset with security questions',
    flow: 'Login -> Password Reset -> Security Questions -> New Password',
    labels: {
      flow: 'Login',
      intent: 'Positive',
      experience: 'Web',
      project: 'Account Recovery',
    },
    dataRequirements: [
      'User account',
      'Security questions setup',
      'Email access',
    ],
    supportedRuntimes: ['Sierra', 'OCP Testing Studio'],
    lastExecution: null,
    lastModified: '2025-08-20T16:00:00Z',
    version: 'v1.0',
    team: 'Core Team',
  },
  {
    id: 'TC-00198',
    name: 'Transfer between own accounts',
    flow: 'Transfer -> Validation -> Confirmation',
    labels: {
      flow: 'Transfer',
      intent: 'Positive',
      experience: 'Mobile',
      project: 'Release Q3',
    },
    dataRequirements: ['Active account', 'Primary user'],
    supportedRuntimes: ['OCP Testing Studio', 'Xero', 'Sierra'],
    lastExecution: null,
    lastModified: '2025-08-20T11:30:00Z',
    version: 'v1.0',
    team: 'Mobile Team',
  },
  {
    id: 'TC-00256',
    name: 'Balance inquiry with multiple accounts',
    flow: 'Inquiry -> Authentication -> Listing',
    labels: {
      flow: 'Inquiry',
      intent: 'Positive',
      experience: 'Mobile',
      project: 'Core Banking',
    },
    dataRequirements: ['Active account', 'Authorized user', 'Business account'],
    supportedRuntimes: ['OCP Testing Studio', 'Sierra'],
    lastExecution: {
      date: '2025-08-19T15:45:00Z',
      status: 'PASSED',
      runtime: 'OCP Testing Studio',
    },
    lastModified: '2025-08-20T08:30:00Z',
    version: 'v1.1',
    team: 'Core Team',
  },
  {
    id: 'TC-00267',
    name: 'New credit card activation',
    flow: 'Activation -> Validation -> Confirmation',
    labels: {
      flow: 'Activation',
      intent: 'Positive',
      experience: 'Web',
      project: 'Release Q3',
    },
    dataRequirements: ['Expired credit card', 'Primary user', 'Active account'],
    supportedRuntimes: ['Xero', 'Sierra'],
    lastExecution: {
      date: '2025-08-17T11:20:00Z',
      status: 'BLOCKED',
      runtime: 'Xero',
    },
    lastModified: '2025-08-20T14:15:00Z',
    version: 'v2.0',
    team: 'Web Team',
  },
];

const ITEMS_PER_PAGE = 10;

export function TestsInventory() {
  const { hasPermission } = usePermissions();
  const [tests, setTests] = useState<Test[]>(mockTests);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFlujo, setFilterFlujo] = useState<string | string[]>('all');
  const [filterStatus, setFilterStatus] = useState<string | string[]>('all');
  const [filterRuntime, setFilterRuntime] = useState<string | string[]>('all');
  const [filterTeam, setFilterTeam] = useState<string | string[]>('all');
  const [selectedTestIds, setSelectedTestIds] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAllPages, setSelectAllPages] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);

  const filteredTests = tests.filter(test => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.flow.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Updated filter logic to handle both single values and arrays
    const matchesFlujo =
      filterFlujo === 'all' ||
      (Array.isArray(filterFlujo)
        ? filterFlujo.includes(test.labels.flow)
        : test.labels.flow === filterFlujo);

    const matchesStatus =
      filterStatus === 'all' ||
      (Array.isArray(filterStatus)
        ? filterStatus.some(
            status =>
              (status === 'passed' &&
                test.lastExecution?.status === 'PASSED') ||
              (status === 'failed' &&
                test.lastExecution?.status === 'FAILED') ||
              (status === 'never' && !test.lastExecution)
          )
        : (filterStatus === 'passed' &&
            test.lastExecution?.status === 'PASSED') ||
          (filterStatus === 'failed' &&
            test.lastExecution?.status === 'FAILED') ||
          (filterStatus === 'never' && !test.lastExecution));

    const matchesRuntime =
      filterRuntime === 'all' ||
      (Array.isArray(filterRuntime)
        ? filterRuntime.some(runtime =>
            test.supportedRuntimes.includes(runtime)
          )
        : test.supportedRuntimes.includes(filterRuntime as string));

    const matchesTeam =
      filterTeam === 'all' ||
      (Array.isArray(filterTeam)
        ? filterTeam.includes(test.team)
        : test.team === filterTeam);

    return (
      matchesSearch &&
      matchesFlujo &&
      matchesStatus &&
      matchesRuntime &&
      matchesTeam
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTests = filteredTests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterFlujo, filterStatus, filterRuntime, filterTeam]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      if (selectAllPages) {
        // Select all tests across all pages
        const allIds = new Set(filteredTests.map(test => test.id));
        setSelectedTestIds(allIds);
      } else {
        // Select only current page
        const currentPageIds = new Set(paginatedTests.map(test => test.id));
        setSelectedTestIds(prevIds => {
          const newIds = new Set(prevIds);
          currentPageIds.forEach(id => newIds.add(id));
          return newIds;
        });
      }
    } else {
      if (selectAllPages) {
        // Deselect all
        setSelectedTestIds(new Set());
      } else {
        // Deselect only current page
        const currentPageIds = new Set(paginatedTests.map(test => test.id));
        setSelectedTestIds(prevIds => {
          const newIds = new Set(prevIds);
          currentPageIds.forEach(id => newIds.delete(id));
          return newIds;
        });
      }
    }
  };

  const handleSelectTest = (testId: string, checked: boolean) => {
    const newSelection = new Set(selectedTestIds);
    if (checked) {
      newSelection.add(testId);
    } else {
      newSelection.delete(testId);
    }
    setSelectedTestIds(newSelection);
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
    const variants = {
      PASSED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      SKIPPED: 'bg-yellow-100 text-yellow-800',
      BLOCKED: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge
        className={
          variants[status as keyof typeof variants] ||
          'bg-gray-100 text-gray-800'
        }
      >
        {status}
      </Badge>
    );
  };

  const generateTestsYaml = () => {
    // Export only selected tests, or all filtered tests if none selected
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
      value: filterFlujo,
      onChange: setFilterFlujo,
      multiple: true, // Enable multiple selection
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
      multiple: true, // Enable multiple selection
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
      multiple: true, // Enable multiple selection
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
      multiple: true, // Enable multiple selection
      options: [
        { value: 'all', label: 'All teams' },
        { value: 'QA Team', label: 'QA Team' },
        { value: 'Core Team', label: 'Core Team' },
        { value: 'Mobile Team', label: 'Mobile Team' },
        { value: 'Web Team', label: 'Web Team' },
      ],
    },
  ];

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterFlujo('all');
    setFilterStatus('all');
    setFilterRuntime('all');
    setFilterTeam('all');
  };

  const handleSoftDelete = (test: Test) => {
    setTestToDelete(test);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (testToDelete) {
      setTests(tests.filter(t => t.id !== testToDelete.id));
      setSelectedTestIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(testToDelete.id);
        return newSet;
      });
      setTestToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedCount === 0) {
      alert('Please select at least one test to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedCount} test${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      setTests(prev => prev.filter(test => !selectedTestIds.has(test.id)));
      setSelectedTestIds(new Set());
    }
  };

  const handleEditTest = (updatedTest: Test) => {
    setTests(tests.map(t => (t.id === updatedTest.id ? updatedTest : t)));
    setEditingTest(null);
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
            <CreateTestDialog
              onTestCreated={newTest => setTests([...tests, newTest])}
            >
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Test
              </Button>
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
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedCount})
            </Button>
          )}
        </div>
      </div>

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
                onClick={() => setSelectedTestIds(new Set())}
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
        onClearFilters={handleClearFilters}
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={el => {
                      // Cast to HTMLInputElement to access the indeterminate property
                      const input = el as unknown as HTMLInputElement | null;
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onCheckedChange={handleSelectAll}
                  />
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
                  <TableCell>
                    <Checkbox
                      checked={selectedTestIds.has(test.id)}
                      onCheckedChange={checked =>
                        handleSelectTest(test.id, checked as boolean)
                      }
                    />
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
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTest(test)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
                <p className="text-sm text-muted-foreground">
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
                        // If selecting across all pages and no items are selected, select all
                        if (checked && selectedCount === 0) {
                          const allIds = new Set(
                            filteredTests.map(test => test.id)
                          );
                          setSelectedTestIds(allIds);
                        }
                      }}
                    />
                    <label
                      htmlFor="select-all-pages"
                      className="cursor-pointer text-sm text-muted-foreground"
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
                        setCurrentPage(prev => Math.max(1, prev - 1))
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
                        setCurrentPage(prev => Math.min(totalPages, prev + 1))
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
          onTestCreated={handleEditTest}
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
                  onClick={confirmDelete}
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
