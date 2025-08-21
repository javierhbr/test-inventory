import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Plus, Search, Filter, Eye, RefreshCw, Download } from 'lucide-react';
import { TestDataDetail } from './TestDataDetail';
import { CreateTestDataDialog } from './CreateTestDataDialog';
import { SearchAndFilters, FilterConfig } from './SearchAndFilters';

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
    proyecto: string;
    ambiente: string;
    dataOwner: string;
    grupo?: string;
    fuente?: string;
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
      type: 'Company'
    },
    account: {
      accountId: 'ACC-98211',
      referenceId: 'REF-ACC-98211',
      type: 'Credit Card',
      createdAt: '2025-08-20T10:00:00Z'
    },
    classifications: ['Expired account', 'Expired credit card', 'Authorized user'],
    labels: {
      proyecto: 'Core Migration',
      ambiente: 'QA',
      dataOwner: 'AutomationBot',
      grupo: 'SME',
      fuente: 'Core API'
    },
    scope: {
      visibility: 'platform',
      platforms: ['OCP Testing Studio']
    },
    status: 'Consumed',
    lastUsed: {
      date: '2025-08-15T10:30:00Z',
      testId: 'TC-00123',
      runtime: 'OCP Testing Studio'
    },
    team: 'QA-Team'
  },
  {
    id: 'TD-20041',
    customer: {
      customerId: 'CUST-54321',
      name: 'Test User',
      type: 'Primary user'
    },
    account: {
      accountId: 'ACC-99551',
      referenceId: 'REF-ACC-99551',
      type: 'Checking Account',
      createdAt: '2025-08-18T14:30:00Z'
    },
    classifications: ['Business account', 'Primary user', 'Active account'],
    labels: {
      proyecto: 'Release Q3',
      ambiente: 'QA',
      dataOwner: 'QA-Team',
      grupo: 'VIP',
      fuente: 'Bulk load'
    },
    scope: {
      visibility: 'automated'
    },
    status: 'Available',
    lastUsed: null,
    team: 'QA-Team'
  },
  {
    id: 'TD-20052',
    customer: {
      customerId: 'CUST-67890',
      name: 'Retail User',
      type: 'Authorized user'
    },
    account: {
      accountId: 'ACC-87652',
      referenceId: 'REF-ACC-87652',
      type: 'Savings Account',
      createdAt: '2025-08-19T09:15:00Z'
    },
    classifications: ['Active account', 'Authorized user'],
    labels: {
      proyecto: 'Core Banking',
      ambiente: 'Preprod',
      dataOwner: 'DataTeam',
      grupo: 'Retail',
      fuente: 'Generated'
    },
    scope: {
      visibility: 'manual'
    },
    status: 'In Use',
    lastUsed: {
      date: '2025-08-20T11:00:00Z',
      testId: 'TC-00145',
      runtime: 'Manual Testing'
    },
    team: 'DataTeam'
  }
];

export function TestDataInventory() {
  const [testData, setTestData] = useState<TestData[]>(mockTestData);
  const [selectedTestData, setSelectedTestData] = useState<TestData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | string[]>('all');
  const [filterScope, setFilterScope] = useState<string | string[]>('all');
  const [filterAmbiente, setFilterAmbiente] = useState<string | string[]>('all');
  const [filterProyecto, setFilterProyecto] = useState<string | string[]>('all');
  const [filterTeam, setFilterTeam] = useState<string | string[]>('all');
  const [selectedDataIds, setSelectedDataIds] = useState<Set<string>>(new Set());

  const filteredTestData = testData.filter(data => {
    const matchesSearch = data.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.customer.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.account.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Updated filter logic to handle both single values and arrays
    const matchesStatus = filterStatus === 'all' || 
                         (Array.isArray(filterStatus) ? filterStatus.includes(data.status) : data.status === filterStatus);
    
    const matchesScope = filterScope === 'all' || 
                        (Array.isArray(filterScope) ? filterScope.includes(data.scope.visibility) : data.scope.visibility === filterScope);
    
    const matchesAmbiente = filterAmbiente === 'all' || 
                           (Array.isArray(filterAmbiente) ? filterAmbiente.includes(data.labels.ambiente) : data.labels.ambiente === filterAmbiente);
    
    const matchesProyecto = filterProyecto === 'all' || 
                           (Array.isArray(filterProyecto) ? filterProyecto.includes(data.labels.proyecto) : data.labels.proyecto === filterProyecto);
    
    const matchesTeam = filterTeam === 'all' || 
                       (Array.isArray(filterTeam) ? filterTeam.includes(data.team) : data.team === filterTeam);

    return matchesSearch && matchesStatus && matchesScope && matchesAmbiente && matchesProyecto && matchesTeam;
  });

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredIds = new Set(filteredTestData.map(data => data.id));
      setSelectedDataIds(filteredIds);
    } else {
      setSelectedDataIds(new Set());
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
  const isAllSelected = filteredTestData.length > 0 && filteredTestData.every(data => selectedDataIds.has(data.id));
  const isIndeterminate = selectedDataIds.size > 0 && !isAllSelected;
  const selectedCount = selectedDataIds.size;

  const getStatusBadge = (status: string) => {
    const variants = {
      'Available': 'bg-green-100 text-green-800',
      'In Use': 'bg-blue-100 text-blue-800',
      'Consumed': 'bg-red-100 text-red-800',
      'Reconditioning': 'bg-yellow-100 text-yellow-800',
      'Inactive': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getScopeBadge = (scope: any) => {
    const baseClass = "text-xs";
    const variants = {
      'manual': 'bg-purple-100 text-purple-800',
      'automated': 'bg-blue-100 text-blue-800',
      'platform': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={`${baseClass} ${variants[scope.visibility as keyof typeof variants] || 'bg-gray-100 text-gray-800'}`}>
        {scope.visibility}
        {scope.platforms && scope.platforms.length > 0 && ` (${scope.platforms.length})`}
      </Badge>
    );
  };

  const handleRecondition = (testDataId: string) => {
    setTestData(prev => prev.map(data => 
      data.id === testDataId 
        ? { ...data, status: 'Reconditioning' as const }
        : data
    ));
  };

  const generateTestDataYaml = () => {
    // Export only selected test data, or all filtered test data if none selected
    const dataToExport = selectedCount > 0 
      ? testData.filter(data => selectedDataIds.has(data.id))
      : filteredTestData.length > 0 ? filteredTestData : testData;
    
    const yaml = `# Test Data Inventory Export
# Generated: ${new Date().toISOString()}
# Total Test Data: ${dataToExport.length}
# Selected Test Data: ${selectedCount > 0 ? selectedCount : 'All filtered'}

testData:
${dataToExport.map(data => `  - id: ${data.id}
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
      proyecto: ${data.labels.proyecto}
      ambiente: ${data.labels.ambiente}
      dataOwner: ${data.labels.dataOwner}${data.labels.grupo ? `
      grupo: ${data.labels.grupo}` : ''}${data.labels.fuente ? `
      fuente: ${data.labels.fuente}` : ''}
    scope:
      visibility: ${data.scope.visibility}${data.scope.platforms ? `
      platforms:
${data.scope.platforms.map(platform => `        - ${platform}`).join('\n')}` : ''}
    status: ${data.status}${data.lastUsed ? `
    lastUsed:
      date: ${data.lastUsed.date}
      testId: ${data.lastUsed.testId}
      runtime: ${data.lastUsed.runtime}` : ''}`).join('\n')}`;

    return yaml;
  };

  const exportYaml = () => {
    if (selectedCount === 0) {
      alert('Please select at least one test data record to export');
      return;
    }
    
    const yaml = generateTestDataYaml();
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = selectedCount > 0 
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
        { value: 'Inactive', label: 'Inactive' }
      ]
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
        { value: 'platform', label: 'Platform' }
      ]
    },
    {
      key: 'ambiente',
      label: 'ENVIRONMENT',
      placeholder: 'Environment',
      value: filterAmbiente,
      onChange: setFilterAmbiente,
      multiple: true, // Enable multiple selection
      options: [
        { value: 'all', label: 'All' },
        { value: 'QA', label: 'QA' },
        { value: 'Preprod', label: 'Preprod' },
        { value: 'Sandbox', label: 'Sandbox' }
      ]
    },
    {
      key: 'proyecto',
      label: 'PROJECT',
      placeholder: 'Project',
      value: filterProyecto,
      onChange: setFilterProyecto,
      multiple: true, // Enable multiple selection
      options: [
        { value: 'all', label: 'All' },
        { value: 'Core Migration', label: 'Core Migration' },
        { value: 'Release Q3', label: 'Release Q3' },
        { value: 'Core Banking', label: 'Core Banking' }
      ]
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
        { value: 'DataTeam', label: 'DataTeam' }
      ]
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Test Data Inventory</h2>
          <p className="text-gray-600">Test data and banking entities management</p>
        </div>
        <div className="flex gap-2">
          <CreateTestDataDialog onTestDataCreated={(newData) => setTestData([...testData, newData])}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Test Data
            </Button>
          </CreateTestDataDialog>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={exportYaml}
            disabled={selectedCount === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {selectedCount > 0 ? `Export YAML (${selectedCount})` : 'Export YAML'}
          </Button>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedCount} record{selectedCount !== 1 ? 's' : ''} selected
                </Badge>
                <span className="text-sm text-blue-700">
                  Ready to export
                </span>
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
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
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
              {filteredTestData.map((data) => (
                <TableRow key={data.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedDataIds.has(data.id)}
                      onCheckedChange={(checked) => handleSelectData(data.id, checked as boolean)}
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
                      <div className="text-xs text-gray-500">{data.customer.customerId}</div>
                      <div className="text-xs text-gray-500">{data.customer.type}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {data.account.referenceId}
                  </TableCell>
                  <TableCell>{data.account.type}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {data.classifications.slice(0, 2).map((classification, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
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
                        {data.labels.proyecto}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {data.labels.ambiente} • {data.labels.dataOwner}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{data.team}</Badge>
                  </TableCell>
                  <TableCell>
                    {getScopeBadge(data.scope)}
                    {data.scope.platforms && (
                      <div className="text-xs text-gray-500 mt-1">
                        {data.scope.platforms.slice(0, 1).join(', ')}
                        {data.scope.platforms.length > 1 && '...'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(data.status)}
                  </TableCell>
                  <TableCell>
                    {data.lastUsed ? (
                      <div className="text-sm">
                        <div>{new Date(data.lastUsed.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{data.lastUsed.testId}</div>
                        <div className="text-xs text-gray-500">{data.lastUsed.runtime}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Never used</span>
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
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Test Data Details: {data.id}</DialogTitle>
                            <DialogDescription>
                              {data.customer.name} - {data.account.referenceId}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedTestData && <TestDataDetail testData={selectedTestData} />}
                        </DialogContent>
                      </Dialog>
                      {data.status === 'Consumed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRecondition(data.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}