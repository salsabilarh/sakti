import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Briefcase, FolderDown, ShieldCheck, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, ROLES } from '@/contexts/AuthContext';

const navConfig = {
  [ROLES.ADMIN]: ['Dashboard', 'Daftar Layanan', 'Marketing Kit', 'Admin Panel'],
  [ROLES.MANAJEMEN]: ['Dashboard', 'Daftar Layanan', 'Marketing Kit'],
  [ROLES.PDO]: ['Dashboard', 'Daftar Layanan', 'Marketing Kit'],
  [ROLES.VIEWER]: ['Dashboard', 'Daftar Layanan'],
};

const allNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Daftar Layanan', href: '/daftar-jasa', icon: Briefcase },
  { name: 'Marketing Kit', href: '/marketing-kit', icon: FolderDown },
  { name: 'Admin Panel', href: '/admin', icon: ShieldCheck },
];

function Sidebar({ isMobileOpen, onToggleMobile }) {
  const location = useLocation();
  const { user } = useAuth();
  const userNav = user?.role && navConfig[user.role] ? navConfig[user.role] : [];
  const visibleNavigation = allNavigation.filter(item => userNav.includes(item.name));

  const sidebarContent = (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-2">
          <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/7e0684c8-f8f8-4241-a5d6-e17a7b2d1451/141feff6f242f1707b20096e0e33b90c.png" alt="SAKTI Logo" className="h-8" />
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
              onClick={onToggleMobile}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-blue-50 rounded-lg"
                  layoutId="sidebar-active"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn('w-5 h-5 relative z-10', isActive ? 'text-[#000476]' : 'text-gray-400')} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <div className={cn("lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity", isMobileOpen ? "block" : "hidden")} onClick={onToggleMobile}></div>

      {/* Mobile Sidebar */}
      <div className={cn("lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300", isMobileOpen ? "translate-x-0" : "-translate-x-full")}>
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:h-full lg:fixed">
        {sidebarContent}
      </div>
    </>
  );
}

export default Sidebar;
