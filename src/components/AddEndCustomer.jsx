import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { ArrowRight, Save, UserPlus, X, Plus } from 'lucide-react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import {
  validateName,
  validatePhone,
  validateEmail,
  validateAmount,
  validateIDNumber,
} from '../utils/validation';

export function AddEndCustomer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    totalDebt: "",
    dueDate: "",
    paymentMethod: "CASH",
    chargeType: "ONE_TIME", // ONE_TIME / RECURRING
    initialBalance: "",
    recurringStartDate: "",
    recurringIntervalValue: "1",
    recurringIntervalUnit: "MONTHS",
    recurringEndDate: "",
    persons: [
      {
        firstName: "",
        lastName: "",
        identificationNumber: "",
        contacts: [
          { type: "EMAIL", value: "" },
          { type: "PHONE", value: "" },
        ]
      }
    ]
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const paymentMethods = [
    { value: 'CASH', label: 'מזומן' },
    { value: 'CREDIT', label: 'כרטיס אשראי' },
    { value: 'BANK_TRANSFER', label: 'העברה בנקאית' },
    { value: 'CHECK', label: 'צ\'ק' },
  ];

  const chargeTypes = [
    { value: 'ONE_TIME', label: 'חד פעמי' },
    { value: 'RECURRING', label: 'מחזורי' },
  ];

  const intervalUnits = [
    { value: 'DAYS', label: 'ימים' },
    { value: 'MONTHS', label: 'חודשים' },
    { value: 'YEARS', label: 'שנים' },
  ];

  const contactTypes = [
    { value: 'EMAIL', label: 'אימייל' },
    { value: 'PHONE', label: 'טלפון' },
    { value: 'MOBILE', label: 'נייד' },
    { value: 'FAX', label: 'פקס' },
    { value: 'OTHER', label: 'אחר' },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const newErrors = { ...errors };
    
    switch (field) {
      case 'name':
        const nameError = validateName(value);
        if (nameError) {
          newErrors.name = nameError;
        } else {
          delete newErrors.name;
        }
        break;
      
      case 'totalDebt':
        const amountError = validateAmount(value);
        if (amountError) {
          newErrors.totalDebt = amountError;
        } else {
          delete newErrors.totalDebt;
        }
        break;
      
      default:
        // Clear error for this field on change
        delete newErrors[field];
        break;
    }
    
    setErrors(newErrors);
  };

  const handlePersonChange = (personIndex, field, value) => {
    setFormData((prev) => {
      const newPersons = [...prev.persons];
      newPersons[personIndex] = { ...newPersons[personIndex], [field]: value };
      return { ...prev, persons: newPersons };
    });
    
    // Real-time validation for person fields
    const newErrors = { ...errors };
    const errorKey = `person_${personIndex}_${field}`;
    
    switch (field) {
      case 'firstName':
      case 'lastName':
        const nameError = validateName(value);
        if (nameError) {
          newErrors[errorKey] = nameError;
        } else {
          delete newErrors[errorKey];
        }
        break;
      case 'identificationNumber': {
        const idError = validateIDNumber(value);
        if (idError) {
          newErrors[errorKey] = idError;
        } else {
          delete newErrors[errorKey];
        }
        break;
      }
      default:
        delete newErrors[errorKey];
        break;
    }
    
    setErrors(newErrors);
  };

  const handleContactChange = (personIndex, contactIndex, field, value) => {
    setFormData((prev) => {
      const newPersons = [...prev.persons];
      const newContacts = [...newPersons[personIndex].contacts];
      newContacts[contactIndex] = { ...newContacts[contactIndex], [field]: value };
      newPersons[personIndex] = { ...newPersons[personIndex], contacts: newContacts };
      return { ...prev, persons: newPersons };
    });
    
    // Real-time validation for contact values
    const newErrors = { ...errors };
    const errorKey = `contact_${personIndex}_${contactIndex}_${field}`;
    
    if (field === 'value') {
      const contact = formData.persons[personIndex]?.contacts[contactIndex];
      if (contact?.type === 'EMAIL') {
        const emailError = validateEmail(value);
        if (emailError) {
          newErrors[errorKey] = emailError;
        } else {
          delete newErrors[errorKey];
        }
      } else if (contact?.type === 'PHONE' || contact?.type === 'MOBILE') {
        const phoneError = validatePhone(value);
        if (phoneError) {
          newErrors[errorKey] = phoneError;
        } else {
          delete newErrors[errorKey];
        }
      } else {
        delete newErrors[errorKey];
      }
    } else {
      delete newErrors[errorKey];
    }
    
    setErrors(newErrors);
  };

  const addPerson = () => {
    setFormData((prev) => ({
      ...prev,
      persons: [
        ...prev.persons,
        {
          firstName: "",
          lastName: "",
          identificationNumber: "",
          contacts: [
            { type: "EMAIL", value: "" },
            { type: "PHONE", value: "" },
          ]
        }
      ]
    }));
  };

  const removePerson = (personIndex) => {
    if (formData.persons.length === 1) {
      alert('חייב להיות לפחות איש קשר אחד');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      persons: prev.persons.filter((_, i) => i !== personIndex)
    }));
  };

  const addContact = (personIndex) => {
    setFormData((prev) => {
      const newPersons = [...prev.persons];
      newPersons[personIndex].contacts.push({ type: "PHONE", value: "" });
      return { ...prev, persons: newPersons };
    });
  };

  const removeContact = (personIndex, contactIndex) => {
    if (formData.persons[personIndex].contacts.length === 1) {
      alert('חייב להיות לפחות איש קשר אחד לכל אדם');
      return;
    }
    setFormData((prev) => {
      const newPersons = [...prev.persons];
      newPersons[personIndex].contacts = newPersons[personIndex].contacts.filter((_, i) => i !== contactIndex);
      return { ...prev, persons: newPersons };
    });
  };

  const validate = () => {
    const e = {};
    if (!formData.name || !formData.name.trim()) {
      e.name = 'שם לקוח קצה חובה';
    }
    if (!formData.totalDebt || parseFloat(formData.totalDebt) <= 0) {
      e.totalDebt = 'סכום חוב חייב להיות גדול מ-0';
    }
    if (!formData.dueDate) {
      e.dueDate = 'תאריך פירעון חובה';
    }

    // Validate persons
    formData.persons.forEach((person, pIdx) => {
      if (!person.firstName || !person.firstName.trim()) {
        e[`person_${pIdx}_firstName`] = 'שם פרטי חובה';
      }
      if (!person.lastName || !person.lastName.trim()) {
        e[`person_${pIdx}_lastName`] = 'שם משפחה חובה';
      }
      const idError = validateIDNumber(person.identificationNumber || '');
      if (idError) {
        e[`person_${pIdx}_identificationNumber`] = idError;
      }

      // Check if at least one EMAIL contact exists
      const hasEmail = person.contacts.some(c => c.type === 'EMAIL' && c.value.trim());
      if (!hasEmail) {
        e[`person_${pIdx}_email`] = 'נדרש לפחות אימייל אחד';
      }

      person.contacts.forEach((contact, cIdx) => {
        if (contact.value && contact.value.trim()) {
          if (contact.type === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.value)) {
            e[`person_${pIdx}_contact_${cIdx}`] = 'אימייל לא תקין';
          }
        }
      });
    });

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

    if (!user?.user?.clientId) {
      setApiError('לא נמצא clientId - אנא התחבר מחדש');
      return;
    }

    setSubmitting(true);
    try {
      // Build persons array with contacts
      const personsPayload = formData.persons.map(person => ({
        firstName: person.firstName,
        lastName: person.lastName,
        identificationNumber: person.identificationNumber,
        contacts: person.contacts
          .filter(c => c.value && c.value.trim())
          .map(c => ({
            type: c.type,
            value: c.value.trim(),
          })),
      }));

      // Build users array for EndClientService.create (one user per email)
      // כל user מקבל גם ת"ז וטלפון (אם קיימים אצל אותו אדם)
      const users = [];
      formData.persons.forEach(person => {
        const phoneContact = (person.contacts || []).find(c =>
          (c.type === 'PHONE' || c.type === 'MOBILE') && c.value && c.value.trim()
        );

        (person.contacts || [])
          .filter(c => c.type === 'EMAIL' && c.value && c.value.trim())
          .forEach(contact => {
            const email = contact.value.trim();
            if (!users.some(u => u.email === email)) {
              users.push({
                userName: email,
                email,
                identificationNumber: person.identificationNumber || '',
                phone: phoneContact ? phoneContact.value.trim() : '',
              });
            }
          });
      });

      // Single payload with clientId, name, totalDebt, and persons
      const isRecurring = formData.chargeType === 'RECURRING';
      const endClientPayload = {
        clientId: user.user.clientId,
        name: formData.name,
        totalDebt: formData.totalDebt,
        persons: personsPayload,
        users,
        initialPrepaidBalance: formData.initialBalance || null,
        initialChargeAmount: formData.totalDebt,
        initialChargeDueDate: formData.dueDate,
        initialChargeType: formData.chargeType,
        intervalValue: isRecurring ? Number(formData.recurringIntervalValue || 0) || null : null,
        intervalUnit: isRecurring ? formData.recurringIntervalUnit : null,
        recurringEndDate: isRecurring ? formData.recurringEndDate || null : null,
        startDate: isRecurring ? (formData.recurringStartDate || formData.dueDate) : null,
      };

      console.log('=== Creating end client with persons ===');
      console.log('Payload:', JSON.stringify(endClientPayload, null, 2));
      
      const endClientRes = await api.post('/end-clients', endClientPayload);
      console.log('=== End client response ===');
      console.log('Full response:', JSON.stringify(endClientRes.data, null, 2));
      
      const endClientId = endClientRes.data.id || endClientRes.data;
      console.log('End client ID:', endClientId);

      // Backend now creates ContactDetails automatically from persons.contacts

      // Create Debt
      try {
        const debtPayload = {
          endClientId: endClientId,
          amount: formData.totalDebt,
          dueDate: formData.dueDate,
          paymentMethod: formData.paymentMethod,
          type: formData.chargeType,
        };

        console.log('=== Creating debt ===');
        console.log('Debt payload:', debtPayload);
        await api.post('/debts', debtPayload);
        console.log('Debt created successfully');
      } catch (debtErr) {
        console.warn('Failed to create debt:', debtErr);
        // Continue even if debt creation fails
      }

      console.log('=== Success - navigating to dashboard ===');
      alert('לקוח קצה נוסף בהצלחה! פרטי התחברות נשלחו במייל.');
      navigate('/client-dashboard');
    } catch (err) {
      console.error('Error creating end customer:', err);
      
      // Extract message from error response
      let errorMessage = 'שגיאה ביצירת לקוח קצה';
      
      if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setApiError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-5xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/client-dashboard')}
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
              <p className="text-muted-foreground">הוסף לקוח קצה חדש עם אנשי קשר וחוב</p>
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
          {/* End Client Info */}
          <Card padding="lg" className="mb-6">
            <CardHeader>
              <CardTitle>פרטי לקוח קצה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="שם לקוח קצה"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                  required
                />
                <Input
                  label="סכום חוב כולל (₪)"
                  type="number"
                  step="0.01"
                  value={formData.totalDebt}
                  onChange={(e) => handleChange('totalDebt', e.target.value)}
                  error={errors.totalDebt}
                  required
                />
                <Input
                  label="תאריך פירעון"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  error={errors.dueDate}
                  required
                />
                <Select
                  label="אמצעי תשלום"
                  value={formData.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  options={paymentMethods}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Setup */}
          <Card padding="lg" className="mb-6">
            <CardHeader>
              <CardTitle>הגדרות תשלום</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input
                  label="יתרת זכות התחלתית (₪)"
                  type="number"
                  step="0.01"
                  value={formData.initialBalance}
                  onChange={(e) => handleChange('initialBalance', e.target.value)}
                />
                <Select
                  label="סוג חיוב"
                  value={formData.chargeType}
                  onChange={(e) => handleChange('chargeType', e.target.value)}
                  options={chargeTypes}
                />
              </div>

              {formData.chargeType === 'RECURRING' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Input
                    label="תאריך התחלה"
                    type="date"
                    value={formData.recurringStartDate}
                    onChange={(e) => handleChange('recurringStartDate', e.target.value)}
                  />
                  <Input
                    label="כל כמה"
                    type="number"
                    min="1"
                    value={formData.recurringIntervalValue}
                    onChange={(e) => handleChange('recurringIntervalValue', e.target.value)}
                  />
                  <Select
                    label="יחידת זמן"
                    value={formData.recurringIntervalUnit}
                    onChange={(e) => handleChange('recurringIntervalUnit', e.target.value)}
                    options={intervalUnits}
                  />
                  <Input
                    label="תאריך סיום (אופציונלי)"
                    type="date"
                    value={formData.recurringEndDate}
                    onChange={(e) => handleChange('recurringEndDate', e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Persons */}
          {formData.persons.map((person, pIdx) => (
            <Card key={pIdx} padding="lg" className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>אדם #{pIdx + 1}</CardTitle>
                  {formData.persons.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePerson(pIdx)}
                    >
                      <X className="w-4 h-4" />
                      הסר
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Input
                    label="שם פרטי"
                    value={person.firstName}
                    onChange={(e) => handlePersonChange(pIdx, 'firstName', e.target.value)}
                    error={errors[`person_${pIdx}_firstName`]}
                    required
                  />
                  <Input
                    label="שם משפחה"
                    value={person.lastName}
                    onChange={(e) => handlePersonChange(pIdx, 'lastName', e.target.value)}
                    error={errors[`person_${pIdx}_lastName`]}
                    required
                  />
                  <Input
                    label="ת.ז"
                    value={person.identificationNumber}
                    onChange={(e) => handlePersonChange(pIdx, 'identificationNumber', e.target.value)}
                    error={errors[`person_${pIdx}_identificationNumber`]}
                  />
                </div>
                {/* Contacts for this person */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">פרטי התקשרות</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addContact(pIdx)}
                    >
                      <Plus className="w-4 h-4" />
                      הוסף
                    </Button>
                  </div>
                  
                  {person.contacts.map((contact, cIdx) => (
                    <div key={cIdx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <Select
                        label="סוג"
                        value={contact.type}
                        onChange={(e) => handleContactChange(pIdx, cIdx, 'type', e.target.value)}
                        options={contactTypes}
                      />
                      <div className="md:col-span-2 flex gap-2 items-start">
                        <Input
                          label="ערך"
                          value={contact.value}
                          onChange={(e) => handleContactChange(pIdx, cIdx, 'value', e.target.value)}
                          error={errors[`person_${pIdx}_contact_${cIdx}`]}
                          placeholder={contact.type === 'EMAIL' ? 'example@email.com' : ''}
                        />
                        {person.contacts.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContact(pIdx, cIdx)}
                            className="mt-8"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {errors[`person_${pIdx}_email`] && (
                    <p className="text-sm text-red-600">{errors[`person_${pIdx}_email`]}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Person Button */}
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={addPerson}
            >
              <Plus className="w-5 h-5" />
              הוסף אדם נוסף
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/client-dashboard')}
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
