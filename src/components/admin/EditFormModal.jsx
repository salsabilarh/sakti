import React, { useState, useEffect } from 'react';
import { Upload, Check, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function EditFormModal({ open, onOpenChange, file, services, authToken, onUpdateSuccess }) {
  const [uploadFile, setUploadFile] = useState(null);
  const [fileType, setFileType] = useState(file?.file_type || '');
  const [serviceId, setServiceId] = useState(file?.service?.id?.toString() || '');
  const [name, setName] = useState(file?.name || '');
  const [loading, setLoading] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (file) {
      setFileType(file.file_type || '');
      setServiceId(file.service?.id?.toString() || '');
      setName(file.name || '');
      setUploadFile(null);
    }
  }, [file]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name || !fileType || !serviceId) {
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
    formData.append('service_id', serviceId);
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
            <div>
              <Label>Nama Layanan</Label>
              <Popover open={openPopover} onOpenChange={setOpenPopover}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="truncate text-left">
                      {serviceId
                        ? services.find(s => s.id.toString() === serviceId)?.name
                        : "Pilih layanan..."}
                    </span>
                    <Check className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                              setOpenPopover(false);
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
              <Label>Tipe File</Label>
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
            <Label>Nama File</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama file"
              required
            />
          </div>

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

