import { ServiceType } from './types';

export const SERVICE_LABELS: Record<ServiceType, string> = {
  online_application: 'অনলাইন আবেদন',
  printing: 'প্রিন্টিং',
  photocopy: 'ফটোকপি',
  lamination: 'ল্যামিনেশন',
  computer_compose: 'কম্পিউটার কম্পোজ',
  passport_photo: 'পাসপোর্ট ফটো',
  job_application: 'চাকরির আবেদন',
  other: 'অন্যান্য সার্ভিস',
};

export const SERVICE_PRICES: Record<ServiceType, number> = {
  online_application: 50,
  printing: 5,
  photocopy: 2,
  lamination: 20,
  computer_compose: 100,
  passport_photo: 50,
  job_application: 30,
  other: 0,
};

export const PAPER_SIZES = ['A4', 'Legal', 'A3', 'Letter'];

export const INVENTORY_CATEGORIES = [
  { value: 'paper', label: 'কাগজ', properties: 'size, brand, gsm' },
  { value: 'ink', label: 'কালি', properties: 'color, brand, volume' },
  { value: 'toner', label: 'টোনার', properties: 'model, brand, color' },
  { value: 'lamination_film', label: 'ল্যামিনেশন ফিল্ম', properties: 'size, thickness' },
  { value: 'other', label: 'অন্যান্য', properties: 'brand, type' },
];

export const ONLINE_SERVICE_STATUSES = [
  { value: 'pending', label: 'অপেক্ষমান' },
  { value: 'submitted', label: 'জমা দেওয়া হয়েছে' },
  { value: 'processing', label: 'প্রসেসিং হচ্ছে' },
  { value: 'completed', label: 'সম্পন্ন' },
  { value: 'failed', label: 'ব্যর্থ' },
];

export const PAYMENT_METHODS_STORAGE_KEY = 'payment_methods_v1';
export const DEFAULT_PAYMENT_METHODS = ['Cash', 'Bkash', 'Nagad'];

export const SHOP_INFO_STORAGE_KEY = 'shop_info_v1';
export const INVOICE_TEMPLATE_STORAGE_KEY = 'invoice_template_v1';

export const DEFAULT_SHOP_INFO = {
  name: '',
  owner: '',
  address: '',
  mobile: '',
  email: '',
};

export const DEFAULT_INVOICE_TEMPLATE = {
  heading: 'Invoice',
  footerLine1: 'Thank you for doing business with us!',
  footerLine2: 'This is a computer generated invoice.',
};

