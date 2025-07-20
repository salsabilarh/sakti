import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function AdminStats({ usersCount, pendingUsersCount, activeUsersCount, logsCount }) {
  const stats = [
    { label: 'Total Users', value: usersCount, icon: Users },
    { label: 'Total Pending Users', value: pendingUsersCount, icon: UserCheck },
    { label: 'Active Logged-In Users', value: activeUsersCount, icon: UserX },
    { label: 'Total Downloads', value: logsCount, icon: Download }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-[#000476]">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-[#000476]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}

export default AdminStats;