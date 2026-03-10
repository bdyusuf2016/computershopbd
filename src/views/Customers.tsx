import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, UserPlus, MoreVertical, Edit2, Trash2, History, Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Customer } from '../types';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';
import TableActionBar from '../components/TableActionBar';

export default function Customers() {
  const { t } = useLanguage();
  const location = useLocation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('section') !== 'customers-table') return;

    const timer = window.setTimeout(() => {
      document.getElementById('customers-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [location.search]);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setCustomers(data);
    }
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) {
      fetchCustomers();
      return;
    }
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${searchQuery}%,mobile.ilike.%${searchQuery}%`);
    
    if (!error && data) {
      setCustomers(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      const { error } = await supabase
        .from('customers')
        .update(formData)
        .eq('id', editingCustomer.id);
      if (!error) {
        setShowForm(false);
        setEditingCustomer(null);
        setFormData({ name: '', mobile: '', email: '', address: '' });
        fetchCustomers();
      }
    } else {
      const { error } = await supabase
        .from('customers')
        .insert([formData]);
      if (!error) {
        setShowForm(false);
        setEditingCustomer(null);
        setFormData({ name: '', mobile: '', email: '', address: '' });
        fetchCustomers();
      }
    }
  };

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email || '',
      address: customer.address || ''
    });
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingCustomer(null);
    setFormData({ name: '', mobile: '', email: '', address: '' });
    setShowForm(true);
  };

  const deleteCustomer = async (id: string) => {
    if (confirm(t('confirmDelete'))) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (!error) fetchCustomers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('customersTitle')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('customersDesc')}</p>
        </div>
        <button 
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <UserPlus size={20} />
          {t('addCustomer')}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 dark:text-zinc-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-200">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {editingCustomer ? t('editCustomer') : t('addCustomer')}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('fullName')}</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('mobileNumber')}</label>
              <input
                required
                type="tel"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('emailAddress')}</label>
              <input
                type="email"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('address')}</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCustomer(null);
                  setFormData({ name: '', mobile: '', email: '', address: '' });
                }}
                className="px-4 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm"
              >
                {editingCustomer ? t('update') : t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div id="customers-table" className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-200">
        <TableActionBar onFilter={() => setShowFilters((prev) => !prev)} filterActive={showFilters} printTargetId="customers-table-data" />
        <div id="customers-table-data" className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-bottom border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">{t('customer')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">{t('contact')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">{t('address')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">{t('joinDate')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">{t('loading')}</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">{t('noTransactions')}</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 flex items-center justify-center font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                          <Phone size={14} />
                          {customer.mobile}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
                            <Mail size={14} />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                        <MapPin size={14} className="shrink-0" />
                        <span className="truncate max-w-[200px]">{customer.address || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {format(new Date(customer.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditForm(customer)}
                          className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                          title={t('edit')}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                          title={t('history')}
                        >
                          <History size={18} />
                        </button>
                        <button 
                          onClick={() => deleteCustomer(customer.id)}
                          className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                          title={t('delete')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
