import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, Search, Filter, Upload, Trash2 } from 'lucide-react'; // Tambahkan Trash2
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.jsx';
import DownloadFormModal from '@/components/DownloadFormModal.jsx';
import { useAuth, ROLES } from '@/contexts/AuthContext.jsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UploadFile from '@/components/admin/UploadFile.jsx';
import EditFormModal from '@/components/admin/EditFormModal.jsx';
import { useToast } from '@/components/ui/use-toast.js';

function MarketingKit() {
  const [kits, setKits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const { user, authToken } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const canAccess = user && user.role !== ROLES.VIEWER;
  const isAdmin = user && user.role === ROLES.ADMIN;
  const cannotEdit = user?.role === 'viewer' || user?.role === 'pdo' || user?.unit?.type === 'cabang';

  const fetchMarketingKits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedPortfolio) params.append('file_type', selectedPortfolio);
      if (selectedService) params.append('service', selectedService);

      const response = await fetch(
        `https://api-sakti-production.up.railway.app/api/marketing-kits?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();
      setKits(data.marketing_kits || []);
    } catch (error) {
      console.error('Gagal mengambil marketing kits:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) fetchMarketingKits();
  }, [searchTerm, selectedPortfolio, selectedService, authToken]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('https://api-sakti-production.up.railway.app/api/services', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await res.json();
        setServices(data.services || []);
      } catch (error) {
        console.error('Gagal mengambil layanan:', error.message);
      }
    };
    if (authToken) fetchServices();
  }, [authToken]);

  const portfolios = useMemo(() => {
    return [...new Set(kits.map(kit => kit.file_type).filter(Boolean))];
  }, [kits]);

  const filteredKits = useMemo(() => {
    return kits.filter(kit => {
      const matchesSearch =
        kit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (kit.services || []).some(s =>
          s.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesPortfolio = !selectedPortfolio || kit.file_type === selectedPortfolio;
      const matchesService = !selectedService || (kit.services || []).some(s => s.id.toString() === selectedService);
      return matchesSearch && matchesPortfolio && matchesService;
    });
  }, [kits, searchTerm, selectedPortfolio, selectedService]);

  const handleDownloadClick = (file) => {
    setSelectedFile(file);
    setShowDownloadForm(true);
  };

  const handleDeleteKit = async (id) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus file ini?');

    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://api-sakti-production.up.railway.app/api/marketing-kits/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Delete failed:', result.error);
        throw new Error(result.error || 'Gagal menghapus file.');
      }

      // Hapus file dari state
      setKits((prevKits) => prevKits.filter((kit) => kit.id !== id));

      toast({
        title: "Berhasil!",
        description: "File marketing kit berhasil dihapus.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error saat menghapus file:', error);
      toast({
        title: "Gagal menghapus",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!canAccess) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h2>
        <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Marketing Kit - SAKTI Platform</title>
        <meta name="description" content="Download marketing materials, brochures, and documentation for our services" />
      </Helmet>
      
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Kit</h1>
            <p className="text-gray-600">Unduh materi pemasaran, brosur, dan dokumentasi untuk layanan kami</p>
          </div>
          {isAdmin && !cannotEdit && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: '#000476' }}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Upload File Baru</DialogTitle>
                  <DialogDescription>Tambahkan file marketing baru ke dalam sistem.</DialogDescription>
                </DialogHeader>
                <UploadFile
                  onUploadSuccess={() => {
                    fetchMarketingKits();
                    setDialogOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-[#000476]" />
                <span>Filter & Pencarian</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama file atau layanan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipe File</label>
                  <select
                    value={selectedPortfolio}
                    onChange={(e) => setSelectedPortfolio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000476]"
                  >
                    <option value="">Semua Tipe File</option>
                    {portfolios.map((portfolio) => (
                      <option key={portfolio} value={portfolio}>
                        {portfolio}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Layanan</label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000476]"
                  >
                    <option value="">Semua Layanan</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedPortfolio('');
                      setSelectedService('');
                    }}
                    className="w-full"
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama File</TableHead>
                    <TableHead>Tipe File</TableHead>
                    <TableHead>Layanan Terkait</TableHead>
                    <TableHead>Diupload Oleh</TableHead>
                    <TableHead>Tanggal Upload</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKits.map((kit) => (
                    <TableRow key={kit.id}>
                      <TableCell className="font-medium">{kit.name}</TableCell>
                      <TableCell>{kit.file_type}</TableCell>
                      <TableCell>
                        {kit.services && kit.services.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {kit.services.map(service => (
                              <span
                                key={service.id}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                              >
                                {service.code}
                              </span>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{kit.uploader?.full_name || '-'}</TableCell>
                      <TableCell>{new Date(kit.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                      <div className="flex justify-center items-center gap-2">
                        {!cannotEdit && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedFile(kit);
                                setShowEditModal(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteKit(kit.id)}
                            >
                              Hapus
                            </Button>
                          </>
                        )}
                        <Button size="sm" style={{ backgroundColor: '#000476' }} onClick={() => handleDownloadClick(kit)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {!loading && filteredKits.length === 0 && (
                <div className="text-center py-12 text-gray-500">Tidak ada data ditemukan</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <EditFormModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          file={selectedFile}
          services={services}
          authToken={authToken}
          onUpdateSuccess={() => {
            fetchMarketingKits();
            setShowEditModal(false);
          }}
        />
        {showDownloadForm && (
          <DownloadFormModal
            file={selectedFile}
            onClose={() => setShowDownloadForm(false)}
          />
        )}
      </div>
    </>
  );
}

export default MarketingKit;
