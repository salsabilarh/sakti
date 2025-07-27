import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
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

  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      if (window.botpress) {
        const initBotpress = (selector) => {
          window.botpress.on("webchat:ready", () => {
            window.botpress.open();
          });
          window.botpress.init({
            botId: "ca0e2a53-b7b1-4b4d-90e2-7b93d67b28e0",
            configuration: {
              version: "v1",
              color: "#3276EA",
              variant: "solid",
              headerVariant: "glass",
              themeMode: "light",
              fontFamily: "inter",
              radius: 4,
              feedbackEnabled: false,
              footer: "[⚡ by Botpress](https://botpress.com/?from=webchat)"
            },
            clientId: "48967a19-c892-47f0-8f46-e7cfd3153a98",
            selector: selector
          });
        }

        if (document.querySelector('#webchat')) {
          initBotpress('#webchat');
        }
        if (document.querySelector('#webchat-mobile')) {
          initBotpress('#webchat-mobile');
        }
      }
    `;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: "Login berhasil!",
          description: "Selamat datang di SAKTI Platform"
        });
        navigate(from, { replace: true });
      } else {
        toast({
          title: "Login gagal",
          description: result.error || "Email atau password salah",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - SAKTI Platform</title>
        <meta name="description" content="Login to SAKTI - Service Knowledge Platform with integrated chatbot assistance." />
      </Helmet>

      <div className="min-h-screen w-full grid lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center p-8 bg-white">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
            <div className="mb-8 self-start">
              <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/7e0684c8-f8f8-4241-a5d6-e17a7b2d1451/141feff6f242f1707b20096e0e33b90c.png" alt="SAKTI Logo" className="h-12 mb-6" />
              <h2 className="text-3xl font-bold text-gray-900">Selamat Datang</h2>
              <p className="text-gray-600 mt-2">Masuk untuk melanjutkan ke SAKTI Platform.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="nama@perusahaan.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-[#000476] hover:underline">Lupa Password?</Link>
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Masukkan password" value={password} onChange={e => setPassword(e.target.value)} required className="h-11 pr-10" />
                  <div onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-white font-medium" style={{ backgroundColor: '#000476' }} disabled={loading}>
                {loading ? 'Memproses...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/register">
                <Button variant="outline" className="w-full h-11 border-[#000476] text-[#000476] hover:bg-blue-50">Register</Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:flex flex-col items-center justify-center p-8 bg-gray-50 h-screen">
          <div className="chatbot-container w-full max-w-[550px] flex flex-col items-center text-center">
            <h2 style={{ fontWeight: 700, fontSize: '1.5rem', color: '#000476', marginBottom: '0.5rem' }}>SAKTI Assistant</h2>
            <p style={{ fontSize: '0.95rem', color: '#444', maxWidth: '480px', lineHeight: 1.6, marginBottom: '2rem' }}>
              Looking for the right service? <strong>SAKTI Assistant</strong> helps you explore whether
              <strong> PT SUCOFINDO</strong> can deliver what your business needs. Just ask your question — our chatbot will guide you to the right solution.
            </p>
            <div className="chatbot-box w-full bg-white rounded-lg shadow-md p-2" style={{ height: '500px' }}>
              <div id="webchat" style={{ width: '100%', height: '100%' }}></div>
            </div>
          </div>
        </motion.div>

        <div className="block lg:hidden bg-gray-50 p-8">
          <div className="chatbot-container w-full flex flex-col items-center text-center">
            <h2 style={{ fontWeight: 700, fontSize: '1.5rem', color: '#000476', marginBottom: '0.5rem' }}>🤖 SAKTI Assistant</h2>
            <p style={{ fontSize: '0.95rem', color: '#444', maxWidth: '480px', lineHeight: 1.6, marginBottom: '2rem' }}>
              Looking for the right service? <strong>SAKTI Assistant</strong> helps you explore whether
              <strong> PT SUCOFINDO</strong> can deliver what your business needs. Just ask your question — our chatbot will guide you to the right solution.
            </p>
            <div className="chatbot-box w-full bg-white rounded-lg shadow-md p-2" style={{ height: '400px' }}>
              <div id="webchat-mobile" style={{ width: '100%', height: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
