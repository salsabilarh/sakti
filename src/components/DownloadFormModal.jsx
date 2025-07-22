import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

function DownloadFormModal({ file, onClose }) {
  const { user, authToken } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    purpose: ''
  });

  const handleDownloadSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.purpose) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(
        `https://api-sakti-production.up.railway.app/api/marketing-kits/${file.id}/download`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ purpose: formData.purpose }),
          redirect: 'follow' // Opsional, defaultnya sudah follow
        }
      );

      if (!response.ok && response.status !== 302) {
        throw new Error('Gagal memproses permintaan download');
      }

      // Buka file_path langsung (karena backend redirect)
      const redirectUrl = response.url;
      window.open(redirectUrl, '_blank');

      toast({
        title: "Download dimulai",
        description: `File ${file.name} sedang diproses.`,
      });

      onClose();

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Gagal mengunduh",
        description: "Terjadi kesalahan saat mengunduh file",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Download File</h3>
        <p className="text-sm text-gray-600 mb-4">
          Mohon lengkapi informasi berikut untuk mengunduh: <strong>{file.fileName || file.name}</strong>
        </p>
        
        <form onSubmit={handleDownloadSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled
            />
          </div>
          
          <div>
            <Label htmlFor="purpose">Tujuan Penggunaan</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              placeholder="Contoh: Presentasi klien, proposal bisnis, dll."
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" style={{ backgroundColor: '#000476' }}>
              Download
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default DownloadFormModal;
