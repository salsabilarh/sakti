import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, UserCheck, Upload, Plus, Download, GitPullRequest } from 'lucide-react';
import { useAuth, ROLES } from '@/contexts/AuthContext.jsx';
import AdminStats from '@/components/admin/AdminStats.jsx';
import UsersManagement from '@/components/admin/UsersManagement.jsx';
import WaitingUsers from '@/components/admin/WaitingUsers.jsx';
import DownloadLogs from '@/components/admin/DownloadLogs.jsx';
import { mockUsers, mockDownloadLogs, mockWaitingUsers } from '@/components/admin/mockData.js';
import UnitChangeRequests from '@/components/admin/UnitChangeRequests.jsx';
import UploadFile from '@/components/admin/UploadFile.jsx';
import AddService from '@/components/admin/AddService.jsx';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  const TABS = [
    { id: 'users', label: 'Management User', icon: Users, component: UsersManagement },
    { id: 'waiting', label: 'Pending Users', icon: UserCheck, component: WaitingUsers },
    { id: 'unitChange', label: 'Pending Unit Change', icon: GitPullRequest, component: UnitChangeRequests },
    // { id: 'upload', label: 'Upload File', icon: Upload, component: UploadFile },
    // { id: 'services', label: 'Tambah Layanan', icon: Plus, component: AddService },
    { id: 'logs', label: 'Log Download', icon: Download, component: DownloadLogs },
  ];

  if (user?.role !== ROLES.ADMIN) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h2>
        <p className="text-gray-600">Anda tidak memiliki akses ke halaman admin.</p>
      </div>
    );
  }

  const activeTabData = TABS.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <>
      <Helmet>
        <title>Admin Panel - SAKTI Platform</title>
        <meta name="description" content="Administrative dashboard for managing users, services, and download logs" />
      </Helmet>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">
            Kelola pengguna, layanan, dan monitor aktivitas download
          </p>
        </motion.div>

        <AdminStats 
          usersCount={mockUsers.length} 
          pendingUsersCount={mockWaitingUsers.length}
          activeUsersCount={mockUsers.filter(u => u.status === 'Active').length}
          logsCount={mockDownloadLogs.length} 
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-[#000476] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {ActiveComponent && <ActiveComponent />}
        </motion.div>
      </div>
    </>
  );
}

export default AdminPanel;