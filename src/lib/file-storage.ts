import { getDb } from './neon';

export interface SavedFileInfo {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

/**
 * Save receipt file (JPG, PNG, PDF) permanently according to Bokföringslagen (7 years).
 * Stores in Vercel Blob if BLOB_READ_WRITE_TOKEN is configured,
 * and saves into Neon PostgreSQL `receipt_files` table.
 */
export async function saveReceiptFile(options: {
  receiptId: string;
  filename: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<SavedFileInfo> {
  const { receiptId, filename, mimeType, buffer } = options;
  const sql = getDb();
  let fileUrl = `/api/receipts/file?id=${encodeURIComponent(receiptId)}`;

  // 1. Try Vercel Blob if configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const safeFilename = `receipts/${receiptId}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const blob = await put(safeFilename, buffer, {
        access: 'public',
        contentType: mimeType,
      });
      if (blob?.url) {
        fileUrl = blob.url;
      }
    } catch (blobErr) {
      console.warn('Vercel Blob upload skipped or failed, falling back to Neon PostgreSQL storage:', blobErr);
    }
  }

  // 2. Persist in Neon PostgreSQL `receipt_files` table for reliable permanent archival
  try {
    const base64Content = buffer.toString('base64');
    const size = buffer.length;

    await sql.query(
      `INSERT INTO receipt_files (receipt_id, filename, mime_type, file_size, file_data)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (receipt_id) DO UPDATE SET
         filename = EXCLUDED.filename,
         mime_type = EXCLUDED.mime_type,
         file_size = EXCLUDED.file_size,
         file_data = EXCLUDED.file_data,
         created_at = now();`,
      [receiptId, filename, mimeType, size, base64Content]
    );

    // Update receipts table with fileUrl
    await sql.query(
      `UPDATE receipts SET original_file_url = $1 WHERE id = $2;`,
      [fileUrl, receiptId]
    );
  } catch (dbErr) {
    console.error('Error saving file into Neon receipt_files:', dbErr);
  }

  return {
    url: fileUrl,
    filename,
    mimeType,
    size: buffer.length,
  };
}

/**
 * Retrieve receipt file from Neon
 */
export async function getReceiptFile(receiptId: string): Promise<{
  filename: string;
  mimeType: string;
  buffer: Buffer;
  isExternalUrl?: boolean;
  url?: string;
} | null> {
  const sql = getDb();

  const rows = await sql.query(
    `SELECT filename, mime_type, file_data FROM receipt_files WHERE receipt_id = $1;`,
    [receiptId]
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  const file = rows[0];
  if (file.file_data.startsWith('http://') || file.file_data.startsWith('https://')) {
    return {
      filename: file.filename,
      mimeType: file.mime_type,
      buffer: Buffer.alloc(0),
      isExternalUrl: true,
      url: file.file_data,
    };
  }

  const buffer = Buffer.from(file.file_data, 'base64');
  return {
    filename: file.filename,
    mimeType: file.mime_type,
    buffer,
  };
}
