// Authentication service

import { User, UserProfile } from './types';

// Mock user data
const mockUsers: User[] = [
  {
    id: 'dev-001',
    name: 'Juan Pérez',
    profile: 'dev',
  },
  {
    id: 'automation-001',
    name: 'María García',
    profile: 'automation',
  },
  {
    id: 'product-001',
    name: 'Carlos López',
    profile: 'product',
  },
  {
    id: 'admin-001',
    name: 'Ana Martínez',
    profile: 'admin',
  },
];

/**
 * Authenticates a user based on profile selection
 */
export function authenticateUser(profile: UserProfile): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.profile === profile);
      if (user) {
        resolve(user);
      } else {
        reject(new Error('Usuario no encontrado'));
      }
    }, 1000); // Simulate API delay
  });
}

/**
 * Gets available user profiles
 */
export function getAvailableProfiles(): UserProfile[] {
  return ['dev', 'automation', 'product', 'admin'];
}

/**
 * Gets profile display information
 */
export function getProfileInfo(profile: UserProfile): {
  title: string;
  description: string;
  permissions: string[];
} {
  const profileInfo = {
    dev: {
      title: 'Developer',
      description: 'Acceso a creación y edición de tests y test data',
      permissions: [
        'Ver Tests Inventory',
        'Crear y editar tests',
        'Ver Test Data Inventory',
        'Crear y editar test data',
        'Usar Execution Builder (limitado)',
      ],
    },
    automation: {
      title: 'Automation Engineer',
      description: 'Acceso completo a todas las funcionalidades de testing',
      permissions: [
        'Acceso completo a Tests Inventory',
        'Acceso completo a Test Data Inventory',
        'Acceso completo a Execution Builder',
        'Gestión de ejecuciones',
      ],
    },
    product: {
      title: 'Product Manager',
      description: 'Acceso de solo lectura para seguimiento y reporting',
      permissions: [
        'Ver Tests Inventory (solo lectura)',
        'Ver Test Data Inventory (solo lectura)',
        'Ver reportes de ejecución',
        'Acceso a métricas y dashboards',
      ],
    },
    admin: {
      title: 'System Administrator',
      description: 'Acceso completo incluyendo configuración del sistema',
      permissions: [
        'Acceso completo a todos los módulos',
        'Configuración del sistema',
        'Gestión de usuarios',
        'Configuración de catálogos',
        'Configuración de runtimes',
      ],
    },
  };

  return profileInfo[profile];
}

/**
 * Determines available navigation tabs based on user profile
 */
export function getAvailableTabs(profile: UserProfile): string[] {
  const baseTabs = ['tests', 'testdata', 'execution'];

  if (profile === 'admin') {
    return [...baseTabs, 'settings'];
  }

  return baseTabs;
}

/**
 * Checks if user has permission for a specific action
 */
export function hasPermission(profile: UserProfile, action: string): boolean {
  const permissions = {
    dev: {
      'tests.read': true,
      'tests.write': true,
      'testdata.read': true,
      'testdata.write': true,
      'execution.read': true,
      'execution.write': false,
      'settings.read': false,
      'settings.write': false,
    },
    automation: {
      'tests.read': true,
      'tests.write': true,
      'testdata.read': true,
      'testdata.write': true,
      'execution.read': true,
      'execution.write': true,
      'settings.read': false,
      'settings.write': false,
    },
    product: {
      'tests.read': true,
      'tests.write': false,
      'testdata.read': true,
      'testdata.write': false,
      'execution.read': true,
      'execution.write': false,
      'settings.read': false,
      'settings.write': false,
    },
    admin: {
      'tests.read': true,
      'tests.write': true,
      'testdata.read': true,
      'testdata.write': true,
      'execution.read': true,
      'execution.write': true,
      'settings.read': true,
      'settings.write': true,
    },
  };

  return permissions[profile][action] || false;
}

/**
 * Logs out the current user
 */
export function logoutUser(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      // Clear all stored session data
      localStorage.clear();
      sessionStorage.clear();
      resolve();
    }, 500);
  });
}

/**
 * Validates if a tab is accessible for the user
 */
export function isTabAccessible(profile: UserProfile, tab: string): boolean {
  const availableTabs = getAvailableTabs(profile);
  return availableTabs.includes(tab);
}
