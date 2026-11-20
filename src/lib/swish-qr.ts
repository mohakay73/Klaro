import QRCode from 'qrcode';

export interface SwishQrOptions {
  payee: string; // e.g. "123 456 78 90" or "1234567890"
  amount: number; // e.g. 12500.00
  message: string; // e.g. "FAKTURA-1002" or OCR
}

/**
 * Format string according to Getswish QR specification:
 * C<payee>;<amount>;<message>;<lock>
 * Example: C1234567890;12500.00;FAKTURA-1002;0
 */
export function formatSwishPayload({ payee, amount, message }: SwishQrOptions): string {
  const cleanPayee = payee.replace(/[^0-9]/g, '');
  const cleanAmount = amount > 0 ? amount.toFixed(2) : '';
  // Sanitize message: alphanumeric and spaces/dashes, max 50 chars
  const cleanMessage = (message || '').slice(0, 50).trim();
  
  return `C${cleanPayee};${cleanAmount};${cleanMessage};0`;
}

/**
 * Returns a mobile web URL / deep link that opens Swish on mobile devices
 */
export function getSwishDeepLink({ payee, amount, message }: SwishQrOptions): string {
  const cleanPayee = payee.replace(/[^0-9]/g, '');
  const cleanAmount = amount > 0 ? amount.toFixed(2) : '';
  const cleanMessage = encodeURIComponent((message || '').slice(0, 50).trim());
  return `https://app.swish.nu/1/p/sw/?sw=${cleanPayee}&amt=${cleanAmount}&msg=${cleanMessage}`;
}

/**
 * Generates a crisp vector SVG string of the Swish QR code.
 * Uses high error correction (Q) so it scans instantly under camera lens or printouts.
 */
export async function generateSwishQrSvg(options: SwishQrOptions): Promise<string> {
  const payload = formatSwishPayload(options);
  
  try {
    const svg = await QRCode.toString(payload, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'Q',
      color: {
        dark: '#1c1917',
        light: '#ffffff'
      }
    });
    return svg;
  } catch (error) {
    console.error('Failed to generate Swish QR code SVG:', error);
    return '';
  }
}
