import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import api from '../services/api';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Pagination } from './Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './Table';
import {
  Search,
  Download,
  CreditCard,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
} from 'lucide-react';



export function PaymentsTable({ visibleColumns = ['all'] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/payments');
        if (!mounted) return;
        setPayments(res?.data ?? []);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError(e?.message ?? String(e));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Reset to page 1 when filter changes - must be before conditional returns
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">טוען תשלומים...</div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-destructive mb-4">שגיאה בטעינת תשלומים: {String(error)}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">נסה שנית</button>
      </div>
    </div>
  );

  const q = (searchTerm || '').trim().toLowerCase();
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      !q ||
      (payment.client || '').toLowerCase().includes(q) ||
      (payment.customerName || '').toLowerCase().includes(q) ||
      (String(payment.id) || '').toLowerCase().includes(q) ||
      (payment.invoiceNumber || '').toLowerCase().includes(q) ||
      (payment.reference || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || (payment.status || '') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedPayments = filteredPayments.slice(startIdx, endIdx);

  const parseAmount = (amt) => {
    if (amt == null) return 0;
    if (typeof amt === 'number') return amt;
    const s = String(amt).replace(/[^0-9.-]+/g, '');
    return parseFloat(s) || 0;
  };

  const getStatusBadge = (status) => {

    switch (status) {
      case 'completed':
        return (
          <Badge variant="success">
            <CheckCircle className="w-3 h-3 ml-1" />
            הושלם
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning">
            <Clock className="w-3 h-3 ml-1" />
            ממתין
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="danger">
            <XCircle className="w-3 h-3 ml-1" />
            נכשל
          </Badge>
        );
      case 'refunded':
        return (
          <Badge variant="default">
            <RefreshCw className="w-3 h-3 ml-1" />
            הוחזר
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'credit-card':
        return 'כרטיס אשראי';
      case 'bank-transfer':
        return 'העברה בנקאית';
      case 'paypal':
        return 'PayPal';
      default:
        return method;
    }
  };

  const isColumnVisible = (column) => {
    return visibleColumns.includes('all') || visibleColumns.includes(column);
  };

  const totalAmount = filteredPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => {
      if (!p.amount) return sum;
      const amount = typeof p.amount === 'string' ? p.amount.replace('₪', '').replace(',', '') : p.amount;
      return sum + (parseFloat(amount) || 0);
    }, 0);

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle>רשימת תשלומים</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              סה"כ {filteredPayments.length} תשלומים | סכום מאושר: ₪{totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="relative flex-1 sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="חיפוש תשלום..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          <div className="flex flex-col sm:flex-row gap-3">
            
            <Select
              options={[
                { value: 'all', label: 'כל הסטטוסים' },
                { value: 'completed', label: 'הושלם' },
                { value: 'pending', label: 'ממתין' },
                { value: 'failed', label: 'נכשל' },
                { value: 'refunded', label: 'הוחזר' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-40"
            />
            <Button variant="outline" size="md" onClick={() => {
              const rows = filteredPayments.map(p => ({
                id: p.id,
                client: p.client,
                customerName: p.customerName,
                amount: p.amount,
                status: p.status,
                method: p.method,
                date: p.date,
                time: p.time,
                invoiceNumber: p.invoiceNumber,
                reference: p.reference,
                processor: p.processor,
              }));
              import('../utils/exportXlsx').then(({ exportToXlsx }) => exportToXlsx('payments.xlsx', rows, 'Payments'));
            }}>
              <Download className="w-5 h-5" />
              ייצא
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>מזהה תשלום</TableHead>
                <TableHead>לקוח</TableHead>
                {isColumnVisible('customerName') && <TableHead>משלם</TableHead>}
                <TableHead>סכום</TableHead>
                <TableHead>סטטוס</TableHead>
                {isColumnVisible('method') && <TableHead>אמצעי תשלום</TableHead>}
                {isColumnVisible('date') && <TableHead>תאריך</TableHead>}
                {isColumnVisible('time') && <TableHead>שעה</TableHead>}
                {isColumnVisible('invoiceNumber') && <TableHead>חשבונית</TableHead>}
                {isColumnVisible('reference') && <TableHead>אסמכתא</TableHead>}
                {isColumnVisible('processor') && <TableHead>מעבד</TableHead>}
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{payment.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>{payment.client}</TableCell>
                  {isColumnVisible('customerName') && (
                    <TableCell className="text-muted-foreground">
                      {payment.customerName}
                    </TableCell>
                  )}
                  <TableCell>
                    <span className="font-medium">{payment.amount}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  {isColumnVisible('method') && (
                    <TableCell className="text-muted-foreground">
                      {getMethodLabel(payment.method)}
                    </TableCell>
                  )}
                  {isColumnVisible('date') && (
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {payment.date}
                      </div>
                    </TableCell>
                  )}
                  {isColumnVisible('time') && (
                    <TableCell className="text-muted-foreground">
                      {payment.time}
                    </TableCell>
                  )}
                  {isColumnVisible('invoiceNumber') && (
                    <TableCell className="text-muted-foreground">
                      {payment.invoiceNumber}
                    </TableCell>
                  )}
                  {isColumnVisible('reference') && (
                    <TableCell className="text-muted-foreground">
                      {payment.reference}
                    </TableCell>
                  )}
                  {isColumnVisible('processor') && (
                    <TableCell className="text-muted-foreground">
                      {payment.processor}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">לא נמצאו תשלומים התואמים לחיפוש</p>
          </div>
        )}

        {filteredPayments.length > ITEMS_PER_PAGE && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
    </Card>
  );
}
