import { UserProfile } from '../components/Login';

import { Lob } from './types';

// Configuration interfaces
export interface TabConfig {
  id: string;
  label: string;
  icon: string;
  component: string;
  permissions: UserProfile[];
  description: string;
}

export interface SettingsTabConfig {
  id: string;
  label: string;
  description: string;
}

export interface AppConfig {
  application: {
    name: string;
    description: string;
    version: string;
    defaultTab: string;
  };
  tabs: TabConfig[];
  settingsTabs: SettingsTabConfig[];
}

export interface ConfigurationSection {
  id: string;
  title: string;
  description: string;
  type: 'list' | 'keyvalue';
  items: string[] | Record<string, string>;
}

export interface RolePermissions {
  name: string;
  permissions: string[];
}

export type GroupedDsls = Record<
  string, // e.g., 'TestDataFlavorsBANK', 'TestDataReconCARD', 'TDMRecipesBANK'
  Array<SemanticRuleConfig | TdmRecipeConfig>
>;

export interface SemanticRuleConfig {
  id: string; // Used for UI identification
  lob: Lob;
  category: 'Flavor' | 'Recon';
  key: string;
  regexString: string;
  suggestions: string[];
}

export interface TdmRecipeConfig {
  id: string;
  lob: Lob;
  name: string;
  description: string;
  tags: string[];
}

export interface SystemConfig {
  systemConfiguration: {
    title: string;
    description: string;
    adminOnlyBadge: {
      text: string;
      bgColor: string;
      textColor: string;
    };
  };
  configurationSections: ConfigurationSection[];
  rolesPermissions: {
    title: string;
    description: string;
    cardStyle: {
      borderColor: string;
      bgColor: string;
      titleColor: string;
      descriptionColor: string;
    };
    roles: Record<UserProfile, RolePermissions>;
  };
  dsls: {
    title: string;
    description: string;
    semanticRules: SemanticRuleConfig[];
    recipes: TdmRecipeConfig[];
    grouped: GroupedDsls;
  };
}

export interface UserProfileConfig {
  value: UserProfile;
  label: string;
  description: string;
  icon: string;
  badgeStyle: {
    bgColor: string;
    textColor: string;
  };
}

export interface StatCard {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface DialogConfig {
  title: string;
  description: string;
}

export interface UserConfig {
  userProfiles: UserProfileConfig[];
  userManagement: {
    title: string;
    description: string;
    searchPlaceholder: string;
    buttons: Record<string, string>;
    tableHeaders: string[];
    statCards: StatCard[];
    dialogs: Record<string, DialogConfig>;
    formLabels: Record<string, string>;
    placeholders: Record<string, string>;
    messages: Record<string, string>;
  };
}

// Embedded configuration objects
const APP_CONFIG: AppConfig = {
  application: {
    name: 'Testing Platform',
    description: 'Comprehensive testing inventory and execution platform',
    version: '1.0.0',
    defaultTab: 'tests',
  },
  tabs: [
    {
      id: 'tests',
      label: 'Tests Inventory',
      icon: 'TestTube',
      component: 'TestsInventory',
      permissions: ['dev', 'automation', 'product', 'admin'],
      description: 'Manage test cases and scenarios',
    },
    {
      id: 'testdata',
      label: 'Test Data Inventory',
      icon: 'Database',
      component: 'TestDataInventory',
      permissions: ['dev', 'automation', 'product', 'admin'],
      description: 'Manage test data and banking sources',
    },
    {
      id: 'execution',
      label: 'Execution Builder',
      icon: 'Play',
      component: 'ExecutionBuilder',
      permissions: ['dev', 'automation', 'admin'],
      description: 'Build and manage test execution batches',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      component: 'Settings',
      permissions: ['admin'],
      description: 'System configuration and user management',
    },
  ],
  settingsTabs: [
    {
      id: 'system',
      label: 'System Configuration',
      description: 'Management of catalogs and general configurations',
    },
    {
      id: 'users',
      label: 'User Management',
      description: 'Manage users and their permissions',
    },
  ],
};

const SYSTEM_CONFIG: SystemConfig = {
  systemConfiguration: {
    title: 'System Configuration',
    description: 'Management of catalogs and general configurations',
    adminOnlyBadge: {
      text: 'Admin Only',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
    },
  },
  configurationSections: [
    {
      id: 'classifications',
      title: 'Classifications',
      description: 'Manage classification catalog',
      type: 'keyvalue',
      items: {
        'Active account': 'Account with recent activity',
        'Business account': 'Commercial customer account',
        'Primary user': 'Main account holder',
        'Expired credit card': 'Payment method needs update',
        'Dormant account': 'Inactive for extended period',
        'VIP customer': 'Premium service level',
        'New customer': 'Recently registered user',
      },
    },
    {
      id: 'runtimes',
      title: 'Runtimes',
      description: 'Available execution platforms',
      type: 'keyvalue',
      items: {
        'OCP Testing Studio': 'Oracle Cloud Platform testing environment',
        Xero: 'Accounting software integration platform',
        Sierra: 'Library management system runtime',
        Postman: 'API development and testing tool',
        Newman: 'Command line collection runner for Postman',
        'Custom Runtime': 'User-defined execution environment',
      },
    },
    {
      id: 's3config',
      title: 'S3 Configuration',
      description: 'Storage configuration',
      type: 'keyvalue',
      items: {
        Bucket: 'my-test-dialogs',
        Versioning: 'Enabled',
        Region: 'us-east-1',
        Encryption: 'AES-256',
      },
    },
  ],
  rolesPermissions: {
    title: 'Roles and Permissions',
    description: 'User profiles and permissions configuration',
    cardStyle: {
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      titleColor: 'text-blue-800',
      descriptionColor: 'text-blue-700',
    },
    roles: {
      dev: {
        name: 'Developer',
        permissions: ['Tests (read/write)', 'Test Data (read/write)'],
      },
      automation: {
        name: 'Automation',
        permissions: ['All modules', 'Complete Execution Builder'],
      },
      qa_engineer: {
        name: 'QA Engineer',
        permissions: [
          'Tests (read/write)',
          'Test Data (read/write)',
          'Execution Builder',
        ],
      },
      product: {
        name: 'Product',
        permissions: ['Read-only in all modules', 'Cannot create/edit'],
      },
      admin: {
        name: 'Admin',
        permissions: [
          'Full access',
          'System configurations',
          'User management',
        ],
      },
    },
  },
  dsls: {
    title: 'DSLs Management',
    description:
      'Manage Domain Specific Languages used across the system for semantic tagging.',
    semanticRules: [],
    recipes: [],
    grouped: {},
  },
};

const USER_CONFIG: UserConfig = {
  userProfiles: [
    {
      value: 'dev',
      label: 'Developer',
      description: 'Tests and Test Data (read/write)',
      icon: '💻',
      badgeStyle: {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
      },
    },
    {
      value: 'automation',
      label: 'Automation',
      description: 'All modules, complete Execution Builder',
      icon: '🤖',
      badgeStyle: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      },
    },
    {
      value: 'product',
      label: 'Product',
      description: 'Read-only in all modules',
      icon: '📊',
      badgeStyle: {
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
      },
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Full access and configurations',
      icon: '🛡️',
      badgeStyle: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      },
    },
  ],
  userManagement: {
    title: 'User Management',
    description: 'Manage users and their permissions on the platform',
    searchPlaceholder: 'Search by email or username...',
    buttons: {
      newUser: 'New User',
      clearSearch: 'Clear search',
      cancel: 'Cancel',
      create: 'Create User',
      save: 'Save Changes',
      delete: 'Delete',
      changePassword: 'Change Password',
    },
    tableHeaders: [
      'User',
      'Email',
      'Profile',
      'Status',
      'Last Login',
      'Created',
      'Actions',
    ],
    statCards: [
      {
        id: 'total',
        label: 'Total Users',
        icon: 'Users',
        color: 'text-blue-600',
      },
      {
        id: 'active',
        label: 'Active',
        icon: 'UserCheck',
        color: 'text-green-600',
      },
      {
        id: 'administrators',
        label: 'Administrators',
        icon: 'Shield',
        color: 'text-red-600',
      },
      {
        id: 'inactive',
        label: 'Inactive',
        icon: 'Users',
        color: 'text-purple-600',
      },
    ],
    dialogs: {
      create: {
        title: 'Create New User',
        description:
          'Complete the details to create a new user on the platform',
      },
      edit: {
        title: 'Edit User',
        description: 'Modify the details of user',
      },
      changePassword: {
        title: 'Change Password',
        description: 'Set a new password for',
      },
      confirmDelete: {
        title: 'Confirm deletion?',
        description:
          'This action will permanently delete user {username}. This action cannot be undone.',
      },
    },
    formLabels: {
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      newPassword: 'New Password',
      profile: 'Profile',
    },
    placeholders: {
      username: 'Enter the username',
      email: 'user@example.com',
      password: 'Password',
      confirmPassword: 'Confirm the password',
      newPassword: 'New password (minimum 6 characters)',
      confirmNewPassword: 'Confirm the new password',
    },
    messages: {
      allFieldsRequired: 'All fields are required',
      passwordsDoNotMatch: 'Passwords do not match',
      usernameExists: 'Username already exists',
      emailExists: 'Email already exists',
      passwordTooShort: 'Password must be at least 6 characters long',
      cannotDeleteLastAdmin: 'Cannot delete the last active administrator',
      cannotDeactivateLastAdmin:
        'Cannot deactivate the last active administrator',
      userCreated: 'User {username} created successfully',
      userUpdated: 'User {username} updated successfully',
      userDeleted: 'User {username} deleted successfully',
      userActivated: 'User {username} activated successfully',
      userDeactivated: 'User {username} deactivated successfully',
      passwordChanged: 'Password for {username} changed successfully',
    },
  },
};

class ConfigService {
  private appConfig: AppConfig | null = null;
  private systemConfig: SystemConfig | null = null;
  private userConfig: UserConfig | null = null;

  async loadAppConfig(): Promise<AppConfig> {
    if (!this.appConfig) {
      // Simulate async loading with a small delay
      await new Promise(resolve => setTimeout(resolve, 10));
      this.appConfig = APP_CONFIG;
    }
    return this.appConfig;
  }

  async loadSystemConfig(): Promise<SystemConfig> {
    if (!this.systemConfig) {
      try {
        const response = await fetch('/api/dsls');
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            this.systemConfig = {
              ...SYSTEM_CONFIG,
              dsls: {
                ...SYSTEM_CONFIG.dsls,
                semanticRules: resJson.data.semanticRules || [],
                recipes: resJson.data.recipes || [],
                grouped: resJson.data.grouped || {},
              },
            };
            return this.systemConfig;
          }
        }
      } catch (error) {
        console.error('Failed to load DSLs from API', error);
      }
      // Fallback
      this.systemConfig = SYSTEM_CONFIG;
    }
    return this.systemConfig;
  }

  async loadUserConfig(): Promise<UserConfig> {
    if (!this.userConfig) {
      // Simulate async loading with a small delay
      await new Promise(resolve => setTimeout(resolve, 10));
      this.userConfig = USER_CONFIG;
    }
    return this.userConfig;
  }

  // Helper methods
  getAvailableTabs(profile: UserProfile, tabs: TabConfig[]): string[] {
    return tabs
      .filter(tab => tab.permissions.includes(profile))
      .map(tab => tab.id);
  }

  isTabAccessible(
    profile: UserProfile,
    tabId: string,
    tabs: TabConfig[]
  ): boolean {
    const availableTabs = this.getAvailableTabs(profile, tabs);
    return availableTabs.includes(tabId);
  }

  getTabConfig(tabId: string, tabs: TabConfig[]): TabConfig | undefined {
    return tabs.find(tab => tab.id === tabId);
  }

  getUserProfileConfig(
    profile: UserProfile,
    profiles: UserProfileConfig[]
  ): UserProfileConfig | undefined {
    return profiles.find(p => p.value === profile);
  }

  // Message interpolation helper
  interpolateMessage(
    message: string,
    variables: Record<string, string>
  ): string {
    return message.replace(/{(\w+)}/g, (match, key) => variables[key] || match);
  }
}

export const configService = new ConfigService();
