import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { DocumentsView } from './DocumentsView';
import {
  ArrowRight,
  Building,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  Calendar,
  User,
  Edit,
  FileText,
  TrendingUp,
  Clock,
} from 'lucide-react';



export function ClientView({ onBack }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');

  const clientData = {
    id: '1',
    name: 'חברת ABC בע"מ',
    contactPerson: 'דוד כהן',
    email: 'david@abc.com',
    phone: '050-1234567',
    companyId: '514123456',
    address: 'רחוב הרצל 123, תל אביב',
    creditLimit: '₪100,000',
    debt: '₪25,300',
    status: 'active',
    lastPayment: '15/12/2024',
    accountManager: 'שרה לוי',
    paymentTerms: 'שוטף + 30',
    bankDetails: {
      bankName: 'בנק הפועלים',
      branch: '123',
      account: '456789',
    },
  };

  const stats = [
    {
      title: 'חוב נוכחי',
      value: clientData.debt,
      icon: DollarSign,
      color: 'text-[#f59e0b]',
      bgColor: 'bg-[#f59e0b]/10',
    },
    {
      title: 'מסגרת אשראי',
      value: clientData.creditLimit,
      icon: CreditCard,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'תשלום אחרון',
      value: clientData.lastPayment,
      icon: Calendar,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'ניצול מסגרת',
      value: '25.3%',
      icon: TrendingUp,
      color: 'text-[#10b981]',
      bgColor: 'bg-[#10b981]/10',
    },
  ];

  const recentTransactions = [
    {
      id: '1',
      type: 'payment',
      description: 'תשלום חשבונית #1234',
      amount: '₪12,500',
      date: '15/12/2024',
      status: 'completed',
    },
    {
      id: '2',
      type: 'invoice',
      description: 'חשבונית חדשה #1235',
      amount: '₪8,750',
      date: '10/12/2024',
      status: 'pending',
    },
    {
      id: '3',
      type: 'payment',
      description: 'תשלום חשבונית #1230',
      amount: '₪15,200',
      date: '05/12/2024',
      status: 'completed',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              חזרה לרשימת לקוחות
            </button>
          )}
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Building className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl">{clientData.name}</h1>
                  <Badge variant="success">פעיל</Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {clientData.contactPerson}
                  </span>
                  <span>•</span>
                  <span>#{clientData.id}</span>
                </div>
              </div>
            </div>
            <Button variant="primary" size="md">
              <Edit className="w-5 h-5" />
              ערוך פרטים
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-2xl">{stat.value}</h3>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 transition-colors ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              סקירה כללית
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-3 transition-colors flex items-center gap-2 ${
                activeTab === 'documents'
                  ? 'border-b-2 border-primary text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-5 h-5" />
              מסמכים
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Details */}
            <Card padding="lg" className="lg:col-span-2">
              <CardHeader>
                <CardTitle>פרטי לקוח</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-4">מידע כללי</h4>
                    <div className="space-y-3">
                      <InfoRow icon={Building} label="שם החברה" value={clientData.name} />
                      <InfoRow icon={User} label="איש קשר" value={clientData.contactPerson} />
                      <InfoRow icon={Mail} label="אימייל" value={clientData.email} />
                      <InfoRow icon={Phone} label="טלפון" value={clientData.phone} />
                      <InfoRow icon={MapPin} label="כתובת" value={clientData.address} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-4">פרטי תשלום</h4>
                    <div className="space-y-3">
                      <InfoRow label="ח.פ / ע.מ" value={clientData.companyId} />
                      <InfoRow icon={CreditCard} label="מסגרת אשראי" value={clientData.creditLimit} />
                      <InfoRow icon={Clock} label="תנאי תשלום" value={clientData.paymentTerms} />
                      <InfoRow icon={User} label="מנהל חשבון" value={clientData.accountManager} />
                      <div className="pt-3 mt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">פרטי בנק</p>
                        <p className="text-sm">{clientData.bankDetails.bankName}</p>
                        <p className="text-sm text-muted-foreground">
                          סניף: {clientData.bankDetails.branch} | חשבון: {clientData.bankDetails.account}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>תנועות אחרונות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-3 bg-background rounded-xl border border-border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                        <Badge
                          variant={transaction.status === 'completed' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {transaction.status === 'completed' ? 'שולם' : 'ממתין'}
                        </Badge>
                      </div>
                      <p className="font-medium">{transaction.amount}</p>
                    </div>
                  ))}
                  <Button variant="outline" fullWidth size="sm">
                    צפה בכל התנועות
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'documents' && (
          <DocumentsView clientName={clientData.name} />
        )}
      </div>
    </div>
  );
}


function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="w-5 h-5 text-muted-foreground mt-0.5">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
