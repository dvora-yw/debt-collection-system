/**
 * Validation utilities for form inputs
 */

// Validate Israeli ID number (9 digits with proper checksum validation)
// Uses the official Israeli ID Luhn-variant algorithm
const validateIsraeliID = (id) => {
  const cleaned = id.replace(/[\s\-]/g, '');
  
  if (cleaned.length !== 9) {
    return false;
  }
  
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }
  
  // Israeli ID validation using Luhn-variant algorithm with modulo 10
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(cleaned.charAt(i));
    const multiplier = (i % 2) + 1; // alternates 1, 2, 1, 2, ...
    let product = digit * multiplier;
    
    // Adjust if product > 9
    if (product > 9) {
      product = product - 9;
    }
    
    sum += product;
  }
  
  return (sum % 10) === 0;
};

// Check if string contains Hebrew characters
export const containsHebrew = (text) => {
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
};

// Validate email format
export const validateEmail = (email) => {
  if (!email) {
    return 'שדה מייל חובה';
  }
  
  if (containsHebrew(email)) {
    return 'לא ניתן להשתמש בתווים בעברית בשדה מייל';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'פורמט מייל לא תקין - חייב להיות כמו: example@domain.com';
  }
  
  return null;
};

// Validate phone number (Israeli format or general digits)
export const validatePhone = (phone) => {
  if (!phone) {
    return 'שדה טלפון חובה';
  }
  
  if (containsHebrew(phone)) {
    return 'לא ניתן להשתמש בתווים בעברית בשדה טלפון';
  }
  
  // Remove common formatting characters
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Check if contains only digits
  if (!/^\d+$/.test(cleanPhone)) {
    return 'שדה טלפון חייב להכיל רק מספרים';
  }
  
  // Check length (Israeli phone is 10 digits, international can vary)
  if (cleanPhone.length < 9 || cleanPhone.length > 15) {
    return 'מספר טלפון לא תקין - חייב להיות בין 9-15 ספרות';
  }
  
  return null;
};

// Validate credit card number (basic Luhn check)
export const validateCardNumber = (cardNumber) => {
  if (!cardNumber) {
    return null;
  }
  
  const cleanCard = cardNumber.replace(/\s/g, '');
  
  // Don't show error while user is still typing (less than 16 digits)
  if (cleanCard.length < 16) {
    return null;
  }
  
  if (cleanCard.length !== 16) {
    return 'מספר כרטיס חייב להיות בדיוק 16 ספרות';
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanCard.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanCard[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    return 'מספר כרטיס לא תקין';
  }
  
  return null;
};

// Validate CVV (3-4 digits)
export const validateCVV = (cvv) => {
  if (!cvv) {
    return null;
  }
  
  if (!/^\d{3,4}$/.test(cvv)) {
    return 'CVV חייב להיות 3-4 ספרות בלבד';
  }
  
  return null;
};

// Validate name (no numbers)
export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return null;
  }
  
  if (/\d/.test(name)) {
    return 'אותיות בלבד, לא מספרים';
  }
  
  if (name.trim().length < 2) {
    return 'שם חייב להכיל לפחות 2 תווים';
  }
  
  return null;
};

// Validate ID number (Israeli ID - 9 digits with checksum)
export const validateIDNumber = (id) => {
  if (!id) {
    return null;
  }
  
  const cleanID = id.replace(/[\s\-]/g, '');
  
  // Don't show error while user is still typing (less than 9 digits)
  if (cleanID.length < 9) {
    return null;
  }
  
  if (cleanID.length !== 9) {
    return 'תעודת זהות חייבת להיות בדיוק 9 ספרות';
  }
  
  if (!validateIsraeliID(id)) {
    return 'תעודת זהות לא תקינה';
  }
  
  return null;
};

// Validate amount (positive number)
export const validateAmount = (amount) => {
  if (!amount) {
    return 'שדה סכום חובה';
  }
  
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return 'סכום חייב להיות מספר';
  }
  
  if (numAmount <= 0) {
    return 'סכום חייב להיות גדול מ-0';
  }
  
  return null;
};

// Validate address
export const validateAddress = (address) => {
  if (!address || address.trim().length === 0) {
    return null;
  }
  
  if (address.trim().length < 5) {
    return 'כתובת חייבת להכיל לפחות 5 תווים';
  }
  
  return null;
};

// Validate city
export const validateCity = (city) => {
  if (!city || city.trim().length === 0) {
    return null;
  }
  
  if (city.trim().length < 2) {
    return 'שם העיר חייב להכיל לפחות 2 תווים';
  }
  
  if (/\d/.test(city)) {
    return 'אותיות בלבד, לא מספרים';
  }
  
  return null;
};

// Validate zip code
export const validateZipCode = (zipCode) => {
  if (!zipCode) {
    return null;
  }
  
  const cleanZip = zipCode.replace(/[\s\-]/g, '');
  
  if (cleanZip.length < 5) {
    return 'מספרים בלבד';
  }
  
  if (!/^\d{5,6}$/.test(cleanZip)) {
    return 'מיקוד חייב להכיל 5-6 ספרות בלבד';
  }
  
  return null;
};

const validation = {
  validateEmail,
  validatePhone,
  validateCardNumber,
  validateCVV,
  validateName,
  validateIDNumber,
  validateAmount,
  validateAddress,
  validateCity,
  validateZipCode,
  containsHebrew,
};

export default validation;
