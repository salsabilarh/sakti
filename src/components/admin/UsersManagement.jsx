import React, { useState, useMemo, useEffect } from 'react';
import { Edit, KeyRound, Search, ArrowUpDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

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

const ITEMS_PER_PAGE = 30;
const roleOptions = ['admin', 'management', 'pdo', 'viewer'];

function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

function UsersManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ role: '', workUnit: '', status: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allUnits, setAllUnits] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    workUnitId: '',
    is_active: true,
  });
  const [adminCount, setAdminCount] = useState(0);

  const shouldShowUnitKerja = newUser.role && !['admin', 'viewer'].includes(newUser.role);
  const shouldShowUnitKerjaEdit = editingUser?.role && !['admin', 'viewer'].includes(editingUser.role);

  useEffect(() => {
    fetchUsers();
    fetchAllUnits();
  }, [searchTerm, filters, currentPage]);

  useEffect(() => {
    if (newUser.role === 'admin' || newUser.role === 'viewer') {
      setNewUser((prev) => ({ ...prev, workUnitId: '' }));
    }
  }, [newUser.role]);

  useEffect(() => {
    if (editingUser?.role === 'admin' || editingUser?.role === 'viewer') {
      setEditingUser((prev) => ({ ...prev, workUnitId: '' }));
    }
  }, [editingUser?.role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', {
        params: {
          search: searchTerm,
          role: filters.role || undefined,
          unit: filters.workUnit || undefined,
          status: filters.status?.toLowerCase() || undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        }
      });

      const transformed = response.data.users.map(u => ({
        id: u.id,
        name: u.full_name,
        email: u.email,
        role: u.role,
        workUnit: u.unit?.name || '-',
        workUnitId: u.unit?.id || '',
        status: u.is_active ? 'Active' : 'Inactive',
        is_active: u.is_active,
        is_verified: u.is_verified,
      }));
      
      setUsers(transformed);
      const admins = transformed.filter(user => user.role === 'admin');
      setAdminCount(admins.length);
      setTotalPages(response.data.pagination?.total_pages || 1);
    } catch (error) {
      toast({ title: 'Gagal memuat data user', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUnits = async () => {
    try {
      const response = await api.get('/units');
      setAllUnits(response.data.units);
    } catch (error) {
      toast({
        title: 'Gagal memuat unit kerja',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetFilters = () => {
    setFilters({ role: '', workUnit: '', status: '' });
    setCurrentPage(1);
    setSearchTerm('');
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = useMemo(() => {
    const sorted = [...users];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [users, sortConfig]);

  const handleEditClick = (user) => {
    setEditingUser({ ...user, workUnitId: user.workUnitId || '' });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser.workUnitId && !['admin', 'viewer'].includes(editingUser.role)) {
      return toast({
        title: "Unit Kerja wajib dipilih",
        variant: "destructive",
      });
    }

    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        full_name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        unit_kerja_id: editingUser.workUnitId,
        is_active: editingUser.is_active,
        is_verified: editingUser.is_verified,
      });

      // Refresh data terlebih dahulu
      await fetchUsers();

      // Baru tutup modal dan reset state
      setIsEditModalOpen(false);
      setEditingUser(null);

      toast({
        title: "Pengguna Diperbarui",
        description: `Informasi untuk ${toTitleCase(editingUser.name)} telah diperbarui.`,
      });
    } catch (err) {
      toast({
        title: "Gagal memperbarui",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    const { name, email, role, workUnitId, is_active } = newUser;

    if (!name || !email || !role) {
      return toast({
        title: "Nama, Email, dan Role wajib diisi",
        variant: "destructive",
      });
    }

    if (role !== 'admin' && role !== 'viewer' && !workUnitId) {
      return toast({
        title: "Unit Kerja wajib dipilih",
        variant: "destructive",
      });
    }

    try {
      await api.post("/admin/users", {
        full_name: name,
        email,
        role,
        unit_kerja_id: role === 'admin' || role === 'viewer' ? null : workUnitId,
        is_active,
      });

      await fetchUsers();
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', role: '', workUnitId: '', is_active: true });

      toast({
        title: "Pengguna Ditambahkan",
        description: `${toTitleCase(name)} berhasil ditambahkan.`,
      });
    } catch (err) {
      toast({
        title: "Gagal menambahkan",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      toast({ title: "Pengguna Dihapus", description: `${toTitleCase(userToDelete.name)} telah dihapus dari sistem` });
      fetchUsers();
    } catch (err) {
      toast({ title: "Gagal menghapus", description: err.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'Inactive': return <Badge variant="destructive">Inactive</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const workUnits = allUnits.map(unit => [unit.id, unit.name]);

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manajemen User</CardTitle>
          <Button onClick={() => setIsAddModalOpen(true)} style={{ backgroundColor: "#000476", color: "white" }}>
            Tambah Pengguna
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={filters.role} onValueChange={(v) => setFilters(f => ({ ...f, role: v === 'all' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Filter Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  {roleOptions.map(r => (
                    <SelectItem key={r} value={r}>{r === 'pdo' ? 'PDO' : toTitleCase(r)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.workUnit}
                onValueChange={(v) => setFilters(f => ({ ...f, workUnit: v === 'all' ? '' : v }))}
              >
                <SelectTrigger><SelectValue placeholder="Filter Unit Kerja" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Unit</SelectItem>
                  {workUnits.map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v === 'all' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Filter Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={resetFilters}>Reset Filter</Button>
            </div>
          </div>

          <div className="overflow-auto mt-4">
            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('name')}>Nama <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Unit Kerja</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                        Tidak ada pengguna ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedUsers.map((user) => (
                      <TableRow key={user.id}>
                      <TableCell className="font-medium">{toTitleCase(user.name)}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role === 'pdo' ? 'PDO' : toTitleCase(user.role)}</TableCell>
                      <TableCell>{user.workUnit}</TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}<br />
                        {user.is_verified ? (
                          <Badge variant="default" className="bg-blue-500 mt-1">Verified</Badge>
                        ) : (
                          <Badge variant="secondary" className="mt-1">Unverified</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditClick(user)}><Edit className="w-4 h-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              {!(user.role === 'admin' && adminCount === 1) && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Anda yakin ingin menghapus {toTitleCase(user.name)} secara permanen?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Batal</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUser(user)}>
                                        Hapus
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
                                <AlertDialogDescription>Anda yakin ingin menghapus {toTitleCase(user.name)} secara permanen?</AlertDialogDescription>
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
                  ))
                )}
              </TableBody>
              </Table>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </CardContent>
      </Card>

      {/* MODAL EDIT */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>Ubah detail pengguna di bawah ini.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nama</Label>
                <Input
                  id="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value.trim().toLowerCase() })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Select value={editingUser.role} onValueChange={(v) => setEditingUser({ ...editingUser, role: v })}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(r => (
                      <SelectItem key={r} value={r}>{r === 'pdo' ? 'PDO' : toTitleCase(r)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {shouldShowUnitKerjaEdit && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Unit Kerja</Label>
                  <Select value={editingUser.workUnitId} onValueChange={(v) => setEditingUser({ ...editingUser, workUnitId: v })}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {workUnits.map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status Aktif</Label>
                <Select value={editingUser.is_active ? 'true' : 'false'} onValueChange={(v) => setEditingUser({ ...editingUser, is_active: v === 'true' })}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status Verifikasi</Label>
                <Select value={editingUser.is_verified ? 'true' : 'false'} onValueChange={(v) => setEditingUser({ ...editingUser, is_verified: v === 'true' })}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Terverifikasi</SelectItem>
                    <SelectItem value="false">Tidak terverifikasi</SelectItem>
                  </SelectContent>
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
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>Isi informasi pengguna untuk ditambahkan ke sistem.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Nama</Label>
              <Input
                className="col-span-3"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: toTitleCase(e.target.value) })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Email</Label>
              <Input
                className="col-span-3"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value.trim().toLowerCase() })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Role</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Role" /></SelectTrigger>
                <SelectContent>
                    {roleOptions.map(r => (
                      <SelectItem key={r} value={r}>{r === 'pdo' ? 'PDO' : toTitleCase(r)}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {shouldShowUnitKerja && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Unit Kerja</Label>
                <Select value={newUser.workUnitId} onValueChange={(v) => setNewUser({ ...newUser, workUnitId: v })}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih Unit Kerja" /></SelectTrigger>
                  <SelectContent>
                    {workUnits.map(([id, name]) => (
                      <SelectItem key={id} value={id}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <Select value={newUser.is_active ? "true" : "false"} onValueChange={(v) => setNewUser({ ...newUser, is_active: v === "true" })}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="secondary">Batal</Button></DialogClose>
            <Button onClick={handleAddUser} style={{ backgroundColor: '#000476' }}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UsersManagement;
