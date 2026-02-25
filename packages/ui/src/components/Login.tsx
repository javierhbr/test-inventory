import React, { useEffect, useState } from 'react';

import { Code, Cog, Package, Shield, TestTube, User } from 'lucide-react';

import { authApi } from '../services/apiClient';

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
// Using native select element instead of UI primitives due to runtime issues with external primitives
import { Separator } from './ui/separator';

import type {
  User as AuthenticatedUser,
  UserProfile as AuthenticatedUserProfile,
} from '../services/types';

export type UserProfile = AuthenticatedUserProfile;
export type User = AuthenticatedUser;

interface LoginProps {
  onLogin: (user: User) => void;
}

const DEFAULT_AVAILABLE_PROFILES: UserProfile[] = [
  'dev',
  'automation',
  'product',
  'admin',
  'qa_engineer',
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
  qa_engineer: {
    title: 'QA Engineer',
    description: 'Create and execute tests, manage test data for QA processes',
    permissions: [
      'View Tests Inventory',
      'Create and edit tests',
      'View Test Data Inventory',
      'Create and edit test data',
      'Run tests and view execution reports',
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
  qa_engineer: {
    icon: TestTube,
    badge: 'bg-emerald-100 text-emerald-800',
  },
};

// OAuth providers configuration
const oauthProviders = [
  {
    id: 'enterprise',
    name: 'Enterprise SSO',
    icon: Shield,
    color: 'bg-purple-600 hover:bg-purple-700 text-white',
    description: 'Corporate access with Single Sign-On',
  },
];

export function Login({ onLogin }: LoginProps) {
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>(
    DEFAULT_AVAILABLE_PROFILES
  );
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfiles = async () => {
      try {
        const profiles = await authApi.getProfiles();
        if (!cancelled && profiles.length > 0) {
          setAvailableProfiles(profiles);
        }
      } catch {
        if (!cancelled) {
          setAvailableProfiles(DEFAULT_AVAILABLE_PROFILES);
        }
      }
    };

    void loadProfiles();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProfile) {
      setError('Please select a profile');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await authApi.login(selectedProfile as UserProfile);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (profile: UserProfile) => {
    setSelectedProfile(profile);
    setIsLoading(true);
    setError('');

    try {
      const user = await authApi.login(profile);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    setOauthLoading(provider);
    setError('');

    try {
      const user = await authApi.oauthLogin(provider);
      onLogin(user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Authentication error with ${provider}`
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
            <TestTube className="text-primary h-12 w-12" />
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
                <select
                  id="profile"
                  value={selectedProfile}
                  onChange={e =>
                    setSelectedProfile(e.target.value as UserProfile)
                  }
                  className="border-input mt-1 block w-full rounded-md border px-3 py-2 text-sm outline-none"
                >
                  <option value="">Select your profile</option>
                  {availableProfiles.map((profile: UserProfile) => {
                    const info = profileInfo[profile];
                    return (
                      <option key={profile} value={profile}>
                        {info.title}
                      </option>
                    );
                  })}
                </select>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {selectedProfileInfo && (
                <Card className="border-l-primary border-l-4 bg-blue-50">
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
                      <strong>Permissions:</strong>
                      <ul className="ml-4 mt-1 list-disc">
                        {selectedProfileInfo.permissions.map(
                          (permission: string, index: number) => (
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
                {isLoading ? 'Logging in...' : 'Login'}
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
                    Or continue with
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
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {availableProfiles.map((profile: UserProfile) => {
                  const config = profileConfig[profile];
                  const info = profileInfo[profile];
                  const IconComponent = config.icon;
                  return (
                    <Button
                      key={profile}
                      variant="outline"
                      size="sm"
                      onClick={() => quickLogin(profile)}
                      className="flex h-12 flex-col items-center justify-center gap-1 px-2 py-2 text-xs"
                      disabled={isLoading}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-center leading-tight">
                        {info.title}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-gray-100 p-4">
              <h4 className="mb-3 font-medium">Permissions by Profile:</h4>
              <div className="space-y-2">
                {availableProfiles.map((profile: UserProfile) => {
                  const info = profileInfo[profile];
                  return (
                    <div
                      key={profile}
                      className="flex flex-col sm:flex-row sm:gap-2"
                    >
                      <div className="font-medium text-gray-700 sm:w-36 sm:flex-shrink-0">
                        {info.title}:
                      </div>
                      <div className="text-sm text-gray-600">
                        {info.description}
                      </div>
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
