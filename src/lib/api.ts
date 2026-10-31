import { DocItem, DocumentSummary, KeyPointsData, User, SummaryFormatType, SummaryLengthType, SummaryToneType } from '../types';

let authToken = localStorage.getItem('summamind_token') || 'usr_default';

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem('summamind_token', token);
}

export function getAuthToken(): string {
  return authToken;
}

const getHeaders = (isJson = true): HeadersInit => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${authToken}`,
  };
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const api = {
  // Auth
  async getCurrentUser(): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to get user profile');
    const data = await res.json();
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async login(email: string, name?: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, name }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setAuthToken(data.token);
    return data;
  },

  async register(email: string, name: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, name }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    setAuthToken(data.token);
    return data;
  },

  // Documents
  async getDocuments(): Promise<DocItem[]> {
    const res = await fetch('/api/documents', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch documents');
    const data = await res.json();
    return data.documents;
  },

  async getDocument(id: string): Promise<DocItem> {
    const res = await fetch(`/api/documents/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch document');
    const data = await res.json();
    return data.document;
  },

  async uploadDocument(file: File): Promise<DocItem> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload document');
    }
    const data = await res.json();
    return data.document;
  },

  async pasteDocument(title: string, content: string, format = 'executive'): Promise<DocItem> {
    const res = await fetch('/api/documents/paste', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, content, format }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create document from text');
    }
    const data = await res.json();
    return data.document;
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete document');
  },

  async toggleFavorite(id: string): Promise<DocItem> {
    const res = await fetch(`/api/documents/${id}/favorite`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle favorite');
    const data = await res.json();
    return data.document;
  },

  async generateSummary(
    docId: string,
    options: {
      format: SummaryFormatType;
      length: SummaryLengthType;
      tone: SummaryToneType;
      language: string;
    }
  ): Promise<{ document: DocItem; summary: DocumentSummary }> {
    const res = await fetch(`/api/documents/${docId}/summarize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate summary');
    }
    return res.json();
  },

  streamSummary(
    docId: string,
    options: {
      format: SummaryFormatType;
      length: SummaryLengthType;
      tone: SummaryToneType;
      language: string;
    },
    callbacks: {
      onChunk: (chunk: string, fullContent: string) => void;
      onDone: (summary: DocumentSummary) => void;
      onError: (err: string) => void;
    }
  ): () => void {
    const params = new URLSearchParams({
      format: options.format,
      length: options.length,
      tone: options.tone,
      language: options.language,
    });

    const eventSource = new EventSource(`/api/documents/${docId}/summarize/stream?${params.toString()}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          callbacks.onError(data.error);
          eventSource.close();
          return;
        }

        if (data.chunk) {
          callbacks.onChunk(data.chunk, data.fullContent);
        }

        if (data.done && data.summary) {
          callbacks.onDone(data.summary);
          eventSource.close();
        }
      } catch (err: any) {
        callbacks.onError(err.message || 'Stream parsing error');
        eventSource.close();
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      callbacks.onError('Connection to summary stream interrupted.');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  },

  async refreshKeyPoints(docId: string): Promise<{ document: DocItem; keyPoints: KeyPointsData }> {
    const res = await fetch(`/api/documents/${docId}/keypoints`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to refresh key points');
    return res.json();
  },

  async sendChatMessage(
    docId: string,
    message: string
  ): Promise<{ document: DocItem; userMessage: any; modelMessage: any }> {
    const res = await fetch(`/api/documents/${docId}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Chat request failed');
    }
    return res.json();
  },
};
