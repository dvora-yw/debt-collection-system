import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { Tabs } from './Tabs';
import { ArrowRight, Save, UserPlus, Building, CreditCard, Trash2, Plus, Upload, Eye, Download, Pencil, AlertTriangle, X } from 'lucide-react';
import { createClient, createContactsForClient } from '../services/clientService';
import { saveNotificationPolicy } from '../services/notificationPolicyService';
import api from '../services/api';
import * as XLSX from 'xlsx';
import { listByClient as listDocsByClient, uploadDocument, deleteDocument, replaceDocument } from '../services/clientDocumentService';
import {
  validateName,
  validatePhone,
  validateEmail,
  validateIDNumber,
  validateAddress,
} from '../utils/validation';

export function AdminAddClient() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
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
    ],
    notificationPolicy: {
      useDefault: true,
      legalEscalationAfterDays: 60,
      legalMinAmount: '',
      // יתווספו שלבים ידנית ע"י הלקוח (כפתור "הוסף הודעה")
      steps: [],
    },
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [pendingDocuments, setPendingDocuments] = useState([]); // files queued before client creation
  const [uploadedDocuments, setUploadedDocuments] = useState([]); // after creation, from server
  const docsInputRef = useRef(null);
  const [docToReplace, setDocToReplace] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewMime, setPreviewMime] = useState(null);

  const resolveCandidates = (doc) => {
    const base = api.defaults.baseURL || '';
    const id = doc?.id;
    const candidates = [];

    const addIfUrl = (u) => {
      if (!u) return;
      const s = String(u);
      if (/^https?:\/\//i.test(s) || s.startsWith('/')) {
        candidates.push(s);
      }
    };

    addIfUrl(doc?.url);
    addIfUrl(doc?.fileUrl);
    // Avoid local file paths like C:\... which cause 404s when prefixed by baseURL
    if (id) {
      candidates.push(`${base}/client-documents/${id}/file`);
      candidates.push(`${base}/client-documents/${id}/download`);
      candidates.push(`${base}/client-documents/${id}`);
    }
    return candidates;
  };

  const fetchDocBlob = async (doc) => {
    const candidates = resolveCandidates(doc);
    let lastErr;
    for (const url of candidates) {
      try {
        const res = await api.get(url, { responseType: 'blob' });
        return res;
      } catch (err) {
        lastErr = err;
        const status = err?.response?.status;
        if (![404, 400, 405].includes(status)) break;
      }
    }
    throw lastErr || new Error('לא ניתן לפתוח את המסמך');
  };

  const onPreviewExisting = async (doc) => {
    try {
      const res = await fetchDocBlob(doc);
      const blob = res.data;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewMime(res.headers['content-type'] || blob.type || 'application/octet-stream');
      setPreviewDoc(doc);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || 'שגיאה בפתיחת המסמך');
    }
  };

  const onDownloadExisting = async (doc) => {
    try {
      const res = await fetchDocBlob(doc);
      const blob = res.data;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc?.fileName || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || 'שגיאה בהורדת המסמך');
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewDoc(null);
    setPreviewMime(null);
  };

  const handleClientChange = (field, value) => {
    setFormData((prev) => ({ ...prev, client: { ...prev.client, [field]: value } }));
    
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
      
      case 'identificationNumber':
        const idError = validateIDNumber(value);
        if (idError) {
          newErrors.identificationNumber = idError;
        } else {
          delete newErrors.identificationNumber;
        }
        break;
      
      case 'phone':
        const phoneError = validatePhone(value);
        if (phoneError) {
          newErrors.phone = phoneError;
        } else {
          delete newErrors.phone;
        }
        break;
      
      case 'email':
        const emailError = validateEmail(value);
        if (emailError) {
          newErrors.email = emailError;
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'address':
        const addressError = validateAddress(value);
        if (addressError) {
          newErrors.address = addressError;
        } else {
          delete newErrors.address;
        }
        break;
      
      default:
        // Clear error for this field on change
        delete newErrors[field];
        break;
    }
    
    setErrors(newErrors);
  };

  const handleContactChange = (index, field, value) => {
    setFormData((prev) => {
      const contacts = [...prev.contacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...prev, contacts };
    });
    
    // Real-time validation for contacts
    const newErrors = { ...errors };
    const errorKey = `contact_${index}_${field}`;
    
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
      
      case 'phone':
        const phoneError = validatePhone(value);
        if (phoneError) {
          newErrors[errorKey] = phoneError;
        } else {
          delete newErrors[errorKey];
        }
        break;
      
      case 'email':
        const emailError = validateEmail(value);
        if (emailError) {
          newErrors[errorKey] = emailError;
        } else {
          delete newErrors[errorKey];
        }
        break;
      
      default:
        delete newErrors[errorKey];
        break;
    }
    
    setErrors(newErrors);
  };

  const handleNotificationPolicyChange = (field, value) => {
    setFormData((prev) => {
      const next = {
        ...prev.notificationPolicy,
        [field]: value,
      };

      // אם עובר מברירת מחדל למנגנון מותאם ואין עדיין שלבים – ניצור שלב ריק אחד
      if (field === 'useDefault' && value === false && (!next.steps || next.steps.length === 0)) {
        next.steps = [
          {
            delayDays: 0,
            channel: 'WHATSAPP',
            recurring: false,
            recurringIntervalDays: null,
            recurringUntilDays: null,
            messageTemplate: '',
          },
        ];
      }

      return {
        ...prev,
        notificationPolicy: next,
      };
    });
  };

  const handleNotificationStepChange = (index, field, value) => {
    setFormData((prev) => {
      const steps = [...(prev.notificationPolicy.steps || [])];
      steps[index] = { ...steps[index], [field]: value };
      return {
        ...prev,
        notificationPolicy: {
          ...prev.notificationPolicy,
          steps,
        },
      };
    });
  };

  const addNotificationStep = () => {
    setFormData((prev) => {
      const steps = [...(prev.notificationPolicy.steps || [])];
      steps.push({
        delayDays: 0,
        channel: 'WHATSAPP',
        recurring: false,
        recurringIntervalDays: null,
        recurringUntilDays: null,
        messageTemplate: '',
      });
      return {
        ...prev,
        notificationPolicy: {
          ...prev.notificationPolicy,
          steps,
        },
      };
    });
  };

  const removeNotificationStep = (index) => {
    setFormData((prev) => {
      const steps = [...(prev.notificationPolicy.steps || [])];
      steps.splice(index, 1);
      return {
        ...prev,
        notificationPolicy: {
          ...prev.notificationPolicy,
          steps,
        },
      };
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

const requiredExcelHeaders = [
  'name',
  'entityType',
  'identificationNumber',
  'phone',
  'email',
  'address',
  'vatNumber',
  'paymentModel',
  'paymentTerms'
];

const handleImportExcel = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    // Read Excel file
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (!data || data.length === 0) {
          alert('קובץ אקסל ריק');
          return;
        }

        // Validate headers
        const fileHeaders = Object.keys(data[0] || {});
        const missingHeaders = requiredExcelHeaders.filter(
          (header) => !fileHeaders.includes(header)
        );

        if (missingHeaders.length > 0) {
          alert(
            `כותרות חסרות בקובץ אקסל:\n${missingHeaders.join(', ')}\n\nכותרות דרושות:\n${requiredExcelHeaders.join(', ')}`
          );
          return;
        }

        // Send to backend
        setSubmitting(true);
        const formDataToSend = new FormData();
        formDataToSend.append('file', file);

        const response = await api.post('/clients/import', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        alert('לקוחות הועלו בהצלחה!');
        navigate('/admin-dashboard');
      } catch (error) {
        console.error('Error importing clients:', error);
        alert('שגיאה בהעלאת הקוחות: ' + (error.response?.data?.message || error.message));
      } finally {
        setSubmitting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error('Error reading file:', error);
    alert('שגיאה בקריאת הקובץ');
  }

  // Reset file input
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

  const validate = () => {
    const e = {};
    const c = formData.client;
    
    const nameError = validateName(c.name);
    if (nameError) e.name = nameError;
    
    const idError = validateIDNumber(c.identificationNumber);
    if (idError) e.identificationNumber = idError;
  
    const cfg2 = entityTypeConfig.find(e => e.value === c.entityType);
    if (cfg2?.requiresVat && (!c.vatNumber || !String(c.vatNumber).trim())) {
          e.vatNumber = 'ח.פ / ע.מ חובה עבור ישות זו';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddDocuments = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (docToReplace) {
      // Replace single document
      const file = files[0];
      (async () => {
        try {
          await replaceDocument(docToReplace.id, file);
          // Refresh list if we already have a clientId
          if (uploadedDocuments.length) {
            try {
              const clientId = uploadedDocuments[0]?.clientId;
              if (clientId) {
                const res = await listDocsByClient(clientId);
                setUploadedDocuments(res.data || []);
              }
            } catch (err) { console.error(err); }
          }
        } catch (err) {
          console.error('Failed to replace document', err);
        } finally {
          setDocToReplace(null);
        }
      })();
    } else {
      setPendingDocuments((prev) => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const removePendingDoc = (index) => {
    setPendingDocuments((prev) => prev.filter((_, i) => i !== index));
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
        const clientId = res.data?.id;
        // Save initial note to client-notes table if provided
        try {
          const note = (formData.client.notes || '').trim();
          if (clientId && note) {
            await api.post('/client-notes', { clientId, content: note });
          }
        } catch (noteErr) {
          console.warn('Failed to save client note:', noteErr);
        }

        // Save notification policy for this client (אם ה‑backend תומך בזה)
        try {
          if (clientId) {
            const np = formData.notificationPolicy;
            const policyPayload = {
              useDefault: !!np.useDefault,
              legalEscalationAfterDays: np.legalEscalationAfterDays,
              legalMinAmount: np.legalMinAmount ? Number(np.legalMinAmount) : null,
              steps: np.useDefault
                ? undefined
                : (np.steps || []).map((s, idx) => ({
                    stepOrder: idx + 1,
                    delayDays: Number(s.delayDays ?? 0),
                    channel: s.channel,
                    recurring: !!s.recurring,
                    recurringIntervalDays: s.recurring ? Number(s.recurringIntervalDays || 0) : null,
                    recurringUntilDays: s.recurring ? Number(s.recurringUntilDays || 0) : null,
                    messageTemplate: s.messageTemplate || null,
                  })),
            };

            await saveNotificationPolicy(clientId, policyPayload);
          }
        } catch (npErr) {
          console.warn('Failed to save notification policy:', npErr);
        }
        // Upload any queued documents
        if (clientId && pendingDocuments.length) {
          for (const file of pendingDocuments) {
            try {
              await uploadDocument(clientId, file);
            } catch (e) {
              console.error('Failed to upload document', file?.name, e);
              setUploadErrors((prev) => [...prev, `נכשל להעלות: ${file?.name} (${e?.response?.data?.message || e?.message || 'שגיאה'})`]);
            }
          }
        }
        // Load uploaded list
        if (clientId) {
          try {
            const docsRes = await listDocsByClient(clientId);
            setUploadedDocuments(docsRes.data || []);
          } catch (e) { console.error(e); }
        }
        alert('הלקוח נוסף בהצלחה');
        navigate(`/clients/${clientId || ''}`);
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
          label="מספר זיהוי"
          value={formData.client.identificationNumber}
          onChange={(e) =>
            handleClientChange('identificationNumber', e.target.value)
          }
          error={errors.identificationNumber}
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
          error={errors.phone}
        />
        <Input
          label="אימייל"
          placeholder="example@domain.com"
          value={formData.client.email}
          onChange={(e) => handleClientChange('email', e.target.value)}
          error={errors.email}
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
          error={errors.address}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {entityTypeConfig.find(e => e.value === formData.client.entityType)?.requiresVat && (
          <Input
            label="ח.פ / ע.מ"
            value={formData.client.vatNumber}
            onChange={(e) => handleClientChange('vatNumber', e.target.value)}
            error={errors.vatNumber}
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
              <Input 
                label="שם פרטי" 
                value={c.firstName} 
                onChange={(e) => handleContactChange(idx, 'firstName', e.target.value)}
                error={errors[`contact_${idx}_firstName`]}
              />
              <Input 
                label="שם משפחה" 
                value={c.lastName} 
                onChange={(e) => handleContactChange(idx, 'lastName', e.target.value)}
                error={errors[`contact_${idx}_lastName`]}
              />
              <Input label="תפקיד" value={c.role} onChange={(e) => handleContactChange(idx, 'role', e.target.value)} />
              <Input 
                label="טלפון" 
                value={c.phone} 
                onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                error={errors[`contact_${idx}_phone`]}
              />
              <Input 
                label="אימייל" 
                value={c.email} 
                onChange={(e) => handleContactChange(idx, 'email', e.target.value)}
                error={errors[`contact_${idx}_email`]}
              />
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

  const documentsTab = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">צרף מסמכים ללקוח (PDF, תמונות, DOCX)</p>
        </div>
        <div>
          <input ref={docsInputRef} type="file" multiple onChange={handleAddDocuments} className="hidden" />
          <Button type="button" variant="outline" onClick={() => docsInputRef.current?.click()}>
            <Upload className="w-4 h-4" />
            העלה מסמכים
          </Button>
        </div>
      </div>

      {/* Pending, to be uploaded after client creation */}
      {pendingDocuments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm">ממתין להעלאה ({pendingDocuments.length})</h4>
          <ul className="space-y-2">
            {pendingDocuments.map((f, idx) => (
              <li key={idx} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                <span className="text-sm">{f.name}</span>
                <Button variant="ghost" size="sm" onClick={() => removePendingDoc(idx)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">קבצים אלו יועלו מיד לאחר יצירת הלקוח.</p>
        </div>
      )}

      {/* Existing (after creation). For add flow we won’t have clientId yet */}
      {uploadedDocuments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm">מסמכים קיימים</h4>
          {uploadErrors.length > 0 && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {uploadErrors.map((m, i) => (<div key={i}>{m}</div>))}
            </div>
          )}
          <ul className="space-y-2">
            {uploadedDocuments.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-xl">
                <span className="text-sm">{doc.fileName}</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" title="תצוגה מקדימה" onClick={() => onPreviewExisting(doc)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="הורדה" onClick={() => onDownloadExisting(doc)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setDocToReplace(doc); docsInputRef.current?.click(); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={async () => {
                    if (!window.confirm('למחוק את המסמך? אי אפשר לשחזר.')) return;
                    try {
                      await deleteDocument(doc.id);
                      const clientId = doc.clientId;
                      if (clientId) {
                        const res = await listDocsByClient(clientId);
                        setUploadedDocuments(res.data || []);
                      }
                    } catch (e) { console.error(e); }
                  }}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {previewDoc && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closePreview}>
              <div className="bg-background rounded-xl shadow-lg w-full max-w-4xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <div className="font-medium truncate">תצוגה מקדימה • {previewDoc?.fileName}</div>
                  <Button variant="ghost" size="sm" onClick={closePreview}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-3">
                  {previewUrl && previewMime?.startsWith('image/') && (
                    <img src={previewUrl} alt="preview" className="max-h-[70vh] w-full object-contain" />
                  )}
                  {previewUrl && previewMime === 'application/pdf' && (
                    <object data={previewUrl} type="application/pdf" className="w-full h-[70vh]">
                      <iframe src={previewUrl} className="w-full h-[70vh]" title="PDF Preview" />
                    </object>
                  )}
                  {(!previewUrl || (!previewMime?.startsWith('image/') && previewMime !== 'application/pdf')) && (
                    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                      <div className="text-sm text-muted-foreground">לא ניתן להציג בתצוגה מקדימה קובץ מסוג זה. ניתן להוריד ולצפות מקומית.</div>
                      <Button variant="outline" onClick={() => onDownloadExisting(previewDoc)}>הורד קובץ</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
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

  const notificationTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="מנגנון הודעות ללקוחות קצה"
          options={[
            { value: 'DEFAULT', label: 'ברירת מחדל של המערכת' },
            { value: 'CUSTOM', label: 'מנגנון מותאם אישית' },
          ]}
          value={formData.notificationPolicy.useDefault ? 'DEFAULT' : 'CUSTOM'}
          onChange={(e) =>
            handleNotificationPolicyChange('useDefault', e.target.value === 'DEFAULT')
          }
        />

        <Input
          label="לאחר כמה ימים להעביר לגבייה משפטית"
          type="number"
          min="0"
          value={formData.notificationPolicy.legalEscalationAfterDays}
          onChange={(e) =>
            handleNotificationPolicyChange(
              'legalEscalationAfterDays',
              e.target.value === '' ? '' : Number(e.target.value)
            )
          }
        />

        <Input
          label="מינימום סכום חוב לגבייה משפטית (₪)"
          type="number"
          min="0"
          value={formData.notificationPolicy.legalMinAmount}
          onChange={(e) =>
            handleNotificationPolicyChange('legalMinAmount', e.target.value)
          }
        />
      </div>

      {!formData.notificationPolicy.useDefault && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-medium">שלבי המנגנון</h4>
              <p className="text-xs text-muted-foreground">
                הוסף הודעות לפי הצורך. לכל הודעה ניתן לבחור ערוץ, השהיה ותוכן
                מותאם. אם לא תגדיר מנגנון – תופעל ברירת המחדל של המערכת.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addNotificationStep}>
              <Plus className="w-4 h-4" />
              הוסף הודעה
            </Button>
          </div>

          <div className="space-y-2">
              {(formData.notificationPolicy.steps || []).map((step, idx) => (
              <div key={idx} className="relative">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-3 bg-muted rounded-xl items-end">
                <div className="md:col-span-1 flex flex-col gap-2">
                  <label className="block text-foreground font-medium text">
                    תוכן ההודעה
                  </label>
                  <textarea
                    rows={1}
                    className="w-full px-4 py-3 text-base bg-input-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                    value={step.messageTemplate || ''}
                    onChange={(e) =>
                      handleNotificationStepChange(idx, 'messageTemplate', e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-3 ">
                  <Select
                    label="האם שלב מחזורי"
                    options={[
                      { value: 'false', label: 'לא' },
                      { value: 'true', label: 'כן' },
                    ]}
                    value={step.recurring ? 'true' : 'false'}
                    onChange={(e) =>
                      handleNotificationStepChange(
                        idx,
                        'recurring',
                        e.target.value === 'true'
                      )
                    }
                  />

                  {step.recurring && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        label="כל כמה ימים לחזור"
                        type="number"
                        min="1"
                        value={step.recurringIntervalDays ?? ''}
                        onChange={(e) =>
                          handleNotificationStepChange(
                            idx,
                            'recurringIntervalDays',
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                      />
                      <Input
                        label="עד כמה ימים מהחוב להמשיך"
                        type="number"
                        min="1"
                        value={step.recurringUntilDays ?? ''}
                        onChange={(e) =>
                          handleNotificationStepChange(
                            idx,
                            'recurringUntilDays',
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  )}
                </div>

                <Select
                  label="ערוץ"
                  options={[
                    { value: 'WHATSAPP', label: 'וואטסאפ' },
                    { value: 'SMS', label: 'SMS' },
                    { value: 'VOICE_CALL', label: 'שיחה קולית' },
                    { value: 'EMAIL', label: 'אימייל' },
                  ]}
                  value={step.channel}
                  onChange={(e) =>
                    handleNotificationStepChange(idx, 'channel', e.target.value)
                  }
                />

                <div className="self-start">
                  <Input
                    label="השהיה (ימים מהחוב/מהשלב הקודם)"
                    type="number"
                    min="0"
                    value={step.delayDays}
                    onChange={(e) =>
                      handleNotificationStepChange(
                        idx,
                        'delayDays',
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                  />
                </div>
                </div>

                <div className="absolute left-3 top-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNotificationStep(idx)}
                    disabled={(formData.notificationPolicy.steps || []).length <= 1}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            {(formData.notificationPolicy.steps || []).length === 0 && (
              <div className="p-4 bg-muted rounded-xl text-xs text-muted-foreground text-center">
                עדיין לא הוגדרו הודעות. לחץ על "הוסף הודעה" כדי להתחיל.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'client', label: 'פרטי לקוח', content: clientDetailsTab },
    { id: 'contacts', label: 'אנשי קשר', content: contactsTab },
    { id: 'payment', label: 'תשלומים ותנאים', content: paymentTab },
     { id: 'notifications', label: 'מנגנון הודעות', content: notificationTab },
    { id: 'documents', label: 'מסמכים', content: documentsTab },
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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl mb-2">הוספת לקוח חדש</h1>
              <p className="text-muted-foreground">הזן את פרטי הלקוח בטפסים הבאים</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportExcel}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
              >
                <Upload className="w-5 h-5" />
                הוסף לקוחות מאקסל
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                שדות דרושים: name, entityType, identificationNumber, phone, email, address, vatNumber, paymentModel, paymentTerms
              </p>
            </div>
          </div>
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
