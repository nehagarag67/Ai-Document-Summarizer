import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { db, DocItem, DocumentSummary, ChatMessage } from './server/db.ts';
import { extractDocumentText } from './server/parser.ts';
import {
  generateDocumentSummary,
  streamDocumentSummary,
  extractDocumentKeyPoints,
  chatWithDocument,
  SummaryOptions,
} from './server/gemini.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage for handling PDF, DOCX, TXT uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
});

// Helper to authenticate user header or fallback to default
function getUserId(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer usr_')) {
    return authHeader.replace('Bearer ', '').trim();
  }
  return 'usr_default';
}

// -------------------------------------------------------------
// Auth Endpoints
// -------------------------------------------------------------
app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.getUser(userId) || db.getUser('usr_default');
  res.json({ user, token: user?.id || 'usr_default' });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  const user = db.findOrCreateUser(email, name);
  res.json({ user, token: user.id });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  const user = db.findOrCreateUser(email, name);
  res.json({ user, token: user.id });
});

app.post('/api/auth/guest', (_req: Request, res: Response) => {
  const user = db.getUser('usr_default');
  res.json({ user, token: user?.id || 'usr_default' });
});

// -------------------------------------------------------------
// Document Management Endpoints
// -------------------------------------------------------------
app.get('/api/documents', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const docs = db.getDocuments(userId);
  res.json({ documents: docs });
});

app.get('/api/documents/:id', (req: Request, res: Response) => {
  const doc = db.getDocument(req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  res.json({ document: doc });
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const success = db.deleteDocument(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  res.json({ success: true, message: 'Document deleted' });
});

app.patch('/api/documents/:id/favorite', (req: Request, res: Response) => {
  const doc = db.getDocument(req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  const updated = db.updateDocument(doc.id, { isFavorite: !doc.isFavorite });
  res.json({ document: updated });
});

// Upload document (PDF / DOCX / TXT)
app.post(
  '/api/documents/upload',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const userId = getUserId(req);
      const fileName = file.originalname;
      const fileExt = path.extname(fileName).replace('.', '').toLowerCase();
      const validTypes: ('pdf' | 'docx' | 'txt' | 'md')[] = ['pdf', 'docx', 'txt', 'md'];
      const fileType = validTypes.includes(fileExt as any) ? (fileExt as any) : 'txt';

      // 1. Extract text from the uploaded buffer
      const { text, wordCount, readingTimeMinutes } = await extractDocumentText(
        file.buffer,
        fileType,
        fileName
      );

      if (!text || text.trim().length === 0) {
        res.status(400).json({
          error:
            'Unable to extract readable text from this file. The document may be empty, password protected, or an image-only scan.',
        });
        return;
      }

      const docId = 'doc_' + Math.random().toString(36).substring(2, 10);
      const title = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      // 2. Automatically generate initial Executive summary & structured Key Points
      const initialFormat = 'executive';
      const summaryPromise = generateDocumentSummary(text, {
        format: initialFormat,
        length: 'balanced',
        tone: 'professional',
        language: 'English',
      });
      const keyPointsPromise = extractDocumentKeyPoints(text);

      const [initialSummaryText, keyPoints] = await Promise.all([
        summaryPromise,
        keyPointsPromise,
      ]);

      const initialSummary: DocumentSummary = {
        format: initialFormat,
        length: 'balanced',
        tone: 'professional',
        language: 'English',
        content: initialSummaryText,
        generatedAt: new Date().toISOString(),
      };

      const newDoc: DocItem = {
        id: docId,
        userId,
        title,
        fileName,
        fileType,
        fileSize: file.size,
        wordCount,
        readingTimeMinutes,
        rawText: text,
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        currentSummaryFormat: initialFormat,
        summaries: {
          [initialFormat]: initialSummary,
        },
        keyPoints,
        chatMessages: [],
        tags: [fileType.toUpperCase()],
        isFavorite: false,
      };

      const savedDoc = db.addDocument(newDoc);
      res.status(201).json({ document: savedDoc });
    } catch (err: any) {
      console.error('Error handling upload:', err);
      res.status(500).json({ error: err?.message || 'Failed to process document upload' });
    }
  }
);

// Paste raw text document
app.post('/api/documents/paste', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, format = 'executive' } = req.body;
    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Text content is required' });
      return;
    }

    const userId = getUserId(req);
    const cleanText = content.trim();
    const words = cleanText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 220));

    const docId = 'doc_' + Math.random().toString(36).substring(2, 10);
    const docTitle = title?.trim() || `Pasted Document (${new Date().toLocaleDateString()})`;

    const [summaryText, keyPoints] = await Promise.all([
      generateDocumentSummary(cleanText, {
        format,
        length: 'balanced',
        tone: 'professional',
        language: 'English',
      }),
      extractDocumentKeyPoints(cleanText),
    ]);

    const initialSummary: DocumentSummary = {
      format,
      length: 'balanced',
      tone: 'professional',
      language: 'English',
      content: summaryText,
      generatedAt: new Date().toISOString(),
    };

    const newDoc: DocItem = {
      id: docId,
      userId,
      title: docTitle,
      fileName: `${docTitle.slice(0, 24).toLowerCase().replace(/\s+/g, '-')}.txt`,
      fileType: 'txt',
      fileSize: Buffer.byteLength(cleanText, 'utf-8'),
      wordCount,
      readingTimeMinutes,
      rawText: cleanText,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      currentSummaryFormat: format,
      summaries: {
        [format]: initialSummary,
      },
      keyPoints,
      chatMessages: [],
      tags: ['PASTED'],
      isFavorite: false,
    };

    const savedDoc = db.addDocument(newDoc);
    res.status(201).json({ document: savedDoc });
  } catch (err: any) {
    console.error('Error handling pasted text:', err);
    res.status(500).json({ error: err?.message || 'Failed to process pasted document' });
  }
});

// Generate summary for an existing document in a specific format/tone/length/language
app.post('/api/documents/:id/summarize', async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = db.getDocument(req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const {
      format = 'executive',
      length = 'balanced',
      tone = 'professional',
      language = 'English',
    }: SummaryOptions = req.body;

    const summaryText = await generateDocumentSummary(doc.rawText, {
      format,
      length,
      tone,
      language,
    });

    const summary: DocumentSummary = {
      format,
      length,
      tone,
      language,
      content: summaryText,
      generatedAt: new Date().toISOString(),
    };

    const updatedDoc = db.saveSummary(doc.id, summary);
    res.json({ document: updatedDoc, summary });
  } catch (err: any) {
    console.error('Error generating summary:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate summary' });
  }
});

// Stream summary generation via Server-Sent Events (SSE)
app.get('/api/documents/:id/summarize/stream', async (req: Request, res: Response): Promise<void> => {
  const doc = db.getDocument(req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const format = (req.query.format as string) || 'executive';
  const length = (req.query.length as any) || 'balanced';
  const tone = (req.query.tone as any) || 'professional';
  const language = (req.query.language as string) || 'English';

  // Setup Server-Sent Events headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let fullContent = '';

  try {
    const stream = streamDocumentSummary(doc.rawText, { format, length, tone, language });

    for await (const chunk of stream) {
      fullContent += chunk;
      res.write(`data: ${JSON.stringify({ chunk, fullContent })}\n\n`);
    }

    // Save final accumulated summary to database
    const finalSummary: DocumentSummary = {
      format,
      length,
      tone,
      language,
      content: fullContent,
      generatedAt: new Date().toISOString(),
    };
    db.saveSummary(doc.id, finalSummary);

    res.write(`data: ${JSON.stringify({ done: true, summary: finalSummary })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error('SSE Stream error:', err);
    res.write(`data: ${JSON.stringify({ error: err?.message || 'Streaming failed' })}\n\n`);
    res.end();
  }
});

// Regenerate or extract structured key intelligence (takeaways, entities, metrics, action items)
app.post('/api/documents/:id/keypoints', async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = db.getDocument(req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const keyPoints = await extractDocumentKeyPoints(doc.rawText);
    const updated = db.updateDocument(doc.id, { keyPoints });
    res.json({ document: updated, keyPoints });
  } catch (err: any) {
    console.error('Error extracting keypoints:', err);
    res.status(500).json({ error: err?.message || 'Failed to extract key points' });
  }
});

// Chat with document
app.post('/api/documents/:id/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = db.getDocument(req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message cannot be empty' });
      return;
    }

    const userMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };
    db.addChatMessage(doc.id, userMsg);

    // Call Gemini with document grounding
    const history = (doc.chatMessages || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const { reply, citations } = await chatWithDocument(
      doc.rawText,
      doc.title,
      history,
      message
    );

    const modelMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'model',
      content: reply,
      timestamp: new Date().toISOString(),
      citations,
    };
    const updatedDoc = db.addChatMessage(doc.id, modelMsg);

    res.json({
      document: updatedDoc,
      userMessage: userMsg,
      modelMessage: modelMsg,
    });
  } catch (err: any) {
    console.error('Error in document chat:', err);
    res.status(500).json({ error: err?.message || 'Failed to process chat response' });
  }
});

// Export document summary in various formats
app.get('/api/documents/:id/export/:format', (req: Request, res: Response) => {
  const doc = db.getDocument(req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const exportType = req.params.format.toLowerCase(); // 'md', 'txt', 'json'
  const activeFormat = doc.currentSummaryFormat || 'executive';
  const summary = doc.summaries?.[activeFormat]?.content || 'No summary available.';

  if (exportType === 'json') {
    res.setHeader('Content-Disposition', `attachment; filename="${doc.title}-summary.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(doc, null, 2));
    return;
  }

  const header = `# ${doc.title}
*Summarized with SummaMind AI*
- Original file: ${doc.fileName} (${doc.wordCount.toLocaleString()} words)
- Format: ${activeFormat.toUpperCase()}
- Date: ${new Date().toLocaleDateString()}

---

`;

  const exportText = header + summary;

  if (exportType === 'md') {
    res.setHeader('Content-Disposition', `attachment; filename="${doc.title}-summary.md"`);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(exportText);
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${doc.title}-summary.txt"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(exportText);
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiModel: 'gemini-3.8-flash',
  });
});

// -------------------------------------------------------------
// Vite middleware for development & static serving for production
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SummaMind AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
