import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Mail, ArrowRight, RotateCcw } from 'lucide-react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { useNavigate } from "react-router-dom";


export function EmailVerification({
    onVerified,
    onBack
}) {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);
    const { user, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const digits = pastedData.replace(/\D/g, '').split('');

        const newCode = [...code];
        digits.forEach((digit, index) => {
            if (index < 6) {
                newCode[index] = digit;
            }
        });
        setCode(newCode);

        // Focus last filled input or next empty
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) return;
        
        try {
            console.log("=== VERIFY EMAIL ===");
            console.log("Sending code:", fullCode);
            
            const pendingUserId = sessionStorage.getItem('pendingUserId');
            const userId = pendingUserId ? Number(pendingUserId) : null;

            if (!userId) {
                alert('שגיאה: לא נמצא משתמש לאימות. נסה להתחבר מחדש.');
                navigate('/');
                return;
            }

            const res = await api.post('/auth/verify-email', {
                userId,
                code: fullCode
            });
            
            console.log("Verify response:", res.data);
            
            const data = res.data;
            const role = data.endClientId
                ? 'END_CLIENT'
                : data.clientId
                ? 'CLIENT'
                : 'ADMIN';

            const userForContext = {
                user: {
                    id: data.userId,
                    clientId: data.clientId,
                    endClientId: data.endClientId,
                    role,
                    emailVerified: data.emailVerified,
                },
                token: data.token,
            };

            // שמור את התשובה (שמכילה token JWT)
            login(userForContext);
            console.log("User saved after email verification");

            // נקה את ה-pending user לאחר הצלחה
            sessionStorage.removeItem('pendingUserId');
            
            console.log("Role:", role);
            
            switch (role) {
                case "ADMIN":
                    console.log("Navigating to admin-dashboard");
                    navigate("/admin-dashboard");
                    break;
                case "CLIENT":
                    console.log("Navigating to client-dashboard");
                    navigate("/client-dashboard");
                    break;
                case "END_CLIENT":
                    console.log("Navigating to end-customer view");
                    const endClientId = data.endClientId;
                    if (endClientId) {
                        navigate(`/end-customer/${endClientId}`);
                    } else {
                        console.error("No endClientId found for END_CLIENT");
                        navigate("/");
                    }
                    break;
                default:
                    console.log("Unknown role, navigating to home");
                    navigate("/");
            }
        } catch (err) {
            console.error("Verification error:", err);
            alert("אימות נכשל: " + (err.response?.data?.message || err.message));
        }
    };

    const handleResend = async () => {
        try {
            const pendingUserId = sessionStorage.getItem('pendingUserId');
            const userId = pendingUserId ? Number(pendingUserId) : user?.user?.id;

            if (!userId) {
                alert('שגיאה: לא נמצא משתמש לשליחת קוד. נסה להתחבר מחדש.');
                navigate('/');
                return;
            }
            
            console.log("Resending code for user:", userId);
            await api.post('/auth/resend-code', { userId });
            
            console.log("Code resent successfully");
            setTimer(60);
            setCanResend(false);
        } catch (err) {
            console.error("Resend error:", err);
            alert("שליחת קוד נכשלה: " + (err.response?.data?.message || err.message));
        }
    };

    const isComplete = code.every((digit) => digit !== '');

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex items-center justify-center p-4" dir="rtl">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl mb-4 shadow-lg">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl mb-2">אימות אימייל</h1>
                    <p className="text-muted-foreground">
                        שלחנו קוד אימות בן 6 ספרות לכתובת
                    </p>
                    <p className="text-foreground mt-1 font-medium">
                        {user?.email || sessionStorage.getItem('pendingEmail') || 'האימייל שלך'}
                    </p>
                </div>

                {/* Verification Card */}
                <div className="bg-card rounded-xl shadow-lg border border-border p-8">
                    {/* OTP Input */}
                    <div className="mb-6">
                        <label className="block text-sm mb-4 text-center">
                            הזינו את הקוד שקיבלתם באימייל
                        </label>
                        <div className="flex gap-2 justify-center" dir="ltr">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-14 text-center text-2xl font-semibold border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-input-background"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Timer / Resend */}
                    <div className="text-center mb-6">
                        {!canResend ? (
                            <p className="text-sm text-muted-foreground">
                                ניתן לשלוח קוד חדש בעוד{' '}
                                <span className="text-primary font-medium">{timer}</span> שניות
                            </p>
                        ) : (
                            <button
                                onClick={handleResend}
                                className="text-sm text-primary hover:underline inline-flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                שלח קוד חדש
                            </button>
                        )}
                    </div>

                    {/* Verify Button */}
                    <Button
                        onClick={handleVerify}
                        fullWidth
                        size="lg"
                        disabled={!isComplete}
                    >
                        אמת ועבור הלאה
                    </Button>

                    {/* Back Button */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-2 transition-colors"
                        >
                            <ArrowRight className="w-4 h-4" />
                            חזור להתחברות
                        </button>
                    )}
                </div>

                {/* Help Text */}
                <div className="text-center mt-6 text-sm text-muted-foreground">
                    <p>לא קיבלת את הקוד? בדוק את תיבת הספאם או נסה לשלוח שוב</p>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-muted-foreground">
                    <p>מערכת ניהול גביית תשלומים © 2025</p>
                </div>
            </div>
        </div>
    );
}
