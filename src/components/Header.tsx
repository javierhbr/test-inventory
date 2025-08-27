import {
  ChevronLeft,
  ChevronRight,
  Code,
  Cog,
  LogOut,
  Package,
  Settings,
  Shield,
  TestTube,
  User,
} from 'lucide-react';

import { User as UserType } from './Login';
import { PermissionsManager } from './PermissionsManager';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button, buttonVariants } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from './ui/utils';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
}

const profileIcons = {
  dev: Code,
  automation: Cog,
  product: Package,
  qa_engineer: TestTube,
  admin: Shield,
};

const profileColors = {
  dev: 'bg-blue-100 text-blue-800',
  automation: 'bg-green-100 text-green-800',
  product: 'bg-purple-100 text-purple-800',
  qa_engineer: 'bg-orange-100 text-orange-800',
  admin: 'bg-red-100 text-red-800',
};

export function Header({
  user,
  onLogout,
  onBack,
  onForward,
  canGoBack = false,
  canGoForward = false,
}: HeaderProps) {
  const ProfileIcon = profileIcons[user.profile];

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              disabled={!canGoBack}
              className="h-8 w-8"
              title="Go back"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onForward}
              disabled={!canGoForward}
              className="h-8 w-8"
              title="Go forward"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <TestTube className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Testing Inventory System
              </h1>
              <p className="text-sm text-gray-600">
                Comprehensive management of Test Cases, Test Data, and
                Executions
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <PermissionsManager />

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Welcome,</span>
            <span className="font-medium">{user.name}</span>
            <Badge className={profileColors[user.profile]}>
              <ProfileIcon className="mr-1 h-3 w-3" />
              {user.profile.toUpperCase()}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'relative h-8 w-8 rounded-full'
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.profile}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              {user.profile === 'admin' && (
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
