// EditService.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command';

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
    sectors: [],
    sub_sectors: [],
  });

  const [openSector, setOpenSector] = useState(false);
  const [openSubSector, setOpenSubSector] = useState(false);

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
          sectors: s.sectors?.map(sec => sec.id.toString()) || [], // ← ini diubah
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
    const selectedSubs = sectors
      .filter((s) => form.sectors.includes(s.id.toString()))
      .flatMap((s) => s.sub_sectors || []);
    setSubSectors(selectedSubs);
  }, [form.sectors, sectors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validSubSectorIds = sectors
        .flatMap((s) => s.sub_sectors || [])
        .map((sub) => sub.id.toString());

      const filteredSubSectors = form.sub_sectors.filter((id) =>
        validSubSectorIds.includes(id)
      );

      const filteredSectors = sectors
        .filter((s) =>
          s.sub_sectors?.some((sub) => filteredSubSectors.includes(sub.id.toString()))
        )
        .map((s) => s.id.toString());

      const payload = {
        ...form,
        sectors: filteredSectors,
        sub_sectors: filteredSubSectors,
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

      toast({ title: 'Berhasil', description: 'Layanan berhasil diperbarui.' });
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

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <Link to="/daftar-jasa">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Jasa
          </Button>
        </Link>
      </motion.div>

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

              {form.portfolio_id && (
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
                    {portfolios
                      .find((p) => p.id.toString() === form.portfolio_id.toString())
                      ?.sub_portfolios?.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    <option value="__new__">+ Tambah Sub Portfolio Baru</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-medium block">Unit Pemilik (SBU Owner)</label>
                <select name="sbu_owner_id" value={form.sbu_owner_id} onChange={handleChange} className="border rounded px-3 py-2 w-full" required>
                  <option value="">-- Pilih Unit --</option>
                  {sbuUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>

              {/* Multi-select sektor */}
              <div>
                <label className="font-medium block mb-1">Sektor</label>
                <Popover open={openSector} onOpenChange={setOpenSector}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full flex-wrap justify-start gap-2 text-left min-h-[2.5rem]">
                      {form.sectors.length > 0 ? (
                        form.sectors.map((id) => {
                          const sector = sectors.find((s) => s.id.toString() === id);
                          if (!sector) return null;
                          return (
                            <span key={sector.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 mr-1">
                              {sector.code} - {sector.name}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForm((prev) => ({
                                    ...prev,
                                    sectors: prev.sectors.filter((sId) => sId !== sector.id.toString()),
                                    sub_sectors: prev.sub_sectors.filter((ssId) =>
                                      !sector.sub_sectors?.some((ss) => ss.id.toString() === ssId)
                                    ),
                                  }));
                                }}
                                className="ml-1 text-red-600 hover:text-red-800 font-bold"
                              >
                                &times;
                              </button>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-muted-foreground">Pilih sektor...</span>
                      )}
                      <Search className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="min-w-full max-w-sm p-0">
                    <Command>
                      <CommandInput placeholder="Cari sektor..." />
                      <CommandList>
                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {sectors.map((sector) => {
                            const isSelected = form.sectors.includes(sector.id.toString());
                            return (
                              <CommandItem
                                key={sector.id}
                                value={sector.name}
                                onSelect={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    sectors: isSelected
                                      ? prev.sectors.filter((id) => id !== sector.id.toString())
                                      : [...prev.sectors, sector.id.toString()],
                                  }));
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                {sector.code} - {sector.name}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Multi-select sub sektor */}
              <div>
                <label className="font-medium block mb-1">Sub Sektor</label>
                <Popover open={openSubSector} onOpenChange={setOpenSubSector}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full flex-wrap justify-start gap-2 text-left min-h-[2.5rem]">
                      {form.sub_sectors.length > 0 ? (
                        form.sub_sectors.map((id) => {
                          const sub = subSectors.find((s) => s.id.toString() === id);
                          if (!sub) return null;
                          return (
                            <span key={sub.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 mr-1">
                              {sub.code} - {sub.name}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForm((prev) => ({
                                    ...prev,
                                    sub_sectors: prev.sub_sectors.filter((ssId) => ssId !== id),
                                  }));
                                }}
                                className="ml-1 text-red-600 hover:text-red-800 font-bold"
                              >
                                &times;
                              </button>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-muted-foreground">Pilih sub sektor...</span>
                      )}
                      <Search className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="min-w-full max-w-sm p-0">
                    <Command>
                      <CommandInput placeholder="Cari sub sektor..." />
                      <CommandList>
                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {subSectors.map((sub) => {
                            const isSelected = form.sub_sectors.includes(sub.id.toString());
                            return (
                              <CommandItem
                                key={sub.id}
                                value={sub.name}
                                onSelect={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    sub_sectors: isSelected
                                      ? prev.sub_sectors.filter((id) => id !== sub.id.toString())
                                      : [...prev.sub_sectors, sub.id.toString()],
                                  }));
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                {sub.code} - {sub.name}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </>
  );
}

export default EditService;