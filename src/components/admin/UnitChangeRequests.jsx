import React, { useState, useEffect } from 'react';
import { Edit, KeyRound, Search, ArrowUpDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const ITEMS_PER_PAGE = 30;

const UnitChangeRequestPage = () => {
  const { toast } = useToast();
  const { authToken, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/unit-change-requests?page=${page}&limit=${ITEMS_PER_PAGE}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setRequests(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: 'Gagal memuat data',
        description: error.response?.data?.message || 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchRequests(currentPage);
    }
  }, [authToken, toast, user, currentPage]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permintaan Perubahan Unit Kerja</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Unit Sekarang</TableHead>
                  <TableHead>Unit Dituju</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                      <TableCell>{item.user.name}</TableCell>
                      <TableCell>{item.user.email}</TableCell>
                      <TableCell>{item.current_unit?.name || '-'}</TableCell>
                      <TableCell>{item.requested_unit.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-6">
                      Tidak ada permintaan perubahan unit kerja
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UnitChangeRequestPage;
