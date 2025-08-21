import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { TestTube, LogOut, User, Settings, Code, Cog, Package, Shield } from 'lucide-react';
import { User as UserType, UserProfile } from './Login';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
}

const profileIcons = {
  dev: Code,
  automation: Cog,
  product: Package,
  admin: Shield
};

const profileColors = {
  dev: 'bg-blue-100 text-blue-800',
  automation: 'bg-green-100 text-green-800',
  product: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800'
};

export function Header({ user, onLogout }: HeaderProps) {
  const ProfileIcon = profileIcons[user.profile];

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <TestTube className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Sistema de Inventario de Testing
              </h1>
              <p className="text-sm text-gray-600">
                Gestión integral de Test Cases, Test Data y Ejecuciones
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Bienvenido,</span>
            <span className="font-medium">{user.name}</span>
            <Badge className={profileColors[user.profile]}>
              <ProfileIcon className="w-3 h-3 mr-1" />
              {user.profile.toUpperCase()}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
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
                <span>Mi Perfil</span>
              </DropdownMenuItem>
              {user.profile === 'admin' && (
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuraciones</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}