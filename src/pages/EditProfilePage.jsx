import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import api from '@/lib/api'; // pastikan sudah ada axios instance disini

import { Eye, EyeOff } from 'lucide-react'; // icon show/hide password

function EditProfilePage() {
  const { user, updateUser, authToken } = useAuth();
  const { toast } = useToast();

  // State untuk profile info
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
  });

  // State untuk password & show/hide password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State untuk unit kerja
  const [units, setUnits] = useState([]);
  const [newUnitId, setNewUnitId] = useState('');

  // Ambil data unit dari API saat komponen mount
  useEffect(() => {
    async function fetchUnits() {
      try {
        const response = await api.get('/units');
        setUnits(response.data.units || []);
      } catch (error) {
        toast({
          title: "Gagal memuat data unit",
          description: "Tidak dapat mengambil daftar unit kerja.",
          variant: "destructive",
        });
      }
    }
    fetchUnits();
  }, [toast]);

  // Update form profile info
  const handleInfoChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Update password input
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.id]: e.target.value });
  };

  // Submit update profil (hanya nama di sini)
  const handleInfoSubmit = (e) => {
    e.preventDefault();
    updateUser({ name: formData.name });
    toast({
      title: "Profil Diperbarui!",
      description: "Informasi profil Anda berhasil diperbarui.",
    });
  };

  // Submit update password dengan validasi
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(passwordData.newPassword)) {
      toast({
        title: "Password Lemah",
        description: "Gunakan minimal 8 karakter dengan huruf besar, kecil, angka, dan simbol.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Tidak Cocok",
        description: "Password baru dan konfirmasi tidak sesuai.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.put(
        '/auth/update-password',
        {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      toast({
        title: "Password Diubah!",
        description: response.data.message || "Password berhasil diubah.",
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      const message = error.response?.data?.message || "Gagal memperbarui password. Coba lagi.";
      toast({
        title: "Gagal Mengubah Password",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Submit request perubahan unit kerja
  const handleUnitChangeRequest = async () => {
    if (!newUnitId) {
      toast({
        title: "Pilih Unit Kerja",
        description: "Silakan pilih unit kerja baru.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post(
        '/auth/unit-change-request',
        { requested_unit_id: newUnitId },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      toast({
        title: "Permintaan Terkirim",
        description: "Permintaan perubahan unit kerja telah dikirim ke admin untuk persetujuan.",
      });

      setNewUnitId('');
    } catch (error) {
      toast({
        title: "Gagal Mengirim Permintaan",
        description: error.response?.data?.message || "Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Edit Profile - SAKTI Platform</title>
        <meta name="description" content="Manage your profile information and password." />
      </Helmet>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profil</h1>
          <p className="text-gray-600">Kelola informasi profil dan kata sandi Anda.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bagian Profil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleInfoChange}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled />
                  </div>
                  <div>
                    <Label htmlFor="unit_kerja">Unit Kerja</Label>
                    <Input id="unit_kerja" value={user?.unit_kerja || ''} disabled />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={user?.role || ''} disabled />
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type="button" style={{ backgroundColor: '#000476' }}>
                          Request Ganti Unit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Request Perubahan Unit Kerja</DialogTitle>
                          <DialogDescription>
                            Pilih unit kerja baru Anda. Permintaan akan dikirim ke admin untuk persetujuan.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newUnit" className="text-right">
                              Unit Baru
                            </Label>
                            <div className="col-span-3">
                              <Select onValueChange={setNewUnitId} value={newUnitId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih unit..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {units.map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id}>
                                      {unit.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Batal
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              onClick={handleUnitChangeRequest}
                              style={{ backgroundColor: '#000476' }}
                            >
                              Kirim Permintaan
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bagian Ubah Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Ubah Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-[38px] text-gray-500"
                      aria-label={showCurrentPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-[38px] text-gray-500"
                      aria-label={showNewPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[38px] text-gray-500"
                      aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <Button type="submit" style={{ backgroundColor: '#000476' }}>
                    Ubah Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default EditProfilePage;
