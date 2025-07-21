import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

function AddService() {
  const { authToken } = useAuth();
  const navigate = useNavigate();

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
    sectors: [],
    sub_sectors: [],
  });

  const [portfolios, setPortfolios] = useState([]);
  const [subPortfolios, setSubPortfolios] = useState([]);
  const [units, setUnits] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [subSectors, setSubSectors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = async () => {
    try {
      const endpoints = [
        ['portfolios', setPortfolios],
        ['sub-portfolios', setSubPortfolios],
        ['units', setUnits],
        ['sectors', setSectors],
        ['sub-sectors', setSubSectors],
      ];

      for (const [path, setter] of endpoints) {
        const res = await fetch(`https://api-sakti-production.up.railway.app/api/${path}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await res.json();
        setter(data[path.replace('-', '_')] || []);
      }
    } catch (error) {
      console.error('Gagal memuat data referensi:', error.message);
    }
  };

  useEffect(() => {
    if (authToken) fetchOptions();
  }, [authToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const values = Array.from(options).filter(o => o.selected).map(o => o.value);
    setForm(prev => ({ ...prev, [name]: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`https://api-sakti-production.up.railway.app/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Gagal menambahkan layanan');
      }

      alert('✅ Layanan berhasil ditambahkan');
      navigate('/services');
    } catch (error) {
      console.error('Gagal menambahkan layanan:', error.message);
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Layanan Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="name" placeholder="Nama Layanan *" value={form.name} onChange={handleChange} required />
              <Input name="group" placeholder="Group" value={form.group} onChange={handleChange} />
              <Input name="intro_video_url" placeholder="Intro Video URL" value={form.intro_video_url} onChange={handleChange} />
              <Input name="regulation_ref" placeholder="Referensi Regulasi" value={form.regulation_ref} onChange={handleChange} />
              <select name="portfolio_id" value={form.portfolio_id} onChange={handleChange} className="border p-2 rounded">
                <option value="">Pilih Portfolio</option>
                {portfolios.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select name="sub_portfolio_id" value={form.sub_portfolio_id} onChange={handleChange} className="border p-2 rounded">
                <option value="">Pilih Sub-Portfolio</option>
                {subPortfolios.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
              <select name="sbu_owner_id" value={form.sbu_owner_id} onChange={handleChange} className="border p-2 rounded">
                <option value="">Pilih Unit Pemilik</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea name="overview" placeholder="Overview" value={form.overview} onChange={handleChange} />
              <Textarea name="scope" placeholder="Scope" value={form.scope} onChange={handleChange} />
              <Textarea name="benefit" placeholder="Benefit" value={form.benefit} onChange={handleChange} />
              <Textarea name="output" placeholder="Output" value={form.output} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Sektor</label>
                <select name="sectors" multiple value={form.sectors} onChange={handleMultiSelectChange} className="w-full border rounded p-2 h-32">
                  {sectors.map(sector => (
                    <option key={sector.id} value={sector.id}>{sector.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Sub-Sektor</label>
                <select name="sub_sectors" multiple value={form.sub_sectors} onChange={handleMultiSelectChange} className="w-full border rounded p-2 h-32">
                  {subSectors.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Layanan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddService;
