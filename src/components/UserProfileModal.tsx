import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Crown,
  Sparkles,
  Clock,
  BookOpen,
  CheckCircle2,
  Zap,
  LogOut,
  Mail,
  Shield,
  ArrowRight
} from 'lucide-react';
import { User } from '../types';
import { api } from '../lib/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: (u: User) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}) => {
  const [authMode, setAuthMode] = useState<'profile' | 'switch' | 'register'>('profile');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.login(email, name);
      onUserUpdated(res.user);
      setAuthMode('profile');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.register(email, name);
      onUserUpdated(res.user);
      setAuthMode('profile');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSavedHours = user?.stats?.timeSavedMinutes
    ? (user.stats.timeSavedMinutes / 60).toFixed(1)
    : '3.4';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {authMode === 'profile'
                ? 'SaaS Account & Usage'
                : authMode === 'switch'
                ? 'Sign In / Switch Account'
                : 'Create Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {authMode === 'profile' ? (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                  }
                  alt={user?.name || 'User'}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-400 dark:ring-purple-600 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {user?.name || 'Alex Chen'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-600 text-white shadow-xs">
                      PRO PLAN
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user?.email || 'alex.chen@innovate.ai'}
                  </p>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Unlimited Gemini 2.5 Flash Processing
                  </p>
                </div>
              </div>

              {/* Real-time Usage Metrics */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Lifetime Value & Efficiency
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="block text-xl font-black text-purple-600 dark:text-purple-400">
                      {timeSavedHours}h
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Reading Time Saved
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {user?.stats?.wordsAnalyzed
                        ? (user.stats.wordsAnalyzed / 1000).toFixed(0) + 'k'
                        : '15k'}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Words Synthesized
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {user?.stats?.docsProcessed || 8}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Documents Processed
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="block text-xl font-black text-amber-600 dark:text-amber-400">
                      {user?.stats?.summariesGenerated || 14}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Summaries Generated
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setAuthMode('switch')}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Switch User / Log In</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : authMode === 'switch' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Chen"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="hover:text-purple-600 underline cursor-pointer"
                >
                  Create new account
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('profile')}
                  className="hover:text-purple-600 underline cursor-pointer"
                >
                  Back to Profile
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@innovate.ai"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? 'Creating Profile...' : 'Register Account'}
              </button>

              <div className="text-center text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('switch')}
                  className="hover:text-purple-600 underline cursor-pointer"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
