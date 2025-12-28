import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { ArrowLeft } from 'lucide-react';
import { getCompany } from '../services/companyService';

export function CompanyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getCompany(id);
        if (!mounted) return;
        setCompany(res?.data ?? null);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError(e?.message ?? String(e));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">טוען חברה...</div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-destructive mb-4">שגיאה בטעינת פרטי חברה: {String(error)}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">נסה שנית</button>
      </div>
    </div>
  );

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">לא נמצאה חברה</div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 ml-2" /> חזור
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>פרטי חברה</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-medium">{company.name}</h2>
              <p className="text-sm text-muted-foreground">מזהה: {company.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ח.פ / ע.מ: {company.taxId ?? '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
