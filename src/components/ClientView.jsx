import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import DocumentView from './DocumentView';
import api from '../services/api';
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



export function ClientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await api.get(`/clients/${id}`);
        setClientData(res.data);
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('שגיאה בטעינת נתוני הלקוח');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClient();
    }
  }, [id]);

  if (loading) return <div className="p-8">טוען נתונים...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!clientData) return <div className="p-8">לא נמצאו נתונים</div>;

  const getEntityTypeLabel = (entityType) => {
    const labels = {
      COMPANY: 'חברה',
      PRIVATE_PERSON: 'אדם פרטי',
      BUSINESS: 'עוסק',
      NONPROFIT: 'עמותה',
      OTHER: 'אחר'
    };
    return labels[entityType] || entityType;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('he-IL');
    } catch {
      return dateStr;
    }
  };

  const contacts = clientData.contacts || [];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Building className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl">{clientData.name}</h1>
                  <Badge variant="default">{getEntityTypeLabel(clientData.entityType)}</Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>#{clientData.id}</span>
                  <span>•</span>
                  <span>{clientData.identificationNumber}</span>
                </div>
              </div>
            </div>
            <Button variant="primary" size="md">
              <Edit className="w-5 h-5" />
              ערוך פרטים
            </Button>
          </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Details */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>פרטי לקוח</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-3">מידע כללי</h4>
                    <div className="space-y-3">
                      <InfoRow icon={Building} label="שם" value={clientData.name} />
                      <InfoRow icon={Mail} label="אימייל" value={clientData.email || '-'} />
                      <InfoRow icon={Phone} label="טלפון" value={clientData.phone || '-'} />
                      <InfoRow icon={Phone} label="פקס" value={clientData.fax || '-'} />
                      <InfoRow icon={MapPin} label="כתובת" value={clientData.address || '-'} />
                      <InfoRow label="ת.ז / ח.פ" value={clientData.identificationNumber} />
                      <InfoRow label="מס׳ עוסק" value={clientData.vatNumber || '-'} />
                      <InfoRow label="סוג ישות" value={getEntityTypeLabel(clientData.entityType)} />
                      <InfoRow icon={Calendar} label="תאריך הקמה" value={formatDate(clientData.establishedDate)} />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm text-muted-foreground mb-3">פרטי תשלום</h4>
                    <div className="space-y-3">
                      <InfoRow icon={Clock} label="תנאי תשלום" value={clientData.paymentTerms || '-'} />
                      <InfoRow label="מודל תשלום" value={clientData.paymentModel || '-'} />
                    </div>
                  </div>
                  {clientData.notes && (
                    <div className="pt-4 border-t border-border">
                      <h4 className="text-sm text-muted-foreground mb-2">הערות</h4>
                      <p className="text-sm">{clientData.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contacts */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>אנשי קשר</CardTitle>
              </CardHeader>
              <CardContent>
                {contacts.length > 0 ? (
                  <div className="space-y-3">
                    {contacts.map((contact, index) => (
                      <div
                        key={index}
                        className="p-4 bg-muted/30 rounded-xl"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm">
                            {contact.firstName?.charAt(0)}{contact.lastName?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                            <p className="text-xs text-muted-foreground">{contact.role || 'לא צוין תפקיד'}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mt-3">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              {contact.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">אין אנשי קשר</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'documents' && (
          <DocumentView clientName={clientData.name} />
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
