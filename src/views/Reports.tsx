import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, ArrowRight, TrendingUp, Users, Receipt, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Reports() {
  const { t } = useLanguage();
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    serviceDistribution: [] as any[],
    dailyRevenue: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    
    // Get date range
    let start = startOfMonth(new Date()).toISOString();
    let end = endOfMonth(new Date()).toISOString();
    if (dateRange === 'today') {
      start = startOfDay(new Date()).toISOString();
      end = endOfDay(new Date()).toISOString();
    }

    // Fetch Invoices for revenue
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount, created_at')
      .gte('created_at', start)
      .lte('created_at', end);

    // Fetch Transactions for expenses
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, type')
      .gte('created_at', start)
      .lte('created_at', end);

    // Fetch Customers
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // Fetch Service Distribution
    const { data: items } = await supabase
      .from('invoice_items')
      .select('service_type, total_price');

    const revenue = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
    const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

    // Process service distribution
    const distMap = new Map();
    items?.forEach(item => {
      const current = distMap.get(item.service_type) || 0;
      distMap.set(item.service_type, current + 1);
    });
    const distribution = Array.from(distMap.entries()).map(([name, value]) => ({ name, value }));

    setReportData({
      totalRevenue: revenue,
      totalExpenses: expenses,
      totalCustomers: customerCount || 0,
      totalInvoices: invoices?.length || 0,
      serviceDistribution: distribution,
      dailyRevenue: [] // Mock or process from invoices
    });
    setLoading(false);
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('reportsTitle')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('reportsDesc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">{t('today')}</option>
            <option value="week">{t('thisWeek')}</option>
            <option value="month">{t('thisMonth')}</option>
            <option value="year">{t('thisYear')}</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
            <Download size={18} />
            {t('exportPdf')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('totalIncome'), value: `৳ ${reportData.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: t('totalExpense'), value: `৳ ${reportData.totalExpenses.toLocaleString()}`, icon: BarChart3, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10' },
          { label: t('totalCustomers'), value: reportData.totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: t('totalInvoices'), value: reportData.totalInvoices, icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{stat.label}</p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-8 italic serif">{t('serviceDistribution')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reportData.serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e4e4e7'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {reportData.serviceDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{item.name}</span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-8 italic serif">{t('monthlyPerformance')}</h3>
          <div className="space-y-6">
            {[
              { label: t('onlineServices'), count: 45, trend: '+১২%', color: 'bg-blue-500' },
              { label: t('printing'), count: 128, trend: '+৮%', color: 'bg-emerald-500' },
              { label: t('jobApplication'), count: 22, trend: '-৩%', color: 'bg-amber-500' },
              { label: t('otherServices'), count: 14, trend: '+৫%', color: 'bg-zinc-400' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.count}</span>
                    <span className={`text-xs font-bold ${item.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.trend}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full`} 
                    style={{width: `${(item.count / 150) * 100}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2.5 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition-colors">
            {t('viewAnalytics')}
          </button>
        </div>
      </div>
    </div>
  );
}
