import { NextRequest, NextResponse } from 'next/server';
import { getNextVatDeadline, generateVatEmailHtml } from '@/lib/vat-reminder';
import { MomsCalculation } from '@/types/tax';

/**
 * API Route: /api/vat/reminder
 * Sends an official Swedish Momsdeklaration summary & Skatteverket deadline reminder
 * via Resend to the user's email address.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      companyName = 'Mitt Företag',
      orgNr = '559123-4567',
      moms,
      periodType = 'quarterly',
    } = body;

    const targetEmail = email || 'mohakay73@gmail.com';

    if (!moms) {
      return NextResponse.json(
        { success: false, error: 'Momsdata saknas i anropet.' },
        { status: 400 }
      );
    }

    const deadlineInfo = getNextVatDeadline(periodType);
    const emailHtml = generateVatEmailHtml({
      companyName,
      orgNr,
      moms: moms as MomsCalculation,
      deadlineInfo,
      userEmail: targetEmail,
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    let emailSent = false;
    let isSimulated = false;

    if (resendApiKey && !resendApiKey.startsWith('mock-')) {
      try {
        const { Resend } = await import('resend');
        const resendClient = new Resend(resendApiKey);

        // Send via Resend
        // Note: For unverified domains, Resend allows sending to the account owner email with onboarding@resend.dev
        const senderAddress = 'Klaro Momsbevakning <onboarding@resend.dev>';

        const response = await resendClient.emails.send({
          from: senderAddress,
          to: [targetEmail],
          subject: `Klaro Momsunderlag: ${deadlineInfo.periodName} (Förfaller ${deadlineInfo.formattedDeadline})`,
          html: emailHtml,
        });

        if (response.error) {
          console.warn('[VatReminder] Resend returned error, falling back to simulated:', response.error);
          isSimulated = true;
        } else {
          emailSent = true;
        }
      } catch (sendError) {
        console.warn('[VatReminder] Failed to send via Resend API, falling back:', sendError);
        isSimulated = true;
      }
    } else {
      isSimulated = true;
    }

    return NextResponse.json({
      success: true,
      message: isSimulated
        ? `Momsunderlag genererat och simulerat för ${targetEmail} (Resend API-nyckel ej skarp)`
        : `Momsunderlag skickat till ${targetEmail}!`,
      simulated: isSimulated,
      deadlineInfo,
    });
  } catch (error: any) {
    console.error('[VatReminder] Error generating or sending reminder:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Kunde inte skicka momsunderlag.' },
      { status: 500 }
    );
  }
}
