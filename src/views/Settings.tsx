import React, { useEffect, useState } from 'react';
import { Save, Store, User, Shield, Database, Globe, Moon, Sun, Settings as SettingsIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  DEFAULT_INVOICE_TEMPLATE,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_SHOP_INFO,
  INVOICE_TEMPLATE_STORAGE_KEY,
  PAYMENT_METHODS_STORAGE_KEY,
  SHOP_INFO_STORAGE_KEY,
} from '../constants';

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme, fontSize, setFontSize } = useTheme();
  
  const [shopInfo, setShopInfo] = useState(() => {
    const saved = localStorage.getItem(SHOP_INFO_STORAGE_KEY);
    if (!saved) return DEFAULT_SHOP_INFO;
    try {
      return { ...DEFAULT_SHOP_INFO, ...(JSON.parse(saved) as Partial<typeof DEFAULT_SHOP_INFO>) };
    } catch {
      return DEFAULT_SHOP_INFO;
    }
  });
  const [invoiceTemplate, setInvoiceTemplate] = useState(() => {
    const saved = localStorage.getItem(INVOICE_TEMPLATE_STORAGE_KEY);
    if (!saved) return DEFAULT_INVOICE_TEMPLATE;
    try {
      return { ...DEFAULT_INVOICE_TEMPLATE, ...(JSON.parse(saved) as Partial<typeof DEFAULT_INVOICE_TEMPLATE>) };
    } catch {
      return DEFAULT_INVOICE_TEMPLATE;
    }
  });
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<string[]>(() => {
    const saved = localStorage.getItem(PAYMENT_METHODS_STORAGE_KEY);
    if (!saved) return DEFAULT_PAYMENT_METHODS;
    try {
      const parsed = JSON.parse(saved) as string[];
      const methods = Array.isArray(parsed) ? parsed.filter((m) => typeof m === 'string' && m.trim().length > 0) : [];
      return methods.length > 0 ? methods : DEFAULT_PAYMENT_METHODS;
    } catch {
      return DEFAULT_PAYMENT_METHODS;
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadShopInfo = async () => {
      const { data, error } = await supabase.from('shop_settings').select('*').eq('id', 'default').maybeSingle();
      if (error || !data) return;

      const next = {
        name: data.name || DEFAULT_SHOP_INFO.name,
        owner: data.owner || DEFAULT_SHOP_INFO.owner,
        address: data.address || DEFAULT_SHOP_INFO.address,
        mobile: data.mobile || DEFAULT_SHOP_INFO.mobile,
        email: data.email || DEFAULT_SHOP_INFO.email,
      };
      setShopInfo(next);
      localStorage.setItem(SHOP_INFO_STORAGE_KEY, JSON.stringify(next));
    };

    loadShopInfo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    localStorage.setItem(SHOP_INFO_STORAGE_KEY, JSON.stringify(shopInfo));
    localStorage.setItem(INVOICE_TEMPLATE_STORAGE_KEY, JSON.stringify(invoiceTemplate));
    localStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(paymentMethods));
    const { error } = await supabase.from('shop_settings').upsert(
      {
        id: 'default',
        name: shopInfo.name,
        owner: shopInfo.owner,
        address: shopInfo.address,
        mobile: shopInfo.mobile,
        email: shopInfo.email,
      },
      { onConflict: 'id' },
    );

    if (error) {
      alert(language === 'bn' ? 'ডাটাবেজে Shop Information সেভ করা যায়নি।' : 'Failed to save shop information to database.');
      setIsSaving(false);
      return;
    }
    alert(language === 'bn' ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings saved successfully!');
    setIsSaving(false);
  };
  const addPaymentMethod = () => {
    const method = newPaymentMethod.trim();
    if (!method) return;
    if (paymentMethods.some((m) => m.toLowerCase() === method.toLowerCase())) return;
    setPaymentMethods((prev) => [...prev, method]);
    setNewPaymentMethod('');
  };

  const removePaymentMethod = (method: string) => {
    if (paymentMethods.length <= 1) return;
    setPaymentMethods((prev) => prev.filter((m) => m !== method));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('settingsTitle')}</h1>
        <p className="text-zinc-500 dark:text-zinc-400">{t('settingsDesc')}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Shop Information */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Globe size={20} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('shopInfo')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('shopName')}</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                value={shopInfo.name}
                onChange={(e) => setShopInfo({...shopInfo, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('ownerName')}</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                value={shopInfo.owner}
                onChange={(e) => setShopInfo({...shopInfo, owner: e.target.value})}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('shopAddress')}</label>
              <textarea 
                rows={2}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                value={shopInfo.address}
                onChange={(e) => setShopInfo({...shopInfo, address: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('shopMobile')}</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                value={shopInfo.mobile}
                onChange={(e) => setShopInfo({...shopInfo, mobile: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('shopEmail')}</label>
              <input 
                type="email" 
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                value={shopInfo.email}
                onChange={(e) => setShopInfo({...shopInfo, email: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Invoice Template */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Store size={20} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Invoice Template</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Invoice Heading</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                value={invoiceTemplate.heading}
                onChange={(e) => setInvoiceTemplate({ ...invoiceTemplate, heading: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Footer Line 1</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                value={invoiceTemplate.footerLine1}
                onChange={(e) => setInvoiceTemplate({ ...invoiceTemplate, footerLine1: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Footer Line 2</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                value={invoiceTemplate.footerLine2}
                onChange={(e) => setInvoiceTemplate({ ...invoiceTemplate, footerLine2: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg">
              <SettingsIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('systemPreferences')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{t('defaultLanguage')}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{language === 'en' ? 'English' : 'বাংলা'}</p>
              </div>
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${language === 'en' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500'}`}
                >
                  EN
                </button>
                <button 
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${language === 'bn' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500'}`}
                >
                  BN
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{t('themeMode')}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{theme === 'dark' ? 'Dark' : 'Light'}</p>
              </div>
              <button 
                type="button"
                onClick={toggleTheme}
                className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between md:col-span-2 border-t border-zinc-100 dark:border-zinc-800 pt-6">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">ফন্ট সাইজ (Font Size)</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">সিস্টেমের লেখার আকার পরিবর্তন করুন</p>
              </div>
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                {(['sm', 'base', 'lg'] as const).map((size) => (
                  <button 
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${fontSize === size ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500'}`}
                  >
                    {size === 'sm' ? 'ছোট' : size === 'lg' ? 'বড়' : 'স্বাভাবিক'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Payment Methods */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Store size={20} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Payment Methods</h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
              placeholder="Add payment method"
              className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={addPaymentMethod}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <div key={method} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm">
                <span className="text-zinc-800 dark:text-zinc-200">{method}</span>
                <button
                  type="button"
                  onClick={() => removePaymentMethod(method)}
                  className="text-rose-600 hover:text-rose-700 disabled:opacity-40"
                  disabled={paymentMethods.length <= 1}
                  title={paymentMethods.length <= 1 ? 'At least one method is required' : 'Remove method'}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Backup & Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-lg">
                <Database size={20} />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{t('backupData')}</h3>
            </div>
            <button type="button" className="w-full py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors">
              {t('exportData')}
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-lg">
                <Shield size={20} />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{t('securitySettings')}</h3>
            </div>
            <button type="button" className="w-full py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors">
              {t('changePassword')}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Save size={20} />
            {isSaving ? `${t('save')}...` : t('saveSettings')}
          </button>
        </div>
      </form>
    </div>
  );
}





