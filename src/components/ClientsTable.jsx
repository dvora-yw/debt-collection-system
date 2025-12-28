import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { getClients } from '../services/clientService';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { useNavigate } from 'react-router-dom';
import { getCompanies } from '../services/companyService';
import { Table,TableHeader,TableBody,TableRow,TableHead,TableCell,} from './Table';
import {Search,Download,Plus,Eye,Edit,Trash2,Building,Mail,Phone,FileText,} from 'lucide-react';


export function ClientsTable({ onViewClient, onAddClient, visibleColumns = ['all'] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const [clients, setClients] = useState([]);
  const [companiesMap, setCompaniesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [clientsRes, companiesRes] = await Promise.all([getClients(), getCompanies()]);
        if (!mounted) return;
        const clientsData = clientsRes?.data ?? [];
        const companiesData = companiesRes?.data ?? [];
        const map = {};
        companiesData.forEach(c => { map[String(c.id)] = c; });
        setClients(clientsData);
        setCompaniesMap(map);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">טוען לקוחות...</div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-destructive mb-4">שגיאה בטעינת לקוחות: {String(error)}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">נסה שנית</button>
      </div>
    </div>
  );

  const q = (searchTerm || '').trim().toLowerCase();
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      !q ||
      (client.name || '').toLowerCase().includes(q) ||
      (client.contactPerson || '').toLowerCase().includes(q) ||
      (client.email || '').toLowerCase().includes(q) ||
      (client.phone || '').toLowerCase().includes(q) ||
      (client.companyId || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">פעיל</Badge>;
      case 'warning':
        return <Badge variant="warning">אזהרה</Badge>;
      case 'blocked':
        return <Badge variant="danger">חסום</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const isColumnVisible = (column) => {
    return visibleColumns.includes('all') || visibleColumns.includes(column);
  };

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle>רשימת לקוחות</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              סה"כ {filteredClients.length} לקוחות
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="חיפוש לקוח..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select
              options={[
                { value: 'all', label: 'כל הסטטוסים' },
                { value: 'active', label: 'פעיל' },
                { value: 'warning', label: 'אזהרה' },
                { value: 'blocked', label: 'חסום' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-40"
            />
            <Button variant="outline" size="md" onClick={() => {
              // Prepare export data and download as XLSX
              const rows = filteredClients.map(c => ({
                id: c.id,
                name: c.name,
                contactPerson: c.contactPerson,
                email: c.email,
                phone: c.phone,
                companyId: c.companyId,
                creditLimit: c.creditLimit,
                debt: c.debt,
                status: c.status,
                lastPayment: c.lastPayment,
                accountManager: c.accountManager,
                documents: c.documents,
              }));
              import('../utils/exportXlsx').then(({ exportToXlsx }) => exportToXlsx('clients.xlsx', rows, 'Clients'));
            }}>
              <Download className="w-5 h-5" />
              ייצא
            </Button>
            <Button variant="primary" size="md" onClick={onAddClient}>
              <Plus className="w-5 h-5" />
              לקוח חדש
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם החברה</TableHead>
                {isColumnVisible('contactPerson') && <TableHead>איש קשר</TableHead>}
                {isColumnVisible('email') && <TableHead>אימייל</TableHead>}
                {isColumnVisible('phone') && <TableHead>טלפון</TableHead>}
                {isColumnVisible('companyId') && <TableHead>ח.פ / ע.מ</TableHead>}
                {isColumnVisible('creditLimit') && <TableHead>מסגרת</TableHead>}
                {isColumnVisible('debt') && <TableHead>חוב</TableHead>}
                <TableHead>סטטוס</TableHead>
                {isColumnVisible('lastPayment') && <TableHead>תשלום אחרון</TableHead>}
                {isColumnVisible('accountManager') && <TableHead>מנהל חשבון</TableHead>}
                {isColumnVisible('documents') && <TableHead>מסמכים</TableHead>}
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        {/* Prefer company name (lookup by companyId/company_id) otherwise fall back to client.name */}
                        {(() => {
                          const compId = client.companyId ?? client.company_id ?? (client.company && client.company.id);
                          const compName = companiesMap[String(compId)]?.name;                          
                          if (compName) {
                            return (
                              <p className="font-medium">
                                <button className="text-primary hover:underline" onClick={() => navigate(`/companies/${compId}`)}>
                                  {compName}
                                </button>
                              </p>
                            );
                          }
                          return <p className="font-medium">{client.name}</p>;
                        })()}

                        {/* <p className="text-xs text-muted-foreground">#{client.id}</p> */}
                      </div>
                    </div>
                  </TableCell>
                  {isColumnVisible('contactPerson') && (
                    <TableCell>{client.contactPerson}</TableCell>
                  )}
                  {isColumnVisible('email') && (
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </div>
                    </TableCell>
                  )}
                  {isColumnVisible('phone') && (
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </div>
                    </TableCell>
                  )}
                  {isColumnVisible('companyId') && (
                    <TableCell className="text-muted-foreground">
                      <button
                        className="text-primary hover:underline"
                        onClick={() => navigate(`/companies/${client.companyId}`)}
                      >
                        {companiesMap[String(client.companyId)]?.taxId ?? client.companyId}
                      </button>
                    </TableCell>
                  )}
                  {isColumnVisible('creditLimit') && (
                    <TableCell>{client.creditLimit}</TableCell>
                  )}
                  {isColumnVisible('debt') && (
                    <TableCell>
                      <span
                        className={
                          client.debt === '₪0'
                            ? 'text-[#10b981]'
                            : client.status === 'blocked'
                            ? 'text-destructive font-medium'
                            : ''
                        }
                      >
                        {client.debt}
                      </span>
                    </TableCell>
                  )}
                  <TableCell>{getStatusBadge(client.status)}</TableCell>
                  {isColumnVisible('lastPayment') && (
                    <TableCell className="text-muted-foreground">
                      {client.lastPayment}
                    </TableCell>
                  )}
                  {isColumnVisible('accountManager') && (
                    <TableCell className="text-muted-foreground">
                      {client.accountManager}
                    </TableCell>
                  )}
                  {isColumnVisible('documents') && (
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        {client.documents}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewClient?.(client.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">לא נמצאו לקוחות התואמים לחיפוש</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
