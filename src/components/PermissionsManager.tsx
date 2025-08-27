import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Settings, Shield, User } from 'lucide-react';
import { usePermissions, UserPermissions, getPermissionsFromRoles } from '../contexts/PermissionsContext';

export function PermissionsManager() {
  const { userPermissions, setUserPermissions } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(userPermissions?.roles || ['qa_engineer']);

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
        permissions: rolePermissions
      };
      setUserPermissions(updatedUser);
      setIsOpen(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'test_manager': 'bg-blue-100 text-blue-800',
      'qa_engineer': 'bg-green-100 text-green-800',
      'viewer': 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };


  if (!userPermissions) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) {
        // Reset selectedRoles when dialog opens
        setSelectedRoles(userPermissions?.roles || []);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="w-4 h-4 mr-2" />
          Permissions
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[90vh] !w-[50vw] !max-w-[50vw] flex-col bg-gradient-to-br from-white to-gray-50 p-0 sm:!max-w-[50vw]">
        <DialogHeader className="shrink-0 border-b border-gray-200 px-6 pb-4 pt-6">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            User Permissions Management
          </DialogTitle>
          <DialogDescription className="text-lg font-medium text-gray-700">
            Configure user roles and permissions for system access control
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full overflow-y-auto space-y-6">
            
            {/* Current User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Current User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{userPermissions.username}</div>
                    <div className="text-sm text-gray-500">User ID: {userPermissions.userId}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {userPermissions.roles.map(role => (
                      <Badge key={role} className={getRoleBadgeColor(role)}>
                        {role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Simplified Role Selection */}
            <Card>
              <CardHeader>
                <CardTitle>User Roles</CardTitle>
                <CardDescription>
                  Select the user's roles. Multiple roles can be assigned for combined permissions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Admin Role */}
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id="role-admin"
                      checked={selectedRoles.includes('admin')}
                      onCheckedChange={(checked) => handleRoleToggle('admin', checked as boolean)}
                      className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="role-admin" className="font-medium cursor-pointer text-red-700">
                        🛡️ Admin
                      </label>
                      <p className="text-xs text-gray-600 mt-1">Full system control + Delete</p>
                    </div>
                  </div>

                  {/* Test Manager Role */}
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id="role-test-manager"
                      checked={selectedRoles.includes('test_manager')}
                      onCheckedChange={(checked) => handleRoleToggle('test_manager', checked as boolean)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="role-test-manager" className="font-medium cursor-pointer text-blue-700">
                        📊 Test Manager
                      </label>
                      <p className="text-xs text-gray-600 mt-1">Create, Edit, Export</p>
                    </div>
                  </div>

                  {/* QA Engineer Role */}
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id="role-qa-engineer"
                      checked={selectedRoles.includes('qa_engineer')}
                      onCheckedChange={(checked) => handleRoleToggle('qa_engineer', checked as boolean)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="role-qa-engineer" className="font-medium cursor-pointer text-green-700">
                        🔧 QA Engineer
                      </label>
                      <p className="text-xs text-gray-600 mt-1">Create & Edit Tests</p>
                    </div>
                  </div>

                  {/* Viewer Role */}
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id="role-viewer"
                      checked={selectedRoles.includes('viewer')}
                      onCheckedChange={(checked) => handleRoleToggle('viewer', checked as boolean)}
                      className="data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="role-viewer" className="font-medium cursor-pointer text-gray-700">
                        👁️ Viewer
                      </label>
                      <p className="text-xs text-gray-600 mt-1">View & Export Only</p>
                    </div>
                  </div>
                </div>
                
                {/* Role Permissions Summary */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Permissions:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoles.includes('admin') && (
                      <>
                        <Badge className="bg-red-100 text-red-700">Delete</Badge>
                        <Badge className="bg-red-100 text-red-700">Edit All</Badge>
                        <Badge className="bg-red-100 text-red-700">Create All</Badge>
                      </>
                    )}
                    {selectedRoles.includes('test_manager') && (
                      <>
                        <Badge className="bg-blue-100 text-blue-700">Create</Badge>
                        <Badge className="bg-blue-100 text-blue-700">Edit</Badge>
                      </>
                    )}
                    {selectedRoles.includes('qa_engineer') && (
                      <>
                        <Badge className="bg-green-100 text-green-700">Create Tests</Badge>
                        <Badge className="bg-green-100 text-green-700">Edit Tests</Badge>
                      </>
                    )}
                    {(selectedRoles.includes('viewer') || selectedRoles.length > 0) && (
                      <>
                        <Badge className="bg-gray-100 text-gray-700">View</Badge>
                        <Badge className="bg-gray-100 text-gray-700">Export</Badge>
                      </>
                    )}
                    {selectedRoles.length === 0 && (
                      <span className="text-sm text-gray-500">No roles selected</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permissions Overview */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Permissions Matrix</CardTitle>
                <CardDescription>
                  Overview of what each role can do
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Action</th>
                        <th className="text-center px-2 py-2">Admin</th>
                        <th className="text-center px-2 py-2">Manager</th>
                        <th className="text-center px-2 py-2">QA Eng</th>
                        <th className="text-center px-2 py-2">Viewer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">View Tests & Data</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Export</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Create Tests</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">❌</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Edit Tests</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">❌</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Create Test Data</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">❌</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Edit Test Data</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">❌</td>
                        <td className="text-center">❌</td>
                      </tr>
                      <tr className="border-b bg-red-50">
                        <td className="py-2 font-medium">Delete Tests</td>
                        <td className="text-center">✅</td>
                        <td className="text-center">❌</td>
                        <td className="text-center">❌</td>
                        <td className="text-center">❌</td>
                      </tr>
                      <tr className="bg-red-50">
                        <td className="py-2 font-medium">Delete Test Data</td>
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


            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button onClick={handleSave} className="flex-1">
                <Shield className="w-4 h-4 mr-2" />
                Save Permissions
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}