import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.jsx';
import { useToast } from '@/components/ui/use-toast.js';

function RegistrationPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    workUnit: '',
    role: '',
    password: '',
  });
  const [workUnitOptions, setWorkUnitOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // 🔁 Fetch work unit data on mount
  useEffect(() => {
    const fetchWorkUnits = async () => {
      try {
        const response = await fetch(
          'https://api-sakti-production.up.railway.app/api/units',
          {
            headers: {
              Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAzOWJmMWJlLTU5MmMtNDE5YS1iZjNlLTMxYjJlNTdhZGM4YiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1Mjk1MjEyMywiZXhwIjoxNzU1NTQ0MTIzfQ.LRgjkK0aYMT4cWnUQo6KfLLlvF3FLXN8Cv8EoteKZ_I',
            },
          }
        );

        const data = await response.json();
        const options = data.units.map((unit) => ({
          label: unit.name,
          value: unit.id,
        }));
        setWorkUnitOptions(options);
      } catch (error) {
        toast({
          title: 'Gagal memuat unit kerja',
          description: 'Silakan coba beberapa saat lagi.',
          variant: 'destructive',
        });
      }
    };

    fetchWorkUnits();
  }, [toast]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        'https://api-sakti-production.up.railway.app/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
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
    <>
      <Helmet>
        <title>Registrasi - SAKTI Platform</title>
        <meta
          name="description"
          content="Create a new account for SAKTI Platform"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/7e0684c8-f8f8-4241-a5d6-e17a7b2d1451/141feff6f242f1707b20096e0e33b90c.png"
                alt="SAKTI Logo"
                className="h-10"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Buat Akun Baru
            </h2>
            <p className="text-gray-600">
              Daftarkan diri Anda untuk mulai menggunakan platform.
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Form Pendaftaran</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workUnit">Unit Kerja</Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange('workUnit', value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih unit kerja" />
                    </SelectTrigger>
                    <SelectContent>
                      {workUnitOptions.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange('role', value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role Anda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manajemen">Manajemen</SelectItem>
                      <SelectItem value="pdo">PDO</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-white font-medium"
                  style={{ backgroundColor: '#000476' }}
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Daftar'}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-600 w-full text-center">
                Sudah punya akun?{' '}
                <Link
                  to="/login"
                  className="font-medium text-[#000476] hover:underline"
                >
                  Login di sini
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </>
  );
}

export default RegistrationPage;
