import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

interface Translations {
  [key: string]: {
    en: string;
    bn: string;
  };
}

export const translations: Translations = {
  // Navigation
  logo: { en: 'CompServPro', bn: 'কম্পসার্ভপ্রো' },
  dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  customers: { en: 'Customers', bn: 'কাস্টমার' },
  billing: { en: 'Billing', bn: 'বিলিং' },
  onlineServices: { en: 'Online Services', bn: 'অনলাইন সার্ভিস' },
  inventory: { en: 'Inventory', bn: 'ইনভেন্টরি' },
  finance: { en: 'Finance', bn: 'আয় ও ব্যয়' },
  reports: { en: 'Reports', bn: 'রিপোর্ট' },
  jobApplications: { en: 'Job Application Manager', bn: 'চাকরি আবেদন ম্যানেজার' },
  categories: { en: 'Categories', bn: 'ক্যাটাগরি' },
  units: { en: 'Units', bn: 'ইউনিট' },
  settings: { en: 'Settings', bn: 'সেটিংস' },
  
  // Layout
  systemTitle: { en: 'Shop Management System', bn: 'দোকান ব্যবস্থাপনা সিস্টেম' },
  adminUser: { en: 'Admin User', bn: 'এডমিন ইউজার' },
  superAdmin: { en: 'Super Admin', bn: 'সুপার এডমিন' },
  
  // Dashboard
  overview: { en: 'Dashboard Overview', bn: 'ড্যাশবোর্ড ওভারভিউ' },
  welcome: { en: 'Welcome! See your shop status today.', bn: 'স্বাগতম! আজ আপনার দোকানের অবস্থা দেখুন।' },
  today: { en: 'Today', bn: 'আজ' },
  week: { en: 'Week', bn: 'সপ্তাহ' },
  month: { en: 'Month', bn: 'মাস' },
  todayIncome: { en: "Today's Income", bn: 'আজকের আয়' },
  todayExpense: { en: "Today's Expense", bn: 'আজকের খরচ' },
  totalCustomers: { en: 'Total Customers', bn: 'মোট কাস্টমার' },
  pendingJobs: { en: 'Pending Jobs', bn: 'বাকি কাজ' },
  incomeVsExpense: { en: 'Income vs Expense', bn: 'আয় বনাম খরচ' },
  recentActivity: { en: 'Recent Activity', bn: 'সাম্প্রতিক কার্যক্রম' },
  viewAllActivity: { en: 'View All Activity', bn: 'সব কার্যক্রম দেখুন' },
  lowStockAlert: { en: 'Warning: {count} items are low in stock. Please check inventory.', bn: 'সতর্কতা: {count}টি আইটেম স্টকে কম আছে। অনুগ্রহ করে ইনভেন্টরি চেক করুন।' },

  // Customers
  customersTitle: { en: 'Customer Management', bn: 'কাস্টমার ব্যবস্থাপনা' },
  customersDesc: { en: 'Manage your customer database and view their history.', bn: 'আপনার কাস্টমার ডাটাবেস পরিচালনা করুন এবং তাদের ইতিহাস দেখুন।' },
  addCustomer: { en: 'Add New Customer', bn: 'নতুন কাস্টমার যোগ করুন' },
  addCustomerInline: { en: 'Add customer from invoice', bn: 'ইনভয়েস থেকে কাস্টমার যোগ করুন' },
  createCustomerAndSelect: { en: 'Create and select customer', bn: 'কাস্টমার তৈরি করে সিলেক্ট করুন' },
  customerSaved: { en: 'Customer added successfully.', bn: 'কাস্টমার সফলভাবে যোগ হয়েছে।' },
  customerSaveError: { en: 'Error saving customer: ', bn: 'কাস্টমার সেভ করতে সমস্যা: ' },
  searchPlaceholder: { en: 'Search by name or mobile number...', bn: 'নাম বা মোবাইল নম্বর দিয়ে খুঁজুন...' },
  customer: { en: 'Customer', bn: 'কাস্টমার' },
  contact: { en: 'Contact', bn: 'যোগাযোগ' },
  address: { en: 'Address', bn: 'ঠিকানা' },
  joinDate: { en: 'Join Date', bn: 'যোগদানের তারিখ' },
  action: { en: 'Action', bn: 'অ্যাকশন' },
  edit: { en: 'Edit', bn: 'সম্পাদনা' },
  history: { en: 'History', bn: 'ইতিহাস' },
  delete: { en: 'Delete', bn: 'মুছে ফেলুন' },
  editCustomer: { en: 'Edit Customer Info', bn: 'কাস্টমার তথ্য পরিবর্তন' },
  fullName: { en: 'Full Name *', bn: 'পুরো নাম *' },
  mobileNumber: { en: 'Mobile Number *', bn: 'মোবাইল নম্বর *' },
  emailAddress: { en: 'Email Address', bn: 'ইমেইল ঠিকানা' },
  update: { en: 'Update', bn: 'আপডেট করুন' },
  confirmDelete: { en: 'Are you sure you want to delete this?', bn: 'আপনি কি নিশ্চিত যে আপনি এটি মুছে ফেলতে চান?' },

  // Billing
  newInvoice: { en: 'New Invoice', bn: 'নতুন ইনভয়েস' },
  billingDesc: { en: 'Create and manage invoices for your services.', bn: 'আপনার সেবার জন্য ইনভয়েস তৈরি এবং পরিচালনা করুন।' },
  invoiceNo: { en: 'Invoice No', bn: 'ইনভয়েস নং' },
  billTo: { en: 'Bill To', bn: 'বিল টু' },
  items: { en: 'Items', bn: 'আইটেম' },
  total: { en: 'Total', bn: 'মোট' },
  paid: { en: 'Paid', bn: 'পরিশোধিত' },
  due: { en: 'Due', bn: 'বকেয়া' },
  print: { en: 'Print', bn: 'প্রিন্ট' },
  addItem: { en: 'Add Item', bn: 'আইটেম যোগ করুন' },
  subtotal: { en: 'Subtotal', bn: 'সাবটোটাল' },
  discount: { en: 'Discount', bn: 'ডিসকাউন্ট' },
  grandTotal: { en: 'Grand Total', bn: 'সর্বমোট' },
  createInvoice: { en: 'Create Invoice', bn: 'ইনভয়েস তৈরি করুন' },

  // Inventory
  inventoryTitle: { en: 'Inventory Management', bn: 'ইনভেন্টরি ব্যবস্থাপনা' },
  inventoryDesc: { en: 'Manage your stock and products.', bn: 'আপনার স্টক এবং পণ্য পরিচালনা করুন।' },
  addProduct: { en: 'Add New Product', bn: 'নতুন পণ্য যোগ করুন' },
  productName: { en: 'Product Name', bn: 'পণ্যের নাম' },
  category: { en: 'Category', bn: 'ক্যাটাগরি' },
  stock: { en: 'Stock', bn: 'স্টক' },
  price: { en: 'Price', bn: 'মূল্য' },
  minStock: { en: 'Min Stock', bn: 'মিনিমাম স্টক' },
  outOfStock: { en: 'Out of Stock', bn: 'স্টক শেষ' },
  lowStock: { en: 'Low Stock', bn: 'স্টক কম' },
  inStock: { en: 'In Stock', bn: 'স্টক আছে' },

  // Finance
  financeTitle: { en: 'Income & Expense', bn: 'আয় ও ব্যয়' },
  financeDesc: { en: 'Track your shop transactions.', bn: 'আপনার দোকানের আর্থিক লেনদেন ট্র্যাক করুন।' },
  addTransaction: { en: 'Add Transaction', bn: 'লেনদেন যোগ করুন' },
  totalIncome: { en: 'Total Income', bn: 'মোট আয়' },
  totalExpense: { en: 'Total Expense', bn: 'মোট ব্যয়' },
  netBalance: { en: 'Net Balance', bn: 'নিট ব্যালেন্স' },
  recentTransactions: { en: 'Recent Transactions', bn: 'সাম্প্রতিক লেনদেন' },
  filter: { en: 'Filter', bn: 'ফিল্টার' },
  date: { en: 'Date', bn: 'তারিখ' },
  description: { en: 'Description', bn: 'বিবরণ' },
  amount: { en: 'Amount', bn: 'পরিমাণ' },
  income: { en: 'Income', bn: 'আয়' },
  expense: { en: 'Expense', bn: 'ব্যয়' },
  cancel: { en: 'Cancel', bn: 'বাতিল' },
  save: { en: 'Save', bn: 'সংরক্ষণ করুন' },
  loading: { en: 'Loading...', bn: 'লোড হচ্ছে...' },
  noTransactions: { en: 'No transactions found.', bn: 'কোনো লেনদেন পাওয়া যায়নি।' },

  // Online Services
  onlineServicesTitle: { en: 'Online Service Tracking', bn: 'অনলাইন সার্ভিস ট্র্যাকিং' },
  onlineServicesDesc: { en: 'Track status of online applications.', bn: 'অনলাইন আবেদন এবং সেগুলোর বর্তমান অবস্থা ট্র্যাক করুন।' },
  newApplication: { en: 'New Application', bn: 'নতুন আবেদন' },
  appId: { en: 'App ID', bn: 'অ্যাপ আইডি' },
  status: { en: 'Status', bn: 'অবস্থা' },
  viewApplication: { en: 'View Application', bn: 'আবেদন দেখুন' },
  selectCustomer: { en: 'Select Customer', bn: 'কাস্টমার সিলেক্ট করুন' },
  serviceName: { en: 'Service Name', bn: 'সার্ভিসের নাম' },
  applicationId: { en: 'Application ID', bn: 'অ্যাপ্লিকেশন আইডি' },
  customerLink: { en: 'Customer Link (URL)', bn: 'কাস্টমার লিংক (URL)' },
  saveTracking: { en: 'Save Tracking', bn: 'ট্র্যাকিং সেভ করুন' },
  setStatus: { en: 'Set Status', bn: 'অবস্থা সেট করুন' },

  // Reports
  reportsTitle: { en: 'Business Reports', bn: 'ব্যবসায়িক রিপোর্ট' },
  reportsDesc: { en: 'Analyze your shop performance.', bn: 'আপনার দোকানের পারফরম্যান্স এবং প্রবৃদ্ধি বিশ্লেষণ করুন।' },
  exportPdf: { en: 'Export PDF', bn: 'পিডিএফ এক্সপোর্ট' },
  thisWeek: { en: 'This Week', bn: 'এই সপ্তাহ' },
  thisMonth: { en: 'This Month', bn: 'এই মাস' },
  thisYear: { en: 'This Year', bn: 'এই বছর' },
  serviceDistribution: { en: 'Service Distribution', bn: 'সার্ভিস ভিত্তিক বন্টন' },
  monthlyPerformance: { en: 'Monthly Performance', bn: 'মাসিক পারফরম্যান্স' },
  viewAnalytics: { en: 'View Detailed Analytics', bn: 'বিস্তারিত অ্যানালিটিক্স দেখুন' },
  printing: { en: 'Printing & Photocopy', bn: 'প্রিন্টিং ও ফটোকপি' },
  jobApplication: { en: 'Job Application', bn: 'চাকরির আবেদন' },
  otherServices: { en: 'Other Services', bn: 'অন্যান্য সার্ভিস' },

  // Settings
  settingsTitle: { en: 'Settings', bn: 'সেটিংস' },
  settingsDesc: { en: 'Manage your shop profile and system preferences.', bn: 'আপনার দোকানের প্রোফাইল এবং সিস্টেম পছন্দসমূহ পরিচালনা করুন।' },
  shopInfo: { en: 'Shop Information', bn: 'দোকানের তথ্য' },
  shopName: { en: 'Shop Name', bn: 'দোকানের নাম' },
  ownerName: { en: 'Owner Name', bn: 'মালিকের নাম' },
  shopAddress: { en: 'Shop Address', bn: 'দোকানের ঠিকানা' },
  shopMobile: { en: 'Shop Mobile', bn: 'দোকানের মোবাইল' },
  shopEmail: { en: 'Shop Email', bn: 'দোকানের ইমেইল' },
  systemPreferences: { en: 'System Preferences', bn: 'সিস্টেম পছন্দসমূহ' },
  defaultLanguage: { en: 'Default Language', bn: 'ডিফল্ট ভাষা' },
  themeMode: { en: 'Theme Mode', bn: 'থিম মোড' },
  backupData: { en: 'Backup & Restore', bn: 'ব্যাকআপ এবং রিস্টোর' },
  exportData: { en: 'Export All Data', bn: 'সব ডাটা এক্সপোর্ট করুন' },
  importData: { en: 'Import Data', bn: 'ডাটা ইমপোর্ট করুন' },
  saveSettings: { en: 'Save Settings', bn: 'সেটিংস সেভ করুন' },
  // Auth
  login: { en: 'Login', bn: 'লগইন' },
  logout: { en: 'Logout', bn: 'লগআউট' },
  username: { en: 'Username', bn: 'ইউজারনেম' },
  password: { en: 'Password', bn: 'পাসওয়ার্ড' },
  signIn: { en: 'Sign In', bn: 'সাইন ইন' },
  welcomeBack: { en: 'Welcome Back', bn: 'আবার স্বাগতম' },
  authError: { en: 'Invalid username or password', bn: 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়' },
  rememberMe: { en: 'Remember Me', bn: 'মনে রাখুন' },
  // User Management
  userManagement: { en: 'User Management', bn: 'ইউজার ব্যবস্থাপনা' },
  userManagementDesc: { en: 'Manage system users and their permissions.', bn: 'সিস্টেম ইউজার এবং তাদের পারমিশন পরিচালনা করুন।' },
  addUser: { en: 'Add New User', bn: 'নতুন ইউজার যোগ করুন' },
  role: { en: 'Role', bn: 'রোল' },
  userType: { en: 'User Type', bn: 'ইউজার টাইপ' },
  admin: { en: 'Admin', bn: 'এডমিন' },
  staff: { en: 'Staff', bn: 'স্টাফ' },
  owner: { en: 'Owner', bn: 'মালিক' },
  manager: { en: 'Manager', bn: 'ম্যানেজার' },
  operator: { en: 'Operator', bn: 'অপারেটর' },
  lastLogin: { en: 'Last Login', bn: 'সর্বশেষ লগইন' },
  userStatus: { en: 'Status', bn: 'অবস্থা' },
  active: { en: 'Active', bn: 'সক্রিয়' },
  inactive: { en: 'Inactive', bn: 'নিষ্ক্রিয়' },
  editUser: { en: 'Edit User', bn: 'ইউজার পরিবর্তন' },
  email: { en: 'Email', bn: 'ইমেইল' },
  // Permission Management
  permissions: { en: 'Permissions', bn: 'পারমিশন' },
  permissionManagement: { en: 'Permission Management', bn: 'পারমিশন ব্যবস্থাপনা' },
  rolesAndPermissions: { en: 'Roles & Permissions', bn: 'রোল এবং পারমিশন' },
  managePermissions: { en: 'Manage Permissions', bn: 'পারমিশন পরিচালনা' },
  moduleName: { en: 'Module Name', bn: 'মডিউলের নাম' },
  read: { en: 'Read', bn: 'দেখা' },
  write: { en: 'Write', bn: 'লেখা/তৈরি' },
  deletePerm: { en: 'Delete', bn: 'মুছে ফেলা' },
  updatePerm: { en: 'Update', bn: 'পরিবর্তন' },
  accessDenied: { en: 'Access Denied', bn: 'প্রবেশাধিকার নেই' },
  noPermissionMsg: { en: 'You do not have permission to access this module.', bn: 'এই মডিউলে আপনার প্রবেশের অনুমতি নেই।' },
  categoryManagement: { en: 'Category Management', bn: 'ক্যাটাগরি ব্যবস্থাপনা' },
  categoryManagementDesc: { en: 'Manage categories for inventory and finance.', bn: 'ইনভেন্টরি এবং আর্থিক লেনদেনের ক্যাটাগরি পরিচালনা করুন।' },
  addCategory: { en: 'Add Category', bn: 'ক্যাটাগরি যোগ করুন' },
  editCategory: { en: 'Edit Category', bn: 'ক্যাটাগরি পরিবর্তন' },
  categoryName: { en: 'Category Name', bn: 'ক্যাটাগরির নাম' },
  module: { en: 'Module', bn: 'মডিউল' },
  properties: { en: 'Properties', bn: 'বৈশিষ্ট্যসমূহ' },
  unitManagement: { en: 'Unit Management', bn: 'ইউনিট ব্যবস্থাপনা' },
  unitManagementDesc: { en: 'Manage measurement units for your products.', bn: 'আপনার পণ্যের পরিমাপের ইউনিটগুলো পরিচালনা করুন।' },
  addUnit: { en: 'Add Unit', bn: 'ইউনিট যোগ করুন' },
  editUnit: { en: 'Edit Unit', bn: 'ইউনিট পরিবর্তন' },
  unitName: { en: 'Unit Name', bn: 'ইউনিটের নাম' },
  shortName: { en: 'Short Name', bn: 'সংক্ষিপ্ত নাম' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'bn';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, params?: Record<string, any>) => {
    const translation = translations[key];
    if (!translation) return key;
    
    let text = translation[language];
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
