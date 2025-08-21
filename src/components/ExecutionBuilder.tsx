import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Upload, Search, Filter, ShoppingCart, Download, Plus, X, FileText, Copy, Trash2, AlertTriangle } from 'lucide-react';

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
    }
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
    }
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
    lastExecution: null
  },
  {
    id: 'TC-00156',
    name: 'Checking account balance inquiry',
    flow: 'Inquiry -> Validation -> Response',
    labels: {
      flujo: 'Inquiry',
      intent: 'Positive',
      experience: 'API',
      proyecto: 'Core Banking'
    },
    dataRequirements: ['Checking account', 'Primary user'],
    supportedRuntimes: ['OCP Testing Studio', 'Xero'],
    lastExecution: {
      date: '2025-08-19T11:15:00Z',
      status: 'PASSED',
      runtime: 'OCP Testing Studio'
    }
  }
];

export function ExecutionBuilder() {
  const [tests] = useState<Test[]>(mockTests);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFlujo, setFilterFlujo] = useState('all');
  const [filterRuntime, setFilterRuntime] = useState('all');
  const [selectedRuntime, setSelectedRuntime] = useState('');
  const [csvInput, setCsvInput] = useState('');
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [showYamlDialog, setShowYamlDialog] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFlujo = filterFlujo === 'all' || test.labels.flujo === filterFlujo;
    const matchesRuntime = filterRuntime === 'all' || test.supportedRuntimes.includes(filterRuntime);
    const notInCart = !cart.some(item => item.test.id === test.id);

    return matchesSearch && matchesFlujo && matchesRuntime && notInCart;
  });

  const addToCart = (test: Test) => {
    setCart([...cart, { test }]);
  };

  const removeFromCart = (testId: string) => {
    setCart(cart.filter(item => item.test.id !== testId));
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

    const testIds = lines.slice(1).map(line => line.trim()).filter(Boolean);
    const testsToAdd = tests.filter(test => testIds.includes(test.id));
    
    const newCartItems = testsToAdd
      .filter(test => !cart.some(item => item.test.id === test.id))
      .map(test => ({ test }));

    setCart([...cart, ...newCartItems]);
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
          status: 'Assigned'
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

    const executionId = `EX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const yaml = `executionId: ${executionId}
createdAt: ${new Date().toISOString()}
runtime: ${selectedRuntime}
tests:
${cart.map(item => `  - id: ${item.test.id}
    name: ${item.test.name}
    goldenDialogId: GD-${item.test.id.slice(-3)}
    dialogGroupIdFile:
      bucket: my-test-dialogs
      path: golden-dialogs/${item.test.labels.flujo.toLowerCase()}-flow/dialog-${item.test.id.slice(-3)}.yaml
    dataRequirements:
${item.test.dataRequirements.map(req => `      - ${req}`).join('\n')}${item.assignedTestData ? `
    testData:
      id: ${item.assignedTestData.id}
      accountId: ${item.assignedTestData.accountId}
      referenceId: ${item.assignedTestData.referenceId}
      customerId: ${item.assignedTestData.customerId}
      assignedAt: ${item.assignedTestData.assignedAt}
      status: ${item.assignedTestData.status}` : ''}`).join('\n')}`;

    return yaml;
  };

  const copyYamlToClipboard = () => {
    const yaml = generateExecutionYaml();
    if (yaml) {
      navigator.clipboard.writeText(yaml);
    }
  };

  const downloadYaml = () => {
    const yaml = generateExecutionYaml();
    if (yaml) {
      const executionId = `EX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
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
    setShowYamlDialog(true);
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Test Search and Filters */}
        <div className="col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={filterFlujo} onValueChange={setFilterFlujo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Flow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Payment">Payment</SelectItem>
                    <SelectItem value="Login">Login</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                    <SelectItem value="Inquiry">Inquiry</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRuntime} onValueChange={setFilterRuntime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Runtime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="OCP Testing Studio">OCP Testing Studio</SelectItem>
                    <SelectItem value="Xero">Xero</SelectItem>
                    <SelectItem value="Sierra">Sierra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Dialog open={showCsvDialog} onOpenChange={setShowCsvDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Import CSV
                    </Button>
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
                        <label className="text-sm font-medium">Expected format:</label>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
{`testId
TC-00123
TC-00145
TC-00198`}
                        </pre>
                      </div>
                      <Textarea
                        placeholder="Paste your CSV here..."
                        value={csvInput}
                        onChange={(e) => setCsvInput(e.target.value)}
                        rows={8}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleCsvImport} className="flex-1">
                          Import
                        </Button>
                        <Button variant="outline" onClick={() => setShowCsvDialog(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="outline" onClick={() => {
                  setSearchTerm('');
                  setFilterFlujo('all');
                  setFilterRuntime('all');
                }}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

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
                      <TableHead>Test</TableHead>
                      <TableHead>Labels</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{test.id}</div>
                            <div className="text-xs text-gray-600 truncate" title={test.name}>
                              {test.name}
                            </div>
                          </div>
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
                          <Button
                            size="sm"
                            onClick={() => addToCart(test)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Cart and Execution */}
        <div className="col-span-7 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Execution Cart ({cart.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={clearCart}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tests in cart</p>
                  <p className="text-sm">Select tests from the left list</p>
                </div>
              ) : (
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
                      {cart.map((item) => (
                        <TableRow key={item.test.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{item.test.id}</div>
                              <div className="text-xs text-gray-600">{item.test.labels.flujo}</div>
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
                                <div className="font-mono">{item.assignedTestData.id}</div>
                                <div className="text-gray-500">{item.assignedTestData.referenceId}</div>
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  {item.assignedTestData.status}
                                </Badge>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">Not assigned</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.test.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                <label className="text-sm font-medium">Execution Runtime *</label>
                <Select value={selectedRuntime} onValueChange={setSelectedRuntime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select runtime to execute" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OCP Testing Studio">OCP Testing Studio</SelectItem>
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
                <Button 
                  onClick={handleExportYaml}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export Execution YAML
                </Button>
              </div>

              {cart.length > 0 && selectedRuntime && (
                <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-md">
                  <strong>Summary:</strong> {cart.length} tests selected to run on {selectedRuntime}.
                  {cart.filter(item => item.assignedTestData).length > 0 && (
                    <div className="mt-1">
                      ✓ {cart.filter(item => item.assignedTestData).length} tests have assigned test data
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
          <div className="flex flex-col items-center text-center space-y-6 p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-orange-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Select at least one test and one runtime
              </h3>
            </div>

            <Button 
              onClick={() => setShowValidationModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* YAML Export Dialog */}
      <Dialog open={showYamlDialog} onOpenChange={setShowYamlDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle>Execution YAML</DialogTitle>
                <DialogDescription>
                  Complete YAML to execute test batch
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyYamlToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button size="sm" onClick={downloadYaml}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div>
            <Textarea
              value={generateExecutionYaml()}
              readOnly
              className="font-mono text-sm min-h-[500px] resize-none"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}