import { NextRequest, NextResponse } from 'next/server';
import { parseReceiptWithAI } from '@/lib/ai-parser';
import { insertReceiptIntoNeon, getOrCreateNeonProfile, DEFAULT_USER_ID } from '@/lib/neon';

/**
 * Resend Inbound Email Webhook Handler
 * Receives forwarded receipt emails, runs Swedish AI tax parsing,
 * and saves into Neon PostgreSQL receipts table.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // Resend sends webhook payload with event type or direct inbound email data
    const emailData = rawBody.data || rawBody;
    const fromAddress = emailData.from || 'unknown@sender.com';
    const subject = emailData.subject || 'Vidarebefordrat kvitto';
    const textBody = emailData.text || emailData.html || '';
    const attachments = emailData.attachments || [];

    // Parse receipt content from attachments or email text body
    let parsedData;
    let originalFilename = null;

    if (attachments.length > 0 && attachments[0].content) {
      // Attachment exists (e.g. PDF or receipt image from merchant)
      const firstAttachment = attachments[0];
      originalFilename = firstAttachment.filename || 'receipt-attachment.pdf';
      const mimeType = firstAttachment.content_type || 'image/jpeg';

      if (mimeType.startsWith('image/')) {
        parsedData = await parseReceiptWithAI({
          base64Image: firstAttachment.content,
          mimeType,
        });
      } else {
        // Fallback or text within email
        parsedData = await parseReceiptWithAI({
          text: `${subject}\n\n${textBody}`,
        });
      }
    } else {
      // Parse email body text directly (e.g. Uber receipt email, SJ confirmation, Adobe invoice email)
      parsedData = await parseReceiptWithAI({
        text: `Ämne: ${subject}\n\nInnehåll:\n${textBody}`,
      });
    }

    // Attempt to store in Neon PostgreSQL
    if (process.env.DATABASE_URL) {
      try {
        const profile = await getOrCreateNeonProfile(fromAddress);
        const userId = profile?.id || DEFAULT_USER_ID;

        await insertReceiptIntoNeon({
          user_id: userId,
          original_file_url: originalFilename || `email://${subject}`,
          source_type: 'email_forward',
          vendor_name: parsedData.vendor_name,
          invoice_date: parsedData.invoice_date,
          currency: parsedData.currency || 'SEK',
          total_amount: parsedData.total_amount,
          vat_amount: parsedData.vat_amount,
          vat_rate: parsedData.vat_rate,
          category: parsedData.category,
          bas_account: parsedData.bas_account || null,
          raw_ai_response: {
            ...parsedData,
            source_email_from: fromAddress,
            source_email_subject: subject,
            received_via: 'resend_webhook',
          },
          status: 'parsed',
        });
      } catch (dbErr) {
        console.warn('Webhook received but Neon database save skipped (offline/dev):', dbErr);
      }
    }

    return NextResponse.json({
      received: true,
      sender: fromAddress,
      parsed_vendor: parsedData.vendor_name,
      vat_bracket: `${parsedData.vat_rate}%`,
      total_amount: parsedData.total_amount,
    });
  } catch (error: any) {
    console.error('Error handling Resend webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Internt fel vid bearbetning av e-post.' },
      { status: 500 }
    );
  }
}
