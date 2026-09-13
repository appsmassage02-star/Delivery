import React, { useEffect, useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  User, 
  Home, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Package, 
  History, 
  AlertCircle,
  Truck,
  Lock,
  Clock
} from 'lucide-react';
import { DeliveryOrder, DeliveryOrderStatusHistory, DeliveryDriver } from '../types/delivery';
import { deliveryService } from '../services/deliveryService';
import { StatusBadge } from './StatusBadge';

interface OrderDetailModalProps {
  order: DeliveryOrder | null;
  currentDriver: DeliveryDriver;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (orderId: string) => Promise<void>;
  onComplete: (orderId: string) => Promise<void>;
  onRequestCancel: (order: DeliveryOrder) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  currentDriver,
  isOpen,
  onClose,
  onAccept,
  onComplete,
  onRequestCancel,
}) => {
  const [history, setHistory] = useState<DeliveryOrderStatusHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (order && isOpen) {
      loadHistory(order.id);
    }
  }, [order, isOpen]);

  const loadHistory = async (orderId: string) => {
    setLoadingHistory(true);
    try {
      const data = await deliveryService.getStatusHistory(orderId);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load status history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen || !order) return null;

  const isAssignedToCurrent = order.assigned_driver_id === currentDriver.id;
  const canAccept = order.status === 'pending_review';
  const canComplete = order.status === 'accepted' && isAssignedToCurrent;
  const canRequestCancel = order.status === 'accepted' && isAssignedToCurrent;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden text-right flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-xs font-mono font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-md">
                {order.order_number}
              </span>
              <StatusBadge status={order.status} size="sm" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mt-1">تفاصيل طلب التوصيل الكاملة</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 rounded-lg p-1 hover:bg-neutral-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Customer & Address Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-2">
              <h3 className="text-xs font-bold text-neutral-500 flex items-center space-x-1.5 space-x-reverse">
                <User className="w-4 h-4 text-emerald-600" />
                <span>بيانات العميل والمنزل</span>
              </h3>
              <div className="text-sm">
                <div className="font-bold text-neutral-900">{order.customer_name}</div>
                <div className="text-neutral-600 flex items-center space-x-1 space-x-reverse mt-1">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span dir="ltr" className="font-mono text-xs">{order.phone_number}</span>
                </div>
                {order.household_name && (
                  <div className="text-xs text-neutral-600 flex items-center space-x-1 space-x-reverse mt-1">
                    <Home className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{order.household_name} (معرف: {order.household_id})</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-2">
              <h3 className="text-xs font-bold text-neutral-500 flex items-center space-x-1.5 space-x-reverse">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>العنوان الجغرافي</span>
              </h3>
              <div className="text-sm">
                <div className="font-semibold text-neutral-900">
                  {order.governorate} - {order.center}
                </div>
                <div className="text-xs text-neutral-700 mt-1 leading-relaxed bg-white p-2 rounded-lg border border-neutral-200">
                  {order.detailed_address}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <strong className="block mb-0.5">ملاحظات العميل:</strong>
              {order.notes}
            </div>
          )}

          {/* Cancellation Info Banner (if cancellation_pending) */}
          {order.status === 'cancellation_pending' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 text-xs text-orange-950 space-y-1">
              <div className="font-bold flex items-center space-x-1.5 space-x-reverse text-orange-800">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span>طلب الإلغاء بانتظار قرار الإدارة</span>
              </div>
              <p><strong>السبب المرفوع:</strong> {order.cancellation_reason}</p>
              {order.cancellation_requested_at && (
                <p className="text-neutral-600">
                  <strong>تاريخ الطلب:</strong> {new Date(order.cancellation_requested_at).toLocaleString('ar-EG')}
                </p>
              )}
            </div>
          )}

          {/* Products / Items List */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-2 flex items-center space-x-1.5 space-x-reverse">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>المنتجات والكميات المطلوبة</span>
            </h3>
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-neutral-200 text-xs text-right">
                <thead className="bg-neutral-100 text-neutral-700 font-bold">
                  <tr>
                    <th className="px-4 py-2.5">المنتج</th>
                    <th className="px-3 py-2.5 text-center">الكمية</th>
                    <th className="px-3 py-2.5">سعر الوحدة</th>
                    <th className="px-4 py-2.5 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/60">
                        <td className="px-4 py-2.5 font-medium text-neutral-900">{item.product_name}</td>
                        <td className="px-3 py-2.5 text-center font-bold">{item.quantity}</td>
                        <td className="px-3 py-2.5 text-neutral-600">{item.unit_price.toFixed(2)} ج.م</td>
                        <td className="px-4 py-2.5 text-left font-semibold text-neutral-900">
                          {item.total_price.toFixed(2)} ج.م
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center text-neutral-400">
                        لا توجد عناصر مسجلة لهذا الطلب
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals (Read Only Protection) */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span className="flex items-center space-x-1 space-x-reverse font-semibold text-neutral-700">
                <FileText className="w-3.5 h-3.5 text-neutral-500" />
                <span>البيانات المالية (محمية للقراءة فقط)</span>
              </span>
              <span className="flex items-center space-x-1 space-x-reverse text-neutral-400">
                <Lock className="w-3 h-3" />
                <span>ممنوع تعديل الفاتورة أو التوصيل</span>
              </span>
            </div>
            <div className="flex justify-between text-xs text-neutral-700">
              <span>إجمالي المنتجات والمشتريات:</span>
              <span className="font-semibold">{order.items_total.toFixed(2)} جنيه</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-700">
              <span>تكلفة التوصيل المقررة:</span>
              <span className="font-semibold">{order.delivery_fee.toFixed(2)} جنيه</span>
            </div>
            <div className="border-t border-neutral-200 pt-2 flex justify-between text-sm font-bold text-neutral-900">
              <span>الإجمالي النهائي المطلوب تحصيله:</span>
              <span className="text-emerald-700 text-base">{order.total_amount.toFixed(2)} جنيه</span>
            </div>
          </div>

          {/* Status History Timeline (delivery_order_status_history) */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-2 flex items-center space-x-1.5 space-x-reverse">
              <History className="w-4 h-4 text-emerald-600" />
              <span>سجل حالات الطلب (delivery_order_status_history)</span>
            </h3>

            {loadingHistory ? (
              <div className="text-xs text-neutral-400 py-3 text-center">جاري تحميل السجل...</div>
            ) : history.length === 0 ? (
              <div className="text-xs text-neutral-400 py-3 text-center border border-dashed rounded-xl">
                لا توجد سجلات حالات مسجلة حتى الآن
              </div>
            ) : (
              <div className="relative border-r-2 border-emerald-300 mr-2 pr-4 space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="relative text-xs">
                    {/* Timeline bullet */}
                    <div className="absolute -right-5.5 top-0.5 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white" />
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="font-bold text-neutral-900">
                        {item.new_status}
                      </span>
                      {item.previous_status && (
                        <span className="text-neutral-400 font-mono">
                          (من {item.previous_status})
                        </span>
                      )}
                      <span className="text-neutral-400 text-[11px]">
                        {new Date(item.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-neutral-600 mt-0.5">
                      {item.notes || 'تغيير حالة اعتيادي'}
                    </div>
                    
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      بواسطة: <span className="font-mono">{item.changed_by_role}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-neutral-500">
            تاريخ الإنشاء: {new Date(order.created_at).toLocaleDateString('ar-EG')}
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            {canAccept && (
              <button
                disabled={actionLoading || !currentDriver.is_active}
                onClick={async () => {
                  setActionLoading(true);
                  try {
                    await onAccept(order.id);
                    onClose();
                  } finally {
                    setActionLoading(false);
                  }
                }}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5 space-x-reverse ${
                  currentDriver.is_active
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-neutral-400 cursor-not-allowed'
                }`}
                title={!currentDriver.is_active ? 'الحساب غير نشط حالياً' : 'قبول الطلب وبدء التوصيل'}
              >
                <Truck className="w-4 h-4" />
                <span>قبول الطلب وبدء التوصيل</span>
              </button>
            )}

            {canComplete && (
              <button
                disabled={actionLoading}
                onClick={async () => {
                  setActionLoading(true);
                  try {
                    await onComplete(order.id);
                    onClose();
                  } finally {
                    setActionLoading(false);
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5 space-x-reverse"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تم التوصيل</span>
              </button>
            )}

            {canRequestCancel && (
              <button
                onClick={() => {
                  onRequestCancel(order);
                }}
                className="px-4 py-2 bg-neutral-200 hover:bg-rose-50 text-neutral-700 hover:text-rose-700 hover:border-rose-200 border border-neutral-300 rounded-xl text-xs font-bold transition"
              >
                طلب إلغاء
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-xl text-xs font-semibold transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
