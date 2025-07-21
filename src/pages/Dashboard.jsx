import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useAuth, ROLES } from '@/contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';

function Dashboard() {
  const { user } = useAuth();
  
  if (user?.role === ROLES.VIEWER) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Akses Terbatas</h2>
        <p className="text-gray-600 mb-6">Anda hanya dapat melihat daftar layanan.</p>
        <Link to="/daftar-jasa">
            <Button style={{ backgroundColor: '#000476' }}>Lihat Daftar Jasa</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - SAKTI Platform</title>
        <meta name="description" content="Welcome to SAKTI Dashboard - Your central hub for service management and analytics" />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#000476] to-indigo-800 rounded-2xl p-8 text-white relative"
        >
          <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/7e0684c8-f8f8-4241-a5d6-e17a7b2d1451/bd09d92a84c3cc2570763c0b4f943ecb.png" alt="SAKTI Symbol Logo" className="h-12 w-12" />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="lg:pl-24">
              <h1 className="text-3xl font-bold mb-2">
                Selamat Datang, {user?.full_name}
              </h1>
              <p className="text-blue-100 text-lg mb-6">
                Jelajahi layanan dan dokumentasi dengan mudah melalui platform SAKTI
              </p>
            </div>
            <div className="hidden lg:flex justify-center">
              <img  class="w-full max-w-md" alt="Dashboard illustration showing teamwork and exploration" src="https://images.unsplash.com/photo-1531497258014-b5736f376b1b" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Asisten Virtual SAKTI</CardTitle>
              <p className="text-gray-600">
                Tanyakan apa saja tentang layanan dan dokumentasi kami
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-xl p-4">
                <div id="webchat" style={{ width: '100%', height: '500px' }}></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}

export default Dashboard;