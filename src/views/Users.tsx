import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  Shield, 
  User as UserIcon,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { User } from '../context/AuthContext';
import TableActionBar from '../components/TableActionBar';

interface SystemUser extends User {
  status: 'active' | 'inactive';
  lastLogin: string;
  email: string;
  userType: 'owner' | 'manager' | 'operator';
}

const MOCK_USERS: SystemUser[] = [
  { 
    id: '1', 
    username: 'admin', 
    fullName: 'Admin User', 
    role: 'admin', 
    userType: 'owner',
    email: 'admin@compservpro.com',
    status: 'active',
    lastLogin: '2024-03-08 10:30 AM',
    avatar: 'https://picsum.photos/seed/admin/40/40',
    permissions: ['*']
  },
  { 
    id: '2', 
    username: 'staff1', 
    fullName: 'Rahim Ahmed', 
    role: 'staff', 
    userType: 'manager',
    email: 'rahim@compservpro.com',
    status: 'active',
    lastLogin: '2024-03-07 04:15 PM',
    avatar: 'https://picsum.photos/seed/staff1/40/40',
    permissions: ['billing:read', 'customers:read']
  },
  { 
    id: '3', 
    username: 'staff2', 
    fullName: 'Karim Ullah', 
    role: 'staff', 
    userType: 'operator',
    email: 'karim@compservpro.com',
    status: 'inactive',
    lastLogin: '2024-02-28 09:00 AM',
    avatar: 'https://picsum.photos/seed/staff2/40/40',
    permissions: ['inventory:read']
  }
];

export default function Users() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    role: 'staff' as 'admin' | 'staff',
    userType: 'operator' as 'owner' | 'manager' | 'operator',
    status: 'active' as 'active' | 'inactive'
  });

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: SystemUser) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      userType: user.userType,
      status: user.status
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      username: '',
      email: '',
      role: 'staff',
      userType: 'operator',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser: SystemUser = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        lastLogin: 'Never',
        avatar: `https://picsum.photos/seed/${formData.username}/40/40`,
        permissions: formData.role === 'admin' ? ['*'] : ['billing:read', 'customers:read']
      };
      setUsers(prev => [...prev, newUser]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleSetPermission = (user: SystemUser) => {
    const params = new URLSearchParams({
      userId: user.id,
      role: user.role,
      userType: user.userType,
      user: user.fullName,
    });
    navigate(`/permissions?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('userManagement')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('userManagementDesc')}</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <UserPlus size={20} />
          <span>{t('addUser')}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <TableActionBar onFilter={() => setShowFilters((prev) => !prev)} filterActive={showFilters} printTargetId="users-table-data" />
        {showFilters && (
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        <div id="users-table-data" className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('userManagement')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('role')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('userType')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('userStatus')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('lastLogin')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{user.fullName}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">@{user.username} • {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' 
                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                        : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}>
                      {user.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                      {user.role === 'admin' ? t('admin') : t('staff')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {user.userType === 'owner' && t('owner')}
                      {user.userType === 'manager' && t('manager')}
                      {user.userType === 'operator' && t('operator')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      user.status === 'active' 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {user.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {user.status === 'active' ? t('active') : t('inactive')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.lastLogin}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                        title={t('edit')}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleSetPermission(user)}
                        className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                        title={t('managePermissions')}
                      >
                        <Shield size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                        title={t('delete')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-zinc-200 dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {editingUser ? t('editUser') : t('addUser')}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('fullName')} *</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('username')} *</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('email')} *</label>
                <input 
                  required
                  type="email" 
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('role')}</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'staff'})}
                  >
                    <option value="admin">{t('admin')}</option>
                    <option value="staff">{t('staff')}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('userType')}</label>
                  <select
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                    value={formData.userType}
                    onChange={(e) => setFormData({...formData, userType: e.target.value as 'owner' | 'manager' | 'operator'})}
                  >
                    <option value="owner">{t('owner')}</option>
                    <option value="manager">{t('manager')}</option>
                    <option value="operator">{t('operator')}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('userStatus')}</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                  >
                    <option value="active">{t('active')}</option>
                    <option value="inactive">{t('inactive')}</option>
                  </select>
                </div>
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
                  {editingUser ? t('update') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
