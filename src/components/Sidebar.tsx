import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Globe, 
  Package, 
  Wallet, 
  BarChart3, 
  Settings,
  Briefcase,
  Printer,
  ShieldCheck,
  Lock,
  Tag,
  Scale
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { DEFAULT_SHOP_INFO, SHOP_INFO_STORAGE_KEY } from '../constants';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const { t } = useLanguage();
  const { logout, hasPermission } = useAuth();
  const [shopName, setShopName] = useState(() => {
    const saved = localStorage.getItem(SHOP_INFO_STORAGE_KEY);
    if (!saved) return DEFAULT_SHOP_INFO.name;
    try {
      const parsed = JSON.parse(saved) as { name?: string };
      return parsed.name?.trim() || DEFAULT_SHOP_INFO.name;
    } catch {
      return DEFAULT_SHOP_INFO.name;
    }
  });

  useEffect(() => {
    const onShopInfoUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ name?: string }>;
      const updatedName = customEvent.detail?.name?.trim();
      if (updatedName) {
        setShopName(updatedName);
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== SHOP_INFO_STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as { name?: string };
        const updatedName = parsed.name?.trim();
        if (updatedName) {
          setShopName(updatedName);
        }
      } catch {
        // ignore malformed data
      }
    };

    window.addEventListener('shop-info-updated', onShopInfoUpdated as EventListener);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('shop-info-updated', onShopInfoUpdated as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const loadShopInfo = async () => {
      const { data, error } = await supabase.from('shop_settings').select('name').eq('id', 'default').maybeSingle();
      if (error || !data?.name) return;
      setShopName(data.name);
    };
    loadShopInfo();
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/', permission: '*' },
    { icon: ShieldCheck, label: t('userManagement'), path: '/users', permission: 'users:read' },
    { icon: Lock, label: t('permissionManagement'), path: '/permissions', permission: 'users:write' },
    { icon: Users, label: t('customers'), path: '/customers', permission: 'customers:read' },
    { icon: Receipt, label: t('billing'), path: '/billing', permission: 'billing:read' },
    { icon: Globe, label: t('onlineServices'), path: '/online-services', permission: 'online:read' },
    { icon: Package, label: t('inventory'), path: '/inventory', permission: 'inventory:read' },
    { icon: Tag, label: t('categories'), path: '/categories', permission: 'inventory:write' },
    { icon: Scale, label: t('units'), path: '/units', permission: 'inventory:write' },
    { icon: Wallet, label: t('finance'), path: '/finance', permission: 'finance:read' },
    { icon: BarChart3, label: t('reports'), path: '/reports', permission: 'reports:read' },
    { icon: Briefcase, label: t('jobApplications'), path: '/job-applications', permission: '*' },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.permission === '*' || hasPermission(item.permission)
  );

  return (
    <aside className={cn(
      "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 flex flex-col h-screen sticky top-0 border-r border-zinc-200 dark:border-zinc-900 transition-all duration-300 ease-in-out overflow-hidden",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "p-6 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-900 h-16 shrink-0",
        isCollapsed && "justify-center px-0"
      )}>
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0">
          <Printer size={20} strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-zinc-900 dark:white tracking-tight truncate">
            {shopName}
          </h1>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
              isActive 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 font-medium" 
                : "hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200",
              isCollapsed && "justify-center px-0"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-colors shrink-0",
              "group-hover:text-emerald-500"
            )} />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 space-y-1 shrink-0">
        <NavLink
          to="/settings"
          title={isCollapsed ? t('settingsTitle') : undefined}
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
            isActive 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 font-medium" 
              : "hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Settings size={20} className="group-hover:text-emerald-500 transition-colors shrink-0" />
          {!isCollapsed && <span className="truncate">{t('settingsTitle')}</span>}
        </NavLink>
        
        <button
          onClick={logout}
          title={isCollapsed ? t('logout') : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all group",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform shrink-0" />
          {!isCollapsed && <span className="truncate">{t('logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
