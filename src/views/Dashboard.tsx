import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Receipt,
  Globe
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';

const data = [
  { name: 'Mon', income: 4000, expense: 2400 },
  { name: 'Tue', income: 3000, expense: 1398 },
  { name: 'Wed', income: 2000, expense: 9800 },
  { name: 'Thu', income: 2780, expense: 3908 },
  { name: 'Fri', income: 1890, expense: 4800 },
  { name: 'Sat', income: 2390, expense: 3800 },
  { name: 'Sun', income: 3490, expense: 4300 },
];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, onClick }: StatCardProps) => (
  <div className={`bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200 ${onClick ? 'hover:border-emerald-300 dark:hover:border-emerald-700' : ''}`}>
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      disabled={!onClick}
      title={onClick ? 'Click to view details' : undefined}
    >
      <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trendValue}
        </div>
      )}
      </div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</h3>
      {onClick && (
        <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Click to view details</p>
      )}
    </button>
  </div>
);

export default function Dashboard() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    todayIncome: language === 'bn' ? '৳ ১২,৪৫০' : '৳ 12,450',
    todayExpense: language === 'bn' ? '৳ ৩,২০০' : '৳ 3,200',
    todayProfit: language === 'bn' ? '৳ ৯,২৫০' : '৳ 9,250',
    totalCustomers: language === 'bn' ? '১,২৪৮' : '1,248',
    pendingJobs: language === 'bn' ? '১৪' : '14',
    lowStock: language === 'bn' ? '৩' : '3'
  });

  useEffect(() => {
    setStats({
      todayIncome: language === 'bn' ? '৳ ১২,৪৫০' : '৳ 12,450',
      todayExpense: language === 'bn' ? '৳ ৩,২০০' : '৳ 3,200',
      todayProfit: language === 'bn' ? '৳ ৯,২৫০' : '৳ 9,250',
      totalCustomers: language === 'bn' ? '১,২৪৮' : '1,248',
      pendingJobs: language === 'bn' ? '১৪' : '14',
      lowStock: language === 'bn' ? '৩' : '3'
    });
  }, [language]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('overview')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('welcome')}</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200">
          <button className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg">{t('today')}</button>
          <button className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">{t('week')}</button>
          <button className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">{t('month')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('todayIncome')} 
          value={stats.todayIncome} 
          icon={DollarSign} 
          trend="up" 
          trendValue="12%" 
          color="bg-emerald-500" 
          onClick={() => navigate('/finance?section=transactions-table')}
        />
        <StatCard 
          title={t('todayExpense')} 
          value={stats.todayExpense} 
          icon={TrendingUp} 
          trend="down" 
          trendValue="5%" 
          color="bg-rose-500" 
          onClick={() => navigate('/finance?section=transactions-table')}
        />
        <StatCard 
          title={t('totalCustomers')} 
          value={stats.totalCustomers} 
          icon={Users} 
          trend="up" 
          trendValue="8%" 
          color="bg-blue-500" 
          onClick={() => navigate('/customers?section=customers-table')}
        />
        <StatCard 
          title={t('pendingJobs')} 
          value={stats.pendingJobs} 
          icon={Clock} 
          color="bg-amber-500" 
          onClick={() => navigate('/job-applications?section=applications-table')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 italic serif">{t('incomeVsExpense')}</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-zinc-500 dark:text-zinc-400">{t('income')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-zinc-500 dark:text-zinc-400">{t('expense')}</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{color: '#f4f4f5'}}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6">{t('recentActivity')}</h3>
          <div className="space-y-6">
            {[
              { id: 1, type: 'invoice', title: language === 'bn' ? 'ইনভয়েস #INV-2024-001' : 'Invoice #INV-2024-001', time: language === 'bn' ? '১০ মিনিট আগে' : '10 mins ago', amount: '+ ৳450' },
              { id: 2, type: 'expense', title: language === 'bn' ? 'কালি ক্রয়' : 'Ink Purchase', time: language === 'bn' ? '১ ঘণ্টা আগে' : '1 hour ago', amount: '- ৳1,200' },
              { id: 3, type: 'online', title: language === 'bn' ? 'পাসপোর্ট আবেদন' : 'Passport Application', time: language === 'bn' ? '২ ঘণ্টা আগে' : '2 hours ago', status: language === 'bn' ? 'জমা দেওয়া হয়েছে' : 'Submitted' },
              { id: 4, type: 'invoice', title: language === 'bn' ? 'ইনভয়েস #INV-2024-002' : 'Invoice #INV-2024-002', time: language === 'bn' ? '৪ ঘণ্টা আগে' : '4 hours ago', amount: '+ ৳120' },
            ].map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'invoice' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 
                    activity.type === 'expense' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600'
                  }`}>
                    {activity.type === 'invoice' ? <Receipt size={18} /> : 
                     activity.type === 'expense' ? <TrendingUp size={18} /> : <Globe size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{activity.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{activity.time}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${activity.amount?.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {activity.amount || activity.status}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors">
            {t('viewAllActivity')}
          </button>
        </div>
      </div>

      {stats.lowStock !== '0' && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-400">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{t('lowStockAlert', { count: stats.lowStock })}</p>
        </div>
      )}
    </div>
  );
}
