import React, { useRef, useState } from 'react';

import { Check, Pencil, X } from 'lucide-react';

import { configService, SemanticRuleConfig } from '../services/configService';

import { Badge } from './ui/badge';
import { Input } from './ui/input';

// --- Semantic tag parser ---

function tryParseSemanticTag(
  input: string,
  semanticRules: SemanticRuleConfig[]
): { tag: string; parsed: Record<string, unknown> } | null {
  const trimmed = input.trim();
  for (const rule of semanticRules) {
    try {
      const regex = new RegExp(rule.regexString, 'i');
      const match = trimmed.match(regex);
      if (match) {
        return { tag: trimmed.toLowerCase(), parsed: {} };
      }
    } catch {
      // ignore invalid regexes
    }
  }
  return null;
}

function getSemanticSuggestions(
  input: string,
  semanticRules: SemanticRuleConfig[]
): string[] {
  const allSuggestions = semanticRules.flatMap(r => r.suggestions);
  const primaryCategories = semanticRules.map(r => `${r.key}:`);

  if (!input.trim()) return primaryCategories;
  const lower = input.toLowerCase();
  const matchingCategories = primaryCategories.filter(c => c.startsWith(lower));
  const matchingLeaves = allSuggestions.filter(s => s.startsWith(lower));
  return matchingLeaves.length > 0 ? matchingLeaves : matchingCategories;
}

/** Extract the value of a semantic tag by key from a list of classifications. */
export function extractTagValue(
  classifications: string[],
  key: string
): string | undefined {
  const prefix = `${key}:`;
  const tag = classifications.find(c => c.startsWith(prefix));
  return tag ? tag.slice(prefix.length) : undefined;
}

// Removed static SINGULAR_TAG_KEYS. Singular logic is now dynamic based on rule keys.

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

interface ClassificationPickerProps {
  value: string[];
  onChange: (classifications: string[]) => void;
  placeholder?: string;
}

export function ClassificationPicker({
  value,
  onChange,
  placeholder = 'e.g. "Active account" or "account:primary"',
}: ClassificationPickerProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const [semanticRules, setSemanticRules] = React.useState<
    SemanticRuleConfig[]
  >([]);

  React.useEffect(() => {
    configService.loadSystemConfig().then(config => {
      setSemanticRules(config.dsls.semanticRules);
    });
  }, []);

  const inputTrimmed = inputValue.trim();
  const isSemanticMode = inputTrimmed.includes(':');

  const semanticSuggestions = getSemanticSuggestions(
    inputTrimmed,
    semanticRules
  ).filter(s => {
    if (value.includes(s)) return false;
    // For singular tags, hide suggestions if a different value is already selected
    // (but still show them so the user can replace)
    return true;
  });

  const plainSuggestions = inputTrimmed
    ? availableClassifications.filter(
        c =>
          c.toLowerCase().includes(inputTrimmed.toLowerCase()) &&
          !value.includes(c)
      )
    : [];

  const filteredSuggestions =
    semanticSuggestions.length > 0 ? semanticSuggestions : plainSuggestions;

  const liveParseResult = isSemanticMode
    ? tryParseSemanticTag(inputTrimmed, semanticRules)
    : null;

  const addClassification = (classification: string) => {
    const trimmed = classification.trim();
    if (!trimmed || value.includes(trimmed)) {
      setInputValue('');
      setHighlightedIndex(-1);
      return;
    }

    const parsed = tryParseSemanticTag(trimmed, semanticRules);
    const tag = parsed ? parsed.tag : trimmed.toLowerCase();

    if (!value.includes(tag)) {
      // For singular tags, replace existing tag with same key.
      const parts = tag.split(':');
      const tagKey =
        parts.length >= 3 && parts[0] === 'schedule'
          ? `${parts[0]}:${parts[1]}`
          : parts[0];
      // Check if tagKey matches any semantic rule key, indicating it's singular
      const isSingular =
        tag.includes(':') &&
        semanticRules.some(r => r.key === tagKey || tagKey.startsWith(r.key));
      const filtered = isSingular
        ? value.filter(c => !c.startsWith(`${tagKey}:`))
        : value;
      onChange([...filtered, tag]);
    }
    setInputValue('');
    setHighlightedIndex(-1);
  };

  const removeClassification = (classification: string) => {
    onChange(value.filter(c => c !== classification));
  };

  const editClassification = (classification: string) => {
    removeClassification(classification);
    setInputValue(classification);
    setHighlightedIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      const trimmed = inputValue.trim();
      if (!trimmed) return;

      if (
        highlightedIndex >= 0 &&
        highlightedIndex < filteredSuggestions.length
      ) {
        const selected = filteredSuggestions[highlightedIndex];
        const isSemantic = selected.includes(':');
        if (isSemantic && selected.endsWith(':')) {
          setInputValue(selected);
          setHighlightedIndex(-1);
        } else {
          addClassification(selected);
        }
      } else if (filteredSuggestions.length > 0) {
        const first = filteredSuggestions[0];
        const isSemantic = first.includes(':');
        if (isSemantic && first.endsWith(':')) {
          setInputValue(first);
          setHighlightedIndex(-1);
        } else {
          addClassification(first);
        }
      } else {
        addClassification(trimmed);
      }
      return;
    }

    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeClassification(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(classification => {
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
                <span className="font-mono text-xs">{classification}</span>
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
                  onClick={() => removeClassification(classification)}
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

      {/* Input with suggestions */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
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
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
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
            <span className="ml-2 text-green-500">— press Enter to add</span>
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
                      setInputValue(suggestion);
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
                    className={isSemantic ? 'font-mono text-indigo-700' : ''}
                  >
                    {suggestion}
                    {isSemantic && suggestion.endsWith(':') && (
                      <span className="ml-1 text-gray-400">(type a value)</span>
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
                to add &quot;{inputTrimmed}&quot; as a custom classification
              </p>
            </div>
          )}
      </div>

      <div className="space-y-1 text-xs text-gray-500">
        <p>Press Enter or comma to add. Backspace to remove last item.</p>
        <p>
          Semantic tags:{' '}
          <code className="rounded bg-gray-100 px-1">account:primary</code>{' '}
          <code className="rounded bg-gray-100 px-1">
            transactions:pending:3
          </code>{' '}
          <code className="rounded bg-gray-100 px-1">card:expired</code>{' '}
          <code className="rounded bg-gray-100 px-1">balance:high</code>{' '}
          <code className="rounded bg-gray-100 px-1">user:mfa</code>{' '}
          <code className="rounded bg-gray-100 px-1">schedule:month:6</code>
        </p>
      </div>
    </div>
  );
}
