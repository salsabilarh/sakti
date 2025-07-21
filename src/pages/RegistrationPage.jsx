import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const fetchWorkUnits = async () => {
      try {
        const response = await fetch('https://api-sakti-production.up.railway.app/api/units');
        const data = await response.json();
        setWorkUnits(data.units);  // <-- perbaikan di sini, bukan data.data tapi data.units
      } catch (error) {
        console.error('Gagal memuat data unit kerja:', error);
      }
    };
    fetchWorkUnits();
  }, []);

  const isStrongPassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    return regex.test(password);
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
      toast({
        title: 'Konfirmasi password tidak cocok',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (!isStrongPassword(formData.password)) {
      toast({
        title: 'Password tidak kuat',
        description: 'Minimal 8 karakter dan mengandung huruf besar, huruf kecil, angka, dan simbol.',
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

    // lanjut ke fetch API
    try {
      const response = await fetch(
        'https://api-sakti-production.up.railway.app/api/auth/register',
        {
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
        }
      );

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        result = { message: text };
      }

      if (!response.ok) {
        throw new Error(result.message || 'Registrasi gagal');
      }

      toast({
        title: 'Pendaftaran berhasil!',
        description: 'Akun Anda telah dibuat. Silakan login.',
      });

      navigate('/login');
    } catch (error) {
      toast({
        title: 'Gagal mendaftar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Daftar Akun</CardTitle>
          <CardDescription>Masukkan data Anda untuk membuat akun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input id="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
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
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
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
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workUnit">Unit Kerja</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, workUnit: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih unit kerja" />
                </SelectTrigger>
                <SelectContent>
                  {workUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Peran</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, role: value })} required>
                <SelectTrigger>
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Daftar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationPage;
