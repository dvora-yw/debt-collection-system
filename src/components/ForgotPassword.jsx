import React, { useState } from 'react';
import { Button } from './Button';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      // Placeholder: backend endpoint may differ
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      console.error(err);
      alert('שגיאה בשליחת האימייל');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <h2 className="text-xl mb-4">איפוס סיסמה</h2>
          {!sent ? (
            <form onSubmit={handleSend} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
                className="w-full p-3 border border-border rounded"
                required
              />
              <Button type="submit" fullWidth>שלח קוד איפוס</Button>
              <button type="button" onClick={() => navigate('/')} className="text-sm text-muted-foreground">חזור להתחברות</button>
            </form>
          ) : (
            <div className="text-center">
              <p className="mb-4">נשלח אימייל עם הוראות לשחזור הסיסמה.</p>
              <Button onClick={() => navigate('/')} fullWidth>חזור להתחברות</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
