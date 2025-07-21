import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ITEMS_PER_PAGE = 5;

function UnitChangeRequests() {
  const { toast } = useToast();
  const { authToken, user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      try {
        const res = await api.get('/admin/unit-change-requests', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setRequests(res.data.data || []);
      } catch (error) {
        toast({
          title: 'Gagal memuat data',
          description: error.response?.data?.message || 'Tidak dapat mengambil data permintaan',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'admin') {
      fetchRequests();
    }
  }, [authToken, toast, user]);

  const handleAction = async (action, requestId) => {
    try {
      await api.put(
        `/admin/unit-change-requests/${requestId}/process`,
        { action },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      toast({
        title: `Request ${action === 'approve' ? 'Disetujui' : 'Ditolak'}`,
        description: `Permintaan perubahan unit telah ${action === 'approve' ? 'disetujui' : 'ditolak'}.`,
      });

      // Update UI setelah aksi berhasil
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      toast({
        title: `Gagal ${action === 'approve' ? 'menyetujui' : 'menolak'}`,
        description: error.response?.data?.message || 'Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  if (user?.role !== 'admin') {
    return <p className="text-center text-red-600 py-8">Akses ditolak. Hanya admin yang dapat melihat halaman ini.</p>;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Permintaan Perubahan Unit Kerja</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8">Memuat data...</p>
        ) : (
          <>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama User</TableHead>
                    <TableHead>Unit Saat Ini</TableHead>
                    <TableHead>Unit yang Diminta</TableHead>
                    <TableHead>Tanggal Permintaan</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        Tidak ada permintaan perubahan unit.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.user.name}</TableCell>
                        <TableCell>{request.current_unit.name}</TableCell>
                        <TableCell>{request.requested_unit.name}</TableCell>
                        <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex space-x-2 justify-center">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleAction('approve', request.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAction('reject', request.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {requests.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default UnitChangeRequests;
