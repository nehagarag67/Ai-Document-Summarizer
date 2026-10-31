import React from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Sun,
  Moon,
  FolderOpen,
  User as UserIcon,
  Crown,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { User, DocItem } from '../types';

interface NavbarProps {
  user: User | null;
  onOpenUpload: () => void;
  onOpenProfile: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeDoc: DocItem | null;
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenLibrary: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenUpload,
  onOpenProfile,
  onToggleSidebar,
  isSidebarOpen,
  searchQuery,
  onSearchChange,
  activeDoc,
  currentTheme,
  onToggleTheme,
  onOpenLibrary,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-purple-100 dark:border-purple-950/60 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Brand + Mobile menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors md:hidden"
          title="Toggle Navigation"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div
          onClick={onOpenLibrary}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 dark:from-purple-300 dark:via-indigo-300 dark:to-purple-200 bg-clip-text text-transparent">
                SummaMind
              </span>
              <span className="text-xs px-1.5 py-0.5 font-bold tracking-wider rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-1 font-medium">
              Intelligent Document Synthesis
            </span>
          </div>
        </div>

        {activeDoc && (
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800 ml-2">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
              {activeDoc.title}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {activeDoc.fileType.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Middle: Document Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents, topics, or keywords..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-purple-400 dark:focus:border-purple-600 rounded-xl outline-none transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right side: Actions, Theme, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-98 rounded-xl shadow-md shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Summarize Document</span>
          <span className="sm:hidden">Upload</span>
        </button>

        {/* Library quick view button */}
        <button
          onClick={onOpenLibrary}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors cursor-pointer"
          title="Document Library"
        >
          <FolderOpen className="w-5 h-5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors cursor-pointer"
          title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {currentTheme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* User profile avatar */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-slate-800/80 transition-all cursor-pointer"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-purple-300 dark:ring-purple-700"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[90px] truncate leading-tight">
              {user?.name || 'Account'}
            </span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5" />
              PRO
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
