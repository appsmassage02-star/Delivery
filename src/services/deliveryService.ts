import { 
  DeliveryOrder, 
  DeliveryOrderItem, 
  DeliveryOrderStatusHistory, 
  DeliveryDriver, 
  DeliverySettings,
  DeliveryOrderStatus
} from '../types/delivery';
import { getSupabaseClient } from '../lib/supabase';

// دالة فحص وتوليد معرّفات UUID صالحة لـ PostgreSQL
export function isValidUUID(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// بيانات تجريبية أولية بمعرفات UUID صالحة 100% لـ PostgreSQL
const INITIAL_DRIVERS: DeliveryDriver[] = [
  {
    id: 'd1010101-0000-0000-0000-000000000001',
    user_id: 'u1010101-0000-0000-0000-000000000001',
    full_name: 'أحمد محمود (كابتن دليفري)',
    phone: '01012345678',
    role: 'delivery_driver',
    vehicle_type: 'دراجة نارية',
    is_active: true,
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'd2020202-0000-0000-0000-000000000002',
    user_id: 'u2020202-0000-0000-0000-000000000002',
    full_name: 'محمد إبراهيم (كابتن دليفري)',
    phone: '01198765432',
    role: 'delivery_driver',
    vehicle_type: 'سيارة صغيرة',
    is_active: true,
    created_at: '2026-03-05T12:00:00Z',
  },
];

const INITIAL_SETTINGS: DeliverySettings = {
  id: 'e0000001-0000-4000-8000-000000000001',
  delivery_enabled: true,
  updated_at: new Date().toISOString(),
  created_at: '2026-01-01T00:00:00Z',
};

const INITIAL_ORDERS: DeliveryOrder[] = [
  {
    id: 'b1001001-0000-4000-8000-000000001001',
    order_number: 'ORD-2026-8801',
    household_id: 'h1001001-0000-4000-8000-000000000001',
    household_name: 'منزل عائلة السعيد',
    customer_name: 'أحمد السعيد',
    phone_number: '01099887766',
    governorate: 'القاهرة',
    center: 'مدينة نصر',
    detailed_address: 'شارع عباس العقاد - عمارة 45 - الدور الثالث شقة 6',
    items_total: 350.00,
    delivery_fee: 30.00,
    total_amount: 380.00,
    notes: 'الرجاء الاتصال قبل الصعود للمنزل',
    status: 'pending_review',
    assigned_driver_id: null,
    accepted_at: null,
    delivered_at: null,
    cancellation_reason: null,
    cancellation_requested_by: null,
    cancellation_requested_at: null,
    invoice_id: 'a1001001-0000-4000-8000-000000000001',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    items: [
      { id: 'c1001001-0000-4000-8000-000000000001', order_id: 'b1001001-0000-4000-8000-000000001001', product_name: 'لبن كامل الدسم 1 لتر', quantity: 2, unit_price: 35.00, total_price: 70.00 },
      { id: 'c1001001-0000-4000-8000-000000000002', order_id: 'b1001001-0000-4000-8000-000000001001', product_name: 'جبن أبيض براميلي 500 جم', quantity: 1, unit_price: 85.00, total_price: 85.00 },
      { id: 'c1001001-0000-4000-8000-000000000003', order_id: 'b1001001-0000-4000-8000-000000001001', product_name: 'أرز فاخر 5 كجم', quantity: 1, unit_price: 195.00, total_price: 195.00 },
    ],
  },
  {
    id: 'b1002002-0000-4000-8000-000000001002',
    order_number: 'ORD-2026-8802',
    household_id: 'h1002002-0000-4000-8000-000000000002',
    household_name: 'شقة المهندس طارق',
    customer_name: 'طارق عبد العزيز',
    phone_number: '01233445566',
    governorate: 'الجيزة',
    center: 'الدقي',
    detailed_address: 'ميدان المساحة - شارع مصدق - برج النخيل الدور 8',
    items_total: 480.00,
    delivery_fee: 35.00,
    total_amount: 515.00,
    notes: 'الدفع نقداً عند الاستلام مع فكة 1000 جنيه',
    status: 'accepted',
    assigned_driver_id: 'd1010101-0000-0000-0000-000000000001',
    accepted_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    delivered_at: null,
    cancellation_reason: null,
    cancellation_requested_by: null,
    cancellation_requested_at: null,
    invoice_id: 'a1002002-0000-4000-8000-000000000002',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'c1002002-0000-4000-8000-000000000001', order_id: 'b1002002-0000-4000-8000-000000001002', product_name: 'زيت زيتون بكر ممتاز 750 مل', quantity: 2, unit_price: 180.00, total_price: 360.00 },
      { id: 'c1002002-0000-4000-8000-000000000002', order_id: 'b1002002-0000-4000-8000-000000001002', product_name: 'مكرونة أصناف متنوعة 400 جم', quantity: 6, unit_price: 20.00, total_price: 120.00 },
    ],
  },
  {
    id: 'b1003003-0000-4000-8000-000000001003',
    order_number: 'ORD-2026-8803',
    household_id: 'h1003003-0000-4000-8000-000000000003',
    household_name: 'منزل الحاج خليل',
    customer_name: 'خليل عمر',
    phone_number: '01555443322',
    governorate: 'القاهرة',
    center: 'المعادي',
    detailed_address: 'شارع 9 - عمارة 12 - أمام محطة المترو',
    items_total: 210.00,
    delivery_fee: 25.00,
    total_amount: 235.00,
    notes: 'الموقع تم تحديده هاتفياً',
    status: 'cancellation_pending',
    assigned_driver_id: 'd1010101-0000-0000-0000-000000000001',
    accepted_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    delivered_at: null,
    cancellation_reason: 'العميل لا يرد على الهاتف منذ نصف ساعة والعنوان مغلق',
    cancellation_requested_by: 'd1010101-0000-0000-0000-000000000001',
    cancellation_requested_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    invoice_id: 'a1003003-0000-4000-8000-000000000003',
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    items: [
      { id: 'c1003003-0000-4000-8000-000000000001', order_id: 'b1003003-0000-4000-8000-000000001003', product_name: 'مسحوق غسيل أوتوماتيك 3 كجم', quantity: 1, unit_price: 210.00, total_price: 210.00 },
    ],
  },
  {
    id: 'b1004004-0000-4000-8000-000000001004',
    order_number: 'ORD-2026-8799',
    household_id: 'h1004004-0000-4000-8000-000000000004',
    household_name: 'فيلا الدكتور ماجد',
    customer_name: 'ماجد الشريف',
    phone_number: '01011122233',
    governorate: 'القاهرة',
    center: 'التجمع الخامس',
    detailed_address: 'حي النرجس - فيلا 74 - بجوار مسجد المصطفى',
    items_total: 620.00,
    delivery_fee: 45.00,
    total_amount: 665.00,
    notes: 'تم الاستلام والدفع فيزا',
    status: 'completed',
    assigned_driver_id: 'd1010101-0000-0000-0000-000000000001',
    accepted_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    cancellation_reason: null,
    cancellation_requested_by: null,
    cancellation_requested_at: null,
    invoice_id: 'a1004004-0000-4000-8000-000000000004',
    created_at: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    items: [
      { id: 'c1004004-0000-4000-8000-000000000001', order_id: 'b1004004-0000-4000-8000-000000001004', product_name: 'دجاج بلدي طازج 2 حبة', quantity: 2, unit_price: 190.00, total_price: 380.00 },
      { id: 'c1004004-0000-4000-8000-000000000002', order_id: 'b1004004-0000-4000-8000-000000001004', product_name: 'خضروات موسمية مشكلة', quantity: 1, unit_price: 240.00, total_price: 240.00 },
    ],
  },
  {
    id: 'b9999999-0000-4000-8000-000000009999',
    order_number: 'ORD-2026-8750',
    household_id: 'h9999999-0000-4000-8000-000000000099',
    household_name: 'منزل سائق آخر',
    customer_name: 'كريم مجدي',
    phone_number: '01000000099',
    governorate: 'الإسكندرية',
    center: 'سيدي جابر',
    detailed_address: 'شارع بورسعيد',
    items_total: 150.00,
    delivery_fee: 20.00,
    total_amount: 170.00,
    notes: 'خاص بسائق آخر للاختبار الأمني',
    status: 'accepted',
    assigned_driver_id: 'd2020202-0000-0000-0000-000000000002',
    accepted_at: new Date().toISOString(),
    delivered_at: null,
    cancellation_reason: null,
    cancellation_requested_by: null,
    cancellation_requested_at: null,
    invoice_id: 'a9999999-0000-4000-8000-000000000099',
    created_at: new Date().toISOString(),
    items: [],
  }
];

const INITIAL_HISTORY: DeliveryOrderStatusHistory[] = [
  {
    id: 'f1001001-0000-4000-8000-000000000001',
    order_id: 'b1001001-0000-4000-8000-000000001001',
    previous_status: null,
    new_status: 'pending_review',
    changed_by: 'd1010101-0000-0000-0000-000000000001',
    changed_by_role: 'system',
    notes: 'تم إنشاء الطلب وجاهز للتوصيل',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'f1002002-0000-4000-8000-000000000001',
    order_id: 'b1002002-0000-4000-8000-000000001002',
    previous_status: null,
    new_status: 'pending_review',
    changed_by: 'd1010101-0000-0000-0000-000000000001',
    changed_by_role: 'system',
    notes: 'تم إنشاء الطلب',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'f1002002-0000-4000-8000-000000000002',
    order_id: 'b1002002-0000-4000-8000-000000001002',
    previous_status: 'pending_review',
    new_status: 'accepted',
    changed_by: 'd1010101-0000-0000-0000-000000000001',
    changed_by_role: 'delivery_driver',
    notes: 'تم قبول الطلب وبدء رحلة التوصيل',
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'f1003003-0000-4000-8000-000000000001',
    order_id: 'b1003003-0000-4000-8000-000000001003',
    previous_status: 'accepted',
    new_status: 'cancellation_pending',
    changed_by: 'd1010101-0000-0000-0000-000000000001',
    changed_by_role: 'delivery_driver',
    notes: 'طلب إلغاء من السائق بانتظار قرار الإدارة: العميل لا يرد على الهاتف منذ نصف ساعة والعنوان مغلق',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'f1004004-0000-4000-8000-000000000001',
    order_id: 'b1004004-0000-4000-8000-000000001004',
    previous_status: 'accepted',
    new_status: 'completed',
    changed_by: 'd1010101-0000-0000-0000-000000000001',
    changed_by_role: 'delivery_driver',
    notes: 'تم تسليم الطلب للعميل بنجاح',
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
];

// تخزين محلي متزامن
const LOCAL_STORAGE_ORDERS = 'talabat_albayt_delivery_orders_v3';
const LOCAL_STORAGE_SETTINGS = 'talabat_albayt_delivery_settings_v3';
const LOCAL_STORAGE_HISTORY = 'talabat_albayt_delivery_history_v3';
const LOCAL_STORAGE_DRIVERS = 'talabat_albayt_delivery_drivers_v3';

class DeliveryRepository {
  private orders: DeliveryOrder[] = [];
  private settings: DeliverySettings = INITIAL_SETTINGS;
  private history: DeliveryOrderStatusHistory[] = [];
  private drivers: DeliveryDriver[] = INITIAL_DRIVERS;

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage() {
    try {
      const storedOrders = localStorage.getItem(LOCAL_STORAGE_ORDERS);
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        const hasLegacy = Array.isArray(parsed) && parsed.some((o: any) => !isValidUUID(o.id));
        if (hasLegacy || !Array.isArray(parsed) || parsed.length === 0) {
          this.orders = [...INITIAL_ORDERS];
          this.saveOrders();
        } else {
          this.orders = parsed;
        }
      } else {
        this.orders = [...INITIAL_ORDERS];
        this.saveOrders();
      }

      const storedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS);
      if (storedSettings) {
        this.settings = JSON.parse(storedSettings);
      } else {
        this.settings = { ...INITIAL_SETTINGS };
        this.saveSettings();
      }

      const storedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY);
      if (storedHistory) {
        const parsedHist = JSON.parse(storedHistory);
        const hasLegacyHist = Array.isArray(parsedHist) && parsedHist.some((h: any) => !isValidUUID(h.order_id));
        if (hasLegacyHist || !Array.isArray(parsedHist) || parsedHist.length === 0) {
          this.history = [...INITIAL_HISTORY];
          this.saveHistory();
        } else {
          this.history = parsedHist;
        }
      } else {
        this.history = [...INITIAL_HISTORY];
        this.saveHistory();
      }

      const storedDrivers = localStorage.getItem(LOCAL_STORAGE_DRIVERS);
      if (storedDrivers) {
        const parsedDrivers = JSON.parse(storedDrivers);
        if (Array.isArray(parsedDrivers) && parsedDrivers.length > 0) {
          this.drivers = parsedDrivers;
        } else {
          this.drivers = [...INITIAL_DRIVERS];
          this.saveDrivers();
        }
      } else {
        this.drivers = [...INITIAL_DRIVERS];
        this.saveDrivers();
      }
    } catch {
      this.orders = [...INITIAL_ORDERS];
      this.settings = { ...INITIAL_SETTINGS };
      this.history = [...INITIAL_HISTORY];
      this.drivers = [...INITIAL_DRIVERS];
    }
  }

  private saveOrders() {
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(this.orders));
    } catch {
      // ignore
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY, JSON.stringify(this.history));
    } catch {
      // ignore
    }
  }

  private saveDrivers() {
    try {
      localStorage.setItem(LOCAL_STORAGE_DRIVERS, JSON.stringify(this.drivers));
    } catch {
      // ignore
    }
  }

  // =========================================================================
  // 1. إدارة الإعدادات (Delivery Settings)
  // =========================================================================
  public async getSettings(): Promise<DeliverySettings> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('delivery_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          this.settings = data as DeliverySettings;
          return this.settings;
        }
      } catch (err) {
        console.warn('Supabase getSettings failed, using local:', err);
      }
    }
    return { ...this.settings };
  }

  public async toggleDeliveryService(enabled: boolean): Promise<DeliverySettings> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from('delivery_settings')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (existing) {
          const { data, error } = await supabase
            .from('delivery_settings')
            .update({ delivery_enabled: enabled, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single();

          if (!error && data) {
            this.settings = data as DeliverySettings;
            this.saveSettings();
            return this.settings;
          }
        }
      } catch (err) {
        console.warn('Supabase toggleDeliveryService failed, using local:', err);
      }
    }

    this.settings.delivery_enabled = enabled;
    this.settings.updated_at = new Date().toISOString();
    this.saveSettings();
    return { ...this.settings };
  }

  public async updateSettings(enabled: boolean): Promise<DeliverySettings> {
    return this.toggleDeliveryService(enabled);
  }

  public resetAllToSeed(): void {
    this.orders = [...INITIAL_ORDERS];
    this.settings = { ...INITIAL_SETTINGS };
    this.history = [...INITIAL_HISTORY];
    this.drivers = [...INITIAL_DRIVERS];
    this.saveOrders();
    this.saveSettings();
    this.saveHistory();
    this.saveDrivers();
  }

  // =========================================================================
  // 2. إدارة السائقين والطلبات (Drivers & Orders)
  // =========================================================================
  public async getDrivers(): Promise<DeliveryDriver[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('delivery_drivers')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          this.drivers = data as DeliveryDriver[];
          this.saveDrivers();
          return data as DeliveryDriver[];
        }
      } catch (err) {
        console.warn('Supabase getDrivers failed:', err);
      }
    }
    return [...this.drivers];
  }

  // تسجيل كابتن دليفري جديد وربطه بالصلاحيات
  public async registerDriver(data: {
    full_name: string;
    phone: string;
    vehicle_type: string;
    national_id?: string;
    license_number?: string;
    email?: string;
    password?: string;
  }): Promise<DeliveryDriver> {
    const cleanName = data.full_name?.trim();
    const cleanPhone = data.phone?.trim();
    const cleanVehicle = data.vehicle_type?.trim() || 'دراجة نارية (موتوسيكل)';
    const cleanNationalId = data.national_id?.trim();
    const cleanLicense = data.license_number?.trim();
    const cleanEmail = data.email?.trim();

    if (!cleanName) {
      throw new Error('الاسم الكامل إجباري لإتمام تسجيل كابتن الدليفري');
    }
    if (!cleanPhone) {
      throw new Error('رقم الهاتف إجباري لتوثيق هوية الكابتن والتواصل معه');
    }

    // التحقق من تكرار الهاتف في القائمة الحالية
    const duplicate = this.drivers.find((d) => d.phone === cleanPhone);
    if (duplicate) {
      throw new Error(`رقم الهاتف ${cleanPhone} مسجل مسبقاً باسم الكابتن: ${duplicate.full_name}`);
    }

    const driverId = generateUUID();
    let authUserId = generateUUID();
    const now = new Date().toISOString();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // محاولة إنشاء حساب في Supabase Auth إن توفر البريد وكلمة المرور
        if (cleanEmail && data.password) {
          try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
              email: cleanEmail,
              password: data.password,
              options: {
                data: {
                  full_name: cleanName,
                  role: 'delivery_driver',
                },
              },
            });
            if (!authError && authData.user?.id) {
              authUserId = authData.user.id;
            }
          } catch (authErr) {
            console.warn('Supabase auth signup error (will continue with generated UUID):', authErr);
          }
        }

        // إدراج السائق في جدول delivery_drivers
        const { error: insertError } = await supabase
          .from('delivery_drivers')
          .insert({
            id: driverId,
            user_id: authUserId,
            full_name: cleanName,
            phone: cleanPhone,
            role: 'delivery_driver',
            vehicle_type: cleanVehicle,
            national_id: cleanNationalId || null,
            license_number: cleanLicense || null,
            email: cleanEmail || null,
            is_active: true,
            created_at: now,
          });

        if (insertError) {
          console.warn('Supabase driver insert notice:', insertError.message);
        }
      } catch (err) {
        console.warn('Could not insert driver to Supabase, continuing with local store:', err);
      }
    }

    const newDriver: DeliveryDriver = {
      id: driverId,
      user_id: authUserId,
      full_name: cleanName,
      phone: cleanPhone,
      role: 'delivery_driver',
      vehicle_type: cleanVehicle,
      national_id: cleanNationalId,
      license_number: cleanLicense,
      email: cleanEmail,
      is_active: true,
      created_at: now,
    };

    this.drivers.unshift(newDriver);
    this.saveDrivers();

    return newDriver;
  }

  // تفعيل أو تعطيل حالة السائق
  public async toggleDriverActive(driverId: string, isActive: boolean): Promise<DeliveryDriver> {
    const driver = this.drivers.find((d) => d.id === driverId);
    if (!driver) throw new Error('السائق غير موجود');

    const supabase = getSupabaseClient();
    if (supabase && isValidUUID(driverId)) {
      try {
        await supabase
          .from('delivery_drivers')
          .update({ is_active: isActive })
          .eq('id', driverId);
      } catch (err) {
        console.warn('Supabase toggleDriverActive warning:', err);
      }
    }

    driver.is_active = isActive;
    this.saveDrivers();
    return driver;
  }

  // Orders Fetch (Enforces RLS: pending_review OR assigned to this driver)
  public async getOrdersForDriver(driverId: string): Promise<DeliveryOrder[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('delivery_orders')
          .select(`
            *,
            items:delivery_order_items(*)
          `)
          .or(`status.eq.pending_review,assigned_driver_id.eq.${driverId}`)
          .order('created_at', { ascending: false });

        if (!error && data) {
          // دمج الطلبات مع الذاكرة المحلية
          return data as DeliveryOrder[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local replica:', err);
      }
    }

    // Local RLS Filter
    return this.orders.filter(
      (o) => o.status === 'pending_review' || o.assigned_driver_id === driverId
    );
  }

  // All orders (Admin simulation inspector)
  public async getAllOrdersForAdmin(): Promise<DeliveryOrder[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('delivery_orders')
          .select(`
            *,
            items:delivery_order_items(*)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as DeliveryOrder[];
        }
      } catch (err) {
        console.warn('Supabase getAllOrdersForAdmin failed:', err);
      }
    }
    return [...this.orders];
  }

  // Get order by ID with items and history
  public async getOrderById(orderId: string): Promise<DeliveryOrder | null> {
    if (!orderId) return null;

    const supabase = getSupabaseClient();
    if (supabase && isValidUUID(orderId)) {
      try {
        const { data, error } = await supabase
          .from('delivery_orders')
          .select(`
            *,
            items:delivery_order_items(*)
          `)
          .eq('id', orderId)
          .maybeSingle();

        if (!error && data) {
          const idx = this.orders.findIndex((o) => o.id === orderId);
          if (idx !== -1) {
            this.orders[idx] = { ...this.orders[idx], ...(data as DeliveryOrder) };
          } else {
            this.orders.push(data as DeliveryOrder);
          }
          return data as DeliveryOrder;
        }
      } catch (err) {
        console.warn('Supabase fetch failed for order:', err);
      }
    }

    const order = this.orders.find((o) => o.id === orderId);
    return order ? { ...order } : null;
  }

  // Get status history
  public async getStatusHistory(orderId: string): Promise<DeliveryOrderStatusHistory[]> {
    if (!orderId) return [];

    const supabase = getSupabaseClient();
    if (supabase && isValidUUID(orderId)) {
      try {
        const { data, error } = await supabase
          .from('delivery_order_status_history')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as DeliveryOrderStatusHistory[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed for history:', err);
      }
    }

    return this.history
      .filter((h) => h.order_id === orderId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // =========================================================================
  // 3. قبول الطلب (Accept Order)
  // =========================================================================
  public async acceptOrder(orderId: string, driverId: string): Promise<{ success: boolean; message: string }> {
    const settings = await this.getSettings();
    if (!settings.delivery_enabled) {
      throw new Error('خدمة الدليفري معطلة حالياً من قبل الإدارة، لا يمكن قبول طلبات جديدة.');
    }

    // فحص حالة السائق ونشاطه
    const driver = this.drivers.find((d) => d.id === driverId);
    if (driver && !driver.is_active) {
      throw new Error('حساب السائق غير نشط حالياً (is_active = false). يجب تفعيل الحساب للتمكن من قبول الطلبات.');
    }

    // فحص محلي أولي
    const existingLocal = this.orders.find((o) => o.id === orderId);
    if (existingLocal) {
      if (existingLocal.status === 'accepted') {
        throw new Error('الطلب تم قبوله مسبقاً ولا يمكن قبوله مرتين');
      }
      if (existingLocal.status === 'completed' || existingLocal.status === 'cancelled') {
        throw new Error(`لا يمكن قبول طلب بحالة ${existingLocal.status}`);
      }
    }

    const supabase = getSupabaseClient();
    if (supabase && isValidUUID(orderId)) {
      try {
        // التأكد من وجود الطلب في Supabase ومزامنته إن كان محلياً
        const { data: dbOrder } = await supabase
          .from('delivery_orders')
          .select('id, status')
          .eq('id', orderId)
          .maybeSingle();

        if (!dbOrder && existingLocal) {
          await supabase.from('delivery_orders').insert({
            id: existingLocal.id,
            order_number: existingLocal.order_number,
            household_name: existingLocal.household_name,
            customer_name: existingLocal.customer_name,
            phone_number: existingLocal.phone_number,
            governorate: existingLocal.governorate,
            center: existingLocal.center,
            detailed_address: existingLocal.detailed_address,
            items_total: existingLocal.items_total,
            delivery_fee: existingLocal.delivery_fee,
            total_amount: existingLocal.total_amount,
            notes: existingLocal.notes,
            status: 'pending_review',
            created_at: existingLocal.created_at,
          });
        }

        // استدعاء دالة RPC الآمنة
        const { data, error } = await supabase.rpc('accept_delivery_order', {
          p_order_id: orderId,
        });

        if (error) {
          throw new Error(error.message);
        }

        // تحديث الذاكرة المحلية فوراً
        const now = new Date().toISOString();
        if (existingLocal) {
          existingLocal.status = 'accepted';
          existingLocal.assigned_driver_id = driverId;
          existingLocal.accepted_at = now;
          existingLocal.updated_at = now;
          this.saveOrders();
        }

        this.history.unshift({
          id: generateUUID(),
          order_id: orderId,
          previous_status: 'pending_review',
          new_status: 'accepted',
          changed_by: driverId,
          changed_by_role: 'delivery_driver',
          notes: 'تم قبول الطلب وبدء رحلة التوصيل',
          created_at: now,
        });
        this.saveHistory();

        return { success: true, message: data?.message || 'تم قبول الطلب بنجاح' };
      } catch (err: any) {
        throw new Error(err?.message || 'فشل قبول الطلب');
      }
    }

    // Local Logic Fallback
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error('الطلب غير موجود');
    }

    if (order.status === 'accepted') {
      throw new Error('الطلب تم قبوله مسبقاً ولا يمكن قبوله مرتين');
    }

    if (order.status !== 'pending_review') {
      throw new Error(`حالة الطلب الحالية هي ${order.status}. يسمح بالقبول فقط لطلبات pending_review`);
    }

    const previousStatus = order.status;
    const now = new Date().toISOString();

    order.status = 'accepted';
    order.assigned_driver_id = driverId;
    order.accepted_at = now;
    order.updated_at = now;

    this.history.unshift({
      id: generateUUID(),
      order_id: order.id,
      previous_status: previousStatus,
      new_status: 'accepted',
      changed_by: driverId,
      changed_by_role: 'delivery_driver',
      notes: 'تم قبول الطلب وبدء رحلة التوصيل بواسطة السائق',
      created_at: now,
    });

    this.saveOrders();
    this.saveHistory();

    return { success: true, message: 'تم قبول الطلب بنجاح وهو الآن قيد التوصيل' };
  }

  // =========================================================================
  // 4. إتمام التوصيل (Complete Delivery)
  // =========================================================================
  public async completeOrder(orderId: string, driverId: string): Promise<{ success: boolean; message: string }> {
    const existingLocal = this.orders.find((o) => o.id === orderId);
    if (existingLocal && existingLocal.status !== 'accepted') {
      throw new Error(`لا يمكن إتمام الطلب! حالته الحالية هي: ${existingLocal.status} (يجب أن تكون accepted أولاً)`);
    }

    const supabase = getSupabaseClient();
    if (supabase && isValidUUID(orderId)) {
      const { data, error } = await supabase.rpc('complete_delivery_order', {
        p_order_id: orderId,
      });

      if (error) {
        throw new Error(error.message);
      }

      const now = new Date().toISOString();
      if (existingLocal) {
        existingLocal.status = 'completed';
        existingLocal.delivered_at = now;
        existingLocal.updated_at = now;
        this.saveOrders();
      }

      this.history.unshift({
        id: generateUUID(),
        order_id: orderId,
        previous_status: 'accepted',
        new_status: 'completed',
        changed_by: driverId,
        changed_by_role: 'delivery_driver',
        notes: 'تم تسليم الطلب للعميل بنجاح',
        created_at: now,
      });
      this.saveHistory();

      return { success: true, message: data?.message || 'تم إتمام التوصيل بنجاح' };
    }

    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error('الطلب غير موجود');
    }

    if (order.status !== 'accepted') {
      throw new Error(`لا يمكن إتمام الطلب! حالته الحالية هي: ${order.status} (يجب أن تكون accepted أولاً)`);
    }

    if (order.assigned_driver_id !== driverId) {
      throw new Error('لا يمكنك إتمام طلب مسند لسائق آخر');
    }

    const now = new Date().toISOString();
    order.status = 'completed';
    order.delivered_at = now;
    order.updated_at = now;

    this.history.unshift({
      id: generateUUID(),
      order_id: order.id,
      previous_status: 'accepted',
      new_status: 'completed',
      changed_by: driverId,
      changed_by_role: 'delivery_driver',
      notes: 'تم تسليم الطلب للعميل بنجاح',
      created_at: now,
    });

    this.saveOrders();
    this.saveHistory();

    return { success: true, message: 'تم إتمام التوصيل بنجاح وتسجيل تاريخ التسليم' };
  }

  // =========================================================================
  // 5. طلب الإلغاء من قبل الدليفري (Request Cancellation)
  // =========================================================================
  public async requestCancellation(orderId: string, driverId: string, reason: string): Promise<{ success: boolean; message: string }> {
    const cleanReason = reason ? reason.trim() : '';
    if (!cleanReason) {
      throw new Error('سبب الإلغاء إجباري، لا يمكن إرسال طلب الإلغاء بدون ملاحظة توضيحية');
    }

    const existingLocal = this.orders.find((o) => o.id === orderId);
    if (existingLocal && existingLocal.status !== 'accepted') {
      throw new Error('يمكن فقط طلب إلغاء الطلبات المقبولة قيد التوصيل');
    }

    const supabase = getSupabaseClient();
    if (supabase && isValidUUID(orderId)) {
      const { data, error } = await supabase.rpc('request_order_cancellation', {
        p_order_id: orderId,
        p_reason: cleanReason,
      });

      if (error) {
        throw new Error(error.message);
      }

      const now = new Date().toISOString();
      if (existingLocal) {
        existingLocal.status = 'cancellation_pending';
        existingLocal.cancellation_reason = cleanReason;
        existingLocal.cancellation_requested_by = driverId;
        existingLocal.cancellation_requested_at = now;
        existingLocal.updated_at = now;
        this.saveOrders();
      }

      this.history.unshift({
        id: generateUUID(),
        order_id: orderId,
        previous_status: 'accepted',
        new_status: 'cancellation_pending',
        changed_by: driverId,
        changed_by_role: 'delivery_driver',
        notes: `طلب إلغاء من السائق بانتظار قرار الإدارة: ${cleanReason}`,
        created_at: now,
      });
      this.saveHistory();

      return { success: true, message: data?.message || 'تم إرسال طلب الإلغاء للإدارة للمراجعة' };
    }

    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error('الطلب غير موجود');
    }

    if (order.assigned_driver_id !== driverId) {
      throw new Error('لا يمكنك طلب إلغاء طلب مسند لسائق آخر');
    }

    if (order.status !== 'accepted') {
      throw new Error('يمكن فقط طلب إلغاء الطلبات المقبولة قيد التوصيل');
    }

    const now = new Date().toISOString();
    order.status = 'cancellation_pending';
    order.cancellation_reason = cleanReason;
    order.cancellation_requested_by = driverId;
    order.cancellation_requested_at = now;
    order.updated_at = now;

    this.history.unshift({
      id: generateUUID(),
      order_id: order.id,
      previous_status: 'accepted',
      new_status: 'cancellation_pending',
      changed_by: driverId,
      changed_by_role: 'delivery_driver',
      notes: `طلب إلغاء من السائق بانتظار قرار الإدارة: ${cleanReason}`,
      created_at: now,
    });

    this.saveOrders();
    this.saveHistory();

    return { 
      success: true, 
      message: 'تم تحويل حالة الطلب إلى cancellation_pending وإرساله للوحة الإدارة للمراجعة' 
    };
  }

  // =========================================================================
  // 6. قرارات الإدارة (Admin Decisions)
  // =========================================================================
  public async adminResolveCancellation(orderId: string, approve: boolean, adminNotes?: string): Promise<{ success: boolean; newStatus: DeliveryOrderStatus }> {
    const supabase = getSupabaseClient();
    if (supabase && isValidUUID(orderId)) {
      const { data, error } = await supabase.rpc('admin_resolve_cancellation', {
        p_order_id: orderId,
        p_approve: approve,
        p_admin_notes: adminNotes || null,
      });

      if (error) {
        throw new Error(error.message);
      }

      const newStatus = (approve ? 'cancelled' : 'accepted') as DeliveryOrderStatus;
      const local = this.orders.find((o) => o.id === orderId);
      if (local) {
        local.status = newStatus;
        local.updated_at = new Date().toISOString();
        this.saveOrders();
      }

      return { success: true, newStatus: data?.new_status || newStatus };
    }

    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error('الطلب غير موجود');
    }

    if (order.status !== 'cancellation_pending') {
      throw new Error('هذا الطلب ليس في حالة انتظار قرار الإلغاء');
    }

    const now = new Date().toISOString();
    const newStatus: DeliveryOrderStatus = approve ? 'cancelled' : 'accepted';
    order.status = newStatus;
    order.updated_at = now;

    this.history.unshift({
      id: generateUUID(),
      order_id: order.id,
      previous_status: 'cancellation_pending',
      new_status: newStatus,
      changed_by: 'admin-user',
      changed_by_role: 'admin',
      notes: approve
        ? `وافقت الإدارة على إلغاء الطلب: ${adminNotes || 'تم قبول سبب السائق'}`
        : `رفضت الإدارة طلب الإلغاء وأعادت الطلب قيد التنفيذ: ${adminNotes || 'يرجى إعادة محاولة التواصل مع العميل'}`,
      created_at: now,
    });

    this.saveOrders();
    this.saveHistory();

    return { success: true, newStatus };
  }

  // =========================================================================
  // 7. إنشاء طلب تجريبي جديد بمعرف UUID صالح
  // =========================================================================
  public async createSampleOrder(): Promise<DeliveryOrder> {
    const settings = await this.getSettings();
    if (!settings.delivery_enabled) {
      throw new Error('لا يمكن إنشاء طلب جديد لأن خدمة الدليفري معطلة من قبل الإدارة');
    }

    const orderId = generateUUID();
    const randId = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-2026-${randId}`;
    const householdId = generateUUID();
    const invoiceId = generateUUID();
    const now = new Date().toISOString();

    const items: DeliveryOrderItem[] = [
      {
        id: generateUUID(),
        order_id: orderId,
        product_name: 'سلة فواكه طازجة مشكلة 3 كجم',
        quantity: 1,
        unit_price: 180.00,
        total_price: 180.00,
      },
      {
        id: generateUUID(),
        order_id: orderId,
        product_name: 'عصائر طبيعية بدون سكر 1 لتر',
        quantity: 2,
        unit_price: 50.00,
        total_price: 100.00,
      },
    ];

    const newOrder: DeliveryOrder = {
      id: orderId,
      order_number: orderNumber,
      household_id: householdId,
      household_name: `منزل العميل #${randId}`,
      customer_name: `عميل تجريبي ${randId}`,
      phone_number: `010${Math.floor(10000000 + Math.random() * 90000000)}`,
      governorate: 'القاهرة',
      center: 'المعادي',
      detailed_address: `شارع النصر رقم ${Math.floor(1 + Math.random() * 80)} - شقة ${Math.floor(1 + Math.random() * 12)}`,
      items_total: 280.00,
      delivery_fee: 30.00,
      total_amount: 310.00,
      notes: 'طلب فوري جديد عبر تطبيق طلبات البيت',
      status: 'pending_review',
      assigned_driver_id: null,
      accepted_at: null,
      delivered_at: null,
      cancellation_reason: null,
      cancellation_requested_by: null,
      cancellation_requested_at: null,
      invoice_id: invoiceId,
      created_at: now,
      items,
    };

    // إدراج الطلب في Supabase إن وجد اتصال
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error: orderErr } = await supabase.from('delivery_orders').insert({
          id: newOrder.id,
          order_number: newOrder.order_number,
          household_id: newOrder.household_id,
          household_name: newOrder.household_name,
          customer_name: newOrder.customer_name,
          phone_number: newOrder.phone_number,
          governorate: newOrder.governorate,
          center: newOrder.center,
          detailed_address: newOrder.detailed_address,
          items_total: newOrder.items_total,
          delivery_fee: newOrder.delivery_fee,
          total_amount: newOrder.total_amount,
          notes: newOrder.notes,
          status: 'pending_review',
          invoice_id: newOrder.invoice_id,
          created_at: now,
        });

        if (!orderErr) {
          await supabase.from('delivery_order_items').insert(
            items.map((it) => ({
              id: it.id,
              order_id: it.order_id,
              product_name: it.product_name,
              quantity: it.quantity,
              unit_price: it.unit_price,
              total_price: it.total_price,
              created_at: now,
            }))
          );

          await supabase.from('delivery_order_status_history').insert({
            id: generateUUID(),
            order_id: newOrder.id,
            previous_status: null,
            new_status: 'pending_review',
            changed_by: null,
            changed_by_role: 'system',
            notes: 'تم إنشاء الطلب وهو متاح لسائقي الدليفري للمراجعة والقبول',
            created_at: now,
          });
        }
      } catch (err) {
        console.warn('Could not insert sample order to Supabase:', err);
      }
    }

    this.orders.unshift(newOrder);
    this.history.unshift({
      id: generateUUID(),
      order_id: newOrder.id,
      previous_status: null,
      new_status: 'pending_review',
      changed_by: 'system',
      changed_by_role: 'system',
      notes: 'تم إنشاء الطلب وهو متاح لسائقي الدليفري للمراجعة والقبول',
      created_at: now,
    });

    this.saveOrders();
    this.saveHistory();

    return newOrder;
  }
}

export const deliveryService = new DeliveryRepository();
