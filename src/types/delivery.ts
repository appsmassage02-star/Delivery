export type DeliveryOrderStatus = 
  | 'pending_review'
  | 'accepted'
  | 'cancellation_pending'
  | 'cancelled'
  | 'completed';

export interface DeliverySettings {
  id: string;
  delivery_enabled: boolean;
  updated_at?: string;
  created_at?: string;
}

export interface DeliveryDriver {
  id: string;
  user_id: string; // references auth.users.id
  full_name: string;
  phone: string;
  role: 'delivery_driver';
  vehicle_type?: string;
  national_id?: string;
  license_number?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

export interface DeliveryOrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface DeliveryOrder {
  id: string;
  order_number: string;
  household_id: string;
  household_name?: string;
  customer_name: string;
  phone_number: string;
  governorate: string; // المحافظة
  center: string; // المركز
  detailed_address: string; // العنوان التفصيلي
  items_total: number; // إجمالي المشتريات
  delivery_fee: number; // تكلفة التوصيل
  total_amount: number; // الإجمالي النهائي
  notes?: string; // الملاحظات
  status: DeliveryOrderStatus;
  assigned_driver_id?: string | null;
  accepted_at?: string | null;
  delivered_at?: string | null;
  cancellation_reason?: string | null;
  cancellation_requested_by?: string | null;
  cancellation_requested_at?: string | null;
  invoice_id?: string | null;
  created_at: string;
  updated_at?: string;
  items?: DeliveryOrderItem[];
}

export interface DeliveryOrderStatusHistory {
  id: string;
  order_id: string;
  previous_status: DeliveryOrderStatus | null;
  new_status: DeliveryOrderStatus;
  changed_by: string; // user_id or driver_id
  changed_by_role: 'delivery_driver' | 'admin' | 'system';
  notes?: string | null;
  created_at: string;
}

export interface VerificationTestResult {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'passed' | 'failed';
  errorDetails?: string;
  timestamp?: string;
}
