import React, { useState } from 'react';
import { Search, FileText, Hash, Clock, Copy, Check } from 'lucide-react';
import { DocItem } from '../types';

interface RawDocViewerProps {
  document: DocItem;
}

export const RawDocViewer: React.FC<RawDocViewerProps> = ({ document }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const text = document.rawText || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const occurrences =
    searchTerm.trim().length > 1
      ? (text.match(new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
      : 0;

  return (
    <div className="space-y-4">
      {/* Search & Stats Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{document.fileName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Hash className="w-3.5 h-3.5" />
            <span>{document.wordCount.toLocaleString()} words</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{document.readingTimeMinutes} min original read</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search inside text */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in text..."
              className="pl-8 pr-12 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-400 focus:outline-none text-slate-800 dark:text-slate-200 w-44 sm:w-56"
            />
            {searchTerm && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-600">
                {occurrences} found
              </span>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Raw</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Raw Text Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs max-h-[600px] overflow-y-auto">
        <pre className="font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed select-text font-normal">
          {text}
        </pre>
      </div>
    </div>
  );
};
