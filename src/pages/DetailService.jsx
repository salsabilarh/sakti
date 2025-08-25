import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Download, Building, Youtube, Star, BarChart,
  ChevronRight, ExternalLink, ScrollText, FolderKanban, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import DownloadFormModal from '@/components/DownloadFormModal.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const DetailCard = ({ icon, title, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="w-full"
  >
    <Card className="border border-gray-200 shadow hover:shadow-lg rounded-2xl transition duration-300 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center space-x-2 text-xl font-semibold text-[#000476]">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

function DetailService() {
  const { id } = useParams();
  const { authToken } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDownloadClick = file => {
    setSelectedFile(file);
    setShowDownloadForm(true);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`https://api-sakti-production.up.railway.app/api/services/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error('Gagal mengambil detail layanan');
        const data = await res.json();
        setService(data.service);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (authToken) fetchDetail();
  }, [id, authToken]);

  if (loading) return <p className="text-center py-10 text-gray-600">Memuat data layanan...</p>;

  if (!service) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Layanan Tidak Ditemukan</h2>
        <Link to="/daftar-jasa">
          <Button className="bg-[#000476] hover:bg-indigo-900 text-white">Kembali ke Daftar Jasa</Button>
        </Link>
      </div>
    );
  }

  const benefitList = service.benefit?.trim() ? service.benefit.split('\n') : [];
  const outputList = service.output?.trim() ? service.output.split('\n') : [];

  return (
    <>
      <Helmet>
        <title>{service.name} - SAKTI Platform</title>
        <meta name="description" content={`Informasi detail layanan ${service.name}`} />
      </Helmet>

      <div className="px-4 md:px-8 lg:px-20 py-3 space-y-7 bg-gray-50 min-h-screen">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link to="/daftar-jasa">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Jasa
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#000476] to-indigo-800 rounded-3xl p-8 text-white shadow-lg"
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3 flex-wrap">
                {service.group && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{service.group}</Badge>
                )}
                {service.code && (
                  <code className="bg-white/20 px-3 py-1 rounded text-sm font-mono">{service.code}</code>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4">{service.name}</h1>
              <p className="text-blue-100 text-lg leading-relaxed">{service.overview}</p>
              <div className="flex flex-wrap gap-6 mt-4 text-sm text-blue-100">
                {service.sbu_owner?.name && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>{service.sbu_owner.name}</span>
                  </div>
                )}
                {service.portfolio?.name && (
                  <div className="flex items-center space-x-2">
                    <BarChart className="w-4 h-4" />
                    <span>{service.portfolio.name}</span>
                  </div>
                )}
                {service.sub_portfolio?.name && (
                  <div className="flex items-center space-x-2">
                    <BarChart className="w-4 h-4" />
                    <span>{service.sub_portfolio.name} ({service.sub_portfolio.code})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {benefitList.length > 0 && (
              <DetailCard icon={<Star className="w-5 h-5 text-yellow-500" />} title="Manfaat Layanan" delay={0.1}>
                <ul className="space-y-3">
                  {benefitList.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <ChevronRight className="w-4 h-4 text-[#000476] mt-1" />
                      <span className="text-gray-700">{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              </DetailCard>
            )}

            {outputList.length > 0 && (
              <DetailCard icon={<BarChart className="w-5 h-5 text-indigo-600" />} title="Output Layanan" delay={0.2}>
                <ul className="space-y-3">
                  {outputList.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <ChevronRight className="w-4 h-4 text-[#000476] mt-1" />
                      <span className="text-gray-700">{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              </DetailCard>
            )}

            {service.scope && (
              <DetailCard icon={<LayoutDashboard className="w-5 h-5 text-indigo-600" />} title="Ruang Lingkup" delay={0.3}>
                <p className="text-gray-700 text-base leading-relaxed">{service.scope}</p>
              </DetailCard>
            )}

            {service.sectors?.length > 0 && (
              <DetailCard icon={<FolderKanban className="w-5 h-5 text-indigo-600" />} title="Sektor Terkait" delay={0.4}>
                <ul className="space-y-2 text-gray-700">
                  {service.sectors.map(sector => (
                    <li key={sector.id}>{sector.name} ({sector.code})</li>
                  ))}
                </ul>
              </DetailCard>
            )}

            {service.sub_sectors?.length > 0 && (
              <DetailCard icon={<FolderKanban className="w-5 h-5 text-indigo-600" />} title="Sub Sektor Terkait" delay={0.45}>
                <ul className="space-y-2 text-gray-700">
                  {service.sub_sectors.map(sub => (
                    <li key={sub.id}>{sub.name} ({sub.code})</li>
                  ))}
                </ul>
              </DetailCard>
            )}
          </div>

          <div className="space-y-8">
            {service.intro_video_url && (
              <DetailCard icon={<Youtube className="w-5 h-5 text-red-600" />} title="Introduction Module" delay={0.5}>
                <a href={service.intro_video_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Tonton Video Modul
                  </Button>
                </a>
              </DetailCard>
            )}

            {service.regulation_ref && (
              <DetailCard icon={<ScrollText className="w-5 h-5 text-indigo-600" />} title="Regulasi Terkait" delay={0.55}>
                <p className="text-sm text-gray-700">{service.regulation_ref}</p>
              </DetailCard>
            )}

            {service.revenues?.length > 0 && (
              <DetailCard icon={<BarChart className="w-5 h-5 text-green-600" />} title="Pelanggan Jasa" delay={0.65}>
                <div className="rounded overflow-hidden border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 text-left">Unit</th>
                        <th className="py-2 px-4 text-left">Pelanggan</th>
                        {/* <th className="py-2 px-4 text-right">Pendapatan</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {service.revenues.map((rev) => (
                        <tr key={rev.id} className="border-t">
                          <td className="py-2 px-4">{rev.unit?.name || '-'}</td>
                          <td className="py-2 px-4">{rev.customer_name}</td>
                          {/* <td className="py-2 px-4 text-right">Rp {parseFloat(rev.revenue).toLocaleString('id-ID')}</td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DetailCard>
            )}

            {service.marketing_kits?.length > 0 && (
              <DetailCard icon={<Download className="w-5 h-5 text-indigo-600" />} title="Marketing Kit" delay={0.6}>
                <div className="rounded overflow-hidden border border-gray-200">
                  <table className="w-full text-sm">
                    <tbody>
                      {service.marketing_kits.map((file, index) => (
                        <tr key={index} className="border-b last:border-none hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800">{file.name}</p>
                            <p className="text-gray-500">{file.file_type}</p>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              onClick={() => handleDownloadClick(file)}
                              className="bg-[#000476] hover:bg-indigo-900 text-white"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DetailCard>
            )}
          </div>
        </div>
      </div>

      {showDownloadForm && (
        <DownloadFormModal file={selectedFile} onClose={() => setShowDownloadForm(false)} />
      )}
    </>
  );
}

export default DetailService;
