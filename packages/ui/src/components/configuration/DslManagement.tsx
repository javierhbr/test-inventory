import { useEffect, useMemo, useRef, useState } from 'react';

import { Database, Edit2, Plus, Save, Trash2, X } from 'lucide-react';

import { LOB_VALUES } from '../../stores/lobStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

import type {
  DslListConfig,
  GroupedDsls,
  GroupedRecipes,
  SemanticRuleConfig,
  TdmRecipeConfig,
} from '../../services/configService';
import type { Lob } from '../../services/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DslManagementProps {
  activeLob: Lob;
  groupedDsls: GroupedDsls;
  groupedRecipes: GroupedRecipes;
  onUpdateDsls: (updated: GroupedDsls) => void;
  onUpdateRecipes: (updated: GroupedRecipes) => void;
}

type RightPaneMode = 'empty' | 'view' | 'editField' | 'createField';

interface SidebarEntry {
  groupKey: string;
  itemCount: number;
}

type LobGroups = Record<
  string,
  {
    flavor: SidebarEntry[];
    recon: SidebarEntry[];
    recipes: SidebarEntry[];
  }
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveItemType(
  groupKey: string,
  groupedDsls: GroupedDsls
): 'rule' | 'recipe' {
  return groupKey in groupedDsls ? 'rule' : 'recipe';
}

function isRegexMatch(regexStr: string, testStr: string): boolean | null {
  if (!regexStr || !testStr) return null;
  try {
    return new RegExp(regexStr).test(testStr);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sidebar inline rename input
// ---------------------------------------------------------------------------

function SidebarRenameInput({
  value,
  onChange,
  onCommit,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus and select text when entering rename mode
    const el = inputRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  return (
    <div className="px-2 py-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onCommit();
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={onCommit}
        className="h-8 text-sm"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DslManagement({
  activeLob,
  groupedDsls,
  groupedRecipes,
  onUpdateDsls,
  onUpdateRecipes,
}: DslManagementProps) {
  // -- Selection state --
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [rightPaneMode, setRightPaneMode] = useState<RightPaneMode>('empty');

  // -- Editing state --
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [draft, setDraft] = useState<
    SemanticRuleConfig | TdmRecipeConfig | null
  >(null);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [regexTestInput, setRegexTestInput] = useState('');

  // -- Delete confirmation state --
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'rule' | 'recipe' | 'group';
    id?: string;
    label: string;
  } | null>(null);

  // -- Reset selection when LOB changes --
  const prevLobRef = useRef(activeLob);
  useEffect(() => {
    if (prevLobRef.current !== activeLob) {
      prevLobRef.current = activeLob;
      resetEditing();
      setSelectedGroupKey(null);
      setRightPaneMode('empty');
    }
  }, [activeLob]);

  // -- Inline rename state --
  const [renamingGroupKey, setRenamingGroupKey] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // -- Derived --
  const selectedItemType = selectedGroupKey
    ? deriveItemType(selectedGroupKey, groupedDsls)
    : null;

  // -------------------------------------------------------------------------
  // Sidebar data derivation
  // -------------------------------------------------------------------------

  const lobGroups: LobGroups = useMemo(() => {
    const result: LobGroups = {};

    for (const [groupKey, group] of Object.entries(groupedDsls)) {
      const lob = group.lob;
      if (!result[lob]) result[lob] = { flavor: [], recon: [], recipes: [] };
      const bucket = group.type === 'flavor' ? 'flavor' : 'recon';
      result[lob][bucket].push({ groupKey, itemCount: group.items.length });
    }

    for (const [groupKey, recipes] of Object.entries(groupedRecipes)) {
      // Infer LOB from first recipe or from groupKey pattern
      const lob =
        recipes[0]?.lob ?? (groupKey.replace('TDMRecipes', '') as Lob);
      if (!result[lob]) result[lob] = { flavor: [], recon: [], recipes: [] };
      result[lob].recipes.push({ groupKey, itemCount: recipes.length });
    }

    return result;
  }, [groupedDsls, groupedRecipes]);

  const activeLobGroups = lobGroups[activeLob] ?? {
    flavor: [],
    recon: [],
    recipes: [],
  };

  // -------------------------------------------------------------------------
  // Navigation with dirty guard
  // -------------------------------------------------------------------------

  const selectGroup = (groupKey: string) => {
    if (hasDraftChanges) {
      const discard = window.confirm('Tienes cambios sin guardar. ¿Descartar?');
      if (!discard) return;
    }
    resetEditing();
    setSelectedGroupKey(groupKey);
    setRightPaneMode('view');
  };

  const resetEditing = () => {
    setActiveFieldId(null);
    setDraft(null);
    setHasDraftChanges(false);
    setRegexTestInput('');
  };

  // -------------------------------------------------------------------------
  // Rule CRUD
  // -------------------------------------------------------------------------

  const handleEditRule = (ruleId: string) => {
    if (!selectedGroupKey) return;
    const group = groupedDsls[selectedGroupKey];
    const rule = group?.items.find(r => r.id === ruleId);
    if (!rule) return;
    setActiveFieldId(ruleId);
    setDraft(JSON.parse(JSON.stringify(rule)));
    setHasDraftChanges(false);
    setRegexTestInput('');
    setRightPaneMode('editField');
  };

  const handleCreateRule = () => {
    const newId = `new-rule-${Date.now()}`;
    setActiveFieldId(newId);
    setDraft({ id: newId, key: '', regexString: '', suggestions: [] });
    setHasDraftChanges(true);
    setRegexTestInput('');
    setRightPaneMode('createField');
  };

  const handleSaveRule = () => {
    if (!selectedGroupKey || !draft || !activeFieldId) return;
    const ruleDraft = draft as SemanticRuleConfig;
    const group = groupedDsls[selectedGroupKey];
    if (!group) return;

    const exists = group.items.some(r => r.id === activeFieldId);
    const updatedItems = exists
      ? group.items.map(r => (r.id === activeFieldId ? ruleDraft : r))
      : [...group.items, ruleDraft];

    onUpdateDsls({
      ...groupedDsls,
      [selectedGroupKey]: { ...group, items: updatedItems },
    });
    resetEditing();
    setRightPaneMode('view');
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!selectedGroupKey) return;
    const group = groupedDsls[selectedGroupKey];
    if (!group) return;

    const updatedItems = group.items.filter(r => r.id !== ruleId);
    const updatedGrouped = { ...groupedDsls };

    if (updatedItems.length === 0) {
      delete updatedGrouped[selectedGroupKey];
      setSelectedGroupKey(null);
      setRightPaneMode('empty');
    } else {
      updatedGrouped[selectedGroupKey] = { ...group, items: updatedItems };
    }
    onUpdateDsls(updatedGrouped);
  };

  // -------------------------------------------------------------------------
  // Recipe CRUD
  // -------------------------------------------------------------------------

  const handleEditRecipe = (recipeId: string) => {
    if (!selectedGroupKey) return;
    const recipes = groupedRecipes[selectedGroupKey];
    const recipe = recipes?.find(r => r.id === recipeId);
    if (!recipe) return;
    setActiveFieldId(recipeId);
    setDraft(JSON.parse(JSON.stringify(recipe)));
    setHasDraftChanges(false);
    setRightPaneMode('editField');
  };

  const handleCreateRecipe = () => {
    if (!selectedGroupKey) return;
    const recipes = groupedRecipes[selectedGroupKey];
    const lob = recipes?.[0]?.lob ?? 'BANK';
    const newId = `new-recipe-${Date.now()}`;
    setActiveFieldId(newId);
    setDraft({ id: newId, lob, name: '', description: '', tags: [] });
    setHasDraftChanges(true);
    setRightPaneMode('createField');
  };

  const handleSaveRecipe = () => {
    if (!selectedGroupKey || !draft || !activeFieldId) return;
    const recipeDraft = draft as TdmRecipeConfig;
    const recipes = groupedRecipes[selectedGroupKey] ?? [];

    const exists = recipes.some(r => r.id === activeFieldId);
    const updatedItems = exists
      ? recipes.map(r => (r.id === activeFieldId ? recipeDraft : r))
      : [...recipes, recipeDraft];

    onUpdateRecipes({ ...groupedRecipes, [selectedGroupKey]: updatedItems });
    resetEditing();
    setRightPaneMode('view');
  };

  const handleDeleteRecipe = (recipeId: string) => {
    if (!selectedGroupKey) return;
    const recipes = groupedRecipes[selectedGroupKey];
    if (!recipes) return;

    const updatedItems = recipes.filter(r => r.id !== recipeId);
    const updatedRecipes = { ...groupedRecipes };

    if (updatedItems.length === 0) {
      delete updatedRecipes[selectedGroupKey];
      setSelectedGroupKey(null);
      setRightPaneMode('empty');
    } else {
      updatedRecipes[selectedGroupKey] = updatedItems;
    }
    onUpdateRecipes(updatedRecipes);
  };

  // -------------------------------------------------------------------------
  // Group CRUD
  // -------------------------------------------------------------------------

  const handleAddGroup = (lob: Lob, type: 'flavor' | 'recon' | 'recipes') => {
    if (type === 'recipes') {
      const newKey = `TDMRecipes${lob}${Date.now()}`;
      onUpdateRecipes({ ...groupedRecipes, [newKey]: [] });
      setSelectedGroupKey(newKey);
      setRightPaneMode('view');
      // Enter rename mode immediately so the user can edit the auto-generated name
      setRenamingGroupKey(newKey);
      setRenameValue(newKey);
    } else {
      const prefix = type === 'flavor' ? 'TestDataFlavors' : 'TestDataRecon';
      const newKey = `${prefix}${lob}${Date.now()}`;
      const newGroup: DslListConfig = { lob, type, items: [] };
      onUpdateDsls({ ...groupedDsls, [newKey]: newGroup });
      setSelectedGroupKey(newKey);
      setRightPaneMode('view');
      // Enter rename mode immediately so the user can edit the auto-generated name
      setRenamingGroupKey(newKey);
      setRenameValue(newKey);
    }
  };

  const handleDeleteGroup = () => {
    if (!selectedGroupKey) return;
    if (selectedItemType === 'rule') {
      const updated = { ...groupedDsls };
      delete updated[selectedGroupKey];
      onUpdateDsls(updated);
    } else {
      const updated = { ...groupedRecipes };
      delete updated[selectedGroupKey];
      onUpdateRecipes(updated);
    }
    setSelectedGroupKey(null);
    setRightPaneMode('empty');
    resetEditing();
  };

  // -------------------------------------------------------------------------
  // Rename group
  // -------------------------------------------------------------------------

  const startRenaming = (groupKey: string) => {
    setRenamingGroupKey(groupKey);
    setRenameValue(groupKey);
  };

  const cancelRenaming = () => {
    setRenamingGroupKey(null);
    setRenameValue('');
  };

  const commitRename = () => {
    if (!renamingGroupKey || !renameValue.trim()) {
      cancelRenaming();
      return;
    }
    const newKey = renameValue.trim();
    if (newKey === renamingGroupKey) {
      cancelRenaming();
      return;
    }
    // Prevent duplicates
    if (newKey in groupedDsls || newKey in groupedRecipes) {
      cancelRenaming();
      return;
    }

    const itemType = deriveItemType(renamingGroupKey, groupedDsls);

    if (itemType === 'rule') {
      const group = groupedDsls[renamingGroupKey];
      if (group) {
        const updated = { ...groupedDsls };
        delete updated[renamingGroupKey];
        updated[newKey] = group;
        onUpdateDsls(updated);
      }
    } else {
      const recipes = groupedRecipes[renamingGroupKey];
      if (recipes) {
        const updated = { ...groupedRecipes };
        delete updated[renamingGroupKey];
        updated[newKey] = recipes;
        onUpdateRecipes(updated);
      }
    }

    // Update selection to follow the renamed key
    if (selectedGroupKey === renamingGroupKey) {
      setSelectedGroupKey(newKey);
    }
    cancelRenaming();
  };

  // -------------------------------------------------------------------------
  // Delete confirmation handler
  // -------------------------------------------------------------------------

  const executeDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'rule' && deleteConfirm.id) {
      handleDeleteRule(deleteConfirm.id);
    } else if (deleteConfirm.type === 'recipe' && deleteConfirm.id) {
      handleDeleteRecipe(deleteConfirm.id);
    } else if (deleteConfirm.type === 'group') {
      handleDeleteGroup();
    }
    setDeleteConfirm(null);
  };

  // -------------------------------------------------------------------------
  // Draft helpers
  // -------------------------------------------------------------------------

  const updateRuleDraft = (field: keyof SemanticRuleConfig, value: string) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value } as SemanticRuleConfig);
    setHasDraftChanges(true);
  };

  const updateRecipeDraft = (field: keyof TdmRecipeConfig, value: string) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value } as TdmRecipeConfig);
    setHasDraftChanges(true);
  };

  // -------------------------------------------------------------------------
  // Render: Sidebar
  // -------------------------------------------------------------------------

  const renderSidebarSubSection = (
    label: string,
    entries: SidebarEntry[],
    type: 'flavor' | 'recon' | 'recipes'
  ) => (
    <div key={type} className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          onClick={e => {
            e.stopPropagation();
            handleAddGroup(activeLob, type);
          }}
          title={`New ${label} group`}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        {entries.map(entry => {
          const isSelected = selectedGroupKey === entry.groupKey;
          const isRenaming = renamingGroupKey === entry.groupKey;

          if (isRenaming) {
            return (
              <SidebarRenameInput
                key={entry.groupKey}
                value={renameValue}
                onChange={setRenameValue}
                onCommit={commitRename}
                onCancel={cancelRenaming}
              />
            );
          }

          return (
            <button
              key={entry.groupKey}
              onClick={() => selectGroup(entry.groupKey)}
              onDoubleClick={() => startRenaming(entry.groupKey)}
              className={`flex w-full items-center justify-between rounded-full px-3 py-1.5 text-left text-sm transition-all duration-150 ${
                isSelected
                  ? 'bg-white font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/50'
                  : 'font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <span className="truncate">{entry.groupKey}</span>
              <Badge
                variant={isSelected ? 'default' : 'secondary'}
                className={`ml-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] ${
                  isSelected
                    ? ''
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {entry.itemCount}
              </Badge>
            </button>
          );
        })}
        {entries.length === 0 && (
          <p className="px-3 py-1 text-[11px] italic text-slate-400">
            No groups
          </p>
        )}
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="flex h-full w-64 shrink-0 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <div>
          <h3 className="text-sm font-semibold leading-tight text-slate-900">
            DSL Lists
          </h3>
          <p className="text-xs leading-tight text-slate-500">
            {activeLob} — Grouped by type
          </p>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 p-3">
          <div className="flex flex-col gap-3 rounded-xl bg-slate-100 p-2">
            {renderSidebarSubSection(
              'Flavor',
              activeLobGroups.flavor,
              'flavor'
            )}
            {renderSidebarSubSection('Recon', activeLobGroups.recon, 'recon')}
            {renderSidebarSubSection(
              'Recipes',
              activeLobGroups.recipes,
              'recipes'
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  // -------------------------------------------------------------------------
  // Render: Detail — Empty
  // -------------------------------------------------------------------------

  const renderEmpty = () => (
    <div className="flex h-full flex-col items-center justify-start gap-3 pt-32 text-center">
      <div className="bg-muted rounded-xl p-4">
        <Database className="text-muted-foreground h-10 w-10" />
      </div>
      <p className="text-muted-foreground text-sm">
        Selecciona una lista o crea una nueva
      </p>
    </div>
  );

  // -------------------------------------------------------------------------
  // Render: Detail — Rule View
  // -------------------------------------------------------------------------

  const renderRuleView = (groupKey: string) => {
    const group = groupedDsls[groupKey];
    if (!group) return renderEmpty();

    return (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-14 items-center justify-between gap-2 border-b px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-sm font-semibold lg:text-base">
              {groupKey}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Rename group"
              onClick={() => startRenaming(groupKey)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Badge variant="outline">{group.lob}</Badge>
            <Badge variant="secondary">{group.type}</Badge>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="ghost" onClick={handleCreateRule}>
              <Plus className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Add Rule</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={group.items.length > 0}
              title={
                group.items.length > 0
                  ? 'Remove all rules first'
                  : 'Delete group'
              }
              onClick={() =>
                setDeleteConfirm({ type: 'group', label: groupKey })
              }
            >
              <Trash2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Delete Group</span>
            </Button>
          </div>
        </div>

        {/* Table */}
        <ScrollArea className="flex-1">
          {group.items.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-muted-foreground text-sm italic">
                No rules yet. Click &ldquo;Add Rule&rdquo; to create one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] lg:w-[160px]">
                      Key
                    </TableHead>
                    <TableHead>Suggestions</TableHead>
                    <TableHead className="w-[80px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.items.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.key}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.suggestions.map((s, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditRule(rule.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'rule',
                                id: rule.id,
                                label: rule.key,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ScrollArea>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // Render: Detail — Recipe View
  // -------------------------------------------------------------------------

  const renderRecipeView = (groupKey: string) => {
    const recipes = groupedRecipes[groupKey];
    if (!recipes) return renderEmpty();

    return (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-14 items-center justify-between gap-2 border-b px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-sm font-semibold lg:text-base">
              {groupKey}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Rename group"
              onClick={() => startRenaming(groupKey)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Badge variant="outline">{recipes[0]?.lob ?? 'N/A'}</Badge>
            <Badge variant="secondary">recipes</Badge>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="ghost" onClick={handleCreateRecipe}>
              <Plus className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Add Recipe</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={recipes.length > 0}
              title={
                recipes.length > 0 ? 'Remove all recipes first' : 'Delete group'
              }
              onClick={() =>
                setDeleteConfirm({ type: 'group', label: groupKey })
              }
            >
              <Trash2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Delete Group</span>
            </Button>
          </div>
        </div>

        {/* Table */}
        <ScrollArea className="flex-1">
          {recipes.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-muted-foreground text-sm italic">
                No recipes yet. Click &ldquo;Add Recipe&rdquo; to create one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Name</TableHead>
                    <TableHead className="w-[200px]">Description</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="w-[80px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipes.map(recipe => (
                    <TableRow key={recipe.id}>
                      <TableCell className="font-medium">
                        {recipe.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {recipe.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {recipe.tags.map((t, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-indigo-50 text-xs text-indigo-700"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditRecipe(recipe.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'recipe',
                                id: recipe.id,
                                label: recipe.name,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ScrollArea>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // Render: Detail — Rule Edit/Create Form
  // -------------------------------------------------------------------------

  const renderRuleForm = () => {
    const ruleDraft = draft as SemanticRuleConfig;
    if (!ruleDraft) return null;
    const isCreate = rightPaneMode === 'createField';
    const matchResult = isRegexMatch(ruleDraft.regexString, regexTestInput);

    return (
      <div className="flex h-full flex-col">
        {/* Form header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {isCreate ? 'New Semantic Rule' : `Editing:`}
            </span>
            {!isCreate && (
              <span className="font-semibold">{ruleDraft.key || '...'}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSaveRule}
              disabled={
                isCreate
                  ? !hasDraftChanges || !ruleDraft.key.trim()
                  : !hasDraftChanges
              }
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                resetEditing();
                setRightPaneMode('view');
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Form body */}
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Rule Key</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={ruleDraft.key}
                  onChange={e => updateRuleDraft('key', e.target.value)}
                  placeholder="e.g. customer-type"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Regex Pattern</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={ruleDraft.regexString}
                  onChange={e => updateRuleDraft('regexString', e.target.value)}
                  placeholder="^customer-type:(primary|authorized)$"
                  className="font-mono text-sm"
                />
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Test Regex</Label>
                  <Input
                    value={regexTestInput}
                    onChange={e => setRegexTestInput(e.target.value)}
                    placeholder="Enter text to test your regex..."
                    className={`transition-colors ${
                      regexTestInput && ruleDraft.regexString
                        ? matchResult === true
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : matchResult === false
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : ''
                        : ''
                    }`}
                  />
                  {regexTestInput && ruleDraft.regexString && (
                    <div
                      className={`rounded-md px-3 py-2 text-sm font-medium ${
                        matchResult === true
                          ? 'bg-green-50 text-green-700'
                          : matchResult === false
                            ? 'bg-red-50 text-red-700'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {matchResult === true
                        ? `Match: "${regexTestInput}"`
                        : matchResult === false
                          ? 'No match'
                          : 'Invalid Regex'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ruleDraft.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={suggestion}
                      onChange={e => {
                        const newSuggestions = [...ruleDraft.suggestions];
                        newSuggestions[index] = e.target.value;
                        setDraft({
                          ...ruleDraft,
                          suggestions: newSuggestions,
                        } as SemanticRuleConfig);
                        setHasDraftChanges(true);
                      }}
                      placeholder="e.g. customer-type:primary"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                      onClick={() => {
                        setDraft({
                          ...ruleDraft,
                          suggestions: ruleDraft.suggestions.filter(
                            (_, i) => i !== index
                          ),
                        } as SemanticRuleConfig);
                        setHasDraftChanges(true);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setDraft({
                      ...ruleDraft,
                      suggestions: [...ruleDraft.suggestions, ''],
                    } as SemanticRuleConfig);
                    setHasDraftChanges(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Suggestion
                </Button>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // Render: Detail — Recipe Edit/Create Form
  // -------------------------------------------------------------------------

  const renderRecipeForm = () => {
    const recipeDraft = draft as TdmRecipeConfig;
    if (!recipeDraft) return null;
    const isCreate = rightPaneMode === 'createField';

    return (
      <div className="flex h-full flex-col">
        {/* Form header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {isCreate ? 'New Recipe' : `Editing:`}
            </span>
            {!isCreate && (
              <span className="font-semibold">{recipeDraft.name || '...'}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSaveRecipe}
              disabled={
                isCreate
                  ? !hasDraftChanges || !recipeDraft.name.trim()
                  : !hasDraftChanges
              }
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                resetEditing();
                setRightPaneMode('view');
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Form body */}
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recipe Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Name</Label>
                  <Input
                    value={recipeDraft.name}
                    onChange={e => updateRecipeDraft('name', e.target.value)}
                    placeholder="Recipe name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">LOB</Label>
                    <Select
                      value={recipeDraft.lob}
                      onValueChange={value =>
                        updateRecipeDraft('lob', value as Lob)
                      }
                    >
                      <SelectTrigger>
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
                    <Label className="text-sm font-semibold">Description</Label>
                    <Input
                      value={recipeDraft.description}
                      onChange={e =>
                        updateRecipeDraft('description', e.target.value)
                      }
                      placeholder="Description"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipeDraft.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={tag}
                      onChange={e => {
                        const newTags = [...recipeDraft.tags];
                        newTags[index] = e.target.value;
                        setDraft({
                          ...recipeDraft,
                          tags: newTags,
                        } as TdmRecipeConfig);
                        setHasDraftChanges(true);
                      }}
                      placeholder="e.g. customer-type:retail"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                      onClick={() => {
                        setDraft({
                          ...recipeDraft,
                          tags: recipeDraft.tags.filter((_, i) => i !== index),
                        } as TdmRecipeConfig);
                        setHasDraftChanges(true);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setDraft({
                      ...recipeDraft,
                      tags: [...recipeDraft.tags, ''],
                    } as TdmRecipeConfig);
                    setHasDraftChanges(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tag
                </Button>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // Render: Detail Pane (router)
  // -------------------------------------------------------------------------

  const renderDetailPane = () => {
    if (rightPaneMode === 'empty' || !selectedGroupKey) return renderEmpty();

    if (rightPaneMode === 'editField' || rightPaneMode === 'createField') {
      return selectedItemType === 'rule'
        ? renderRuleForm()
        : renderRecipeForm();
    }

    // view mode
    return selectedItemType === 'rule'
      ? renderRuleView(selectedGroupKey)
      : renderRecipeView(selectedGroupKey);
  };

  // -------------------------------------------------------------------------
  // Main Render
  // -------------------------------------------------------------------------

  return (
    <div className="mb-8">
      <div className="mb-4 border-b pb-4">
        <h3 className="text-xl font-bold">DSLs Management</h3>
        <p className="text-muted-foreground text-sm">
          Manage semantic rules and TDM recipes grouped by LOB
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex max-h-[calc(100vh-20rem)]">
          {/* Sidebar */}
          <div className="w-[260px] shrink-0 lg:w-[300px]">
            {renderSidebar()}
          </div>

          {/* Detail */}
          <div className="min-w-0 flex-1">{renderDetailPane()}</div>
        </div>
      </Card>

      {/* Shared delete confirmation dialog */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={open => {
          if (!open) setDeleteConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{' '}
              {deleteConfirm?.type === 'group' ? 'group' : deleteConfirm?.type}{' '}
              &ldquo;{deleteConfirm?.label}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
