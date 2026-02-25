import { useEffect, useState } from 'react';

import {
  Edit,
  Eye,
  EyeOff,
  Key,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { configService, UserConfig } from '../../services/configService';
import { UserProfile } from '../Login';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button, buttonVariants } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { cn } from '../ui/utils';

interface AppUser {
  id: string;
  username: string;
  email: string;
  profile: UserProfile;
  roles: string[]; // Added roles field
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

interface NewUser {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  profile: UserProfile;
  roles: string[]; // Added roles field
}

interface PasswordChange {
  userId: string;
  newPassword: string;
  confirmPassword: string;
}

// Mock data - in real app, this would come from API
const initialUsers: AppUser[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@testing.com',
    profile: 'admin',
    roles: ['admin'], // Admin has all permissions
    createdAt: '2025-01-01T00:00:00Z',
    lastLogin: '2025-08-21T10:30:00Z',
    isActive: true,
  },
  {
    id: '2',
    username: 'qa_lead',
    email: 'qa.lead@testing.com',
    profile: 'automation',
    roles: ['test_manager'],
    createdAt: '2025-02-15T00:00:00Z',
    lastLogin: '2025-08-20T16:45:00Z',
    isActive: true,
  },
  {
    id: '3',
    username: 'dev_user',
    email: 'developer@testing.com',
    profile: 'dev',
    roles: ['qa_engineer'],
    createdAt: '2025-03-10T00:00:00Z',
    lastLogin: '2025-08-19T14:22:00Z',
    isActive: true,
  },
  {
    id: '4',
    username: 'product_owner',
    email: 'product@testing.com',
    profile: 'product',
    roles: ['viewer'],
    createdAt: '2025-04-05T00:00:00Z',
    lastLogin: '2025-08-18T09:15:00Z',
    isActive: false,
  },
];

export function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

  // Load user configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await configService.loadUserConfig();
        setUserConfig(config);
      } catch (error) {
        console.error('Failed to load user configuration:', error);
      }
    };

    loadConfig();
  }, []);

  // Form states
  const [newUser, setNewUser] = useState<NewUser>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profile: 'dev',
    roles: ['qa_engineer'], // Default role
  });

  const [editUser, setEditUser] = useState<Partial<AppUser>>({});
  const [passwordChange, setPasswordChange] = useState<PasswordChange>({
    userId: '',
    newPassword: '',
    confirmPassword: '',
  });

  const getProfileBadge = (profile: UserProfile) => {
    if (!userConfig) return null;

    const profileConfig = configService.getUserProfileConfig(
      profile,
      userConfig.userProfiles
    );
    if (!profileConfig) return null;

    return (
      <Badge
        className={`${profileConfig.badgeStyle.bgColor} ${profileConfig.badgeStyle.textColor}`}
      >
        <span className="mr-1">{profileConfig.icon}</span>
        {profileConfig.label}
      </Badge>
    );
  };

  const resetForms = () => {
    setNewUser({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      profile: 'dev',
      roles: ['qa_engineer'],
    });
    setEditUser({});
    setPasswordChange({
      userId: '',
      newPassword: '',
      confirmPassword: '',
    });
    setSelectedUser(null);
  };

  const getMessage = (
    messageKey: string,
    variables: Record<string, string> = {}
  ) => {
    if (!userConfig) return messageKey;
    const message =
      userConfig.userManagement.messages[messageKey] || messageKey;
    return configService.interpolateMessage(message, variables);
  };

  const handleCreateUser = () => {
    // Validation
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error(getMessage('allFieldsRequired'));
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      toast.error(getMessage('passwordsDoNotMatch'));
      return;
    }

    if (users.some(u => u.username === newUser.username)) {
      toast.error(getMessage('usernameExists'));
      return;
    }

    if (users.some(u => u.email === newUser.email)) {
      toast.error(getMessage('emailExists'));
      return;
    }

    const user: AppUser = {
      id: Date.now().toString(),
      username: newUser.username,
      email: newUser.email,
      profile: newUser.profile,
      roles: newUser.roles, // Include roles as-is
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    setUsers([...users, user]);
    toast.success(getMessage('userCreated', { username: newUser.username }));
    setIsCreateDialogOpen(false);
    resetForms();
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    // Validation
    if (!editUser.username || !editUser.email) {
      toast.error(getMessage('allFieldsRequired'));
      return;
    }

    if (
      users.some(
        u => u.id !== selectedUser.id && u.username === editUser.username
      )
    ) {
      toast.error(getMessage('usernameExists'));
      return;
    }

    if (
      users.some(u => u.id !== selectedUser.id && u.email === editUser.email)
    ) {
      toast.error(getMessage('emailExists'));
      return;
    }

    setUsers(
      users.map(u => (u.id === selectedUser.id ? { ...u, ...editUser } : u))
    );

    toast.success(
      getMessage('userUpdated', { username: editUser.username || '' })
    );
    setIsEditDialogOpen(false);
    resetForms();
  };

  const handleDeleteUser = (user: AppUser) => {
    if (
      user.profile === 'admin' &&
      users.filter(u => u.profile === 'admin' && u.isActive).length === 1
    ) {
      toast.error(getMessage('cannotDeleteLastAdmin'));
      return;
    }

    setUsers(users.filter(u => u.id !== user.id));
    toast.success(getMessage('userDeleted', { username: user.username }));
  };

  const handleToggleUserStatus = (user: AppUser) => {
    if (
      user.profile === 'admin' &&
      user.isActive &&
      users.filter(u => u.profile === 'admin' && u.isActive).length === 1
    ) {
      toast.error(getMessage('cannotDeactivateLastAdmin'));
      return;
    }

    setUsers(
      users.map(u => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
    );

    const messageKey = user.isActive ? 'userDeactivated' : 'userActivated';
    toast.success(getMessage(messageKey, { username: user.username }));
  };

  const handleChangePassword = () => {
    if (!passwordChange.newPassword || !passwordChange.confirmPassword) {
      toast.error(getMessage('allFieldsRequired'));
      return;
    }

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast.error(getMessage('passwordsDoNotMatch'));
      return;
    }

    if (passwordChange.newPassword.length < 6) {
      toast.error(getMessage('passwordTooShort'));
      return;
    }

    const user = users.find(u => u.id === passwordChange.userId);
    if (user) {
      toast.success(getMessage('passwordChanged', { username: user.username }));
      setIsPasswordDialogOpen(false);
      resetForms();
    }
  };

  const openEditDialog = (user: AppUser) => {
    setSelectedUser(user);
    setEditUser({
      username: user.username,
      email: user.email,
      profile: user.profile,
      roles: user.roles || [], // Include roles
      isActive: user.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openPasswordDialog = (user: AppUser) => {
    setSelectedUser(user);
    setPasswordChange({
      userId: user.id,
      newPassword: '',
      confirmPassword: '',
    });
    setIsPasswordDialogOpen(true);
  };

  // Filter users by email search
  const filteredUsers = users.filter(user => {
    const matchesEmail =
      searchEmail === '' ||
      user.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
      user.username.toLowerCase().includes(searchEmail.toLowerCase());
    return matchesEmail;
  });

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const icons = {
      Users,
      UserCheck,
      Shield,
    };
    return icons[iconName as keyof typeof icons] || Users;
  };

  if (!userConfig) {
    return (
      <div className="space-y-6">
        <div>Loading user configuration...</div>
      </div>
    );
  }

  const config = userConfig.userManagement;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2 shadow-sm ring-1 ring-blue-100/50">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              {config.title}
            </h2>
            <p className="mt-2 text-gray-500">{config.description}</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {config.buttons.newUser}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {config.statCards.map(stat => {
          const IconComponent = getIconComponent(stat.icon);
          let count = 0;

          switch (stat.id) {
            case 'total':
              count = users.length;
              break;
            case 'active':
              count = users.filter(u => u.isActive).length;
              break;
            case 'administrators':
              count = users.filter(u => u.profile === 'admin').length;
              break;
            case 'inactive':
              count = users.filter(u => !u.isActive).length;
              break;
          }

          return (
            <Card key={stat.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {stat.label}
                    </p>
                    <p className="text-lg font-semibold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder={config.searchPlaceholder}
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>
                Showing {filteredUsers.length} of {users.length} users
              </span>
            </div>
            {searchEmail && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchEmail('')}
              >
                {config.buttons.clearSearch}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {config.tableHeaders.map((header, index) => (
                  <TableHead
                    key={index}
                    className={
                      index === config.tableHeaders.length - 1
                        ? 'text-right'
                        : ''
                    }
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-muted-foreground text-xs">
                        ID: {user.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{getProfileBadge(user.profile)}</div>
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map(role => (
                          <Badge
                            key={role}
                            variant="outline"
                            className={
                              role === 'admin'
                                ? 'border-red-200 text-red-600'
                                : role === 'test_manager'
                                  ? 'border-blue-200 text-blue-600'
                                  : role === 'qa_engineer'
                                    ? 'border-green-200 text-green-600'
                                    : 'border-gray-200 text-gray-600'
                            }
                          >
                            {role.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Never'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPasswordDialog(user)}
                      >
                        <Key className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleUserStatus(user)}
                      >
                        <UserCheck className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' })
                          )}
                          disabled={
                            user.profile === 'admin' &&
                            users.filter(
                              u => u.profile === 'admin' && u.isActive
                            ).length === 1
                          }
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {config.dialogs.confirmDelete.title}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {configService.interpolateMessage(
                                config.dialogs.confirmDelete.description,
                                { username: user.username }
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {config.buttons.cancel}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {config.buttons.delete}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{config.dialogs.create.title}</DialogTitle>
            <DialogDescription>
              {config.dialogs.create.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{config.formLabels.username}</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={e =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                placeholder={config.placeholders.username}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{config.formLabels.email}</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={e =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder={config.placeholders.email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{config.formLabels.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  onChange={e =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder={config.placeholders.password}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <Eye className="text-muted-foreground h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {config.formLabels.confirmPassword}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={newUser.confirmPassword}
                  onChange={e =>
                    setNewUser({ ...newUser, confirmPassword: e.target.value })
                  }
                  placeholder={config.placeholders.confirmPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <Eye className="text-muted-foreground h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile">{config.formLabels.profile}</Label>
              <Select
                value={newUser.profile}
                onValueChange={value =>
                  setNewUser({ ...newUser, profile: value as UserProfile })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userConfig.userProfiles.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-muted-foreground text-xs">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              {config.buttons.cancel}
            </Button>
            <Button onClick={handleCreateUser}>{config.buttons.create}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{config.dialogs.edit.title}</DialogTitle>
            <DialogDescription>
              {configService.interpolateMessage(
                config.dialogs.edit.description + ' {username}',
                { username: selectedUser?.username || '' }
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">
                {config.formLabels.username}
              </Label>
              <Input
                id="edit-username"
                value={editUser.username || ''}
                onChange={e =>
                  setEditUser({ ...editUser, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{config.formLabels.email}</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email || ''}
                onChange={e =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-profile">{config.formLabels.profile}</Label>
              <Select
                value={editUser.profile}
                onValueChange={value => {
                  setEditUser({ ...editUser, profile: value as UserProfile });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userConfig.userProfiles.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-muted-foreground text-xs">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Multi-role selection */}
            <div className="space-y-2">
              <Label>Permission Roles</Label>
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="edit-role-admin"
                    checked={editUser.roles?.includes('admin') || false}
                    onCheckedChange={checked => {
                      const currentRoles = editUser.roles || [];
                      const newRoles = checked
                        ? [...currentRoles.filter(r => r !== 'admin'), 'admin']
                        : currentRoles.filter(r => r !== 'admin');
                      setEditUser({ ...editUser, roles: newRoles });
                    }}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="edit-role-admin"
                      className="cursor-pointer text-sm font-medium"
                    >
                      Admin
                    </label>
                    <p className="text-muted-foreground text-xs">
                      Full access including delete permissions
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="edit-role-test-manager"
                    checked={editUser.roles?.includes('test_manager') || false}
                    onCheckedChange={checked => {
                      const currentRoles = editUser.roles || [];
                      const newRoles = checked
                        ? [
                            ...currentRoles.filter(r => r !== 'test_manager'),
                            'test_manager',
                          ]
                        : currentRoles.filter(r => r !== 'test_manager');
                      setEditUser({ ...editUser, roles: newRoles });
                    }}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="edit-role-test-manager"
                      className="cursor-pointer text-sm font-medium"
                    >
                      Test Manager
                    </label>
                    <p className="text-muted-foreground text-xs">
                      Can manage tests and data
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="edit-role-qa-engineer"
                    checked={editUser.roles?.includes('qa_engineer') || false}
                    onCheckedChange={checked => {
                      const currentRoles = editUser.roles || [];
                      const newRoles = checked
                        ? [
                            ...currentRoles.filter(r => r !== 'qa_engineer'),
                            'qa_engineer',
                          ]
                        : currentRoles.filter(r => r !== 'qa_engineer');
                      setEditUser({ ...editUser, roles: newRoles });
                    }}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="edit-role-qa-engineer"
                      className="cursor-pointer text-sm font-medium"
                    >
                      QA Engineer
                    </label>
                    <p className="text-muted-foreground text-xs">
                      Can create and edit tests
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="edit-role-viewer"
                    checked={editUser.roles?.includes('viewer') || false}
                    onCheckedChange={checked => {
                      const currentRoles = editUser.roles || [];
                      const newRoles = checked
                        ? [
                            ...currentRoles.filter(r => r !== 'viewer'),
                            'viewer',
                          ]
                        : currentRoles.filter(r => r !== 'viewer');
                      setEditUser({ ...editUser, roles: newRoles });
                    }}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="edit-role-viewer"
                      className="cursor-pointer text-sm font-medium"
                    >
                      Viewer
                    </label>
                    <p className="text-muted-foreground text-xs">
                      Read-only access
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {config.buttons.cancel}
            </Button>
            <Button onClick={handleEditUser}>{config.buttons.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{config.dialogs.changePassword.title}</DialogTitle>
            <DialogDescription>
              {configService.interpolateMessage(
                config.dialogs.changePassword.description + ' {username}',
                { username: selectedUser?.username || '' }
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">
                {config.formLabels.newPassword}
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordChange.newPassword}
                  onChange={e =>
                    setPasswordChange({
                      ...passwordChange,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder={config.placeholders.newPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <Eye className="text-muted-foreground h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">
                {config.formLabels.confirmPassword}
              </Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordChange.confirmPassword}
                  onChange={e =>
                    setPasswordChange({
                      ...passwordChange,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder={config.placeholders.confirmNewPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <Eye className="text-muted-foreground h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
            >
              {config.buttons.cancel}
            </Button>
            <Button onClick={handleChangePassword}>
              {config.buttons.changePassword}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
