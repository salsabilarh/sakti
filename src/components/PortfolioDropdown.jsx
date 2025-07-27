import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const PortfolioDropdown = ({ selectedId, onChange }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedCode, setEditedCode] = useState('');

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    const res = await axios.get('/api/portfolios');
    setPortfolios(res.data);
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setEditedName(item.name);
    setEditedCode(item.code);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    await axios.put(`/api/portfolios/${editItem.id}`, {
      name: editedName,
      code: editedCode,
    });
    setDialogOpen(false);
    fetchPortfolios();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <select
          className="w-full border p-2 rounded"
          value={selectedId || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">-- Pilih Portfolio --</option>
          {portfolios.map((item) => (
            <option key={item.id} value={item.id}>
              {item.code} - {item.name}
            </option>
          ))}
        </select>

        {selectedId && (
          <Button size="icon" variant="outline" onClick={() => handleEditClick(portfolios.find(p => p.id === parseInt(selectedId)))}>
            <Pencil size={16} />
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              value={editedCode}
              onChange={(e) => setEditedCode(e.target.value)}
              placeholder="Kode Portfolio"
            />
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Nama Portfolio"
            />
            <Button onClick={handleSave} className="w-full">
              Simpan Perubahan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PortfolioDropdown;
