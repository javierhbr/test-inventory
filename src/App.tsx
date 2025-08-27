import { useEffect, useState } from 'react';

import { ExecutionBuilder } from './components/ExecutionBuilder';
import { Header } from './components/Header';
import { Login, User } from './components/Login';
import { SystemConfiguration } from './components/SystemConfiguration';
import { TestDataInventory } from './components/TestDataInventory';
import { TestsInventory } from './components/TestsInventory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { UserManagement } from './components/UserManagement';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { useNavigationHistory } from './hooks/useNavigationHistory';
import { AppConfig, configService } from './services/configService';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load configurations on mount
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const appCfg = await configService.loadAppConfig();
        setAppConfig(appCfg);
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

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <PermissionsProvider>
      <AppContent user={user} setUser={setUser} appConfig={appConfig} />
    </PermissionsProvider>
  );
}

function AppContent({
  user,
  setUser,
  appConfig,
}: {
  user: User;
  setUser: (user: User | null) => void;
  appConfig: AppConfig | null;
}) {
  const {
    currentTab: activeTab,
    pushToHistory,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
  } = useNavigationHistory(appConfig?.application.defaultTab || 'tests');

  const handleLogout = () => {
    setUser(null);
  };

  const handleTabChange = (tab: string) => {
    pushToHistory(tab);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Header
        user={user}
        onLogout={handleLogout}
        onBack={goBack}
        onForward={goForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-[95%]">
          {activeTab === 'tests' && <TestsInventory />}
          {activeTab === 'testdata' && <TestDataInventory />}
          {activeTab === 'execution' && <ExecutionBuilder />}
          {activeTab === 'settings' && <SettingsComponent />}
        </div>
      </main>
    </div>
  );
}

function SettingsComponent() {
  const [activeTab, setActiveTab] = useState('system');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system">System Configuration</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        <TabsContent value="system">
          <SystemConfiguration />
        </TabsContent>
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
