import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import api from '../services/api';

function parseAmount(value) {
  if (!value && value !== 0) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = value.replace(/[^0-9.-]+/g, '');
    return parseFloat(num) || 0;
  }
  return 0;
}

function formatCurrency(num) {
  try {
    return '₪' + Number(num).toLocaleString('he-IL');
  } catch (e) {
    return '₪' + num;
  }
}

export function EndCustomerDetails({ endClient }) {
  const [persons, setPersons] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allPayments, setAllPayments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personsRes, summaryRes] = await Promise.allSettled([
          api.get(`/persons/by-end-client/${endClient.id}`),
          api.get(`/end-clients/${endClient.id}/financial-summary`),
        ]);

        if (personsRes.status === 'fulfilled') {
          const data = personsRes.value.data;
          setPersons(Array.isArray(data) ? data : []);
        } else {
          console.error('Error fetching persons:', personsRes.reason);
        }

        if (summaryRes.status === 'fulfilled') {
          setFinancialSummary(summaryRes.value.data);
        } else {
          console.warn('Error fetching financial summary for end client:', summaryRes.reason);
        }

        try {
          const paymentsRes = await api.get(`/payments?endCustomerId=${endClient.id}`);
          const paymentsData = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];
          setAllPayments(paymentsData);
        } catch (paymentsErr) {
          console.warn('Error fetching payments history for end client:', paymentsErr);
          setAllPayments([]);
        }
      } catch (err) {
        console.error('Error loading end client details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (endClient?.id) {
      fetchData();
    }
  }, [endClient?.id]);

  const balance = financialSummary?.accountBalance;
  const recurring = financialSummary?.recurring || [];
  const openCharges = financialSummary?.openCharges || [];
  const recentPayments = financialSummary?.recentPayments || [];
  const hasRecurring = recurring.length > 0;
  const totalOpenDebt = openCharges.reduce((sum, c) => sum + parseAmount(c.amount || 0), 0);
  const totalPaid = allPayments.reduce(
    (sum, p) => sum + parseAmount(p.amount || 0),
    0
  );
  const hasExtraClientDetails = Boolean(
    endClient.identificationNumber || endClient.status || endClient.createdAt
  );
  const usersFromEndClient = Array.isArray(endClient.users) ? endClient.users : [];
  const contactsCount =
    persons.length > 0 ? persons.length : usersFromEndClient.length;

  const recurringDetails = recurring[0] || null;
  const recurringAmount = recurringDetails
    ? parseAmount(
        recurringDetails.amount ||
          recurringDetails.chargeAmount ||
          recurringDetails.recurringAmount ||
          0
      )
    : 0;

  const handleExport = () => {
    import('../utils/exportXlsx').then(({ exportToXlsx }) => {
      const rows = [
        {
          id: endClient.id,
          name: endClient.endClientName || endClient.name || '',
          debt: endClient.debt ?? '',
          status: endClient.status || '',
          createdAt: endClient.createdAt || '',
        },
      ];
      const personRows = (persons || []).map((p) => ({
        id: p.id,
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        email: p.email || '',
        phone: p.phone || '',
        role: p.role || '',
      }));
      const allRows = rows.concat(personRows);
      exportToXlsx(`end-client-${endClient.id}.xlsx`, allRows, 'EndClient');
    });
  };

  if (!endClient) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Debt Summary */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-red-100 text-xs font-medium mb-1">סך החוב</p>
        <h3 className="text-4xl font-bold mb-3">
          {formatCurrency(
            totalOpenDebt > 0
              ? totalOpenDebt
              : parseAmount(endClient.debt || 0)
          )}
        </h3>
        <p className="text-red-100 text-sm">
          לקוח קצה: {endClient.endClientName || endClient.name}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* End Client Info - render only if there are extra details beyond the name */}
        {hasExtraClientDetails && (
          <Card
            padding="md"
            className="border-2 border-primary/10 hover:border-primary/30 transition-all lg:col-span-2"
          >
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                פרטי לקוח קצה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">שם</p>
                  <p className="font-bold text-base">
                    {endClient.endClientName || endClient.name}
                  </p>
                </div>
                {endClient.identificationNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">מזהה / ת.ז</p>
                    <p className="text-xs font-mono bg-muted/50 p-1.5 rounded">
                      {endClient.identificationNumber}
                    </p>
                  </div>
                )}
                {endClient.status && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">סטטוס</p>
                    <Badge
                      variant={endClient.status === 'ACTIVE' ? 'primary' : 'secondary'}
                    >
                      {endClient.status === 'ACTIVE' ? 'פעיל' : endClient.status}
                    </Badge>
                  </div>
                )}
                {endClient.createdAt && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">נוצר</p>
                    <p className="text-xs">
                      {new Date(endClient.createdAt).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <Card
          padding="md"
          className={`border-2 border-secondary/10 hover:border-secondary/30 transition-all ${
            hasExtraClientDetails ? '' : 'lg:col-span-3'
          }`}
        >
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              סטטיסטיקה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-primary/5 rounded-lg text-sm">
                <span className="text-xs text-muted-foreground">אנשי קשר</span>
                <span className="text-xl font-bold text-primary">{contactsCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-secondary/5 rounded-lg text-sm">
                <span className="text-xs text-muted-foreground">יתרה לתשלום / זכות</span>
                <span className="text-sm font-semibold">
                  {balance ? formatCurrency(balance.balance || 0) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-secondary/5 rounded-lg text-sm">
                <span className="text-xs text-muted-foreground">חיובים פתוחים</span>
                <span className="text-xs font-medium">
                  {openCharges.length === 0
                    ? 'אין חיובים פתוחים'
                    : `${openCharges.length} חיובים · ${formatCurrency(totalOpenDebt)}`}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-secondary/5 rounded-lg text-sm">
                <span className="text-xs text-muted-foreground">סה"כ שולם עד היום</span>
                <span className="text-xs font-medium">
                  {allPayments.length === 0
                    ? 'אין תשלומים'
                    : formatCurrency(totalPaid)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-secondary/5 rounded-lg text-sm">
                <span className="text-xs text-muted-foreground">אופי התשלום</span>
                <span className="text-xs font-medium">
                  {hasRecurring ? 'מחזורי' : 'חד פעמי'}
                </span>
              </div>
              {hasRecurring && (
                <div className="flex flex-col gap-1 p-2 bg-secondary/10 rounded-lg text-xs">
                  <span className="text-muted-foreground">פרטי חיוב מחזורי</span>
                  <span>
                    {recurringAmount > 0 && `${formatCurrency(recurringAmount)} `}
                    כל {recurringDetails.intervalValue} {recurringDetails.intervalUnit}
                    {recurringDetails.endDate
                      ? ` עד ${recurringDetails.endDate}`
                      : ''}
                  </span>
                </div>
              )}
              <Button variant="primary" className="w-full mt-3" onClick={handleExport}>
                יצוא לאקסל
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Persons / Users */}
      {!loading && persons.length > 0 && (
        <Card padding="md" className="border-2 border-green-500/10">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              אנשי קשר ({persons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {persons.map((person) => (
                <div
                  key={person.id}
                  className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-800/30 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {person.firstName?.charAt(0)}
                      {person.lastName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs">
                        {person.firstName} {person.lastName}
                      </p>
                      {person.role && (
                        <p className="text-xs text-muted-foreground">{person.role}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    {person.email && (
                      <p>
                        <span className="font-semibold">אימייל:</span> {person.email}
                      </p>
                    )}
                    {person.phone && (
                      <p>
                        <span className="font-semibold">טלפון:</span> {person.phone}
                      </p>
                    )}
                    {Array.isArray(person.contacts) && person.contacts.length > 0 && (
                      <div className="pt-1 border-t border-green-200/60 mt-1">
                        <p className="font-semibold mb-0.5 text-[10px] text-green-800">
                          פרטי התקשרות נוספים
                        </p>
                        <div className="space-y-0.5">
                          {person.contacts.map((c, idx) => (
                            <p key={idx} className="text-[11px]">
                              <span className="font-semibold">
                                {c.type === 'EMAIL'
                                  ? 'אימייל'
                                  : c.type === 'PHONE'
                                  ? 'טלפון'
                                  : c.type === 'MOBILE'
                                  ? 'נייד'
                                  : c.type === 'FAX'
                                  ? 'פקס'
                                  : c.type || ''}
                                :
                              </span>{' '}
                              {c.value}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fallback: show end-client users when PERSON records are missing */}
      {!loading && persons.length === 0 && usersFromEndClient.length > 0 && (
        <Card padding="md" className="border-2 border-green-500/10">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              משתמשי לקוח קצה ({usersFromEndClient.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {usersFromEndClient.map((user) => (
                <div
                  key={user.id || user.userId || user.email}
                  className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-800/30 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {(user.userName || user.email || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs break-all">
                        {user.userName || user.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    {user.email && (
                      <p>
                        <span className="font-semibold">אימייל:</span> {user.email}
                      </p>
                    )}
                    {user.phone && (
                      <p>
                        <span className="font-semibold">טלפון:</span> {user.phone}
                      </p>
                    )}
                    {user.identificationNumber && (
                      <p>
                        <span className="font-semibold">ת.ז:</span> {user.identificationNumber}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && persons.length === 0 && usersFromEndClient.length === 0 && (
        <Card
          padding="lg"
          className="text-center py-12 border-2 border-dashed border-muted-foreground/20"
        >
          <p className="text-muted-foreground">אין אנשי קשר להצגה</p>
        </Card>
      )}

      {/* Payments History */}
      {allPayments && allPayments.length > 0 && (
        <Card padding="md" className="border-2 border-blue-500/10">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              היסטוריית תשלומים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              {allPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 bg-muted/40 rounded-lg"
                >
                  <span>
                    {p.paymentDate
                      ? new Date(p.paymentDate).toLocaleDateString('he-IL')
                      : p.date || ''}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(p.amount || 0)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EndCustomerDetails;
