export type Customer = {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  created_at: string;
};

export type ServiceType = 
  | 'online_application'
  | 'printing'
  | 'photocopy'
  | 'lamination'
  | 'computer_compose'
  | 'passport_photo'
  | 'job_application'
  | 'other';

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  service_type: ServiceType;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  // Printing specific fields
  is_color?: boolean;
  paper_size?: string;
  page_count?: number;
};

export type Invoice = {
  id: string;
  customer_id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: 'paid' | 'partial' | 'due';
  created_at: string;
  customers?: Customer;
  items?: InvoiceItem[];
};

export type OnlineService = {
  id: string;
  customer_id: string;
  service_name: string;
  application_id?: string;
  status: 'pending' | 'submitted' | 'processing' | 'completed' | 'failed';
  customer_link?: string;
  notes?: string;
  created_at: string;
  customers?: Customer;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchase_price: number;
  selling_price: number;
  min_stock_level: number;
  properties?: Record<string, string>;
  updated_at: string;
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
};

export type JobApplication = {
  id: string;
  office_code: string;
  applicant_name: string;
  user_id: string;
  mobile_no: string;
  amount: number;
  payment_method?: string;
  password?: string;
  status: 'pending' | 'completed' | 'paid';
  created_at: string;
  updated_at: string;
};
