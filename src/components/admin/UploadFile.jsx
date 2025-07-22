import React, { useState } from 'react';
import { Upload, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const mockServices = [
  { value: 'konsultasi-strategi-digital', label: 'Konsultasi Strategi Digital' },
  { value: 'audit-keamanan-siber', label: 'Audit Keamanan Siber' },
  { value: 'pengembangan-aplikasi-mobile', label: 'Pengembangan Aplikasi Mobile' },
  { value: 'analitik-data-bisnis', label: 'Analitik Data Bisnis' },
  { value: 'solusi-cloud-enterprise', label: 'Solusi Cloud Enterprise' },
];

function UploadFile() {
  const [uploadFile, setUploadFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !fileType || !serviceName) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('file_type', fileType);
    formData.append('service_id', serviceName);
    formData.append('name', uploadFile.name);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/marketing-kit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal upload file');
      }

      toast({
        title: "File Berhasil Diupload!",
        description: `${uploadFile.name} telah ditambahkan ke marketing kit.`,
      });

      // Reset form
      setUploadFile(null);
      setFileType('');
      setServiceName('');
      e.target.reset();
    } catch (error) {
      toast({
        title: "Upload gagal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Upload File Marketing</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFileUpload} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fileType">Tipe File</Label>
              <Select onValueChange={setFileType} value={fileType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe file" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flyer">Flyer</SelectItem>
                  <SelectItem value="pitch-deck">Pitch Deck</SelectItem>
                  <SelectItem value="brochure">Brochure</SelectItem>
                  <SelectItem value="case-study">Case Study</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nama Layanan</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    {serviceName ? mockServices.find(s => s.value === serviceName)?.label : "Pilih layanan..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Cari layanan..." />
                    <CommandList>
                      <CommandEmpty>Layanan tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {mockServices.map((service) => (
                          <CommandItem
                            key={service.value}
                            value={service.value}
                            onSelect={(currentValue) => {
                              setServiceName(currentValue === serviceName ? "" : currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", serviceName === service.value ? "opacity-100" : "opacity-0")} />
                            {service.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div>
            <Label htmlFor="file">Pilih File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setUploadFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
            />
            <p className="text-sm text-gray-500 mt-1">
              Format yang didukung: PDF, DOC, DOCX, PPT, PPTX
            </p>
          </div>
          <Button type="submit" style={{ backgroundColor: '#000476' }}>
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default UploadFile;