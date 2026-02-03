import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './Input';
import { Button } from './Button';
import api from '../services/api';

export function EndClientLogin() {
  const navigate = useNavigate();
  const [idNumber, setIdNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendPassword = async (e) => {
    e.preventDefault();
    if (!idNumber.trim()) {
      setError('יש להזין תעודת זהות');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Backend will send verification code to the email of the end client
      const res = await api.post('/auth/login', {
        nationalId: idNumber.trim(),
      });

      const { userId } = res.data || {};
      if (!userId) {
        console.error('No userId in end-client login response');
        setError('שגיאה: לא הוחזר מזהה משתמש מהשרת');
        return;
      }

      sessionStorage.setItem('pendingUserId', String(userId));
      console.log('End-client login successful, navigating to email verification');
      navigate('/email-verification');
    } catch (err) {
      console.error('Error sending password to end client:', err);
      setError(err.response?.data?.message || err.message || 'שליחת הסיסמה נכשלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md relative">
        {/* <div className="text-center mb-8">
          <h1 className="text-3xl mb-2">כניסת לקוח קצה</h1>
          <p className="text-muted-foreground text-sm">
            הזדהות באמצעות תעודת זהות וקבלת סיסמה חד-פעמית לסלולרי או למייל המוגדרים אצל הלקוח.
          </p>
        </div> */}

        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <form onSubmit={handleSendPassword} className="space-y-6">
            <Input
              type="text"
              label="תעודת זהות"
              placeholder="הזינו מספר תעודת זהות"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'שולח סיסמה...' : 'שלח סיסמה'}
            </Button>
          </form>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-primary bg-transparent border-none cursor-pointer"
          >
            לכניסת לקוח עיסקי
          </button>
        </div>
      </div>
    </div>
  );
}
