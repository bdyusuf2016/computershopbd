import React, { useState, useEffect } from 'react';
import { Globe, Search, ExternalLink, Clock, CheckCircle2, AlertCircle, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OnlineService, Customer } from '../types';
import { ONLINE_SERVICE_STATUSES } from '../constants';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';

export default function OnlineServices() {
  const { t } = useLanguage();
  const [services, setServices] = useState<OnlineService[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    customer_id: '',
    service_name: '',
    application_id: '',
    status: 'pending',
    customer_link: '',
    notes: ''
  });

  useEffect(() => {
    fetchServices();
    fetchCustomers();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('online_services')
      .select('*, customers(*)')
      .order('created_at', { ascending: false });
    if (!error && data) setServices(data);
    setLoading(false);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('*').order('name');
    if (data) setCustomers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('online_services').insert([formData]);
    if (!error) {
      fetchServices();
      setFormData({ customer_id: '', service_name: '', application_id: '', status: 'pending', customer_link: '', notes: '' });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('online_services').update({ status }).eq('id', id);
    if (!error) fetchServices();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'failed': return <AlertCircle size={16} className="text-rose-500" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  const filteredServices = services.filter((service) => {
    const customerName = service.customers?.name?.toLowerCase() || '';
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      service.service_name.toLowerCase().includes(query) ||
      (service.application_id || '').toLowerCase().includes(query) ||
      (service.status || '').toLowerCase().includes(query) ||
      customerName.includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('onlineServicesTitle')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('onlineServicesDesc')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-3 transition-colors duration-200">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-2 items-center">
          <select
            required
            className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
          >
            <option value="">{t('selectCustomer')}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.mobile})
              </option>
            ))}
          </select>
          <input
            required
            type="text"
            placeholder={t('serviceName')}
            className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
            value={formData.service_name}
            onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
          />
          <input
            type="text"
            placeholder={t('appId')}
            className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
            value={formData.application_id}
            onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
          />
          <input
            type="url"
            placeholder={t('customerLink')}
            className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
            value={formData.customer_link}
            onChange={(e) => setFormData({ ...formData, customer_link: e.target.value })}
          />
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search service/app/status/customer"
              className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 xl:justify-end">
            <button
              type="button"
              onClick={() =>
                setFormData({ customer_id: '', service_name: '', application_id: '', status: 'pending', customer_link: '', notes: '' })
              }
              className="px-3 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-xl"
            >
              {t('reset')}
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-zinc-500 dark:text-zinc-400">{t('loading')}</div>
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500 dark:text-zinc-400">{t('noTransactions')}</div>
        ) : (
          filteredServices.map((service) => (
            <div key={service.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{service.service_name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{format(new Date(service.created_at), 'MMM dd, h:mm a')}</p>
                  </div>
                </div>
                <div className="relative group/menu">
                  <button className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                    <MoreVertical size={18} />
                  </button>
                  <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-10 w-40 overflow-hidden">
                    {ONLINE_SERVICE_STATUSES.map(s => (
                      <button 
                        key={s.value}
                        onClick={() => updateStatus(service.id, s.value)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-zinc-700 dark:text-zinc-300"
                      >
                        {t('setStatus')} {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">{t('customer')}</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{service.customers?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">{t('appId')}</span>
                  <span className="font-mono text-zinc-600 dark:text-zinc-400">{service.application_id || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">{t('status')}</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 font-bold uppercase text-[10px] text-zinc-700 dark:text-zinc-300">
                    {getStatusIcon(service.status)}
                    {ONLINE_SERVICE_STATUSES.find(s => s.value === service.status)?.label || service.status}
                  </div>
                </div>
              </div>

              {service.customer_link && (
                <a 
                  href={service.customer_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition-colors"
                >
                  <ExternalLink size={14} />
                  {t('viewApplication')}
                </a>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
