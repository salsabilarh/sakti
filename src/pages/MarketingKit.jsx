
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, Search, Filter, Upload } from 'lucide-react';
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

const mockMarketingKits = [
  {
    id: 1,
    fileName: 'Brochure Konsultasi Digital.pdf',
    fileType: 'Flyer',
    serviceName: 'Konsultasi Strategi Digital',
    portfolio: 'Digital Transformation',
    uploadedBy: 'Admin SAKTI',
    dateUploaded: '2024-01-10',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 2,
    fileName: 'Pitch Deck Keamanan Siber.pptx',
    fileType: 'Pitch Deck',
    serviceName: 'Audit Keamanan Siber',
    portfolio: 'Cybersecurity',
    uploadedBy: 'Admin SAKTI',
    dateUploaded: '2024-01-11',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 3,
    fileName: 'Flyer Aplikasi Mobile.pdf',
    fileType: 'Flyer',
    serviceName: 'Pengembangan Aplikasi Mobile',
    portfolio: 'Mobile Solutions',
    uploadedBy: 'Admin SAKTI',
    dateUploaded: '2024-01-12',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
];

const portfolios = [...new Set(mockMarketingKits.map(kit => kit.portfolio))];

function MarketingKit() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = useAuth();
  
  const canAccess = user && user.role !== ROLES.VIEWER;
  const isAdmin = user && user.role === ROLES.ADMIN;

  const filteredKits = useMemo(() => {
    return mockMarketingKits.filter(kit => {
      const matchesSearch = kit.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           kit.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPortfolio = !selectedPortfolio || kit.portfolio === selectedPortfolio;
      return matchesSearch && matchesPortfolio;
    });
  }, [searchTerm, selectedPortfolio]);

  const handleDownloadClick = (file) => {
    setSelectedFile(file);
    setShowDownloadForm(true);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Kit</h1>
            <p className="text-gray-600">
              Unduh materi pemasaran, brosur, dan dokumentasi untuk layanan kami
            </p>
          </div>
          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: '#000476' }}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Upload File Baru</DialogTitle>
                  <DialogDescription>
                    Tambahkan file marketing baru ke dalam sistem.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <UploadFile />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
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
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio
                  </label>
                  <select
                    value={selectedPortfolio}
                    onChange={(e) => setSelectedPortfolio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000476]"
                  >
                    <option value="">Semua Portfolio</option>
                    {portfolios.map(portfolio => (
                      <option key={portfolio} value={portfolio}>{portfolio}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedPortfolio('');
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
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
                      <TableCell className="font-medium">{kit.fileName}</TableCell>
                      <TableCell>{kit.fileType}</TableCell>
                      <TableCell>{kit.serviceName}</TableCell>
                      <TableCell>{kit.uploadedBy}</TableCell>
                      <TableCell>{kit.dateUploaded}</TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" onClick={() => handleDownloadClick(kit)} style={{ backgroundColor: '#000476' }}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
        
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
