import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLocation } from 'react-router-dom';

function Dashboard() {
  const { user } = useAuth();
  const webchatRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const injectBotpressScript = () => {
      return new Promise((resolve, reject) => {
        if (document.getElementById('botpress-webchat-script')) {
          return resolve();
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.botpress.cloud/webchat/v3.1/inject.js';
        script.async = true;
        script.id = 'botpress-webchat-script';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initializeBotpress = async () => {
      try {
        await injectBotpressScript();

        const initWebchat = () => {
          if (window.botpress && document.querySelector('#webchat')) {
            window.botpress.on('webchat:ready', () => {
              window.botpress.open();
            });

            window.botpress.init({
              botId: 'ca0e2a53-b7b1-4b4d-90e2-7b93d67b28e0',
              clientId: '48967a19-c892-47f0-8f46-e7cfd3153a98',
              selector: '#webchat',
              configuration: {
                version: 'v1',
                composerPlaceholder: '',
                botName: 'SAKTI Assistant',
                botAvatar: 'https://files.bpcontent.cloud/2025/07/27/09/20250727092708-YXL6QMAF.png',
                botDescription: '',
                color: '#3276EA',
                variant: 'solid',
                headerVariant: 'glass',
                themeMode: 'light',
                fontFamily: 'inter',
                radius: 4,
                feedbackEnabled: false,
                footer: '[⚡ SAKTI Assistant](https://botpress.com/?from=webchat)',
                email: {
                  title: 'm.alfarisi@sucofindo.co.id',
                  link: 'm.alfarisi@sucofindo.co.id'
                }
              }
            });
          }
        };

        const waitForWebchatAndInit = () => {
        const webchatElement = document.querySelector('#webchat');
        if (webchatElement && window.botpress) {
          initWebchat();
        } else {
          requestAnimationFrame(waitForWebchatAndInit);
        }
      };

      waitForWebchatAndInit();

      } catch (error) {
        console.error('Botpress initialization failed:', error);
      }
    };

    initializeBotpress();
  }, [location.pathname]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      #webchat .bpWebchat {
        position: unset !important;
        width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        max-width: 100% !important;
        border-radius: 0.75rem !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
      }

      #webchat .bpWebchat iframe {
        width: 100% !important;
        height: 100% !important;
        border: none !important;
        border-radius: 0.75rem !important;
      }

      #webchat .bpFab,
      #webchat .bp-header .bp-close {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (window.botpress) {
        window.botpress.open();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isDashboard = location.pathname === '/dashboard';
      if (document.visibilityState === 'visible' && isDashboard && window.botpress) {
        window.botpress.open();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [location.pathname]);

  useEffect(() => {
    // Hapus botpress script jika logout
    return () => {
      const script = document.getElementById('botpress-webchat-script');
      if (script) script.remove();

      // Bersihkan state global botpress
      if (window.botpress) {
        delete window.botpress;
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard - SAKTI Platform</title>
        <meta
          name="description"
          content="Welcome to SAKTI Dashboard - Your central hub for service management and analytics"
        />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#000476] to-indigo-800 rounded-2xl p-8 text-white relative"
        >
          <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <img
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/7e0684c8-f8f8-4241-a5d6-e17a7b2d1451/bd09d92a84c3cc2570763c0b4f943ecb.png"
                alt="SAKTI Symbol Logo"
                className="h-12 w-12"
              />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="lg:pl-24">
              <h1 className="text-3xl font-bold mb-2">Selamat Datang, {user?.full_name}</h1>
              <p className="text-blue-100 text-lg mb-6">
                Jelajahi layanan dan dokumentasi dengan mudah melalui platform SAKTI
              </p>
            </div>
            <div className="hidden lg:flex justify-center">
              <img
                className="w-full max-w-md"
                alt="Dashboard illustration showing teamwork and exploration"
                src="https://images.unsplash.com/photo-1531497258014-b5736f376b1b"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Asisten Virtual SAKTI</CardTitle>
              <p className="text-gray-600">Tanyakan apa saja tentang layanan dan dokumentasi kami</p>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden border">
                <div
                  ref={webchatRef}
                  id="webchat"
                  className="absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out"
                ></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}

export default Dashboard;
