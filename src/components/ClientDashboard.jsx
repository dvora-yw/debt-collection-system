import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
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
  Filter,
  Download,
  Plus,
  Eye,
  LogOut,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
} from 'lucide-react';

export function ClientDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = [
    {
      title: 'סך לקוחות קצה',
      value: '156',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'חובות פתוחים',
      value: '₪89,450',
      icon: DollarSign,
      color: 'text-[#f59e0b]',
      bgColor: 'bg-[#f59e0b]/10',
    },
    {
      title: 'ממתינים לתשלום',
      value: '24',
      icon: Clock,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'שולמו החודש',
      value: '₪142,300',
      icon: CheckCircle,
      color: 'text-[#10b981]',
      bgColor: 'bg-[#10b981]/10',
    },
  ];

  const customers = [
    {
      id: '1',
      name: 'דוד כהן',
      email: 'david@example.com',
      phone: '050-1234567',
      debt: '₪5,200',
      status: 'pending',
      lastPayment: '05/12/2024',
    },
    {
      id: '2',
      name: 'רחל לוי',
      email: 'rachel@example.com',
      phone: '052-9876543',
      debt: '₪0',
      status: 'paid',
      lastPayment: '10/12/2024',
    },
    {
      id: '3',
      name: 'משה אברהם',
      email: 'moshe@example.com',
      phone: '053-5551234',
      debt: '₪12,800',
      status: 'overdue',
      lastPayment: '25/11/2024',
    },
    {
      id: '4',
      name: 'שרה ישראלי',
      email: 'sarah@example.com',
      phone: '054-3334444',
      debt: '₪3,500',
      status: 'pending',
      lastPayment: '08/12/2024',
    },
    {
      id: '5',
      name: 'יוסף דוד',
      email: 'yosef@example.com',
      phone: '050-7778889',
      debt: '₪0',
      status: 'paid',
      lastPayment: '12/12/2024',
    },
    {
      id: '6',
      name: 'מרים כהן',
      email: 'miriam@example.com',
      phone: '052-1112223',
      debt: '₪8,900',
      status: 'pending',
      lastPayment: '03/12/2024',
    },
  ];

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.includes(searchTerm) ||
      customer.email.includes(searchTerm) ||
      customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl">לוח בקרה - לקוח</h1>
                <p className="text-sm text-muted-foreground">חברת ABC בע״מ</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <LogOut className="w-5 h-5" />
              התנתק
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-8">
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

        {/* Customers Table */}
        <Card padding="lg">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle>לקוחות קצה</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="חיפוש לפי שם, אימייל או טלפון"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select
                  options={[
                    { value: 'all', label: 'כל הסטטוסים' },
                    { value: 'paid', label: 'שולם' },
                    { value: 'pending', label: 'ממתין' },
                    { value: 'overdue', label: 'באיחור' },
                  ]}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="sm:w-40"
                />
                <Button variant="outline" size="md">
                  <Download className="w-5 h-5" />
                  ייצא
                </Button>
                <Button variant="primary" size="md">
                  <Plus className="w-5 h-5" />
                  הוסף לקוח
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>אימייל</TableHead>
                  <TableHead>טלפון</TableHead>
                  <TableHead>חוב</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>תשלום אחרון</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm">
                          {customer.name.charAt(0)}
                        </div>
                        {customer.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.phone}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          customer.debt === '₪0'
                            ? 'text-[#10b981]'
                            : customer.status === 'overdue'
                            ? 'text-destructive'
                            : ''
                        }
                      >
                        {customer.debt}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.lastPayment}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">לא נמצאו לקוחות התואמים לחיפוש</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
