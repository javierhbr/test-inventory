import { useEffect, useState } from 'react';

import { Settings, Users } from 'lucide-react';

import { SystemConfiguration } from './components/configuration/SystemConfiguration';
import { UserManagement } from './components/configuration/UserManagement';
import { ExecutionBuilder } from './components/ExecutionBuilder';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { TestDataInventory } from './components/TestDataInventory';
import { TestsInventory } from './components/TestsInventory';
import { cn } from './components/ui/utils';
import { useNavigationHistory } from './hooks/useNavigationHistory';
import { AppConfig, configService } from './services/configService';
import { User } from './services/types';
import { useAuthStore } from './stores/authStore';
import { useLobStore } from './stores/lobStore';
import {
  getPermissionsFromRoles,
  usePermissionsStore,
} from './stores/permissionsStore';

function App() {
  const user = useAuthStore(s => s.user);
  const login = useAuthStore(s => s.login);
  const setUserPermissions = usePermissionsStore(s => s.setUserPermissions);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const initializeDefaultPermissions = usePermissionsStore(
    s => s.initializeDefaultPermissions
  );

  const initializeLob = useLobStore(s => s.initializeFromUser);

  const handleLogin = (loggedInUser: User) => {
    login(loggedInUser);
    const roles = [loggedInUser.profile];
    setUserPermissions({
      userId: loggedInUser.id,
      username: loggedInUser.name,
      roles,
      permissions: getPermissionsFromRoles(roles),
    });
    initializeLob(loggedInUser.lob, loggedInUser.profile);
  };

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

  // Initialize permissions on mount
  useEffect(() => {
    initializeDefaultPermissions();
  }, [initializeDefaultPermissions]);

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

  return <AppContent appConfig={appConfig} />;
}

function AppContent({ appConfig }: { appConfig: AppConfig | null }) {
  const user = useAuthStore(s => s.user);
  const storeLogout = useAuthStore(s => s.logout);

  const logout = () => {
    sessionStorage.removeItem('permissions-storage');
    sessionStorage.removeItem('lob-storage');
    storeLogout();
  };
  const {
    currentTab: activeTab,
    pushToHistory,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
  } = useNavigationHistory(appConfig?.application.defaultTab || 'tests');

  const handleTabChange = (tab: string) => {
    pushToHistory(tab);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Header
        user={user!}
        onLogout={logout}
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

const settingsMenuItems = [
  {
    id: 'system',
    label: 'System Configuration',
    icon: <Settings className="h-4 w-4" />,
  },
  {
    id: 'users',
    label: 'User Management',
    icon: <Users className="h-4 w-4" />,
  },
];

function SettingsComponent() {
  const [activeTab, setActiveTab] = useState('system');

  return (
    <div className="space-y-6">
      {/* Premium Segmented Control Menu */}
      <div className="mb-8 flex justify-end">
        <nav className="flex items-center gap-1.5 rounded-2xl border border-gray-200/80 bg-gray-100/50 p-1.5 shadow-inner backdrop-blur-sm">
          {settingsMenuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'group relative flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:bg-white/60 hover:text-gray-900'
                )}
              >
                <span
                  className={cn(
                    'transition-transform duration-300',
                    isActive
                      ? 'scale-110 text-blue-600'
                      : 'text-gray-400 group-hover:scale-105 group-hover:text-gray-500'
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'system' && <SystemConfiguration />}
        {activeTab === 'users' && <UserManagement />}
      </div>
    </div>
  );
}

export default App;
