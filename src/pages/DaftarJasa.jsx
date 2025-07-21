import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.jsx';

import { useAuth } from '@/contexts/AuthContext.jsx';

function DaftarJasa() {
  const { authToken } = useAuth(); // ✅ Ambil token dari context
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedPortfolio) params.append('portfolio', selectedPortfolio);
        if (selectedSector) params.append('sector', selectedSector);

        const res = await fetch(`https://api-sakti-production.up.railway.app/api/services?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${authToken}`, // ✅ Kirim token di header
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || 'Gagal mengambil data layanan');
        }

        const data = await res.json();
        setServices(data.services || []);
      } catch (error) {
        console.error('Gagal mengambil data layanan:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchServices(); // ✅ Hanya fetch jika token tersedia
    }
  }, [searchTerm, selectedPortfolio, selectedSector, authToken]);

  const portfolios = useMemo(() => [...new Set(services.map(s => s.portfolio).filter(Boolean))], [services]);
  const sectors = useMemo(() => [...new Set(services.flatMap(s => s.sectors).filter(Boolean))], [services]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPortfolio('');
    setSelectedSector('');
  };

  return (
    <>
      <Helmet>
        <title>Daftar Jasa - SAKTI Platform</title>
        <meta name="description" content="Browse and explore our comprehensive service catalog with detailed information and documentation" />
      </Helmet>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Jasa</h1>
          <p className="text-gray-600">Jelajahi katalog layanan lengkap dengan informasi detail dan dokumentasi</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filter & Pencarian</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama layanan atau kode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
                  <select
                    value={selectedPortfolio}
                    onChange={(e) => setSelectedPortfolio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Semua Portfolio</option>
                    {portfolios.map(portfolio => (
                      <option key={portfolio} value={portfolio}>{portfolio}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Sektor</label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Semua Sektor</option>
                    {sectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Reset Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-center justify-between">
          <p className="text-gray-600">
            {loading
              ? 'Memuat layanan...'
              : `Menampilkan ${services.length} layanan`}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Layanan</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Sub-Portfolio</TableHead>
                    <TableHead>Portfolio</TableHead>
                    <TableHead>Sektor</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service, index) => (
                    <motion.tr
                      key={service.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium text-gray-900">{service.name}</TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{service.code}</code>
                      </TableCell>
                      <TableCell>{service.subPortfolio || '-'}</TableCell>
                      <TableCell>{service.portfolio || '-'}</TableCell>
                      <TableCell>{(service.sectors || []).join(', ') || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Link to={`/service/${service.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Detail
                          </Button>
                        </Link>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>

              {!loading && services.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Tidak ada layanan yang ditemukan</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Reset Filter
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}

export default DaftarJasa;
