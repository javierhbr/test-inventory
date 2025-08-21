import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Copy, Download, History, FileText, User, Database } from 'lucide-react';

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
  status: 'Disponible' | 'En uso' | 'Consumida' | 'Reacondicionamiento' | 'Inactiva';
  lastUsed: {
    date: string;
    testId: string;
    runtime: string;
  } | null;
}

interface UsageHistoryItem {
  id: string;
  testId: string;
  runtime: string;
  date: string;
  result: string;
  duration: string;
}

interface StateTransition {
  id: string;
  fromStatus: string;
  toStatus: string;
  at: string;
  by: string;
  reason: string;
}

const mockUsageHistory: UsageHistoryItem[] = [
  {
    id: 'UH-001',
    testId: 'TC-00123',
    runtime: 'OCP Testing Studio',
    date: '2025-08-15T10:30:00Z',
    result: 'FAILED',
    duration: '45s'
  },
  {
    id: 'UH-002',
    testId: 'TC-00098',
    runtime: 'OCP Testing Studio',
    date: '2025-08-10T14:22:00Z',
    result: 'PASSED',
    duration: '32s'
  }
];

const mockStateTransitions: StateTransition[] = [
  {
    id: 'ST-001',
    fromStatus: 'En uso',
    toStatus: 'Consumida',
    at: '2025-08-15T10:30:00Z',
    by: 'automation-bot',
    reason: 'Payment completed - account consumed'
  },
  {
    id: 'ST-002',
    fromStatus: 'Disponible',
    toStatus: 'En uso',
    at: '2025-08-15T10:25:00Z',
    by: 'execution-engine',
    reason: 'Assigned to test execution'
  },
  {
    id: 'ST-003',
    fromStatus: 'Reacondicionamiento',
    toStatus: 'Disponible',
    at: '2025-08-10T09:00:00Z',
    by: 'data-team',
    reason: 'Manual reconditioning completed'
  }
];

export function TestDataDetail({ testData }: { testData: TestData }) {
  const [activeTab, setActiveTab] = useState('general');

  const testDataYaml = `id: ${testData.id}
customer:
  customerId: ${testData.customer.customerId}
  name: ${testData.customer.name}
  type: ${testData.customer.type}
account:
  accountId: ${testData.account.accountId}
  referenceId: ${testData.account.referenceId}
  type: ${testData.account.type}
  createdAt: ${testData.account.createdAt}
classifications:
${testData.classifications.map(c => `  - ${c}`).join('\n')}
scope:
  visibility: ${testData.scope.visibility}${testData.scope.platforms ? `
  platforms:
${testData.scope.platforms.map(p => `    - ${p}`).join('\n')}` : ''}
status: ${testData.status}
labels:
  proyecto: ${testData.labels.proyecto}
  ambiente: ${testData.labels.ambiente}
  dataOwner: ${testData.labels.dataOwner}${testData.labels.grupo ? `
  grupo: ${testData.labels.grupo}` : ''}${testData.labels.fuente ? `
  fuente: ${testData.labels.fuente}` : ''}
lastUsed: ${testData.lastUsed ? `
  date: ${testData.lastUsed.date}
  testId: ${testData.lastUsed.testId}
  runtime: ${testData.lastUsed.runtime}` : 'null'}
usageHistory: []`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Disponible': 'bg-green-100 text-green-800',
      'En uso': 'bg-blue-100 text-blue-800',
      'Consumida': 'bg-red-100 text-red-800',
      'Reacondicionamiento': 'bg-yellow-100 text-yellow-800',
      'Inactiva': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getResultBadge = (result: string) => {
    const variants = {
      'PASSED': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'SKIPPED': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={variants[result as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {result}
      </Badge>
    );
  };

  const getScopeBadge = (scope: any) => {
    const variants = {
      'manual': 'bg-purple-100 text-purple-800',
      'automated': 'bg-blue-100 text-blue-800',
      'platform': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={variants[scope.visibility as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {scope.visibility}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            General Info
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="yaml" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            YAML View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer ID</label>
                  <div className="font-mono">{testData.customer.customerId}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <div>{testData.customer.name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <Badge variant="outline">{testData.customer.type}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Account ID</label>
                  <div className="font-mono">{testData.account.accountId}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reference ID</label>
                  <div className="font-mono">{testData.account.referenceId}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Type</label>
                  <Badge variant="outline">{testData.account.type}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <div>{new Date(testData.account.createdAt).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testData.classifications.map((classification, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {classification}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Labels & Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Proyecto</label>
                    <Badge variant="outline">{testData.labels.proyecto}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ambiente</label>
                    <Badge variant="outline">{testData.labels.ambiente}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data Owner</label>
                    <Badge variant="outline">{testData.labels.dataOwner}</Badge>
                  </div>
                  {testData.labels.grupo && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Grupo</label>
                      <Badge variant="outline">{testData.labels.grupo}</Badge>
                    </div>
                  )}
                  {testData.labels.fuente && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fuente</label>
                      <Badge variant="outline">{testData.labels.fuente}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scope & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Visibility</label>
                  <div>{getScopeBadge(testData.scope)}</div>
                </div>
                {testData.scope.platforms && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Platforms</label>
                    <div className="space-y-2">
                      {testData.scope.platforms.map((platform, index) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Status</label>
                  <div>{getStatusBadge(testData.status)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Last Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {testData.lastUsed ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date</label>
                      <div>{new Date(testData.lastUsed.date).toLocaleString()}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Test ID</label>
                      <div className="font-mono">{testData.lastUsed.testId}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Runtime</label>
                      <Badge variant="outline">{testData.lastUsed.runtime}</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Never used</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage History</CardTitle>
                <CardDescription>
                  Historial de uso en diferentes tests y ejecuciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test ID</TableHead>
                      <TableHead>Runtime</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsageHistory.map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell className="font-mono">{usage.testId}</TableCell>
                        <TableCell>{usage.runtime}</TableCell>
                        <TableCell>{new Date(usage.date).toLocaleString()}</TableCell>
                        <TableCell>{getResultBadge(usage.result)}</TableCell>
                        <TableCell>{usage.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>State Transitions</CardTitle>
                <CardDescription>
                  Historial de cambios de estado del test data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>By</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStateTransitions.map((transition) => (
                      <TableRow key={transition.id}>
                        <TableCell>{getStatusBadge(transition.fromStatus)}</TableCell>
                        <TableCell>{getStatusBadge(transition.toStatus)}</TableCell>
                        <TableCell>{new Date(transition.at).toLocaleString()}</TableCell>
                        <TableCell>{transition.by}</TableCell>
                        <TableCell className="max-w-xs truncate" title={transition.reason}>
                          {transition.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="yaml">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>YAML Definition</CardTitle>
                  <CardDescription>
                    Representación YAML del test data
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(testDataYaml)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export YAML
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={testDataYaml}
                readOnly
                className="font-mono text-sm min-h-[400px] resize-none"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}