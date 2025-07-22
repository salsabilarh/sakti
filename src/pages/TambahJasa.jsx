import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

function TambahJasa() {
  const { authToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: '',
    group: '',
    intro_video_url: '',
    overview: '',
    scope: '',
    benefit: '',
    output: '',
    regulation_ref: '',
    portfolio_id: '',
    sub_portfolio_id: '',
    sbu_owner_id: '',
    sector_id: '',
    sub_sectors: [],
  });

  const [portfolios, setPortfolios] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [subSectors, setSubSectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sbuUnits, setSbuUnits] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [portfolioRes, sectorRes, unitRes] = await Promise.all([
          fetch('https://api-sakti-production.up.railway.app/api/portfolios', {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch('https://api-sakti-production.up.railway.app/api/sectors', {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch('https://api-sakti-production.up.railway.app/api/units?type=sbu', {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        const portfolioData = await portfolioRes.json();
        const sectorData = await sectorRes.json();
        const unitData = await unitRes.json();

        setPortfolios(portfolioData.portfolios || []);
        setSectors(sectorData.sectors || []);
        setSbuUnits(unitData.units || []);
      } catch (err) {
        console.error('Fetch error:', err);
        toast({
          variant: 'destructive',
          title: 'Gagal memuat data awal',
          description: err.message,
        });
      }
    };

    if (authToken) fetchInitialData();
  }, [authToken, toast]);

  useEffect(() => {
    const selected = sectors.find((s) => s.id.toString() === form.sector_id);
    setSubSectors(selected?.sub_sectors || []);
    setForm((prev) => ({ ...prev, sub_sectors: [] }));
  }, [form.sector_id, sectors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setForm((prev) => ({ ...prev, sub_sectors: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name || !form.portfolio_id || !form.sbu_owner_id) {
      toast({
        variant: 'destructive',
        title: 'Form tidak lengkap',
        description: 'Harap isi nama layanan, portfolio, dan unit pemilik.',
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        sectors: form.sector_id ? [form.sector_id] : [],
        sub_sectors: form.sub_sectors || [],
      };

      const res = await fetch('https://api-sakti-production.up.railway.app/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan layanan');
      }

      toast({
        title: 'Berhasil',
        description: 'Layanan berhasil ditambahkan!',
      });

      navigate('/daftar-jasa');
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: err.message || 'Terjadi kesalahan.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Tambah Layanan - SAKTI</title></Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Tambah Layanan Baru</h1>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Form Layanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <label className="font-medium block">Nama Layanan</label>
                <Input name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div>
                <label className="font-medium block">Group Layanan</label>
                <Input name="group" value={form.group} onChange={handleChange} />
              </div>

              <div>
                <label className="font-medium block">Link Video Intro</label>
                <Input name="intro_video_url" value={form.intro_video_url} onChange={handleChange} />
                {form.intro_video_url && (
                  <iframe
                    src={form.intro_video_url}
                    title="Video Preview"
                    className="w-full h-52 border mt-2"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                )}
              </div>

              <div>
                <label className="font-medium block">Gambaran Umum</label>
                <Textarea name="overview" value={form.overview} onChange={handleChange} />
              </div>

              <div>
                <label className="font-medium block">Ruang Lingkup</label>
                <Textarea name="scope" value={form.scope} onChange={handleChange} />
              </div>

              <div>
                <label className="font-medium block">Manfaat</label>
                <Textarea name="benefit" value={form.benefit} onChange={handleChange} />
              </div>

              <div>
                <label className="font-medium block">Output</label>
                <Textarea name="output" value={form.output} onChange={handleChange} />
              </div>

              <div>
                <label className="font-medium block">Referensi Regulasi</label>
                <Textarea name="regulation_ref" value={form.regulation_ref} onChange={handleChange} />
              </div>

              <div>
                <label className="font-medium block">Portfolio</label>
                <select name="portfolio_id" value={form.portfolio_id} onChange={handleChange} className="border rounded px-3 py-2 w-full" required>
                  <option value="">-- Pilih Portfolio --</option>
                  {portfolios.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium block">Sub Portfolio</label>
                <select
                  name="sub_portfolio_id"
                  value={form.sub_portfolio_id}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                  required
                >
                  <option value="">-- Pilih Sub Portfolio --</option>
                  {portfolios
                    .flatMap(p => p.sub_portfolios || [])
                    .map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-medium block">Unit Pemilik (SBU Owner)</label>
                <select
                  name="sbu_owner_id"
                  value={form.sbu_owner_id}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                  required
                >
                  <option value="">-- Pilih Unit --</option>
                  {sbuUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium block">Sektor</label>
                <select name="sector_id" value={form.sector_id} onChange={handleChange} className="border rounded px-3 py-2 w-full">
                  <option value="">-- Pilih Sektor --</option>
                  {sectors.map((s) => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium block">Sub Sektor</label>
                <select
                  multiple
                  name="sub_sectors"
                  value={form.sub_sectors}
                  onChange={handleMultiSelect}
                  className="border rounded px-3 py-2 w-full h-32"
                >
                  {subSectors.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                  ))}
                </select>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Layanan'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </>
  );
}

export default TambahJasa;
