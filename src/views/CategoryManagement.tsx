import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Tag, 
  Layers,
  CheckCircle2,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import TableActionBar from '../components/TableActionBar';

interface Category {
  id: string;
  name: string;
  module: 'inventory' | 'finance';
  status: 'active' | 'inactive';
  properties?: string; // Comma separated properties like size, color, brand
  itemCount: number;
}

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'কাগজ', module: 'inventory', status: 'active', properties: 'size, brand, gsm', itemCount: 12 },
  { id: '2', name: 'কালি', module: 'inventory', status: 'active', properties: 'color, brand, volume', itemCount: 5 },
  { id: '3', name: 'টোনার', module: 'inventory', status: 'active', properties: 'model, brand, color', itemCount: 3 },
  { id: '4', name: 'সার্ভিস চার্জ', module: 'finance', status: 'active', itemCount: 45 },
  { id: '5', name: 'দোকান ভাড়া', module: 'finance', status: 'active', itemCount: 1 },
  { id: '6', name: 'বিদ্যুৎ বিল', module: 'finance', status: 'active', itemCount: 1 },
];

export default function CategoryManagement() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    module: 'inventory' as 'inventory' | 'finance',
    status: 'active' as 'active' | 'inactive',
    properties: ''
  });

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      module: cat.module,
      status: cat.status,
      properties: cat.properties || ''
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      module: 'inventory',
      status: 'active',
      properties: ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...formData } : c));
    } else {
      const newCat: Category = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        itemCount: 0
      };
      setCategories(prev => [...prev, newCat]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('categoryManagement')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('categoryManagementDesc')}</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>{t('addCategory')}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <TableActionBar onFilter={() => setShowFilters((prev) => !prev)} filterActive={showFilters} />
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('categoryName')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('module')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('properties')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('status')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t('total')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                        <Tag size={20} />
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      cat.module === 'inventory' 
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    }`}>
                      <Layers size={12} />
                      {cat.module === 'inventory' ? t('inventory') : t('finance')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{cat.properties || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      cat.status === 'active' 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {cat.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {cat.status === 'active' ? t('active') : t('inactive')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{cat.itemCount}</span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === cat.id ? null : cat.id);
                      }}
                      className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeDropdown === cat.id && (
                      <div className="absolute right-6 top-12 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <button 
                          onClick={() => {
                            handleEdit(cat);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                        >
                          <Edit2 size={16} />
                          {t('edit')}
                        </button>
                        <button 
                          onClick={() => {
                            handleDelete(cat.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border-t border-zinc-100 dark:border-zinc-800"
                        >
                          <Trash2 size={16} />
                          {t('delete')}
                        </button>
                      </div>
                    )}
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
                {editingCategory ? t('editCategory') : t('addCategory')}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('categoryName')} *</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              {formData.module === 'inventory' && (
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">বৈশিষ্ট্যসমূহ (কমা দিয়ে আলাদা করুন) *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="size, color, brand"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                    value={formData.properties}
                    onChange={(e) => setFormData({...formData, properties: e.target.value})}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('module')}</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                    value={formData.module}
                    onChange={(e) => setFormData({...formData, module: e.target.value as 'inventory' | 'finance'})}
                  >
                    <option value="inventory">{t('inventory')}</option>
                    <option value="finance">{t('finance')}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('status')}</label>
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
                  {editingCategory ? t('update') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
