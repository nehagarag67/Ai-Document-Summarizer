import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileCode,
  X,
  Sparkles,
  Clipboard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';
import { DocItem, SummaryFormatType } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentCreated: (doc: DocItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Paste text state
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [pasteFormat, setPasteFormat] = useState<SummaryFormatType>('executive');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7C3AED', '#A78BFA', '#6366F1', '#EC4899'],
      });
    } catch (e) {
      // ignore in environments without canvas
    }
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setProgressStep('Parsing document binary and extracting full text...');

    try {
      setTimeout(() => {
        setProgressStep('Synthesizing executive intelligence with Gemini AI...');
      }, 900);

      const doc = await api.uploadDocument(file);
      triggerCelebration();
      onDocumentCreated(doc);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to process and summarize document.');
    } finally {
      setIsProcessing(false);
      setProgressStep('');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim()) {
      setError('Please paste or write some document text.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProgressStep('Processing text and extracting key points...');

    try {
      const doc = await api.pasteDocument(pasteTitle, pasteContent, pasteFormat);
      triggerCelebration();
      onDocumentCreated(doc);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to summarize text.');
    } finally {
      setIsProcessing(false);
      setProgressStep('');
    }
  };

  // Sample templates to load
  const loadSample = async (sampleId: string) => {
    setError(null);
    setIsProcessing(true);
    setProgressStep('Loading pre-computed sample intelligence...');

    try {
      const doc = await api.getDocument(sampleId);
      triggerCelebration();
      onDocumentCreated(doc);
      onClose();
    } catch (err: any) {
      setError('Sample could not be loaded.');
    } finally {
      setIsProcessing(false);
      setProgressStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Summarize New Document
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports PDF, DOCX, TXT, and Markdown files up to 30MB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'paste'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clipboard className="w-4 h-4" />
            <span>Paste Text / Article</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'samples'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Try Sample Briefs</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {isProcessing ? (
            <div className="py-14 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900 animate-ping opacity-25" />
                <div className="w-16 h-16 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-purple-600">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  AI Summarization in Progress
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium animate-pulse">
                  {progressStep || 'Synthesizing with Gemini 2.5 Flash...'}
                </p>
              </div>
            </div>
          ) : activeTab === 'upload' ? (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 scale-101'
                    : 'border-purple-200 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/10 hover:border-purple-400 hover:bg-purple-50/40 dark:hover:bg-purple-950/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                  Drag and drop your file here, or{' '}
                  <span className="text-purple-600 dark:text-purple-400 underline">browse</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
                  Upload PDF research papers, DOCX business briefs, meeting transcripts, or text notes.
                </p>

                <div className="flex items-center justify-center gap-3 mt-6">
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    PDF (.pdf)
                  </span>
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    Word (.docx)
                  </span>
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    Text / MD (.txt, .md)
                  </span>
                </div>
              </div>
            </div>
          ) : activeTab === 'paste' ? (
            <form onSubmit={handlePasteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
                  placeholder="e.g., Q3 Financial Review or Engineering Spec"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Document Text Content
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {pasteContent.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Paste article, notes, transcripts, or reports here..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-sans focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Initial Format:
                  </span>
                  <select
                    value={pasteFormat}
                    onChange={(e) => setPasteFormat(e.target.value as SummaryFormatType)}
                    className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="executive">Executive Brief</option>
                    <option value="bullets">Key Bullets</option>
                    <option value="tldr">TL;DR</option>
                    <option value="deep_dive">Deep Dive</option>
                    <option value="action_items">Action Items</option>
                    <option value="study_guide">Study Guide</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs sm:text-sm hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  Generate Summary
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick a benchmark document to instantly explore SummaMind's summarization and grounded Q&A:
              </p>

              <div
                onClick={() => loadSample('sample-ai-trends-2026')}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Future of Multimodal AI Agents (2026 Industry Report)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      1,420 words • Executive Brief • Fortune 500 benchmarks & architectures
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>

              <div
                onClick={() => loadSample('sample-remote-work-handbook')}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0">
                    DOCX
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Global Remote Work & Async Collaboration Guide
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      980 words • Operational playbooks, 3-hour overlap rule, RFC protocols
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
