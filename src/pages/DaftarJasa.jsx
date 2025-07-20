import React, { useState, useMemo } from 'react';
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

const mockServices = [
  {
    id: 1,
    name: 'Konsultasi Strategi Digital',
    code: 'KSD-001',
    subPortfolio: 'Strategy',
    portfolio: 'Digital Transformation',
    sector: 'Teknologi Informasi'
  },
  {
    id: 2,
    name: 'Audit Keamanan Siber',
    code: 'AKS-002',
    subPortfolio: 'Security Audit',
    portfolio: 'Cybersecurity',
    sector: 'Perbankan'
  },
  {
    id: 3,
    name: 'Pengembangan Aplikasi Mobile',
    code: 'PAM-003',
    subPortfolio: 'Native Development',
    portfolio: 'Mobile Solutions',
    sector: 'Retail'
  },
  {
    id: 4,
    name: 'Analisis Data Bisnis',
    code: 'ADB-004',
    subPortfolio: 'Data Science',
    portfolio: 'Business Intelligence',
    sector: 'Manufaktur'
  },
  {
    id: 5,
    name: 'Implementasi Cloud Infrastructure',
    code: 'ICI-005',
    subPortfolio: 'Cloud Migration',
    portfolio: 'Cloud Services',
    sector: 'Teknologi Informasi'
  },
  {
    id: 6,
    name: 'Training Digital Marketing',
    code: 'TDM-006',
    subPortfolio: 'SEO & SEM',
    portfolio: 'Digital Marketing',
    sector: 'Pendidikan'
  }
];

const portfolios = [...new Set(mockServices.map(service => service.portfolio))];
const sectors = [...new Set(mockServices.map(service => service.sector))];

function DaftarJasa() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  const filteredServices = useMemo(() => {
    return mockServices.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPortfolio = !selectedPortfolio || service.portfolio === selectedPortfolio;
      const matchesSector = !selectedSector || service.sector === selectedSector;
      
      return matchesSearch && matchesPortfolio && matchesSector;
    });
  }, [searchTerm, selectedPortfolio, selectedSector]);

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Jasa</h1>
          <p className="text-gray-600">
            Jelajahi katalog layanan lengkap dengan informasi detail dan dokumentasi
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Sektor
                  </label>
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
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <p className="text-gray-600">
            Menampilkan {filteredServices.length} dari {mockServices.length} layanan
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
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
                  {filteredServices.map((service, index) => (
                    <motion.tr
                      key={service.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium text-gray-900">{service.name}</TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {service.code}
                        </code>
                      </TableCell>
                      <TableCell>{service.subPortfolio}</TableCell>
                      <TableCell>{service.portfolio}</TableCell>
                      <TableCell>{service.sector}</TableCell>
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
              
              {filteredServices.length === 0 && (
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