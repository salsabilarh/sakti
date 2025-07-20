
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

const mockRequests = [
  { id: 1, userName: 'Budi Santoso', currentUnit: 'Operations', requestedUnit: 'SBU', requestDate: '2024-07-19' },
  { id: 2, userName: 'Cindy Adams', currentUnit: 'HR', requestedUnit: 'PPK', requestDate: '2024-07-18' },
];

const ITEMS_PER_PAGE = 5;

function UnitChangeRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState(mockRequests);
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handleAction = (action, requestId) => {
    toast({
      title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      description: `The unit change request has been ${action === 'approve' ? 'approved' : 'rejected'}. (This is a mock action)`,
    });
    setRequests(prev => prev.filter(req => req.id !== requestId));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Permintaan Perubahan Unit Kerja</CardTitle>
      </CardHeader>
      <CardContent>
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
              {paginatedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.userName}</TableCell>
                  <TableCell>{request.currentUnit}</TableCell>
                  <TableCell>{request.requestedUnit}</TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex space-x-2 justify-center">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleAction('approve', request.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction('reject', request.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {requests.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
        {requests.length === 0 && (
          <p className="text-center text-gray-500 py-8">Tidak ada permintaan perubahan unit.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default UnitChangeRequests;
