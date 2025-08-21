import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Plus, Search, Filter, FileText, Download, Eye } from 'lucide-react';
import { TestDetail } from './TestDetail';
import { CreateTestDialog } from './CreateTestDialog';
import { SearchAndFilters, FilterConfig } from './SearchAndFilters';

interface Test {
  id: string;
  name: string;
  flow: string;
  labels: {
    flujo: string;
    intent: string;
    experience: string;
    proyecto: string;
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
      flujo: 'Payment',
      intent: 'Negative',
      experience: 'Mobile',
      proyecto: 'Release Q3'
    },
    dataRequirements: ['Expired account', 'Authorized user', 'Expired credit card'],
    supportedRuntimes: ['OCP Testing Studio', 'Xero'],
    lastExecution: {
      date: '2025-08-15T10:30:00Z',
      status: 'FAILED',
      runtime: 'OCP Testing Studio'
    },
    lastModified: '2025-08-20T09:15:00Z',
    version: 'v1.2',
    team: 'QA Team'
  },
  {
    id: 'TC-00145',
    name: 'Login validation with active business account',
    flow: 'Login -> Authentication -> Dashboard',
    labels: {
      flujo: 'Login',
      intent: 'Positive',
      experience: 'Web',
      proyecto: 'Core Banking'
    },
    dataRequirements: ['Business account', 'Primary user'],
    supportedRuntimes: ['OCP Testing Studio', 'Sierra'],
    lastExecution: {
      date: '2025-08-18T14:22:00Z',
      status: 'PASSED',
      runtime: 'Sierra'
    },
    lastModified: '2025-08-19T16:45:00Z',
    version: 'v2.1',
    team: 'Core Team'
  },
  {
    id: 'TC-00198',
    name: 'Transfer between own accounts',
    flow: 'Transfer -> Validation -> Confirmation',
    labels: {
      flujo: 'Transfer',
      intent: 'Positive',
      experience: 'Mobile',
      proyecto: 'Release Q3'
    },
    dataRequirements: ['Active account', 'Primary user'],
    supportedRuntimes: ['OCP Testing Studio', 'Xero', 'Sierra'],
    lastExecution: null,
    lastModified: '2025-08-20T11:30:00Z',
    version: 'v1.0',
    team: 'Mobile Team'
  },
  {
    id: 'TC-00234',
    name: 'Balance inquiry with multiple accounts',
    flow: 'Inquiry -> Authentication -> Listing',
    labels: {
      flujo: 'Inquiry',
      intent: 'Positive',
      experience: 'Mobile',
      proyecto: 'Core Banking'
    },
    dataRequirements: ['Active account', 'Authorized user', 'Business account'],
    supportedRuntimes: ['OCP Testing Studio', 'Sierra'],
    lastExecution: {
      date: '2025-08-19T15:45:00Z',
      status: 'PASSED',
      runtime: 'OCP Testing Studio'
    },
    lastModified: '2025-08-20T08:30:00Z',
    version: 'v1.1',
    team: 'Core Team'
  },
  {
    id: 'TC-00267',
    name: 'New credit card activation',
    flow: 'Activation -> Validation -> Confirmation',
    labels: {
      flujo: 'Activation',
      intent: 'Positive',
      experience: 'Web',
      proyecto: 'Release Q3'
    },
    dataRequirements: ['Expired credit card', 'Primary user', 'Active account'],
    supportedRuntimes: ['Xero', 'Sierra'],
    lastExecution: {
      date: '2025-08-17T11:20:00Z',
      status: 'BLOCKED',
      runtime: 'Xero'
    },
    lastModified: '2025-08-20T14:15:00Z',
    version: 'v2.0',
    team: 'Web Team'
  }
];

export function TestsInventory() {
  const [tests, setTests] = useState<Test[]>(mockTests);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFlujo, setFilterFlujo] = useState<string | string[]>('all');
  const [filterStatus, setFilterStatus] = useState<string | string[]>('all');
  const [filterRuntime, setFilterRuntime] = useState<string | string[]>('all');
  const [filterTeam, setFilterTeam] = useState<string | string[]>('all');
  const [selectedTestIds, setSelectedTestIds] = useState<Set<string>>(new Set());

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.flow.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Updated filter logic to handle both single values and arrays
    const matchesFlujo = filterFlujo === 'all' || 
                        (Array.isArray(filterFlujo) ? filterFlujo.includes(test.labels.flujo) : test.labels.flujo === filterFlujo);
    
    const matchesStatus = filterStatus === 'all' || 
                         (Array.isArray(filterStatus) 
                           ? filterStatus.some(status => 
                               (status === 'passed' && test.lastExecution?.status === 'PASSED') ||
                               (status === 'failed' && test.lastExecution?.status === 'FAILED') ||
                               (status === 'never' && !test.lastExecution)
                             )
                           : (filterStatus === 'passed' && test.lastExecution?.status === 'PASSED') ||
                             (filterStatus === 'failed' && test.lastExecution?.status === 'FAILED') ||
                             (filterStatus === 'never' && !test.lastExecution));
    
    const matchesRuntime = filterRuntime === 'all' || 
                          (Array.isArray(filterRuntime) 
                            ? filterRuntime.some(runtime => test.supportedRuntimes.includes(runtime))
                            : test.supportedRuntimes.includes(filterRuntime as string));
    
    const matchesTeam = filterTeam === 'all' || 
                       (Array.isArray(filterTeam) ? filterTeam.includes(test.team) : test.team === filterTeam);

    return matchesSearch && matchesFlujo && matchesStatus && matchesRuntime && matchesTeam;
  });

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredIds = new Set(filteredTests.map(test => test.id));
      setSelectedTestIds(filteredIds);
    } else {
      setSelectedTestIds(new Set());
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
  const isAllSelected = filteredTests.length > 0 && filteredTests.every(test => selectedTestIds.has(test.id));
  const isIndeterminate = selectedTestIds.size > 0 && !isAllSelected;
  const selectedCount = selectedTestIds.size;

  const getStatusBadge = (status: string) => {
    const variants = {
      'PASSED': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'SKIPPED': 'bg-yellow-100 text-yellow-800',
      'BLOCKED': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const generateTestsYaml = () => {
    // Export only selected tests, or all filtered tests if none selected
    const testsToExport = selectedCount > 0 
      ? tests.filter(test => selectedTestIds.has(test.id))
      : filteredTests.length > 0 ? filteredTests : tests;
    
    const yaml = `# Tests Inventory Export
# Generated: ${new Date().toISOString()}
# Total Tests: ${testsToExport.length}
# Selected Tests: ${selectedCount > 0 ? selectedCount : 'All filtered'}

tests:
${testsToExport.map(test => `  - id: ${test.id}
    name: ${test.name}
    version: ${test.version}
    flow: ${test.flow}
    team: ${test.team}
    labels:
      flujo: ${test.labels.flujo}
      intent: ${test.labels.intent}
      experience: ${test.labels.experience}
      proyecto: ${test.labels.proyecto}
    dataRequirements:
${test.dataRequirements.map(req => `      - ${req}`).join('\n')}
    supportedRuntimes:
${test.supportedRuntimes.map(runtime => `      - ${runtime}`).join('\n')}
    lastModified: ${test.lastModified}${test.lastExecution ? `
    lastExecution:
      date: ${test.lastExecution.date}
      status: ${test.lastExecution.status}
      runtime: ${test.lastExecution.runtime}` : ''}
    dialogGroupIdFile:
      bucket: my-test-dialogs
      path: tests/${test.labels.flujo.toLowerCase()}-flow/${test.id.toLowerCase()}.yaml`).join('\n')}`;

    return yaml;
  };

  const exportYaml = () => {
    if (selectedCount === 0) {
      alert('Please select at least one test to export');
      return;
    }
    
    const yaml = generateTestsYaml();
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = selectedCount > 0 
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
      key: 'flujo',
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
        { value: 'Activation', label: 'Activation' }
      ]
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
        { value: 'never', label: 'Never Run' }
      ]
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
        { value: 'Sierra', label: 'Sierra' }
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
        { value: 'all', label: 'All teams' },
        { value: 'QA Team', label: 'QA Team' },
        { value: 'Core Team', label: 'Core Team' },
        { value: 'Mobile Team', label: 'Mobile Team' },
        { value: 'Web Team', label: 'Web Team' }
      ]
    }
  ];

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterFlujo('all');
    setFilterStatus('all');
    setFilterRuntime('all');
    setFilterTeam('all');
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tests Inventory</h2>
          <p className="text-gray-600">Test Cases and Scenarios Management</p>
        </div>
        <div className="flex gap-2">
          <CreateTestDialog onTestCreated={(newTest) => setTests([...tests, newTest])}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </CreateTestDialog>
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
                  {selectedCount} test{selectedCount !== 1 ? 's' : ''} selected
                </Badge>
                <span className="text-sm text-blue-700">
                  Ready to export
                </span>
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
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
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
              {filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTestIds.has(test.id)}
                      onCheckedChange={(checked) => handleSelectTest(test.id, checked as boolean)}
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
                        {test.labels.flujo}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {test.labels.experience}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {test.dataRequirements.map((requirement, index) => (
                        <Badge 
                          key={index}
                          variant="secondary" 
                          className="text-xs bg-blue-100 text-blue-800"
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
                          {new Date(test.lastExecution.date).toLocaleDateString()}
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedTest(test)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Test Details: {test.id}</DialogTitle>
                          <DialogDescription>
                            {test.name}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedTest && <TestDetail test={selectedTest} />}
                      </DialogContent>
                    </Dialog>
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