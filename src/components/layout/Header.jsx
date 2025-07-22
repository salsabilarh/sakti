import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';

function Header({ onToggleMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center lg:pl-72 sm:px-6 md:px-8">
      {/* Tombol Menu untuk Mobile */}
      <button className="lg:hidden text-gray-700" onClick={onToggleMobile} aria-label="Toggle Menu">
        <Menu className="w-6 h-6" />
      </button>

      {/* Bagian kanan: Dropdown Akun */}
      <div className="flex items-center space-x-4 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 focus:outline-none"
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-700 truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                {user?.full_name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/edit-profile')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Header;
