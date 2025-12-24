import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import {
  DollarSign,
  Calendar,
  FileText,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

export function EndCustomerView() {
  const customerInfo = {
    name: 'דוד כהן',
    accountNumber: 'CUS-2024-001234',
    email: 'david@example.com',
    phone: '050-1234567',
  };

  const debtSummary = {
    totalDebt: 15200,
    overdueDebt: 8500,
    currentDebt: 6700,
    nextPaymentDate: '25/12/2024',
    daysOverdue: 12,
  };

  const invoices = [
    {
      id: 'INV-001',
      date: '01/11/2024',
      dueDate: '01/12/2024',
      amount: 5200,
      status: 'overdue',
      description: 'חשבונית חודשית - נובמבר',
    },
    {
      id: 'INV-002',
      date: '15/11/2024',
      dueDate: '15/12/2024',
      amount: 3300,
      status: 'overdue',
      description: 'שירותים נוספים',
    },
    {
      id: 'INV-003',
      date: '01/12/2024',
      dueDate: '01/01/2025',
      amount: 6700,
      status: 'pending',
      description: 'חשבונית חודשית - דצמבר',
    },
  ];

  const paymentHistory = [
    { date: '05/11/2024', amount: 4500, method: 'כרטיס אשראי', status: 'completed' },
    { date: '10/10/2024', amount: 5200, method: 'העברה בנקאית', status: 'completed' },
    { date: '05/10/2024', amount: 3800, method: 'כרטיס אשראי', status: 'completed' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background" dir="rtl">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">פורטל לקוח</h1>
                <p className="text-sm text-muted-foreground">מערכת תשלומים</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Customer Info */}
        <Card padding="lg" className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                {customerInfo.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl mb-1">{customerInfo.name}</h2>
                <p className="text-sm text-muted-foreground">
                  חשבון מספר: {customerInfo.accountNumber}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <p>📧 {customerInfo.email}</p>
              <p>📱 {customerInfo.phone}</p>
            </div>
          </div>
        </Card>

        {/* Debt Summary - Featured Section */}
        <div className="mb-6">
          {debtSummary.totalDebt > 0 ? (
            <Card padding="lg" className="bg-gradient-to-br from-destructive/5 to-[#f59e0b]/5 border-2 border-destructive/20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                    <div>
                      <h3 className="text-xl">סיכום חובות</h3>
                      <p className="text-sm text-muted-foreground">יש לך יתרת חוב פתוחה</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">סך החוב</p>
                      <p className="text-2xl text-destructive">
                        ₪{debtSummary.totalDebt.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">חוב באיחור</p>
                      <p className="text-2xl text-destructive">
                        ₪{debtSummary.overdueDebt.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">ימי איחור</p>
                      <p className="text-2xl text-destructive">
                        {debtSummary.daysOverdue} ימים
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-[#f59e0b]/10 border-r-4 border-[#f59e0b] rounded-xl">
                    <Clock className="w-5 h-5 text-[#f59e0b]" />
                    <p className="text-sm">
                      תאריך תשלום הבא: <strong>{debtSummary.nextPaymentDate}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:w-64">
                  <Button size="lg" fullWidth>
                    <CreditCard className="w-5 h-5" />
                    שלם עכשיו
                  </Button>
                  <Button variant="outline" size="lg" fullWidth>
                    <Calendar className="w-5 h-5" />
                    תזמן תשלום
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="lg" className="bg-gradient-to-br from-[#10b981]/5 to-secondary/5 border-2 border-[#10b981]/20">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12 text-[#10b981]" />
                <div>
                  <h3 className="text-xl mb-1">חשבונך מסודר! 🎉</h3>
                  <p className="text-muted-foreground">אין לך חובות פתוחים כרגע</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoices */}
          <Card padding="lg" className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>חשבוניות</CardTitle>
                <Badge variant="primary">{invoices.length} פעילות</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-background rounded-xl border border-border hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          invoice.status === 'overdue'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                        }`}
                      >
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p>{invoice.id}</p>
                          <Badge
                            variant={invoice.status === 'overdue' ? 'danger' : 'warning'}
                            size="sm"
                          >
                            {invoice.status === 'overdue' ? 'באיחור' : 'ממתין'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {invoice.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>הונפק: {invoice.date}</span>
                          <span>•</span>
                          <span>תאריך פירעון: {invoice.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <p className="text-xl">₪{invoice.amount.toLocaleString()}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card padding="lg">
            <CardHeader>
              <CardTitle>היסטוריית תשלומים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentHistory.map((payment, index) => (
                  <div
                    key={index}
                    className="p-4 bg-background rounded-xl border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p>₪{payment.amount.toLocaleString()}</p>
                      <CheckCircle className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{payment.method}</p>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                ))}
                <Button variant="outline" fullWidth size="sm">
                  צפה בהיסטוריה המלאה
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
