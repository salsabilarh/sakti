import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ITEMS_PER_PAGE = 5;
const BASE_URL = 'https://api-sakti-production.up.railway.app';

function WaitingUsers() {
  const { toast } = useToast();
  const { authToken } = useAuth(); // Token dari Context
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Ambil data user yang masih menunggu
  const fetchUsers = async () => {
    if (!authToken) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/admin/waiting-users?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.total_pages || 1);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      toast({
        title: 'Gagal Memuat Data',
        description: 'Tidak dapat mengambil data dari server.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, authToken]);

  // Aksi approve atau reject
  const handleAction = async (action, id, fullName) => {
    if (!authToken) return;

    const actionURL = `${BASE_URL}/api/admin/waiting-users/${id}/${action}`;

    try {
      await axios.put(actionURL, null, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      toast({
        title: `Berhasil ${action === 'approve' ? 'menyetujui' : 'menolak'} user`,
        description: `Aksi berhasil untuk ${fullName}`,
      });

      // Refresh data
      fetchUsers();
    } catch (error) {
      console.error(`Gagal ${action} user:`, error);
      toast({
        title: 'Gagal Melakukan Aksi',
        description: `Terjadi kesalahan saat memproses user ${fullName}`,
        variant: 'destructive',
      });
    }
  };

  // Filter berdasarkan search
  const filteredUsers = users.filter((user) =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>User Menunggu Persetujuan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center py-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-600 font-medium mt-8">Memuat data pengguna...</div>
        ) : (
          <>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Unit Kerja</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        Tidak ada user ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.unit?.name || '-'}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleAction('approve', user.id, user.full_name)}
                              disabled={loading}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAction('reject', user.id, user.full_name)}
                              disabled={loading}
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
}

export default WaitingUsers;
