import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { getClients, deleteClient } from '../services/clientService';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Pagination } from './Pagination';
import { useNavigate } from 'react-router-dom';
// import { getCompanies } from '../services/companyService';
import { Table,TableHeader,TableBody,TableRow,TableHead,TableCell,} from './Table';
import {Search,Download,Plus,Eye,Edit,Trash2,Building,Mail,Phone,FileText,} from 'lucide-react';


export function ClientsTable({ onViewClient, onAddClient, visibleColumns = ['all'] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [clients, setClients] = useState([]);
  const [companiesMap, setCompaniesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [clientsRes] = await Promise.all([getClients()]);
        if (!mounted) return;
        const rawClients = clientsRes?.data;
        let clientsData;

        if (Array.isArray(rawClients)) {
          clientsData = rawClients;
        } else if (typeof rawClients === 'string') {
          try {
            clientsData = JSON.parse(rawClients);
          } catch (parseError) {
            console.error('Failed to parse /clients response as JSON array:', parseError);
            clientsData = [];
          }
        } else {
          clientsData = [];
        }

        console.log('=== ClientsTable rawClients ===', rawClients);
        console.log('=== ClientsTable parsed clientsData ===', clientsData);
        const map = {};
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

  // Reset to page 1 when filter changes - must be before conditional returns
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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
  const baseClients = Array.isArray(clients) ? clients : [];

  console.log('=== ClientsTable state.clients ===', clients);
  console.log('=== ClientsTable baseClients ===', baseClients);

  const filteredClients = baseClients.filter((client) => {
    const matchesSearch =
      !q ||
      (client.name || '').toLowerCase().includes(q) ||
      (client.identificationNumber || '').toLowerCase().includes(q) ||
      (client.email || '').toLowerCase().includes(q) ||
      (client.phone || '').toLowerCase().includes(q) ||
      (client.address || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || client.entityType === statusFilter;
    return matchesSearch && matchesStatus;
  });

  console.log('=== ClientsTable filteredClients ===', filteredClients);

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedClients = filteredClients.slice(startIdx, endIdx);

  const getEntityTypeBadge = (entityType) => {
    if (!entityType) return <Badge variant="default">לא צוין</Badge>;
    
    // המרה לאותיות גדולות לטיפול בכל הפורמטים
    const normalizedType = String(entityType).toUpperCase().replace(/[-\s]/g, '_');
    
    const labels = {
      // סוגי ישויות מתוך AdminAddClient
      EXEMPT_DEALER: 'עוסק פטור',
      EXEMPTDEALER: 'עוסק פטור',
      AUTHORIZED_DEALER: 'עוסק מורשה',
      AUTHORIZEDDEALER: 'עוסק מורשה',
      PRIVATE_COMPANY: 'חברה פרטית (ח"פ)',
      PRIVATECOMPANY: 'חברה פרטית (ח"פ)',
      PUBLIC_COMPANY: 'חברה ציבורית',
      PUBLICCOMPANY: 'חברה ציבורית',
      REGISTERED_PARTNERSHIP: 'שותפות רשומה',
      REGISTEREDPARTNERSHIP: 'שותפות רשומה',
      LIMITED_PARTNERSHIP: 'שותפות מוגבלת',
      LIMITEDPARTNERSHIP: 'שותפות מוגבלת',
      NON_PROFIT: 'עמותה / מלכ"ר',
      NONPROFIT: 'עמותה / מלכ"ר',
      COOPERATIVE: 'אגודה שיתופית',
      FOREIGN_COMPANY: 'חברה זרה',
      FOREIGNCOMPANY: 'חברה זרה',
      PRIVATE_PERSON: 'אדם פרטי',
      PRIVATEPERSON: 'אדם פרטי',
      // תאימות לאחור
      COMPANY: 'חברה',
      BUSINESS: 'עוסק',
      OTHER: 'אחר'
    };
    
    const label = labels[normalizedType];
    
    if (!label) {
      console.warn('Unknown entityType:', entityType);
      return <Badge variant="default">{entityType}</Badge>;
    }
    
    return <Badge variant="default">{label}</Badge>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('he-IL');
    } catch {
      return dateStr;
    }
  };

  const isColumnVisible = (column) => {
    return visibleColumns.includes('all') || visibleColumns.includes(column);
  };

  const handleDeleteClient = async (clientId, clientName) => {
    const confirmed = window.confirm(`האם אתה בטוח שברצונך למחוק את הלקוח "${clientName || ''}"?\nהפעולה אינה הפיכה.`);
    if (!confirmed) return;

    try {
      await deleteClient(clientId);
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    } catch (e) {
      console.error('Error deleting client:', e);
      alert('מחיקת הלקוח נכשלה.');
    }
  };

  return (
    <Card padding="sm">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle>רשימת לקוחות</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              סה"כ {filteredClients.length} לקוחות
            </p>
          </div>
          <div className="relative flex-1 sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="חיפוש לקוח..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              
            </div>
          <div className="flex flex-col sm:flex-row gap-3">
            
            <Select
              options={[
                { value: 'all', label: 'כל הסוגים' },
                { value: 'EXEMPT_DEALER', label: 'עוסק פטור' },
                { value: 'AUTHORIZED_DEALER', label: 'עוסק מורשה' },
                { value: 'PRIVATE_COMPANY', label: 'חברה פרטית (ח"פ)' },
                { value: 'PUBLIC_COMPANY', label: 'חברה ציבורית' },
                { value: 'REGISTERED_PARTNERSHIP', label: 'שותפות רשומה' },
                { value: 'LIMITED_PARTNERSHIP', label: 'שותפות מוגבלת' },
                { value: 'NON_PROFIT', label: 'עמותה / מלכ"ר' },
                { value: 'COOPERATIVE', label: 'אגודה שיתופית' },
                { value: 'FOREIGN_COMPANY', label: 'חברה זרה' },
                { value: 'PRIVATE_PERSON', label: 'אדם פרטי' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-80"
            />
            <Button 
              variant="outline" 
              size="lg"
              className="whitespace-nowrap"
              onClick={() => {
                // Prepare export data and download as XLSX
                const rows = filteredClients.map(c => ({
                  id: c.id,
                  name: c.name,
                  contactPerson: c.contactPerson,
                  email: c.email,
                  phone: c.phone,
                  creditLimit: c.creditLimit,
                  debt: c.debt,
                  status: c.status,
                  lastPayment: c.lastPayment,
                  accountManager: c.accountManager,
                  documents: c.documents,
                }));
                import('../utils/exportXlsx').then(({ exportToXlsx }) => exportToXlsx('clients.xlsx', rows, 'Clients'));
              }}
            >
              <Download className="w-5 h-5" />
              ייצא
            </Button>
            <Button 
              variant="primary" 
              size="lg"
              className="whitespace-nowrap"
              onClick={onAddClient || (() => navigate('/admin-add-client'))}
            >
              <Plus className="w-5 h-5" />
              הוסף לקוח חדש
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right px-2">שם</TableHead>
                <TableHead className="px-2">סוג ישות</TableHead>
                <TableHead className="px-2">ת"ז / ח.פ</TableHead>
                <TableHead className="px-2">טלפון</TableHead>
                <TableHead className="px-2">אימייל</TableHead>
                <TableHead className="px-2">כתובת</TableHead>
                <TableHead className="px-2">תאריך הקמה</TableHead>
                <TableHead className="px-2">מודל תשלום</TableHead>
                <TableHead className="px-2">אנשי קשר</TableHead>
                <TableHead className="px-2">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((client) => (
                <TableRow key={client.id}>
                  {/* שם */}
                  <TableCell className="px-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{client.name || '-'}</p>
                        {/* <p className="text-[10px] text-muted-foreground">#{client.id}</p> */}
                      </div>
                    </div>
                  </TableCell>

                  {/* סוג ישות */}
                  <TableCell className="px-2">
                    {getEntityTypeBadge(client.entityType)}
                  </TableCell>

                  {/* ת"ז / ח.פ */}
                  <TableCell className="text-muted-foreground font-mono px-2 text-sm">
                    {client.identificationNumber || '-'}
                  </TableCell>

                  {/* טלפון */}
                  <TableCell className="text-muted-foreground px-2">
                    {client.phone ? (
                      <div className="flex items-center gap-0.5">
                        <Phone className="w-3 h-3" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    ) : '-'}
                  </TableCell>

                  {/* אימייל */}
                  <TableCell className="text-muted-foreground px-2">
                    {client.email ? (
                      <div className="flex items-center gap-0.5">
                        <Mail className="w-3 h-3" />
                        <a href={`mailto:${client.email}`} className="hover:text-primary text-sm">
                          {client.email}
                        </a>
                      </div>
                    ) : '-'}
                  </TableCell>

                  {/* כתובת */}
                  <TableCell className="text-muted-foreground max-w-[150px] truncate px-2 text-sm">
                    {client.address || '-'}
                  </TableCell>

                  {/* תאריך הקמה */}
                  <TableCell className="text-muted-foreground px-2 text-sm">
                    {formatDate(client.establishedDate)}
                  </TableCell>

                  {/* מודל תשלום */}
                  <TableCell className="text-muted-foreground px-2">
                    <div className="text-xs">
                      <div>{client.paymentModel || '-'}</div>
                      {client.paymentTerms && (
                        <div className="text-xs text-muted-foreground">{client.paymentTerms}</div>
                      )}
                    </div>
                  </TableCell>

                  {/* אנשי קשר */}
                  <TableCell className="px-2">
                    <Badge variant="secondary" className="text-xs">
                      {(client.contacts?.length ?? client.clientContacts?.length ?? 0) || 0} אנשי קשר
                    </Badge>
                  </TableCell>

                  {/* פעולות */}
                  <TableCell className="px-2">
                    <div className="flex items-center gap-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/clients/${client.id}`)}
                        title="צפה בפרטים"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        title="ערוך"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        title="מחק"
                        onClick={() => handleDeleteClient(client.id, client.name)}
                      >
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

        {filteredClients.length > ITEMS_PER_PAGE && (
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
