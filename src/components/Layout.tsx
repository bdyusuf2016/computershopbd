import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Sun, Moon, Languages, LogOut, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 -ml-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{t('systemTitle')}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors flex items-center gap-2"
                title={language === 'en' ? 'Switch to Bengali' : 'Switch to English'}
              >
                <Languages size={20} />
                <span className="text-sm font-bold uppercase">{language}</span>
              </button>
              
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>

            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{user?.fullName}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">{user?.role === 'admin' ? t('superAdmin') : 'Staff'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                <img src={user?.avatar || "https://picsum.photos/seed/admin/40/40"} alt="Admin" referrerPolicy="no-referrer" />
              </div>
              <button 
                onClick={logout}
                className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                title={t('logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
