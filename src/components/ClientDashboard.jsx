import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';
import { useAuth } from './AuthContext';
import api from '../services/api';
import {
  LogOut,
  DollarSign,
  Plus,
  Upload,
  Mail,
  Phone,
  Eye,
  Download,
  Search,
  Users,
  Clock,
  CheckCircle,
} from 'lucide-react';

export function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [endCustomers, setEndCustomers] = useState([]);
  const [clientPersons, setClientPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        console.log("=== FETCHING CLIENT DATA ===");
        console.log("User:", user);
        
        if (!user || !user.user) {
          setError('משתמש לא מחובר');
          setLoading(false);
          return;
        }

        const clientId = user.user.clientId;
        
        if (!clientId) {
          setError('אין clientId ליוזר - בעיה בשרת');
          setLoading(false);
          return;
        }

        // טען את הלקוח לפי clientId
        const res = await api.get(`/clients/${clientId}`);
        console.log("Found client:", res.data);
        setClientData(res.data);
      } catch (err) {
        console.error("Error fetching client:", err);
        setError('שגיאה בטעינת נתונים');
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [user]);

  // Fetch end clients (filter by clientId on frontend because backend lacks query param)
  useEffect(() => {
    if (!clientData?.id) return;

    const fetchEndClients = async () => {
      try {
        const res = await api.get(`/end-clients/by-client/${clientData.id}`);
        setEndCustomers(res.data || []);
      } catch (err) {
        console.error('Error fetching end clients:', err);
        setEndCustomers([]);
      }
    };

    fetchEndClients();
  }, [clientData?.id]);

  // Fetch client contacts (not persons - those belong to end clients)
  useEffect(() => {
    if (!clientData?.id) return;

    const fetchClientContacts = async () => {
      try {
        const res = await api.get(`/client-contacts/contacts/${clientData.id}`);
        setClientPersons(res.data || []);
      } catch (err) {
        console.error('Error fetching client contacts:', err);
        setClientPersons([]);
      }
    };

    fetchClientContacts();
  }, [clientData?.id]);

  if (loading) return <div className="p-8">טוען נתונים...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!clientData) return <div className="p-8">אין נתונים</div>;

  // Contacts fetched by clientId
  const contacts = clientPersons || [];

  // Filter end customers by search
  const filteredCustomers = endCustomers.filter(endClient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      endClient.endClientName?.toLowerCase().includes(searchLower) ||
      endClient.name?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats
  const totalEndCustomers = endCustomers.length;
  const totalDebt = endCustomers.reduce((sum, c) => sum + (parseFloat(c.debt) || 0), 0);
  const pendingPayments = endCustomers.filter(c => c.status !== 'paid').length;
  const paidThisMonth = endCustomers.filter(c => c.status === 'paid').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">שולם</Badge>;
      case 'pending':
        return <Badge variant="warning">ממתין</Badge>;
      case 'overdue':
        return <Badge variant="danger">באיחור</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const entityTypeMap = {
    EXEMPT_DEALER: { label: 'עוסק פטור', description: 'עוסק שפטור מרישום בחשבונות' },
    AUTHORIZED_DEALER: { label: 'עוסק מורשה', description: 'עוסק רשום ומורשה בחשבונות' },
    PRIVATE_COMPANY: { label: 'חברה פרטית (ח"פ)', description: 'חברה פרטית תושבת ישראל' },
    PUBLIC_COMPANY: { label: 'חברה ציבורית', description: 'חברה ציבורית בישראל' },
    REGISTERED_PARTNERSHIP: { label: 'שותפות רשומה', description: 'שותפות רשומה בישראל' },
    LIMITED_PARTNERSHIP: { label: 'שותפות מוגבלת', description: 'שותפות מוגבלת רשומה' },
    NON_PROFIT: { label: 'עמותה / מלכ"ר', description: 'עמותה או מוסד דת' },
    COOPERATIVE: { label: 'אגודה שיתופית', description: 'אגודה שיתופית רשומה' },
    FOREIGN_COMPANY: { label: 'חברה זרה', description: 'חברה חוקית בחו"ל' },
    PRIVATE_PERSON: { label: 'אדם פרטי', description: 'אדם פרטי תושב ישראל' },
  };

  const getEntityTypeLabel = (type) => {
    return entityTypeMap[type]?.label || type;
  };

  const getEntityTypeDescription = (type) => {
    return entityTypeMap[type]?.description || '';
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header with Client Info */}
      <header className="bg-card border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-12 flex-1 flex-wrap">
              {/* Icon + Name */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold">{clientData.name}</h1>
              </div>
              
              {/* All other data with labels */}
              <div className="flex flex-wrap items-center gap-8 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">סוג ישות</p>
                  <p className="font-medium">{getEntityTypeLabel(clientData.entityType)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">מספר זיהוי</p>
                  <p className="font-medium">{clientData.identificationNumber}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-muted-foreground mb-0.5">אימייל</p>
                  <p className="font-medium text-sm">{clientData.email}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-xs text-muted-foreground mb-0.5">טלפון</p>
                  <p className="font-medium">{clientData.phone}</p>
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs text-muted-foreground mb-0.5">כתובת</p>
                  <p className="font-medium text-sm">{clientData.address || 'לא צוין'}</p>
                </div>
                <div className="hidden xl:block">
                  <p className="text-xs text-muted-foreground mb-0.5">ח.פ / ע.מ</p>
                  <p className="font-medium">{clientData.vatNumber || 'לא צוין'}</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              // TODO: logout
            }}>
              <LogOut className="w-5 h-5" />
              התנתק
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-8">
        {/* TODO: KPI Cards - להוסיף בחזרה אם נדרש
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card padding="md" className="rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">סך לקוחות קצה</p>
                <h3 className="text-3xl font-bold">{totalEndCustomers}</h3>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card padding="md" className="rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">חובות פתוחים</p>
                <h3 className="text-3xl font-bold">₪{totalDebt.toLocaleString('he-IL')}</h3>
              </div>
              <div className="bg-yellow-100 p-4 rounded-xl">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card padding="md" className="rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">ממתינים לתשלום</p>
                <h3 className="text-3xl font-bold">{pendingPayments}</h3>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card padding="md" className="rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">שולמו החודש</p>
                <h3 className="text-3xl font-bold">{paidThisMonth}</h3>
              </div>
              <div className="bg-green-100 p-4 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>
        */}

        {/* Main Content Grid: End Customers (main) + Contacts (sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* End Customers Section - Main Content (3/4 width) */}
          <div className="lg:col-span-3">
            <Card padding="lg" className="rounded-2xl">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle>לקוחות קצה</CardTitle>
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
                <Button variant="outline" size="md">
                  <Download className="w-5 h-5" />
                  ייצא
                </Button>
                <Button variant="primary" size="md" onClick={() => navigate('/add-end-customer')}>
                  <Plus className="w-5 h-5" />
                  הוסף לקוח קצה
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">שם לקוח קצה</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">סטטוס</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((endClient, index) => (
                      <tr key={endClient.id || index} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {(endClient.endClientName || endClient.name || '?').charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{endClient.endClientName || endClient.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="success">פעיל</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/end-customer/${endClient.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-muted-foreground">
                        {endCustomers.length === 0 ? 'אין לקוחות קצה' : 'לא נמצאו התאמות לחיפוש'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
            </Card>
          </div>

          {/* Contacts Sidebar (1/4 width) */}
          <div className="lg:col-span-1">
            <Card padding="lg" className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">אנשי קשר</CardTitle>
              </CardHeader>
              <CardContent>
                {contacts.length > 0 ? (
                  <div className="space-y-3">
                    {contacts.map((contact, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="grid gap-1">
                          <p className="font-medium text-sm">{contact.firstName} {contact.lastName}</p>
                          <p className="text-xs text-muted-foreground">{contact.role || 'לא צוין'}</p>
                          {contact.phone && (
                            <p className="text-xs text-muted-foreground">{contact.phone}</p>
                          )}
                          {contact.email && (
                            <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-4">אין אנשי קשר</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
