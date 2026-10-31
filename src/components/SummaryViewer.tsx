import React, { useState } from 'react';
import {
  Briefcase,
  ListOrdered,
  Zap,
  BookOpen,
  CheckSquare,
  GraduationCap,
  Copy,
  Check,
  Download,
  FileDown,
  Sparkles,
  RefreshCw,
  Radio,
  Sliders,
  Globe,
  Share2
} from 'lucide-react';
import { DocItem, DocumentSummary, SummaryFormatType, SummaryLengthType, SummaryToneType } from '../types';
import { api } from '../lib/api';
import { exportDocumentToPdf } from '../lib/pdfExport';

interface SummaryViewerProps {
  document: DocItem;
  onDocumentUpdated: (doc: DocItem) => void;
}

export const SummaryViewer: React.FC<SummaryViewerProps> = ({
  document,
  onDocumentUpdated,
}) => {
  const [activeFormat, setActiveFormat] = useState<SummaryFormatType>(
    (document.currentSummaryFormat as SummaryFormatType) || 'executive'
  );
  const [selectedLength, setSelectedLength] = useState<SummaryLengthType>('balanced');
  const [selectedTone, setSelectedTone] = useState<SummaryToneType>('professional');
  const [selectedLang, setSelectedLang] = useState<string>('English');

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active summary
  const summary: DocumentSummary | undefined = document.summaries?.[activeFormat];
  const displayContent = isStreaming
    ? streamingContent
    : summary?.content || 'No summary generated in this format yet. Click "Generate" to synthesize this format.';

  const summaryWords = displayContent.split(/\s+/).filter(Boolean).length;
  const compressionRatio = document.wordCount > 0
    ? Math.max(0, Math.round((1 - summaryWords / document.wordCount) * 100))
    : 70;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.generateSummary(document.id, {
        format: activeFormat,
        length: selectedLength,
        tone: selectedTone,
        language: selectedLang,
      });
      onDocumentUpdated(res.document);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamLive = () => {
    setError(null);
    setIsStreaming(true);
    setStreamingContent('');

    api.streamSummary(
      document.id,
      {
        format: activeFormat,
        length: selectedLength,
        tone: selectedTone,
        language: selectedLang,
      },
      {
        onChunk: (_chunk, full) => {
          setStreamingContent(full);
        },
        onDone: (finalSummary) => {
          setIsStreaming(false);
          const updatedDoc = {
            ...document,
            summaries: {
              ...document.summaries,
              [finalSummary.format]: finalSummary,
            },
            currentSummaryFormat: finalSummary.format,
          };
          onDocumentUpdated(updatedDoc);
        },
        onError: (err) => {
          setIsStreaming(false);
          setError(err);
        },
      }
    );
  };

  const formatButtons: { id: SummaryFormatType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'executive', label: 'Executive Brief', icon: <Briefcase className="w-4 h-4" />, desc: 'Leadership synthesis with ROI & findings' },
    { id: 'bullets', label: 'Key Bullets', icon: <ListOrdered className="w-4 h-4" />, desc: 'Thematic takeaways and critical numbers' },
    { id: 'tldr', label: 'TL;DR', icon: <Zap className="w-4 h-4" />, desc: 'Ultra-concise 3-sentence verdict' },
    { id: 'deep_dive', label: 'Deep Dive', icon: <BookOpen className="w-4 h-4" />, desc: 'In-depth section by section breakdown' },
    { id: 'action_items', label: 'Action Items', icon: <CheckSquare className="w-4 h-4" />, desc: 'Next steps, priorities, and tasks' },
    { id: 'study_guide', label: 'Study Guide', icon: <GraduationCap className="w-4 h-4" />, desc: 'Educational review & quiz questions' },
  ];

  return (
    <div className="space-y-6">
      {/* Format Selection Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {formatButtons.map((btn) => {
          const isSelected = activeFormat === btn.id;
          const hasExisting = !!document.summaries?.[btn.id];

          return (
            <button
              key={btn.id}
              onClick={() => {
                setActiveFormat(btn.id);
                // If it exists, auto-sync tone/length if available
                if (document.summaries?.[btn.id]) {
                  setSelectedLength((document.summaries[btn.id].length as any) || 'balanced');
                  setSelectedTone((document.summaries[btn.id].tone as any) || 'professional');
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20 ring-2 ring-purple-400/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-1.5 rounded-xl ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300'
                  }`}
                >
                  {btn.icon}
                </div>
                {hasExisting && !isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Ready" />
                )}
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {btn.label}
                </p>
                <p
                  className={`text-[10px] mt-0.5 line-clamp-1 ${
                    isSelected ? 'text-purple-100' : 'text-slate-400'
                  }`}
                >
                  {btn.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Synthesis Configuration & Trigger Panel */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Modifiers (Length, Tone, Language) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Length */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
              Length:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5">
              {(['concise', 'balanced', 'comprehensive'] as SummaryLengthType[]).map((len) => (
                <button
                  key={len}
                  onClick={() => setSelectedLength(len)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                    selectedLength === len
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-purple-600'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
              Tone:
            </span>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value as SummaryToneType)}
              className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-transparent focus:border-purple-500 focus:outline-none"
            >
              <option value="professional">Professional</option>
              <option value="academic">Academic</option>
              <option value="casual">Casual</option>
              <option value="creative">Creative</option>
            </select>
          </div>

          {/* Language */}
          <div className="flex items-center gap-1.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-transparent focus:border-purple-500 focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
              <option value="German">Deutsch</option>
              <option value="Japanese">日本語</option>
              <option value="Chinese">中文</option>
              <option value="Portuguese">Português</option>
              <option value="Italian">Italiano</option>
              <option value="Hindi">हिन्दी</option>
            </select>
          </div>
        </div>

        {/* Right: Synthesis Action buttons */}
        <div className="flex items-center gap-2">
          {/* Stream Live Button */}
          <button
            onClick={handleStreamLive}
            disabled={isLoading || isStreaming}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            title="Watch real-time live synthesis stream"
          >
            <Radio className={`w-3.5 h-3.5 text-purple-600 ${isStreaming ? 'animate-pulse text-red-500' : ''}`} />
            <span>{isStreaming ? 'Streaming...' : 'Live Stream'}</span>
          </button>

          {/* Standard Fast Generate */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || isStreaming}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? 'Synthesizing...' : 'Regenerate Brief'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Main Summary Document Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-sm overflow-hidden">
        {/* Document Header & Export Toolbar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {activeFormat.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">
                • {summaryWords} words ({compressionRatio}% shorter than original)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {document.title}
            </h3>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Copy Summary Markdown"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* PDF Download Button */}
            <button
              onClick={() => exportDocumentToPdf(document, activeFormat)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Download High-Res PDF Executive Brief"
            >
              <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Export PDF</span>
            </button>

            {/* Markdown Export */}
            <a
              href={`/api/documents/${document.id}/export/md`}
              download
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Download Markdown (.md)"
            >
              <FileDown className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Summary Content Body */}
        <div className="p-6 sm:p-8">
          {isStreaming && (
            <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-medium w-fit animate-pulse">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
              <span>Synthesizing live response from Gemini 2.5 Flash...</span>
            </div>
          )}

          <div className="prose prose-purple dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-sm sm:text-base space-y-4">
            {displayContent.split('\n\n').map((paragraph, idx) => {
              // Check if paragraph is heading
              if (paragraph.startsWith('### ')) {
                return (
                  <h4
                    key={idx}
                    className="text-base sm:text-lg font-bold text-purple-900 dark:text-purple-300 pt-3 pb-1 border-b border-purple-100 dark:border-purple-900/50"
                  >
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h3
                    key={idx}
                    className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white pt-4 pb-1"
                  >
                    {paragraph.replace('## ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                const items = paragraph.split('\n');
                return (
                  <ul key={idx} className="space-y-1.5 list-disc list-inside pl-2">
                    {items.map((it, iIdx) => (
                      <li key={iIdx} className="text-slate-700 dark:text-slate-300">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: it
                              .replace(/^[\*\-]\s+/, '')
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>'),
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                );
              }

              // Standard paragraph with inline formatting
              return (
                <p
                  key={idx}
                  className="text-slate-700 dark:text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: paragraph
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em class="italic text-purple-800 dark:text-purple-300">$1</em>'),
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>AI Model: Google Gemini 2.5 Flash</span>
          <span>
            Generated: {summary?.generatedAt ? new Date(summary.generatedAt).toLocaleString() : 'Live'}
          </span>
        </div>
      </div>
    </div>
  );
};
