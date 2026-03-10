import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';
import TableActionBar from '../components/TableActionBar';

export default function Finance() {
  const { t } = useLanguage();
  const location = useLocation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: 0,
    type: 'income',
    description: '',
    category: 'service'
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('section') !== 'transactions-table') return;

    const timer = window.setTimeout(() => {
      document.getElementById('transactions-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [location.search]);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setTransactions(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('transactions').insert([formData]);
    if (!error) {
      setShowModal(false);
      fetchTransactions();
      setFormData({ amount: 0, type: 'income', description: '', category: 'service' });
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const filteredTransactions =
    typeFilter === 'all' ? transactions : transactions.filter((tx) => tx.type === typeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('financeTitle')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('financeDesc')}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          {t('addTransaction')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{t('totalIncome')}</p>
          <h3 className="text-2xl font-bold text-emerald-600">৳ {totalIncome.toFixed(2)}</h3>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{t('totalExpense')}</p>
          <h3 className="text-2xl font-bold text-rose-600">৳ {totalExpense.toFixed(2)}</h3>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{t('netBalance')}</p>
          <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-rose-600'}`}>
            ৳ {balance.toFixed(2)}
          </h3>
        </div>
      </div>

      <div id="transactions-table" className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-200">
        <TableActionBar onFilter={() => setShowFilters((prev) => !prev)} filterActive={showFilters} />
        {showFilters && (
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-2 text-sm font-semibold ${typeFilter === 'all' ? 'bg-emerald-500 text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('income')}
                className={`px-3 py-2 text-sm font-semibold ${typeFilter === 'income' ? 'bg-emerald-500 text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}
              >
                {t('income')}
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('expense')}
                className={`px-3 py-2 text-sm font-semibold ${typeFilter === 'expense' ? 'bg-emerald-500 text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}
              >
                {t('expense')}
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">{t('date')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">{t('description')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">{t('category')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif text-right">{t('amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">{t('loading')}</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">{t('noTransactions')}</td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {format(new Date(t.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{t.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase">
                        {t.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'} ৳ {t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-zinc-200 dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('addTransaction')}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'income'})}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${formData.type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                >
                  {t('income')}
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'expense'})}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${formData.type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                >
                  {t('expense')}
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('amount')} *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">৳</span>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('description')} *</label>
                <input 
                  required
                  type="text" 
                  placeholder={t('description')}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('category')}</label>
                <input 
                  type="text" 
                  placeholder={t('category')}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
