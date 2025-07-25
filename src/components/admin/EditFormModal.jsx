import React, { useState, useEffect } from 'react';
import { Save, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

function EditFormModal({ open, onOpenChange, file, services, authToken, onUpdateSuccess }) {
  const [uploadFile, setUploadFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [serviceIds, setServiceIds] = useState([]); // support multiple
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (file) {
      setFileType(file.file_type || '');
      setServiceIds(file.services?.map(s => s.id.toString()) || []);
      setName(file.name || '');
      setUploadFile(null);
    }
  }, [file]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name || !fileType || serviceIds.length === 0) {
      toast({
        title: 'Form tidak lengkap',
        description: 'Mohon lengkapi semua field yang diperlukan',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('file_type', fileType);
    serviceIds.forEach(id => formData.append('service_ids[]', id));
    if (uploadFile) formData.append('file', uploadFile);

    setLoading(true);
    try {
      const response = await fetch(`https://api-sakti-production.up.railway.app/api/marketing-kits/${file.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal memperbarui file');

      toast({
        title: 'Berhasil!',
        description: `${name} berhasil diperbarui.`,
      });

      onUpdateSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Gagal memperbarui',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit File Marketing</DialogTitle>
          <DialogDescription>Perbarui informasi file marketing kit ini.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Multi-select Services */}
            <div>
              <Label>Layanan Terkait</Label>
              <Popover open={openPopover} onOpenChange={setOpenPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex-wrap justify-start gap-2 text-left min-h-[2.5rem]"
                  >
                    {serviceIds.length > 0 ? (
                      services
                        .filter(s => serviceIds.includes(s.id.toString()))
                        .map(s => (
                          <span
                            key={s.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 mr-1"
                          >
                            {s.code}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setServiceIds(prev => prev.filter(id => id !== s.id.toString()));
                              }}
                              className="ml-1 text-red-600 hover:text-red-800 font-bold"
                              title="Hapus"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                    ) : (
                      <span className="text-muted-foreground">Pilih layanan...</span>
                    )}
                    <Search className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-full max-w-sm p-0">
                  <Command>
                    <CommandInput placeholder="Cari layanan..." />
                    <CommandList>
                      <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {services.map(service => {
                          const isSelected = serviceIds.includes(service.id.toString());
                          return (
                            <CommandItem
                              key={service.id}
                              value={service.id.toString()}
                              onSelect={() => {
                                setServiceIds(prev =>
                                  isSelected
                                    ? prev.filter(id => id !== service.id.toString())
                                    : [...prev, service.id.toString()]
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {service.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* File Type */}
            <div>
              <Label>Tipe File</Label>
              <Select onValueChange={setFileType} value={fileType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe file" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Flyer">Flyer</SelectItem>
                  <SelectItem value="Pitch Deck">Pitch Deck</SelectItem>
                  <SelectItem value="Brochure">Brochure</SelectItem>
                  <SelectItem value="Technical Document">Technical Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Name */}
          <div>
            <Label>Nama File</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama file"
              required
            />
          </div>

          {/* Upload Baru */}
          <div>
            <Label>Upload File Baru (opsional)</Label>
            <Input
              type="file"
              onChange={(e) => setUploadFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
            />
            <p className="text-sm text-gray-500 mt-1">
              Kosongkan jika tidak ingin mengganti file.
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} style={{ backgroundColor: '#000476' }}>
              {loading ? 'Menyimpan...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditFormModal;
