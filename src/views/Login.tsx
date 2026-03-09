import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Printer, Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(username, password);
    if (!success) {
      setError(t('authError'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex w-16 h-16 bg-emerald-500 rounded-2xl items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <Printer size={32} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              CompServ<span className="text-emerald-500">Pro</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              {t('welcomeBack')}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-medium animate-shake">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                {t('username')}
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-zinc-900 dark:text-white transition-all"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  {t('password')}
                </label>
                <button type="button" className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                  {t('forgotPassword')}
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-zinc-900 dark:text-white transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500 transition-all" />
              <label htmlFor="remember" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer">
                {t('rememberMe')}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('signIn')
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
          {language === 'en' ? 'Default login: admin / admin123' : 'ডিফল্ট লগইন: admin / admin123'}
        </p>
      </div>
    </div>
  );
}
