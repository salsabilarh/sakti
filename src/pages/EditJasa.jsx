// EditService.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [sbuUnits, setSbuUnits] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [subSectors, setSubSectors] = useState([]);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');

  const [showSubPortfolioModal, setShowSubPortfolioModal] = useState(false);
  const [selectedPortfolioForSub, setSelectedPortfolioForSub] = useState('');
  const [newSubPortfolioName, setNewSubPortfolioName] = useState('');
  const [newSubPortfolioCode, setNewSubPortfolioCode] = useState('');

  const [showSectorModal, setShowSectorModal] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorCode, setNewSectorCode] = useState('');

  const [showSubSectorModal, setShowSubSectorModal] = useState(false);
  const [selectedSectorForSub, setSelectedSectorForSub] = useState('');
  const [newSubSectorName, setNewSubSectorName] = useState('');
  const [newSubSectorCode, setNewSubSectorCode] = useState('');


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
    portfolio_id: '',
    sub_portfolio_id: '',
    sector_id: '',
    sub_sectors: [],
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [serviceRes, portfolioRes, sectorRes, unitRes] = await Promise.all([
          fetch(`https://api-sakti-production.up.railway.app/api/services/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
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

        const serviceData = await serviceRes.json();
        const portfolioData = await portfolioRes.json();
        const sectorData = await sectorRes.json();
        const unitData = await unitRes.json();

        const s = serviceData.service;
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
          portfolio_id: s.portfolio?.id || '',
          sub_portfolio_id: s.sub_portfolio?.id || '',
          sector_id: s.sectors?.[0]?.id?.toString() || '',
          sub_sectors: s.sub_sectors?.map(ss => ss.id.toString()) || [],
        });

        setPortfolios(portfolioData.portfolios || []);
        setSectors(sectorData.sectors || []);
        setSbuUnits(unitData.units || []);
      } catch (err) {
        console.error(err);
        toast({
          variant: 'destructive',
          title: 'Gagal memuat data',
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    if (authToken) fetchAllData();
  }, [authToken, id, toast]);

  useEffect(() => {
    const selected = sectors.find((s) => s.id.toString() === form.sector_id);
    setSubSectors(selected?.sub_sectors || []);
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

    try {
      const payload = {
        ...form,
        sectors: form.sector_id ? [form.sector_id] : [],
        sub_sectors: form.sub_sectors,
      };

      const res = await fetch(`https://api-sakti-production.up.railway.app/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal update layanan');
      }

      toast({
        title: 'Berhasil',
        description: 'Layanan berhasil diperbarui.',
      });

      navigate(`/service/${id}`);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center">Memuat data...</p>;

  return (
    <>
      <Helmet><title>Edit Layanan - SAKTI</title></Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Edit Layanan</h1>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-md">
            <CardHeader><CardTitle>Form Edit Layanan</CardTitle></CardHeader>
            <CardContent className="space-y-4">

              <div>
                <label className="font-medium block">Nama Layanan</label>
                <Input name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div>
                <label className="font-medium block">Group</label>
                <Input name="group" value={form.group} onChange={handleChange} />
              </div>

              <div>
                <label className="font-medium block">Link Video Intro</label>
                <Input name="intro_video_url" value={form.intro_video_url} onChange={handleChange} />
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
                <select
                  name="portfolio_id"
                  value={form.portfolio_id}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setShowPortfolioModal(true);
                      setForm((prev) => ({ ...prev, portfolio_id: '' }));
                      return;
                    }
                    handleChange(e);
                  }}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="">-- Pilih Portfolio --</option>
                  {portfolios.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  <option value="__new__">+ Tambah Portfolio Baru</option>
                </select>
              </div>

              <div>
                <label className="font-medium block">Sub Portfolio</label>
                <select
                  name="sub_portfolio_id"
                  value={form.sub_portfolio_id}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setShowSubPortfolioModal(true);
                      return;
                    }
                    handleChange(e);
                  }}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="">-- Pilih Sub Portfolio --</option>
                  {portfolios.flatMap(p => p.sub_portfolios || []).map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                  <option value="__new__">+ Tambah Sub Portfolio Baru</option>
                </select>
              </div>

              <div>
                <label className="font-medium block">Unit Pemilik (SBU Owner)</label>
                <select name="sbu_owner_id" value={form.sbu_owner_id} onChange={handleChange} className="border rounded px-3 py-2 w-full" required>
                  <option value="">-- Pilih Unit --</option>
                  {sbuUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>

              {/* Sektor */}
              <div>
                <label className="font-medium block">Sektor</label>
                <div className="space-y-1 border rounded p-3">
                  {sectors.map((s) => (
                    <label key={s.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={s.id.toString()}
                        checked={form.sector_id === s.id.toString()}
                        onChange={(e) => {
                          const value = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            sector_id: value,
                            sub_sectors: [],
                          }));
                        }}
                      />
                      <span>{s.code} - {s.name}</span>
                    </label>
                  ))}
                  <Button type="button" onClick={() => setShowSectorModal(true)} size="sm">
                    + Tambah Sektor Baru
                  </Button>
                </div>
              </div>

              {/* Sub Sektor */}
              <div>
                <label className="font-medium block">Sub Sektor</label>
                <div className="space-y-1 border rounded p-3">
                  {subSectors.map((sub) => (
                    <label key={sub.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={sub.id.toString()}
                        checked={form.sub_sectors.includes(sub.id.toString())}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const value = e.target.value;

                          const updated = checked
                            ? [...form.sub_sectors, value]
                            : form.sub_sectors.filter((id) => id !== value);

                          setForm((prev) => ({
                            ...prev,
                            sub_sectors: updated,
                          }));
                        }}
                      />
                      <span>{sub.code} - {sub.name}</span>
                    </label>
                  ))}
                  <Button type="button" onClick={() => setShowSubSectorModal(true)} size="sm">
                    + Tambah Sub Sektor Baru
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </>
  );
}

export default EditService;
