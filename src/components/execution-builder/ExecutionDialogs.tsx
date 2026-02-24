import { AlertTriangle, Copy, Download } from 'lucide-react';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import type { ExecutionBuilderViewModel } from './useExecutionBuilderViewModel';

type ExecutionDialogsProps = Pick<
  ExecutionBuilderViewModel,
  | 'showValidationModal'
  | 'setShowValidationModal'
  | 'showYamlDialog'
  | 'setShowYamlDialog'
  | 'copyYamlToClipboard'
  | 'downloadYaml'
  | 'generatedYaml'
>;

export function ExecutionDialogs({
  showValidationModal,
  setShowValidationModal,
  showYamlDialog,
  setShowYamlDialog,
  copyYamlToClipboard,
  downloadYaml,
  generatedYaml,
}: ExecutionDialogsProps) {
  return (
    <>
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
                <Button size="sm" variant="outline" onClick={copyYamlToClipboard}>
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
