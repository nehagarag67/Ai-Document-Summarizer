import React from 'react';
import {
  FileText,
  Clock,
  Star,
  Trash2,
  TrendingUp,
  Zap,
  BookOpen,
  Plus,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { DocItem, User } from '../types';

interface SidebarProps {
  documents: DocItem[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onOpenUpload: () => void;
  onDeleteDoc: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  filterMode: 'all' | 'favorites';
  onSetFilterMode: (mode: 'all' | 'favorites') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  activeDocId,
  onSelectDoc,
  onOpenUpload,
  onDeleteDoc,
  onToggleFavorite,
  user,
  isOpen,
  onClose,
  filterMode,
  onSetFilterMode,
}) => {
  const filteredDocs =
    filterMode === 'favorites' ? documents.filter((d) => d.isFavorite) : documents;

  const totalTimeSaved = user?.stats?.timeSavedMinutes
    ? (user.stats.timeSavedMinutes / 60).toFixed(1)
    : '3.2';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-72 bg-white dark:bg-slate-900 border-r border-purple-100 dark:border-purple-950/60 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Quick Action Button */}
          <button
            onClick={() => {
              onOpenUpload();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-semibold text-xs sm:text-sm transition-all group cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:rotate-90 transition-transform" />
            <span>Upload or Paste Document</span>
          </button>

          {/* Navigation Filter Tabs */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 pb-1">
              Workspace Library
            </div>
            <button
              onClick={() => onSetFilterMode('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>All Documents</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  filterMode === 'all'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => onSetFilterMode('favorites')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filterMode === 'favorites'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Starred Briefs</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  filterMode === 'favorites'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {documents.filter((d) => d.isFavorite).length}
              </span>
            </button>
          </div>

          {/* Recent Documents Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>{filterMode === 'favorites' ? 'Starred Documents' : 'Recent Documents'}</span>
              <span>{filteredDocs.length}</span>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="px-3 py-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p>No documents found.</p>
                <button
                  onClick={onOpenUpload}
                  className="mt-2 text-purple-600 dark:text-purple-400 font-semibold underline hover:text-purple-700"
                >
                  Upload your first file
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[calc(100vh-28rem)] overflow-y-auto pr-1">
                {filteredDocs.map((doc) => {
                  const isActive = doc.id === activeDocId;
                  const ext = (doc.fileType || 'txt').toUpperCase();

                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        onSelectDoc(doc.id);
                        onClose();
                      }}
                      className={`group relative flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700/80 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-extrabold ${
                            ext === 'PDF'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300'
                              : ext === 'DOCX'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300'
                          }`}
                        >
                          {ext}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-semibold truncate leading-tight ${
                              isActive
                                ? 'text-purple-950 dark:text-purple-200'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {doc.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                            <span>{doc.wordCount.toLocaleString()} words</span>
                            <span>•</span>
                            <span>{doc.readingTimeMinutes}m read</span>
                          </div>
                        </div>
                      </div>

                      {/* Hover action icons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => onToggleFavorite(doc.id, e)}
                          className="p-1 text-slate-400 hover:text-amber-500 rounded transition-colors"
                          title={doc.isFavorite ? 'Unstar' : 'Star'}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => onDeleteDoc(doc.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Always show star if starred */}
                      {doc.isFavorite && (
                        <div className="absolute right-2 top-2 group-hover:hidden">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Productivity Widget */}
        <div className="p-4 border-t border-purple-100 dark:border-purple-950/60 bg-gradient-to-b from-transparent to-purple-50/50 dark:to-purple-950/20">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900/40 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Productivity Impact
              </span>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                PRO ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-purple-50/70 dark:bg-purple-950/30">
                <span className="block text-sm font-extrabold text-purple-700 dark:text-purple-300">
                  {totalTimeSaved}h
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Time Saved
                </span>
              </div>
              <div className="p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30">
                <span className="block text-sm font-extrabold text-indigo-700 dark:text-indigo-300">
                  {user?.stats?.wordsAnalyzed
                    ? (user.stats.wordsAnalyzed / 1000).toFixed(0) + 'k'
                    : '15k'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Words Read
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
