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
import { Button } from './ui/button';
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
  activeTab: string;
  onTabChange: (tab: string) => void;
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
  activeTab,
  onTabChange,
}: HeaderProps) {
  const ProfileIcon = profileIcons[user.profile];

  const menuItems = [
    {
      id: 'tests',
      label: 'Tests Inventory',
      icon: <TestTube className="h-5 w-5" />,
    },
    {
      id: 'testdata',
      label: 'Test Data Inventory',
      icon: <Package className="h-5 w-5" />,
    },
    {
      id: 'execution',
      label: 'Execution Builder',
      icon: <Cog className="h-5 w-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div className="mx-auto flex w-[90%] items-center justify-between">
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
        </div>

        <div className="flex items-center gap-6">
          {menuItems.map(item => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex items-center gap-2 text-gray-600 hover:text-primary',
                activeTab === item.id &&
                  'border-b-2 border-primary font-semibold text-primary'
              )}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <PermissionsManager />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    className={cn(
                      'font-bold',
                      profileColors[user.profile] || 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="font-medium">{user.name}</p>
                  <Badge
                    className={cn(
                      'mt-1 px-2 py-0.5 text-xs font-semibold',
                      profileColors[user.profile] || 'bg-gray-100 text-gray-800'
                    )}
                  >
                    <ProfileIcon className="mr-1 h-3 w-3" />
                    {user.profile}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
