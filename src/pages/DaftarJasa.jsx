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
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

function DaftarJasa() {
  const {user, authToken } = useAuth();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [portfolioList, setPortfolioList] = useState([]);
  const [sectorList, setSectorList] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const cannotEdit = user?.role === 'viewer' || user?.role === 'pdo' || user?.unit?.type === 'cabang';
  const canViewDetail = !!user; // Selama user terautentikasi, bisa lihat detail

  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenueForm, setRevenueForm] = useState({
    service_id: null,
    customer_name: '',
    revenue: '',
    unit_id: '',
  });
  const [unitList, setUnitList] = useState([]);

  // Fetch data filter portfolio & sektor
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [portfolioRes, sectorRes] = await Promise.all([
          fetch('https://api-sakti-production.up.railway.app/api/portfolios', {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch('https://api-sakti-production.up.railway.app/api/sectors', {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        const [portfolioData, sectorData] = await Promise.all([
          portfolioRes.json(),
          sectorRes.json(),
        ]);

        setPortfolioList(portfolioData.portfolios || []);
        setSectorList(sectorData.sectors || []);
      } catch (err) {
        console.error('Gagal mengambil data filter:', err);
      }
    };

    if (authToken) {
      fetchOptions();
    }
  }, [authToken]);

  // Fetch daftar jasa
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedPortfolioId) params.append('portfolio', selectedPortfolioId);
        if (selectedSectorId) params.append('sector', selectedSectorId);
        if (sortBy) params.append('sort', sortBy);
        if (sortOrder) params.append('order', sortOrder);
        params.append('page', page);
        params.append('limit', limit);

        const res = await fetch(`https://api-sakti-production.up.railway.app/api/services?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || 'Gagal mengambil data layanan');
        }

        const data = await res.json();
        setServices(data.services || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Gagal mengambil data layanan:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchServices();
    }
  }, [searchTerm, selectedPortfolioId, selectedSectorId, page, limit, sortBy, sortOrder, authToken]);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch('https://api-sakti-production.up.railway.app/api/units', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        setUnitList(data.units || []);
      } catch (err) {
        console.error('Gagal mengambil data unit:', err);
      }
    };

    if (authToken) {
      fetchUnits();
    }
  }, [authToken]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPortfolioId('');
    setSelectedSectorId('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  const handleSort = (field) => {
    if (sortBy === field) {
      // toggle antara desc dan asc
      setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc'); // default klik pertama: asc
    }
    setPage(1); // reset ke halaman 1 saat sort berubah
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Apakah Anda yakin ingin menghapus layanan ini?');
    if (!confirm) return;

    try {
      const res = await fetch(`https://api-sakti-production.up.railway.app/api/services/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || 'Gagal menghapus layanan');
      }

      // Refresh data
      setServices(prev => prev.filter(service => service.id !== id));
      setTotal(prev => prev - 1);
      alert('Layanan berhasil dihapus');
    } catch (error) {
      console.error('Gagal menghapus layanan:', error.message);
      alert(`Gagal menghapus layanan: ${error.message}`);
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1 text-gray-600" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 text-gray-600" />
    );
  };

  return (
    <>
      <Helmet>
        <title>Daftar Layanan - SAKTI Platform</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Layanan</h1>
          <p className="text-gray-600">Jelajahi katalog layanan lengkap dengan informasi detail dan dokumentasi</p>
        </motion.div>

        {/* Filter dan Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="flex justify-end">
            {!cannotEdit && (
              <Link to="/tambah-jasa">
                <Button className="mb-4">+ Tambah Layanan</Button>
              </Link>
            )}
          </div>
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
                  <select
                    value={selectedPortfolioId}
                    onChange={(e) => {
                      setSelectedPortfolioId(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Semua Portfolio</option>
                    {portfolioList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sektor</label>
                  <select
                    value={selectedSectorId}
                    onChange={(e) => {
                      setSelectedSectorId(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Semua Sektor</option>
                    {sectorList.map((s) => (
                      <option key={s.id} value={s.id}>{s.code}</option>
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

        {/* Status dan Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Memuat layanan...' : `Menampilkan ${services.length} layanan dari total ${total}`}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer select-none">
                      <div className="flex items-center">
                        Nama Layanan {renderSortIcon('name')}
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center">Kode</div>
                    </TableHead>

                    <TableHead>
                      <div className="flex items-center">Sub-Portfolio</div>
                    </TableHead>

                    <TableHead onClick={() => handleSort('portfolio')} className="cursor-pointer select-none">
                      <div className="flex items-center">
                        Portfolio {renderSortIcon('portfolio')}
                      </div>
                    </TableHead>

                    <TableHead onClick={() => handleSort('sector')} className="cursor-pointer select-none">
                      <div className="flex items-center">
                        Sektor {renderSortIcon('sector')}
                      </div>
                    </TableHead>
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
                      <TableCell><code className="bg-gray-100 px-2 py-1 rounded text-sm">{service.code}</code></TableCell>
                      <TableCell>{service.subPortfolio || '-'}</TableCell>
                      <TableCell>{service.portfolio || '-'}</TableCell>
                      <TableCell>{(service.sectors || []).join(', ') || '-'}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center items-center gap-x-2">
                          {canViewDetail && (
                            <Link to={`/service/${service.id}`}>
                              <Button variant="outline" size="sm" className="py-5">
                                <Eye className="w-4 h-4 mr-1" />
                                Detail
                              </Button>
                            </Link>
                          )}
                          {!cannotEdit && (
                            <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 py-5"
                                onClick={() => {
                                  setRevenueForm({ service_id: service.id, customer_name: '', revenue: '', unit_id: '' });
                                  setShowRevenueModal(true);
                                }}
                              >
                                Tambah Pelanggan
                              </Button>
                              <Link to={`/edit-service/${service.id}`}>
                                <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 py-5">
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 py-5"
                                onClick={() => handleDelete(service.id)}
                              >
                                Hapus
                              </Button>
                            </>
                          )}
                        </div>
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

          {/* Pagination */}
          {!loading && services.length > 0 && (
            <div className="flex justify-between items-center px-4 py-4">
              <p className="text-sm text-gray-600">
                Halaman {page} dari {totalPages}
              </p>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {showRevenueModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Tambah Pendapatan Layanan</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Nama Pelanggan</label>
                  <Input
                    value={revenueForm.customer_name}
                    onChange={(e) => setRevenueForm({ ...revenueForm, customer_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Pendapatan (Rp)</label>
                  <Input
                    type="number"
                    value={revenueForm.revenue}
                    onChange={(e) => setRevenueForm({ ...revenueForm, revenue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Unit</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-2 py-2"
                    value={revenueForm.unit_id}
                    onChange={(e) => setRevenueForm({ ...revenueForm, unit_id: e.target.value })}
                  >
                    <option value="">Pilih Unit</option>
                    {unitList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowRevenueModal(false)}>Batal</Button>
                <Button onClick={async () => {
                  try {
                    const res = await fetch(`https://api-sakti-production.up.railway.app/api/services/${revenueForm.service_id}/revenue`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                      },
                      body: JSON.stringify({
                        customer_name: revenueForm.customer_name,
                        revenue: revenueForm.revenue,
                        unit_id: revenueForm.unit_id,
                      }),
                    });

                    const result = await res.json();
                    if (!res.ok) throw new Error(result.error || 'Gagal tambah revenue');

                    alert('Pendapatan berhasil ditambahkan');
                    setShowRevenueModal(false);
                  } catch (err) {
                    alert(`Gagal tambah pendapatan: ${err.message}`);
                  }
                }}>
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default DaftarJasa;
