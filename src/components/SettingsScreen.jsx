import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { ArrowRight, Save, Settings as SettingsIcon, Eye, EyeOff } from 'lucide-react';



export function SettingsScreen({ onBack }) {
  const [dashboardKPIs, setDashboardKPIs] = useState({
    totalPayments: true,
    activeClients: true,
    pendingPayments: true,
    collectionRate: true,
  });

  const [clientsColumns, setClientsColumns] = useState({
    contactPerson: true,
    email: true,
    phone: true,
    companyId: true,
    creditLimit: true,
    debt: true,
    lastPayment: true,
    accountManager: true,
    documents: true,
  });

  const [paymentsColumns, setPaymentsColumns] = useState({
    customerName: true,
    method: true,
    date: true,
    time: true,
    invoiceNumber: true,
    reference: true,
    processor: true,
  });

  const handleSave = () => {
    console.log('Settings saved:', {
      dashboardKPIs,
      clientsColumns,
      paymentsColumns,
    });
    alert('ההגדרות נשמרו בהצלחה!');
  };

  const toggleDashboardKPI = (kpi) => {
    setDashboardKPIs((prev) => ({ ...prev, [kpi]: !prev[kpi] }));
  };

  const toggleClientsColumn = (column) => {
    setClientsColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const togglePaymentsColumn = (column) => {
    setPaymentsColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              חזרה לדשבורד
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl">הגדרות מערכת</h1>
              <p className="text-muted-foreground">התאם את תצוגת הדשבורד והטבלאות</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Dashboard KPIs Settings */}
          <Card padding="lg">
            <CardHeader>
              <CardTitle>KPI בדשבורד</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                בחר אילו מדדים להציג בדשבורד הראשי
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingToggle
                  label="סך הכל תשלומים"
                  description="הצג את סך התשלומים החודשי"
                  checked={dashboardKPIs.totalPayments}
                  onChange={() => toggleDashboardKPI('totalPayments')}
                />
                <SettingToggle
                  label="לקוחות פעילים"
                  description="הצג מספר לקוחות פעילים"
                  checked={dashboardKPIs.activeClients}
                  onChange={() => toggleDashboardKPI('activeClients')}
                />
                <SettingToggle
                  label="תשלומים ממתינים"
                  description="הצג סכום תשלומים ממתינים"
                  checked={dashboardKPIs.pendingPayments}
                  onChange={() => toggleDashboardKPI('pendingPayments')}
                />
                <SettingToggle
                  label="שיעור גבייה"
                  description="הצג אחוז הגבייה החודשי"
                  checked={dashboardKPIs.collectionRate}
                  onChange={() => toggleDashboardKPI('collectionRate')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Clients Table Columns */}
          <Card padding="lg">
            <CardHeader>
              <CardTitle>עמודות בטבלת לקוחות</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                בחר אילו עמודות להציג בטבלת הלקוחות
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SettingToggle
                  label="איש קשר"
                  checked={clientsColumns.contactPerson}
                  onChange={() => toggleClientsColumn('contactPerson')}
                />
                <SettingToggle
                  label="אימייל"
                  checked={clientsColumns.email}
                  onChange={() => toggleClientsColumn('email')}
                />
                <SettingToggle
                  label="טלפון"
                  checked={clientsColumns.phone}
                  onChange={() => toggleClientsColumn('phone')}
                />
                <SettingToggle
                  label="ח.פ / ע.מ"
                  checked={clientsColumns.companyId}
                  onChange={() => toggleClientsColumn('companyId')}
                />
                <SettingToggle
                  label="מסגרת אשראי"
                  checked={clientsColumns.creditLimit}
                  onChange={() => toggleClientsColumn('creditLimit')}
                />
                <SettingToggle
                  label="חוב"
                  checked={clientsColumns.debt}
                  onChange={() => toggleClientsColumn('debt')}
                />
                <SettingToggle
                  label="תשלום אחרון"
                  checked={clientsColumns.lastPayment}
                  onChange={() => toggleClientsColumn('lastPayment')}
                />
                <SettingToggle
                  label="מנהל חשבון"
                  checked={clientsColumns.accountManager}
                  onChange={() => toggleClientsColumn('accountManager')}
                />
                <SettingToggle
                  label="מסמכים"
                  checked={clientsColumns.documents}
                  onChange={() => toggleClientsColumn('documents')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payments Table Columns */}
          <Card padding="lg">
            <CardHeader>
              <CardTitle>עמודות בטבלת תשלומים</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                בחר אילו עמודות להציג בטבלת התשלומים
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SettingToggle
                  label="שם משלם"
                  checked={paymentsColumns.customerName}
                  onChange={() => togglePaymentsColumn('customerName')}
                />
                <SettingToggle
                  label="אמצעי תשלום"
                  checked={paymentsColumns.method}
                  onChange={() => togglePaymentsColumn('method')}
                />
                <SettingToggle
                  label="תאריך"
                  checked={paymentsColumns.date}
                  onChange={() => togglePaymentsColumn('date')}
                />
                <SettingToggle
                  label="שעה"
                  checked={paymentsColumns.time}
                  onChange={() => togglePaymentsColumn('time')}
                />
                <SettingToggle
                  label="מספר חשבונית"
                  checked={paymentsColumns.invoiceNumber}
                  onChange={() => togglePaymentsColumn('invoiceNumber')}
                />
                <SettingToggle
                  label="אסמכתא"
                  checked={paymentsColumns.reference}
                  onChange={() => togglePaymentsColumn('reference')}
                />
                <SettingToggle
                  label="מעבד תשלומים"
                  checked={paymentsColumns.processor}
                  onChange={() => togglePaymentsColumn('processor')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button onClick={handleSave} size="lg" className="flex-1">
              <Save className="w-5 h-5" />
              שמור הגדרות
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="outline" size="lg" className="flex-1">
                ביטול
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



function SettingToggle({ label, description, checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`p-4 rounded-xl border-2 transition-all text-right ${
        checked
          ? 'border-primary bg-primary/5'
          : 'border-border bg-background hover:border-muted-foreground/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className={`font-medium mb-1 ${checked ? 'text-primary' : ''}`}>{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            checked ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
          }`}
        >
          {checked ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </div>
      </div>
    </button>
  );
}
