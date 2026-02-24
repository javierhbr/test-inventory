import { useState, useEffect, useMemo } from 'react';

import {
  Upload,
  ShoppingCart,
  Download,
  Plus,
  X,
  FileText,
  Copy,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

import { SearchAndFilters, FilterConfig } from './SearchAndFilters';
import { Badge } from './ui/badge';
import { Button, buttonVariants } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Textarea } from './ui/textarea';
import { cn } from './ui/utils';

interface Test {
  id: string;
  name: string;
  flow: string;
  team: string;
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
    status: string;
    runtime: string;
  } | null;
}

interface AssignedTestData {
  id: string;
  accountId: string;
  referenceId: string;
  customerId: string;
  assignedAt: string;
  status: string;
}

interface CartItem {
  test: Test;
  assignedTestData?: AssignedTestData;
}

const mockTests: Test[] = [
  {
    id: 'TC-00123',
    name: 'Payment of expired card with authorized user',
    flow: 'Payment -> Validation -> Confirmation',
    team: 'QA Team',
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
  },
  {
    id: 'TC-00145',
    name: 'Login validation with active business account',
    flow: 'Login -> Authentication -> Dashboard',
    team: 'Core Team',
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
  },
  {
    id: 'TC-00198',
    name: 'Transfer between own accounts',
    flow: 'Transfer -> Validation -> Confirmation',
    team: 'Mobile Team',
    labels: {
      flow: 'Transfer',
      intent: 'Positive',
      experience: 'Mobile',
      project: 'Release Q3',
    },
    dataRequirements: ['Active account', 'Primary user'],
    supportedRuntimes: ['OCP Testing Studio', 'Xero', 'Sierra'],
    lastExecution: null,
  },
  {
    id: 'TC-00156',
    name: 'Checking account balance inquiry',
    flow: 'Inquiry -> Validation -> Response',
    team: 'Web Team',
    labels: {
      flow: 'Inquiry',
      intent: 'Positive',
      experience: 'API',
      project: 'Core Banking',
    },
    dataRequirements: ['Checking account', 'Primary user'],
    supportedRuntimes: ['OCP Testing Studio', 'Xero'],
    lastExecution: {
      date: '2025-08-19T11:15:00Z',
      status: 'PASSED',
      runtime: 'OCP Testing Studio',
    },
  },
  {
    id: 'TC-00258',
    name: 'Transfer funds between savings accounts',
    flow: 'Transfer -> Validation -> Processing -> Confirmation',
    team: 'Mobile Team',
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
  },
  {
    id: 'TC-00167',
    name: 'Account balance inquiry for premium customer',
    flow: 'Inquiry -> Authentication -> Balance Display',
    team: 'Web Team',
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
  },
  {
    id: 'TC-00178',
    name: 'Card activation with PIN setup',
    flow: 'Activation -> Verification -> PIN Setup -> Confirmation',
    team: 'QA Team',
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
  },
  {
    id: 'TC-00189',
    name: 'Payment validation with insufficient funds',
    flow: 'Payment -> Validation -> Error Handling',
    team: 'Core Team',
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
  },
  {
    id: 'TC-00190',
    name: 'Multi-factor authentication login',
    flow: 'Login -> Primary Auth -> MFA -> Dashboard',
    team: 'Core Team',
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
  },
  {
    id: 'TC-00201',
    name: 'International wire transfer initiation',
    flow: 'Transfer -> Compliance Check -> Authorization -> Processing',
    team: 'Web Team',
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
  },
  {
    id: 'TC-00212',
    name: 'Mobile app biometric login setup',
    flow: 'Activation -> Biometric Registration -> Verification',
    team: 'Mobile Team',
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
  },
  {
    id: 'TC-00223',
    name: 'Account statement generation and download',
    flow: 'Inquiry -> Statement Generation -> Download',
    team: 'Web Team',
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
  },
  {
    id: 'TC-00234',
    name: 'Credit card payment processing',
    flow: 'Payment -> Card Validation -> Processing -> Receipt',
    team: 'QA Team',
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
  },
  {
    id: 'TC-00245',
    name: 'Password reset with security questions',
    flow: 'Login -> Password Reset -> Security Questions -> New Password',
    team: 'Core Team',
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
  },
];

const ITEMS_PER_PAGE = 10;

export function ExecutionBuilder() {
  const [tests] = useState<Test[]>(mockTests);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFlujo, setFilterFlujo] = useState<string | string[]>('all');
  const [filterStatus, setFilterStatus] = useState<string | string[]>('all');
  const [filterRuntime, setFilterRuntime] = useState<string | string[]>('all');
  const [filterTeam, setFilterTeam] = useState<string | string[]>('all');
  const [selectedTests, setSelectedTests] = useState<Set<string>>(() => new Set());
  const [selectedRuntime, setSelectedRuntime] = useState('');
  const [csvInput, setCsvInput] = useState('');
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [showYamlDialog, setShowYamlDialog] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [generatedYaml, setGeneratedYaml] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAllPages, setSelectAllPages] = useState(false);

  // Cart pagination state
  const [cartCurrentPage, setCartCurrentPage] = useState(1);
  const [cartSearchFilter, setCartSearchFilter] = useState<string>('all');

  const filteredTests = useMemo(() => tests.filter(test => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFlujo = Array.isArray(filterFlujo)
      ? filterFlujo.includes('all') || filterFlujo.includes(test.labels.flow)
      : filterFlujo === 'all' || test.labels.flow === filterFlujo;

    const lastExecutionStatus =
      test.lastExecution?.status?.toLowerCase() || 'never';
    const matchesStatus = Array.isArray(filterStatus)
      ? filterStatus.includes('all') ||
        filterStatus.includes(lastExecutionStatus)
      : filterStatus === 'all' || lastExecutionStatus === filterStatus;

    const matchesRuntime = Array.isArray(filterRuntime)
      ? filterRuntime.includes('all') ||
        test.supportedRuntimes.some(runtime => filterRuntime.includes(runtime))
      : filterRuntime === 'all' ||
        test.supportedRuntimes.includes(filterRuntime);

    const matchesTeam = Array.isArray(filterTeam)
      ? filterTeam.includes('all') || filterTeam.includes(test.team)
      : filterTeam === 'all' || test.team === filterTeam;

    const notInCart = !cart.some(item => item.test.id === test.id);

    return (
      matchesSearch &&
      matchesFlujo &&
      matchesStatus &&
      matchesRuntime &&
      matchesTeam &&
      notInCart
    );
  }), [tests, searchTerm, filterFlujo, filterStatus, filterRuntime, filterTeam, cart]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTests = filteredTests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterFlujo, filterStatus, filterRuntime, filterTeam]);

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

  // Cart filtering and pagination
  const filteredCart = cart.filter(item => {
    if (cartSearchFilter === 'all') return true;
    return item.test.labels.flow === cartSearchFilter;
  });

  const cartTotalPages = Math.ceil(filteredCart.length / ITEMS_PER_PAGE);
  const cartStartIndex = (cartCurrentPage - 1) * ITEMS_PER_PAGE;
  const cartEndIndex = cartStartIndex + ITEMS_PER_PAGE;
  const paginatedCart = filteredCart.slice(cartStartIndex, cartEndIndex);

  // Reset cart page when filter changes
  useEffect(() => {
    setCartCurrentPage(1);
  }, [cartSearchFilter]);

  // Generate cart page numbers for pagination
  const getCartPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (cartTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= cartTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (cartCurrentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(cartTotalPages);
      } else if (cartCurrentPage >= cartTotalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = cartTotalPages - 3; i <= cartTotalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        pages.push(cartCurrentPage - 1);
        pages.push(cartCurrentPage);
        pages.push(cartCurrentPage + 1);
        pages.push('ellipsis');
        pages.push(cartTotalPages);
      }
    }
    return pages;
  };

  const addToCart = (test: Test) => {
    setCart(prev => [...prev, { test }]);
  };

  const removeFromCart = (testId: string) => {
    setCart(prev => prev.filter(item => item.test.id !== testId));
  };

  const removeFromFilteredCart = () => {
    const filteredCartIds = new Set(filteredCart.map(item => item.test.id));
    setCart(cart.filter(item => !filteredCartIds.has(item.test.id)));
    setCartCurrentPage(1); // Reset to first page after removal
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCsvImport = () => {
    const lines = csvInput.trim().split('\n');
    if (lines.length < 2) {
      alert('CSV must have at least header and one data line');
      return;
    }

    const header = lines[0].toLowerCase();
    if (!header.includes('testid')) {
      alert('CSV must have a "testId" column');
      return;
    }

    const testIds = lines
      .slice(1)
      .map(line => line.trim())
      .filter(Boolean);
    const testsToAdd = tests.filter(test => testIds.includes(test.id));

    setCart(prev => {
      const newCartItems = testsToAdd
        .filter(test => !prev.some(item => item.test.id === test.id))
        .map(test => ({ test }));
      return [...prev, ...newCartItems];
    });
    setCsvInput('');
    setShowCsvDialog(false);
  };

  const assignTestData = () => {
    // Simulate automatic test data assignment
    const updatedCart = cart.map(item => {
      if (!item.assignedTestData) {
        const mockTestData: AssignedTestData = {
          id: `TD-${Math.floor(Math.random() * 90000) + 10000}`,
          accountId: `ACC-${Math.floor(Math.random() * 90000) + 10000}`,
          referenceId: `REF-ACC-${Math.floor(Math.random() * 90000) + 10000}`,
          customerId: `CUST-${Math.floor(Math.random() * 90000) + 10000}`,
          assignedAt: new Date().toISOString(),
          status: 'Assigned',
        };
        return { ...item, assignedTestData: mockTestData };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const generateExecutionYaml = () => {
    if (cart.length === 0 || !selectedRuntime) {
      setShowValidationModal(true);
      return;
    }

    const executionId = `EX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      Math.random() * 1000
    )
      .toString()
      .padStart(3, '0')}`;

    const yaml = `executionId: ${executionId}
createdAt: ${new Date().toISOString()}
runtime: ${selectedRuntime}
tests:
${cart
  .map(
    item => `  - id: ${item.test.id}
    name: ${item.test.name}
    goldenDialogId: GD-${item.test.id.slice(-3)}
    dialogGroupIdFile:
      bucket: my-test-dialogs
      path: golden-dialogs/${item.test.labels.flow.toLowerCase()}-flow/dialog-${item.test.id.slice(-3)}.yaml
    dataRequirements:
${item.test.dataRequirements.map(req => `      - ${req}`).join('\n')}${
      item.assignedTestData
        ? `
    testData:
      id: ${item.assignedTestData.id}
      accountId: ${item.assignedTestData.accountId}
      referenceId: ${item.assignedTestData.referenceId}
      customerId: ${item.assignedTestData.customerId}
      assignedAt: ${item.assignedTestData.assignedAt}
      status: ${item.assignedTestData.status}`
        : ''
    }`
  )
  .join('\n')}`;

    setGeneratedYaml(yaml);
    setShowYamlDialog(true);
  };

  const copyYamlToClipboard = () => {
    if (generatedYaml) {
      navigator.clipboard.writeText(generatedYaml);
    }
  };

  const downloadYaml = () => {
    const yaml = generatedYaml;
    if (yaml) {
      const executionId = `EX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        Math.random() * 1000
      )
        .toString()
        .padStart(3, '0')}`;
      const blob = new Blob([yaml], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${executionId}.yaml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleExportYaml = () => {
    if (cart.length === 0 || !selectedRuntime) {
      setShowValidationModal(true);
      return;
    }
    generateExecutionYaml();
  };

  // Filter configuration for SearchAndFilters component
  const filterConfigs: FilterConfig[] = [
    {
      key: 'flow',
      label: 'FLOW',
      placeholder: 'Flow',
      value: filterFlujo,
      onChange: setFilterFlujo,
      multiple: true,
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
      multiple: true,
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
      multiple: true,
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
      multiple: true,
      options: [
        { value: 'all', label: 'All teams' },
        { value: 'QA Team', label: 'QA Team' },
        { value: 'Core Team', label: 'Core Team' },
        { value: 'Mobile Team', label: 'Mobile Team' },
        { value: 'Web Team', label: 'Web Team' },
      ],
    },
  ];

  // Add to cart functionality
  const handleSelectTest = (testId: string, checked: boolean) => {
    setSelectedTests(prev => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(testId);
      } else {
        newSelected.delete(testId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      if (selectAllPages) {
        // Select all tests across all pages
        const allIds = new Set(filteredTests.map(test => test.id));
        setSelectedTests(allIds);
      } else {
        // Select only current page
        const currentPageIds = new Set(paginatedTests.map(test => test.id));
        setSelectedTests(prevIds => {
          const newIds = new Set(prevIds);
          currentPageIds.forEach(id => newIds.add(id));
          return newIds;
        });
      }
    } else {
      if (selectAllPages) {
        // Deselect all
        setSelectedTests(new Set());
      } else {
        // Deselect only current page
        const currentPageIds = new Set(paginatedTests.map(test => test.id));
        setSelectedTests(prevIds => {
          const newIds = new Set(prevIds);
          currentPageIds.forEach(id => newIds.delete(id));
          return newIds;
        });
      }
    }
  };

  const addSelectedToCart = () => {
    const testsToAdd = tests.filter(test => selectedTests.has(test.id));
    setCart(prev => {
      const newCartItems = testsToAdd
        .filter(test => !prev.some(item => item.test.id === test.id))
        .map(test => ({ test }));
      return [...prev, ...newCartItems];
    });
    setSelectedTests(new Set());
  };

  const selectedCount = selectedTests.size;
  const isCurrentPageSelected =
    paginatedTests.length > 0 &&
    paginatedTests.every(test => selectedTests.has(test.id));
  const isAllPagesSelected =
    filteredTests.length > 0 &&
    filteredTests.every(test => selectedTests.has(test.id));
  const isAllSelected = selectAllPages
    ? isAllPagesSelected
    : isCurrentPageSelected;
  const isIndeterminate = selectedCount > 0 && !isAllSelected;

  return (
    <>
      <div className="grid h-[calc(100vh-200px)] grid-cols-12 gap-6">
        {/* Left Panel - Test Search and Filters */}
        <div className="col-span-5 space-y-4">
          <SearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search tests by name or ID..."
            filters={filterConfigs}
            onClearFilters={() => {
              setSearchTerm('');
              setFilterFlujo('all');
              setFilterStatus('all');
              setFilterRuntime('all');
              setFilterTeam('all');
            }}
            filteredCount={filteredTests.length}
            totalCount={mockTests.length}
            itemType="tests"
            selectedCount={selectedCount}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onSelectAll={handleSelectAll}
            selectAllLabel="Select all filtered tests"
          />

          {/* Import CSV Dialog moved here */}
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

          {/* Available Tests */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Available Tests ({filteredTests.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Labels</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTests.map(test => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedTests.has(test.id)}
                            onCheckedChange={checked =>
                              handleSelectTest(test.id, checked as boolean)
                            }
                          />
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
                          id="select-all-pages-execution"
                          checked={selectAllPages}
                          onCheckedChange={checked => {
                            setSelectAllPages(checked as boolean);
                            // If selecting across all pages and no items are selected, select all
                            if (checked && selectedCount === 0) {
                              const allIds = new Set(
                                filteredTests.map(test => test.id)
                              );
                              setSelectedTests(allIds);
                            }
                          }}
                        />
                        <label
                          htmlFor="select-all-pages-execution"
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
                            setCurrentPage(prev =>
                              Math.min(totalPages, prev + 1)
                            )
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

        {/* Right Panel - Cart and Execution */}
        <div className="col-span-7 space-y-4">
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
                  {/* Cart Filter Controls */}
                  <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                    <div className="flex flex-1 items-center gap-4">
                      <label className="text-sm font-medium text-gray-700">
                        Filter by Flow:
                      </label>
                      <Select
                        value={cartSearchFilter}
                        onValueChange={value =>
                          setCartSearchFilter(value as string)
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Flows</SelectItem>
                          <SelectItem value="Payment">Payment</SelectItem>
                          <SelectItem value="Login">Login</SelectItem>
                          <SelectItem value="Transfer">Transfer</SelectItem>
                          <SelectItem value="Inquiry">Inquiry</SelectItem>
                          <SelectItem value="Activation">Activation</SelectItem>
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
                        onClick={removeFromFilteredCart}
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
                                {item.test.dataRequirements
                                  .slice(0, 2)
                                  .join(', ')}
                                {item.test.dataRequirements.length > 2 &&
                                  ' ...'}
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

                  {/* Cart Pagination */}
                  {cartTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {cartStartIndex + 1} to{' '}
                        {Math.min(cartEndIndex, filteredCart.length)} of{' '}
                        {filteredCart.length} items
                      </p>

                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCartCurrentPage(prev =>
                                  Math.max(1, prev - 1)
                                )
                              }
                              className={
                                cartCurrentPage === 1
                                  ? 'pointer-events-none opacity-50'
                                  : 'cursor-pointer'
                              }
                            />
                          </PaginationItem>

                          {getCartPageNumbers().map((page, index) => (
                            <PaginationItem key={index}>
                              {page === 'ellipsis' ? (
                                <PaginationEllipsis />
                              ) : (
                                <PaginationLink
                                  onClick={() =>
                                    setCartCurrentPage(page as number)
                                  }
                                  isActive={cartCurrentPage === page}
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
                                setCartCurrentPage(prev =>
                                  Math.min(cartTotalPages, prev + 1)
                                )
                              }
                              className={
                                cartCurrentPage === cartTotalPages
                                  ? 'pointer-events-none opacity-50'
                                  : 'cursor-pointer'
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Execution Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Execution Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Execution Runtime *
                </label>
                <Select
                  value={selectedRuntime}
                  onValueChange={value => setSelectedRuntime(value as string)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OCP Testing Studio">
                      OCP Testing Studio
                    </SelectItem>
                    <SelectItem value="Xero">Xero</SelectItem>
                    <SelectItem value="Sierra">Sierra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={assignTestData}
                  variant="outline"
                  disabled={cart.length === 0}
                  className="flex-1"
                >
                  Assign Test Data Automatically
                </Button>
                <Button onClick={handleExportYaml} className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  Export Execution YAML
                </Button>
              </div>

              {cart.length > 0 && selectedRuntime && (
                <div className="rounded-md bg-blue-50 p-3 text-sm text-gray-600">
                  <strong>Summary:</strong> {cart.length} tests selected to run
                  on {selectedRuntime}.
                  {cart.filter(item => item.assignedTestData).length > 0 && (
                    <div className="mt-1">
                      ✓ {cart.filter(item => item.assignedTestData).length}{' '}
                      tests have assigned test data
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Validation Modal */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Validation Required</DialogTitle>
            <DialogDescription>
              Please complete the required fields before proceeding.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
              <AlertTriangle className="h-10 w-10 text-orange-500" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Select at least one test and one runtime
              </h3>
            </div>

            <Button
              onClick={() => setShowValidationModal(false)}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* YAML Export Dialog */}
      <Dialog open={showYamlDialog} onOpenChange={setShowYamlDialog}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Execution YAML</DialogTitle>
                <DialogDescription>
                  Complete YAML to execute test batch
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyYamlToClipboard}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button size="sm" onClick={downloadYaml}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div>
            <Textarea
              value={generatedYaml}
              readOnly
              className="min-h-[500px] resize-none font-mono text-sm"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
