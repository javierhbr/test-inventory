import React, { useRef, useState } from 'react';

import { AlertCircle, Check, Loader2, Pencil, X } from 'lucide-react';

import { TestDataRecord } from '../services/types';

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
  onTestDataCreated: (testData: TestDataRecord) => Promise<void> | void;
}

// --- Semantic tag parser ---

interface SemanticRule {
  key: string;
  regex: RegExp;
  parse: (match: RegExpMatchArray) => Record<string, unknown>;
  format: (parsed: Record<string, unknown>) => string;
  suggestions: string[];
}

const SEMANTIC_RULES: SemanticRule[] = [
  {
    key: 'account',
    regex: /^account:(primary|secondary)$/i,
    parse: match => ({ account: match[1].toLowerCase() }),
    format: parsed => `account:${parsed.account}`,
    suggestions: ['account:primary', 'account:secondary'],
  },
  {
    key: 'transactions',
    regex: /^transactions:(pending|completed):(\d+)$/i,
    parse: match => ({
      transactions: {
        status: match[1].toLowerCase(),
        count: parseInt(match[2], 10),
      },
    }),
    format: parsed => {
      const t = parsed.transactions as { status: string; count: number };
      return `transactions:${t.status}:${t.count}`;
    },
    suggestions: ['transactions:pending:', 'transactions:completed:'],
  },
  {
    key: 'card',
    regex: /^card:(active|expired|inactive|new)$/i,
    parse: match => ({ card: match[1].toLowerCase() }),
    format: parsed => `card:${parsed.card}`,
    suggestions: ['card:active', 'card:expired', 'card:inactive', 'card:new'],
  },
  {
    key: 'balance',
    regex: /^balance:(high|low)$/i,
    parse: match => ({ balance: match[1].toLowerCase() }),
    format: parsed => `balance:${parsed.balance}`,
    suggestions: ['balance:high', 'balance:low'],
  },
  {
    key: 'user',
    regex: /^user:(primary|authorized|verified|mfa)$/i,
    parse: match => ({ user: match[1].toLowerCase() }),
    format: parsed => `user:${parsed.user}`,
    suggestions: [
      'user:primary',
      'user:authorized',
      'user:verified',
      'user:mfa',
    ],
  },
];

const ALL_SEMANTIC_SUGGESTIONS = SEMANTIC_RULES.flatMap(r => r.suggestions);
const PRIMARY_TAG_CATEGORIES = SEMANTIC_RULES.map(r => `${r.key}:`);

function tryParseSemanticTag(
  input: string
): { tag: string; parsed: Record<string, unknown> } | null {
  const trimmed = input.trim();
  for (const rule of SEMANTIC_RULES) {
    const match = trimmed.match(rule.regex);
    if (match) {
      const parsed = rule.parse(match);
      return { tag: rule.format(parsed), parsed };
    }
  }
  return null;
}

function getSemanticSuggestions(input: string): string[] {
  if (!input.trim()) return PRIMARY_TAG_CATEGORIES;
  const lower = input.toLowerCase();
  // If typing a category prefix (e.g. "acc"), show matching categories
  const matchingCategories = PRIMARY_TAG_CATEGORIES.filter(c =>
    c.startsWith(lower)
  );
  // If typing within a category (e.g. "account:"), show leaf values
  const matchingLeaves = ALL_SEMANTIC_SUGGESTIONS.filter(s =>
    s.startsWith(lower)
  );
  return matchingLeaves.length > 0 ? matchingLeaves : matchingCategories;
}

const availableClassifications = [
  'Active account',
  'Active credit card',
  'Active user',
  'Authorized user',
  'Biometric enabled',
  'Business account',
  'Card with offer',
  'Compliance verified',
  'Customer profile',
  'Document access',
  'Email access',
  'Expired account',
  'Expired credit card',
  'High balance',
  'High value',
  'Inactive credit card',
  'Insufficient funds',
  'International account',
  'Low balance account',
  'Merchant account',
  'MFA enabled account',
  'Mobile app user',
  'Mobile device',
  'Multi-user access',
  'New card',
  'Payment processing',
  'Payment request',
  'Phone verified',
  'Premium account',
  'Primary user',
  'Security questions setup',
  'Statement period data',
  'To be activated',
  'User account',
  'Verified customer',
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
  const [classificationInput, setClassificationInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const classificationInputRef = useRef<HTMLInputElement>(null);

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
    setCustomerType('');
    setAccountType('');
    setSelectedClassifications([]);
    setClassificationInput('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    setProject('');
    setEnvironment('');
    setDataOwner('');
    setGroup('');
    setSource('');
    setVisibility('manual');
    setSelectedPlatforms([]);
  };

  // Determine if user is typing a semantic tag (contains ':')
  const inputTrimmed = classificationInput.trim();
  const isSemanticMode = inputTrimmed.includes(':');

  const semanticSuggestions = getSemanticSuggestions(inputTrimmed).filter(
    s => !selectedClassifications.includes(s)
  );

  const plainSuggestions = inputTrimmed
    ? availableClassifications.filter(
        c =>
          c.toLowerCase().includes(inputTrimmed.toLowerCase()) &&
          !selectedClassifications.includes(c)
      )
    : [];

  // Always show semantic tags first, then plain suggestions as fallback
  const filteredSuggestions =
    semanticSuggestions.length > 0 ? semanticSuggestions : plainSuggestions;

  const addClassification = (classification: string) => {
    const trimmed = classification.trim();
    if (!trimmed || selectedClassifications.includes(trimmed)) {
      setClassificationInput('');
      setHighlightedIndex(-1);
      return;
    }

    // Try to parse as semantic tag — normalize the display
    const parsed = tryParseSemanticTag(trimmed);
    const tag = parsed ? parsed.tag : trimmed;

    if (!selectedClassifications.includes(tag)) {
      setSelectedClassifications([...selectedClassifications, tag]);
    }
    setClassificationInput('');
    setHighlightedIndex(-1);
  };

  const removeClassification = (classification: string) => {
    setSelectedClassifications(
      selectedClassifications.filter(c => c !== classification)
    );
  };

  const editClassification = (classification: string) => {
    removeClassification(classification);
    setClassificationInput(classification);
    setHighlightedIndex(-1);
    // Focus the input after a tick so React re-renders first
    setTimeout(() => classificationInputRef.current?.focus(), 0);
  };

  const handleClassificationKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Arrow navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setShowSuggestions(true);
        setHighlightedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setShowSuggestions(true);
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      }
      return;
    }

    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = classificationInput.trim();
      if (!trimmed) return;

      // If an item is highlighted, use that
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < filteredSuggestions.length
      ) {
        const selected = filteredSuggestions[highlightedIndex];
        const isSemantic = selected.includes(':');
        if (isSemantic && selected.endsWith(':')) {
          setClassificationInput(selected);
          setHighlightedIndex(-1);
        } else {
          addClassification(selected);
        }
      } else if (filteredSuggestions.length > 0) {
        // No highlight — use first match
        const first = filteredSuggestions[0];
        const isSemantic = first.includes(':');
        if (isSemantic && first.endsWith(':')) {
          setClassificationInput(first);
          setHighlightedIndex(-1);
        } else {
          addClassification(first);
        }
      } else {
        // No suggestions — add as-is
        addClassification(trimmed);
      }
      return;
    }

    // Remove last badge on Backspace when input is empty
    if (
      e.key === 'Backspace' &&
      classificationInput === '' &&
      selectedClassifications.length > 0
    ) {
      removeClassification(
        selectedClassifications[selectedClassifications.length - 1]
      );
    }
  };

  // Real-time parse result for visual feedback
  const liveParseResult = isSemanticMode
    ? tryParseSemanticTag(inputTrimmed)
    : null;

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
      // Simulate API call to create account/customer
      const apiResult = await simulateApiCall();

      const newTestData: TestDataRecord = {
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
        status: 'Available',
        lastUsed: null,
        team: dataOwner || 'Default Team',
      };

      await onTestDataCreated(newTestData);
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
                    Type to search, use semantic tags (e.g.{' '}
                    <code className="rounded bg-gray-100 px-1 text-xs">
                      account:primary
                    </code>
                    ), or add custom values
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Selected badges */}
                  {selectedClassifications.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedClassifications.map(classification => {
                        const isSemantic = classification.includes(':');
                        return (
                          <Badge
                            key={classification}
                            variant={isSemantic ? 'default' : 'secondary'}
                            className={`flex items-center gap-1 pr-1 ${
                              isSemantic
                                ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                                : ''
                            }`}
                          >
                            <span className="font-mono text-xs">
                              {classification}
                            </span>
                            <button
                              type="button"
                              onClick={() => editClassification(classification)}
                              className="ml-0.5 rounded-full p-0.5 hover:bg-gray-300/50"
                              title="Edit"
                            >
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                removeClassification(classification)
                              }
                              className="rounded-full p-0.5 hover:bg-gray-300/50"
                              title="Remove"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Semantic input */}
                  <div className="relative">
                    <Input
                      ref={classificationInputRef}
                      value={classificationInput}
                      onChange={e => {
                        setClassificationInput(e.target.value);
                        setShowSuggestions(true);
                        setHighlightedIndex(-1);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowSuggestions(false);
                          setHighlightedIndex(-1);
                        }, 200);
                      }}
                      onKeyDown={handleClassificationKeyDown}
                      placeholder='e.g. "Active account" or "account:primary"'
                      className={
                        liveParseResult
                          ? 'border-green-400 focus-visible:border-green-500 focus-visible:ring-green-200'
                          : inputTrimmed && filteredSuggestions.length > 0
                            ? 'border-blue-300 focus-visible:border-blue-400 focus-visible:ring-blue-200'
                            : ''
                      }
                    />

                    {/* Live parse result preview */}
                    {liveParseResult && (
                      <div className="mt-1 rounded bg-green-50 px-3 py-1.5 text-xs text-green-700">
                        <span className="font-medium">Parsed: </span>
                        <code className="font-mono">
                          {JSON.stringify(liveParseResult.parsed)}
                        </code>
                        <span className="ml-2 text-green-500">
                          — press Enter to add
                        </span>
                      </div>
                    )}

                    {/* Suggestions dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                        {filteredSuggestions.map((suggestion, index) => {
                          const isSemantic = suggestion.includes(':');
                          const isHighlighted = index === highlightedIndex;
                          return (
                            <button
                              key={suggestion}
                              type="button"
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                                isHighlighted
                                  ? 'bg-blue-50 text-blue-900'
                                  : 'hover:bg-gray-100'
                              }`}
                              onMouseDown={e => {
                                e.preventDefault();
                                if (isSemantic && suggestion.endsWith(':')) {
                                  setClassificationInput(suggestion);
                                  setHighlightedIndex(-1);
                                } else {
                                  addClassification(suggestion);
                                }
                                setShowSuggestions(true);
                              }}
                              onMouseEnter={() => setHighlightedIndex(index)}
                            >
                              {isSemantic ? (
                                <span className="inline-block h-2 w-2 rounded-full bg-indigo-400" />
                              ) : (
                                <Check
                                  className={`h-3.5 w-3.5 ${isHighlighted ? 'text-blue-500' : 'text-transparent'}`}
                                />
                              )}
                              <span
                                className={
                                  isSemantic ? 'font-mono text-indigo-700' : ''
                                }
                              >
                                {suggestion}
                                {isSemantic && suggestion.endsWith(':') && (
                                  <span className="ml-1 text-gray-400">
                                    (type a value)
                                  </span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Custom value hint */}
                    {showSuggestions &&
                      inputTrimmed &&
                      filteredSuggestions.length === 0 &&
                      !liveParseResult && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white p-3 shadow-lg">
                          <p className="text-sm text-gray-500">
                            Press{' '}
                            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium">
                              Enter
                            </kbd>{' '}
                            to add &quot;{inputTrimmed}&quot; as a custom
                            classification
                          </p>
                        </div>
                      )}
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    <p>
                      Press Enter or comma to add. Backspace to remove last
                      item.
                    </p>
                    <p>
                      Semantic tags:{' '}
                      <code className="rounded bg-gray-100 px-1">
                        account:primary
                      </code>{' '}
                      <code className="rounded bg-gray-100 px-1">
                        transactions:pending:3
                      </code>{' '}
                      <code className="rounded bg-gray-100 px-1">
                        card:expired
                      </code>{' '}
                      <code className="rounded bg-gray-100 px-1">
                        balance:high
                      </code>{' '}
                      <code className="rounded bg-gray-100 px-1">user:mfa</code>
                    </p>
                  </div>
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
