
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  List, 
  Download, 
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, ROLES } from '@/contexts/AuthContext';

const navConfig = {
  [ROLES.ADMIN]: ['Dashboard', 'Daftar Jasa', 'Marketing Kit', 'Admin Panel'],
  [ROLES.MANAJEMEN]: ['Dashboard', 'Daftar Jasa', 'Marketing Kit'],
  [ROLES.PDO]: ['Dashboard', 'Daftar Jasa', 'Marketing Kit'],
  [ROLES.VIEWER]: ['Daftar Jasa'],
};

const allNavigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Daftar Jasa', href: '/daftar-jasa', icon: List },
  { name: 'Marketing Kit', href: '/marketing-kit', icon: Download },
  { name: 'Admin Panel', href: '/admin', icon: Settings },
];

function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const userNav = navConfig[user?.role] || [];
  const visibleNavigation = allNavigation.filter(item => userNav.includes(item.name));

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-2">
          <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/7e0684c8-f8f8-4241-a5d6-e17a7b2d1451/141feff6f242f1707b20096e0e33b90c.png" alt="SAKTI Logo" className="h-8" />
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {visibleNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-blue-50 text-[#000476]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-blue-50 rounded-lg"
                  layoutId="sidebar-active"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn(
                'w-5 h-5 relative z-10',
                isActive ? 'text-[#000476]' : 'text-gray-400'
              )} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
