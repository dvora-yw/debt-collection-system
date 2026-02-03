import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Pagination } from './Pagination';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { getClients } from '../services/clientService';
import { LayoutDashboard, Users, CreditCard, Settings, SettingsScreen, LogOut, Menu, X, TrendingUp, TrendingDown, DollarSign, UserCheck, Clock, MessageSquare, Bell, UserPlus, } from 'lucide-react';
import { useAuth } from './AuthContext';

export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const MESSAGES_PER_PAGE = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const parseAmount = (value) => {
    if (!value && value !== 0) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = value.replace(/[^0-9.-]+/g, '');
      return parseFloat(num) || 0;
    }
    return 0;
  };

  const formatCurrency = (num) => {
    try {
      return '₪' + Number(num).toLocaleString('he-IL');
    } catch (e) {
      return '₪' + num;
    }
  };


  const menuItems = [
    { icon: LayoutDashboard, label: 'דשבורד', route: '/admin-dashboard' },
    { icon: Users, label: 'לקוחות', route: '/clients' },
    { icon: CreditCard, label: 'תשלומים', route: '/payments' },
    { icon: Settings, label: 'הגדרות', route: '/settings-screen' },
  ];

  const location = useLocation();
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Note: backend doesn't expose /auth/me or /admin/dashboard/kpis in this environment.
        // Fetch payments, messages, clients, and end-clients and compute KPIs on the client side.
        const [paymentsRes, messagesRes, clientsRes, endClientsRes] = await Promise.all([
          api.get('/payments'),
          api.get('/messages/messages'),
          getClients(),
          api.get('/end-clients'),
        ]);

        const paymentsData = paymentsRes?.data ?? [];
        const messagesData = messagesRes?.data ?? [];

        const rawClients = clientsRes?.data;
        const clientsData = Array.isArray(rawClients)
          ? rawClients
          : Array.isArray(rawClients?.content)
            ? rawClients.content
            : [];

        const rawEndClients = endClientsRes?.data;
        const endClientsData = Array.isArray(rawEndClients)
          ? rawEndClients
          : Array.isArray(rawEndClients?.content)
            ? rawEndClients.content
            : [];

        console.log('=== AdminDashboard rawEndClients ===', rawEndClients);
        console.log('=== AdminDashboard endClientsData ===', endClientsData);

        setAdmin(user ?? null);
        setPayments(paymentsData);
        setMessages(messagesData);

        // Calculate total debt from endClients using totalDebt field
        const safeEndClients = Array.isArray(endClientsData) ? endClientsData : [];
        const totalDebtValue = safeEndClients.reduce((sum, item) => {
          const ec = item.endClient || item; // תומך גם במבנה מקונן וגם ישיר
          const debt = parseAmount(ec.totalDebt ?? 0);
          console.log(`End client: ${ec.endClientName || ec.name}, totalDebt: ${ec.totalDebt}, parsed: ${debt}`);
          return sum + debt;
        }, 0);
        console.log('=== Calculated totalDebtValue:', totalDebtValue);

        const activeClientsCount = Array.isArray(clientsData) ? clientsData.length : 0;
        const pendingPaymentsCount = paymentsData.filter(p => (p.status || '').toLowerCase() === 'pending').length;
        const completedPaymentsCount = paymentsData.filter(p => (p.status || '').toLowerCase() === 'completed').length;
        const collectionRate = paymentsData.length ? ((completedPaymentsCount / paymentsData.length) * 100).toFixed(1) + '%' : 'N/A';

        setKpis([
          { title: 'סך הכל חוב', value: formatCurrency(totalDebtValue), change: null, trend: 'up', icon: DollarSign, color: 'text-primary', bgColor: 'bg-primary/10' },
          { title: 'לקוחות פעילים', value: String(activeClientsCount), change: null, trend: 'up', icon: UserCheck, color: 'text-secondary', bgColor: 'bg-secondary/10' },
          { title: 'תשלומים ממתינים', value: formatCurrency(paymentsData.filter(p => (p.status || '').toLowerCase() === 'pending').reduce((s, p) => s + parseAmount(p.amount ?? p.total ?? p.value), 0)), change: null, trend: 'down', icon: Clock, color: 'text-[#f59e0b]', bgColor: 'bg-[#f59e0b]/10' },
          { title: 'שיעור גבייה', value: String(collectionRate), change: null, trend: completedPaymentsCount >= pendingPaymentsCount ? 'up' : 'down', icon: TrendingUp, color: 'text-[#10b981]', bgColor: 'bg-[#10b981]/10' },
        ]);

      } catch (e) {
        console.error(e);
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // חישוב הודעות מדופדפות לדשבורד (עד 10 בעמוד)
  const messagesTotalPages = Math.ceil((messages?.length || 0) / MESSAGES_PER_PAGE) || 1;
  const safeMessagesPage = Math.min(Math.max(messagesPage, 1), messagesTotalPages);
  const messagesStartIdx = (safeMessagesPage - 1) * MESSAGES_PER_PAGE;
  const messagesEndIdx = messagesStartIdx + MESSAGES_PER_PAGE;
  const paginatedMessages = (messages || []).slice(messagesStartIdx, messagesEndIdx);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        טוען נתונים...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">שגיאה בטעינת נתונים: {String(error)}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">נסה שנית</button>
        </div>
      </div>
    );
  }

  // This component is rendered inside the shared <Layout> which provides the sidebar and header
  return (
    <>
      {/* Dashboard Content */}
      <div>
        {/* User Info Section */}
        {/* {admin && (
          <div className="mb-8 p-4 bg-muted/30 rounded-lg flex items-center gap-3">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
              {admin.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-semibold text-lg">{admin.username || 'אדמין'}</p>
              <p className="text-sm text-muted-foreground">{admin.email || 'admin@example.com'}</p>
            </div>
          </div>
        )} */}

        {/* Add Client Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl">סקירה כללית</h2>
            <p className="text-sm text-muted-foreground">מידע עדכני על מערכת הגבייה</p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/admin-add-client')}>
            <UserPlus className="w-5 h-5 ml-2" />
            הוסף לקוח חדש
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* {payments.map(payment => (
              <div key={payment.id} className="flex justify-between p-4">
                <div>
                  <p>{payment.customerName}</p>
                  <p className="text-sm text-muted-foreground">{payment.date}</p>
                </div>
                <div>
                  <p>₪{payment.amount}</p>
                  <Badge variant={payment.status.toLowerCase()}>
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))} */}
          {(kpis).map((kpi, index) => {
            const Icon = kpi.icon ?? DollarSign;
            const color = kpi.color ?? 'text-primary';
            const bgColor = kpi.bgColor ?? 'bg-primary/10';
            return (
              <Card key={index} padding="md" hover>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{kpi.title ?? ''}</p>
                    <h3 className="text-2xl mb-2">{kpi.value ?? ''}</h3>
                    <div className="flex items-center gap-1">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-[#10b981]" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                      <span className={`text-sm ${kpi.trend === 'up' ? 'text-[#10b981]' : 'text-destructive'}`}>
                        {kpi.change ?? ''}
                      </span>
                    </div>
                  </div>
                  <div className={`${bgColor} ${color} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Payments */}
          <Card padding="md" className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                
                <CardTitle>תשלומים אחרונים</CardTitle>
              </div>
              <Button variant="ghost" size="sm" className=" ml-3" onClick={() => navigate('/payments')}>
                  צפה בהכל
                </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map(payment => (
                  <div
                    key={payment.id}
                    className="
      flex items-center justify-between   px-6 py-4    rounded-xl bg-background  border border-border hover:bg-muted/20 transition-colors "                >
                    {/* צד ימין – שם + תאריך */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="font-medium">
                          {payment.endClientName || 'לקוח לא ידוע'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                    </div>

                    {/* צד שמאל – סכום */}
                    {/* <span className="text-xs text-muted-foreground">
      {formatCurrency(parseAmount(payment.amount))}
      </span> */}
                    <p className="font-semibold" dir="ltr">
                      {formatCurrency(parseAmount(payment.amount))}
                    </p>
                  </div>
                ))}



              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card padding="md">
            <CardHeader>

              <div dir="ltr" className="flex items-center justify-between">
                <CardTitle>הודעות אחרונות</CardTitle>
              </div>
              <MessageSquare className="w-5 h-5 text-muted-foreground  ml-3" />

            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {paginatedMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex items-center justify-between px-6 py-4 rounded-xl bg-background border border-border hover:bg-muted/20 transition-colors ${msg.unread ? 'ring-1 ring-primary/10' : ''}`}
                  >
                    <div>
                      <p className={`font-medium ${msg.unread ? 'font-semibold' : ''}`}>{msg.senderName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleString('he-IL')}</p>
                    </div>

                    <div className="text-sm text-muted-foreground line-clamp-2 max-w-lg">
                      {msg.content}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">אין הודעות להצגה</p>
                )}

                {messages.length > MESSAGES_PER_PAGE && (
                  <Pagination
                    currentPage={safeMessagesPage}
                    totalPages={messagesTotalPages}
                    onPageChange={setMessagesPage}
                  />
                )}

                <Button variant="outline" fullWidth size="sm" onClick={() => navigate('/messages')}>
                  צפה בכל ההודעות
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}