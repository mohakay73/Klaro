import { NextRequest, NextResponse } from 'next/server';
import { parseReceiptWithAI } from '@/lib/ai-parser';
import { insertReceiptIntoNeon, getOrCreateNeonProfile, DEFAULT_USER_ID } from '@/lib/neon';

/**
 * Resend Inbound Email Webhook Handler
 * Receives forwarded receipt emails from Resend (event: email.received),
 * downloads any attached receipt images/PDFs, runs Swedish AI tax parsing (Gemini),
 * and saves into Neon PostgreSQL receipts table.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const resendApiKey = process.env.RESEND_API_KEY;

    // Resend sends { type: "email.received", data: { email_id, from, to, subject, attachments } }
    const emailData = rawBody.data || rawBody;
    const fromAddress = Array.isArray(emailData.from) 
      ? emailData.from[0] 
      : (emailData.from || 'unknown@sender.com');
    const subject = emailData.subject || 'Vidarebefordrat kvitto';
    const emailId = emailData.email_id || rawBody.email_id;
    let textBody = emailData.text || emailData.html || '';
    const attachments = emailData.attachments || [];

    let parsedData;
    let originalFilename: string | null = null;
    let fileBuffer: Buffer | null = null;

    // 1. If Resend provided attachments metadata with an ID, fetch the attachment file
    if (attachments.length > 0) {
      const firstAtt = attachments[0];
      originalFilename = firstAtt.filename || 'kvitto.jpg';
      const mimeType = firstAtt.content_type || 'image/jpeg';

      // Case A: Direct content already in payload (base64 string)
      if (firstAtt.content) {
        parsedData = await parseReceiptWithAI({
          base64Image: firstAtt.content,
          mimeType,
        });
      } 
      // Case B: Resend provides attachment ID -> Fetch download URL from Resend API
      else if (firstAtt.id && resendApiKey && !resendApiKey.startsWith('mock-')) {
        try {
          const attRes = await fetch(`https://api.resend.com/attachments/${firstAtt.id}`, {
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
            },
          });
          const attData = await attRes.json();
          const downloadUrl = attData.download_url || attData.data?.download_url;

          if (downloadUrl) {
            const fileRes = await fetch(downloadUrl);
            const arrayBuf = await fileRes.arrayBuffer();
            fileBuffer = Buffer.from(arrayBuf);

            if (mimeType.startsWith('image/')) {
              parsedData = await parseReceiptWithAI({
                base64Image: fileBuffer.toString('base64'),
                mimeType,
              });
            } else {
              // PDF or text document
              parsedData = await parseReceiptWithAI({
                text: `${subject}\n\nFilnamn: ${originalFilename}\n\n${fileBuffer.toString('utf-8').slice(0, 5000)}`,
              });
            }
          }
        } catch (fetchErr) {
          console.warn('Could not fetch attachment bytes from Resend:', fetchErr);
        }
      }
    }

    // 2. If no attachment parsed, parse email text body (e.g. Uber, SJ, Apple, Adobe invoices)
    if (!parsedData) {
      // If emailId is provided and textBody is empty, fetch full email body from Resend receiving
      if (!textBody && emailId && resendApiKey && !resendApiKey.startsWith('mock-')) {
        try {
          const { Resend } = await import('resend');
          const resendClient = new Resend(resendApiKey);
          const { data: inboundEmail } = await resendClient.emails.receiving.get(emailId);
          if (inboundEmail) {
            textBody = inboundEmail.text || inboundEmail.html || '';
          }
        } catch (e) {
          console.warn('Could not fetch full email body from Resend:', e);
        }
      }

      parsedData = await parseReceiptWithAI({
        text: `Ämne: ${subject}\n\nAvsändare: ${fromAddress}\n\nInnehåll:\n${textBody || subject}`,
      });
    }

    // 3. Persist receipt into Neon PostgreSQL
    let savedReceipt = null;
    if (process.env.DATABASE_URL) {
      try {
        const profile = await getOrCreateNeonProfile(fromAddress);
        const userId = profile?.id || DEFAULT_USER_ID;

        savedReceipt = await insertReceiptIntoNeon({
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
            email_id: emailId || null,
            received_via: 'resend_webhook',
          },
          status: 'parsed',
        });
      } catch (dbErr) {
        console.warn('Webhook received but Neon database save failed:', dbErr);
      }
    }

    return NextResponse.json({
      received: true,
      sender: fromAddress,
      subject: subject,
      parsed_vendor: parsedData.vendor_name,
      vat_bracket: `${parsedData.vat_rate}%`,
      total_amount: parsedData.total_amount,
      saved_to_neon: Boolean(savedReceipt),
    });
  } catch (error: any) {
    console.error('Error handling Resend webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Internt fel vid bearbetning av e-post.' },
      { status: 500 }
    );
  }
}
