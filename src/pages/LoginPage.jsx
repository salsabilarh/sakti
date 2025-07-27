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
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs untuk mencegah multiple initialization
  const desktopInitialized = useRef(false);
  const mobileInitialized = useRef(false);
  const scriptLoaded = useRef(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/dashboard";

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        console.log('Botpress script already loaded');
        resolve();
        return;
      }

      // Hapus script lama jika ada
      const existingScript = document.getElementById('botpress-webchat-script');
      if (existingScript) {
        existingScript.remove();
        console.log('Removed existing Botpress script');
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.botpress.cloud/webchat/v3.1/inject.js';
      script.async = true;
      script.id = 'botpress-webchat-script';
      
      script.onload = () => {
        console.log('Botpress script loaded successfully');
        
        // Tunggu sampai window.botpress tersedia
        const waitForBotpress = (attempts = 0) => {
          if (window.botpress && typeof window.botpress.init === 'function') {
            scriptLoaded.current = true;
            console.log('Botpress object is now available');
            resolve();
          } else if (attempts < 60) { // Increased attempts for mobile
            setTimeout(() => waitForBotpress(attempts + 1), 100);
          } else {
            console.error('Botpress object not available after script load');
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
      console.log(`Attempting to initialize Botpress for ${selector}, isDesktop: ${isDesktop}`);
      
      // Check if already initialized
      if (isDesktop && desktopInitialized.current) {
        console.log('Desktop Botpress already initialized');
        return true;
      }
      if (!isDesktop && mobileInitialized.current) {
        console.log('Mobile Botpress already initialized');
        return true;
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
      console.log(`Cleared content for ${selector}`);

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
      console.log(`Initializing Botpress with config:`, botpressConfig);
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
              console.log(`Opened webchat for ${selector}`);
            }
          }, 1500);
        });

        // Additional event listeners for debugging
        window.botpress.on('webchat:opened', () => {
          console.log(`Webchat opened for ${selector}`);
        });

        window.botpress.on('webchat:closed', () => {
          console.log(`Webchat closed for ${selector}`);
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
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Initialize based on current view
      let success = false;
      
      if (isMobile) {
        console.log('Initializing for mobile...');
        success = await initializeBotpress('#webchat-mobile', false);
      } else {
        console.log('Initializing for desktop...');
        success = await initializeBotpress('#webchat', true);
      }
      
      // Try both if the current one fails
      if (!success) {
        console.log('Primary initialization failed, trying both...');
        const desktopSuccess = await initializeBotpress('#webchat', true);
        const mobileSuccess = await initializeBotpress('#webchat-mobile', false);
        success = desktopSuccess || mobileSuccess;
      }
      
      if (success) {
        console.log('Botpress initialization completed successfully');
      } else {
        console.warn('Failed to initialize any Botpress instance');
        // Retry after a delay
        if (initializationAttempt < 3) {
          setTimeout(() => {
            setInitializationAttempt(prev => prev + 1);
          }, 2000);
        }
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
  }, [loadBotpressScript, initializeBotpress, initializationAttempt, isMobile]);

  // Initialize on component mount and retry attempts
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeBotpressChats();
    }, 1000); // Initial delay

    return () => clearTimeout(timer);
  }, [initializeBotpressChats, initializationAttempt]);

  // Reinitialize when mobile/desktop view changes
  useEffect(() => {
    if (botpressLoaded && scriptLoaded.current) {
      console.log('View changed, reinitializing Botpress...');
      // Reset initialization flags when view changes
      desktopInitialized.current = false;
      mobileInitialized.current = false;
      
      setTimeout(() => {
        initializeBotpressChats();
      }, 500);
    }
  }, [isMobile, botpressLoaded, initializeBotpressChats]);

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>{`
          /* Mobile-first responsive styles */
          @media (max-width: 1023px) {
            .mobile-layout {
              display: flex !important;
              flex-direction: column;
              min-height: 100vh;
            }
            
            .mobile-login-section {
              flex: 0 0 auto;
              padding: 1rem;
              background: white;
              min-height: 50vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .mobile-chat-section {
              flex: 1;
              background: #f9fafb;
              padding: 1rem;
              display: flex;
              flex-direction: column;
              min-height: 50vh;
            }
            
            .mobile-chatbox {
              height: clamp(350px, 60vh, 500px) !important;
              min-height: 350px !important;
            }
          }

          @media (max-height: 600px) and (max-width: 1023px) {
            .mobile-chatbox {
              height: clamp(300px, 50vh, 400px) !important;
            }
          }
          
          /* Botpress mobile responsive styles */
          #webchat .bpWebchat,
          #webchat-mobile .bpWebchat {
            position: unset !important;
            width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            max-width: 100% !important;
            border-radius: 0.75rem !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
          }

          #webchat .bpFab,
          #webchat-mobile .bpFab {
            display: none !important;
          }
          
          /* Force mobile widget to be visible */
          @media (max-width: 1023px) {
            #webchat-mobile {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
            
            #webchat {
              display: none !important;
            }
          }
          
          @media (min-width: 1024px) {
            #webchat {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
            
            #webchat-mobile {
              display: none !important;
            }
          }
        `}</style>
      </Helmet>

      <div className={`min-h-screen w-full ${isMobile ? 'mobile-layout' : 'grid lg:grid-cols-2'}`}>
        {/* Login Form Section */}
        <div className={`${isMobile ? 'mobile-login-section' : 'flex flex-col items-center justify-center p-8 bg-white'}`}>
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            className="w-full max-w-md"
          >
            <div className="mb-6 lg:mb-8 self-start">
              <img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/7e0684c8-f8f8-4241-a5d6-e17a7b2d1451/141feff6f242f1707b20096e0e33b90c.png" 
                alt="SAKTI Logo" 
                className="h-10 lg:h-12 mb-4 lg:mb-6" 
              />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Selamat Datang</h2>
              <p className="text-gray-600 mt-2 text-sm lg:text-base">Masuk untuk melanjutkan ke SAKTI Platform.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nama@sucofindo.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="h-10 lg:h-11 text-sm" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-[#000476] hover:underline">
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
                    className="h-10 lg:h-11 pr-10 text-sm"
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-10 lg:h-11 text-white font-medium hover:opacity-90 transition-opacity text-sm" 
                style={{ backgroundColor: '#000476' }} 
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Login'}
              </Button>
            </form>

            <div className="mt-4 lg:mt-6 text-center">
              <Link to="/register">
                <Button 
                  variant="outline" 
                  className="w-full h-10 lg:h-11 border-[#000476] text-[#000476] hover:bg-blue-50 transition-colors text-sm"
                >
                  Register
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Chatbot Section */}
        <div className={`${isMobile ? 'mobile-chat-section' : 'hidden lg:flex flex-col items-center justify-center p-8 bg-gray-50 h-screen'}`}>
          <motion.div 
            initial={{ opacity: 0, x: isMobile ? 0 : 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6, delay: isMobile ? 0 : 0.2 }} 
            className="chatbot-container w-full max-w-[550px] flex flex-col items-center text-center"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[#000476] mb-2">
              {isMobile ? '🤖 ' : ''}SAKTI Assistant
            </h2>
            <p className="text-xs lg:text-sm text-gray-600 max-w-lg leading-relaxed mb-4 lg:mb-8 px-2">
              Looking for the right service? <strong>SAKTI Assistant</strong> helps you explore whether
              <strong> PT SUCOFINDO</strong> can deliver what your business needs. Just ask your question — our chatbot will guide you to the right solution.
            </p>
            
            {/* Desktop Chatbot */}
            <div 
              className={`chatbot-box w-full bg-white rounded-lg shadow-md overflow-hidden ${isMobile ? 'mobile-chatbox' : ''}`}
              style={{ height: isMobile ? 'auto' : '500px' }}
            >
              <div 
                id="webchat" 
                className="w-full h-full relative"
                style={{ display: isMobile ? 'none' : 'block' }}
              >
                {!botpressLoaded && !isMobile && (
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
              
              {/* Mobile Chatbot */}
              <div 
                id="webchat-mobile" 
                className="w-full h-full relative"
                style={{ 
                  display: isMobile ? 'block' : 'none',
                  height: isMobile ? 'clamp(350px, 60vh, 500px)' : 'auto'
                }}
              >
                {!botpressLoaded && isMobile && (
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
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;