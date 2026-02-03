import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import api from '../services/api';
import {
  ArrowRight,
  User,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Edit2,
  Trash2,
} from 'lucide-react';

export function EndCustomerView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [endCustomerData, setEndCustomerData] = useState(null);
  const [persons, setPersons] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch end customer details (חובה להצלחת המסך)
        const endCustomerRes = await api.get(`/end-clients/${id}`);
        setEndCustomerData(endCustomerRes.data);

        // סיכום פיננסי (יתרה, חיוב מחזורי, חיובים פתוחים, תשלומים)
        try {
          const summaryRes = await api.get(`/end-clients/${id}/financial-summary`);
          setFinancialSummary(summaryRes.data);
        } catch (summaryErr) {
          console.warn('Error fetching financial summary for end client:', summaryErr);
        }

        // Fetch persons for this end customer (רשימת אנשי קשר)
        try {
          const personsRes = await api.get(`/persons/by-end-client/${id}`);
          setPersons(personsRes.data || []);
        } catch (personsErr) {
          // אם השרת מחזיר 404 לאנשי קשר – נתייחס כאילו אין אנשי קשר, אבל לא נפיל את כל המסך
          if (personsErr?.response?.status === 404) {
            console.warn('No persons found for end-client, treating as empty list');
            setPersons([]);
          } else {
            console.error('Error fetching persons for end client:', personsErr);
          }
        }
      } catch (err) {
        console.error('Error fetching end customer data:', err);
        setError('שגיאה בטעינת נתונים');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) return <div className="p-8">טוען נתונים...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!endCustomerData) return <div className="p-8">אין נתונים</div>;

  const customerInfo = {
    name: endCustomerData.endClientName || endCustomerData.name,
    accountNumber: `EC-${endCustomerData.id}`,
  };

  const balance = financialSummary?.accountBalance;
  const recurring = financialSummary?.recurring || [];
  const openCharges = financialSummary?.openCharges || [];
  const recentPayments = financialSummary?.recentPayments || [];

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
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4" />
                עדכן
              </Button>
            </div>
          </div>
        </Card>

        {/* Financial Summary */}
        <Card padding="lg" className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>סטטוס תשלומים</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">יתרת זכות</p>
                <p className="text-lg font-semibold">
                  {balance ? `₪${Number(balance.balance || 0).toLocaleString('he-IL')}` : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">חיוב מחזורי</p>
                {recurring.length > 0 ? (
                  <p className="text-sm">
                    החל מ־{recurring[0].startDate} כל {recurring[0].intervalValue} {recurring[0].intervalUnit}
                    {recurring[0].endDate ? ` עד ${recurring[0].endDate}` : ''}
                  </p>
                ) : (
                  <p className="text-sm">אין חיוב מחזורי</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">חיובים פתוחים</p>
                <p className="text-sm">
                  {openCharges.length === 0
                    ? 'אין חיובים פתוחים'
                    : `${openCharges.length} חיובים בסך ₪${openCharges
                        .reduce((sum, c) => sum + Number(c.amount || 0), 0)
                        .toLocaleString('he-IL')}`}
                </p>
              </div>
            </div>

            {recentPayments && recentPayments.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">תשלומים אחרונים</p>
                <div className="space-y-2">
                  {recentPayments.map((p) => (
                    <div key={p.id} className="flex justify-between text-sm">
                      <span>{p.date}</span>
                      <span>₪{Number(p.amount || 0).toLocaleString('he-IL')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacts / PERSON Section */}
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>אנשי קשר (PERSON)</CardTitle>
              </div>
              <Badge variant="primary">{persons.length} אנשים</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {persons && persons.length > 0 ? (
              <div className="space-y-3">
                {persons.map((person) => (
                  <div
                    key={person.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-background rounded-xl border border-border hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {person.firstName} {person.lastName}
                          </p>
                          {person.role && (
                            <Badge variant="outline" size="sm">
                              {person.role}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          {person.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span>{person.email}</span>
                            </div>
                          )}
                          {person.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{person.phone}</span>
                            </div>
                          )}
                          {person.address && (
                            <p className="text-sm text-muted-foreground">{person.address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground">אין אנשי קשר להוספה</p>
                <Button className="mt-4">
                  הוסף איש קשר
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
