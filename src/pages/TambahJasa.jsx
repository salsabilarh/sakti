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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function TambahJasa() {
  const { authToken, user } = useAuth();
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

  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [showSubPortfolioModal, setShowSubPortfolioModal] = useState(false);
  const [newSubPortfolioName, setNewSubPortfolioName] = useState('');
  const [selectedPortfolioForSub, setSelectedPortfolioForSub] = useState('');
  const [newSubPortfolioCode, setNewSubPortfolioCode] = useState('');

  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showSubSectorModal, setShowSubSectorModal] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorCode, setNewSectorCode] = useState('');
  const [selectedSectorForSub, setSelectedSectorForSub] = useState('');
  const [newSubSectorName, setNewSubSectorName] = useState('');
  const [newSubSectorCode, setNewSubSectorCode] = useState('');

  const canCreateMasterData = user.role === 'admin' || user.role === 'ppk_manager';

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

  useEffect(() => {
    fetch('https://api-sakti-production.up.railway.app/api/portfolios')
      .then(res => res.json())
      .then(data => setPortfolios(data.portfolios || []));
  }, []);

  useEffect(() => {
    if (!showSubPortfolioModal) {
      setSelectedPortfolioForSub('');
      setNewSubPortfolioName('');
      setNewSubPortfolioCode('');
    }
  }, [showSubPortfolioModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'portfolio_id' && value === '__new__') {
      setShowPortfolioModal(true);
      setForm((prev) => ({ ...prev, portfolio_id: '' })); // Kosongkan input
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    if (selected.includes('__new__')) {
      setShowSubSectorModal(true);
      return;
    }
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

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) {
      toast({ variant: 'destructive', title: 'Nama tidak boleh kosong' });
      return;
    }

    try {
      const res = await fetch('https://api-sakti-production.up.railway.app/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: newPortfolioName, code: newPortfolioName.slice(0, 4).toUpperCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat portfolio');

      setPortfolios((prev) => [...prev, data.portfolio]);
      setForm((prev) => ({ ...prev, portfolio_id: data.portfolio.id }));
      setShowPortfolioModal(false);
      setNewPortfolioName('');
      toast({ title: 'Berhasil', description: 'Portfolio berhasil dibuat' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Gagal', description: err.message });
    }
  };

  const handleCreateSubPortfolio = async () => {
    if (!selectedPortfolioForSub || !newSubPortfolioName.trim() || !newSubPortfolioCode.trim()) {
      toast({ variant: 'destructive', title: 'Form belum lengkap' });
      return;
    }

    try {
      const res = await fetch(`https://api-sakti-production.up.railway.app/api/portfolios/${selectedPortfolioForSub}/sub-portfolios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: newSubPortfolioName,
          code: newSubPortfolioCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan sub portfolio');

      setPortfolios(prev => prev.map(p => {
        if (p.id.toString() === selectedPortfolioForSub.toString()) {
          const updatedSub = [...(p.sub_portfolios || []), data.sub_portfolio];
          return { ...p, sub_portfolios: updatedSub };
        }
        return p;
      }));

      setForm(prev => ({ ...prev, sub_portfolio_id: data.sub_portfolio.id }));
      setShowSubPortfolioModal(false);
      setSelectedPortfolioForSub('');
      setNewSubPortfolioName('');
      setNewSubPortfolioCode('');
      toast({ title: 'Berhasil', description: 'Sub Portfolio berhasil dibuat' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Gagal', description: err.message });
    }
  };

  const handleCreateSector = async () => {
    if (!newSectorName.trim() || !newSectorCode.trim()) {
      toast({ variant: 'destructive', title: 'Form belum lengkap' });
      return;
    }

    try {
      const res = await fetch('https://api-sakti-production.up.railway.app/api/sectors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: newSectorName, code: newSectorCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan sektor');

      setSectors(prev => [...prev, { ...data.sector, sub_sectors: [] }]);
      setForm(prev => ({ ...prev, sector_id: data.sector.id }));
      setShowSectorModal(false);
      setNewSectorName('');
      setNewSectorCode('');
      toast({ title: 'Berhasil', description: 'Sektor berhasil ditambahkan' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Gagal', description: err.message });
    }
  };

  const handleCreateSubSector = async () => {
    if (!selectedSectorForSub || !newSubSectorName.trim() || !newSubSectorCode.trim()) {
      toast({ variant: 'destructive', title: 'Form belum lengkap' });
      return;
    }

    try {
      const res = await fetch(`https://api-sakti-production.up.railway.app/api/sectors/${selectedSectorForSub}/sub-sectors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: newSubSectorName,
          code: newSubSectorCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan sub sektor');

      setSectors(prev =>
        prev.map(s => {
          if (s.id.toString() === selectedSectorForSub.toString()) {
            const updatedSub = [...(s.sub_sectors || []), data.sub_sector];
            return { ...s, sub_sectors: updatedSub };
          }
          return s;
        })
      );

      setForm(prev => ({
        ...prev,
        sector_id: selectedSectorForSub,
        sub_sectors: [...prev.sub_sectors, data.sub_sector.id],
      }));

      setShowSubSectorModal(false);
      setSelectedSectorForSub('');
      setNewSubSectorName('');
      setNewSubSectorCode('');
      toast({ title: 'Berhasil', description: 'Sub Sektor berhasil ditambahkan' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Gagal', description: err.message });
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
                  {portfolios.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  {canCreateMasterData && <option value="__new__">+ Tambah Portfolio Baru</option>}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Sub Portfolio</label>
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
                  required
                >
                  <option value="">-- Pilih Sub Portfolio --</option>
                  {portfolios.flatMap(p => p.sub_portfolios || []).map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                  <option value="__new__">+ Tambah Sub Portfolio Baru</option>
                </select>
              </div>

              <div>
                <label className="font-medium block">Unit Pemilik</label>
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
                <select
                  name="sector_id"
                  value={form.sector_id}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setShowSectorModal(true);
                      return;
                    }
                    handleChange(e);
                  }}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="">-- Pilih Sektor --</option>
                  {sectors.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                  {canCreateMasterData && <option value="__new__">+ Tambah Sektor Baru</option>}
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
                  {canCreateMasterData && <option value="__new__">+ Tambah Sub Sektor Baru</option>}
                </select>
              </div>

              <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Layanan'}</Button>
            </CardContent>
          </Card>
        </form>
      </motion.div>

      <Dialog open={showPortfolioModal} onOpenChange={setShowPortfolioModal}>
        <DialogContent aria-describedby="portfolio-desc">
          <DialogHeader>
            <DialogTitle>Tambah Portfolio Baru</DialogTitle>
          </DialogHeader>
          <p id="portfolio-desc" className="text-sm text-muted-foreground mb-2">
            Masukkan nama portfolio baru yang akan ditambahkan.
          </p>
          <Input
            value={newPortfolioName}
            onChange={(e) => setNewPortfolioName(e.target.value)}
            placeholder="Nama Portfolio"
            className="mb-4"
          />
          <Button onClick={handleCreatePortfolio}>Simpan</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubPortfolioModal} onOpenChange={setShowSubPortfolioModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Sub Portfolio Baru</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pilih Portfolio Induk</label>
            <select
              value={selectedPortfolioForSub}
              onChange={(e) => setSelectedPortfolioForSub(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="">-- Pilih Portfolio --</option>
              {portfolios.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <label className="text-sm font-medium">Kode Sub Portfolio</label>
            <Input
              value={newSubPortfolioCode}
              onChange={(e) => setNewSubPortfolioCode(e.target.value)}
              placeholder="Kode (misal: SUB1)"
            />

            <label className="text-sm font-medium">Nama Sub Portfolio</label>
            <Input
              value={newSubPortfolioName}
              onChange={(e) => setNewSubPortfolioName(e.target.value)}
              placeholder="Nama Sub Portfolio"
            />

            <Button onClick={handleCreateSubPortfolio}>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSectorModal} onOpenChange={setShowSectorModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Sektor Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium">Kode Sektor</label>
          <Input value={newSectorCode} onChange={(e) => setNewSectorCode(e.target.value)} />

          <label className="text-sm font-medium">Nama Sektor</label>
          <Input value={newSectorName} onChange={(e) => setNewSectorName(e.target.value)} />

          <Button onClick={handleCreateSector}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={showSubSectorModal} onOpenChange={setShowSubSectorModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Sub Sektor Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium">Pilih Sektor Induk</label>
          <select
            value={selectedSectorForSub}
            onChange={(e) => setSelectedSectorForSub(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">-- Pilih Sektor --</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>

          <label className="text-sm font-medium">Kode Sub Sektor</label>
          <Input value={newSubSectorCode} onChange={(e) => setNewSubSectorCode(e.target.value)} />

          <label className="text-sm font-medium">Nama Sub Sektor</label>
          <Input value={newSubSectorName} onChange={(e) => setNewSubSectorName(e.target.value)} />

          <Button onClick={handleCreateSubSector}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default TambahJasa;
