import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Input } from './Input';
import { Lock, Mail, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import { validateEmail } from '../utils/validation';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('CLIENT'); // 'ADMIN' | 'CLIENT'
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleEmailChange = (value) => {
    setEmail(value);
    // Real-time email validation
    const emailError = validateEmail(value);
    const newErrors = { ...errors };
    if (emailError) {
      newErrors.email = emailError;
    } else {
      delete newErrors.email;
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let payload = {};

    if (loginType === 'ADMIN') {
      if (!username.trim()) {
        setErrors({ username: 'יש להזין שם משתמש' });
        return;
      }
      if (!password) {
        setErrors({ password: 'יש להזין סיסמה' });
        return;
      }
      payload = {
        username: username.trim(),
        password,
      };
    } else {
      const emailError = validateEmail(email);
      if (emailError) {
        setErrors({ email: emailError });
        return;
      }
      payload = {
        email: email.trim(),
      };
    }

    try {
      const res = await api.post("/auth/login", payload);
      console.log("=== LOGIN RESPONSE ===");
      console.log("Full response:", res);
      console.log("Response data:", res.data);
      
      if (!res.data) {
        console.error("No data in response");
        alert("תגובה ריקה מהשרת");
        return;
      }
      
      const { userId } = res.data;
      if (!userId) {
        console.error('No userId in login response');
        alert('שגיאה: לא הוחזר מזהה משתמש מהשרת');
        return;
      }

      sessionStorage.setItem('pendingUserId', String(userId));
      if (loginType === 'CLIENT') {
        sessionStorage.setItem('pendingEmail', email.trim());
      }

      console.log('Navigating to email verification after login');
      navigate('/email-verification');

    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      alert("התחברות נכשלה: " + (err.response?.data?.message || err.message));
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
          {/* בחירת סוג כניסה */}
          <div className="flex mb-6 rounded-full bg-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setLoginType('CLIENT')}
              className={`flex-1 py-2 rounded-full transition-colors ${
                loginType === 'CLIENT'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              לקוח עיסקי
            </button>
            <button
              type="button"
              onClick={() => setLoginType('ADMIN')}
              className={`flex-1 py-2 rounded-full transition-colors ${
                loginType === 'ADMIN'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              מנהל מערכת
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {loginType === 'ADMIN' ? (
              <>
                <Input
                  type="text"
                  label="שם משתמש"
                  placeholder="הזינו שם משתמש"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  error={errors.username}
                  icon={<UserIcon className="w-5 h-5" />}
                  required
                />
                <Input
                  type="password"
                  label="סיסמה"
                  placeholder="הזינו סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  icon={<Lock className="w-5 h-5" />}
                  required
                />
              </>
            ) : (
              <Input
                type="email"
                label="כתובת אימייל"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                error={errors.email}
                icon={<Mail className="w-5 h-5" />}
                required
              />
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
               {/*  <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)} // חיבור ה-State לאלמנט
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-foreground">זכור אותי</span>*/}
              </label> 
              <button type="button" onClick={() => navigate('/forgot-password')} className="text-primary hover:underline bg-transparent border-none cursor-pointer">
                שכחתי סיסמה
              </button>
            </div>

            <Button type="submit" fullWidth size="lg">
              התחברות
            </Button>
          </form>

          {/* <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              אין לך חשבון?{' '}
              <button type="button" onClick={() => navigate('/register')} className="text-primary hover:underline bg-transparent border-none cursor-pointer">
                צור חשבון חדש
              </button>
            </p>
          </div> */}

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">
              לקוחות קצה
            </p>
            <button
              type="button"
              onClick={() => navigate('/end-client-login')}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary border border-primary/40 rounded-lg hover:bg-primary/5 bg-transparent cursor-pointer"
            >
              כניסת לקוח קצה
            </button>
          </div>
        </div>
      </div>
    </div>
  );

}
