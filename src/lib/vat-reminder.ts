/**
 * Swedish Skatteverket VAT Deadlines & Email Reminder Helper
 * Calculates upcoming declaration dates according to Swedish tax regulations (Mervärdesskattelagen)
 * and formats official declaration breakdowns for email notifications via Resend.
 */

import { MomsCalculation } from '@/types/tax';
import { generateSkatteverketOCR, SKATTEVERKET_BANKGIRO, SKATTEVERKET_RECEIVER } from './skatteverket-ocr';
import { formatSEK } from './utils';

export interface VatDeadlineInfo {
  periodName: string;
  deadlineDate: string;        // YYYY-MM-DD
  formattedDeadline: string;   // e.g. "12 maj 2026"
  daysLeft: number;
  isUrgent: boolean;           // <= 14 days
  isPassed: boolean;
  quarterCode: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'MONTHLY' | 'YEARLY';
}

/**
 * Calculates the next Swedish VAT declaration deadline.
 * Standard quarterly deadlines (Kvartalsmoms):
 * Q1 (Jan-Mar): Due 12 May
 * Q2 (Apr-Jun): Due 17 August (extended due to Swedish holiday period)
 * Q3 (Jul-Sep): Due 12 November
 * Q4 (Oct-Dec): Due 26 February (or 12 May for enskild firma)
 */
export function getNextVatDeadline(
  periodType: 'quarterly' | 'monthly' | 'yearly' = 'quarterly',
  refDate: Date = new Date()
): VatDeadlineInfo {
  const year = refDate.getFullYear();
  const month = refDate.getMonth(); // 0-11
  const day = refDate.getDate();

  const deadlines: { date: Date; name: string; code: VatDeadlineInfo['quarterCode'] }[] = [];

  if (periodType === 'quarterly') {
    // Current year quarterly deadlines
    deadlines.push({ date: new Date(year, 1, 26), name: `Kvartal 4 (${year - 1})`, code: 'Q4' });
    deadlines.push({ date: new Date(year, 4, 12), name: `Kvartal 1 (${year})`, code: 'Q1' });
    deadlines.push({ date: new Date(year, 7, 17), name: `Kvartal 2 (${year})`, code: 'Q2' });
    deadlines.push({ date: new Date(year, 10, 12), name: `Kvartal 3 (${year})`, code: 'Q3' });
    // Next year deadlines
    deadlines.push({ date: new Date(year + 1, 1, 26), name: `Kvartal 4 (${year})`, code: 'Q4' });
    deadlines.push({ date: new Date(year + 1, 4, 12), name: `Kvartal 1 (${year + 1})`, code: 'Q1' });
  } else if (periodType === 'monthly') {
    // Monthly VAT is typically due the 12th of the second month following the reporting month
    for (let i = 0; i < 4; i++) {
      const d = new Date(year, month + i, 12);
      const targetMonthName = new Date(year, month + i - 2, 1).toLocaleDateString('sv-SE', { month: 'long' });
      deadlines.push({ date: d, name: `Månadsmoms (${targetMonthName})`, code: 'MONTHLY' });
    }
  } else {
    // Yearly VAT for enskild firma
    deadlines.push({ date: new Date(year, 4, 12), name: `Helårsmoms (${year - 1})`, code: 'YEARLY' });
    deadlines.push({ date: new Date(year + 1, 4, 12), name: `Helårsmoms (${year})`, code: 'YEARLY' });
  }

  // Find the first deadline that is >= today (or within today)
  const todayReset = new Date(year, month, day);
  const next = deadlines.find((d) => d.date >= todayReset) || deadlines[deadlines.length - 1];

  const diffMs = next.date.getTime() - todayReset.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const yyyy = next.date.getFullYear();
  const mm = String(next.date.getMonth() + 1).padStart(2, '0');
  const dd = String(next.date.getDate()).padStart(2, '0');
  const deadlineDateStr = `${yyyy}-${mm}-${dd}`;

  const formattedDeadline = next.date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    periodName: next.name,
    deadlineDate: deadlineDateStr,
    formattedDeadline,
    daysLeft: Math.max(0, daysLeft),
    isUrgent: daysLeft <= 14,
    isPassed: daysLeft === 0,
    quarterCode: next.code,
  };
}

export interface VatEmailOptions {
  companyName: string;
  orgNr: string;
  moms: MomsCalculation;
  deadlineInfo: VatDeadlineInfo;
  userEmail: string;
}

/**
 * Generates an official, beautifully styled HTML email with Stockholm Ochre palette
 * for Skatteverkets momsdeklaration.
 */
export function generateVatEmailHtml({
  companyName,
  orgNr,
  moms,
  deadlineInfo,
}: VatEmailOptions): string {
  const ocrNumber = generateSkatteverketOCR(orgNr || '559123-4567');
  const { utgaendeMoms, ingaendeMoms, netMoms, utgaendeBreakdown } = moms;
  const amountToPay = Math.max(0, Math.round(netMoms));
  const isRefund = netMoms < 0;
  const refundAmount = Math.abs(Math.round(netMoms));

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Klaro Momsunderlag</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f7f4ee;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1c1917;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 24px auto;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e7e2d7;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(28, 25, 23, 0.04);
    }
    .header {
      background: #1c1917;
      padding: 28px 32px;
      color: #ffffff;
    }
    .brand {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #f59e0b;
      margin: 0 0 6px 0;
    }
    .header-sub {
      color: #a8a29e;
      font-size: 13px;
      margin: 0;
    }
    .content {
      padding: 32px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .card {
      background: #f7f4ee;
      border: 1px solid #e7e2d7;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .amount-hero {
      font-size: 32px;
      font-weight: 800;
      font-family: monospace;
      color: #1c1917;
      margin: 6px 0;
    }
    .table-container {
      margin: 24px 0;
      border: 1px solid #e7e2d7;
      border-radius: 12px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      background: #f7f4ee;
      padding: 10px 14px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #78716c;
      border-bottom: 1px solid #e7e2d7;
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #f0ede6;
      color: #1c1917;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .ruta-tag {
      display: inline-block;
      background: #ffffff;
      border: 1px solid #e7e2d7;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: 700;
      font-family: monospace;
      color: #1c1917;
      margin-right: 6px;
    }
    .payment-box {
      background: #fbfaf8;
      border: 1px dashed #d97706;
      border-radius: 12px;
      padding: 18px;
      margin-top: 24px;
    }
    .btn {
      display: inline-block;
      background: #1c1917;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      margin-top: 16px;
    }
    .footer {
      background: #f7f4ee;
      padding: 20px 32px;
      border-top: 1px solid #e7e2d7;
      font-size: 11px;
      color: #78716c;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand">Klaro.</div>
      <p class="header-sub">Momsdeklarationsunderlag • Skatteverket SKV 4700</p>
    </div>

    <div class="content">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <h2 style="font-size: 18px; margin: 0 0 4px 0; font-weight: 800;">${companyName}</h2>
          <p style="font-size: 12px; color: #78716c; margin: 0;">Org.nr / Personnr: <strong>${orgNr}</strong></p>
        </div>
        <span class="badge">${deadlineInfo.periodName}</span>
      </div>

      <div class="card">
        <div style="font-size: 12px; color: #78716c; font-weight: 600;">
          ${isRefund ? 'Moms att få tillbaka från Skatteverket' : 'Netto moms att inbetala'}
        </div>
        <div class="amount-hero">
          ${isRefund ? `+${formatSEK(refundAmount)}` : formatSEK(amountToPay)}
        </div>
        <div style="font-size: 12px; color: #b45309; font-weight: 600;">
          Deklareras och inbetalas senast: <strong>${deadlineInfo.formattedDeadline}</strong> (${deadlineInfo.daysLeft} dagar kvar)
        </div>
      </div>

      <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; margin: 24px 0 10px 0;">
        Skatteverkets Blankettfält (SKV 4700)
      </h3>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Fält / Ruta</th>
              <th>Beskrivning</th>
              <th style="text-align: right;">Belopp</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="ruta-tag">Ruta 05</span></td>
              <td>Momspliktig försäljning 25% (underlag exkl. moms)</td>
              <td style="text-align: right; font-family: monospace; font-weight: 600;">${formatSEK(Math.round(utgaendeBreakdown[25]?.netBase || 0))}</td>
            </tr>
            <tr>
              <td><span class="ruta-tag">Ruta 10</span></td>
              <td>Utgående moms 25% (på fakturor)</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; color: #1c1917;">${formatSEK(Math.round(utgaendeBreakdown[25]?.vatAmount || 0))}</td>
            </tr>
            <tr>
              <td><span class="ruta-tag">Ruta 48</span></td>
              <td>Ingående moms att dra av (kvitton & utgifter)</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; color: #15803d;">-${formatSEK(Math.round(ingaendeMoms))}</td>
            </tr>
            <tr style="background: #faf8f5; font-weight: bold;">
              <td><span class="ruta-tag" style="background: #fef3c7; border-color: #fde68a;">Ruta 49</span></td>
              <td><strong>Moms att betala (+) eller få tillbaka (-)</strong></td>
              <td style="text-align: right; font-family: monospace; font-size: 14px; color: ${isRefund ? '#15803d' : '#b45309'};">
                <strong>${formatSEK(Math.round(netMoms))}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Payment details box -->
      <div class="payment-box">
        <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #1c1917;">
          🏛️ Inbetalningsuppgifter till Skattekontot
        </h4>
        <div style="font-size: 12px; line-height: 1.8; font-family: monospace;">
          <div>Mottagare: <strong>${SKATTEVERKET_RECEIVER}</strong></div>
          <div>Bankgiro: <strong>${SKATTEVERKET_BANKGIRO}</strong></div>
          <div>Ditt personliga OCR (Luhn): <strong style="font-size: 14px; color: #d97706; background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #e7e2d7;">${ocrNumber}</strong></div>
          <div>Exakt belopp: <strong>${formatSEK(amountToPay)}</strong></div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://skatteverket.se" target="_blank" class="btn">
          Logga in på Skatteverket med BankID →
        </a>
      </div>
    </div>

    <div class="footer">
      <strong>Klaro Bokföring & Skattebuffert</strong><br>
      Detta underlag är automatiskt framställt baserat på dina godkända kundfakturor och kvitton i enlighet med Mervärdesskattelagen (ML) och Bokföringslagen (BFL 7 kap. 2 §). Alla kvitton finns säkert sparade i ditt digitala arkiv.
    </div>
  </div>
</body>
</html>`;
}
