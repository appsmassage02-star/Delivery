import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  Home, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Info,
  ChevronLeft,
  Package,
  PowerOff
} from 'lucide-react';
import { DeliveryOrder, DeliveryOrderStatus, DeliveryDriver, DeliverySettings } from '../types/delivery';
import { StatusBadge } from './StatusBadge';

interface OrdersListProps {
  orders: DeliveryOrder[];
  currentDriver: DeliveryDriver;
  settings: DeliverySettings;
  onAcceptOrder: (orderId: string) => Promise<void>;
  onCompleteOrder: (orderId: string) => Promise<void>;
  onRequestCancel: (order: DeliveryOrder) => void;
  onViewDetails: (order: DeliveryOrder) => void;
  mobileViewMode?: 'pending' | 'accepted' | 'completed' | 'rejected' | 'all';
}

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  currentDriver,
  settings,
  onAcceptOrder,
  onCompleteOrder,
  onRequestCancel,
  onViewDetails,
  mobileViewMode = 'all',
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | DeliveryOrderStatus | 'active'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter orders according to active filter or mobileViewMode
  const filteredOrders = orders.filter((order) => {
    // 1. If mobileViewMode is explicitly provided by MobileBottomNav
    if (mobileViewMode === 'pending') {
      return order.status === 'pending_review';
    }
    if (mobileViewMode === 'accepted') {
      return order.status === 'accepted' && order.assigned_driver_id === currentDriver.id;
    }
    if (mobileViewMode === 'completed') {
      return order.status === 'completed';
    }
    if (mobileViewMode === 'rejected') {
      // Show cancelled orders or orders with cancellation pending
      return order.status === 'cancelled' || order.status === 'cancellation_pending';
    }

    // 2. Fallback to desktop filter tabs
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') {
      return order.status === 'accepted' && order.assigned_driver_id === currentDriver.id;
    }
    return order.status === activeFilter;
  });

  const countPending = orders.filter((o) => o.status === 'pending_review').length;
  const countMyActive = orders.filter((o) => o.status === 'accepted' && o.assigned_driver_id === currentDriver.id).length;
  const countCancellation = orders.filter((o) => o.status === 'cancellation_pending').length;

  return (
    <div className="space-y-6">
      {/* 7. إشعار حالة التفعيل: delivery_settings.delivery_enabled */}
      {!settings.delivery_enabled && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 text-rose-900 flex items-start space-x-3 space-x-reverse shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-700">
            <PowerOff className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-rose-950">
              تنبيه إداري: خدمة الدليفري معطلة حالياً من قبل الإدارة
            </h3>
            <p className="text-xs text-rose-800 leading-relaxed">
              وفق سياسة النظام، لا يمكن قبول طلبات جديدة أو إنشاؤها أثناء تعطيل الخدمة. يمكنك متابعة وإتمام الطلبات المقبولة مسبقاً المسندة إليك، ولا يتم حذف الطلبات القديمة.
            </p>
          </div>
        </div>
      )}

      {/* تنبيه إذا كان حساب السائق غير مفعل (is_active = false) */}
      {!currentDriver.is_active && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 text-amber-900 flex items-start space-x-3 space-x-reverse shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-amber-950">
              حساب الكابتن غير مفعل حالياً (is_active = false)
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              وفق قواعد أمان النظام، لا يمكنك قبول أي طلبات دليفري جديدة حتى يتم تنشيط الحساب. يمكنك مراجعة تبويب «تسجيل وهوية الكابتن» لتفعيل الحساب.
            </p>
          </div>
        </div>
      )}

      {/* Driver Identity Card & Stats */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            {currentDriver.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <h2 className="text-base font-bold text-neutral-900">{currentDriver.full_name}</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200">
                {currentDriver.role}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              الهاتف: <span dir="ltr">{currentDriver.phone}</span> • المركبة: {currentDriver.vehicle_type || 'دراجة نارية'} • معرف النظام: <code className="text-[10px]">{currentDriver.id.slice(0, 8)}</code>
            </p>
          </div>
        </div>

        {/* Quick counter chips */}
        <div className="flex items-center space-x-2 space-x-reverse text-xs">
          <button 
            onClick={() => setActiveFilter('pending_review')}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-center hover:bg-amber-100 transition"
          >
            <span className="block font-bold text-base">{countPending}</span>
            <span className="text-[11px]">متاح للقبول</span>
          </button>
          <button 
            onClick={() => setActiveFilter('active')}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-center hover:bg-blue-100 transition"
          >
            <span className="block font-bold text-base">{countMyActive}</span>
            <span className="text-[11px]">طلباتي الجارية</span>
          </button>
          <button 
            onClick={() => setActiveFilter('cancellation_pending')}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-center hover:bg-orange-100 transition"
          >
            <span className="block font-bold text-base">{countCancellation}</span>
            <span className="text-[11px]">بانتظار الإلغاء</span>
          </button>
        </div>
      </div>

      {/* Mobile Page Title Header when navigated via Mobile Bottom Nav */}
      {mobileViewMode !== 'all' && (
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-2xs flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-base text-neutral-900">
              {mobileViewMode === 'pending' && 'الطلبات المتاحة للقبول'}
              {mobileViewMode === 'accepted' && 'طلباتي الجارية قيد التوصيل'}
              {mobileViewMode === 'completed' && 'الطلبات التي تم تسليمها بنجاح'}
              {mobileViewMode === 'rejected' && 'الطلبات الملغاة والمرفوضة'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {mobileViewMode === 'pending' && 'طلبات جديدة معتمدة تنتظر قبول الكابتن للبدء بالتوصيل'}
              {mobileViewMode === 'accepted' && 'الطلبات التي قمت بقبولها وتعمل على تسليمها للعميل'}
              {mobileViewMode === 'completed' && 'سجل كافة الطلبات المكتملة التي قمت بتوصيلها'}
              {mobileViewMode === 'rejected' && 'الطلبات الملغاة إدارياً أو قيد مراجعة طلب الإلغاء'}
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl text-xs font-bold font-mono bg-neutral-100 text-neutral-800 border border-neutral-200">
            {filteredOrders.length} طلب
          </span>
        </div>
      )}

      {/* Filter Tabs (Visible on desktop or when mobileViewMode is all) */}
      {mobileViewMode === 'all' && (
        <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          جميع الطلبات المتاحة لي ({orders.length})
        </button>
        <button
          onClick={() => setActiveFilter('pending_review')}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeFilter === 'pending_review'
              ? 'bg-amber-700 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          متاحة للقبول ({countPending})
        </button>
        <button
          onClick={() => setActiveFilter('active')}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeFilter === 'active'
              ? 'bg-blue-700 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          طلباتي الجارية ({countMyActive})
        </button>
        <button
          onClick={() => setActiveFilter('cancellation_pending')}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeFilter === 'cancellation_pending'
              ? 'bg-orange-700 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          بانتظار قرار الإلغاء ({countCancellation})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeFilter === 'completed'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          المكتملة ({orders.filter((o) => o.status === 'completed').length})
        </button>
      </div>
      )}

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
          <Truck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800">لا توجد طلبات في هذا التبويب</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            تظهر هنا الطلبات المعروضة وفق صلاحيات RLS ومحددات الدليفري.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isAssignedToCurrent = order.assigned_driver_id === currentDriver.id;
            const canAccept = order.status === 'pending_review' && settings.delivery_enabled;
            const canComplete = order.status === 'accepted' && isAssignedToCurrent;
            const canRequestCancel = order.status === 'accepted' && isAssignedToCurrent;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-neutral-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="font-mono text-xs font-bold bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-200">
                        {order.order_number}
                      </span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Customer and Household info */}
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-neutral-900 flex items-center space-x-1.5 space-x-reverse">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{order.customer_name}</span>
                      </div>
                      <div className="text-neutral-600 flex items-center space-x-1 space-x-reverse">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span dir="ltr" className="font-mono text-[11px]">{order.phone_number}</span>
                      </div>
                    </div>

                    {order.household_name && (
                      <div className="text-neutral-600 flex items-center space-x-1.5 space-x-reverse">
                        <Home className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{order.household_name}</span>
                      </div>
                    )}

                    <div className="text-neutral-700 flex items-start space-x-1.5 space-x-reverse pt-1 border-t border-neutral-200">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        <strong>{order.governorate} - {order.center}:</strong> {order.detailed_address}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  {order.items && order.items.length > 0 && (
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-neutral-700 flex items-center space-x-1 space-x-reverse">
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        <span>المنتجات ({order.items.length}):</span>
                      </span>
                      <div className="bg-neutral-50/70 rounded-lg p-2 border border-neutral-100 space-y-0.5">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-[11px] text-neutral-600">
                            <span>• {item.product_name}</span>
                            <span className="font-semibold text-neutral-800">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {order.notes && (
                    <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <strong>ملاحظة العميل:</strong> {order.notes}
                    </div>
                  )}

                  {/* Cancellation Alert if cancellation_pending */}
                  {order.status === 'cancellation_pending' && (
                    <div className="text-[11px] text-orange-900 bg-orange-50 border border-orange-200 rounded-lg p-2.5 space-y-1">
                      <div className="font-bold flex items-center space-x-1 space-x-reverse">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                        <span>طلب إلغاء مرفوع للإدارة</span>
                      </div>
                      <div><strong>السبب:</strong> {order.cancellation_reason}</div>
                    </div>
                  )}

                  {/* Pricing Breakdown (Read-Only) */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <div className="text-neutral-500 space-x-2 space-x-reverse">
                      <span>المشتريات: {order.items_total.toFixed(2)} ج.م</span>
                      <span>•</span>
                      <span>التوصيل: {order.delivery_fee.toFixed(2)} ج.م</span>
                    </div>
                    <div className="text-sm font-bold text-neutral-900">
                      الإجمالي: <span className="text-emerald-700">{order.total_amount.toFixed(2)} ج.م</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewDetails(order)}
                    className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:underline flex items-center space-x-1 space-x-reverse"
                  >
                    <span>عرض التفاصيل والسجل</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    {/* 3. زر قبول الطلب: فقط عندما تكون الحالة pending_review */}
                    {order.status === 'pending_review' && (
                      <button
                        disabled={!settings.delivery_enabled || !currentDriver.is_active || processingId === order.id}
                        onClick={async () => {
                          setProcessingId(order.id);
                          try {
                            await onAcceptOrder(order.id);
                          } finally {
                            setProcessingId(null);
                          }
                        }}
                        className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition flex items-center space-x-1.5 space-x-reverse ${
                          settings.delivery_enabled && currentDriver.is_active
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-neutral-400 cursor-not-allowed'
                        }`}
                        title={
                          !settings.delivery_enabled 
                            ? 'الخدمة معطلة حالياً من الإدارة' 
                            : !currentDriver.is_active
                            ? 'الحساب معطل (is_active = false) لا يمكنك قبول الطلبات'
                            : 'قبول الطلب'
                        }
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{processingId === order.id ? 'جاري القبول...' : 'قبول الطلب'}</span>
                      </button>
                    )}

                    {/* 4. زر تم التوصيل: يظهر فقط بعد قبول الطلب (status === accepted) */}
                    {canComplete && (
                      <button
                        disabled={processingId === order.id}
                        onClick={async () => {
                          setProcessingId(order.id);
                          try {
                            await onCompleteOrder(order.id);
                          } finally {
                            setProcessingId(null);
                          }
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center space-x-1.5 space-x-reverse"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{processingId === order.id ? 'جاري الحفظ...' : 'تم التوصيل'}</span>
                      </button>
                    )}

                    {/* 5. زر طلب الإلغاء: يظهر فقط عند قبول الطلب */}
                    {canRequestCancel && (
                      <button
                        onClick={() => onRequestCancel(order)}
                        className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition"
                      >
                        إلغاء الطلب
                      </button>
                    )}

                    {order.status === 'cancellation_pending' && (
                      <span className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl">
                        قيد انتظار الإدارة
                      </span>
                    )}

                    {order.status === 'completed' && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center space-x-1 space-x-reverse">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم التسليم</span>
                      </span>
                    )}

                    {order.status === 'cancelled' && (
                      <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                        ملغي نهائياً
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
