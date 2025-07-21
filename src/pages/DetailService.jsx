import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Download, Building, Youtube, Star, BarChart,
  Paperclip, FileText, ChevronRight, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import DownloadFormModal from '@/components/DownloadFormModal.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx'; // untuk token auth jika dibutuhkan

const DetailCard = ({ icon, title, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="border-0 shadow-lg h-full">
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
  const { authToken } = useAuth(); // ambil token jika diperlukan
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
          headers: {
            Authorization: `Bearer ${authToken}`
          }
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

  if (loading) return <p className="text-center py-10">Memuat data layanan...</p>;

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

  const benefitList = service.benefit?.split('\n') || [];
  const outputList = service.output?.split('\n') || [];

  return (
    <>
      <Helmet>
        <title>{service.name} - SAKTI Platform</title>
        <meta name="description" content={`Detailed information about ${service.name} service`} />
      </Helmet>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link to="/daftar-jasa">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Jasa
            </Button>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gradient-to-r from-[#000476] to-indigo-800 rounded-2xl p-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                {service.group && <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{service.group}</Badge>}
                {service.code && <code className="bg-white/20 px-3 py-1 rounded text-sm font-mono">{service.code}</code>}
              </div>
              <h1 className="text-3xl font-bold mb-3">{service.name}</h1>
              <p className="text-blue-100 text-lg mb-4">{service.overview}</p>
              {service.sbu_owner?.name && (
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>SBU Owner: {service.sbu_owner.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {benefitList.length > 0 && (
              <DetailCard icon={<Star className="w-5 h-5" />} title="Manfaat Layanan" delay={0.1}>
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
              <DetailCard icon={<BarChart className="w-5 h-5" />} title="Output Layanan" delay={0.2}>
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
              <DetailCard icon={<Paperclip className="w-5 h-5" />} title="Ruang Lingkup" delay={0.3}>
                <p className="text-gray-700">{service.scope}</p>
              </DetailCard>
            )}
          </div>

          <div className="space-y-6">
            {service.intro_video_url && (
              <DetailCard icon={<Youtube className="w-5 h-5 text-red-600" />} title="Introduction Module" delay={0.4}>
                <a href={service.intro_video_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" style={{ backgroundColor: '#000476' }}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Learning Module
                  </Button>
                </a>
              </DetailCard>
            )}

            {service.regulation_ref && (
              <DetailCard icon={<FileText className="w-5 h-5" />} title="Regulasi Terkait" delay={0.5}>
                <p className="text-sm text-gray-700">{service.regulation_ref}</p>
              </DetailCard>
            )}

            {service.marketing_kits && service.marketing_kits.length > 0 && (
              <DetailCard icon={<Download className="w-5 h-5" />} title="Marketing Kit" delay={0.6}>
                <table className="w-full text-sm">
                  <tbody>
                    {service.marketing_kits.map((file, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="py-2 pr-2">
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <p className="text-gray-500">{file.file_type}</p>
                        </td>
                        <td className="py-2 pl-2 text-right">
                          <Button size="sm" onClick={() => handleDownloadClick(file)} style={{ backgroundColor: '#000476' }}>
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

      {showDownloadForm && <DownloadFormModal file={selectedFile} onClose={() => setShowDownloadForm(false)} />}
    </>
  );
}

export default DetailService;
