import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { ArrowRight, Save, UserPlus } from 'lucide-react';
import api from '../services/api';

export function AdminAddEndCustomer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    identificationNumber: "",
    address: "",
    phone: "",
    email: "",
    notes: "",
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName || !formData.firstName.trim()) e.firstName = 'שם פרטי חובה';
    if (!formData.lastName || !formData.lastName.trim()) e.lastName = 'שם משפחה חובה';
    if (!formData.identificationNumber || !String(formData.identificationNumber).trim()) {
      e.identificationNumber = 'מספר זיהוי חובה';
    }
    if (!formData.phone || !formData.phone.trim()) e.phone = 'טלפון חובה';
    if (!formData.email || !formData.email.trim()) {
      e.email = 'אימייל חובה';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'אימייל לא תקין';
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
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        identificationNumber: formData.identificationNumber,
        address: formData.address || null,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes || null,
        status: formData.status,
      };

      console.log('Creating end customer:', payload);
      const res = await api.post('/end-customers/add', payload);
      console.log('End customer created:', res.data);
      
      alert('לקוח קצה נוסף בהצלחה!');
      navigate('/end-customers'); // Navigate to end customers list (you may need to create this route)
    } catch (err) {
      console.error('Error creating end customer:', err);
      
      // Handle duplicate errors
      if (err.response?.data?.includes('duplicate') || 
          err.response?.data?.includes('ConstraintViolationException')) {
        setApiError('לקוח קצה עם מספר זיהוי זה כבר קיים במערכת');
      } else {
        setApiError(err.response?.data || err.message || 'שגיאה ביצירת לקוח קצה');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl">הוספת לקוח קצה</h1>
              <p className="text-muted-foreground">הזן פרטי לקוח קצה חדש</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card padding="lg" className="mb-6">
            <CardHeader>
              <CardTitle>פרטי לקוח קצה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="שם פרטי"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  error={errors.firstName}
                  required
                />
                <Input
                  label="שם משפחה"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  error={errors.lastName}
                  required
                />
                <Input
                  label="מספר זיהוי (ת.ז)"
                  value={formData.identificationNumber}
                  onChange={(e) => handleChange('identificationNumber', e.target.value)}
                  error={errors.identificationNumber}
                  required
                />
                <Input
                  label="טלפון"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  error={errors.phone}
                  required
                />
                <Input
                  label="אימייל"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                  required
                />
                <Input
                  label="כתובת"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
                <Select
                  label="סטטוס"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  options={[
                    { value: 'ACTIVE', label: 'פעיל' },
                    { value: 'INACTIVE', label: 'לא פעיל' },
                    { value: 'BLOCKED', label: 'חסום' },
                  ]}
                />
              </div>
              
              <div className="mt-6">
                <Input
                  label="הערות"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  multiline
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              <Save className="w-5 h-5" />
              {submitting ? 'שומר...' : 'שמור לקוח קצה'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
