import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';

function UploadFile({ onUploadSuccess, onClose }) {
  const [uploadFile, setUploadFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [open, setOpen] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { authToken } = useAuth();
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('https://api-sakti-production.up.railway.app/api/services', {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        const data = await res.json();
        setServices(data.services || []);
      } catch (err) {
        console.error('Failed to load services:', err);
      }
    };
    if (authToken) fetchServices();
  }, [authToken]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadedFileUrl('');
    if (!uploadFile || !fileType || !serviceId) {
      toast({
        title: 'Form tidak lengkap',
        description: 'Mohon lengkapi semua field yang diperlukan',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('file_type', fileType);
    formData.append('service_id', serviceId);

    setLoading(true);

    try {
      const response = await fetch('https://api-sakti-production.up.railway.app/api/marketing-kits', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Gagal mengunggah file');

      toast({
        title: 'Berhasil!',
        description: `${uploadFile.name} telah diunggah ke sistem.`,
      });

      setUploadedFileUrl(result.marketing_kit?.file_url || '');
      setUploadFile(null);
      setFileType('');
      setServiceId('');
      e.target.reset?.();
      onUploadSuccess?.();
      onClose?.(); // 🔒 Tutup form/modal setelah berhasil upload
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Gagal',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
              <Label>Nama Layanan</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between flex items-center min-w-0"
                  >
                    <span
                      className="truncate text-left"
                      title={
                        serviceId
                          ? services.find(s => s.id.toString() === serviceId)?.name
                          : 'Pilih layanan...'
                      }
                    >
                      {serviceId
                        ? services.find(s => s.id.toString() === serviceId)?.name
                        : "Pilih layanan..."}
                    </span>
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-full max-w-sm p-0">
                  <Command>
                    <CommandInput placeholder="Cari layanan..." />
                    <CommandList>
                      <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {services.map(service => (
                          <CommandItem
                            key={service.id}
                            value={service.id.toString()}
                            onSelect={(val) => {
                              setServiceId(val);
                              setOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", serviceId === service.id.toString() ? "opacity-100" : "opacity-0")} />
                            {service.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="fileType">Tipe File</Label>
              <Select onValueChange={setFileType} value={fileType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe file" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Flyer">Flyer</SelectItem>
                  <SelectItem value="Pitch Deck">Pitch Deck</SelectItem>
                  <SelectItem value="Brochure">Brochure</SelectItem>
                  <SelectItem value="Case Study">Case Study</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
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

          <Button type="submit" style={{ backgroundColor: '#000476' }} disabled={loading}>
            {loading ? 'Mengunggah...' : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </Button>

          {uploadedFileUrl && (
            <p className="mt-4 text-sm text-green-600">
              File berhasil diunggah.{' '}
              <a
                href={uploadedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
                Download file di sini
              </a>
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default UploadFile;
