import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [workUnits, setWorkUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    workUnit: '',
    role: '',
  });

  const shouldShowUnitKerja = formData.role && !['admin', 'viewer'].includes(formData.role);

  useEffect(() => {
    const fetchWorkUnits = async () => {
      try {
        const response = await fetch('https://api-sakti-production.up.railway.app/api/units');
        const data = await response.json();
        setWorkUnits(data.units);
      } catch (error) {
        console.error('Gagal memuat data unit kerja:', error);
      }
    };
    fetchWorkUnits();
  }, []);

  useEffect(() => {
    if (formData.role === 'admin' || formData.role === 'viewer') {
      setFormData((prev) => ({ ...prev, workUnit: '' }));
    }
  }, [formData.role]);

  const isStrongPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const validRoles = ['admin', 'management', 'viewer', 'pdo'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Konfirmasi password tidak cocok', variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (!isStrongPassword(formData.password)) {
      toast({
        title: 'Password tidak kuat',
        description: 'Minimal 8 karakter dan mengandung huruf besar, kecil, angka, dan simbol.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (!validRoles.includes(formData.role)) {
      toast({
        title: 'Role tidak valid',
        description: 'Silakan pilih peran yang valid.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://api-sakti-production.up.railway.app/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          full_name: formData.fullName,
          unit_kerja_id: formData.workUnit,
          role: formData.role,
        }),
      });

      if (shouldShowUnitKerja && !formData.workUnit) {
        toast({
          title: 'Unit Kerja wajib diisi',
          description: 'Silakan pilih unit kerja untuk role yang dipilih.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      const text = await response.text();
      const result = JSON.parse(text || '{}');

      if (!response.ok) throw new Error(result.message || 'Registrasi gagal');

      toast({ title: 'Pendaftaran berhasil!', description: 'Akun Anda telah dibuat. Silakan login.' });
      navigate('/login');
    } catch (error) {
      toast({ title: 'Gagal mendaftar', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Daftar - SAKTI Platform</title>
        <meta name="description" content="Buat akun SAKTI - Service Knowledge Platform untuk analitik dan katalog layanan" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Buat Akun Baru</h2>
              <p className="text-gray-600">Isi data Anda untuk mendaftar ke platform SAKTI</p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Registrasi</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input id="fullName" value={formData.fullName} onChange={handleChange} required className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} required className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="h-11 pr-10"
                      />
                      <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 cursor-pointer text-gray-500"
                        style={{ transform: 'translateY(-50%)' }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="h-11 pr-10"
                      />
                      <div
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 cursor-pointer text-gray-500"
                        style={{ transform: 'translateY(-50%)' }}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Peran</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, role: value })} required>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Pilih peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="pdo">PDO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {shouldShowUnitKerja && (
                    <div className="space-y-2">
                      <Label htmlFor="workUnit">Unit Kerja</Label>
                      <Select
                        value={formData.workUnit}
                        onValueChange={(value) => setFormData({ ...formData, workUnit: value })}
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Pilih unit kerja" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {workUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id.toString()}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button type="submit" className="w-full h-11 text-white font-medium" style={{ backgroundColor: '#000476' }} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Daftar'}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex-col items-start">
                <p className="text-sm text-gray-600">
                  Sudah punya akun?{' '}
                  <Link to="/login" className="font-medium text-[#000476] hover:underline">
                    Login di sini
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="text-center">
              <img
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/7e0684c8-f8f8-4241-a5d6-e17a7b2d1451/141feff6f242f1707b20096e0e33b90c.png"
                alt="SAKTI Logo"
                className="h-20 mx-auto mb-8"
              />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gabung ke SAKTI Platform</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Kelola layanan, unit kerja, dan katalog perusahaan secara efisien dan terstruktur.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RegistrationPage;
