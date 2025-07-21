import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [form, setForm] = useState({
    name: '',
    group: '',
    intro_video_url: '',
    overview: '',
    scope: '',
    benefit: '',
    output: '',
    regulation_ref: '',
    sbu_owner_id: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`https://api-sakti-production.up.railway.app/api/services/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await res.json();
        if (data.service) {
          const s = data.service;
          setForm({
            name: s.name || '',
            group: s.group || '',
            intro_video_url: s.intro_video_url || '',
            overview: s.overview || '',
            scope: s.scope || '',
            benefit: s.benefit || '',
            output: s.output || '',
            regulation_ref: s.regulation_ref || '',
            sbu_owner_id: s.sbu_owner?.id || '',
          });
        }
      } catch (err) {
        alert('Gagal memuat data layanan');
      } finally {
        setLoading(false);
      }
    };

    if (authToken) fetchService();
  }, [id, authToken]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await fetch(`https://api-sakti-production.up.railway.app/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal mengupdate layanan');
      }

      alert('Layanan berhasil diperbarui');
      navigate(`/service/${id}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="text-center py-10">Memuat data...</p>;

  return (
    <>
      <Helmet>
        <title>Edit Layanan - SAKTI Platform</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold mb-4">Edit Layanan</h1>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Edit Data</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.keys(form).map(key => (
                <div key={key}>
                  <label className="block font-medium capitalize mb-1" htmlFor={key}>{key.replace(/_/g, ' ')}</label>
                  <Input
                    id={key}
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              ))}
              <div className="pt-4">
                <Button type="submit" className="bg-blue-600 text-white">
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}

export default EditService;
