import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Printer, Save, Search, User, FileText, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Customer, InvoiceItem, ServiceType } from '../types';
import { SERVICE_LABELS, SERVICE_PRICES, PAPER_SIZES } from '../constants';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';

export default function Billing() {
  const { t, language } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { service_type: 'printing', description: '', quantity: 1, unit_price: 5, total_price: 5 }
  ]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page {
        margin-top: 0.5in;
        margin-right: 0.5in;
        margin-bottom: 0.5in;
        margin-left: 0.5in;
      }
    `,
  });

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchCustomers();
    }
  }, [searchQuery]);

  const searchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${searchQuery}%,mobile.ilike.%${searchQuery}%`)
      .limit(5);
    if (data) setCustomers(data);
  };

  const addItem = () => {
    setItems([...items, { service_type: 'other', description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'service_type') {
      item.unit_price = SERVICE_PRICES[value as ServiceType] || 0;
      item.description = SERVICE_LABELS[value as ServiceType];
    }
    
    item.total_price = (item.quantity || 0) * (item.unit_price || 0);
    newItems[index] = item;
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  const dueAmount = subtotal - paidAmount;

  const saveInvoice = async () => {
    if (!selectedCustomer) {
      alert(t('selectCustomer'));
      return;
    }
    setIsSaving(true);
    
    try {
      const { data: invoice, error: invError } = await supabase
        .from('invoices')
        .insert([{
          customer_id: selectedCustomer.id,
          invoice_number: invoiceNumber,
          total_amount: subtotal,
          paid_amount: paidAmount,
          due_amount: dueAmount,
          status: dueAmount <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'due'
        }])
        .select()
        .single();

      if (invError) throw invError;

      const itemsToInsert = items.map(item => ({
        invoice_id: invoice.id,
        service_type: item.service_type,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        is_color: item.is_color,
        paper_size: item.paper_size,
        page_count: item.page_count
      }));

      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      // Add transaction
      await supabase.from('transactions').insert([{
        type: 'income',
        category: 'Service Billing',
        amount: paidAmount,
        description: `Invoice ${invoiceNumber} payment`
      }]);

      alert(language === 'bn' ? 'ইনভয়েস সফলভাবে সংরক্ষিত হয়েছে!' : 'Invoice saved successfully!');
      resetForm();
    } catch (error: any) {
      alert((language === 'bn' ? 'ইনভয়েস সংরক্ষণে ত্রুটি: ' : 'Error saving invoice: ') + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setSearchQuery('');
    setItems([{ service_type: 'printing', description: '', quantity: 1, unit_price: 5, total_price: 5 }]);
    setPaidAmount(0);
    setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('newInvoice')}</h2>
            <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400">{invoiceNumber}</span>
          </div>

          <div className="space-y-6">
            {/* Customer Selection */}
            <div className="relative">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">{t('billTo')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text" 
                  placeholder={t('searchPlaceholder')} 
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  value={selectedCustomer ? selectedCustomer.name : searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedCustomer) setSelectedCustomer(null);
                  }}
                />
              </div>
              {searchQuery && !selectedCustomer && customers.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  {customers.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setSearchQuery('');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.mobile}</p>
                      </div>
                      <ChevronRight size={16} className="text-zinc-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{t('items')}</h3>
                <button 
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  {t('addItem')}
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">{t('category')}</label>
                        <select 
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
                          value={item.service_type}
                          onChange={(e) => updateItem(index, 'service_type', e.target.value)}
                        >
                          {Object.entries(SERVICE_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">{t('quantity') || 'পরিমাণ'}</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="relative">
                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">{t('price')}</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          />
                          <button 
                            onClick={() => removeItem(index)}
                            className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {item.service_type === 'printing' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <div>
                          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">কাগজের সাইজ</label>
                          <select 
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100"
                            value={item.paper_size}
                            onChange={(e) => updateItem(index, 'paper_size', e.target.value)}
                          >
                            <option value="">সাইজ সিলেক্ট করুন</option>
                            {PAPER_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input 
                            type="checkbox" 
                            id={`color-${index}`}
                            checked={item.is_color}
                            onChange={(e) => updateItem(index, 'is_color', e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-emerald-500 focus:ring-emerald-500"
                          />
                          <label htmlFor={`color-${index}`} className="text-sm text-zinc-600 dark:text-zinc-400">কালার প্রিন্ট</label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-24 transition-colors duration-200">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6">{language === 'bn' ? 'সারসংক্ষেপ' : 'Summary'}</h3>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>{t('subtotal')}</span>
              <span className="font-semibold">৳ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>{language === 'bn' ? 'ট্যাক্স (০%)' : 'Tax (0%)'}</span>
              <span className="font-semibold">৳ 0.00</span>
            </div>
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <span>{t('total')}</span>
              <span>৳ {subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">{t('paid')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">৳</span>
                <input 
                  type="number" 
                  className="w-full pl-8 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{t('due')}</span>
              <span className={`font-bold ${dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ৳ {dueAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
            >
              <Printer size={18} />
              {language === 'bn' ? 'প্রিভিউ' : 'Preview'}
            </button>
            <button 
              onClick={saveInvoice}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? (language === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'সেভ ও প্রিন্ট' : 'Save & Print')}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Print Template */}
      <div className="hidden">
        <div ref={printRef} className="relative min-h-[1056px] p-12 pb-32 text-zinc-900 font-sans">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-3xl font-bold text-emerald-600 mb-2">কম্পসার্ভ প্রো</h1>
              <p className="text-sm text-zinc-500">কম্পিউটার সার্ভিস ও অনলাইন সেন্টার</p>
              <p className="text-sm text-zinc-500">মেইন রোড, সিটি সেন্টার, ১২৩৪৫৬</p>
              <p className="text-sm text-zinc-500">ফোন: +৯১ ৯৮৭৬৫ ৪৩২১০</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-400 mb-4">{t('billing')}</h2>
              <p className="text-sm font-bold">{t('invoiceNo')}: {invoiceNumber}</p>
              <p className="text-sm">{t('date')}: {format(new Date(), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-xs font-bold text-zinc-400 uppercase mb-2">{t('billTo')}:</h3>
            <p className="text-lg font-bold">{selectedCustomer?.name || (language === 'bn' ? 'সাধারণ কাস্টমার' : 'Walk-in Customer')}</p>
            <p className="text-sm text-zinc-600">{selectedCustomer?.mobile}</p>
            <p className="text-sm text-zinc-600">{selectedCustomer?.address}</p>
          </div>

          <table className="w-full mb-12 border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-900">
                <th className="py-3 text-left font-bold uppercase text-sm">{t('description')}</th>
                <th className="py-3 text-center font-bold uppercase text-sm">{t('quantity') || 'পরিমাণ'}</th>
                <th className="py-3 text-right font-bold uppercase text-sm">{t('price')}</th>
                <th className="py-3 text-right font-bold uppercase text-sm">{t('total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="py-4">
                    <p className="font-bold">{item.description}</p>
                    {item.paper_size && <p className="text-xs text-zinc-500">{item.paper_size} | {item.is_color ? (language === 'bn' ? 'কালার' : 'Color') : (language === 'bn' ? 'সাদা-কালো' : 'B&W')}</p>}
                  </td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">৳ {item.unit_price?.toFixed(2)}</td>
                  <td className="py-4 text-right font-bold">৳ {item.total_price?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-zinc-600">
                <span>{t('subtotal')}</span>
                <span>৳ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>{t('paid')}</span>
                <span>৳ {paidAmount.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t-2 border-zinc-900 flex justify-between text-xl font-bold">
                <span>{t('due')}</span>
                <span>৳ {dueAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="absolute left-12 right-12 bottom-10 border-t border-zinc-100 pt-6 text-center text-zinc-400 text-xs">
            <p>{language === 'bn' ? 'আমাদের সাথে ব্যবসা করার জন্য ধন্যবাদ!' : 'Thank you for doing business with us!'}</p>
            <p>{language === 'bn' ? 'এটি একটি কম্পিউটার জেনারেটেড ইনভয়েস।' : 'This is a computer generated invoice.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
