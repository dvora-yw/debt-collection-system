# Israeli ID Validation Guide

## Algorithm Implemented

The Israeli ID validation uses the modulo-11 checksum algorithm:

1. Take the first 8 digits of the ID
2. Multiply each digit by its position (1-indexed): 
   - 1st digit × 1
   - 2nd digit × 2
   - 3rd digit × 3
   - ... up to 8th digit × 8
3. Sum all the results
4. Calculate `checksum = sum % 11`
5. Calculate `expectedLastDigit = checksum === 0 ? 0 : 11 - checksum`
6. The 9th digit must match the `expectedLastDigit`

## Valid Test IDs

You can use these valid Israeli IDs for testing:

- `000000013` - Generated from first 8 digits: 00000001
- `123456785` - Generated from first 8 digits: 12345678
- `999999996` - Generated from first 8 digits: 99999999
- `555555557` - Generated from first 8 digits: 55555555

## Generating More Valid IDs

To generate a valid Israeli ID from any 8-digit sequence:

```javascript
const generateValidID = (first8) => {
  const digits = first8.padStart(8, '0');
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(digits.charAt(i)) * (i + 1);
  }
  const checksum = sum % 11;
  const lastDigit = checksum === 0 ? 0 : 11 - checksum;
  return digits + lastDigit;
};

// Example: generateValidID('12345678') → '123456785'
```

## Testing in the App

1. Navigate to the payment screen
2. Enter one of the valid test IDs above in the "תעודת זהות" field
3. The validation should pass (no error message)
4. Invalid IDs will show: "תעודת זהות לא תקינה"
