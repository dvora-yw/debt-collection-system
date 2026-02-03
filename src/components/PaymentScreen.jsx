import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import api from '../services/api';
import {
  validateCardNumber,
  validateCVV,
  validateName,
  validateIDNumber,
  validateAddress,
  validateCity,
  validateZipCode,
} from '../utils/validation';
import {
  CreditCard,
  Lock,
  CheckCircle,
  ArrowRight,
  Shield,
  User,
  AlertCircle,
} from 'lucide-react';

export function PaymentScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [invalidInput, setInvalidInput] = useState({});
  const [formData, setFormData] = useState({
    // Payment Details
    selectedInvoices: [],
    paymentAmount: 0,
    
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

  // Load end-customer and payment data
  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        if (id) {
          const response = await api.get(`/end-clients/${id}`);
          const data = response.data;
          
          // Fetch invoices/payments for this end-customer
          const paymentsResponse = await api.get(`/payments?endCustomerId=${id}`);
          const payments = paymentsResponse.data || [];
          
          // Set form data with end-customer info and invoices
          const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
          setFormData((prev) => ({
            ...prev,
            selectedInvoices: payments.map(p => p.id || `INV-${p.invoiceNumber || ''}`),
            paymentAmount: totalAmount,
            idNumber: data?.idNumber || data?.registrationNumber || '',
            city: data?.city || '',
            address: data?.address || '',
          }));
        }
      } catch (error) {
        console.error('Failed to load payment data:', error);
      }
    };
    
    loadPaymentData();
  }, [id]);

  const steps = [
    { number: 1, label: 'פרטי תשלום', icon: CreditCard },
    { number: 2, label: 'פרטי כרטיס', icon: Lock },
    { number: 3, label: 'אישור', icon: CheckCircle },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Real-time validation for specific fields
    const newErrors = { ...errors };
    
    switch (field) {
      case 'cardNumber':
        const cardError = validateCardNumber(value);
        if (cardError) {
          newErrors.cardNumber = cardError;
        } else {
          delete newErrors.cardNumber;
        }
        break;
      
      case 'cardHolder':
        const holderError = validateName(value);
        if (holderError) {
          newErrors.cardHolder = holderError;
        } else {
          delete newErrors.cardHolder;
        }
        break;
      
      case 'cvv':
        const cvvError = validateCVV(value);
        if (cvvError) {
          newErrors.cvv = cvvError;
        } else {
          delete newErrors.cvv;
        }
        break;
      
      case 'idNumber':
        const idError = validateIDNumber(value);
        if (idError) {
          newErrors.idNumber = idError;
        } else {
          delete newErrors.idNumber;
        }
        break;
      
      case 'city':
        const cityError = validateCity(value);
        if (cityError) {
          newErrors.city = cityError;
        } else {
          delete newErrors.city;
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
      
      case 'zipCode':
        const zipError = validateZipCode(value);
        if (zipError) {
          newErrors.zipCode = zipError;
        } else {
          delete newErrors.zipCode;
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 2) {
      // Validate card details
      const cardError = validateCardNumber(formData.cardNumber);
      if (cardError) newErrors.cardNumber = cardError;

      const holderError = validateName(formData.cardHolder);
      if (holderError) newErrors.cardHolder = holderError;

      if (!formData.expiryMonth) {
        newErrors.expiryMonth = 'בחר חודש';
      }

      if (!formData.expiryYear) {
        newErrors.expiryYear = 'בחר שנה';
      }

      const cvvError = validateCVV(formData.cvv);
      if (cvvError) newErrors.cvv = cvvError;

      const idError = validateIDNumber(formData.idNumber);
      if (idError) newErrors.idNumber = idError;

      const cityError = validateCity(formData.city);
      if (cityError) newErrors.city = cityError;

      const addressError = validateAddress(formData.address);
      if (addressError) newErrors.address = addressError;

      const zipError = validateZipCode(formData.zipCode);
      if (zipError) newErrors.zipCode = zipError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentStep === 2) {
      if (!validateStep(2)) {
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Payment submitted:', formData);
      alert('התשלום בוצע בהצלחה!');
      navigate('/client-dashboard');
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
            <button 
              onClick={() => navigate('/end-customer/' + id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
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
                      const inputValue = e.target.value;
                      // Check if user tried to type letters
                      if (/[^\d\s]/.test(inputValue)) {
                        setInvalidInput((prev) => ({ ...prev, cardNumber: true }));
                        setTimeout(() => {
                          setInvalidInput((prev) => ({ ...prev, cardNumber: false }));
                        }, 1500);
                      }
                      // Allow only digits
                      const value = inputValue.replace(/[^\d]/g, '').slice(0, 16);
                      handleInputChange('cardNumber', value);
                    }}
                    maxLength={19}
                    required
                    icon={<CreditCard className="w-5 h-5" />}
                    error={invalidInput.cardNumber ? 'מספרים בלבד' : errors.cardNumber}
                  />

                  <Input
                    label="שם בעל הכרטיס"
                    placeholder="כפי שמופיע על הכרטיס"
                    value={formData.cardHolder}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Check if user tried to type numbers
                      if (/\d/.test(inputValue)) {
                        setInvalidInput((prev) => ({ ...prev, cardHolder: true }));
                        setTimeout(() => {
                          setInvalidInput((prev) => ({ ...prev, cardHolder: false }));
                        }, 1500);
                      }
                      handleInputChange('cardHolder', inputValue);
                    }}
                    required
                    icon={<User className="w-5 h-5" />}
                    error={invalidInput.cardHolder ? 'אותיות בלבד' : errors.cardHolder}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Select
                        label="חודש"
                        options={monthOptions}
                        value={formData.expiryMonth}
                        onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                        required
                      />
                      {errors.expiryMonth && (
                        <p className="mt-1 text-sm text-destructive">{errors.expiryMonth}</p>
                      )}
                    </div>
                    <div>
                      <Select
                        label="שנה"
                        options={yearOptions}
                        value={formData.expiryYear}
                        onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                        required
                      />
                      {errors.expiryYear && (
                        <p className="mt-1 text-sm text-destructive">{errors.expiryYear}</p>
                      )}
                    </div>
                    <Input
                      label="CVV"
                      placeholder="123"
                      type="password"
                      maxLength={3}
                      value={formData.cvv}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Check if user tried to type letters
                        if (/[^\d]/.test(inputValue)) {
                          setInvalidInput((prev) => ({ ...prev, cvv: true }));
                          setTimeout(() => {
                            setInvalidInput((prev) => ({ ...prev, cvv: false }));
                          }, 1500);
                        }
                        // Allow only digits
                        const value = inputValue.replace(/[^\d]/g, '').slice(0, 3);
                        handleInputChange('cvv', value);
                      }}
                      required
                      icon={<Lock className="w-5 h-5" />}
                      error={invalidInput.cvv ? 'מספרים בלבד' : errors.cvv}
                    />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl">
                    <h4 className="mb-4">פרטי חיוב</h4>
                    <div className="space-y-4">
                      <Input
                        label="תעודת זהות"
                        placeholder="123456789"
                        value={formData.idNumber}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Check if user tried to type letters
                          if (/[^\d]/.test(inputValue)) {
                            setInvalidInput((prev) => ({ ...prev, idNumber: true }));
                            setTimeout(() => {
                              setInvalidInput((prev) => ({ ...prev, idNumber: false }));
                            }, 1500);
                          }
                          // Allow only digits
                          const value = inputValue.replace(/[^\d]/g, '');
                          handleInputChange('idNumber', value);
                        }}
                        required
                        error={invalidInput.idNumber ? 'מספרים בלבד' : errors.idNumber}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="עיר"
                          placeholder="תל אביב"
                          value={formData.city}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            // Check if user tried to type numbers
                            if (/\d/.test(inputValue)) {
                              setInvalidInput((prev) => ({ ...prev, city: true }));
                              setTimeout(() => {
                                setInvalidInput((prev) => ({ ...prev, city: false }));
                              }, 1500);
                            }
                            handleInputChange('city', inputValue);
                          }}
                          required
                          error={invalidInput.city ? 'אותיות בלבד' : errors.city}
                        />
                        <Input
                          label="מיקוד"
                          placeholder="1234567"
                          value={formData.zipCode}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            // Check if user tried to type letters
                            if (/[^\d]/.test(inputValue)) {
                              setInvalidInput((prev) => ({ ...prev, zipCode: true }));
                              setTimeout(() => {
                                setInvalidInput((prev) => ({ ...prev, zipCode: false }));
                              }, 1500);
                            }
                            // Allow only digits
                            const value = inputValue.replace(/[^\d]/g, '');
                            handleInputChange('zipCode', value);
                          }}
                          required
                          error={invalidInput.zipCode ? 'מספרים בלבד' : errors.zipCode}
                        />
                      </div>
                      <Input
                        label="כתובת"
                        placeholder="רחוב ומספר בית"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                        error={errors.address}
                      />
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

              {/* Error Alert */}
              {Object.keys(errors).length > 0 && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-destructive mb-2">בדוק את השדות הבאים:</p>
                    <ul className="text-sm text-destructive/80 space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        error && <li key={field}>• {error}</li>
                      ))}
                    </ul>
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
