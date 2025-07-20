import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar.jsx';
import Header from '@/components/layout/Header.jsx';

function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <motion.main 
          className="flex-1 overflow-auto p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

export default DashboardLayout;