import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Search, Edit2, Trash2, ArrowUp, ArrowDown, XCircle, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { InventoryItem } from '../types';
import { INVENTORY_CATEGORIES } from '../constants';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';
import TableActionBar from '../components/TableActionBar';

const MOCK_INVENTORY: InventoryItem[] = [
  { 
    id: '1', 
    name: 'A4 Paper (Double A)', 
    category: 'paper', 
    quantity: 500, 
    unit: 'sheets', 
    purchase_price: 450, 
    selling_price: 550, 
    min_stock_level: 100, 
    properties: { size: 'A4', brand: 'Double A', gsm: '80' },
    updated_at: new Date().toISOString() 
  },
  { 
    id: '2', 
    name: 'Black Ink (Epson 003)', 
    category: 'ink', 
    quantity: 5, 
    unit: 'bottles', 
    purchase_price: 650, 
    selling_price: 800, 
    min_stock_level: 2, 
    properties: { color: 'Black', brand: 'Epson', volume: '65ml' },
    updated_at: new Date().toISOString() 
  },
  { 
    id: '3', 
    name: 'Glossy Photo Paper', 
    category: 'paper', 
    quantity: 20, 
    unit: 'sheets', 
    purchase_price: 15, 
    selling_price: 25, 
    min_stock_level: 50, 
    properties: { size: '4R', brand: 'Kodak', gsm: '230' },
    updated_at: new Date().toISOString() 
  },
  { 
    id: '4', 
    name: 'Laminating Pouch', 
    category: 'lamination_film', 
    quantity: 150, 
    unit: 'pcs', 
    purchase_price: 8, 
    selling_price: 15, 
    min_stock_level: 50, 
    properties: { size: 'A4', thickness: '100mic' },
    updated_at: new Date().toISOString() 
  },
];

export default function Inventory() {
  const { t } = useLanguage();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'paper',
    quantity: 0,
    unit: 'pcs',
    purchase_price: 0,
    selling_price: 0,
    min_stock_level: 100,
    properties: {} as Record<string, string>
  });

  const [selectedCategoryForDetails, setSelectedCategoryForDetails] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const selectedCategory = INVENTORY_CATEGORIES.find(c => c.value === formData.category);
  const availableProperties = selectedCategory?.properties?.split(',').map(p => p.trim()).filter(p => p) || [];

  useEffect(() => {
    // Initialize properties when category changes
    const newProps: Record<string, string> = {};
    availableProperties.forEach(prop => {
      newProps[prop] = formData.properties[prop] || '';
    });
    setFormData(prev => ({ ...prev, properties: newProps }));
  }, [formData.category]);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name');
    if (!error && data) setItems(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const { error } = await supabase
        .from('inventory')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', editingItem.id);
      if (!error) {
        setShowModal(false);
        fetchInventory();
      }
    } else {
      const { error } = await supabase
        .from('inventory')
        .insert([formData]);
      if (!error) {
        setShowModal(false);
        fetchInventory();
      }
    }
  };

  const deleteItem = async (id: string) => {
    if (confirm(t('confirmDelete'))) {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (!error) fetchInventory();
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      purchase_price: item.purchase_price || 0,
      selling_price: item.selling_price || 0,
      min_stock_level: item.min_stock_level,
      properties: item.properties || {}
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      name: '', 
      category: 'paper', 
      quantity: 0, 
      unit: 'pcs', 
      purchase_price: 0,
      selling_price: 0,
      min_stock_level: 100,
      properties: {}
    });
    setShowModal(true);
  };

  const categorySummary = INVENTORY_CATEGORIES.map(cat => {
    const catItems = items.filter(i => i.category === cat.value);
    const totalQty = catItems.reduce((sum, i) => sum + i.quantity, 0);
    const totalValue = catItems.reduce((sum, i) => sum + (i.quantity * (i.purchase_price || 0)), 0);
    return { ...cat, totalQty, totalValue };
  });

  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('inventoryTitle')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('inventoryDesc')}</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          {t('addProduct')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-colors duration-200">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('total')}</p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{items.length}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-colors duration-200">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-xl">
            <ArrowUp size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">মোট স্টক মূল্য (ক্রয়মূল্য)</p>
            <h3 className="text-xl font-bold text-emerald-600">
              ৳{items.reduce((sum, i) => sum + (i.quantity * (i.purchase_price || 0)), 0).toLocaleString()}
            </h3>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-colors duration-200">
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('lowStock')}</p>
            <h3 className="text-xl font-bold text-amber-600">
              {items.filter(i => i.quantity <= i.min_stock_level).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Category Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {categorySummary.map(cat => (
          <button 
            key={cat.value}
            onClick={() => setSelectedCategoryForDetails(cat.value)}
            className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500 transition-all text-left group"
          >
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 group-hover:text-emerald-500 transition-colors">{cat.label}</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">৳{cat.totalValue.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{cat.totalQty} items in stock</p>
              </div>
              <ArrowDown size={14} className="text-zinc-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-200">
        <TableActionBar onFilter={() => setShowFilters((prev) => !prev)} filterActive={showFilters} printTargetId="inventory-table-data" />
        {showFilters && (
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
            >
              <option value="all">All Categories</option>
              {INVENTORY_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div id="inventory-table-data" className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-bottom border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">{t('productName')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">{t('category')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">ক্রয়মূল্য</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">বিক্রয়মূল্য</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">{t('stock')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif">{t('status')}</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider italic serif text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">{t('loading')}</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">{t('noTransactions')}</td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr 
                      onClick={() => setExpandedRowId(expandedRowId === item.id ? null : item.id)}
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer ${expandedRowId === item.id ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`transition-transform duration-200 ${expandedRowId === item.id ? 'rotate-180' : ''}`}>
                            <ArrowDown size={14} className="text-zinc-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</span>
                            {item.properties && Object.keys(item.properties).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(item.properties).map(([key, val]) => (
                                  <span key={key} className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded uppercase font-bold">
                                    {key}: {val}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors" onClick={() => setSelectedCategoryForDetails(item.category)}>
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">৳{item.purchase_price?.toLocaleString() || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-600">৳{item.selling_price?.toLocaleString() || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.quantity}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.quantity <= item.min_stock_level ? (
                        <div className="flex items-center gap-1.5 text-amber-600 font-medium text-sm">
                          <AlertTriangle size={14} />
                          {t('lowStock')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          {t('inStock')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === item.id ? null : item.id);
                        }}
                        className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeDropdown === item.id && (
                        <div className="absolute right-6 top-12 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(item);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                          >
                            <Edit2 size={16} />
                            {t('edit')}
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(item.id);
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
                  {expandedRowId === item.id && (
                    <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 animate-in slide-in-from-top-1 duration-200">
                      <td colSpan={7} className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">বৈশিষ্ট্য ভিত্তিক তথ্য</h4>
                            <div className="space-y-2">
                              {Object.entries(item.properties || {}).map(([k, v]) => (
                                <div key={k} className="flex justify-between items-center p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                  <span className="text-xs font-medium text-zinc-500 uppercase">{k}</span>
                                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{v}</span>
                                </div>
                              ))}
                              {Object.keys(item.properties || {}).length === 0 && (
                                <p className="text-xs text-zinc-400 italic">কোন বৈশিষ্ট্য সেট করা নেই</p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">মূল্য ও পরিমাণ</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">ক্রয়মূল্য</p>
                                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">৳{item.purchase_price?.toLocaleString()}</p>
                              </div>
                              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">বিক্রয়মূল্য</p>
                                <p className="text-lg font-bold text-emerald-600">৳{item.selling_price?.toLocaleString()}</p>
                              </div>
                              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">স্টক পরিমাণ</p>
                                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{item.quantity} {item.unit}</p>
                              </div>
                              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">মোট ভ্যালু</p>
                                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">৳{(item.quantity * (item.purchase_price || 0)).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">ক্যাটাগরি সামারি (বৈশিষ্ট্য ভিত্তিক)</h4>
                            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                              {(() => {
                                const catItems = items.filter(i => i.category === item.category);
                                const props = INVENTORY_CATEGORIES.find(c => c.value === item.category)?.properties?.split(',').map(p => p.trim()).filter(p => p) || [];
                                
                                if (props.length === 0) return <p className="text-xs text-zinc-400 italic">কোন বৈশিষ্ট্য সংজ্ঞায়িত নেই</p>;

                                return props.map(prop => {
                                  const summary: Record<string, { qty: number, val: number }> = {};
                                  catItems.forEach(i => {
                                    const val = (i.properties && i.properties[prop]) || 'N/A';
                                    if (!summary[val]) summary[val] = { qty: 0, val: 0 };
                                    summary[val].qty += i.quantity;
                                    summary[val].val += (i.quantity * (i.purchase_price || 0));
                                  });

                                  return (
                                    <div key={prop} className="space-y-1">
                                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">{prop} ভিত্তিক:</p>
                                      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                                        <table className="w-full text-[10px]">
                                          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                            {Object.entries(summary).map(([val, stats]) => (
                                              <tr key={val}>
                                                <td className="px-2 py-1 text-zinc-700 dark:text-zinc-300">{val}</td>
                                                <td className="px-2 py-1 text-right font-bold text-zinc-900 dark:text-zinc-100">{stats.qty}</td>
                                                <td className="px-2 py-1 text-right font-bold text-emerald-600">৳{stats.val.toLocaleString()}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                          <div className="flex flex-col justify-end gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(item);
                              }}
                              className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-bold transition-colors"
                            >
                              <Edit2 size={16} />
                              এডিট করুন
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(item.id);
                              }}
                              className="flex items-center justify-center gap-2 w-full py-2 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 rounded-xl text-sm font-bold transition-colors"
                            >
                              <Trash2 size={16} />
                              ডিলিট করুন
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {editingItem ? t('edit') : t('addProduct')}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('productName')} *</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('category')}</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {INVENTORY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('units')}</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. pcs, sheets"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  />
                </div>
              </div>

              {availableProperties.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {availableProperties.map(prop => (
                    <div key={prop} className="space-y-1">
                      <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 capitalize">{prop}</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                        value={formData.properties[prop] || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          properties: { ...formData.properties, [prop]: e.target.value }
                        })}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">ক্রয়মূল্য (৳)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({...formData, purchase_price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">বিক্রয়মূল্য (৳)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({...formData, selling_price: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('stock')}</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('minStock')}</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({...formData, min_stock_level: parseFloat(e.target.value) || 0})}
                  />
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
                  {editingItem ? t('update') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Category Details Modal */}
      {selectedCategoryForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-zinc-200 dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {INVENTORY_CATEGORIES.find(c => c.value === selectedCategoryForDetails)?.label} - বিস্তারিত তথ্য
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Properties ভিত্তিক মূল্য ও সংখ্যা</p>
              </div>
              <button 
                onClick={() => setSelectedCategoryForDetails(null)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <XCircle size={24} className="text-zinc-400" />
              </button>
            </div>
            <div className="p-6 overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">পণ্য</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">বৈশিষ্ট্যসমূহ</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">ক্রয়মূল্য</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">বিক্রয়মূল্য</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">সংখ্যা</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">মোট মূল্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {items.filter(i => i.category === selectedCategoryForDetails).map(item => (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item.properties || {}).map(([k, v]) => (
                            <span key={k} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">৳{item.purchase_price?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">৳{item.selling_price?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold">{item.quantity}</span> <span className="text-xs text-zinc-500">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                        ৳{(item.quantity * (item.purchase_price || 0)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold">মোট স্টক সংখ্যা</p>
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {items.filter(i => i.category === selectedCategoryForDetails).reduce((sum, i) => sum + i.quantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold">মোট স্টক মূল্য</p>
                  <p className="text-xl font-bold text-emerald-600">
                    ৳{items.filter(i => i.category === selectedCategoryForDetails).reduce((sum, i) => sum + (i.quantity * (i.purchase_price || 0)), 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCategoryForDetails(null)}
                className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
