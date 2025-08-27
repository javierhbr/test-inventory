import { Code, Cog, Package, Shield, TestTube, User } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Separator } from './ui/separator';

// Import types and functions from services
export type UserProfile =
  | 'dev'
  | 'automation'
  | 'product'
  | 'admin'
  | 'delete'
  | 'qa_engineer';

export interface User {
  id: string;
  name: string;
  profile: UserProfile;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

// Mock data directly in component for now to fix the import issue
const mockUsers: User[] = [
  { id: 'dev-001', name: 'Juan Pérez', profile: 'dev' },
  { id: 'automation-001', name: 'María García', profile: 'automation' },
  { id: 'product-001', name: 'Carlos López', profile: 'product' },
  { id: 'admin-001', name: 'Ana Martínez', profile: 'admin' },
];

const availableProfiles: UserProfile[] = [
  'dev',
  'automation',
  'product',
  'admin',
];

const profileInfo = {
  dev: {
    title: 'Developer',
    description: 'Access to create and edit tests and test data',
    permissions: [
      'View Tests Inventory',
      'Create and edit tests',
      'View Test Data Inventory',
      'Create and edit test data',
      'Use Execution Builder (limited)',
    ],
  },
  automation: {
    title: 'Automation Engineer',
    description: 'Full access to all testing features',
    permissions: [
      'Full access to Tests Inventory',
      'Full access to Test Data Inventory',
      'Full access to Execution Builder',
      'Manage executions',
    ],
  },
  product: {
    title: 'Product Manager',
    description: 'Read-only access for tracking and reporting',
    permissions: [
      'View Tests Inventory (read-only)',
      'View Test Data Inventory (read-only)',
      'View execution reports',
      'Access metrics and dashboards',
    ],
  },
  admin: {
    title: 'System Administrator',
    description: 'Full access including system configuration',
    permissions: [
      'Full access to all modules',
      'System configuration',
      'User management',
      'Catalog configuration',
      'Runtime configuration',
    ],
  },
};

const profileConfig = {
  dev: {
    icon: Code,
    badge: 'bg-blue-100 text-blue-800',
  },
  automation: {
    icon: Cog,
    badge: 'bg-green-100 text-green-800',
  },
  product: {
    icon: Package,
    badge: 'bg-purple-100 text-purple-800',
  },
  admin: {
    icon: Shield,
    badge: 'bg-red-100 text-red-800',
  },
};

// Mock authentication function
const authenticateUser = (profile: UserProfile): Promise<User> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.profile === profile);
      if (user) {
        resolve(user);
      } else {
        // Resolve with a default error-like user is not appropriate; throw instead
        throw new Error('User not found');
      }
    }, 1000);
  });
};

// Mock OAuth authentication function
const authenticateOAuth = (provider: string): Promise<User> => {
  return new Promise(resolve => {
    setTimeout(() => {
      // Simulate OAuth flow - in real implementation, this would handle OAuth callback
      let userProfile: UserProfile = 'automation'; // Default profile
      let userName = `Usuario de ${provider}`;

      // Assign different profiles based on provider
      switch (provider) {
        case 'enterprise':
          userProfile = 'admin'; // Enterprise SSO users get admin access
          userName = 'Usuario Corporativo';
          break;
        default:
          userProfile = 'automation';
          break;
      }

      const oauthUser: User = {
        id: `oauth-${Date.now()}`,
        name: userName,
        profile: userProfile,
      };
      resolve(oauthUser);
    }, 2000); // Longer delay to simulate OAuth flow
  });
};

// OAuth providers configuration
const oauthProviders = [
  {
    id: 'enterprise',
    name: 'Enterprise SSO',
    icon: Shield,
    color: 'bg-purple-600 hover:bg-purple-700 text-white',
    description: 'Acceso corporativo con Single Sign-On',
  },
];

export function Login({ onLogin }: LoginProps) {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProfile) {
      setError('Por favor selecciona un perfil');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await authenticateUser(selectedProfile as UserProfile);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (profile: UserProfile) => {
    setSelectedProfile(profile);
    setIsLoading(true);
    setError('');

    try {
      const user = await authenticateUser(profile);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    setOauthLoading(provider);
    setError('');

    try {
      const user = await authenticateOAuth(provider);
      onLogin(user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Error de autenticación con ${provider}`
      );
    } finally {
      setOauthLoading(null);
    }
  };

  const selectedProfileInfo = selectedProfile
    ? profileInfo[selectedProfile]
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <TestTube className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Testing Inventory System
          </h1>
          <p className="text-gray-600">
            Enter your credentials to access the system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Sign In
            </CardTitle>
            <CardDescription>
              Select your user profile to access the appropriate features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="profile">User Profile</Label>
                <Select
                  value={selectedProfile}
                  onValueChange={(val: string) =>
                    setSelectedProfile(val as UserProfile)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProfiles.map(profile => {
                      const config = profileConfig[profile];
                      const info = profileInfo[profile];
                      const IconComponent = config.icon;
                      return (
                        <SelectItem key={profile} value={profile}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {info.title}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {selectedProfileInfo && (
                <Card className="border-l-4 border-l-primary bg-blue-50">
                  <CardContent className="pt-4">
                    <div className="mb-2 flex items-center gap-3">
                      {React.createElement(
                        profileConfig[selectedProfile as UserProfile].icon,
                        {
                          className: 'w-5 h-5',
                        }
                      )}
                      <span className="font-medium">
                        {selectedProfileInfo.title}
                      </span>
                      <Badge
                        className={
                          profileConfig[selectedProfile as UserProfile].badge
                        }
                      >
                        {(selectedProfile as string).toUpperCase()}
                      </Badge>
                    </div>
                    <p className="mb-3 text-sm text-gray-600">
                      {selectedProfileInfo.description}
                    </p>
                    <div className="text-sm">
                      <strong>Permisos:</strong>
                      <ul className="ml-4 mt-1 list-disc">
                        {selectedProfileInfo.permissions.map(
                          (permission, index) => (
                            <li key={index} className="text-gray-600">
                              {permission}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* OAuth Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    O continúa con
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {oauthProviders.map(provider => {
                  const IconComponent = provider.icon;
                  const isProviderLoading = oauthLoading === provider.id;
                  return (
                    <Button
                      key={provider.id}
                      variant="outline"
                      onClick={() => handleOAuthLogin(provider.id)}
                      disabled={isLoading || oauthLoading !== null}
                      className="flex w-full items-center justify-center gap-3 py-6"
                    >
                      <IconComponent className="h-5 w-5" />
                      {isProviderLoading
                        ? `Connecting with ${provider.name}...`
                        : provider.description}
                    </Button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <strong>Note:</strong> When using OAuth, you will be
                automatically assigned a profile based on the provider:
                <ul className="ml-4 mt-2 list-disc">
                  <li>
                    <strong>Enterprise SSO</strong> → Admin (full access)
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-4 text-center text-sm text-gray-500">
                Quick access for demonstration:
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {availableProfiles.map(profile => {
                  const config = profileConfig[profile];
                  const info = profileInfo[profile];
                  const IconComponent = config.icon;
                  return (
                    <Button
                      key={profile}
                      variant="outline"
                      size="sm"
                      onClick={() => quickLogin(profile)}
                      className="flex items-center gap-2"
                      disabled={isLoading}
                    >
                      <IconComponent className="h-4 w-4" />
                      {info.title}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-gray-100 p-4">
              <h4 className="mb-2 font-medium">Permissions by Profile:</h4>
              <div className="space-y-1 text-sm">
                {availableProfiles.map(profile => {
                  const info = profileInfo[profile];
                  return (
                    <div key={profile}>
                      <strong>{info.title}:</strong> {info.description}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
