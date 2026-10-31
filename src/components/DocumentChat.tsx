import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  User as UserIcon,
  Copy,
  Check,
  Bot,
  Lightbulb,
  Trash2,
  Bookmark,
  ArrowDown
} from 'lucide-react';
import { DocItem, ChatMessage, User } from '../types';
import { api } from '../lib/api';

interface DocumentChatProps {
  document: DocItem;
  user: User | null;
  onDocumentUpdated: (doc: DocItem) => void;
}

export const DocumentChat: React.FC<DocumentChatProps> = ({
  document,
  user,
  onDocumentUpdated,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages: ChatMessage[] = document.chatMessages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isSending]);

  const handleSendMessage = async (msgToSend?: string) => {
    const text = (msgToSend || inputMessage).trim();
    if (!text || isSending) return;

    setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.sendChatMessage(document.id, text);
      onDocumentUpdated(res.document);
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamic suggested prompts based on document type / content
  const suggestedPrompts = [
    'What are the core conclusions and recommendations?',
    'What quantitative metrics and data points are highlighted?',
    'What risks, caveats, or limitations does the author mention?',
    'Give me a 3-bullet executive summary of this document.',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[500px] rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Chat with "{document.title}"
            </h3>
            <p className="text-[11px] text-slate-400">
              Grounded exclusively in this document's text using Gemini AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[11px] text-purple-700 dark:text-purple-300 font-semibold bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
            {document.wordCount.toLocaleString()} words indexed
          </span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 py-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Ask anything about this document
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                SummaMind AI has indexed the full contents of this file. Tap a suggested question or write your own.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="w-full space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-left">
                Suggested Questions:
              </span>
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full p-2.5 text-left text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span>{prompt}</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-purple-600 text-white'
                      : 'bg-indigo-600 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`group relative p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Citations if any */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-1.5">
                      <Bookmark className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        Citations:
                      </span>
                      {msg.citations.map((cite, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium"
                        >
                          {cite}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Timestamp & copy */}
                  <div
                    className={`flex items-center justify-between gap-3 mt-2 text-[10px] ${
                      isUser ? 'text-purple-200' : 'text-slate-400'
                    }`}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex gap-3 max-w-md">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-tl-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce delay-200" />
              <span className="text-xs text-slate-500 font-medium ml-1">
                Analyzing document text...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question about this document..."
            disabled={isSending}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
