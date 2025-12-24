import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import {
  CreditCard,
  Lock,
  CheckCircle,
  ArrowRight,
  Shield,
  User,
} from 'lucide-react';

export function PaymentScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Payment Details
    selectedInvoices: ['INV-001', 'INV-002'],
    paymentAmount: 8500,
    
    // Card Details
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    
    // Billing
    idNumber: '',
    city: '',
    address: '',
    zipCode: '',
  });

  const steps = [
    { number: 1, label: 'פרטי תשלום', icon: CreditCard },
    { number: 2, label: 'פרטי כרטיס', icon: Lock },
    { number: 3, label: 'אישור', icon: CheckCircle },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Payment submitted:', formData);
      alert('התשלום בוצע בהצלחה!');
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1).padStart(2, '0'),
  }));

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: String(year), label: String(year) };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background" dir="rtl">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowRight className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">תשלום מאובטח</h1>
              <p className="text-sm text-muted-foreground">סביבה מוצפנת ומאובטחת</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <p
                    className={`text-sm ${
                      currentStep >= step.number
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all ${
                      currentStep > step.number ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <Card padding="lg" className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Payment Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <CardTitle className="mb-4">פרטי התשלום</CardTitle>
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 border-r-4 border-primary rounded-xl">
                        <p className="text-sm text-muted-foreground mb-2">
                          חשבוניות שנבחרו לתשלום
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.selectedInvoices.map((inv) => (
                            <Badge key={inv} variant="primary">
                              {inv}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-2">סכום לתשלום</p>
                        <p className="text-4xl">
                          ₪{formData.paymentAmount.toLocaleString()}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-xl">
                        <div>
                          <p className="text-sm text-muted-foreground">חיוב</p>
                          <p>₪{formData.paymentAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">עמלה</p>
                          <p>₪0</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Card Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <CardTitle className="mb-4">פרטי כרטיס אשראי</CardTitle>

                  <div className="p-6 bg-gradient-to-br from-primary via-secondary to-primary rounded-2xl text-white mb-6 shadow-xl">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-8 bg-white/20 backdrop-blur-sm rounded"></div>
                      <Shield className="w-8 h-8" />
                    </div>
                    <p className="text-2xl tracking-wider mb-6">
                      {formData.cardNumber
                        ? formatCardNumber(formData.cardNumber)
                        : '•••• •••• •••• ••••'}
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs opacity-70 mb-1">שם בעל הכרטיס</p>
                        <p>{formData.cardHolder || 'שם מלא'}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-70 mb-1">תוקף</p>
                        <p>
                          {formData.expiryMonth && formData.expiryYear
                            ? `${formData.expiryMonth}/${formData.expiryYear.slice(-2)}`
                            : 'MM/YY'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Input
                    label="מספר כרטיס אשראי"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').slice(0, 16);
                      handleInputChange('cardNumber', value);
                    }}
                    maxLength={19}
                    required
                    icon={<CreditCard className="w-5 h-5" />}
                  />

                  <Input
                    label="שם בעל הכרטיס"
                    placeholder="כפי שמופיע על הכרטיס"
                    value={formData.cardHolder}
                    onChange={(e) => handleInputChange('cardHolder', e.target.value)}
                    required
                    icon={<User className="w-5 h-5" />}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <Select
                      label="חודש"
                      options={monthOptions}
                      value={formData.expiryMonth}
                      onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                      required
                    />
                    <Select
                      label="שנה"
                      options={yearOptions}
                      value={formData.expiryYear}
                      onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                      required
                    />
                    <Input
                      label="CVV"
                      placeholder="123"
                      type="password"
                      maxLength={3}
                      value={formData.cvv}
                      onChange={(e) =>
                        handleInputChange('cvv', e.target.value.slice(0, 3))
                      }
                      required
                      icon={<Lock className="w-5 h-5" />}
                    />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl">
                    <h4 className="mb-4">פרטי חיוב</h4>
                    <div className="space-y-4">
                      <Input
                        label="תעודת זהות"
                        placeholder="123456789"
                        value={formData.idNumber}
                        onChange={(e) => handleInputChange('idNumber', e.target.value)}
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="עיר"
                          placeholder="תל אביב"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                        <Input
                          label="מיקוד"
                          placeholder="1234567"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <CardTitle className="mb-4">אישור תשלום</CardTitle>

                  <div className="p-6 bg-gradient-to-br from-[#10b981]/10 to-secondary/10 border-2 border-[#10b981]/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-8 h-8 text-[#10b981]" />
                      <div>
                        <h3>הכל מוכן!</h3>
                        <p className="text-sm text-muted-foreground">
                          נא לוודא את הפרטים לפני האישור
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-background rounded-xl">
                      <p className="text-sm text-muted-foreground mb-2">סכום לתשלום</p>
                      <p className="text-3xl">₪{formData.paymentAmount.toLocaleString()}</p>
                    </div>

                    <div className="p-4 bg-background rounded-xl">
                      <p className="text-sm text-muted-foreground mb-2">כרטיס אשראי</p>
                      <p>•••• •••• •••• {formData.cardNumber.slice(-4)}</p>
                    </div>

                    <div className="p-4 bg-background rounded-xl">
                      <p className="text-sm text-muted-foreground mb-2">בעל הכרטיס</p>
                      <p>{formData.cardHolder}</p>
                    </div>

                    <div className="p-4 bg-background rounded-xl">
                      <p className="text-sm text-muted-foreground mb-2">חשבוניות</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedInvoices.map((inv) => (
                          <Badge key={inv} variant="primary">
                            {inv}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-primary/5 border-r-4 border-primary rounded-xl">
                    <input
                      type="checkbox"
                      id="terms"
                      className="w-5 h-5 mt-0.5 rounded border-border text-primary focus:ring-primary"
                      required
                    />
                    <label htmlFor="terms" className="text-sm">
                      אני מאשר/ת את תנאי השימוש ומסכים/ה לחיוב הכרטיס בסכום המוצג
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-border">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1"
                  >
                    חזור
                  </Button>
                )}
                <Button type="submit" size="lg" className="flex-1">
                  {currentStep === 3 ? (
                    <>
                      <Lock className="w-5 h-5" />
                      אשר ושלם
                    </>
                  ) : (
                    'המשך'
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card padding="md">
              <CardHeader>
                <CardTitle>סיכום הזמנה</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">סכום חיוב</span>
                    <span>₪{formData.paymentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">עמלת עיבוד</span>
                    <span className="text-[#10b981]">₪0</span>
                  </div>
                  <div className="h-px bg-border my-3" />
                  <div className="flex justify-between">
                    <span>סה״כ לתשלום</span>
                    <span className="text-xl">
                      ₪{formData.paymentAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card padding="md" className="bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="mb-2">תשלום מאובטח</p>
                  <p className="text-muted-foreground">
                    הפרטים שלך מוצפנים ומוגנים בתקן PCI-DSS
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
