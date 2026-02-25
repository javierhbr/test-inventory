import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { Permission, UserPermissions } from '../services/types';

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

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'delete_tests',
    'delete_test_data',
    'edit_tests',
    'edit_test_data',
    'create_tests',
    'create_test_data',
    'export_tests',
    'view_all_tests',
  ],
  test_manager: [
    'edit_tests',
    'edit_test_data',
    'create_tests',
    'create_test_data',
    'export_tests',
    'view_all_tests',
  ],
  qa_engineer: [
    'create_tests',
    'create_test_data',
    'edit_tests',
    'export_tests',
    'view_all_tests',
  ],
  viewer: ['view_all_tests', 'export_tests'],
};

export function getPermissionsFromRoles(roles: string[]): string[] {
  const allPermissions = new Set<string>();
  roles.forEach(role => {
    const rolePerms = DEFAULT_ROLE_PERMISSIONS[role];
    if (rolePerms) {
      rolePerms.forEach(perm => allPermissions.add(perm));
    }
  });
  return Array.from(allPermissions);
}

interface PermissionsState {
  userPermissions: UserPermissions | null;
  availablePermissions: Permission[];
}

interface PermissionsActions {
  setUserPermissions: (permissions: UserPermissions) => void;
  initializeDefaultPermissions: () => void;
}

type PermissionsStore = PermissionsState & PermissionsActions;

const initialState: PermissionsState = {
  userPermissions: null,
  availablePermissions: AVAILABLE_PERMISSIONS,
};

export const usePermissionsStore = create<PermissionsStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUserPermissions: permissions => set({ userPermissions: permissions }),

      initializeDefaultPermissions: () => {
        const { userPermissions } = get();
        if (userPermissions) return;

        set({
          userPermissions: {
            userId: 'demo-user',
            username: 'demo-user',
            roles: ['viewer'],
            permissions: getPermissionsFromRoles(['viewer']),
          },
        });
      },
    }),
    {
      name: 'permissions-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({
        userPermissions: state.userPermissions,
      }),
    }
  )
);

// Derived selector: check if user has a specific permission
export const selectHasPermission =
  (permissionId: string) => (state: PermissionsStore) => {
    if (!state.userPermissions) return false;
    return state.userPermissions.permissions.includes(permissionId);
  };

// Convenience hook: returns a checker function derived from store state
export function useHasPermission() {
  const permissions = usePermissionsStore(s => s.userPermissions?.permissions);
  return (permissionId: string) =>
    permissions ? permissions.includes(permissionId) : false;
}

export { DEFAULT_ROLE_PERMISSIONS, AVAILABLE_PERMISSIONS };
