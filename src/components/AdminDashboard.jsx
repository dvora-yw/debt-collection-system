import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserCheck,
  Clock,
  MessageSquare,
  Bell,
  UserPlus,
} from 'lucide-react';
import { useAuth } from './AuthContext';

export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const kpiData = [
    {
      title: 'סך הכל תשלומים',
      value: '₪248,500',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'לקוחות פעילים',
      value: '342',
      change: '+8.2%',
      trend: 'up',
      icon: UserCheck,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'תשלומים ממתינים',
      value: '₪45,200',
      change: '-5.1%',
      trend: 'down',
      icon: Clock,
      color: 'text-[#f59e0b]',
      bgColor: 'bg-[#f59e0b]/10',
    },
    {
      title: 'שיעור גבייה',
      value: '94.3%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-[#10b981]',
      bgColor: 'bg-[#10b981]/10',
    },
  ];

  const recentPayments = [
    { id: '1', customer: 'חברת ABC בע"מ', amount: '₪12,500', status: 'completed', date: '15/12/2024' },
    { id: '2', customer: 'יוסי כהן', amount: '₪3,200', status: 'pending', date: '14/12/2024' },
    { id: '3', customer: 'מרכז XYZ', amount: '₪8,750', status: 'completed', date: '14/12/2024' },
    { id: '4', customer: 'שרה לוי', amount: '₪1,500', status: 'failed', date: '13/12/2024' },
    { id: '5', customer: 'חברת DEF', amount: '₪25,000', status: 'completed', date: '13/12/2024' },
  ];

  // const messages = [
  //   { id: '1', from: 'דוד ישראלי', message: 'שאלה לגבי חשבון אחרון', time: 'לפני 5 דקות', unread: true },
  //   { id: '2', from: 'רחל אברהם', message: 'תודה על העזרה!', time: 'לפני שעה', unread: false },
  //   { id: '3', from: 'מיכל כהן', message: 'מתי יתקבל התשלום?', time: 'לפני 3 שעות', unread: true },
  // ];

  const menuItems = [
    { icon: LayoutDashboard, label: 'דשבורד', active: true },
    { icon: Users, label: 'לקוחות', active: false },
    { icon: CreditCard, label: 'תשלומים', active: false },
    { icon: Settings, label: 'הגדרות', active: false },
  ];
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [meRes, kpiRes, paymentsRes, messagesRes] = await Promise.all([
          // api.get('/auth/me'),
          // api.get('/admin/dashboard/kpis'),
          api.get('/payments'),
          api.get('/messages')
        ]);

        // setAdmin(meRes.data);
        // setKpis(kpiRes.data);
        setPayments(paymentsRes.data);
        setMessages(messagesRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        טוען נתונים...
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full bg-sidebar text-sidebar-foreground w-64 transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2>PaymentPro</h2>
                <p className="text-xs text-sidebar-foreground/60">מערכת גבייה</p>
              </div>
            </div>
            <button
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${item.active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-sidebar-border">
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            <span>התנתק</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:mr-64">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden text-foreground"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl">דשבורד ראשי</h1>
                  <p className="text-sm text-muted-foreground">
                    סקירה כללית של המערכת
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 text-foreground hover:bg-muted rounded-xl transition-colors">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-1 left-1 w-2 h-2 bg-destructive rounded-full" />
                </button>
                <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-xl">
                  <div className="text-right">
                    <p className="text-sm">{user.userName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white">
                    א
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 lg:p-8">
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
            {payments.map(payment => (
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
            ))}
            {kpiData.map((kpi, index) => (
              <Card key={index} padding="md" hover>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                    <h3 className="text-2xl mb-2">{kpi.value}</h3>
                    <div className="flex items-center gap-1">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-[#10b981]" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                      <span
                        className={`text-sm ${kpi.trend === 'up' ? 'text-[#10b981]' : 'text-destructive'
                          }`}
                      >
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className={`${kpi.bgColor} ${kpi.color} p-3 rounded-xl`}>
                    <kpi.icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Payments */}
            <Card padding="md" className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>תשלומים אחרונים</CardTitle>
                  <Button variant="ghost" size="sm">
                    צפה בהכל
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`p-4 ${msg.unread ? 'bg-primary/5' : ''}`}>
                      <p>{msg.from}</p>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}

                  {/* {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-background rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p>{payment.customer}</p>
                          <p className="text-sm text-muted-foreground">{payment.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p>{payment.amount}</p>
                        <Badge
                          variant={
                            payment.status === 'completed'
                              ? 'success'
                              : payment.status === 'pending'
                                ? 'warning'
                                : 'danger'
                          }
                        >
                          {payment.status === 'completed'
                            ? 'הושלם'
                            : payment.status === 'pending'
                              ? 'ממתין'
                              : 'נכשל'}
                        </Badge>
                      </div>
                    </div>
                  ))} */}
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card padding="md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>הודעות אחרונות</CardTitle>
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl transition-colors cursor-pointer ${msg.unread
                        ? 'bg-primary/5 border-r-4 border-primary'
                        : 'bg-background hover:bg-muted/30'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className={msg.unread ? 'font-medium' : ''}>{msg.source}</p>
                        {msg.unread && (
                          <span className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{msg.content}</p>
                      <p className="text-xs text-muted-foreground">{msg.time}</p>
                    </div>
                  ))}
                  <Button variant="outline" fullWidth size="sm">
                    צפה בכל ההודעות
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}