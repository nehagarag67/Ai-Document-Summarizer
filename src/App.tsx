/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  MessageSquare,
  KeyRound,
  FileCode,
  Upload,
  Download,
  Share2,
  Check,
  Star,
  Trash2,
  Clock,
  Layers,
  ArrowRight,
  BookOpen,
  Plus
} from 'lucide-react';

import { DocItem, User } from './types';
import { api } from './lib/api';
import { exportDocumentToPdf } from './lib/pdfExport';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { UploadModal } from './components/UploadModal';
import { SummaryViewer } from './components/SummaryViewer';
import { KeyPointsViewer } from './components/KeyPointsViewer';
import { DocumentChat } from './components/DocumentChat';
import { RawDocViewer } from './components/RawDocViewer';
import { DocumentHistory } from './components/DocumentHistory';
import { UserProfileModal } from './components/UserProfileModal';

export default function App() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [viewMode, setViewMode] = useState<'workspace' | 'library'>('workspace');
  const [activeTab, setActiveTab] = useState<'summary' | 'keypoints' | 'chat' | 'raw'>('summary');
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'favorites'>('all');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme management (default: light with crisp purple SaaS styling, togglable to dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('summamind_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('summamind_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load initial data
  useEffect(() => {
    async function init() {
      try {
        const { user: currentUser } = await api.getCurrentUser();
        setUser(currentUser);

        const docs = await api.getDocuments();
        setDocuments(docs);
        if (docs.length > 0) {
          setActiveDocId(docs[0].id);
        }
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      }
    }
    init();
  }, []);

  const activeDoc = documents.find((d) => d.id === activeDocId) || null;

  const handleDocumentCreated = (newDoc: DocItem) => {
    setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
    setActiveDocId(newDoc.id);
    setViewMode('workspace');
    setActiveTab('summary');
  };

  const handleDocumentUpdated = (updatedDoc: DocItem) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
    );
  };

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document analysis?')) return;
    try {
      await api.deleteDocument(id);
      const remaining = documents.filter((d) => d.id !== id);
      setDocuments(remaining);
      if (activeDocId === id) {
        setActiveDocId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await api.toggleFavorite(id);
      handleDocumentUpdated(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim() && viewMode !== 'library') {
            setViewMode('library');
          }
        }}
        activeDoc={activeDoc}
        currentTheme={theme}
        onToggleTheme={toggleTheme}
        onOpenLibrary={() => setViewMode('library')}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          documents={documents}
          activeDocId={activeDocId}
          onSelectDoc={(id) => {
            setActiveDocId(id);
            setViewMode('workspace');
          }}
          onOpenUpload={() => setIsUploadOpen(true)}
          onDeleteDoc={handleDeleteDocument}
          onToggleFavorite={handleToggleFavorite}
          user={user}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          filterMode={sidebarFilter}
          onSetFilterMode={(mode) => setSidebarFilter(mode)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {viewMode === 'library' ? (
            <DocumentHistory
              documents={documents}
              onSelectDoc={(id) => {
                setActiveDocId(id);
                setViewMode('workspace');
              }}
              onOpenUpload={() => setIsUploadOpen(true)}
              onDeleteDoc={handleDeleteDocument}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : activeDoc ? (
            <div className="space-y-6">
              {/* Document Overview Header */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {(activeDoc.fileType || 'txt').toUpperCase()} DOCUMENT
                    </span>
                    <span className="text-xs text-slate-400">
                      Added {new Date(activeDoc.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {activeDoc.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{activeDoc.fileName}</span>
                    <span>•</span>
                    <span>{activeDoc.wordCount.toLocaleString()} words</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {activeDoc.readingTimeMinutes} min original read
                    </span>
                  </div>
                </div>

                {/* Quick Header Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleFavorite(activeDoc.id, e)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                    title={activeDoc.isFavorite ? 'Remove star' : 'Star document'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        activeDoc.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => exportDocumentToPdf(activeDoc)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/70 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New File</span>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-purple-100 dark:border-purple-900/60 gap-2 sm:gap-4 overflow-x-auto pb-px">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    activeTab === 'summary'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Summary Studio</span>
                </button>

                <button
                  onClick={() => setActiveTab('keypoints')}
                  className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    activeTab === 'keypoints'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Key Intelligence</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    activeTab === 'chat'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>AI Document Chat</span>
                  {activeDoc.chatMessages?.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold">
                      {activeDoc.chatMessages.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('raw')}
                  className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    activeTab === 'raw'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>Source Text</span>
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'summary' ? (
                <SummaryViewer
                  document={activeDoc}
                  onDocumentUpdated={handleDocumentUpdated}
                />
              ) : activeTab === 'keypoints' ? (
                <KeyPointsViewer
                  document={activeDoc}
                  onDocumentUpdated={handleDocumentUpdated}
                />
              ) : activeTab === 'chat' ? (
                <DocumentChat
                  document={activeDoc}
                  user={user}
                  onDocumentUpdated={handleDocumentUpdated}
                />
              ) : (
                <RawDocViewer document={activeDoc} />
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="py-20 text-center max-w-lg mx-auto space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-purple-600/25">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Welcome to SummaMind AI
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Transform lengthy PDFs, Word documents, research papers, and meeting notes into razor-sharp executive briefs, actionable takeaways, and interactive Q&A.
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload First Document</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Upload & Paste Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentCreated={handleDocumentCreated}
      />

      {/* User Profile & Auth Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUserUpdated={(u) => setUser(u)}
      />
    </div>
  );
}
