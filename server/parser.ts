import mammoth from 'mammoth';

// Safe wrapper for pdf-parse which can have varying CJS/ESM exports
async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to handle potential CJS bundle peculiarities
    const pdf: any = await import('pdf-parse');
    const pdfParser = (pdf.default || pdf) as (buf: Buffer) => Promise<{ text: string }>;
    const data = await pdfParser(buffer);
    return data.text || '';
  } catch (err: any) {
    console.warn('pdf-parse threw an error, trying alternative or raw buffer extraction:', err?.message);
    // If standard pdf-parse failed (e.g. encrypted or edge-case structure), extract readable ASCII chunks
    const textChars: string[] = [];
    const str = buffer.toString('latin1');
    const matches = str.match(/BT[\s\S]*?ET/g);
    if (matches && matches.length > 0) {
      for (const m of matches) {
        const textBlocks = m.match(/\((.*?)\)\s*T[jJ]/g);
        if (textBlocks) {
          for (const b of textBlocks) {
            const clean = b.replace(/^\(/, '').replace(/\)\s*T[jJ]$/, '');
            textChars.push(clean);
          }
        }
      }
    }
    if (textChars.length > 50) {
      return textChars.join(' ');
    }
    throw new Error(`Failed to extract text from PDF: ${err?.message || 'Unknown format'}`);
  }
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || '';
}

export async function extractDocumentText(
  buffer: Buffer,
  fileType: 'pdf' | 'docx' | 'txt' | 'md' | string,
  fileName: string
): Promise<{ text: string; wordCount: number; readingTimeMinutes: number }> {
  let cleanText = '';
  const lowerExt = (fileType || fileName.split('.').pop() || '').toLowerCase();

  if (lowerExt.includes('pdf')) {
    cleanText = await parsePdf(buffer);
  } else if (lowerExt.includes('docx') || lowerExt.includes('doc')) {
    cleanText = await parseDocx(buffer);
  } else {
    // plain text, markdown, csv
    cleanText = buffer.toString('utf-8');
  }

  // Clean up whitespace, form feeds, and null characters
  cleanText = cleanText
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  // Standard reading speed is ~220 words per minute
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 220));

  return {
    text: cleanText,
    wordCount,
    readingTimeMinutes
  };
}
