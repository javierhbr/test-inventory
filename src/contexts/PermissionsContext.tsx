import { createContext, useContext, useEffect, useState } from 'react';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface UserPermissions {
  userId: string;
  username: string;
  roles: string[]; // Changed from single role to multiple roles
  permissions: string[];
}

interface PermissionsContextType {
  userPermissions: UserPermissions | null;
  hasPermission: (permissionId: string) => boolean;
  setUserPermissions: (permissions: UserPermissions) => void;
  availablePermissions: Permission[];
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: 'delete_tests',
    name: 'Delete Tests',
    description: 'Allows user to delete test cases from the inventory',
  },
  {
    id: 'delete_test_data',
    name: 'Delete Test Data',
    description: 'Allows user to delete test data records from the inventory',
  },
  {
    id: 'edit_tests',
    name: 'Edit Tests',
    description: 'Allows user to edit and modify test cases',
  },
  {
    id: 'edit_test_data',
    name: 'Edit Test Data',
    description: 'Allows user to edit and modify test data records',
  },
  {
    id: 'create_tests',
    name: 'Create Tests',
    description: 'Allows user to create new test cases',
  },
  {
    id: 'create_test_data',
    name: 'Create Test Data',
    description: 'Allows user to create new test data records',
  },
  {
    id: 'export_tests',
    name: 'Export Tests',
    description: 'Allows user to export test inventories to YAML/other formats',
  },
  {
    id: 'view_all_tests',
    name: 'View All Tests',
    description: 'Allows user to view all test cases and data in the system',
  },
];

// Mock user roles with default permissions
const DEFAULT_ROLE_PERMISSIONS = {
  admin: [
    'delete_tests',
    'delete_test_data',
    'edit_tests',
    'edit_test_data',
    'create_tests',
    'create_test_data',
    'export_tests',
    'view_all_tests',
  ], // Admin has all permissions including delete
  test_manager: [
    'edit_tests',
    'edit_test_data',
    'create_tests',
    'create_test_data',
    'export_tests',
    'view_all_tests',
  ], // Test manager can manage but not delete
  qa_engineer: [
    'create_tests',
    'create_test_data',
    'edit_tests',
    'export_tests',
    'view_all_tests',
  ], // QA engineer can create and edit
  viewer: ['view_all_tests', 'export_tests'], // Viewer has read-only access
};

// Helper function to get all permissions from multiple roles
export function getPermissionsFromRoles(roles: string[]): string[] {
  const allPermissions = new Set<string>();
  roles.forEach(role => {
    const rolePerms =
      DEFAULT_ROLE_PERMISSIONS[role as keyof typeof DEFAULT_ROLE_PERMISSIONS];
    if (rolePerms) {
      rolePerms.forEach(perm => allPermissions.add(perm));
    }
  });
  return Array.from(allPermissions);
}

export function PermissionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userPermissions, setUserPermissions] =
    useState<UserPermissions | null>(null);

  useEffect(() => {
    // Simulate loading user permissions from sessionStorage or API
    const storedUser = sessionStorage.getItem('userPermissions');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Handle migration from old single role to new multiple roles
        if (user.role && !user.roles) {
          user.roles = [user.role];
          delete user.role;
          // Update permissions based on all roles
          user.permissions = getPermissionsFromRoles(user.roles);
          sessionStorage.setItem('userPermissions', JSON.stringify(user));
        }
        setUserPermissions(user);
      } catch (error) {
        console.error('Failed to parse stored user permissions:', error);
        // Set default user for demo purposes
        setDefaultUser();
      }
    } else {
      // Set default user for demo purposes
      setDefaultUser();
    }
  }, []);

  const setDefaultUser = () => {
    // Set default user as admin with delete permissions
    const defaultUser: UserPermissions = {
      userId: 'user-001',
      username: 'admin-user',
      roles: ['admin'], // Admin role includes delete permissions
      permissions: getPermissionsFromRoles(['admin']),
    };
    setUserPermissions(defaultUser);
    sessionStorage.setItem('userPermissions', JSON.stringify(defaultUser));
  };

  const hasPermission = (permissionId: string): boolean => {
    if (!userPermissions) return false;
    return userPermissions.permissions.includes(permissionId);
  };

  const handleSetUserPermissions = (permissions: UserPermissions) => {
    setUserPermissions(permissions);
    sessionStorage.setItem('userPermissions', JSON.stringify(permissions));
  };

  return (
    <PermissionsContext.Provider
      value={{
        userPermissions,
        hasPermission,
        setUserPermissions: handleSetUserPermissions,
        availablePermissions: AVAILABLE_PERMISSIONS,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

export { DEFAULT_ROLE_PERMISSIONS };
