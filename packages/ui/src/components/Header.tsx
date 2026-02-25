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

import { Lob, User as UserType } from '../services/types';
import { LOB_VALUES, useLobStore } from '../stores/lobStore';

import { PermissionsManager } from './configuration/PermissionsManager';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
  const activeLob = useLobStore(s => s.activeLob);
  const setActiveLob = useLobStore(s => s.setActiveLob);
  const isAdmin = useLobStore(s => s.isAdmin);

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
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md">
      <div className="mx-auto w-[90%] space-y-4">
        {/* Title Section - Top Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200 ring-1 ring-black/5">
              <TestTube className="h-6 w-6" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
                Test Inventory System
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Comprehensive management of Test Cases, Test Data and Executions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50/50 px-3 py-1.5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                LOB
              </span>
              {isAdmin ? (
                <Select
                  value={activeLob}
                  onValueChange={value => setActiveLob(value as Lob | 'all')}
                >
                  <SelectTrigger className="h-8 w-40 border-0 bg-transparent shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All LOBs</SelectItem>
                    {LOB_VALUES.map(lob => (
                      <SelectItem key={lob} value={lob}>
                        {lob}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  variant="secondary"
                  className="px-2 py-0.5 text-xs font-medium"
                >
                  {activeLob}
                </Badge>
              )}
            </div>

            <div className="h-8 w-px bg-gray-200"></div>

            <PermissionsManager />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-10 items-center gap-3 rounded-full pl-2 pr-4 hover:bg-gray-100"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8 shadow-sm ring-2 ring-white">
                    <AvatarFallback
                      className={cn(
                        'text-sm font-bold',
                        profileColors[user.profile] ||
                          'bg-gray-100 text-gray-800'
                      )}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-semibold text-gray-700 sm:block">
                    {user.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-xl p-2 shadow-lg">
                <div className="mb-2 rounded-lg bg-gray-50 p-3">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <ProfileIcon className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs font-medium capitalize text-gray-600">
                      {user.profile.replace('_', ' ')}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-medium text-gray-600">
                      {user.lob}
                    </span>
                  </div>
                </div>
                <DropdownMenuItem className="cursor-pointer rounded-md">
                  <User className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="font-medium">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onTabChange('settings')}
                  className="cursor-pointer rounded-md"
                >
                  <Settings className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="font-medium">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer rounded-md text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation and Menu - Bottom Row */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              disabled={!canGoBack}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
              title="Go back"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onForward}
              disabled={!canGoForward}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
              title="Go forward"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-200"></div>

          <nav className="flex items-center gap-1.5 rounded-2xl border border-gray-200/80 bg-gray-100/50 p-1.5 shadow-inner backdrop-blur-sm">
            {menuItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'group relative flex items-center gap-2.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    isActive
                      ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-500 hover:bg-white/60 hover:text-gray-900'
                  )}
                >
                  <span
                    className={cn(
                      'transition-transform duration-300',
                      isActive
                        ? 'scale-110 text-blue-600'
                        : 'text-gray-400 group-hover:scale-105 group-hover:text-gray-500'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
