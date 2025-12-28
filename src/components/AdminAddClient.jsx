import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { Tabs } from './Tabs';
import { ArrowRight, Save, UserPlus, Building, CreditCard } from 'lucide-react';

export function AdminAddClient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    
    // Company Info
    companyName: '',
    companyId: '',
    companyType: 'ltd',
    address: '',
    city: '',
    zipCode: '',
    
    // Payment Info
    creditLimit: '',
    paymentTerms: '30',
    accountNumber: '',
    bankName: '',
    branchNumber: '',
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('הלקוח נוסף בהצלחה!');
  };

  const personalInfoTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="שם פרטי"
          placeholder="הזן שם פרטי"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          required
        />
        <Input
          label="שם משפחה"
          placeholder="הזן שם משפחה"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          type="email"
          label="אימייל"
          placeholder="example@domain.com"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
        <Input
          type="tel"
          label="טלפון"
          placeholder="050-1234567"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          required
        />
      </div>
      
      <Input
        label="תעודת זהות"
        placeholder="123456789"
        value={formData.idNumber}
        onChange={(e) => handleInputChange('idNumber', e.target.value)}
        required
      />
      
      <div className="flex items-center gap-2 p-4 bg-secondary/10 border-r-4 border-secondary rounded-xl">
        <UserPlus className="w-5 h-5 text-secondary" />
        <p className="text-sm">פרטי איש קשר ראשי עבור הלקוח</p>
      </div>
    </div>
  );

  const companyInfoTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="שם החברה"
          placeholder="חברת ABC בע״מ"
          value={formData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          required
        />
        <Input
          label="ח.ר / ע.מ"
          placeholder="123456789"
          value={formData.companyId}
          onChange={(e) => handleInputChange('companyId', e.target.value)}
          required
        />
      </div>
      
      <Select
        label="סוג תאגיד"
        options={[
          { value: 'ltd', label: 'בע״מ' },
          { value: 'llc', label: 'שותפות' },
          { value: 'sole', label: 'עוסק מורשה' },
          { value: 'npo', label: 'עמותה' },
        ]}
        value={formData.companyType}
        onChange={(e) => handleInputChange('companyType', e.target.value)}
      />
      
      <Input
        label="כתובת"
        placeholder="רחוב 123"
        value={formData.address}
        onChange={(e) => handleInputChange('address', e.target.value)}
        required
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="עיר"
          placeholder="תל אביב"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          required
        />
        <Input
          label="מיקוד"
          placeholder="1234567"
          value={formData.zipCode}
          onChange={(e) => handleInputChange('zipCode', e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2 p-4 bg-primary/10 border-r-4 border-primary rounded-xl">
        <Building className="w-5 h-5 text-primary" />
        <p className="text-sm">פרטי החברה ישמשו לצורך הפקת חשבוניות ומסמכים</p>
      </div>
    </div>
  );

  const paymentInfoTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="מסגרת אשראי"
          placeholder="50000"
          type="number"
          value={formData.creditLimit}
          onChange={(e) => handleInputChange('creditLimit', e.target.value)}
          required
        />
        <Select
          label="תנאי תשלום"
          options={[
            { value: '0', label: 'תשלום מיידי' },
            { value: '30', label: 'שוטף + 30' },
            { value: '60', label: 'שוטף + 60' },
            { value: '90', label: 'שוטף + 90' },
          ]}
          value={formData.paymentTerms}
          onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
        />
      </div>
      
      <div className="p-6 bg-muted/30 rounded-xl space-y-6">
        <h4 className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-secondary" />
          פרטי חשבון בנק
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="שם הבנק"
            placeholder="בנק הפועלים"
            value={formData.bankName}
            onChange={(e) => handleInputChange('bankName', e.target.value)}
          />
          <Input
            label="מספר סניף"
            placeholder="123"
            value={formData.branchNumber}
            onChange={(e) => handleInputChange('branchNumber', e.target.value)}
          />
        </div>
        
        <Input
          label="מספר חשבון"
          placeholder="123456"
          value={formData.accountNumber}
          onChange={(e) => handleInputChange('accountNumber', e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2 p-4 bg-[#10b981]/10 border-r-4 border-[#10b981] rounded-xl">
        <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center text-white text-xs">
          ✓
        </div>
        <p className="text-sm">פרטי התשלום מאובטחים ומוצפנים</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'personal', label: 'פרטים אישיים', content: personalInfoTab },
    { id: 'company', label: 'פרטי חברה', content: companyInfoTab },
    { id: 'payment', label: 'פרטי תשלום', content: paymentInfoTab },
  ];

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
            
            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-border">
              <Button type="submit" size="lg" className="flex-1">
                <Save className="w-5 h-5" />
                שמור לקוח
              </Button>
              <Button type="button" variant="outline" size="lg" className="flex-1">
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
