import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { TestTube, User, Shield, Code, Cog, Package, Github, Chrome, Building2 } from 'lucide-react';

// Import types and functions from services
export type UserProfile = 'dev' | 'automation' | 'product' | 'admin';

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
  { id: 'admin-001', name: 'Ana Martínez', profile: 'admin' }
];

const availableProfiles: UserProfile[] = ['dev', 'automation', 'product', 'admin'];

const profileInfo = {
  dev: {
    title: 'Developer',
    description: 'Acceso a creación y edición de tests y test data',
    permissions: [
      'Ver Tests Inventory',
      'Crear y editar tests',
      'Ver Test Data Inventory',
      'Crear y editar test data',
      'Usar Execution Builder (limitado)'
    ]
  },
  automation: {
    title: 'Automation Engineer',
    description: 'Acceso completo a todas las funcionalidades de testing',
    permissions: [
      'Acceso completo a Tests Inventory',
      'Acceso completo a Test Data Inventory',
      'Acceso completo a Execution Builder',
      'Gestión de ejecuciones'
    ]
  },
  product: {
    title: 'Product Manager',
    description: 'Acceso de solo lectura para seguimiento y reporting',
    permissions: [
      'Ver Tests Inventory (solo lectura)',
      'Ver Test Data Inventory (solo lectura)',
      'Ver reportes de ejecución',
      'Acceso a métricas y dashboards'
    ]
  },
  admin: {
    title: 'System Administrator',
    description: 'Acceso completo incluyendo configuración del sistema',
    permissions: [
      'Acceso completo a todos los módulos',
      'Configuración del sistema',
      'Gestión de usuarios',
      'Configuración de catálogos',
      'Configuración de runtimes'
    ]
  }
};

const profileConfig = {
  dev: {
    icon: Code,
    badge: 'bg-blue-100 text-blue-800'
  },
  automation: {
    icon: Cog,
    badge: 'bg-green-100 text-green-800'
  },
  product: {
    icon: Package,
    badge: 'bg-purple-100 text-purple-800'
  },
  admin: {
    icon: Shield,
    badge: 'bg-red-100 text-red-800'
  }
};

// Mock authentication function
const authenticateUser = (profile: UserProfile): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.profile === profile);
      if (user) {
        resolve(user);
      } else {
        reject(new Error('Usuario no encontrado'));
      }
    }, 1000);
  });
};

// Mock OAuth authentication function
const authenticateOAuth = (provider: string): Promise<User> => {
  return new Promise((resolve, reject) => {
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
        case 'github':
          userProfile = 'dev'; // GitHub users typically developers
          userName = 'Developer';
          break;
        case 'google':
          userProfile = 'automation'; // Google users get automation access
          userName = 'Usuario de Google';
          break;
        case 'microsoft':
          userProfile = 'product'; // Microsoft users get product access
          userName = 'Usuario de Microsoft';
          break;
        default:
          userProfile = 'automation';
          break;
      }
      
      const oauthUser: User = {
        id: `oauth-${Date.now()}`,
        name: userName,
        profile: userProfile
      };
      resolve(oauthUser);
    }, 2000); // Longer delay to simulate OAuth flow
  });
};

// OAuth providers configuration
const oauthProviders = [
  {
    id: 'google',
    name: 'Google',
    icon: Chrome,
    color: 'bg-red-500 hover:bg-red-600 text-white',
    description: 'Continúa con tu cuenta de Google'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: 'bg-gray-900 hover:bg-gray-800 text-white',
    description: 'Continúa con tu cuenta de GitHub'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: Building2,
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
    description: 'Continúa con tu cuenta de Microsoft'
  },
  {
    id: 'enterprise',
    name: 'Enterprise SSO',
    icon: Shield,
    color: 'bg-purple-600 hover:bg-purple-700 text-white',
    description: 'Acceso corporativo con Single Sign-On'
  }
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
      setError(err instanceof Error ? err.message : `Error de autenticación con ${provider}`);
    } finally {
      setOauthLoading(null);
    }
  };

  const selectedProfileInfo = selectedProfile ? profileInfo[selectedProfile] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <TestTube className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Inventario de Testing
          </h1>
          <p className="text-gray-600">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Iniciar Sesión
            </CardTitle>
            <CardDescription>
              Selecciona tu perfil de usuario para acceder a las funcionalidades correspondientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="profile">Perfil de Usuario</Label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProfiles.map((profile) => {
                      const config = profileConfig[profile];
                      const info = profileInfo[profile];
                      const IconComponent = config.icon;
                      return (
                        <SelectItem key={profile} value={profile}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {info.title}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {selectedProfileInfo && (
                <Card className="border-l-4 border-l-primary bg-blue-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      {React.createElement(profileConfig[selectedProfile as UserProfile].icon, { 
                        className: "w-5 h-5" 
                      })}
                      <span className="font-medium">
                        {selectedProfileInfo.title}
                      </span>
                      <Badge className={profileConfig[selectedProfile as UserProfile].badge}>
                        {(selectedProfile as string).toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {selectedProfileInfo.description}
                    </p>
                    <div className="text-sm">
                      <strong>Permisos:</strong>
                      <ul className="list-disc ml-4 mt-1">
                        {selectedProfileInfo.permissions.map((permission, index) => (
                          <li key={index} className="text-gray-600">{permission}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
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
                  <span className="bg-white px-2 text-gray-500">O continúa con</span>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {oauthProviders.map((provider) => {
                  const IconComponent = provider.icon;
                  const isProviderLoading = oauthLoading === provider.id;
                  return (
                    <Button
                      key={provider.id}
                      variant="outline"
                      onClick={() => handleOAuthLogin(provider.id)}
                      disabled={isLoading || oauthLoading !== null}
                      className="w-full flex items-center justify-center gap-3 py-6"
                    >
                      <IconComponent className="w-5 h-5" />
                      {isProviderLoading 
                        ? `Conectando con ${provider.name}...` 
                        : provider.description
                      }
                    </Button>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <strong>Nota:</strong> Al usar OAuth, se te asignará automáticamente un perfil según el proveedor:
                <ul className="list-disc ml-4 mt-2">
                  <li><strong>Enterprise SSO</strong> → Admin (acceso completo)</li>
                  <li><strong>GitHub</strong> → Developer (desarrollo y testing)</li>
                  <li><strong>Google</strong> → Automation Engineer (testing completo)</li>
                  <li><strong>Microsoft</strong> → Product Manager (solo lectura)</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm text-gray-500 text-center mb-4">
                Acceso rápido para demostración:
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableProfiles.map((profile) => {
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
                      <IconComponent className="w-4 h-4" />
                      {info.title}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-medium mb-2">Permisos por Perfil:</h4>
              <div className="text-sm space-y-1">
                {availableProfiles.map((profile) => {
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