import React, { useState } from 'react';

import { AlertCircle, Loader2 } from 'lucide-react';

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

interface CreateTestData {
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
  lastUsed: any;
}

interface CreateTestDataDialogProps {
  children: React.ReactNode;
  onTestDataCreated: (testData: CreateTestData) => void;
}

const availableClassifications = [
  'Active account',
  'Business account',
  'Primary user',
  'Authorized user',
  'Expired account',
  'Expired credit card',
  'Inactive credit card',
  'Card with offer',
  'To activate',
];

const availablePlatforms = ['OCP Testing Studio', 'Xero', 'Sierra'];

const customerTypes = ['Primary user', 'Authorized user', 'Company', 'Retail'];

const accountTypes = [
  'Checking Account',
  'Savings Account',
  'Credit Card',
  'Debit Card',
  'Business Account',
  'Line of Credit',
];

export function CreateTestDataDialog({
  children,
  onTestDataCreated,
}: CreateTestDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form fields
  const [customerType, setCustomerType] = useState('');
  const [accountType, setAccountType] = useState('');
  const [selectedClassifications, setSelectedClassifications] = useState<
    string[]
  >([]);

  // Labels
  const [proyecto, setProyecto] = useState('');
  const [ambiente, setAmbiente] = useState('');
  const [dataOwner, setDataOwner] = useState('');
  const [grupo, setGrupo] = useState('');
  const [fuente, setFuente] = useState('');

  // Scope
  const [visibility, setVisibility] = useState<
    'manual' | 'automated' | 'platform'
  >('manual');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const resetForm = () => {
    setCustomerType('');
    setAccountType('');
    setSelectedClassifications([]);
    setProyecto('');
    setAmbiente('');
    setDataOwner('');
    setGrupo('');
    setFuente('');
    setVisibility('manual');
    setSelectedPlatforms([]);
  };

  const handleClassificationChange = (
    classification: string,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedClassifications([...selectedClassifications, classification]);
    } else {
      setSelectedClassifications(
        selectedClassifications.filter(c => c !== classification)
      );
    }
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    } else {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    }
  };

  const generateTestDataId = () => {
    return `TD-${Date.now().toString().slice(-5)}`;
  };

  const generateCustomerId = () => {
    return `CUST-${Math.floor(Math.random() * 90000) + 10000}`;
  };

  const generateAccountId = () => {
    return `ACC-${Math.floor(Math.random() * 90000) + 10000}`;
  };

  const generateAccountRef = (accountId: string) => {
    return `REF-${accountId}`;
  };

  const simulateApiCall = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate potential API failure (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Failed to create account via external API');
    }

    const customerId = generateCustomerId();
    const accountId = generateAccountId();

    return {
      customerId,
      accountId,
      referenceId: generateAccountRef(accountId),
      customerName:
        customerType === 'Company'
          ? `Company ${customerId.slice(-3)}`
          : `User ${customerId.slice(-3)}`,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !customerType ||
      !accountType ||
      selectedClassifications.length === 0 ||
      !ambiente ||
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
      // Simulate API call to create account/customer
      const apiResult = await simulateApiCall();

      const newTestData: CreateTestData = {
        id: generateTestDataId(),
        customer: {
          customerId: apiResult.customerId,
          name: apiResult.customerName,
          type: customerType,
        },
        account: {
          accountId: apiResult.accountId,
          referenceId: apiResult.referenceId,
          type: accountType,
          createdAt: new Date().toISOString(),
        },
        classifications: selectedClassifications,
        labels: {
          proyecto,
          ambiente,
          dataOwner,
          ...(grupo && { grupo }),
          ...(fuente && { fuente }),
        },
        scope: {
          visibility,
          ...(visibility === 'platform' && { platforms: selectedPlatforms }),
        },
        status: 'Available',
        lastUsed: null,
      };

      onTestDataCreated(newTestData);
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

              {/* Account Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Configuration</CardTitle>
                  <CardDescription>
                    Specify the type of account and customer to create
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerType">Customer Type *</Label>
                      <Select
                        value={customerType}
                        onValueChange={value =>
                          setCustomerType(value as string)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {customerTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="accountType">Account Type *</Label>
                      <Select
                        value={accountType}
                        onValueChange={value => setAccountType(value as string)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {accountTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Classifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Classifications *</CardTitle>
                  <CardDescription>
                    Select classifications that will apply to the test data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {availableClassifications.map(classification => (
                      <div
                        key={classification}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`class-${classification}`}
                          checked={selectedClassifications.includes(
                            classification
                          )}
                          onCheckedChange={checked =>
                            handleClassificationChange(
                              classification,
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor={`class-${classification}`}
                          className="text-sm"
                        >
                          {classification}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedClassifications.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium">Selected:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedClassifications.map(classification => (
                          <Badge key={classification} variant="secondary">
                            {classification}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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
                      <Label htmlFor="proyecto">Project *</Label>
                      <Input
                        id="proyecto"
                        value={proyecto}
                        onChange={e => setProyecto(e.target.value)}
                        placeholder="E.g.: Core Migration, Release Q3"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ambiente">Environment *</Label>
                      <Select
                        value={ambiente}
                        onValueChange={value => setAmbiente(value as string)}
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
                      <Label htmlFor="grupo">Customer Group</Label>
                      <Select
                        value={grupo}
                        onValueChange={value => setGrupo(value as string)}
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
                      <Label htmlFor="fuente">Source</Label>
                      <Input
                        id="fuente"
                        value={fuente}
                        onChange={e => setFuente(e.target.value)}
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
                      onValueChange={value => setVisibility(value as any)}
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
