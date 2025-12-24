import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Input } from './Input';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from './AuthContext';
import api from '../services/api';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false); // כעת נשתמש בזה
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      debugger
      const res = await api.post("/auth/login", {
        email,
        password,
        remember
      });
      console.log("LOGIN RESPONSE:", res.data);
      const { token, role, emailVerified } = res.data;
      
      
      navigate("/email-verification");
     
      login(res.data);

    } catch (err) {
      console.error(err);
      alert("התחברות נכשלה");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl mb-2">ברוכים הבאים</h1>
          <p className="text-muted-foreground">היכנסו למערכת ניהול התשלומים</p>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="כתובת אימייל"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
            />
            <Input
              type="password"
              label="סיסמה"
              placeholder="הזינו סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)} // חיבור ה-State לאלמנט
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-foreground">זכור אותי</span>
              </label>
              <button type="button" onClick={() => navigate('/forgot-password')} className="text-primary hover:underline bg-transparent border-none cursor-pointer">
                שכחתי סיסמה
              </button>
            </div>

            <Button type="submit" fullWidth size="lg">
              התחברות
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              אין לך חשבון?{' '}
              <button type="button" onClick={() => navigate('/register')} className="text-primary hover:underline bg-transparent border-none cursor-pointer">
                צור חשבון חדש
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

}
