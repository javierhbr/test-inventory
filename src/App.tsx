import { Database, Play, Settings, TestTube } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ExecutionBuilder } from './components/ExecutionBuilder';
import { Header } from './components/Header';
import { Login, User } from './components/Login';
import { TestDataInventory } from './components/TestDataInventory';
import { TestsInventory } from './components/TestsInventory';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { UserManagement } from './components/UserManagement';
import {
  AppConfig,
  configService,
  SystemConfig,
} from './services/configService';
import { PermissionsProvider } from './contexts/PermissionsContext';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('tests');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load configurations on mount
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [appCfg, sysCfg] = await Promise.all([
          configService.loadAppConfig(),
          configService.loadSystemConfig(),
        ]);
        setAppConfig(appCfg);
        setSystemConfig(sysCfg);
        setActiveTab(appCfg.application.defaultTab);
        setConfigError(null);
      } catch (error) {
        console.error('Failed to load configurations:', error);
        setConfigError(
          error instanceof Error ? error.message : 'Unknown configuration error'
        );
      } finally {
        setLoading(false);
      }
    };

    loadConfigs();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    // Reset tab to default when logging in
    if (appConfig) {
      setActiveTab(appConfig.application.defaultTab);
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (appConfig) {
      setActiveTab(appConfig.application.defaultTab);
    }
  };

  // Determine available tabs based on user role using config
  const availableTabs = useMemo(() => {
    if (!user || !appConfig) return [];
    return configService.getAvailableTabs(user.profile, appConfig.tabs);
  }, [user?.profile, appConfig]);

  // Ensure active tab is available for current user
  useEffect(() => {
    if (
      user &&
      appConfig &&
      !configService.isTabAccessible(user.profile, activeTab, appConfig.tabs)
    ) {
      setActiveTab(appConfig.application.defaultTab);
    }
  }, [user?.profile, activeTab, appConfig]);

  // Get grid columns class
  const getGridColsClass = (count: number): string => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 5:
        return 'grid-cols-5';
      case 6:
        return 'grid-cols-6';
      default:
        return 'grid-cols-3';
    }
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const icons = {
      TestTube,
      Database,
      Play,
      Settings,
    };
    return icons[iconName as keyof typeof icons] || TestTube;
  };

  // Render tab component by name
  const renderTabComponent = (componentName: string) => {
    switch (componentName) {
      case 'TestsInventory':
        return <TestsInventory />;
      case 'TestDataInventory':
        return <TestDataInventory />;
      case 'ExecutionBuilder':
        return <ExecutionBuilder />;
      default:
        return <div>Component not found</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div>Loading configuration...</div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="text-lg font-semibold text-red-600">
            Configuration Error
          </div>
          <div className="max-w-md text-gray-600">{configError}</div>
          <div className="text-sm text-gray-500">
            An unexpected error occurred while loading the application
            configuration.
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!appConfig || !systemConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div>Failed to load configuration</div>
      </div>
    );
  }

  // If user is not logged in, show login screen
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Filter tabs based on user permissions
  const userTabs = appConfig.tabs.filter(tab =>
    configService.isTabAccessible(user.profile, tab.id, appConfig.tabs)
  );

  return (
    <PermissionsProvider>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />

        <div className="p-6">
          <div className="mx-auto max-w-[95%]">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList
                className={`grid w-full ${getGridColsClass(availableTabs.length)} mb-6`}
              >
                {userTabs.map(tab => {
                  const IconComponent = getIconComponent(tab.icon);
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2"
                    >
                      <IconComponent className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {userTabs.map(tab => (
                <TabsContent key={tab.id} value={tab.id}>
                  {tab.id === 'settings' ? (
                    <Tabs defaultValue="system" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        {appConfig.settingsTabs.map(settingsTab => (
                          <TabsTrigger
                            key={settingsTab.id}
                            value={settingsTab.id}
                          >
                            {settingsTab.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <TabsContent value="system" className="mt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Settings className="h-5 w-5" />
                              {systemConfig.systemConfiguration.title}
                            </CardTitle>
                            <CardDescription>
                              {systemConfig.systemConfiguration.description}
                              <div className="mt-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${systemConfig.systemConfiguration.adminOnlyBadge.bgColor} ${systemConfig.systemConfiguration.adminOnlyBadge.textColor}`}
                                >
                                  <Settings className="mr-1 h-3 w-3" />
                                  {
                                    systemConfig.systemConfiguration
                                      .adminOnlyBadge.text
                                  }
                                </span>
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              {systemConfig.configurationSections.map(section => (
                                <Card key={section.id}>
                                  <CardHeader>
                                    <CardTitle className="text-lg">
                                      {section.title}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="mb-2 text-sm text-gray-600">
                                      {section.description}
                                    </p>
                                    <div className="space-y-2">
                                      {section.type === 'list' &&
                                        Array.isArray(section.items) &&
                                        section.items.map((item, index) => (
                                          <div key={index} className="text-sm">
                                            • {item}
                                          </div>
                                        ))}
                                      {section.type === 'keyvalue' &&
                                        !Array.isArray(section.items) &&
                                        Object.entries(section.items).map(
                                          ([key, value]) => (
                                            <div key={key} className="text-sm">
                                              {key}: {value}
                                            </div>
                                          )
                                        )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>

                            <div className="mt-6">
                              <Card
                                className={`${systemConfig.rolesPermissions.cardStyle.borderColor} ${systemConfig.rolesPermissions.cardStyle.bgColor}`}
                              >
                                <CardHeader>
                                  <CardTitle
                                    className={`text-lg ${systemConfig.rolesPermissions.cardStyle.titleColor}`}
                                  >
                                    {systemConfig.rolesPermissions.title}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p
                                    className={`text-sm ${systemConfig.rolesPermissions.cardStyle.descriptionColor} mb-4`}
                                  >
                                    {systemConfig.rolesPermissions.description}
                                  </p>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    {Object.entries(
                                      systemConfig.rolesPermissions.roles
                                    ).map(([roleKey, role]) => (
                                      <div key={roleKey}>
                                        <strong>{role.name}:</strong>
                                        <ul className="ml-4 list-disc text-gray-600">
                                          {role.permissions.map(
                                            (permission, index) => (
                                              <li key={index}>{permission}</li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    ))}
                                </div>
                                </CardContent>
                              </Card>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="users" className="mt-6">
                        <UserManagement />
                      </TabsContent>
                    </Tabs>
                  ) : (
                    renderTabComponent(tab.component)
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </PermissionsProvider>
  );
}

export default App;
