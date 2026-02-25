import React, { useState } from 'react';

import { AlertCircle, Loader2 } from 'lucide-react';

import { CreateTestDataPayload } from '../services/types';

import { ClassificationPicker, extractTagValue } from './ClassificationPicker';
import { TdmRecipeCombobox } from './TdmRecipeCombobox';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Checkbox } from './ui/checkbox';
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

interface CreateTestDataDialogProps {
  children: React.ReactNode;
  onTestDataCreated: (payload: CreateTestDataPayload) => Promise<void> | void;
}

const availablePlatforms = ['OCP Testing Studio', 'Xero', 'Sierra'];

export function CreateTestDataDialog({
  children,
  onTestDataCreated,
}: CreateTestDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Classifications (includes customer-type: and account-type: tags)
  const [selectedClassifications, setSelectedClassifications] = useState<
    string[]
  >([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<
    string | undefined
  >();

  // Derive customer/account type from semantic tags
  const customerTypeTag = extractTagValue(
    selectedClassifications,
    'customer-type'
  );
  const accountTypeTag = extractTagValue(
    selectedClassifications,
    'account-type'
  );

  // Labels
  const [project, setProject] = useState('');
  const [environment, setEnvironment] = useState('');
  const [dataOwner, setDataOwner] = useState('');
  const [group, setGroup] = useState('');
  const [source, setSource] = useState('');

  // Scope
  const [visibility, setVisibility] = useState<
    'manual' | 'automated' | 'platform'
  >('manual');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const resetForm = () => {
    setSelectedClassifications([]);
    setSelectedRecipeId(undefined);
    setProject('');
    setEnvironment('');
    setDataOwner('');
    setGroup('');
    setSource('');
    setVisibility('manual');
    setSelectedPlatforms([]);
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    } else {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !customerTypeTag ||
      !accountTypeTag ||
      selectedClassifications.length === 0 ||
      !environment ||
      !dataOwner
    ) {
      alert('Please complete all required fields');
      return;
    }

    if (visibility === 'platform' && selectedPlatforms.length === 0) {
      alert('Must select at least one platform for "platform" scope');
      return;
    }

    setIsCreating(true);

    try {
      const payload: CreateTestDataPayload = {
        classifications: selectedClassifications,
        labels: {
          project,
          environment,
          dataOwner,
          ...(group && { group }),
          ...(source && { source }),
        },
        scope: {
          visibility,
          ...(visibility === 'platform' && { platforms: selectedPlatforms }),
        },
        ...(selectedRecipeId && { recipeId: selectedRecipeId }),
      };

      await onTestDataCreated(payload);
      setOpen(false);
      resetForm();
    } catch (error) {
      alert(
        `Error creating test data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="flex h-[90vh] !w-[50vw] !max-w-[50vw] flex-col bg-gradient-to-br from-white to-gray-50 p-0 sm:!max-w-[50vw]">
        <DialogHeader className="shrink-0 border-b border-gray-200 px-6 pb-4 pt-6">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Create New Test Data
          </DialogTitle>
          <DialogDescription className="text-lg font-medium text-gray-700">
            Create new test data through account/entity APIs. Data will be
            generated automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* API Creation Notice */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <AlertCircle className="h-5 w-5" />
                    API Creation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-700">
                    Test data is created automatically through external API
                    calls. You only need to specify the desired characteristics
                    and the system will generate the corresponding accounts and
                    entities.
                  </p>
                </CardContent>
              </Card>

              {/* Test Data Flavor — includes mandatory customer-type: and account-type: tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Data Flavor *</CardTitle>
                  <CardDescription>
                    Define the flavor of your test data using semantic tags.{' '}
                    <code className="rounded bg-gray-100 px-1 text-xs">
                      customer-type:
                    </code>{' '}
                    and{' '}
                    <code className="rounded bg-gray-100 px-1 text-xs">
                      account-type:
                    </code>{' '}
                    are required. Optionally pick a TDM Recipe to pre-fill.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TdmRecipeCombobox
                    onSelect={recipe => {
                      setSelectedRecipeId(recipe.id);
                      // Merge recipe tags with existing, singular tags replace
                      const merged = [...selectedClassifications];
                      for (const tag of recipe.tags) {
                        const key = tag.split(':')[0];
                        const isSingular =
                          key === 'customer-type' || key === 'account-type';
                        if (isSingular) {
                          const idx = merged.findIndex(c =>
                            c.startsWith(`${key}:`)
                          );
                          if (idx >= 0) merged.splice(idx, 1);
                        }
                        if (!merged.includes(tag)) merged.push(tag);
                      }
                      setSelectedClassifications(merged);
                    }}
                  />
                  <ClassificationPicker
                    value={selectedClassifications}
                    onChange={setSelectedClassifications}
                  />
                </CardContent>
              </Card>

              {/* Labels */}
              <Card>
                <CardHeader>
                  <CardTitle>Labels and Metadata</CardTitle>
                  <CardDescription>
                    Information for management and segmentation of test data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="project">Project *</Label>
                      <Input
                        id="project"
                        value={project}
                        onChange={e => setProject(e.target.value)}
                        placeholder="E.g.: Core Migration, Release Q3"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="environment">Environment *</Label>
                      <Select
                        value={environment}
                        onValueChange={value => setEnvironment(value as string)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="QA">QA</SelectItem>
                          <SelectItem value="Preprod">Preprod</SelectItem>
                          <SelectItem value="Sandbox">Sandbox</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dataOwner">Data Owner *</Label>
                      <Input
                        id="dataOwner"
                        value={dataOwner}
                        onChange={e => setDataOwner(e.target.value)}
                        placeholder="E.g.: AutomationBot, QA-Team"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="group">Customer Group</Label>
                      <Select
                        value={group}
                        onValueChange={value => setGroup(value as string)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VIP">VIP</SelectItem>
                          <SelectItem value="SME">SME</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="source">Source</Label>
                      <Input
                        id="source"
                        value={source}
                        onChange={e => setSource(e.target.value)}
                        placeholder="E.g.: Core API, Bulk load, Generated"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scope Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Scope and Visibility *</CardTitle>
                  <CardDescription>
                    Define who can use this test data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select
                      value={visibility}
                      onValueChange={value =>
                        setVisibility(
                          value as 'manual' | 'automated' | 'platform'
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">
                          Manual - Human use only from UI
                        </SelectItem>
                        <SelectItem value="automated">
                          Automated - Pre-pull by runners
                        </SelectItem>
                        <SelectItem value="platform">
                          Platform - Platform exclusive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {visibility === 'platform' && (
                    <div>
                      <Label>Allowed Platforms *</Label>
                      <div className="mt-2 space-y-2">
                        {availablePlatforms.map(platform => (
                          <div
                            key={platform}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`platform-${platform}`}
                              checked={selectedPlatforms.includes(platform)}
                              onCheckedChange={checked =>
                                handlePlatformChange(
                                  platform,
                                  checked as boolean
                                )
                              }
                            />
                            <Label
                              htmlFor={`platform-${platform}`}
                              className="text-sm"
                            >
                              {platform}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {selectedPlatforms.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-sm font-medium">Selected:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedPlatforms.map(platform => (
                              <Badge key={platform} variant="outline">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                    <strong>Note:</strong> The scope determines who can see and
                    use this test data:
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      <li>
                        <strong>Manual:</strong> Only human users from the
                        interface
                      </li>
                      <li>
                        <strong>Automated:</strong> CI/CD runners can access
                      </li>
                      <li>
                        <strong>Platform:</strong> Only specific platforms can
                        use it
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating via API...
                    </>
                  ) : (
                    'Create Test Data'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
