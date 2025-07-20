
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Zap } from 'lucide-react';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Mock password reset logic
    setTimeout(() => {
      toast({
        title: "Link Reset Terkirim",
        description: `Jika email ${email} terdaftar, kami telah mengirimkan link untuk reset password.`,
      });
      setLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Lupa Password - SAKTI Platform</title>
        <meta name="description" content="Reset your password for SAKTI Platform" />
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
              <div className="w-10 h-10 bg-[#000476] rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SAKTI</h1>
                <p className="text-sm text-gray-600">Service Knowledge Platform</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Lupa Password Anda?
            </h2>
            <p className="text-gray-600">
              Masukkan email Anda untuk menerima link reset password.
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Reset Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-11 text-white font-medium"
                  style={{ backgroundColor: '#000476' }}
                  disabled={loading}
                >
                  {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-600 w-full text-center">
                Ingat password Anda?{' '}
                <Link to="/login" className="font-medium text-[#000476] hover:underline">
                  Kembali ke Login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </>
  );
}

export default ForgotPasswordPage;
