import React, { useState, useMemo } from 'react';
import { Edit, KeyRound, Search, ArrowUpDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { mockUsers as initialUsers } from './mockData.js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 5;

const workUnitOptions = [
  'SBU',
  'PPK',
  'Cabang Surabaya',
  'Cabang Denpasar',
  'Cabang Tarakan',
  'Cabang Sangatta',
  'Unit Kerja Lainnya'
];

const roleOptions = ['Admin', 'Manajemen', 'PDO', 'Viewer'];

function UsersManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ role: '', workUnit: '', status: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const roles = [...new Set(users.map(u => u.role))];
  const workUnits = [...new Set(users.map(u => u.workUnit))];

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      return (
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filters.role || user.role === filters.role) &&
        (!filters.workUnit || user.workUnit === filters.workUnit) &&
        (!filters.status || user.status === filters.status)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [users, searchTerm, filters, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleEditClick = (user) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = () => {
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    toast({ title: "Pengguna Diperbarui", description: `Informasi untuk ${editingUser.name} telah diperbarui.` });
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleResetPassword = (user) => {
    toast({ title: "Password Direset", description: `Password untuk ${user.name} telah direset ke default.` });
  };

  const handleDeleteUser = (userToDelete) => {
    setUsers(users.filter(u => u.id !== userToDelete.id));
    toast({ title: "Pengguna Dihapus", description: `${userToDelete.name} telah dihapus dari sistem.` });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'Inactive': return <Badge variant="destructive">Inactive</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Manajemen User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={filters.role} onValueChange={(v) => setFilters(f => ({...f, role: v === 'all' ? '' : v}))}>
                <SelectTrigger><SelectValue placeholder="Filter Role" /></SelectTrigger>
                <SelectContent><SelectItem value="all">Semua Role</SelectItem>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={filters.workUnit} onValueChange={(v) => setFilters(f => ({...f, workUnit: v === 'all' ? '' : v}))}>
                <SelectTrigger><SelectValue placeholder="Filter Unit Kerja" /></SelectTrigger>
                <SelectContent><SelectItem value="all">Semua Unit</SelectItem>{workUnits.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(v) => setFilters(f => ({...f, status: v === 'all' ? '' : v}))}>
                <SelectTrigger><SelectValue placeholder="Filter Status" /></SelectTrigger>
                <SelectContent><SelectItem value="all">Semua Status</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Button variant="ghost" onClick={() => requestSort('name')}>Nama <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Unit Kerja</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.workUnit}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(user)}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button size="sm" variant="outline"><KeyRound className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reset Password?</AlertDialogTitle>
                              <AlertDialogDescription>Anda yakin ingin mereset password untuk {user.name}? Password akan diubah ke default "Sakti@2024".</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleResetPassword(user)}>Reset</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
                              <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan. Anda yakin ingin menghapus {user.name} secara permanen?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user)}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>Ubah detail pengguna di bawah ini. Klik simpan jika sudah selesai.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nama</Label>
                <Input id="name" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Select value={editingUser.role} onValueChange={(v) => setEditingUser({...editingUser, role: v})}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>{roleOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workUnit" className="text-right">Unit Kerja</Label>
                <Select value={editingUser.workUnit} onValueChange={(v) => setEditingUser({...editingUser, workUnit: v})}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>{workUnitOptions.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
            <Button type="button" onClick={handleSaveUser} style={{ backgroundColor: '#000476' }}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UsersManagement;