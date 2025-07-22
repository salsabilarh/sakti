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
  >
    <Card className="border-0 shadow-md hover:shadow-xl transition rounded-xl h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg text-[#000476]">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
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
          <Button style={{ backgroundColor: '#000476' }}>Kembali ke Daftar Jasa</Button>
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

      <div className="px-4 md:px-6 lg:px-20 py-6 space-y-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link to="/daftar-jasa">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Jasa
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#000476] to-indigo-800 rounded-2xl p-8 text-white"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4 flex-wrap">
                {service.group && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {service.group}
                  </Badge>
                )}
                {service.code && (
                  <code className="bg-white/20 px-3 py-1 rounded text-sm font-mono">{service.code}</code>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-3">{service.name}</h1>
              <p className="text-blue-100 text-lg mb-4">{service.overview}</p>
              <div className="flex flex-wrap gap-4 text-sm">
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
                    <span>
                      {service.sub_portfolio.name} ({service.sub_portfolio.code})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {benefitList.length > 0 && (
              <DetailCard icon={<Star className="w-5 h-5 text-yellow-500" />} title="Manfaat Layanan" delay={0.1}>
                <ul className="space-y-3">
                  {benefitList.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <ChevronRight className="w-4 h-4 text-[#000476] mt-1 flex-shrink-0" />
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
                      <ChevronRight className="w-4 h-4 text-[#000476] mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              </DetailCard>
            )}

            {service.scope && (
              <DetailCard icon={<LayoutDashboard className="w-5 h-5 text-indigo-600" />} title="Ruang Lingkup" delay={0.3}>
                <p className="text-gray-700 leading-relaxed tracking-wide text-base">{service.scope}</p>
              </DetailCard>
            )}

            {service.sectors?.length > 0 && (
              <DetailCard icon={<FolderKanban className="w-5 h-5 text-indigo-600" />} title="Sektor Terkait" delay={0.4}>
                <ul className="space-y-2">
                  {service.sectors.map(sector => (
                    <li key={sector.id} className="text-gray-700">
                      {sector.name} ({sector.code})
                    </li>
                  ))}
                </ul>
              </DetailCard>
            )}

            {service.sub_sectors?.length > 0 && (
              <DetailCard icon={<FolderKanban className="w-5 h-5 text-indigo-600" />} title="Sub Sektor Terkait" delay={0.45}>
                <ul className="space-y-2">
                  {service.sub_sectors.map(sub => (
                    <li key={sub.id} className="text-gray-700">
                      {sub.name} ({sub.code})
                    </li>
                  ))}
                </ul>
              </DetailCard>
            )}
          </div>

          <div className="space-y-6">
            {service.intro_video_url && (
              <DetailCard icon={<Youtube className="w-5 h-5 text-indigo-600" />} title="Introduction Module" delay={0.5}>
                <a href={service.intro_video_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-blue-600 hover:bg-red-700 text-white">
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

            {service.marketing_kits?.length > 0 && (
              <DetailCard icon={<Download className="w-5 h-5 text-indigo-600" />} title="Marketing Kit" delay={0.6}>
                <table className="w-full text-sm border rounded overflow-hidden">
                  <tbody>
                    {service.marketing_kits.map((file, index) => (
                      <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50 transition">
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
