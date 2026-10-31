import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  Star,
  Trash2,
  Download,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  BookOpen,
  FolderOpen
} from 'lucide-react';
import { DocItem } from '../types';
import { exportDocumentToPdf } from '../lib/pdfExport';

interface DocumentHistoryProps {
  documents: DocItem[];
  onSelectDoc: (id: string) => void;
  onOpenUpload: () => void;
  onDeleteDoc: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const DocumentHistory: React.FC<DocumentHistoryProps> = ({
  documents,
  onSelectDoc,
  onOpenUpload,
  onDeleteDoc,
  onToggleFavorite,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'words' | 'title'>('date');

  const filtered = documents
    .filter((doc) => {
      const matchSearch =
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(search.toLowerCase()) ||
        doc.rawText.toLowerCase().includes(search.toLowerCase());

      const matchType =
        filterType === 'all'
          ? true
          : filterType === 'favorites'
          ? doc.isFavorite
          : doc.fileType === filterType;

      return matchSearch && matchType;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'words') {
        return b.wordCount - a.wordCount;
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Document Synthesis Library</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, re-open, and export your archived document analyses
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Document</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by name, topic, or text..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {['all', 'favorites', 'pdf', 'docx', 'txt'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600'
              }`}
            >
              {t === 'favorites' ? 'Starred' : t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-1 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
          >
            <option value="date">Most Recent</option>
            <option value="words">Word Count</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Grid of Documents */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No matching documents found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try tweaking your search filters or upload a new PDF or DOCX file to begin.
          </p>
          <button
            onClick={onOpenUpload}
            className="mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Upload a document now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const ext = (doc.fileType || 'txt').toUpperCase();
            const format = doc.currentSummaryFormat || 'executive';
            const summarySnippet =
              doc.summaries?.[format]?.content
                ?.replace(/^#+\s+/gm, '')
                ?.replace(/\*\*/g, '')
                ?.slice(0, 160) || 'Brief analysis generated.';

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className="group relative p-5 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 hover:border-purple-400 dark:hover:border-purple-600 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          ext === 'PDF'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300'
                            : ext === 'DOCX'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300'
                        }`}
                      >
                        {ext}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                          {format.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => onToggleFavorite(doc.id, e)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition-colors"
                        title={doc.isFavorite ? 'Unstar' : 'Star'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>
                      <button
                        onClick={(e) => onDeleteDoc(doc.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Preview */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {summarySnippet}...
                  </p>
                </div>

                {/* Footer Details */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>{doc.wordCount.toLocaleString()} words</span>
                    <span>•</span>
                    <span>{doc.readingTimeMinutes}m read</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportDocumentToPdf(doc);
                      }}
                      className="p-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      title="Export PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
