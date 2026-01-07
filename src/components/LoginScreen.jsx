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
      const res = await api.post("/auth/login", {
        email,
        password,
        remember
      });
      console.log("=== LOGIN RESPONSE ===");
      console.log("Full response:", res);
      console.log("Response data:", res.data);
      
      if (!res.data) {
        console.error("No data in response");
        alert("תגובה ריקה מהשרת");
        return;
      }
      
      // חלץ נתונים - role ו emailVerified נמצאים בתוך user
      const userData = res.data.user || res.data;
      const emailVerified = userData.emailVerified;
      const token = res.data.token;
      const role = userData.role;
      
      // clientId יכול להיות מ-userData.clientId או מ-userData.client.id
      const clientId = userData.clientId || userData.client?.id;
      
      console.log("emailVerified value:", emailVerified, "type:", typeof emailVerified);
      console.log("token:", token);
      console.log("role:", role);
      console.log("clientId:", clientId);
      console.log("Full userData:", userData);
      
      // אם המייל לא מאומת (emailVerified = false) → עבור לאימות מייל
      // JWT יחזור רק אחרי אימות המייל
      if (emailVerified !== true) {
        console.log("Email NOT verified, navigating to email-verification");
        // שמור את email זמנית כדי שדף אימות יוכל להשתמש בו
        sessionStorage.setItem('pendingEmail', userData.email || email);
        navigate("/email-verification");
        return;
      }
      
      // רק אם המייל מאומת ויש token, שמור את המשתמש
      const dataToSave = { ...res.data };
      login(dataToSave);
      console.log("Login saved, user stored");
      
      // ניווט לפי role
      if (role === "ADMIN") {
        console.log("Navigating to admin-dashboard");
        navigate("/admin-dashboard");
      } else if (role === "CLIENT") {
        console.log("Navigating to client-dashboard");
        navigate("/client-dashboard");
      } else if (role === "END_CLIENT") {
        console.log("Navigating to end-customer view");
        const endClientId = userData.endClientId || userData.endClient?.id;
        if (endClientId) {
          navigate(`/end-customer/${endClientId}`);
        } else {
          console.error("No endClientId found for END_CLIENT user");
          navigate("/");
        }
      } else {
        console.log("Unknown role:", role);
        navigate("/");
      }

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
        </div>
      </div>
    </div>
  );

}
