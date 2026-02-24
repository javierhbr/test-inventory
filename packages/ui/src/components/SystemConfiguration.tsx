import { useEffect, useState } from 'react';

import { Edit2, Plus, Save, Settings, Trash2, X } from 'lucide-react';

import { configService, SystemConfig } from '../services/configService';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function SystemConfiguration() {
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown> | null>(
    null
  );
  const [hasChanges, setHasChanges] = useState(false);

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
    if (!systemConfig || !editingSection) return;

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
    if (typeof editData === 'object' && !Array.isArray(editData)) {
      setEditData({
        ...editData,
        [key]: value,
      });
      setHasChanges(true);
    }
  };

  const handleAddKeyValue = () => {
    if (typeof editData === 'object' && !Array.isArray(editData)) {
      const newKey = `New Key ${Object.keys(editData).length + 1}`;
      setEditData({
        ...editData,
        [newKey]: '',
      });
      setHasChanges(true);
    }
  };

  const handleRemoveKeyValue = (key: string) => {
    if (typeof editData === 'object' && !Array.isArray(editData)) {
      const newData = { ...editData };
      delete newData[key];
      setEditData(newData);
      setHasChanges(true);
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
      <div>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{systemConfiguration.title}</h2>
        </div>
        <p className="text-muted-foreground">
          {systemConfiguration.description}
        </p>
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
                  {section.type === 'keyvalue' &&
                    typeof editData === 'object' &&
                    !Array.isArray(editData) && (
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
                    typeof section.items === 'object' && (
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
