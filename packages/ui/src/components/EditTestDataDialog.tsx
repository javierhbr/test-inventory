import React, { useState } from 'react';

import { Pencil, Save, X } from 'lucide-react';

import { configService, SemanticRuleConfig } from '../services/configService';
import { Lob, TestDataRecord } from '../services/types';
import { LOB_VALUES, useLobStore } from '../stores/lobStore';

import { ClassificationPicker } from './ClassificationPicker';
import { TdmRecipeCombobox } from './TdmRecipeCombobox';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

function scheduleToTags(
  schedule: { month?: number; days?: number; year?: number } | null
): string[] {
  if (!schedule) return [];
  const tags: string[] = [];
  if (schedule.month !== undefined)
    tags.push(`schedule:month:${schedule.month}`);
  if (schedule.days !== undefined) tags.push(`schedule:days:${schedule.days}`);
  if (schedule.year !== undefined) tags.push(`schedule:year:${schedule.year}`);
  return tags;
}

interface EditTestDataDialogProps {
  testData: TestDataRecord;
  onTestDataUpdated: (updatedData: TestDataRecord) => Promise<void> | void;
  children: React.ReactNode;
}

export function EditTestDataDialog({
  testData,
  onTestDataUpdated,
  children,
}: EditTestDataDialogProps) {
  const isAdmin = useLobStore(s => s.isAdmin);
  const [isOpen, setIsOpen] = useState(false);
  const [semanticRules, setSemanticRules] = React.useState<
    SemanticRuleConfig[]
  >([]);

  React.useEffect(() => {
    configService.loadSystemConfig().then(config => {
      setSemanticRules(config.dsls.semanticRules);
    });
  }, []);

  const [classifications, setClassifications] = useState<string[]>([
    ...testData.classifications,
    ...scheduleToTags(testData.reconditioningSchedule),
  ]);
  const [formData, setFormData] = useState({
    project: testData.labels.project,
    environment: testData.labels.environment,
    dataOwner: testData.labels.dataOwner,
    group: testData.labels.group || '',
    source: testData.labels.source || '',
    visibility: testData.scope.visibility,
    platforms: testData.scope.platforms?.join(', ') || '',
    status: testData.status,
    team: testData.team,
    lob: testData.lob,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const updatedTestData: TestDataRecord = {
      ...testData,
      classifications,
      labels: {
        project: formData.project,
        environment: formData.environment,
        dataOwner: formData.dataOwner,
        group: formData.group || undefined,
        source: formData.source || undefined,
      },
      scope: {
        visibility: formData.visibility as 'manual' | 'automated' | 'platform',
        platforms: formData.platforms
          ? formData.platforms
              .split(',')
              .map(p => p.trim())
              .filter(p => p.length > 0)
          : undefined,
      },
      status: formData.status as
        | 'Available'
        | 'In Use'
        | 'Consumed'
        | 'Reconditioning'
        | 'Inactive',
      team: formData.team,
      lob: formData.lob as Lob,
    };

    try {
      await onTestDataUpdated(updatedTestData);
      setIsOpen(false);
    } catch (error) {
      alert(
        `Error updating test data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleReset = () => {
    setClassifications([
      ...testData.classifications,
      ...scheduleToTags(testData.reconditioningSchedule),
    ]);
    setFormData({
      project: testData.labels.project,
      environment: testData.labels.environment,
      dataOwner: testData.labels.dataOwner,
      group: testData.labels.group || '',
      source: testData.labels.source || '',
      visibility: testData.scope.visibility,
      platforms: testData.scope.platforms?.join(', ') || '',
      status: testData.status,
      team: testData.team,
      lob: testData.lob,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="flex h-[90vh] !w-[50vw] !max-w-[50vw] flex-col bg-gradient-to-br from-white to-gray-50 p-0 sm:!max-w-[50vw]">
        <DialogHeader className="shrink-0 border-b border-gray-200 px-6 pb-4 pt-6">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Pencil className="h-6 w-6" />
            Edit Test Data - {testData.id}
          </DialogTitle>
          <DialogDescription className="text-lg font-medium text-gray-700">
            Modify test data properties. Customer and Account information is
            read-only.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full space-y-6 overflow-y-auto">
            {/* Read-Only Customer Information */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg text-gray-700">
                  Customer Information (Read-Only)
                </CardTitle>
                <CardDescription>
                  This information cannot be modified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Customer ID
                    </Label>
                    <div className="mt-1 rounded border bg-gray-100 p-2 font-mono text-gray-700">
                      {testData.customer.customerId}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Customer Name
                    </Label>
                    <div className="mt-1 rounded border bg-gray-100 p-2 text-gray-700">
                      {testData.customer.name}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">
                      Customer Type
                    </Label>
                    <div className="mt-1 rounded border bg-gray-100 p-2 text-gray-700">
                      {testData.customer.type}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Read-Only Account Information */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg text-gray-700">
                  Account Information (Read-Only)
                </CardTitle>
                <CardDescription>
                  This information cannot be modified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Account ID
                    </Label>
                    <div className="mt-1 rounded border bg-gray-100 p-2 font-mono text-gray-700">
                      {testData.account.accountId}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Reference ID
                    </Label>
                    <div className="mt-1 rounded border bg-gray-100 p-2 font-mono text-gray-700">
                      {testData.account.referenceId}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Account Type
                    </Label>
                    <div className="mt-1 rounded border bg-gray-100 p-2 text-gray-700">
                      {testData.account.type}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Created At
                    </Label>
                    <div className="mt-1 rounded border bg-gray-100 p-2 text-gray-700">
                      {new Date(testData.account.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Editable Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Editable Properties</CardTitle>
                <CardDescription>Modify these fields as needed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Test Data Flavor */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Test Data Flavor
                  </Label>
                  <TdmRecipeCombobox
                    onSelect={recipes => {
                      const merged = [...classifications];
                      const singularKeys = new Set(
                        semanticRules.map(r => r.key)
                      );
                      const allTags = recipes.flatMap(r => r.tags);
                      for (const tag of allTags) {
                        const key = tag.split(':')[0];
                        const isSingular = singularKeys.has(key);
                        if (isSingular) {
                          const idx = merged.findIndex(c =>
                            c.startsWith(`${key}:`)
                          );
                          if (idx >= 0) merged.splice(idx, 1);
                        }
                        if (!merged.includes(tag)) merged.push(tag);
                      }
                      setClassifications(merged);
                    }}
                  />
                  <ClassificationPicker
                    value={classifications}
                    onChange={setClassifications}
                  />
                </div>

                {/* Labels Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project" className="text-sm font-medium">
                      Project
                    </Label>
                    <Input
                      id="project"
                      value={formData.project}
                      onChange={e =>
                        handleInputChange('project', e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="environment"
                      className="text-sm font-medium"
                    >
                      Environment
                    </Label>
                    <Select
                      value={formData.environment}
                      onValueChange={value =>
                        handleInputChange('environment', value as string)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QA">QA</SelectItem>
                        <SelectItem value="Preprod">Preprod</SelectItem>
                        <SelectItem value="Production">Production</SelectItem>
                        <SelectItem value="Staging">Staging</SelectItem>
                        <SelectItem value="Sandbox">Sandbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dataOwner" className="text-sm font-medium">
                      Data Owner
                    </Label>
                    <Input
                      id="dataOwner"
                      value={formData.dataOwner}
                      onChange={e =>
                        handleInputChange('dataOwner', e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="group" className="text-sm font-medium">
                      Group (Optional)
                    </Label>
                    <Input
                      id="group"
                      value={formData.group}
                      onChange={e => handleInputChange('group', e.target.value)}
                      className="mt-1"
                      placeholder="e.g., SME, VIP, Premium"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="source" className="text-sm font-medium">
                      Source (Optional)
                    </Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={e =>
                        handleInputChange('source', e.target.value)
                      }
                      className="mt-1"
                      placeholder="e.g., Core API, Bulk load, Generated"
                    />
                  </div>
                </div>

                {/* Scope Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="visibility" className="text-sm font-medium">
                      Visibility
                    </Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={value =>
                        handleInputChange('visibility', value as string)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="automated">Automated</SelectItem>
                        <SelectItem value="platform">Platform</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="platforms" className="text-sm font-medium">
                      Platforms (Optional)
                    </Label>
                    <Input
                      id="platforms"
                      value={formData.platforms}
                      onChange={e =>
                        handleInputChange('platforms', e.target.value)
                      }
                      className="mt-1"
                      placeholder="e.g., OCP Testing Studio, Sierra, Xero"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate multiple platforms with commas
                    </p>
                  </div>
                </div>

                {/* Status and Team */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={value =>
                        handleInputChange('status', value as string)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="In Use">In Use</SelectItem>
                        <SelectItem value="Consumed">Consumed</SelectItem>
                        <SelectItem value="Reconditioning">
                          Reconditioning
                        </SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="team" className="text-sm font-medium">
                      Team
                    </Label>
                    <Input
                      id="team"
                      value={formData.team}
                      onChange={e => handleInputChange('team', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lob" className="text-sm font-medium">
                      Line of Business
                    </Label>
                    {isAdmin ? (
                      <Select
                        value={formData.lob}
                        onValueChange={value =>
                          handleInputChange('lob', value as Lob)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOB_VALUES.map(lobValue => (
                            <SelectItem key={lobValue} value={lobValue}>
                              {lobValue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={formData.lob}
                        disabled
                        className="mt-1 bg-gray-50"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Used Information (Read-Only) */}
            {testData.lastUsed && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-700">
                    Last Used Information (Read-Only)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Date
                      </Label>
                      <div className="mt-1 rounded border bg-gray-100 p-2 text-gray-700">
                        {new Date(testData.lastUsed.date).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Test ID
                      </Label>
                      <div className="mt-1 rounded border bg-gray-100 p-2 font-mono text-gray-700">
                        {testData.lastUsed.testId}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Runtime
                      </Label>
                      <div className="mt-1 rounded border bg-gray-100 p-2 text-gray-700">
                        {testData.lastUsed.runtime}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button onClick={handleSave} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
