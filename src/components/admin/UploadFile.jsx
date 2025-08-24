import React, { useState, useEffect } from 'react';
import { Upload, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

function UploadFile({ onUploadSuccess, onClose }) {
  const [uploadFiles, setUploadFiles] = useState([]); // array of files
  const [fileType, setFileType] = useState('');
  const [serviceIds, setServiceIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { authToken } = useAuth();
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('https://api-sakti-production.up.railway.app/api/services?limit=9999', {
          headers: { Authorization: `Bearer ${authToken}` }
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
    setUploadedFiles([]);

    if (uploadFiles.length === 0) {
      toast({ 
        title: "Form tidak lengkap", 
        description: "Minimal pilih 1 file", 
        variant: "destructive" 
      });
      return;
    }

    const formData = new FormData();
    uploadFiles.forEach(item => {
      formData.append("files", item.file);
      formData.append("file_types[]", item.fileType);
    });

    serviceIds.forEach(id => {
      formData.append("service_ids[]", id);
    });

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
      if (!response.ok) {
        throw new Error(result.error || result.message || "Gagal mengunggah file");
      }

      toast({
        title: 'Berhasil!',
        description: `${uploadFiles.length} file telah diunggah ke sistem.`,
      });

      setUploadedFiles(result.marketing_kits || []);
      setUploadFiles([]);
      setFileType('');
      setServiceIds([]);
      e.target.reset?.();
      onUploadSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Upload error:', error);

      toast({
        title: 'Upload Gagal',
        description: error.message, // tampilkan pesan detail dari backend
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader>
        <CardTitle>Upload File Marketing</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFileUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* Multi-select Services */}
            <div>
              <Label htmlFor="services">Layanan Terkait</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full flex flex-wrap justify-start items-start min-h-[5rem] gap-2 overflow-y-auto max-h-40 text-left"
                  >
                    {serviceIds.length > 0 ? (
                      serviceIds.map((id) => {
                        const service = services.find((s) => s.id.toString() === id.toString());
                        if (!service) return null;
                        return (
                          <span
                            key={service.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                          >
                            {service.code}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setServiceIds((prev) =>
                                  prev.filter((serviceId) => serviceId !== service.id.toString())
                                );
                              }}
                              className="ml-1 text-red-600 hover:text-red-800 font-bold"
                              title="Hapus"
                            >
                              &times;
                            </button>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-muted-foreground">Pilih layanan...</span>
                    )}
                    <Search className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-full max-w-sm p-0">
                  <Command>
                    <CommandInput
                      placeholder="Cari layanan..."
                      onValueChange={(value) => setSearchTerm(value.toLowerCase())}
                    />
                    <CommandList className="max-h-64 overflow-y-auto">
                      <CommandEmpty>Layanan tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {services
                          .filter((service) => {
                            const keyword = searchTerm.trim().toLowerCase();
                            if (!keyword) return true;
                            const nameMatch = service.name?.toLowerCase().split(' ').some(word => word.startsWith(keyword));
                            const codeMatch = service.code?.toLowerCase().startsWith(keyword);
                            return nameMatch || codeMatch;
                          })
                          .map((service) => {
                            const isSelected = serviceIds.includes(service.id.toString());
                            return (
                              <CommandItem
                                key={service.id}
                                value={`${service.id}-${service.name}-${service.code || ''}`}
                                onSelect={() => {
                                  setServiceIds((prev) =>
                                    isSelected
                                      ? prev.filter((id) => id !== service.id.toString())
                                      : [...prev, service.id.toString()]
                                  );
                                }}
                              >
                                <Check
                                  className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{service.name}</span>
                                  {service.code && (
                                    <span className="text-xs text-gray-500">{service.code}</span>
                                  )}
                                </div>
                              </CommandItem>
                            );
                          })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="file">Pilih File</Label>
            <Input
              id="file"
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                const newFiles = files.map(f => ({
                  file: f,
                  fileType: ""
                }));
                setUploadFiles(prev => [...prev, ...newFiles]);
                e.target.value = "";
              }}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
            />
            <p className="text-sm text-gray-500 mt-1">
              Format yang didukung: PDF, DOC, DOCX, PPT, PPTX
            </p>

            {/* Preview file + tipe file */}
            {uploadFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                {uploadFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50"
                  >
                    {/* Nama file */}
                    <span className="flex-1 text-sm font-medium truncate max-w-[250px] overflow-hidden whitespace-nowrap">
                      {item.file.name}
                    </span>

                    {/* Pilih tipe file */}
                    <Select
                      value={item.fileType}
                      onValueChange={(val) => {
                        const copy = [...uploadFiles];
                        copy[idx].fileType = val;
                        setUploadFiles(copy);
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Pilih tipe file" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Flyer">Flyer</SelectItem>
                        <SelectItem value="Pitch Deck">Pitch Deck</SelectItem>
                        <SelectItem value="Brochure">Brochure</SelectItem>
                        <SelectItem value="Technical Document">Technical Document</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Tombol hapus */}
                    <button
                      type="button"
                      onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" style={{ backgroundColor: '#000476' }} disabled={loading}>
            {loading ? 'Mengunggah...' : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </Button>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-green-600 font-medium">
                {uploadedFiles.length} file berhasil diunggah:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700">
                {uploadedFiles.map((file) => (
                  <li key={file.id}>
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {file.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default UploadFile;
