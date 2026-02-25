import { useState } from 'react';

import { Settings, Shield, User } from 'lucide-react';

import { UserPermissions } from '../../services/types';
import {
  getPermissionsFromRoles,
  usePermissionsStore,
} from '../../stores/permissionsStore';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export function PermissionsManager() {
  const userPermissions = usePermissionsStore(s => s.userPermissions);
  const setUserPermissions = usePermissionsStore(s => s.setUserPermissions);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    userPermissions?.roles || ['qa_engineer']
  );

  const handleRoleToggle = (role: string, checked: boolean) => {
    const newRoles = checked
      ? [...selectedRoles, role]
      : selectedRoles.filter(r => r !== role);
    setSelectedRoles(newRoles);
  };

  const handleSave = () => {
    if (userPermissions) {
      const rolePermissions = getPermissionsFromRoles(selectedRoles);
      const updatedUser: UserPermissions = {
        ...userPermissions,
        roles: selectedRoles,
        permissions: rolePermissions,
      };
      setUserPermissions(updatedUser);
      setIsOpen(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      test_manager: 'bg-blue-100 text-blue-800',
      qa_engineer: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!userPermissions) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (open) {
          // Reset selectedRoles when dialog opens
          setSelectedRoles(userPermissions?.roles || []);
        }
      }}
    >
      <DialogTrigger asChild>
        <div
          role="button"
          className="hover:bg-accent focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          onClick={() => setIsOpen(true)}
        >
          <Shield className="mr-2 h-4 w-4" />
          <span>Permissions</span>
        </div>
      </DialogTrigger>
      <DialogContent className="flex h-[50vh] !w-[80vw] !max-w-[80vw] flex-col bg-gradient-to-br from-white to-gray-50 p-0 sm:!max-w-[80vw]">
        <DialogHeader className="shrink-0 border-b border-gray-200 px-4 pb-3 pt-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Settings className="h-5 w-5" />
            User Permissions Management
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-gray-700">
            Configure user roles and permissions for system access control
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-4">
          <div className="h-full space-y-3 overflow-y-auto">
            {/* Current User Info */}
            <Card>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {userPermissions.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        User ID: {userPermissions.userId}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {userPermissions.roles.map(role => (
                      <Badge
                        key={role}
                        className={`${getRoleBadgeColor(role)} px-2 py-1 text-xs`}
                      >
                        {role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Two Column Layout */}
            <div className="grid flex-1 grid-cols-2 gap-4">
              {/* Left Column - Role Selection */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">User Roles</CardTitle>
                  <CardDescription className="text-sm">
                    Select roles for combined permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Admin Role */}
                    <div className="flex items-center space-x-2 rounded-lg border p-2 transition-colors hover:bg-gray-50">
                      <Checkbox
                        id="role-admin"
                        checked={selectedRoles.includes('admin')}
                        onCheckedChange={checked =>
                          handleRoleToggle('admin', checked as boolean)
                        }
                        className="data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="role-admin"
                          className="cursor-pointer font-medium text-red-700"
                        >
                          🛡️ Admin
                        </label>
                        <p className="text-xs text-gray-600">
                          Full control + Delete
                        </p>
                      </div>
                    </div>

                    {/* Test Manager Role */}
                    <div className="flex items-center space-x-2 rounded-lg border p-2 transition-colors hover:bg-gray-50">
                      <Checkbox
                        id="role-test-manager"
                        checked={selectedRoles.includes('test_manager')}
                        onCheckedChange={checked =>
                          handleRoleToggle('test_manager', checked as boolean)
                        }
                        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="role-test-manager"
                          className="cursor-pointer font-medium text-blue-700"
                        >
                          📊 Test Manager
                        </label>
                        <p className="text-xs text-gray-600">
                          Create, Edit, Export
                        </p>
                      </div>
                    </div>

                    {/* QA Engineer Role */}
                    <div className="flex items-center space-x-2 rounded-lg border p-2 transition-colors hover:bg-gray-50">
                      <Checkbox
                        id="role-qa-engineer"
                        checked={selectedRoles.includes('qa_engineer')}
                        onCheckedChange={checked =>
                          handleRoleToggle('qa_engineer', checked as boolean)
                        }
                        className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="role-qa-engineer"
                          className="cursor-pointer font-medium text-green-700"
                        >
                          🔧 QA Engineer
                        </label>
                        <p className="text-xs text-gray-600">
                          Create & Edit Tests
                        </p>
                      </div>
                    </div>

                    {/* Viewer Role */}
                    <div className="flex items-center space-x-2 rounded-lg border p-2 transition-colors hover:bg-gray-50">
                      <Checkbox
                        id="role-viewer"
                        checked={selectedRoles.includes('viewer')}
                        onCheckedChange={checked =>
                          handleRoleToggle('viewer', checked as boolean)
                        }
                        className="data-[state=checked]:border-gray-600 data-[state=checked]:bg-gray-600"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="role-viewer"
                          className="cursor-pointer font-medium text-gray-700"
                        >
                          👁️ Viewer
                        </label>
                        <p className="text-xs text-gray-600">
                          View & Export Only
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role Permissions Summary */}
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Selected Permissions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoles.includes('admin') && (
                        <>
                          <Badge className="bg-red-100 text-red-700">
                            Delete
                          </Badge>
                          <Badge className="bg-red-100 text-red-700">
                            Edit All
                          </Badge>
                          <Badge className="bg-red-100 text-red-700">
                            Create All
                          </Badge>
                        </>
                      )}
                      {selectedRoles.includes('test_manager') && (
                        <>
                          <Badge className="bg-blue-100 text-blue-700">
                            Create
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700">
                            Edit
                          </Badge>
                        </>
                      )}
                      {selectedRoles.includes('qa_engineer') && (
                        <>
                          <Badge className="bg-green-100 text-green-700">
                            Create Tests
                          </Badge>
                          <Badge className="bg-green-100 text-green-700">
                            Edit Tests
                          </Badge>
                        </>
                      )}
                      {(selectedRoles.includes('viewer') ||
                        selectedRoles.length > 0) && (
                        <>
                          <Badge className="bg-gray-100 text-gray-700">
                            View
                          </Badge>
                          <Badge className="bg-gray-100 text-gray-700">
                            Export
                          </Badge>
                        </>
                      )}
                      {selectedRoles.length === 0 && (
                        <span className="text-sm text-gray-500">
                          No roles selected
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column - Permissions Matrix */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Permissions Matrix
                  </CardTitle>
                  <CardDescription>
                    Overview of what each role can do
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="py-1 text-left font-medium">Action</th>
                          <th className="px-1 py-1 text-center">Admin</th>
                          <th className="px-1 py-1 text-center">Manager</th>
                          <th className="px-1 py-1 text-center">QA Eng</th>
                          <th className="px-1 py-1 text-center">Viewer</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-1">View Tests & Data</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1">Export</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1">Create Tests</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">❌</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1">Edit Tests</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">❌</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1">Create Test Data</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">❌</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1">Edit Test Data</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">❌</td>
                          <td className="text-center">❌</td>
                        </tr>
                        <tr className="border-b bg-red-50">
                          <td className="py-1 font-medium">Delete Tests</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">❌</td>
                          <td className="text-center">❌</td>
                          <td className="text-center">❌</td>
                        </tr>
                        <tr className="bg-red-50">
                          <td className="py-1 font-medium">Delete Test Data</td>
                          <td className="text-center">✅</td>
                          <td className="text-center">❌</td>
                          <td className="text-center">❌</td>
                          <td className="text-center">❌</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1" size="sm">
                <Shield className="mr-2 h-4 w-4" />
                Save Permissions
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
