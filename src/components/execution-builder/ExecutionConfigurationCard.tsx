import { FileText } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { RUNTIME_OPTIONS } from './utils';
import type { ExecutionBuilderViewModel } from './useExecutionBuilderViewModel';

type ExecutionConfigurationCardProps = Pick<
  ExecutionBuilderViewModel,
  | 'selectedRuntime'
  | 'setSelectedRuntime'
  | 'assignTestData'
  | 'handleExportYaml'
  | 'cart'
  | 'assignedTestDataCount'
>;

export function ExecutionConfigurationCard({
  selectedRuntime,
  setSelectedRuntime,
  assignTestData,
  handleExportYaml,
  cart,
  assignedTestDataCount,
}: ExecutionConfigurationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Execution Runtime *</label>
          <Select
            value={selectedRuntime}
            onValueChange={value => setSelectedRuntime(value as string)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RUNTIME_OPTIONS.map(runtime => (
                <SelectItem key={runtime} value={runtime}>
                  {runtime}
                </SelectItem>
              ))}
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
            <strong>Summary:</strong> {cart.length} tests selected to run on{' '}
            {selectedRuntime}.
            {assignedTestDataCount > 0 && (
              <div className="mt-1">
                ✓ {assignedTestDataCount} tests have assigned test data
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
