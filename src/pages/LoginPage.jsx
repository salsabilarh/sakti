import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Eye, EyeOff } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Asumsikan login adalah async dan mengembalikan response API seperti backend yang kamu tunjukkan
      const result = await login(email, password);

      if (result.success) {
        toast({
          title: "Login berhasil!",
          description: "Selamat datang di SAKTI Platform",
        });
        navigate(from, { replace: true });
      } else {
        // Tampilkan pesan error backend jika ada, fallback ke pesan default
        toast({
          title: "Login gagal",
          description: result.message || result.error || "Email atau password salah",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: error.message || "Silakan coba lagi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - SAKTI Platform</title>
        <meta name="description" content="Login to SAKTI - Service Knowledge Platform for integrated analytics and catalog management" />
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Selamat Datang Kembali
              </h2>
              <p className="text-gray-600">
                Masuk ke akun Anda untuk mengakses platform SAKTI
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nama@sucofindo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-[#000476] hover:underline">
                        Lupa Password?
                      </Link>
                    </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Masukkan password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-11 pr-10"
                        />
                        <div
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 cursor-pointer text-gray-500"
                          style={{ transform: 'translateY(-50%)' }}
                          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </div>
                      </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-11 text-white font-medium"
                    style={{ backgroundColor: '#000476' }}
                    disabled={loading}
                  >
                    {loading ? 'Memproses...' : 'Login'}
                  </Button>
                </form>
                
              </CardContent>
              <CardFooter className="flex-col items-start">
                <p className="text-sm text-gray-600">
                  Belum punya akun?{' '}
                  <Link to="/register" className="font-medium text-[#000476] hover:underline">
                    Daftar sekarang
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
              <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/7e0684c8-f8f8-4241-a5d6-e17a7b2d1451/141feff6f242f1707b20096e0e33b90c.png" alt="SAKTI Logo" className="h-20 mx-auto mb-8" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Sistem Akses Kilat Terpadu Informasi Jasa
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Platform terpadu untuk mengelola layanan dan dokumentasi dengan mudah dan efisien
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
