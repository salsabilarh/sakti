import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [botpressLoaded, setBotpressLoaded] = useState(false);

  // Refs
  const scriptLoaded = useRef(false);
  const botpressInitialized = useRef(false);

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

  // Load Botpress script
  const loadBotpressScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (scriptLoaded.current && window.botpress) {
        resolve();
        return;
      }

      const existingScript = document.getElementById('botpress-webchat-script');
      if (existingScript) {
        resolve(); // jangan remove, biarkan script tetap ada
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.botpress.cloud/webchat/v3.1/inject.js';
      script.async = true;
      script.id = 'botpress-webchat-script';

      script.onload = () => {
        scriptLoaded.current = true;
        resolve();
      };
      script.onerror = (err) => reject(err);

      document.head.appendChild(script);
    });
  }, []);

  // Initialize Botpress
  const initializeBotpress = useCallback(async () => {
    try {
      if (botpressInitialized.current) return true;
      if (!window.botpress || typeof window.botpress.init !== 'function') {
        console.warn('Botpress not ready yet');
        return false;
      }

      const config = {
        botId: 'af2b4fff-fd14-404d-8184-543b5bc9349b',
        clientId: '471604bd-75df-43c1-80b9-908e3cdf7338',
        selector: '#webchat',
        configuration: {
          version: 'v1',
          botName: 'SAKTI Assistant',
          botAvatar: 'https://files.bpcontent.cloud/2025/07/27/09/20250727093652-HSRR0UDX.png',
          website: {
            title: 'https://www.sucofindo.co.id/',
            link: 'https://www.sucofindo.co.id/'
          },
          email: {
            title: 'customer.service@sucofindo.co.id',
            link: 'customer.service@sucofindo.co.id'
          },
          phone: {
            title: '+62217983666',
            link: '+62217983666'
          },
          color: '#000476',
          variant: 'solid',
          headerVariant: 'solid',
          themeMode: 'dark',
          fontFamily: 'inter',
          radius: 4,
          feedbackEnabled: false,
          footer: '[by SAKTI Assistant](https://botpress.com/?from=webchat)'
        }
      };

      await window.botpress.init(config);

      window.botpress.on("webchat:ready", () => {
        setBotpressLoaded(true);
        window.botpress.open();
      });

      botpressInitialized.current = true;
      return true;
    } catch (err) {
      console.error('Failed to init Botpress:', err);
      return false;
    }
  }, []);

  // Main init
  useEffect(() => {
    const init = async () => {
      try {
        await loadBotpressScript();
        await new Promise(r => setTimeout(r, 500));
        await initializeBotpress();
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [loadBotpressScript, initializeBotpress]);

  const handleSubmit = async (e) => {
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
        <style>{`
          #webchat .bpWebchat {
            position: unset;
            width: 100%;
            height: 100%;
            max-height: 100%;
            max-width: 100%;
          }
          #webchat .bpFab {
            display: none;
          }
        `}</style>
      </Helmet>

      <div className="min-h-screen w-full grid lg:grid-cols-2">
        {/* Left Column - Login Form */}
        <div className="flex flex-col items-center justify-center p-8 bg-white">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            className="w-full max-w-md"
          >
            <div className="mb-4 self-start">
              <img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/7e0684c8-f8f8-4241-a5d6-e17a7b2d1451/141feff6f242f1707b20096e0e33b90c.png" 
                alt="SAKTI Logo" 
                className="h-24 object-contain" 
              />
              <h2 className="text-3xl font-bold text-gray-900">Selamat Datang</h2>
              <p className="text-gray-600 mt-2">Masuk untuk melanjutkan ke SAKTI Platform.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nama@sucofindo.co.id" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="h-11" 
                />
              </div>
              <div className="space-y-2">
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 text-white font-medium hover:opacity-90 transition-opacity" 
                style={{ backgroundColor: '#000476' }} 
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/register">
                <Button 
                  variant="outline" 
                  className="w-full h-11 border-[#000476] text-[#000476] hover:bg-blue-50 transition-colors"
                >
                  Register
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Chatbot */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }} 
          className="hidden lg:flex flex-col items-center justify-center p-8 bg-white h-screen"
        >
          <div className="chatbot-container w-full max-w-[550px] flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-[#000476] mb-2">
              SAKTI Assistant
            </h2>
            <p className="text-sm text-gray-600 max-w-lg leading-relaxed mb-8">
              Looking for the right service? <strong>SAKTI Assistant</strong> helps you explore whether
              <strong> PT SUCOFINDO</strong> can deliver what your business needs. Just ask your question — our chatbot will guide you to the right solution.
            </p>
            <div className="chatbot-box w-full bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '500px' }}>
              <div id="webchat" className="w-full h-full relative">
                {!botpressLoaded && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000476] mx-auto mb-4"></div>
                      <p className="text-sm">Loading SAKTI Assistant...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default LoginPage;
