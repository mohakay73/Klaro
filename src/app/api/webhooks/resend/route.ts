import { NextRequest, NextResponse } from 'next/server';
import { parseReceiptWithAI } from '@/lib/ai-parser';
import { insertReceiptIntoNeon, getOrCreateNeonProfile, getDb, DEFAULT_USER_ID } from '@/lib/neon';
import { saveReceiptFile } from '@/lib/file-storage';

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
        const sql = getDb();

        // Multi-tenant resolution:
        // 1. Check if recipient "to" address contains a plus tag (e.g. kvitto+mohakay73@nexougwen.resend.app)
        const toRaw = Array.isArray(emailData.to) ? emailData.to[0] : (emailData.to || '');
        let targetUserTag: string | null = null;
        const plusMatch = toRaw.match(/\+([^@]+)@/);
        if (plusMatch) {
          targetUserTag = plusMatch[1];
        }

        let matchedProfile: any = null;
        if (targetUserTag) {
          const profileRows = await sql.query(
            `SELECT * FROM profiles WHERE email ILIKE $1 OR id::text ILIKE $2 LIMIT 1;`,
            [`%${targetUserTag}%`, `${targetUserTag}%`]
          );
          if (profileRows && profileRows.length > 0) {
            matchedProfile = profileRows[0];
          }
        }

        // 2. If no plus tag match, check fromAddress (when forwarded from personal Gmail/Outlook)
        if (!matchedProfile && fromAddress && !fromAddress.includes('kivra') && !fromAddress.includes('resend')) {
          matchedProfile = await getOrCreateNeonProfile(fromAddress);
        }

        const userId = matchedProfile?.id || DEFAULT_USER_ID;

        // Deduplication 1: Check if this Resend email_id was already processed
        if (emailId) {
          const existingEmail = await sql.query(
            `SELECT id, vendor_name, total_amount FROM receipts WHERE raw_ai_response->>'email_id' = $1 LIMIT 1;`,
            [emailId]
          );
          if (existingEmail && existingEmail.length > 0) {
            console.log(`Receipt already processed for email_id ${emailId}, skipping duplicate.`);
            return NextResponse.json({
              received: true,
              deduplicated: true,
              receipt_id: existingEmail[0].id,
              message: 'Kvitto från detta e-postmeddelande har redan registrerats.',
            });
          }
        }

        // Deduplication 2: Check for identical vendor, amount and subject within the last 24 hours
        const recentDuplicate = await sql.query(
          `SELECT id FROM receipts 
           WHERE user_id = $1 
             AND vendor_name = $2 
             AND total_amount = $3 
             AND created_at > NOW() - INTERVAL '24 hours'
           LIMIT 1;`,
          [userId, parsedData.vendor_name, parsedData.total_amount]
        );
        if (recentDuplicate && recentDuplicate.length > 0) {
          console.log(`Duplicate receipt found for ${parsedData.vendor_name} ${parsedData.total_amount} kr within 24h, skipping.`);
          return NextResponse.json({
            received: true,
            deduplicated: true,
            receipt_id: recentDuplicate[0].id,
            message: 'Ett identiskt kvitto har redan registrerats det senaste dygnet.',
          });
        }

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

        // Archive attachment file permanently if bytes are available
        if (fileBuffer && savedReceipt?.id && originalFilename) {
          try {
            await saveReceiptFile({
              receiptId: savedReceipt.id,
              filename: originalFilename,
              mimeType: attachments[0]?.content_type || 'image/jpeg',
              buffer: fileBuffer,
            });
          } catch (fileErr) {
            console.warn('Webhook attachment archiving notice:', fileErr);
          }
        }
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
