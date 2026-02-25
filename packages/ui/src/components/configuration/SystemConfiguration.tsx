import { useEffect, useState } from 'react';

import { Edit2, Plus, Save, Settings, Trash2, X } from 'lucide-react';

import { configApi } from '../../services/apiClient';
import {
  configService,
  ConfigurationSection,
  SystemConfig,
} from '../../services/configService';
import { LOB_VALUES, useLobStore } from '../../stores/lobStore';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import { DslManagement } from './DslManagement';

import type { Lob } from '../../services/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SectionKey = 'runtimes' | 's3config' | 'githubRepos';

interface EditingTarget {
  lob: Lob;
  sectionKey: SectionKey;
}

const isKeyValueItems = (
  value: ConfigurationSection['items'] | null
): value is Record<string, string> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// ---------------------------------------------------------------------------
// ConfigSectionCard — extracted card with view / edit modes
// ---------------------------------------------------------------------------

function ConfigSectionCard({
  section,
  isEditing,
  editingDisabled,
  editData,
  hasChanges,
  editableKeys,
  onEdit,
  onSave,
  onCancel,
  onKeyValueChange,
  onKeyRename,
  onAddKeyValue,
  onRemoveKeyValue,
}: {
  section: ConfigurationSection;
  isEditing: boolean;
  editingDisabled: boolean;
  editData: ConfigurationSection['items'] | null;
  hasChanges: boolean;
  editableKeys: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyValueChange: (key: string, value: string) => void;
  onKeyRename: (oldKey: string, newKey: string) => void;
  onAddKeyValue: () => void;
  onRemoveKeyValue: (key: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{section.title}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          disabled={editingDisabled}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 text-sm">
          {section.description}
        </p>

        {isEditing ? (
          <div className="space-y-4">
            {section.type === 'keyvalue' && isKeyValueItems(editData) && (
              <div className="space-y-2">
                {Object.entries(editData).map(([key, value], index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {editableKeys ? (
                        <Input
                          value={key}
                          onChange={e => onKeyRename(key, e.target.value)}
                          placeholder="Key"
                          className="w-1/3 font-semibold"
                        />
                      ) : (
                        <span className="w-1/3 font-semibold">{key}:</span>
                      )}
                      <Input
                        value={String(value)}
                        onChange={e => onKeyValueChange(key, e.target.value)}
                        placeholder="Value"
                        className="flex-1"
                      />
                      {editableKeys && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveKeyValue(key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {editableKeys && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddKeyValue}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Configuration
                  </Button>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={onSave} size="sm" disabled={!hasChanges}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={onCancel} size="sm">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {section.type === 'keyvalue' && isKeyValueItems(section.items) && (
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
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SystemConfiguration() {
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const globalLob = useLobStore(s => s.activeLob);
  const isAllLobs = globalLob === 'all';
  const [selectedTab, setSelectedTab] = useState<Lob>(LOB_VALUES[0]);
  // When a specific LOB is selected globally, lock to it; otherwise use tab selection
  const activeLob: Lob = isAllLobs ? selectedTab : globalLob;
  const [editingSection, setEditingSection] = useState<EditingTarget | null>(
    null
  );
  const [editData, setEditData] = useState<
    ConfigurationSection['items'] | null
  >(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await configService.loadSystemConfig();
      setSystemConfig(config);
    };
    loadConfig();
  }, []);

  // -- Handlers ---------------------------------------------------------------

  const handleEditSection = (lob: Lob, sectionKey: SectionKey) => {
    const section = systemConfig?.lobConfigurations[lob][sectionKey];
    if (section) {
      setEditingSection({ lob, sectionKey });
      setEditData(JSON.parse(JSON.stringify(section.items)));
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditData(null);
    setHasChanges(false);
  };

  const handleSaveSection = async () => {
    if (!systemConfig || !editingSection || editData === null) return;

    const { lob, sectionKey } = editingSection;

    const updatedLobConfig = {
      ...systemConfig.lobConfigurations[lob],
      [sectionKey]: {
        ...systemConfig.lobConfigurations[lob][sectionKey],
        items: editData,
      },
    };

    const updatedLobConfigurations = {
      ...systemConfig.lobConfigurations,
      [lob]: updatedLobConfig,
    };

    setSystemConfig({
      ...systemConfig,
      lobConfigurations: updatedLobConfigurations,
    });

    try {
      await configApi.saveLobConfig(updatedLobConfigurations);
      configService.invalidateSystemConfig();
    } catch (error) {
      console.error('Failed to save LOB configuration:', error);
    }

    setEditingSection(null);
    setEditData(null);
    setHasChanges(false);
  };

  const handleKeyValueChange = (key: string, value: string) => {
    if (isKeyValueItems(editData)) {
      setEditData({ ...editData, [key]: value });
      setHasChanges(true);
    }
  };

  const handleKeyRename = (oldKey: string, newKey: string) => {
    if (isKeyValueItems(editData)) {
      const entries = Object.entries(editData).map(([k, v]) =>
        k === oldKey ? [newKey, v] : [k, v]
      );
      setEditData(Object.fromEntries(entries));
      setHasChanges(true);
    }
  };

  const handleAddKeyValue = () => {
    if (isKeyValueItems(editData)) {
      const newKey = `New Key ${Object.keys(editData).length + 1}`;
      setEditData({ ...editData, [newKey]: '' });
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

  // -- Render -----------------------------------------------------------------

  if (!systemConfig) {
    return <div>Loading system configuration...</div>;
  }

  const { systemConfiguration, lobConfigurations, rolesPermissions } =
    systemConfig;

  const groupedDsls = systemConfig.dsls.grouped;
  const groupedRecipes = systemConfig.dsls.recipes;

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

      {/* LOB Configuration Sections */}
      {isAllLobs ? (
        <Tabs value={selectedTab} onValueChange={v => setSelectedTab(v as Lob)}>
          <TabsList>
            {LOB_VALUES.map(lob => (
              <TabsTrigger key={lob} value={lob}>
                {lob}
              </TabsTrigger>
            ))}
          </TabsList>

          {LOB_VALUES.map(lob => {
            const lobConfig = lobConfigurations[lob];
            return (
              <TabsContent key={lob} value={lob}>
                <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-3">
                  {(['runtimes', 's3config', 'githubRepos'] as const).map(
                    sectionKey => {
                      const section = lobConfig[sectionKey];
                      const isEditing =
                        editingSection?.lob === lob &&
                        editingSection?.sectionKey === sectionKey;

                      return (
                        <ConfigSectionCard
                          key={section.id}
                          section={section}
                          isEditing={isEditing}
                          editingDisabled={editingSection !== null}
                          editData={editData}
                          hasChanges={hasChanges}
                          editableKeys={sectionKey === 'runtimes'}
                          onEdit={() => handleEditSection(lob, sectionKey)}
                          onSave={handleSaveSection}
                          onCancel={handleCancelEdit}
                          onKeyValueChange={handleKeyValueChange}
                          onKeyRename={handleKeyRename}
                          onAddKeyValue={handleAddKeyValue}
                          onRemoveKeyValue={handleRemoveKeyValue}
                        />
                      );
                    }
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Badge className="text-sm">{activeLob}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {(['runtimes', 's3config', 'githubRepos'] as const).map(
              sectionKey => {
                const section = lobConfigurations[activeLob][sectionKey];
                const isEditing =
                  editingSection?.lob === activeLob &&
                  editingSection?.sectionKey === sectionKey;

                return (
                  <ConfigSectionCard
                    key={section.id}
                    section={section}
                    isEditing={isEditing}
                    editingDisabled={editingSection !== null}
                    editData={editData}
                    hasChanges={hasChanges}
                    editableKeys={sectionKey === 'runtimes'}
                    onEdit={() => handleEditSection(activeLob, sectionKey)}
                    onSave={handleSaveSection}
                    onCancel={handleCancelEdit}
                    onKeyValueChange={handleKeyValueChange}
                    onKeyRename={handleKeyRename}
                    onAddKeyValue={handleAddKeyValue}
                    onRemoveKeyValue={handleRemoveKeyValue}
                  />
                );
              }
            )}
          </div>
        </div>
      )}

      {/* DSLs Management Section — Master-Detail */}
      <DslManagement
        activeLob={activeLob}
        groupedDsls={groupedDsls}
        groupedRecipes={groupedRecipes}
        onUpdateDsls={updated => {
          setSystemConfig({
            ...systemConfig,
            dsls: { ...systemConfig.dsls, grouped: updated },
          });
          configApi
            .saveDsls(updated, systemConfig.dsls.recipes)
            .then(() => configService.invalidateSystemConfig())
            .catch(err => console.error('Failed to save DSLs:', err));
        }}
        onUpdateRecipes={updated => {
          setSystemConfig({
            ...systemConfig,
            dsls: { ...systemConfig.dsls, recipes: updated },
          });
          configApi
            .saveDsls(systemConfig.dsls.grouped, updated)
            .then(() => configService.invalidateSystemConfig())
            .catch(err => console.error('Failed to save recipes:', err));
        }}
      />

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
