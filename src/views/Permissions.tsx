import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, Check, X, Save, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import TableActionBar from '../components/TableActionBar';

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
  userType?: 'owner' | 'manager' | 'operator';
  modules: PermissionModule[];
}

type PermissionRow = {
  id: string;
  role: 'admin' | 'staff';
  user_type: 'owner' | 'manager' | 'operator' | null;
  module_id: string;
  module_name: string;
  can_read: boolean;
  can_write: boolean;
  can_update: boolean;
  can_delete: boolean;
};

type UserOverrideRow = {
  id: string;
  user_id: string;
  module_id: string;
  module_name: string;
  can_read: boolean;
  can_write: boolean;
  can_update: boolean;
  can_delete: boolean;
};

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
    ],
  },
  {
    role: 'staff',
    userType: 'owner',
    modules: [
      { id: 'dashboard', name: 'Dashboard', permissions: { read: true, write: true, update: true, delete: false } },
      { id: 'customers', name: 'Customers', permissions: { read: true, write: true, update: true, delete: true } },
      { id: 'billing', name: 'Billing', permissions: { read: true, write: true, update: true, delete: false } },
      { id: 'inventory', name: 'Inventory', permissions: { read: true, write: true, update: true, delete: false } },
      { id: 'finance', name: 'Finance', permissions: { read: true, write: true, update: false, delete: false } },
      { id: 'users', name: 'User Management', permissions: { read: true, write: false, update: false, delete: false } },
    ],
  },
  {
    role: 'staff',
    userType: 'manager',
    modules: [
      { id: 'dashboard', name: 'Dashboard', permissions: { read: true, write: false, update: false, delete: false } },
      { id: 'customers', name: 'Customers', permissions: { read: true, write: true, update: true, delete: false } },
      { id: 'billing', name: 'Billing', permissions: { read: true, write: true, update: false, delete: false } },
      { id: 'inventory', name: 'Inventory', permissions: { read: true, write: false, update: false, delete: false } },
      { id: 'finance', name: 'Finance', permissions: { read: false, write: false, update: false, delete: false } },
      { id: 'users', name: 'User Management', permissions: { read: false, write: false, update: false, delete: false } },
    ],
  },
  {
    role: 'staff',
    userType: 'operator',
    modules: [
      { id: 'dashboard', name: 'Dashboard', permissions: { read: true, write: false, update: false, delete: false } },
      { id: 'customers', name: 'Customers', permissions: { read: true, write: false, update: false, delete: false } },
      { id: 'billing', name: 'Billing', permissions: { read: true, write: true, update: false, delete: false } },
      { id: 'inventory', name: 'Inventory', permissions: { read: true, write: false, update: false, delete: false } },
      { id: 'finance', name: 'Finance', permissions: { read: false, write: false, update: false, delete: false } },
      { id: 'users', name: 'User Management', permissions: { read: false, write: false, update: false, delete: false } },
    ],
  },
];

export default function Permissions() {
  const { t } = useLanguage();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff'>('staff');
  const [selectedUserType, setSelectedUserType] = useState<'owner' | 'manager' | 'operator'>('operator');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [permissions, setPermissions] = useState<RolePermissions[]>(INITIAL_PERMISSIONS);
  const [userOverrides, setUserOverrides] = useState<Record<string, UserOverrideRow>>({});
  const [editedModules, setEditedModules] = useState<PermissionModule[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isLoadingOverrides, setIsLoadingOverrides] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [moduleSearch, setModuleSearch] = useState('');

  const currentRolePermissions = useMemo(
    () =>
      permissions.find(
        (p) => p.role === selectedRole && (selectedRole === 'admin' ? !p.userType : p.userType === selectedUserType),
      ),
    [permissions, selectedRole, selectedUserType],
  );

  const isProfileMode = !selectedUserId;
  const isLoading = isLoadingProfiles || isLoadingOverrides;
  const toggleLocked = isSaving || (isProfileMode && selectedRole === 'admin');
  const filteredModules = editedModules.filter((module) =>
    module.name.toLowerCase().includes(moduleSearch.toLowerCase()),
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const role = params.get('role');
    const userType = params.get('userType');
    const user = params.get('user');
    const userId = params.get('userId');

    if (role === 'admin' || role === 'staff') {
      setSelectedRole(role);
    }
    if (userType === 'owner' || userType === 'manager' || userType === 'operator') {
      setSelectedUserType(userType);
    }
    setSelectedUserName(user || '');
    setSelectedUserId(userId || '');
  }, [location.search]);

  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoadingProfiles(true);
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('role', { ascending: true })
        .order('user_type', { ascending: true })
        .order('module_id', { ascending: true });

      if (error) {
        console.error('Failed to load role permissions from DB:', error);
        setIsLoadingProfiles(false);
        return;
      }

      const rows = (data as PermissionRow[]) || [];
      if (rows.length === 0) {
        setIsLoadingProfiles(false);
        return;
      }

      const grouped = rows.reduce<Record<string, PermissionRow[]>>((acc, row) => {
        const key = `${row.role}:${row.user_type ?? 'admin'}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
      }, {});

      const merged = INITIAL_PERMISSIONS.map((profile) => {
        const key = `${profile.role}:${profile.userType ?? 'admin'}`;
        const profileRows = grouped[key];
        if (!profileRows || profileRows.length === 0) {
          return profile;
        }

        const rowMap = profileRows.reduce<Record<string, PermissionRow>>((acc, row) => {
          acc[row.module_id] = row;
          return acc;
        }, {});

        const modulesFromDefault = profile.modules.map((module) => {
          const row = rowMap[module.id];
          if (!row) return module;
          return {
            ...module,
            name: row.module_name || module.name,
            permissions: {
              read: row.can_read,
              write: row.can_write,
              update: row.can_update,
              delete: row.can_delete,
            },
          };
        });

        const extraModules = profileRows
          .filter((row) => !profile.modules.some((module) => module.id === row.module_id))
          .map((row) => ({
            id: row.module_id,
            name: row.module_name,
            permissions: {
              read: row.can_read,
              write: row.can_write,
              update: row.can_update,
              delete: row.can_delete,
            },
          }));

        return {
          ...profile,
          modules: [...modulesFromDefault, ...extraModules],
        };
      });

      setPermissions(merged);
      setIsLoadingProfiles(false);
    };

    loadProfiles();
  }, []);

  useEffect(() => {
    const loadUserOverrides = async () => {
      if (!selectedUserId) {
        setUserOverrides({});
        return;
      }

      setIsLoadingOverrides(true);
      const { data, error } = await supabase
        .from('user_permission_overrides')
        .select('*')
        .eq('user_id', selectedUserId)
        .order('module_id', { ascending: true });

      if (error) {
        console.error('Failed to load user permission overrides:', error);
        setIsLoadingOverrides(false);
        return;
      }

      const rows = (data as UserOverrideRow[]) || [];
      const map = rows.reduce<Record<string, UserOverrideRow>>((acc, row) => {
        acc[row.module_id] = row;
        return acc;
      }, {});
      setUserOverrides(map);
      setIsLoadingOverrides(false);
    };

    loadUserOverrides();
  }, [selectedUserId]);

  useEffect(() => {
    if (!currentRolePermissions) {
      setEditedModules([]);
      return;
    }

    const baseModules = currentRolePermissions.modules;
    if (!selectedUserId) {
      setEditedModules(baseModules);
      return;
    }

    const mergedBase = baseModules.map((module) => {
      const override = userOverrides[module.id];
      if (!override) return module;
      return {
        ...module,
        name: override.module_name || module.name,
        permissions: {
          read: override.can_read,
          write: override.can_write,
          update: override.can_update,
          delete: override.can_delete,
        },
      };
    });

    const extraModules = (Object.values(userOverrides) as UserOverrideRow[])
      .filter((row) => !baseModules.some((module) => module.id === row.module_id))
      .map((row) => ({
        id: row.module_id,
        name: row.module_name,
        permissions: {
          read: row.can_read,
          write: row.can_write,
          update: row.can_update,
          delete: row.can_delete,
        },
      }));

    setEditedModules([...mergedBase, ...extraModules]);
  }, [currentRolePermissions, selectedUserId, userOverrides]);

  const togglePermission = (moduleId: string, permType: keyof PermissionModule['permissions']) => {
    if (toggleLocked) return;
    setEditedModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? { ...module, permissions: { ...module.permissions, [permType]: !module.permissions[permType] } }
          : module,
      ),
    );
  };

  const savePermissions = async () => {
    if (!currentRolePermissions) return;
    setIsSaving(true);

    if (selectedUserId) {
      const { error: deleteError } = await supabase
        .from('user_permission_overrides')
        .delete()
        .eq('user_id', selectedUserId);

      if (deleteError) {
        console.error('Failed to clear user permission overrides:', deleteError);
        alert('Failed to save user permission overrides.');
        setIsSaving(false);
        return;
      }

      const baseMap = currentRolePermissions.modules.reduce<Record<string, PermissionModule>>((acc, module) => {
        acc[module.id] = module;
        return acc;
      }, {});

      const overrideRows = editedModules
        .filter((module) => {
          const base = baseMap[module.id];
          if (!base) return true;
          return (
            base.permissions.read !== module.permissions.read ||
            base.permissions.write !== module.permissions.write ||
            base.permissions.update !== module.permissions.update ||
            base.permissions.delete !== module.permissions.delete
          );
        })
        .map((module) => ({
          user_id: selectedUserId,
          module_id: module.id,
          module_name: module.name,
          can_read: module.permissions.read,
          can_write: module.permissions.write,
          can_update: module.permissions.update,
          can_delete: module.permissions.delete,
        }));

      if (overrideRows.length > 0) {
        const { error: insertError } = await supabase.from('user_permission_overrides').insert(overrideRows);
        if (insertError) {
          console.error('Failed to insert user permission overrides:', insertError);
          alert('Failed to save user permission overrides.');
          setIsSaving(false);
          return;
        }
      }

      alert('User permission overrides saved to database.');
      setIsSaving(false);
      return;
    }

    let deleteQuery = supabase.from('role_permissions').delete().eq('role', selectedRole);
    if (selectedRole === 'admin') {
      deleteQuery = deleteQuery.is('user_type', null);
    } else {
      deleteQuery = deleteQuery.eq('user_type', selectedUserType);
    }

    const { error: deleteError } = await deleteQuery;
    if (deleteError) {
      console.error('Failed to clear existing permissions:', deleteError);
      alert('Failed to save role permissions.');
      setIsSaving(false);
      return;
    }

    const rowsToInsert = editedModules.map((module) => ({
      role: selectedRole,
      user_type: selectedRole === 'admin' ? null : selectedUserType,
      module_id: module.id,
      module_name: module.name,
      can_read: module.permissions.read,
      can_write: module.permissions.write,
      can_update: module.permissions.update,
      can_delete: module.permissions.delete,
    }));

    const { error: insertError } = await supabase.from('role_permissions').insert(rowsToInsert);
    if (insertError) {
      console.error('Failed to insert role permissions:', insertError);
      alert('Failed to save role permissions.');
      setIsSaving(false);
      return;
    }

    alert('Role permissions saved to database.');
    setIsSaving(false);
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

      {selectedRole === 'staff' && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">{t('userType')}:</span>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setSelectedUserType('owner')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedUserType === 'owner' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500'}`}
            >
              {t('owner')}
            </button>
            <button
              onClick={() => setSelectedUserType('manager')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedUserType === 'manager' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500'}`}
            >
              {t('manager')}
            </button>
            <button
              onClick={() => setSelectedUserType('operator')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedUserType === 'operator' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500'}`}
            >
              {t('operator')}
            </button>
          </div>
        </div>
      )}

      {selectedUserName && (
        <div className="px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-sm text-blue-700 dark:text-blue-300">
          User: <span className="font-bold">{selectedUserName}</span> | Mode: <span className="font-bold">Custom Override</span>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <TableActionBar onFilter={() => setShowFilters((prev) => !prev)} filterActive={showFilters} printTargetId="permissions-table-data" />
        {showFilters && (
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <input
              type="text"
              value={moduleSearch}
              onChange={(e) => setModuleSearch(e.target.value)}
              placeholder="Filter by module name"
              className="w-full max-w-sm px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
            />
          </div>
        )}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${selectedRole === 'admin' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600'}`}>
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                {selectedRole === 'admin'
                  ? `${t('admin')} ${t('permissions')}`
                  : `${t('staff')} (${t(selectedUserType)}) ${t('permissions')}`}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isProfileMode ? 'Profile permission mode' : 'User-specific override mode'}
              </p>
            </div>
          </div>
          <button
            onClick={savePermissions}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Save size={18} />
            <span>{isSaving ? `${t('save')}...` : t('save')}</span>
          </button>
        </div>

        <div id="permissions-table-data" className="overflow-x-auto">
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
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-zinc-500 dark:text-zinc-400">
                    {t('loading')}
                  </td>
                </tr>
              )}
              {!isLoading &&
                filteredModules.map((module) => (
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
                          disabled={toggleLocked}
                          className={`p-2 rounded-xl transition-all ${
                            module.permissions[type]
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600'
                          } ${!toggleLocked ? 'hover:scale-110 active:scale-90' : 'cursor-not-allowed'}`}
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
