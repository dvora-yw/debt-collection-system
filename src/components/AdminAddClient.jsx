import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { Tabs } from './Tabs';
import { ArrowRight, Save, UserPlus, Building, CreditCard, Trash2, Plus } from 'lucide-react';
import { createClient, createContactsForClient } from '../services/clientService';

export function AdminAddClient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    client: {
      name: "",
      entityType: "",
      identificationNumber: "",
      address: "",
      phone: "",
      email: "",
      fax: "",
      establishedDate: "",
      notes: "",
      vatNumber: "",
      paymentModel: "",
      paymentTerms: "",
    },
    contacts: [
      { firstName: "", lastName: "", role: "", phone: "", email: "" }
    ]
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleClientChange = (field, value) => {
    setFormData((prev) => ({ ...prev, client: { ...prev.client, [field]: value } }));
  };

  const handleContactChange = (index, field, value) => {
    setFormData((prev) => {
      const contacts = [...prev.contacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...prev, contacts };
    });
  };

  const addContact = () => {
    setFormData((prev) => ({ ...prev, contacts: [...prev.contacts, { firstName: "", lastName: "", role: "", phone: "", email: "" }] }));
  };

  const removeContact = (index) => {
    setFormData((prev) => ({ ...prev, contacts: prev.contacts.filter((_, i) => i !== index) }));
  };

  const entityTypeConfig = [
    { value: '', label: 'בחר סוג ישות', requiresVat: false },
    { value: 'EXEMPT_DEALER', label: 'עוסק פטור', requiresVat: false },
    { value: 'AUTHORIZED_DEALER', label: 'עוסק מורשה', requiresVat: true },
    { value: 'PRIVATE_COMPANY', label: 'חברה פרטית (ח"פ)', requiresVat: true },
    { value: 'PUBLIC_COMPANY', label: 'חברה ציבורית', requiresVat: true },
    { value: 'REGISTERED_PARTNERSHIP', label: 'שותפות רשומה', requiresVat: true },
    { value: 'LIMITED_PARTNERSHIP', label: 'שותפות מוגבלת', requiresVat: true },
    { value: 'NON_PROFIT', label: 'עמותה / מלכ"ר', requiresVat: false },
    { value: 'COOPERATIVE', label: 'אגודה שיתופית', requiresVat: false },
    { value: 'FOREIGN_COMPANY', label: 'חברה זרה', requiresVat: true },
    { value: 'PRIVATE_PERSON', label: 'אדם פרטי', requiresVat: false },
  ];

const getEntityConfig = (type) => {
  const cfg = entityTypeConfig.find((e) => e.value === type);
  return cfg || { value: '', label: 'בחר סוג ישות', requiresVat: false };
};
  const validate = () => {
    const e = {};
    const c = formData.client;
    if (!c.name || !c.name.trim()) e.name = 'שם הלקוח חובה';
    if (!c.identificationNumber || !String(c.identificationNumber).trim()) e.identificationNumber = 'מספר זיהוי חובה';

  
    const cfg2 = entityTypeConfig.find(e => e.value === c.entityType);
    if (cfg2?.requiresVat && (!c.vatNumber || !String(c.vatNumber).trim())) {
          e.vatNumber = 'ח.פ / ע.מ חובה עבור ישות זו';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      // Filter out empty contacts (no firstName, lastName, role, phone, or email)
      const validContacts = (formData.contacts || []).filter((c) => {
        const fields = [c.firstName, c.lastName, c.role, c.phone, c.email];
        return fields.some((v) => v && String(v).trim());
      });

      const payload = {
        name: formData.client.name,
        entityType: formData.client.entityType,
        identificationNumber: formData.client.identificationNumber,
        address: formData.client.address,
        phone: formData.client.phone,
        email: formData.client.email,
        fax: formData.client.fax,
        notes: formData.client.notes,
        establishedDate: formData.client.establishedDate,
        vatNumber: formData.client.vatNumber,
        paymentModel: formData.client.paymentModel,
        paymentTerms: formData.client.paymentTerms,
        // Only send non-empty contacts to server
        contacts: validContacts,
      };
      
      console.log('=== CREATING CLIENT ===');
      console.log('Payload:', payload);
      console.log('User from localStorage:', localStorage.getItem('user'));
      
      const res = await createClient(payload);
      console.log('=== CREATE CLIENT RESPONSE ===');
      console.log('Response status:', res.status);
      console.log('Response data:', res.data);

      if (res.status === 200 || res.status === 201) {
        alert('הלקוח נוסף בהצלחה');
        navigate('/clients');
      } else {
        setApiError('תגובה לא צפויה מהשרת: ' + res.status);
      }
    } catch (err) {
      console.error('=== CREATE CLIENT ERROR ===');
      console.error('Full error:', err);
      console.error('Error response status:', err.response?.status);
      console.error('Error response data:', err.response?.data);
      console.error('Error message:', err.message);
      
      if (err.response?.status === 401) {
        setApiError('אין הרשאה - יש להתחבר מחדש');
      } else if (err.response?.status === 403) {
        setApiError('אין הרשאה ליצור לקוחות');
      } else if (err.response?.status === 400) {
        setApiError('בדיקת קלט נכשלה: ' + (err.response?.data?.message || 'נתונים לא תקינים'));
      } else if (err.response?.status === 500) {
        const errorMsg = err.response?.data?.message || err.message || '';
        if (errorMsg.includes('duplicate key') || errorMsg.includes('Duplicate entry') || errorMsg.includes('UQ_Clients_Identification')) {
          setApiError('לקוח עם מספר זיהוי זה וסוג ישות זו כבר קיים במערכת');
        } else {
          setApiError('שגיאת שרת: ' + (err.response?.data?.message || 'נסה שוב מאוחר יותר'));
        }
      } else if (err.response?.data?.message) {
        setApiError('שגיאה: ' + err.response.data.message);
      } else {
        setApiError('שגיאה ביצירת הלקוח: ' + (err.message || 'שגיאה לא ידועה'));
      }
    } finally {
      setSubmitting(false);
    }


  };

  const clientDetailsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Input
          label="שם לקוח / חברה"
          placeholder="שם החברה או הלקוח"
          value={formData.client.name}
          onChange={(e) => handleClientChange('name', e.target.value)}
          error={errors.name}
          required
        />

        <Select
          label="סוג ישות"
          options={entityTypeConfig}
          value={formData.client.entityType}
          onChange={(e) => handleClientChange('entityType', e.target.value)}
          required
        />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
   
        <Input
          label={
            entityTypeConfig[formData.client.entityType]?.idLabel || 'מספר זיהוי'
          }
          value={formData.client.identificationNumber}
          onChange={(e) =>
            handleClientChange('identificationNumber', e.target.value)
          }
          required
        />
        <Input
          label="תאריך הקמה"
          type="date"
          value={formData.client.establishedDate}
          onChange={(e) => handleClientChange('establishedDate', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="טלפון"
          placeholder="050-1234567"
          value={formData.client.phone}
          onChange={(e) => handleClientChange('phone', e.target.value)}
        />
        <Input
          label="אימייל"
          placeholder="example@domain.com"
          value={formData.client.email}
          onChange={(e) => handleClientChange('email', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="פקס"
          placeholder="03-1234567"
          value={formData.client.fax}
          onChange={(e) => handleClientChange('fax', e.target.value)}
        />
        <Input
          label="כתובת"
          placeholder="רחוב, מספר, עיר"
          value={formData.client.address}
          onChange={(e) => handleClientChange('address', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {entityTypeConfig.find(e => e.value === formData.client.entityType)?.requiresVat && (
          <Input
            label="ח.פ / ע.מ"
            value={formData.client.vatNumber}
            onChange={(e) => handleClientChange('vatNumber', e.target.value)}
            required
          />
        )}
 
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      </div>

      <div>
        <label className="block mb-2 text-foreground">הערות</label>
        <textarea
          className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          rows={4}
          value={formData.client.notes}
          onChange={(e) => handleClientChange('notes', e.target.value)}
        />
      </div>
    </div>
  );

  const contactsTab = (
    <div className="space-y-4">
      {formData.contacts.map((c, idx) => (
        <div key={idx} className="p-4 bg-background border border-border rounded-xl">
          <div className="flex items-start gap-6">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="שם פרטי" value={c.firstName} onChange={(e) => handleContactChange(idx, 'firstName', e.target.value)} />
              <Input label="שם משפחה" value={c.lastName} onChange={(e) => handleContactChange(idx, 'lastName', e.target.value)} />
              <Input label="תפקיד" value={c.role} onChange={(e) => handleContactChange(idx, 'role', e.target.value)} />
              <Input label="טלפון" value={c.phone} onChange={(e) => handleContactChange(idx, 'phone', e.target.value)} />
              <Input label="אימייל" value={c.email} onChange={(e) => handleContactChange(idx, 'email', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="danger" size="sm" onClick={() => removeContact(idx)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" size="md" onClick={addContact}>
        <Plus className="w-4 h-4" />
        הוסף איש קשר
      </Button>
    </div>
  );

  const paymentTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="מודל תשלום"
          options={[
            { value: '', label: 'בחר מודל' },
            { value: 'invoice', label: 'חשבונית' },
            { value: 'subscription', label: 'מנוי' },
            { value: 'installments', label: 'תשלומים' },
          ]}
          value={formData.client.paymentModel}
          onChange={(e) => handleClientChange('paymentModel', e.target.value)}
        />
        <Select
          label="תנאי תשלום"
          options={[
            { value: '', label: 'בחר תנאי' },
            { value: 'immediate', label: 'תשלום מיידי' },
            { value: '30', label: 'שוטף + 30' },
            { value: '60', label: 'שוטף + 60' },
          ]}
          value={formData.client.paymentTerms}
          onChange={(e) => handleClientChange('paymentTerms', e.target.value)}
        />
      </div>
    </div>
  );

  const tabs = [
    { id: 'client', label: 'פרטי לקוח', content: clientDetailsTab },
    { id: 'contacts', label: 'אנשי קשר', content: contactsTab },
    { id: 'payment', label: 'תשלומים ותנאים', content: paymentTab },
  ];

  const requiredMissing = (() => {
    const c = formData.client;
    const cfg = getEntityConfig(c.entityType);
    
    return (
      !c.name ||
      !c.identificationNumber ||
      (cfg.requiresVat && (!c.vatNumber || !String(c.vatNumber).trim()))
    );
  })();

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button type="button" onClick={() => navigate('/admin-dashboard')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowRight className="w-5 h-5" />
            חזרה לדשבורד
          </button>
          <h1 className="text-3xl mb-2">הוספת לקוח חדש</h1>
          <p className="text-muted-foreground">הזן את פרטי הלקוח בטפסים הבאים</p>
        </div>

        {/* Form Card */}
        <Card padding="lg">
          <form onSubmit={handleSubmit}>
            <Tabs tabs={tabs} />

            {apiError && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
                {apiError}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-border">
              <Button type="submit" size="lg" className="flex-1" disabled={requiredMissing || submitting}>
                <Save className="w-5 h-5" />
                {submitting ? 'שומר...' : 'שמור לקוח'}
              </Button>
              <Button type="button" variant="outline" size="lg" className="flex-1" disabled={submitting} onClick={() => navigate('/clients')}>
                ביטול
              </Button>
            </div>
          </form>
        </Card>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-card rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">
            💡 <strong>טיפ:</strong> ניתן לערוך את פרטי הלקוח בכל עת מתוך דף הלקוח.
            מסגרת האשראי והתנאים יכולים להשתנות לפי הצורך.
          </p>
        </div>
      </div>
    </div>
  );
}
