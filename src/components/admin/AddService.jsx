import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

function AddService() {
  const { toast } = useToast();
  const [newService, setNewService] = useState({
    name: '',
    code: '',
    portfolio: '',
    subPortfolio: '',
    sbuOwner: '',
    sectorCode: '',
    subSectorCode: '',
    customerSectorName: '',
    benefits: '',
    scope: '',
    output: '',
    linkedinUrl: '',
  });

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newService.name || !newService.code) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon lengkapi field Nama Layanan dan Kode Layanan.",
        variant: "destructive"
      });
      return;
    }

    console.log("New Service Data:", newService);
    toast({
      title: "Layanan Baru Ditambahkan!",
      description: `${newService.name} telah berhasil ditambahkan ke sistem.`,
    });
    setNewService({
      name: '', code: '', portfolio: '', subPortfolio: '', sbuOwner: '',
      sectorCode: '', subSectorCode: '', customerSectorName: '',
      benefits: '', scope: '', output: '', linkedinUrl: ''
    });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewService(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setNewService(prev => ({ ...prev, [id]: value }));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Tambah Layanan Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddService} className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="name">Nama Layanan</Label>
              <Input id="name" value={newService.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="code">Kode Layanan</Label>
              <Input id="code" value={newService.code} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="portfolio">Portfolio</Label>
              <Select onValueChange={(v) => handleSelectChange('portfolio', v)} value={newService.portfolio}>
                <SelectTrigger><SelectValue placeholder="Pilih Portfolio" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital-transformation">Digital Transformation</SelectItem>
                  <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="mobile-solutions">Mobile Solutions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subPortfolio">Sub-Portfolio</Label>
              <Input id="subPortfolio" value={newService.subPortfolio} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="sbuOwner">SBU Owner (Unit Pemilik)</Label>
               <Select onValueChange={(v) => handleSelectChange('sbuOwner', v)} value={newService.sbuOwner}>
                <SelectTrigger><SelectValue placeholder="Pilih SBU Owner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sbu-1">SBU 1</SelectItem>
                  <SelectItem value="sbu-2">SBU 2</SelectItem>
                  <SelectItem value="sbu-3">SBU 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customerSectorName">Nama Sektor Pelanggan</Label>
              <Input id="customerSectorName" value={newService.customerSectorName} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="sectorCode">Kode Sektor</Label>
              <Input id="sectorCode" value={newService.sectorCode} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="subSectorCode">Kode Sub-Sektor</Label>
              <Input id="subSectorCode" value={newService.subSectorCode} onChange={handleChange} />
            </div>
             <div>
              <Label htmlFor="linkedinUrl">Link Modul LinkedIn</Label>
              <Input id="linkedinUrl" value={newService.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/learning/..." />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="benefits">Manfaat Jasa</Label>
              <Textarea id="benefits" value={newService.benefits} onChange={handleChange} rows={5} />
            </div>
            <div>
              <Label htmlFor="scope">Ruang Lingkup</Label>
              <Textarea id="scope" value={newService.scope} onChange={handleChange} rows={5} />
            </div>
            <div>
              <Label htmlFor="output">Output</Label>
              <Textarea id="output" value={newService.output} onChange={handleChange} rows={5} />
            </div>
          </div>

          <Button type="submit" style={{ backgroundColor: '#000476' }}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Layanan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default AddService;