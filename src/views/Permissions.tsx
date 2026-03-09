import React, { useState } from 'react';
import { 
  Shield, 
  Check, 
  X, 
  Save,
  Lock,
  Eye,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PermissionModule {
  id: string;
  name: string;
  permissions: {
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
  };
}

interface RolePermissions {
  role: 'admin' | 'staff';
  modules: PermissionModule[];
}

const INITIAL_PERMISSIONS: RolePermissions[] = [
  {
    role: 'admin',
    modules: [
      { id: 'dashboard', name: 'Dashboard', permissions: { read: true, write: true, update: true, delete: true } },
      { id: 'customers', name: 'Customers', permissions: { read: true, write: true, update: true, delete: true } },
      { id: 'billing', name: 'Billing', permissions: { read: true, write: true, update: true, delete: true } },
      { id: 'inventory', name: 'Inventory', permissions: { read: true, write: true, update: true, delete: true } },
      { id: 'finance', name: 'Finance', permissions: { read: true, write: true, update: true, delete: true } },
      { id: 'users', name: 'User Management', permissions: { read: true, write: true, update: true, delete: true } },
    ]
  },
  {
    role: 'staff',
    modules: [
      { id: 'dashboard', name: 'Dashboard', permissions: { read: true, write: false, update: false, delete: false } },
      { id: 'customers', name: 'Customers', permissions: { read: true, write: true, update: true, delete: false } },
      { id: 'billing', name: 'Billing', permissions: { read: true, write: true, update: false, delete: false } },
      { id: 'inventory', name: 'Inventory', permissions: { read: true, write: false, update: false, delete: false } },
      { id: 'finance', name: 'Finance', permissions: { read: false, write: false, update: false, delete: false } },
      { id: 'users', name: 'User Management', permissions: { read: false, write: false, update: false, delete: false } },
    ]
  }
];

export default function Permissions() {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff'>('staff');
  const [permissions, setPermissions] = useState<RolePermissions[]>(INITIAL_PERMISSIONS);

  const currentRolePermissions = permissions.find(p => p.role === selectedRole);

  const togglePermission = (moduleId: string, permType: keyof PermissionModule['permissions']) => {
    if (selectedRole === 'admin') return; // Admin permissions are locked in this demo

    setPermissions(prev => prev.map(rolePerm => {
      if (rolePerm.role === selectedRole) {
        return {
          ...rolePerm,
          modules: rolePerm.modules.map(mod => {
            if (mod.id === moduleId) {
              return {
                ...mod,
                permissions: {
                  ...mod.permissions,
                  [permType]: !mod.permissions[permType]
                }
              };
            }
            return mod;
          })
        };
      }
      return rolePerm;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('permissionManagement')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('rolesAndPermissions')}</p>
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <button 
            onClick={() => setSelectedRole('admin')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${selectedRole === 'admin' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500'}`}
          >
            {t('admin')}
          </button>
          <button 
            onClick={() => setSelectedRole('staff')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${selectedRole === 'staff' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500'}`}
          >
            {t('staff')}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${selectedRole === 'admin' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600'}`}>
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                {selectedRole === 'admin' ? t('admin') : t('staff')} {t('permissions')}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {selectedRole === 'admin' ? 'Full system access (Locked)' : 'Customizable access levels'}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
            <Save size={18} />
            <span>{t('save')}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('moduleName')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center">{t('read')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center">{t('write')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center">{t('updatePerm')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center">{t('deletePerm')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {currentRolePermissions?.modules.map((module) => (
                <tr key={module.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <Lock size={16} />
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{module.name}</span>
                    </div>
                  </td>
                  {(['read', 'write', 'update', 'delete'] as const).map((type) => (
                    <td key={type} className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePermission(module.id, type)}
                        disabled={selectedRole === 'admin'}
                        className={`p-2 rounded-xl transition-all ${
                          module.permissions[type]
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600'
                        } ${selectedRole !== 'admin' ? 'hover:scale-110 active:scale-90' : 'cursor-not-allowed'}`}
                      >
                        {module.permissions[type] ? <Check size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
