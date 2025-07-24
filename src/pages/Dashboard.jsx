import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useAuth, ROLES } from '@/contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';

function Dashboard() {
  const { user } = useAuth();
  const webchatRef = useRef(null);

  useEffect(() => {
    const injectBotpressScript = () => {
      return new Promise((resolve, reject) => {
        if (document.getElementById('botpress-webchat-script')) {
          return resolve(); // Script already injected
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

        if (window.botpress && webchatRef.current) {
          window.botpress.init({
            botId: 'd07d2c58-86af-494a-ba32-cfc090caa171',
            clientId: '42b065f3-6d14-4a80-8df0-bd92f56b3f53',
            selector: '#webchat',
            embedded: true,
            configuration: {
              version: 'v1',
              color: '#3276EA',
              variant: 'solid',
              headerVariant: 'glass',
              themeMode: 'light',
              fontFamily: 'inter',
              radius: 4,
              feedbackEnabled: true,
              footer: '[⚡ SAKTI Assisstant ](https://botpress.com/?from=webchat)',
            },
          });

          window.botpress.on('webchat:ready', () => {
            window.botpress.open(); // Auto open on load
          });
        }
      } catch (error) {
        console.error('Botpress initialization failed:', error);
      }
    };

    initializeBotpress();
  }, []);

  useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    /* Hapus scrollbar dari container utama */
    #webchat .bpWebchat {
      overflow: hidden !important;
      max-height: none !important;
    }

    /* Batasi tinggi iframe */
    #webchat .bpWebchat iframe {
      width: 100% !important;
      height: 100% !important;
      min-height: 500px !important;
      max-height: 600px !important;
      border: none !important;
    }

    /* Fokus scroll hanya di riwayat pesan */
    #webchat .bpWebchat .bp-conversation-container {
      max-height: 500px !important;
      overflow-y: auto !important;
      padding-right: 8px;
    }

    /* Sembunyikan FAB dan tombol close */
    #webchat .bpFab, #webchat .bp-header .bp-close {
      display: none !important;
    }

    /* Scrollbar gaya halus */
    #webchat .bp-conversation-container::-webkit-scrollbar {
      width: 6px;
    }

    #webchat .bp-conversation-container::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,0.2);
      border-radius: 4px;
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
              <div className="relative w-full aspect-[16/9] overflow-auto max-h-[600px]">
                <div
                  ref={webchatRef}
                  id="webchat"
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}

export default Dashboard;
