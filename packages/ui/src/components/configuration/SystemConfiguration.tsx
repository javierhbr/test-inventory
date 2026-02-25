import { useEffect, useMemo, useState } from 'react';

import { Edit2, Plus, Save, Settings, Trash2, X } from 'lucide-react';

import {
  configService,
  ConfigurationSection,
  SemanticRuleConfig,
  SystemConfig,
  TdmRecipeConfig,
} from '../../services/configService';
import { Lob } from '../../services/types';
import { LOB_VALUES } from '../../stores/lobStore';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function SystemConfiguration() {
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<
    ConfigurationSection['items'] | null
  >(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Semantic Rules state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingRuleData, setEditingRuleData] =
    useState<SemanticRuleConfig | null>(null);
  const [hasRuleChanges, setHasRuleChanges] = useState(false);
  const [regexTestInput, setRegexTestInput] = useState<string>('');

  const isRegexMatch = (regexStr: string, testStr: string) => {
    if (!regexStr || !testStr) return null;
    try {
      const regex = new RegExp(regexStr);
      return regex.test(testStr);
    } catch (e) {
      return null; // Invalid regex
    }
  };

  // Recipes state
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [editingRecipeData, setEditingRecipeData] =
    useState<TdmRecipeConfig | null>(null);
  const [hasRecipeChanges, setHasRecipeChanges] = useState(false);

  // Group the DSLs dynamically based on what we fetched
  const localGroupedDsls = useMemo(() => {
    if (!systemConfig) return {};
    const grouped: Record<
      string,
      Array<SemanticRuleConfig | TdmRecipeConfig>
    > = {};

    systemConfig.dsls.semanticRules.forEach(rule => {
      const prefix =
        rule.category === 'Flavor' ? 'TestDataFlavors' : 'TestDataRecon';
      const key = `${prefix}${rule.lob}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(rule);
    });

    systemConfig.dsls.recipes.forEach(recipe => {
      const key = `TDMRecipes${recipe.lob}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(recipe);
    });

    return grouped;
  }, [systemConfig?.dsls.semanticRules, systemConfig?.dsls.recipes]);

  const isKeyValueItems = (
    value: ConfigurationSection['items'] | null
  ): value is Record<string, string> =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await configService.loadSystemConfig();
      setSystemConfig(config);
    };
    loadConfig();
  }, []);

  const handleEditSection = (sectionId: string) => {
    const section = systemConfig?.configurationSections.find(
      s => s.id === sectionId
    );
    if (section) {
      setEditingSection(sectionId);
      setEditData(JSON.parse(JSON.stringify(section.items))); // Deep copy
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditData(null);
    setHasChanges(false);
  };

  const handleSaveSection = () => {
    if (!systemConfig || !editingSection || editData === null) return;

    const updatedSections = systemConfig.configurationSections.map(section =>
      section.id === editingSection ? { ...section, items: editData } : section
    );

    setSystemConfig({
      ...systemConfig,
      configurationSections: updatedSections,
    });

    setEditingSection(null);
    setEditData(null);
    setHasChanges(false);
  };

  const handleKeyValueChange = (key: string, value: string) => {
    if (isKeyValueItems(editData)) {
      setEditData({
        ...editData,
        [key]: value,
      });
      setHasChanges(true);
    }
  };

  const handleAddKeyValue = () => {
    if (isKeyValueItems(editData)) {
      const newKey = `New Key ${Object.keys(editData).length + 1}`;
      setEditData({
        ...editData,
        [newKey]: '',
      });
      setHasChanges(true);
    }
  };

  const handleRemoveKeyValue = (key: string) => {
    if (isKeyValueItems(editData)) {
      const newData = { ...editData };
      delete newData[key];
      setEditData(newData);
      setHasChanges(true);
    }
  };

  // --- Semantic Rule Management Handlers ---

  const handleEditRule = (ruleId: string) => {
    const rule = systemConfig?.dsls.semanticRules.find(r => r.id === ruleId);
    if (rule) {
      setEditingRuleId(ruleId);
      setEditingRuleData(JSON.parse(JSON.stringify(rule)));
      setRegexTestInput('');
    }
  };

  const handleCancelRuleEdit = () => {
    setEditingRuleId(null);
    setEditingRuleData(null);
    setHasRuleChanges(false);
    setRegexTestInput('');
  };

  const handleSaveRule = () => {
    if (!systemConfig || !editingRuleId || !editingRuleData) return;

    let updatedRules = [...systemConfig.dsls.semanticRules];
    const exists = updatedRules.some(r => r.id === editingRuleId);
    if (exists) {
      updatedRules = updatedRules.map(r =>
        r.id === editingRuleId ? editingRuleData : r
      );
    } else {
      updatedRules.push(editingRuleData);
    }

    setSystemConfig({
      ...systemConfig,
      dsls: { ...systemConfig.dsls, semanticRules: updatedRules },
    });
    setEditingRuleId(null);
    setEditingRuleData(null);
    setHasRuleChanges(false);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!systemConfig) return;
    setSystemConfig({
      ...systemConfig,
      dsls: {
        ...systemConfig.dsls,
        semanticRules: systemConfig.dsls.semanticRules.filter(
          r => r.id !== ruleId
        ),
      },
    });
  };

  const handleAddRule = () => {
    const newId = `new-rule-${Date.now()}`;
    setEditingRuleId(newId);
    setEditingRuleData({
      id: newId,
      lob: 'BANK',
      category: 'Flavor',
      key: '',
      regexString: '',
      suggestions: [],
    });
    setHasRuleChanges(true);
    setRegexTestInput('');
  };

  const handleRuleChange = (field: keyof SemanticRuleConfig, value: string) => {
    if (editingRuleData) {
      setEditingRuleData({ ...editingRuleData, [field]: value });
      setHasRuleChanges(true);
    }
  };

  const handleAddRuleSuggestion = () => {
    if (editingRuleData) {
      setEditingRuleData({
        ...editingRuleData,
        suggestions: [...editingRuleData.suggestions, ''],
      });
      setHasRuleChanges(true);
    }
  };

  const handleRuleSuggestionChange = (index: number, value: string) => {
    if (editingRuleData) {
      const newSuggestions = [...editingRuleData.suggestions];
      newSuggestions[index] = value;
      setEditingRuleData({ ...editingRuleData, suggestions: newSuggestions });
      setHasRuleChanges(true);
    }
  };

  const handleRemoveRuleSuggestion = (index: number) => {
    if (editingRuleData) {
      setEditingRuleData({
        ...editingRuleData,
        suggestions: editingRuleData.suggestions.filter((_, i) => i !== index),
      });
      setHasRuleChanges(true);
    }
  };

  // --- Recipe Management Handlers ---

  const handleEditRecipe = (recipeId: string) => {
    const recipe = systemConfig?.dsls.recipes.find(r => r.id === recipeId);
    if (recipe) {
      setEditingRecipeId(recipeId);
      setEditingRecipeData(JSON.parse(JSON.stringify(recipe)));
    }
  };

  const handleCancelRecipeEdit = () => {
    setEditingRecipeId(null);
    setEditingRecipeData(null);
    setHasRecipeChanges(false);
  };

  const handleSaveRecipe = () => {
    if (!systemConfig || !editingRecipeId || !editingRecipeData) return;

    let updatedRecipes = [...systemConfig.dsls.recipes];
    const exists = updatedRecipes.some(r => r.id === editingRecipeId);
    if (exists) {
      updatedRecipes = updatedRecipes.map(r =>
        r.id === editingRecipeId ? editingRecipeData : r
      );
    } else {
      updatedRecipes.push(editingRecipeData);
    }

    setSystemConfig({
      ...systemConfig,
      dsls: { ...systemConfig.dsls, recipes: updatedRecipes },
    });
    setEditingRecipeId(null);
    setEditingRecipeData(null);
    setHasRecipeChanges(false);
  };

  const handleDeleteRecipe = (recipeId: string) => {
    if (!systemConfig) return;
    setSystemConfig({
      ...systemConfig,
      dsls: {
        ...systemConfig.dsls,
        recipes: systemConfig.dsls.recipes.filter(r => r.id !== recipeId),
      },
    });
  };

  const handleAddRecipe = () => {
    const newId = `new-recipe-${Date.now()}`;
    setEditingRecipeId(newId);
    setEditingRecipeData({
      id: newId,
      lob: 'BANK',
      name: '',
      description: '',
      tags: [],
    });
    setHasRecipeChanges(true);
  };

  const handleRecipeChange = (field: keyof TdmRecipeConfig, value: string) => {
    if (editingRecipeData) {
      setEditingRecipeData({ ...editingRecipeData, [field]: value });
      setHasRecipeChanges(true);
    }
  };

  const handleAddRecipeTag = () => {
    if (editingRecipeData) {
      setEditingRecipeData({
        ...editingRecipeData,
        tags: [...editingRecipeData.tags, ''],
      });
      setHasRecipeChanges(true);
    }
  };

  const handleRecipeTagChange = (index: number, value: string) => {
    if (editingRecipeData) {
      const newTags = [...editingRecipeData.tags];
      newTags[index] = value;
      setEditingRecipeData({ ...editingRecipeData, tags: newTags });
      setHasRecipeChanges(true);
    }
  };

  const handleRemoveRecipeTag = (index: number) => {
    if (editingRecipeData) {
      setEditingRecipeData({
        ...editingRecipeData,
        tags: editingRecipeData.tags.filter((_, i) => i !== index),
      });
      setHasRecipeChanges(true);
    }
  };

  if (!systemConfig) {
    return <div>Loading system configuration...</div>;
  }

  const { systemConfiguration, configurationSections, rolesPermissions } =
    systemConfig;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2 shadow-sm ring-1 ring-blue-100/50">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            {systemConfiguration.title}
          </h2>
        </div>
        <p className="mt-2 text-gray-500">{systemConfiguration.description}</p>
        <Badge
          className={`mt-2 ${systemConfiguration.adminOnlyBadge.bgColor} ${systemConfiguration.adminOnlyBadge.textColor}`}
        >
          {systemConfiguration.adminOnlyBadge.text}
        </Badge>
      </div>

      {/* Configuration Sections Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {configurationSections.map(section => (
          <Card key={section.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{section.title}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditSection(section.id)}
                disabled={editingSection !== null}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                {section.description}
              </p>

              {editingSection === section.id ? (
                <div className="space-y-4">
                  {/* Edit Mode - All sections are now keyvalue */}
                  {section.type === 'keyvalue' && isKeyValueItems(editData) && (
                    <div className="space-y-2">
                      {Object.entries(editData).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="w-1/3 font-semibold">
                              {key}:
                            </Label>
                            <Input
                              value={String(value)}
                              onChange={e =>
                                handleKeyValueChange(key, e.target.value)
                              }
                              placeholder="Enter value"
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveKeyValue(key)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddKeyValue}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Configuration
                      </Button>
                    </div>
                  )}

                  {/* Edit Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSaveSection}
                      size="sm"
                      disabled={!hasChanges}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      size="sm"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* View Mode - All sections are now keyvalue */}
                  {section.type === 'keyvalue' &&
                    isKeyValueItems(section.items) && (
                      <div className="space-y-2">
                        {Object.entries(section.items).map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="w-1/3 font-semibold">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DSLs Management Section */}
      <div>
        <div className="mb-8 border-b pb-4">
          <h3 className="text-xl font-bold">{systemConfig.dsls.title}</h3>
          <p className="text-muted-foreground text-sm">
            {systemConfig.dsls.description}
          </p>
        </div>

        {/* Semantic Rules Sub-section */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xl font-semibold">Semantic Rules</h4>
            <Button onClick={handleAddRule} disabled={editingRuleId !== null}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </div>
          <div className="w-full">
            {Object.entries(localGroupedDsls)
              .filter(([groupKey]) => !groupKey.startsWith('TDMRecipes'))
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([groupKey, items]) => (
                <div key={groupKey} className="mb-10">
                  <h4 className="mb-6 border-b pb-2 text-xl font-bold text-gray-700 dark:text-gray-300">
                    {groupKey}
                  </h4>
                  <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                    {(items as Array<SemanticRuleConfig | TdmRecipeConfig>).map(
                      item => {
                        const rule = item as SemanticRuleConfig;
                        return (
                          <Card key={rule.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-lg">
                                {editingRuleId === rule.id &&
                                editingRuleData ? (
                                  <Input
                                    value={editingRuleData.key}
                                    onChange={e =>
                                      handleRuleChange('key', e.target.value)
                                    }
                                    placeholder="Rule Key"
                                    className="flex-1 font-bold"
                                  />
                                ) : (
                                  rule.key
                                )}
                              </CardTitle>
                              <div className="ml-4 flex gap-1">
                                {editingRuleId !== rule.id && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleEditRule(rule.id)}
                                      disabled={editingRuleId !== null}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:text-red-700"
                                      onClick={() => handleDeleteRule(rule.id)}
                                      disabled={editingRuleId !== null}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              {editingRuleId === rule.id && editingRuleData ? (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold">
                                        LOB
                                      </Label>
                                      <Select
                                        value={editingRuleData.lob}
                                        onValueChange={value =>
                                          handleRuleChange('lob', value as Lob)
                                        }
                                      >
                                        <SelectTrigger className="mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {LOB_VALUES.map(lob => (
                                            <SelectItem key={lob} value={lob}>
                                              {lob}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold">
                                        Category
                                      </Label>
                                      <Select
                                        value={editingRuleData.category}
                                        onValueChange={value =>
                                          handleRuleChange(
                                            'category',
                                            value as 'Flavor' | 'Recon'
                                          )
                                        }
                                      >
                                        <SelectTrigger className="mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Flavor">
                                            Flavor
                                          </SelectItem>
                                          <SelectItem value="Recon">
                                            Recon
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold">
                                        Regex
                                      </Label>
                                      <Input
                                        value={editingRuleData.regexString}
                                        onChange={e =>
                                          handleRuleChange(
                                            'regexString',
                                            e.target.value
                                          )
                                        }
                                        placeholder="Regex string"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-4 space-y-2">
                                    <Label className="text-sm font-semibold">
                                      Test Regex
                                    </Label>
                                    <div className="flex flex-col gap-1.5">
                                      <Input
                                        value={regexTestInput}
                                        onChange={e =>
                                          setRegexTestInput(e.target.value)
                                        }
                                        placeholder="Enter text to test your regex..."
                                        className={`flex-1 transition-colors ${
                                          regexTestInput &&
                                          editingRuleData.regexString
                                            ? isRegexMatch(
                                                editingRuleData.regexString,
                                                regexTestInput
                                              ) === true
                                              ? 'border-green-500 focus-visible:ring-green-500'
                                              : isRegexMatch(
                                                    editingRuleData.regexString,
                                                    regexTestInput
                                                  ) === false
                                                ? 'border-red-500 focus-visible:ring-red-500'
                                                : ''
                                            : ''
                                        }`}
                                      />
                                      {regexTestInput &&
                                        editingRuleData.regexString && (
                                          <div
                                            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                              isRegexMatch(
                                                editingRuleData.regexString,
                                                regexTestInput
                                              ) === true
                                                ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                                                : isRegexMatch(
                                                      editingRuleData.regexString,
                                                      regexTestInput
                                                    ) === false
                                                  ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                                  : 'bg-muted text-muted-foreground'
                                            }`}
                                          >
                                            {isRegexMatch(
                                              editingRuleData.regexString,
                                              regexTestInput
                                            ) === true
                                              ? `Match: "${regexTestInput}"`
                                              : isRegexMatch(
                                                    editingRuleData.regexString,
                                                    regexTestInput
                                                  ) === false
                                                ? 'No match'
                                                : 'Invalid Regex'}
                                          </div>
                                        )}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold">
                                      Suggestions
                                    </Label>
                                    {editingRuleData.suggestions.map(
                                      (suggestion, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2"
                                        >
                                          <Input
                                            value={suggestion}
                                            onChange={e =>
                                              handleRuleSuggestionChange(
                                                index,
                                                e.target.value
                                              )
                                            }
                                            placeholder="Suggestion"
                                            className="flex-1"
                                          />
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                                            onClick={() =>
                                              handleRemoveRuleSuggestion(index)
                                            }
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleAddRuleSuggestion}
                                      className="mt-2 w-full"
                                    >
                                      <Plus className="mr-2 h-4 w-4" /> Add
                                      Suggestion
                                    </Button>
                                  </div>

                                  <div className="flex gap-2 pt-2">
                                    <Button
                                      onClick={handleSaveRule}
                                      size="sm"
                                      disabled={!hasRuleChanges}
                                    >
                                      <Save className="mr-2 h-4 w-4" /> Save
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={handleCancelRuleEdit}
                                      size="sm"
                                    >
                                      <X className="mr-2 h-4 w-4" /> Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1 space-y-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline">{rule.lob}</Badge>
                                    <span className="text-muted-foreground break-all font-mono text-xs">
                                      {rule.regexString}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {rule.suggestions.map((s, i) => (
                                      <Badge key={i} variant="secondary">
                                        {s}
                                      </Badge>
                                    ))}
                                    {rule.suggestions.length === 0 && (
                                      <span className="text-muted-foreground text-sm italic">
                                        No suggestions
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
                  </div>
                </div>
              ))}

            {/* New Rule Form */}
            {editingRuleId &&
              editingRuleId.startsWith('new-rule') &&
              editingRuleData && (
                <Card className="border-primary border-2">
                  <CardHeader className="pb-2">
                    <Input
                      value={editingRuleData.key}
                      onChange={e => handleRuleChange('key', e.target.value)}
                      placeholder="New Rule Key"
                      className="text-lg font-bold"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">LOB</Label>
                          <Select
                            value={editingRuleData.lob}
                            onValueChange={value =>
                              handleRuleChange('lob', value as Lob)
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LOB_VALUES.map(lob => (
                                <SelectItem key={lob} value={lob}>
                                  {lob}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">
                            Category
                          </Label>
                          <Select
                            value={editingRuleData.category}
                            onValueChange={value =>
                              handleRuleChange(
                                'category',
                                value as 'Flavor' | 'Recon'
                              )
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Flavor">Flavor</SelectItem>
                              <SelectItem value="Recon">Recon</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Regex</Label>
                          <Input
                            value={editingRuleData.regexString}
                            onChange={e =>
                              handleRuleChange('regexString', e.target.value)
                            }
                            placeholder="Regex string"
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label className="text-sm font-semibold">
                          Test Regex
                        </Label>
                        <div className="flex flex-col gap-1.5">
                          <Input
                            value={regexTestInput}
                            onChange={e => setRegexTestInput(e.target.value)}
                            placeholder="Enter text to test your regex..."
                            className={`flex-1 transition-colors ${
                              regexTestInput && editingRuleData.regexString
                                ? isRegexMatch(
                                    editingRuleData.regexString,
                                    regexTestInput
                                  ) === true
                                  ? 'border-green-500 focus-visible:ring-green-500'
                                  : isRegexMatch(
                                        editingRuleData.regexString,
                                        regexTestInput
                                      ) === false
                                    ? 'border-red-500 focus-visible:ring-red-500'
                                    : ''
                                : ''
                            }`}
                          />
                          {regexTestInput && editingRuleData.regexString && (
                            <div
                              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                isRegexMatch(
                                  editingRuleData.regexString,
                                  regexTestInput
                                ) === true
                                  ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                                  : isRegexMatch(
                                        editingRuleData.regexString,
                                        regexTestInput
                                      ) === false
                                    ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                    : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {isRegexMatch(
                                editingRuleData.regexString,
                                regexTestInput
                              ) === true
                                ? `Match: "${regexTestInput}"`
                                : isRegexMatch(
                                      editingRuleData.regexString,
                                      regexTestInput
                                    ) === false
                                  ? 'No match'
                                  : 'Invalid Regex'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">
                          Suggestions
                        </Label>
                        {editingRuleData.suggestions.map(
                          (suggestion, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={suggestion}
                                onChange={e =>
                                  handleRuleSuggestionChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                placeholder="Suggestion"
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:bg-red-50"
                                onClick={() =>
                                  handleRemoveRuleSuggestion(index)
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddRuleSuggestion}
                          className="mt-2 w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Suggestion
                        </Button>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleSaveRule}
                          size="sm"
                          disabled={
                            !hasRuleChanges || !editingRuleData.key.trim()
                          }
                        >
                          <Save className="mr-2 h-4 w-4" /> Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelRuleEdit}
                          size="sm"
                        >
                          <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>

        {/* Recipes Sub-section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xl font-semibold">TDM Recipes</h4>
            <Button
              onClick={handleAddRecipe}
              disabled={editingRecipeId !== null}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Recipe
            </Button>
          </div>
          <div className="w-full">
            {Object.entries(localGroupedDsls)
              .filter(([groupKey]) => groupKey.startsWith('TDMRecipes'))
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([groupKey, items]) => (
                <div key={groupKey} className="mb-10">
                  <h4 className="mb-6 border-b pb-2 text-xl font-bold text-gray-700 dark:text-gray-300">
                    {groupKey}
                  </h4>
                  <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                    {(items as Array<SemanticRuleConfig | TdmRecipeConfig>).map(
                      item => {
                        const recipe = item as TdmRecipeConfig;
                        return (
                          <Card key={recipe.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-lg">
                                {editingRecipeId === recipe.id &&
                                editingRecipeData ? (
                                  <Input
                                    value={editingRecipeData.name}
                                    onChange={e =>
                                      handleRecipeChange('name', e.target.value)
                                    }
                                    placeholder="Recipe Name"
                                    className="flex-1 font-bold"
                                  />
                                ) : (
                                  recipe.name
                                )}
                              </CardTitle>
                              <div className="ml-4 flex gap-1">
                                {editingRecipeId !== recipe.id && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        handleEditRecipe(recipe.id)
                                      }
                                      disabled={editingRecipeId !== null}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:text-red-700"
                                      onClick={() =>
                                        handleDeleteRecipe(recipe.id)
                                      }
                                      disabled={editingRecipeId !== null}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              {editingRecipeId === recipe.id &&
                              editingRecipeData ? (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold">
                                        LOB
                                      </Label>
                                      <Select
                                        value={editingRecipeData.lob}
                                        onValueChange={value =>
                                          handleRecipeChange(
                                            'lob',
                                            value as Lob
                                          )
                                        }
                                      >
                                        <SelectTrigger className="mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {LOB_VALUES.map(lob => (
                                            <SelectItem key={lob} value={lob}>
                                              {lob}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold">
                                        Description
                                      </Label>
                                      <Input
                                        value={editingRecipeData.description}
                                        onChange={e =>
                                          handleRecipeChange(
                                            'description',
                                            e.target.value
                                          )
                                        }
                                        placeholder="Description"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold">
                                      Tags
                                    </Label>
                                    {editingRecipeData.tags.map(
                                      (tag, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2"
                                        >
                                          <Input
                                            value={tag}
                                            onChange={e =>
                                              handleRecipeTagChange(
                                                index,
                                                e.target.value
                                              )
                                            }
                                            placeholder="e.g customer-type:retail"
                                            className="flex-1"
                                          />
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                                            onClick={() =>
                                              handleRemoveRecipeTag(index)
                                            }
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleAddRecipeTag}
                                      className="mt-2 w-full"
                                    >
                                      <Plus className="mr-2 h-4 w-4" /> Add Tag
                                    </Button>
                                  </div>

                                  <div className="flex gap-2 pt-2">
                                    <Button
                                      onClick={handleSaveRecipe}
                                      size="sm"
                                      disabled={!hasRecipeChanges}
                                    >
                                      <Save className="mr-2 h-4 w-4" /> Save
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={handleCancelRecipeEdit}
                                      size="sm"
                                    >
                                      <X className="mr-2 h-4 w-4" /> Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1 space-y-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline">
                                      {recipe.lob}
                                    </Badge>
                                    <span className="text-muted-foreground text-sm">
                                      {recipe.description}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {recipe.tags.map((t, i) => (
                                      <Badge
                                        key={i}
                                        variant="secondary"
                                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                      >
                                        {t}
                                      </Badge>
                                    ))}
                                    {recipe.tags.length === 0 && (
                                      <span className="text-muted-foreground text-sm italic">
                                        No tags
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
                  </div>
                </div>
              ))}

            {/* New Recipe Form */}
            {editingRecipeId &&
              editingRecipeId.startsWith('new-recipe') &&
              editingRecipeData && (
                <Card className="border-primary border-2">
                  <CardHeader className="pb-2">
                    <Input
                      value={editingRecipeData.name}
                      onChange={e => handleRecipeChange('name', e.target.value)}
                      placeholder="New Recipe Name"
                      className="text-lg font-bold"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">LOB</Label>
                          <Select
                            value={editingRecipeData.lob}
                            onValueChange={value =>
                              handleRecipeChange('lob', value as Lob)
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LOB_VALUES.map(lob => (
                                <SelectItem key={lob} value={lob}>
                                  {lob}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">
                            Description
                          </Label>
                          <Input
                            value={editingRecipeData.description}
                            onChange={e =>
                              handleRecipeChange('description', e.target.value)
                            }
                            placeholder="Description"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Tags</Label>
                        {editingRecipeData.tags.map((tag, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={tag}
                              onChange={e =>
                                handleRecipeTagChange(index, e.target.value)
                              }
                              placeholder="e.g customer-type:retail"
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-50"
                              onClick={() => handleRemoveRecipeTag(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddRecipeTag}
                          className="mt-2 w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Tag
                        </Button>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleSaveRecipe}
                          size="sm"
                          disabled={
                            !hasRecipeChanges || !editingRecipeData.name.trim()
                          }
                        >
                          <Save className="mr-2 h-4 w-4" /> Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelRecipeEdit}
                          size="sm"
                        >
                          <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>

      {/* Roles and Permissions Section */}
      <Card
        className={`${rolesPermissions.cardStyle.bgColor} ${rolesPermissions.cardStyle.borderColor} border`}
      >
        <CardHeader>
          <CardTitle className={rolesPermissions.cardStyle.titleColor}>
            {rolesPermissions.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`mb-4 text-sm ${rolesPermissions.cardStyle.descriptionColor}`}
          >
            {rolesPermissions.description}
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Object.entries(rolesPermissions.roles).map(([key, role]) => (
              <div key={key}>
                <h4 className="font-semibold">{role.name}</h4>
                <ul className="list-disc space-y-1 pl-5">
                  {role.permissions.map((permission, index) => (
                    <li key={index}>{permission}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
