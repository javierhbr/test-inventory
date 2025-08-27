import { useState } from 'react';

import {
  Copy,
  Download,
  History,
  FileText,
  Play,
  Settings,
} from 'lucide-react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';

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

interface TestRun {
  runId: string;
  executedAt: string;
  executedBy: string;
  runtime: string;
  status: string;
  duration: string;
  testDataUsed: string;
}

interface TestVersion {
  version: string;
  modifiedAt: string;
  modifiedBy: string;
  changeSummary: string;
}

const mockRuns: TestRun[] = [
  {
    runId: 'RUN-001',
    executedAt: '2025-08-15T10:30:00Z',
    executedBy: 'automation-bot',
    runtime: 'OCP Testing Studio',
    status: 'FAILED',
    duration: '45s',
    testDataUsed: 'TD-20031',
  },
  {
    runId: 'RUN-002',
    executedAt: '2025-08-10T09:15:00Z',
    executedBy: 'qa-engineer',
    runtime: 'OCP Testing Studio',
    status: 'PASSED',
    duration: '32s',
    testDataUsed: 'TD-20021',
  },
];

const mockVersions: TestVersion[] = [
  {
    version: 'v1.2',
    modifiedAt: '2025-08-20T09:15:00Z',
    modifiedBy: 'qa-engineer',
    changeSummary: 'Updated data requirements',
  },
  {
    version: 'v1.1',
    modifiedAt: '2025-08-18T14:30:00Z',
    modifiedBy: 'test-architect',
    changeSummary: 'Added mobile experience support',
  },
  {
    version: 'v1.0',
    modifiedAt: '2025-08-15T16:00:00Z',
    modifiedBy: 'qa-engineer',
    changeSummary: 'Initial version',
  },
];

export function TestDetail({ test }: { test: Test }) {
  const [activeTab, setActiveTab] = useState('general');

  const testYaml = `id: ${test.id}
name: ${test.name}
goldenDialogId: GD-001
dialogGroupIdFile:
  bucket: my-test-dialogs
  path: golden-dialogs/payment-flow/dialog-001.yaml
flow: ${test.flow}
attributes:
  priority: High
  module: Pago
labels:
  flow: ${test.labels.flow}
  intent: ${test.labels.intent}
  experience: ${test.labels.experience}
  project: ${test.labels.project}
dataRequirements:
${test.dataRequirements.map(req => `  - ${req}`).join('\n')}
supportedRuntimes:
${test.supportedRuntimes.map(runtime => `  - ${runtime}`).join('\n')}
executions:
  last:
    date: ${test.lastExecution?.date || 'null'}
    runtime: ${test.lastExecution?.runtime || 'null'}
    status: ${test.lastExecution?.status || 'null'}
    testDataUsed:
      id: TD-20031
      accountId: ACC-99871
      customerId: CUST-77891`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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

  return (
    <div className="h-full min-h-[600px] space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General Info
          </TabsTrigger>
          <TabsTrigger value="executions" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Executions
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="yaml" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            YAML View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="min-h-[500px] space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Test ID
                  </label>
                  <div className="font-mono">{test.id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <div>{test.name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Flow
                  </label>
                  <div>{test.flow}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Team
                  </label>
                  <Badge variant="outline">{test.team}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Current Version
                  </label>
                  <Badge variant="outline">{test.version}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Modified
                  </label>
                  <div>{new Date(test.lastModified).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Labels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Flow
                    </label>
                    <Badge variant="outline">{test.labels.flow}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Intent
                    </label>
                    <Badge variant="outline">{test.labels.intent}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Experience
                    </label>
                    <Badge variant="outline">{test.labels.experience}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Project
                    </label>
                    <Badge variant="outline">{test.labels.project}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {test.dataRequirements.map((req, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="mb-2 mr-2"
                    >
                      {req}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supported Runtimes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {test.supportedRuntimes.map((runtime, index) => (
                    <Badge key={index} variant="outline" className="mb-2 mr-2">
                      {runtime}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dialog Group ID File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Golden Dialog ID
                  </label>
                  <div className="font-mono">GD-001</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    S3 Bucket
                  </label>
                  <div className="font-mono">my-test-dialogs</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    S3 Path
                  </label>
                  <div className="font-mono">
                    golden-dialogs/payment-flow/dialog-001.yaml
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="min-h-[500px]">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>
                Complete record of all test executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Run ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Executed by</TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Test Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRuns.map(run => (
                    <TableRow key={run.runId}>
                      <TableCell className="font-mono">{run.runId}</TableCell>
                      <TableCell>
                        {new Date(run.executedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{run.executedBy}</TableCell>
                      <TableCell>{run.runtime}</TableCell>
                      <TableCell>{getStatusBadge(run.status)}</TableCell>
                      <TableCell>{run.duration}</TableCell>
                      <TableCell className="font-mono">
                        {run.testDataUsed}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="min-h-[500px]">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>
                Version control and changes made
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Modified by</TableHead>
                    <TableHead>Change Summary</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVersions.map(version => (
                    <TableRow key={version.version}>
                      <TableCell>
                        <Badge variant="outline">{version.version}</Badge>
                        {version.version === test.version && (
                          <Badge className="ml-2 text-xs">Current</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(version.modifiedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{version.modifiedBy}</TableCell>
                      <TableCell>{version.changeSummary}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          {version.version !== test.version && (
                            <Button size="sm" variant="outline">
                              Rollback
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
        </TabsContent>

        <TabsContent value="yaml" className="min-h-[500px]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>YAML Definition</CardTitle>
                  <CardDescription>
                    YAML representation of the test case
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(testYaml)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export YAML
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={testYaml}
                readOnly
                className="h-[400px] resize-none font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
