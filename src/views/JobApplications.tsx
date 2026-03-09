
import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  CreditCard,
  Save,
  Link as LinkIcon,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { JobApplication } from '../types';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { DEFAULT_PAYMENT_METHODS, PAYMENT_METHODS_STORAGE_KEY } from '../constants';

type OfficeCodeItem = {
  id: string;
  code: string;
  name: string;
  url: string;
  created_at?: string;
};

const DEFAULT_OFFICES: OfficeCodeItem[] = [
  { id: 'oc-1', code: 'BR-01', name: 'Bangladesh Railway', url: 'https://railway.gov.bd' },
  { id: 'oc-2', code: 'PR-01', name: 'Primary Teacher Recruitment', url: 'https://dpe.gov.bd' },
];

const MOCK_APPLICATIONS: JobApplication[] = [
  {
    id: '1',
    office_code: 'BR-01',
    applicant_name: 'Abdur Rahman',
    user_id: 'rahman123',
    mobile_no: '01712345678',
    amount: 500,
    password: 'password123',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    office_code: 'PR-01',
    applicant_name: 'Fatima Khatun',
    user_id: 'fatima99',
    mobile_no: '01887654321',
    amount: 650,
    password: 'secretpassword',
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function JobApplications() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'application' | 'office'>('application');
  const [applications, setApplications] = useState<JobApplication[]>(MOCK_APPLICATIONS);
  const [officeCodes, setOfficeCodes] = useState<OfficeCodeItem[]>(DEFAULT_OFFICES);
  const [officeCodesLoading, setOfficeCodesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'paid'>('all');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingAppId, setPayingAppId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(DEFAULT_PAYMENT_METHODS);
  const [payForm, setPayForm] = useState({ amount: 0, payment_method: DEFAULT_PAYMENT_METHODS[0] || 'Cash' });

  const [formData, setFormData] = useState({
    office_code: DEFAULT_OFFICES[0]?.code || '',
    applicant_name: '',
    user_id: '',
    mobile_no: '',
    amount: 0,
    payment_method: '',
  });

  const [officeFormData, setOfficeFormData] = useState({ code: '', name: '', url: '' });

  useEffect(() => {
    fetchOfficeCodes();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(PAYMENT_METHODS_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as string[];
      const methods = Array.isArray(parsed) ? parsed.filter((m) => typeof m === 'string' && m.trim().length > 0) : [];
      if (methods.length > 0) {
        setPaymentMethods(methods);
        setPayForm((prev) => ({ ...prev, payment_method: methods[0] }));
      }
    } catch {
      setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    }
  }, []);

  const fetchOfficeCodes = async () => {
    setOfficeCodesLoading(true);
    const { data, error } = await supabase.from('office_codes').select('*').order('code', { ascending: true });

    if (!error && data && data.length > 0) {
      setOfficeCodes(data);
      setFormData((prev) => ({ ...prev, office_code: prev.office_code || data[0].code }));
    } else if (!error && data && data.length === 0) {
      // Keep default office list in UI when DB is empty.
      setOfficeCodes(DEFAULT_OFFICES);
      setFormData((prev) => ({ ...prev, office_code: prev.office_code || DEFAULT_OFFICES[0]?.code || '' }));
    } else {
      console.error('Failed to fetch office codes:', error);
      setOfficeCodes(DEFAULT_OFFICES);
      setFormData((prev) => ({ ...prev, office_code: prev.office_code || DEFAULT_OFFICES[0]?.code || '' }));
    }

    setOfficeCodesLoading(false);
  };

  useEffect(() => {
    if (officeCodes.length > 0) {
      setFormData((prev) => {
        if (prev.office_code && officeCodes.some((office) => office.code === prev.office_code)) {
          return prev;
        }
        return { ...prev, office_code: officeCodes[0].code };
      });
    } else {
      setFormData((prev) => ({ ...prev, office_code: '' }));
    }
  }, [officeCodes]);

  const officeMap = officeCodes.reduce<Record<string, OfficeCodeItem>>((acc, office) => {
    acc[office.code] = office;
    return acc;
  }, {});

  const filteredApps = applications.filter((app) => {
    const office = officeMap[app.office_code];
    const matchesSearch = (
      app.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.office_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      office?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.mobile_no.includes(searchQuery)
    );

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    const appDate = new Date(app.created_at);
    appDate.setHours(0, 0, 0, 0);

    const fromDate = rangeFrom ? new Date(`${rangeFrom}T00:00:00`) : null;
    const toDate = rangeTo ? new Date(`${rangeTo}T00:00:00`) : null;
    const matchesRange = (!fromDate || appDate >= fromDate) && (!toDate || appDate <= toDate);

    return matchesSearch && matchesStatus && matchesRange;
  });

  const applyTodayFilter = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const formatted = `${y}-${m}-${d}`;
    setRangeFrom(formatted);
    setRangeTo(formatted);
  };

  const resetForm = () => {
    setFormData({
      office_code: officeCodes[0]?.code || '',
      applicant_name: '',
      user_id: '',
      mobile_no: '',
      amount: 0,
      payment_method: '',
    });
    setEditingApp(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.office_code) return;

    if (editingApp) {
      setApplications((prev) => prev.map((app) => (app.id === editingApp.id ? { ...app, ...formData, updated_at: new Date().toISOString() } : app)));
    } else {
      setApplications((prev) => [
        {
          id: Math.random().toString(36).slice(2, 11),
          ...formData,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    resetForm();
  };

  const updateStatus = (id: string, status: 'pending' | 'completed' | 'paid') => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status, updated_at: new Date().toISOString() } : app)));
  };

  const openPayModal = (app: JobApplication) => {
    const latestMethodsRaw = localStorage.getItem(PAYMENT_METHODS_STORAGE_KEY);
    let latestMethods = paymentMethods;
    if (latestMethodsRaw) {
      try {
        const parsed = JSON.parse(latestMethodsRaw) as string[];
        const cleaned = Array.isArray(parsed) ? parsed.filter((m) => typeof m === 'string' && m.trim().length > 0) : [];
        if (cleaned.length > 0) {
          latestMethods = cleaned;
          setPaymentMethods(cleaned);
        }
      } catch {
        latestMethods = paymentMethods;
      }
    }
    setPayingAppId(app.id);
    setPayForm({
      amount: app.amount || 0,
      payment_method: app.payment_method || latestMethods[0] || DEFAULT_PAYMENT_METHODS[0] || 'Cash',
    });
    setShowPayModal(true);
  };

  const confirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingAppId) return;
    setApplications((prev) =>
      prev.map((app) =>
        app.id === payingAppId
          ? {
              ...app,
              amount: payForm.amount,
              payment_method: payForm.payment_method,
              status: 'paid',
              updated_at: new Date().toISOString(),
            }
          : app
      )
    );
    setShowPayModal(false);
    setPayingAppId(null);
  };

  const openEdit = (app: JobApplication) => {
    setActiveTab('application');
    setEditingApp(app);
    setFormData({
      office_code: app.office_code,
      applicant_name: app.applicant_name,
      user_id: app.user_id,
      mobile_no: app.mobile_no,
      amount: app.amount,
      payment_method: app.payment_method || '',
    });
  };

  const setPasswordForApp = (id: string) => {
    const password = window.prompt('Enter password');
    if (password === null) return;
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, password, updated_at: new Date().toISOString() } : app))
    );
  };

  const deleteApp = (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      setApplications((prev) => prev.filter((app) => app.id !== id));
    }
  };

  const resetOfficeForm = () => {
    setOfficeFormData({ code: '', name: '', url: '' });
    setEditingOfficeId(null);
  };

  const handleOfficeSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = officeFormData.code.trim().toUpperCase();
    const name = officeFormData.name.trim();
    const url = officeFormData.url.trim();
    if (!code || !name || !url) return;

    const duplicate = officeCodes.find((office) => office.code === code && office.id !== editingOfficeId);
    if (duplicate) {
      alert('Office code already exists.');
      return;
    }

    if (editingOfficeId) {
      const prevOffice = officeCodes.find((o) => o.id === editingOfficeId);
      const { error } = await supabase.from('office_codes').update({ code, name, url }).eq('id', editingOfficeId);
      if (error) {
        alert('Failed to update office code.');
        return;
      }

      setOfficeCodes((prev) => prev.map((o) => (o.id === editingOfficeId ? { ...o, code, name, url } : o)));
      if (prevOffice && prevOffice.code !== code) {
        setApplications((prev) => prev.map((app) => (app.office_code === prevOffice.code ? { ...app, office_code: code } : app)));
      }
    } else {
      const { data, error } = await supabase
        .from('office_codes')
        .insert([{ code, name, url }])
        .select('*')
        .single();

      if (error || !data) {
        alert('Failed to add office code.');
        return;
      }

      const newOffice: OfficeCodeItem = data;
      setOfficeCodes((prev) => [...prev, newOffice].sort((a, b) => a.code.localeCompare(b.code)));
      if (!formData.office_code) {
        setFormData((prev) => ({ ...prev, office_code: newOffice.code }));
      }
    }

    resetOfficeForm();
  };

  const editOffice = (office: OfficeCodeItem) => {
    setEditingOfficeId(office.id);
    setOfficeFormData({ code: office.code, name: office.name, url: office.url });
  };

  const deleteOffice = async (officeId: string) => {
    const office = officeCodes.find((o) => o.id === officeId);
    if (!office) return;
    if (applications.some((app) => app.office_code === office.code)) {
      alert('Office code is already used in applications.');
      return;
    }
    if (!window.confirm(t('confirmDelete'))) return;

    const { error } = await supabase.from('office_codes').delete().eq('id', officeId);
    if (error) {
      alert('Failed to delete office code.');
      return;
    }

    const remaining = officeCodes.filter((o) => o.id !== officeId);
    setOfficeCodes(remaining);
    setFormData((prev) => ({ ...prev, office_code: prev.office_code === office.code ? remaining[0]?.code || '' : prev.office_code }));
  };

  const officeOptions = [...officeCodes];
  if (formData.office_code && !officeOptions.some((o) => o.code === formData.office_code)) {
    officeOptions.unshift({ id: 'missing', code: formData.office_code, name: 'Unknown office', url: '' });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Job Application</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Office code setup + application entries</p>
        </div>
        <div className="inline-flex rounded-xl border border-zinc-200 dark:border-zinc-700 p-1 bg-zinc-50 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => {
              setActiveTab('application');
              resetForm();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'application'
                ? 'bg-emerald-500 text-white'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Plus size={14} className="inline mr-1" />
            New Application
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('office')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'office'
                ? 'bg-emerald-500 text-white'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Office Code Management
          </button>
        </div>
      </div>

      {activeTab === 'office' && (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100">Office Code Management</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Shared data from Supabase (multi-user).</p>
        </div>
        <form onSubmit={handleOfficeSave} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3 border-b border-zinc-200 dark:border-zinc-800">
          <input required placeholder="Office Code" value={officeFormData.code} onChange={(e) => setOfficeFormData((p) => ({ ...p, code: e.target.value }))} className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
          <input required placeholder="Office Name" value={officeFormData.name} onChange={(e) => setOfficeFormData((p) => ({ ...p, name: e.target.value }))} className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
          <input required type="url" placeholder="Office URL" value={officeFormData.url} onChange={(e) => setOfficeFormData((p) => ({ ...p, url: e.target.value }))} className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold"><Save size={15} /> {editingOfficeId ? 'Update' : 'Add'}</button>
            {editingOfficeId && <button type="button" onClick={resetOfficeForm} className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">Cancel</button>}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">Code</th>
                <th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">Name</th>
                <th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">URL</th>
                <th className="px-5 py-3 text-right text-xs uppercase text-zinc-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {officeCodesLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-zinc-500 dark:text-zinc-400">
                    Loading office codes...
                  </td>
                </tr>
              ) : officeCodes.map((office) => (
                <tr key={office.id}>
                  <td className="px-5 py-3 font-semibold">{office.code}</td>
                  <td className="px-5 py-3">{office.name}</td>
                  <td className="px-5 py-3"><a href={office.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-600"><LinkIcon size={13} />Open</a></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => editOffice(office)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"><Edit2 size={14} /></button>
                      <button onClick={() => deleteOffice(office.id)} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeTab === 'application' && (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100">{editingApp ? 'Edit Application' : 'New Application'}</h2>
          {editingApp && (
            <button type="button" onClick={resetForm} className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm">
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleSave} className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-2 items-center">
          <select required value={formData.office_code} onChange={(e) => setFormData((p) => ({ ...p, office_code: e.target.value }))} className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm">
            <option value="">Select office code</option>
            {officeOptions.map((office) => <option key={office.id} value={office.code}>{office.code} - {office.name}</option>)}
          </select>
          <input required placeholder="Applicant" value={formData.applicant_name} onChange={(e) => setFormData((p) => ({ ...p, applicant_name: e.target.value }))} className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm" />
          <input required placeholder="User ID" value={formData.user_id} onChange={(e) => setFormData((p) => ({ ...p, user_id: e.target.value }))} className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm" />
          <input required placeholder="Mobile" value={formData.mobile_no} onChange={(e) => setFormData((p) => ({ ...p, mobile_no: e.target.value }))} className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm" />
          <input required type="number" min="0" step="0.01" placeholder="Amount" value={formData.amount} onChange={(e) => setFormData((p) => ({ ...p, amount: Number(e.target.value) || 0 }))} className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm" />
          <div className="flex gap-2 md:col-span-2 xl:col-span-4">
            <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm">Reset</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm">{editingApp ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
      )}

      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              Filter
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'completed' | 'paid')}
              className="px-3 py-2 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
            >
              <option value="all">Status: All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
            </select>
            <button
              type="button"
              onClick={applyTodayFilter}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600"
            >
              Today
            </button>
            <div className="relative min-w-[280px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by office code/name, applicant, mobile"
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-end gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <div className="space-y-1">
                <label className="text-[11px] uppercase text-zinc-500">Range From</label>
                <input
                  type="date"
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase text-zinc-500">Range To</label>
                <input
                  type="date"
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                />
              </div>
              <div className="flex gap-2 pb-[1px]">
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="px-3 py-2 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700"
                >
                  Range Action: Done
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRangeFrom('');
                    setRangeTo('');
                    setStatusFilter('all');
                  }}
                  className="px-3 py-2 rounded-lg text-sm bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">Date</th>
                <th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">Office Code and Name</th>
                <th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">User ID and Password</th>
                <th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">Mobile</th>
                <th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">Amount</th>
                <th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">URL</th>
                <th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">Status</th>
                <th className="px-5 py-3 text-right text-xs uppercase text-zinc-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredApps.map((app) => {
                const office = officeMap[app.office_code];
                return (
                  <tr key={app.id}>
                    <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-300">{format(new Date(app.created_at), 'dd MMM yyyy')}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold">{app.office_code}</div>
                      <div className="text-sm text-zinc-500">{office?.name || 'Unknown office'}</div>
                    </td>
                    <td className="px-5 py-3"><div>ID: {app.user_id}</div><div className="text-xs font-mono text-zinc-500">PW: {app.password || 'N/A'}</div></td>
                    <td className="px-5 py-3"><div>{app.mobile_no}</div></td>
                    <td className="px-5 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">{app.amount}</td>
                    <td className="px-5 py-3">
                      {office?.url ? (
                        <a href={office.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-600 text-sm">
                          <LinkIcon size={13} />
                          Open
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-400">N/A</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {app.status === 'pending' && <span className="inline-flex items-center gap-1 text-amber-600"><Clock size={14} />Pending</span>}
                      {app.status === 'completed' && <span className="inline-flex items-center gap-1 text-blue-600"><CheckCircle2 size={14} />Completed</span>}
                      {app.status === 'paid' && (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-emerald-600"><CreditCard size={14} />Paid</span>
                          {app.payment_method && <span className="text-xs text-zinc-500">{app.payment_method}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {app.status === 'pending' && <button onClick={() => updateStatus(app.id, 'completed')} className="px-2 py-1 text-xs bg-blue-500 text-white rounded">Complete</button>}
                        {app.status === 'completed' && <button onClick={() => openPayModal(app)} className="px-2 py-1 text-xs bg-emerald-500 text-white rounded">Pay</button>}
                        <button onClick={() => setPasswordForApp(app.id)} className="px-2 py-1 text-xs bg-zinc-600 text-white rounded">Set PW</button>
                        <button onClick={() => openEdit(app)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"><Edit2 size={14} /></button>
                        <button onClick={() => deleteApp(app.id)} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Payment Details</h3>
            </div>
            <form onSubmit={confirmPayment} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase">Amount</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={payForm.amount}
                  onChange={(e) => setPayForm((prev) => ({ ...prev, amount: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase">Payment Method</label>
                <select
                  required
                  value={payForm.payment_method}
                  onChange={(e) => setPayForm((prev) => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPayModal(false);
                    setPayingAppId(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                  Confirm Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
