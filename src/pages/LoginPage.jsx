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
  const [initializationAttempt, setInitializationAttempt] = useState(0);
  
  // Refs untuk mencegah multiple initialization
  const desktopInitialized = useRef(false);
  const mobileInitialized = useRef(false);
  const scriptLoaded = useRef(false);

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

  // Function untuk memuat script Botpress
  const loadBotpressScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      // Jika script sudah dimuat sebelumnya
      if (scriptLoaded.current && window.botpress) {
        resolve();
        return;
      }

      // Hapus script lama jika ada
      const existingScript = document.getElementById('botpress-webchat-script');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.botpress.cloud/webchat/v3.1/inject.js';
      script.async = true;
      script.id = 'botpress-webchat-script';
      
      script.onload = () => {
        console.log('Botpress script loaded');
        
        // Tunggu sampai window.botpress tersedia
        const waitForBotpress = (attempts = 0) => {
          if (window.botpress && typeof window.botpress.init === 'function') {
            scriptLoaded.current = true;
            resolve();
          } else if (attempts < 50) { // Increased attempts
            setTimeout(() => waitForBotpress(attempts + 1), 100);
          } else {
            reject(new Error('Botpress object not available after script load'));
          }
        };
        
        waitForBotpress();
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Botpress script:', error);
        reject(new Error('Failed to load Botpress script'));
      };
      
      document.head.appendChild(script);
    });
  }, []);

  // Function untuk inisialisasi Botpress pada selector tertentu
  const initializeBotpress = useCallback(async (selector, isDesktop = true) => {
    try {
      console.log(`Attempting to initialize Botpress for ${selector}`);
      
      // Check if already initialized
      if (isDesktop && desktopInitialized.current) {
        console.log('Desktop Botpress already initialized');
        return;
      }
      if (!isDesktop && mobileInitialized.current) {
        console.log('Mobile Botpress already initialized');
        return;
      }

      if (!window.botpress || typeof window.botpress.init !== 'function') {
        console.warn('Botpress not available yet');
        return false;
      }

      const element = document.querySelector(selector);
      if (!element) {
        console.warn(`Element with selector ${selector} not found`);
        return false;
      }

      // Clear existing content
      element.innerHTML = '';

      // Configure Botpress
      const botpressConfig = {
        botId: 'ca0e2a53-b7b1-4b4d-90e2-7b93d67b28e0',
        clientId: '48967a19-c892-47f0-8f46-e7cfd3153a98',
        selector: selector,
        configuration: {
          version: 'v1',
          botName: 'SAKTI Assistant',
          botAvatar: 'https://files.bpcontent.cloud/2025/07/27/09/20250727093652-HSRR0UDX.png',
          color: '#3276EA',
          variant: 'solid',
          headerVariant: 'glass',
          themeMode: 'light',
          fontFamily: 'inter',
          radius: 4,
          feedbackEnabled: false,
          footer: '[⚡ SAKTI Assistant](https://botpress.com/?from=webchat)',
          email: {
            title: 'customer.service@sucofindo.co.id',
            link: 'mailto:customer.service@sucofindo.co.id',
          },
        }
      };

      // Initialize Botpress
      await window.botpress.init(botpressConfig);
      
      // Mark as initialized
      if (isDesktop) {
        desktopInitialized.current = true;
      } else {
        mobileInitialized.current = true;
      }

      console.log(`Botpress successfully initialized for ${selector}`);

      // Set up event listeners
      if (window.botpress.on) {
        window.botpress.on('webchat:ready', () => {
          console.log(`Webchat ready for ${selector}`);
          // Auto-open after a delay
          setTimeout(() => {
            if (window.botpress && typeof window.botpress.open === 'function') {
              window.botpress.open();
            }
          }, 1500);
        });
      }

      return true;
    } catch (error) {
      console.error(`Failed to initialize Botpress for ${selector}:`, error);
      return false;
    }
  }, []);

  // Main initialization function
  const initializeBotpressChats = useCallback(async () => {
    try {
      console.log('Starting Botpress initialization...');
      
      // Load script first
      await loadBotpressScript();
      setBotpressLoaded(true);
      
      // Wait a bit for DOM to be stable
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to initialize both chats
      const desktopSuccess = await initializeBotpress('#webchat', true);
      const mobileSuccess = await initializeBotpress('#webchat-mobile', false);
      
      if (desktopSuccess || mobileSuccess) {
        console.log('At least one Botpress instance initialized successfully');
      } else {
        console.warn('Failed to initialize any Botpress instance');
        // Retry after a delay
        setTimeout(() => {
          setInitializationAttempt(prev => prev + 1);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Failed to initialize Botpress chats:', error);
      setBotpressLoaded(false);
      
      // Retry mechanism
      if (initializationAttempt < 3) {
        console.log(`Retry attempt ${initializationAttempt + 1}/3`);
        setTimeout(() => {
          setInitializationAttempt(prev => prev + 1);
        }, 3000);
      }
    }
  }, [loadBotpressScript, initializeBotpress, initializationAttempt]);

  // Initialize on component mount and retry attempts
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeBotpressChats();
    }, 1000); // Initial delay

    return () => clearTimeout(timer);
  }, [initializeBotpressChats, initializationAttempt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset refs on unmount
      desktopInitialized.current = false;
      mobileInitialized.current = false;
      scriptLoaded.current = false;
    };
  }, []);

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
            <div className="mb-8 self-start">
              <img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/7e0684c8-f8f8-4241-a5d6-e17a7b2d1451/141feff6f242f1707b20096e0e33b90c.png" 
                alt="SAKTI Logo" 
                className="h-12 mb-6" 
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
                  placeholder="nama@sucofindo.com" 
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

        {/* Right Column - Desktop Chatbot */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }} 
          className="hidden lg:flex flex-col items-center justify-center p-8 bg-gray-50 h-screen"
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
              <div 
                id="webchat" 
                className="w-full h-full relative"
              >
                {!botpressLoaded && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000476] mx-auto mb-4"></div>
                      <p className="text-sm">Loading SAKTI Assistant...</p>
                      {initializationAttempt > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                          Attempt {initializationAttempt + 1}/4
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Chatbot */}
        <div className="block lg:hidden bg-gray-50 p-8">
          <div className="chatbot-container w-full flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-[#000476] mb-2">
              🤖 SAKTI Assistant
            </h2>
            <p className="text-sm text-gray-600 max-w-lg leading-relaxed mb-8">
              Looking for the right service? <strong>SAKTI Assistant</strong> helps you explore whether
              <strong> PT SUCOFINDO</strong> can deliver what your business needs. Just ask your question — our chatbot will guide you to the right solution.
            </p>
            <div className="chatbot-box w-full bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '400px' }}>
              <div 
                id="webchat-mobile" 
                className="w-full h-full relative"
              >
                {!botpressLoaded && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000476] mx-auto mb-4"></div>
                      <p className="text-sm">Loading SAKTI Assistant...</p>
                      {initializationAttempt > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                          Attempt {initializationAttempt + 1}/4
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;