/**
 * Swedish Skatteverket OCR Generator
 * Skatteverkets Bankgiro for tax payments is 5050-1055.
 * The OCR reference for Skatteverket skattekonto is constructed from the
 * 10-digit Swedish personnummer or organisationsnummer with a Luhn check digit.
 */

export function generateSkatteverketOCR(orgNrOrPnr: string): string {
  // Strip non-digits and century prefix if 12 digits (e.g. 19900101-1234 -> 9001011234)
  let digits = orgNrOrPnr.replace(/[^0-9]/g, '');
  if (digits.length === 12) {
    digits = digits.substring(2);
  }
  if (digits.length < 10) {
    // Pad or default
    digits = digits.padEnd(10, '0');
  } else if (digits.length > 10) {
    digits = digits.substring(0, 10);
  }

  // Calculate Luhn check digit for the 10 digits
  const checkDigit = calculateLuhnCheckDigit(digits);
  return `${digits}${checkDigit}`;
}

/**
 * Standard Luhn (Modulus 10) algorithm used across Nordic banking
 */
export function calculateLuhnCheckDigit(input: string): number {
  let sum = 0;
  let alternate = true;

  for (let i = input.length - 1; i >= 0; i--) {
    let n = parseInt(input.substring(i, i + 1), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    sum += n;
    alternate = !alternate;
  }

  return (10 - (sum % 10)) % 10;
}

export const SKATTEVERKET_BANKGIRO = '5050-1055';
export const SKATTEVERKET_RECEIVER = 'Skatteverket (Skattekontot)';
