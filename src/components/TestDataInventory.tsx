import { useState, useMemo } from 'react';

import { Plus, Eye, RefreshCw, Download, Pencil, Trash2 } from 'lucide-react';

import { usePermissions } from '../contexts/PermissionsContext';

import { CreateTestDataDialog } from './CreateTestDataDialog';
import { EditTestDataDialog } from './EditTestDataDialog';
import { SearchAndFilters, FilterConfig } from './SearchAndFilters';
import { TestDataDetail } from './TestDataDetail';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
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

interface TestData {
  id: string;
  customer: {
    customerId: string;
    name: string;
    type: string;
  };
  account: {
    accountId: string;
    referenceId: string;
    type: string;
    createdAt: string;
  };
  classifications: string[];
  labels: {
    project: string;
    environment: string;
    dataOwner: string;
    group?: string;
    source?: string;
  };
  scope: {
    visibility: 'manual' | 'automated' | 'platform';
    platforms?: string[];
  };
  status: 'Available' | 'In Use' | 'Consumed' | 'Reconditioning' | 'Inactive';
  lastUsed: {
    date: string;
    testId: string;
    runtime: string;
  } | null;
  team: string;
}

const mockTestData: TestData[] = [
  {
    id: 'TD-20031',
    customer: {
      customerId: 'CUST-12345',
      name: 'Company ABC',
      type: 'Company',
    },
    account: {
      accountId: 'ACC-98211',
      referenceId: 'REF-ACC-98211',
      type: 'Credit Card',
      createdAt: '2025-08-20T10:00:00Z',
    },
    classifications: [
      'Expired account',
      'Expired credit card',
      'Authorized user',
    ],
    labels: {
      project: 'Core Migration',
      environment: 'QA',
      dataOwner: 'AutomationBot',
      group: 'SME',
      source: 'Core API',
    },
    scope: {
      visibility: 'platform',
      platforms: ['OCP Testing Studio'],
    },
    status: 'Consumed',
    lastUsed: {
      date: '2025-08-15T10:30:00Z',
      testId: 'TC-00123',
      runtime: 'OCP Testing Studio',
    },
    team: 'QA-Team',
  },
  {
    id: 'TD-20041',
    customer: {
      customerId: 'CUST-54321',
      name: 'Test User',
      type: 'Primary user',
    },
    account: {
      accountId: 'ACC-99551',
      referenceId: 'REF-ACC-99551',
      type: 'Checking Account',
      createdAt: '2025-08-18T14:30:00Z',
    },
    classifications: ['Business account', 'Primary user', 'Active account'],
    labels: {
      project: 'Release Q3',
      environment: 'QA',
      dataOwner: 'QA-Team',
      group: 'VIP',
      source: 'Bulk load',
    },
    scope: {
      visibility: 'automated',
    },
    status: 'Available',
    lastUsed: null,
    team: 'QA-Team',
  },
  {
    id: 'TD-20052',
    customer: {
      customerId: 'CUST-67890',
      name: 'Retail User',
      type: 'Authorized user',
    },
    account: {
      accountId: 'ACC-87652',
      referenceId: 'REF-ACC-87652',
      type: 'Savings Account',
      createdAt: '2025-08-19T09:15:00Z',
    },
    classifications: ['Active account', 'Authorized user'],
    labels: {
      project: 'Core Banking',
      environment: 'Preprod',
      dataOwner: 'DataTeam',
      group: 'Retail',
      source: 'Generated',
    },
    scope: {
      visibility: 'manual',
    },
    status: 'In Use',
    lastUsed: {
      date: '2025-08-20T11:00:00Z',
      testId: 'TC-00145',
      runtime: 'Manual Testing',
    },
    team: 'DataTeam',
  },
  {
    id: 'TD-20032',
    customer: {
      customerId: 'CUST-54321',
      name: 'Individual User John',
      type: 'Individual',
    },
    account: {
      accountId: 'ACC-78945',
      referenceId: 'REF-ACC-78945',
      type: 'Savings Account',
      createdAt: '2025-08-18T09:30:00Z',
    },
    classifications: ['Premium account', 'Verified customer', 'High balance'],
    labels: {
      project: 'Customer Portal',
      environment: 'Production',
      dataOwner: 'DataTeam',
      group: 'Premium',
      source: 'CRM System',
    },
    scope: {
      visibility: 'automated',
      platforms: ['Sierra', 'Xero'],
    },
    status: 'Available',
    lastUsed: null,
    team: 'QA Team',
  },
  {
    id: 'TD-20033',
    customer: {
      customerId: 'CUST-67890',
      name: 'Business Corp Ltd',
      type: 'Company',
    },
    account: {
      accountId: 'ACC-11223',
      referenceId: 'REF-ACC-11223',
      type: 'Business Account',
      createdAt: '2025-08-19T14:15:00Z',
    },
    classifications: ['Business account', 'Primary user', 'Multi-user access'],
    labels: {
      project: 'Core Banking',
      environment: 'QA',
      dataOwner: 'AutomationBot',
      group: 'Business',
      source: 'Core API',
    },
    scope: {
      visibility: 'platform',
      platforms: ['OCP Testing Studio', 'Sierra'],
    },
    status: 'Reconditioning',
    lastUsed: {
      date: '2025-08-18T14:22:00Z',
      testId: 'TC-00145',
      runtime: 'Sierra',
    },
    team: 'Core Team',
  },
  {
    id: 'TD-20034',
    customer: {
      customerId: 'CUST-13579',
      name: 'Mobile User Sarah',
      type: 'Individual',
    },
    account: {
      accountId: 'ACC-44556',
      referenceId: 'REF-ACC-44556',
      type: 'Checking Account',
      createdAt: '2025-08-17T11:45:00Z',
    },
    classifications: ['Mobile app user', 'Biometric enabled', 'Active user'],
    labels: {
      project: 'Mobile Security',
      environment: 'Staging',
      dataOwner: 'MobileTeam',
      group: 'Standard',
      source: 'Mobile API',
    },
    scope: {
      visibility: 'automated',
      platforms: ['OCP Testing Studio'],
    },
    status: 'In Use',
    lastUsed: {
      date: '2025-08-17T14:15:00Z',
      testId: 'TC-00212',
      runtime: 'OCP Testing Studio',
    },
    team: 'Mobile Team',
  },
  {
    id: 'TD-20035',
    customer: {
      customerId: 'CUST-24680',
      name: 'International Corp',
      type: 'Company',
    },
    account: {
      accountId: 'ACC-77889',
      referenceId: 'REF-ACC-77889',
      type: 'International Account',
      createdAt: '2025-08-16T08:30:00Z',
    },
    classifications: [
      'International account',
      'Compliance verified',
      'High value',
    ],
    labels: {
      project: 'International Banking',
      environment: 'Production',
      dataOwner: 'ComplianceTeam',
      group: 'International',
      source: 'SWIFT Network',
    },
    scope: {
      visibility: 'manual',
      platforms: ['Sierra'],
    },
    status: 'Available',
    lastUsed: null,
    team: 'Web Team',
  },
  {
    id: 'TD-20036',
    customer: {
      customerId: 'CUST-97531',
      name: 'Tech Startup Inc',
      type: 'Company',
    },
    account: {
      accountId: 'ACC-33667',
      referenceId: 'REF-ACC-33667',
      type: 'Business Credit',
      createdAt: '2025-08-20T13:20:00Z',
    },
    classifications: ['New card', 'Customer profile', 'Phone verified'],
    labels: {
      project: 'Card Services',
      environment: 'QA',
      dataOwner: 'CardTeam',
      group: 'SME',
      source: 'Card Processing',
    },
    scope: {
      visibility: 'platform',
      platforms: ['OCP Testing Studio', 'Xero'],
    },
    status: 'Consumed',
    lastUsed: {
      date: '2025-08-16T13:30:00Z',
      testId: 'TC-00178',
      runtime: 'Xero',
    },
    team: 'QA Team',
  },
  {
    id: 'TD-20037',
    customer: {
      customerId: 'CUST-86420',
      name: 'Low Balance User',
      type: 'Individual',
    },
    account: {
      accountId: 'ACC-55778',
      referenceId: 'REF-ACC-55778',
      type: 'Basic Account',
      createdAt: '2025-08-15T16:10:00Z',
    },
    classifications: [
      'Low balance account',
      'Payment request',
      'Insufficient funds',
    ],
    labels: {
      project: 'Payment Gateway',
      environment: 'QA',
      dataOwner: 'PaymentTeam',
      group: 'Basic',
      source: 'Payment API',
    },
    scope: {
      visibility: 'automated',
      platforms: ['Sierra', 'OCP Testing Studio'],
    },
    status: 'Available',
    lastUsed: {
      date: '2025-08-20T07:45:00Z',
      testId: 'TC-00189',
      runtime: 'Sierra',
    },
    team: 'Core Team',
  },
  {
    id: 'TD-20038',
    customer: {
      customerId: 'CUST-19283',
      name: 'MFA Enabled User',
      type: 'Individual',
    },
    account: {
      accountId: 'ACC-99001',
      referenceId: 'REF-ACC-99001',
      type: 'Secure Account',
      createdAt: '2025-08-19T12:00:00Z',
    },
    classifications: ['MFA enabled account', 'Mobile device', 'Email access'],
    labels: {
      project: 'Security Enhancement',
      environment: 'Production',
      dataOwner: 'SecurityTeam',
      group: 'Secure',
      source: 'Auth Service',
    },
    scope: {
      visibility: 'platform',
      platforms: ['OCP Testing Studio', 'Sierra', 'Xero'],
    },
    status: 'In Use',
    lastUsed: {
      date: '2025-08-19T15:20:00Z',
      testId: 'TC-00190',
      runtime: 'OCP Testing Studio',
    },
    team: 'Core Team',
  },
  {
    id: 'TD-20039',
    customer: {
      customerId: 'CUST-74185',
      name: 'Document Services Client',
      type: 'Individual',
    },
    account: {
      accountId: 'ACC-22334',
      referenceId: 'REF-ACC-22334',
      type: 'Standard Account',
      createdAt: '2025-08-18T07:45:00Z',
    },
    classifications: [
      'Active account',
      'Statement period data',
      'Document access',
    ],
    labels: {
      project: 'Document Services',
      environment: 'Production',
      dataOwner: 'DocumentTeam',
      group: 'Standard',
      source: 'Document API',
    },
    scope: {
      visibility: 'automated',
      platforms: ['Sierra', 'Xero', 'OCP Testing Studio'],
    },
    status: 'Available',
    lastUsed: {
      date: '2025-08-20T10:00:00Z',
      testId: 'TC-00223',
      runtime: 'Xero',
    },
    team: 'Web Team',
  },
  {
    id: 'TD-20040',
    customer: {
      customerId: 'CUST-96307',
      name: 'Merchant Account Holder',
      type: 'Company',
    },
    account: {
      accountId: 'ACC-66778',
      referenceId: 'REF-ACC-66778',
      type: 'Merchant Account',
      createdAt: '2025-08-17T15:30:00Z',
    },
    classifications: [
      'Active credit card',
      'Merchant account',
      'Payment processing',
    ],
    labels: {
      project: 'Card Processing',
      environment: 'QA',
      dataOwner: 'MerchantTeam',
      group: 'Merchant',
      source: 'Payment Gateway',
    },
    scope: {
      visibility: 'platform',
      platforms: ['OCP Testing Studio', 'Xero'],
    },
    status: 'Available',
    lastUsed: {
      date: '2025-08-19T12:45:00Z',
      testId: 'TC-00234',
      runtime: 'Xero',
    },
    team: 'QA Team',
  },
  {
    id: 'TD-20042',
    customer: {
      customerId: 'CUST-52841',
      name: 'Recovery Test User',
      type: 'Individual',
    },
    account: {
      accountId: 'ACC-88990',
      referenceId: 'REF-ACC-88990',
      type: 'Test Account',
      createdAt: '2025-08-20T14:00:00Z',
    },
    classifications: [
      'User account',
      'Security questions setup',
      'Email access',
    ],
    labels: {
      project: 'Account Recovery',
      environment: 'Staging',
      dataOwner: 'TestTeam',
      group: 'Test',
      source: 'Test Data Generator',
    },
    scope: {
      visibility: 'manual',
    },
    status: 'Inactive',
    lastUsed: null,
    team: 'Core Team',
  },
];

const ITEMS_PER_PAGE = 10;

export function TestDataInventory() {
  const { hasPermission } = usePermissions();
  const [testData, setTestData] = useState<TestData[]>(mockTestData);
  const [selectedTestData, setSelectedTestData] = useState<TestData | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | string[]>('all');
  const [filterScope, setFilterScope] = useState<string | string[]>('all');
  const [filterAmbiente, setFilterAmbiente] = useState<string | string[]>(
    'all'
  );
  const [filterProyecto, setFilterProyecto] = useState<string | string[]>(
    'all'
  );
  const [filterTeam, setFilterTeam] = useState<string | string[]>('all');
  const [selectedDataIds, setSelectedDataIds] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAllPages, setSelectAllPages] = useState(false);

  const filteredTestData = testData.filter(data => {
    const matchesSearch =
      data.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.customer.customerId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      data.account.referenceId.toLowerCase().includes(searchTerm.toLowerCase());

    // Updated filter logic to handle both single values and arrays
    const matchesStatus =
      filterStatus === 'all' ||
      (Array.isArray(filterStatus)
        ? filterStatus.includes(data.status)
        : data.status === filterStatus);

    const matchesScope =
      filterScope === 'all' ||
      (Array.isArray(filterScope)
        ? filterScope.includes(data.scope.visibility)
        : data.scope.visibility === filterScope);

    const matchesAmbiente =
      filterAmbiente === 'all' ||
      (Array.isArray(filterAmbiente)
        ? filterAmbiente.includes(data.labels.environment)
        : data.labels.environment === filterAmbiente);

    const matchesProyecto =
      filterProyecto === 'all' ||
      (Array.isArray(filterProyecto)
        ? filterProyecto.includes(data.labels.project)
        : data.labels.project === filterProyecto);

    const matchesTeam =
      filterTeam === 'all' ||
      (Array.isArray(filterTeam)
        ? filterTeam.includes(data.team)
        : data.team === filterTeam);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesScope &&
      matchesAmbiente &&
      matchesProyecto &&
      matchesTeam
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTestData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTestData = filteredTestData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filterStatus,
    filterScope,
    filterAmbiente,
    filterProyecto,
    filterTeam,
  ]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      if (selectAllPages) {
        // Select all test data across all pages
        const allIds = new Set(filteredTestData.map(data => data.id));
        setSelectedDataIds(allIds);
      } else {
        // Select only current page
        const currentPageIds = new Set(paginatedTestData.map(data => data.id));
        setSelectedDataIds(prevIds => {
          const newIds = new Set(prevIds);
          currentPageIds.forEach(id => newIds.add(id));
          return newIds;
        });
      }
    } else {
      if (selectAllPages) {
        // Deselect all
        setSelectedDataIds(new Set());
      } else {
        // Deselect only current page
        const currentPageIds = new Set(paginatedTestData.map(data => data.id));
        setSelectedDataIds(prevIds => {
          const newIds = new Set(prevIds);
          currentPageIds.forEach(id => newIds.delete(id));
          return newIds;
        });
      }
    }
  };

  const handleSelectData = (dataId: string, checked: boolean) => {
    const newSelection = new Set(selectedDataIds);
    if (checked) {
      newSelection.add(dataId);
    } else {
      newSelection.delete(dataId);
    }
    setSelectedDataIds(newSelection);
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
    const variants = {
      Available: 'bg-green-100 text-green-800',
      'In Use': 'bg-blue-100 text-blue-800',
      Consumed: 'bg-red-100 text-red-800',
      Reconditioning: 'bg-yellow-100 text-yellow-800',
      Inactive: 'bg-gray-100 text-gray-800',
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

  const getScopeBadge = (scope: any) => {
    const baseClass = 'text-xs';
    const variants = {
      manual: 'bg-purple-100 text-purple-800',
      automated: 'bg-blue-100 text-blue-800',
      platform: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge
        className={`${baseClass} ${variants[scope.visibility as keyof typeof variants] || 'bg-gray-100 text-gray-800'}`}
      >
        {scope.visibility}
        {scope.platforms &&
          scope.platforms.length > 0 &&
          ` (${scope.platforms.length})`}
      </Badge>
    );
  };

  const handleRecondition = (testDataId: string) => {
    setTestData(prev =>
      prev.map(data =>
        data.id === testDataId
          ? { ...data, status: 'Reconditioning' as const }
          : data
      )
    );
  };

  const handleTestDataUpdate = (updatedData: TestData) => {
    setTestData(prev =>
      prev.map(data => (data.id === updatedData.id ? updatedData : data))
    );
  };

  const handleDeleteTestData = (testDataId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this test data? This action cannot be undone.'
      )
    ) {
      setTestData(prev => prev.filter(data => data.id !== testDataId));
      // Remove from selection if it was selected
      setSelectedDataIds(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(testDataId);
        return newSelection;
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedCount === 0) {
      alert('Please select at least one test data record to delete');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedCount} test data record${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`
      )
    ) {
      setTestData(prev => prev.filter(data => !selectedDataIds.has(data.id)));
      setSelectedDataIds(new Set());
    }
  };

  const generateTestDataYaml = () => {
    // Export only selected test data, or all filtered test data if none selected
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
      multiple: true, // Enable multiple selection
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
      multiple: true, // Enable multiple selection
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
      multiple: true, // Enable multiple selection
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
      multiple: true, // Enable multiple selection
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
      multiple: true, // Enable multiple selection
      options: [
        { value: 'all', label: 'All' },
        { value: 'QA-Team', label: 'QA-Team' },
        { value: 'DataTeam', label: 'DataTeam' },
      ],
    },
  ];

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterScope('all');
    setFilterAmbiente('all');
    setFilterProyecto('all');
    setFilterTeam('all');
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test Data Inventory</h2>
          <p className="text-gray-600">
            Test data and banking entities management
          </p>
        </div>
        <div className="flex gap-2">
          {hasPermission('create_test_data') && (
            <CreateTestDataDialog
              onTestDataCreated={newData => setTestData([...testData, newData])}
            >
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Test Data
              </Button>
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
            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
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
                  {selectedCount} record{selectedCount !== 1 ? 's' : ''}{' '}
                  selected
                </Badge>
                <span className="text-sm text-blue-700">Ready to export</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedDataIds(new Set())}
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
        onClearFilters={handleClearFilters}
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={el => {
                      if (el) (el as any).indeterminate = isIndeterminate;
                    }}
                    onCheckedChange={handleSelectAll}
                  />
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
                  <TableCell>
                    <Checkbox
                      checked={selectedDataIds.has(data.id)}
                      onCheckedChange={checked =>
                        handleSelectData(data.id, checked as boolean)
                      }
                    />
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
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTestData(data)}
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
                                      onClick={() => handleRecondition(data.id)}
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
                          onTestDataUpdated={handleTestDataUpdate}
                        >
                          <Button size="sm" variant="outline">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </EditTestDataDialog>
                      )}

                      {hasPermission('delete_test_data') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTestData(data.id)}
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
                <p className="text-sm text-muted-foreground">
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
                        // If selecting across all pages and no items are selected, select all
                        if (checked && selectedCount === 0) {
                          const allIds = new Set(
                            filteredTestData.map(data => data.id)
                          );
                          setSelectedDataIds(allIds);
                        }
                      }}
                    />
                    <label
                      htmlFor="select-all-pages-testdata"
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
    </div>
  );
}
