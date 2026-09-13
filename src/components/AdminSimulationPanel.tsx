import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Power, 
  Check, 
  X, 
  PlusCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Phone,
  FileCheck2,
  FileX2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { DeliveryOrder, DeliverySettings } from '../types/delivery';
import { StatusBadge } from './StatusBadge';

interface AdminSimulationPanelProps {
  orders: DeliveryOrder[];
  allOrders: DeliveryOrder[];
  settings: DeliverySettings;
  onToggleDeliveryEnabled: (enabled: boolean) => Promise<void>;
  onResolveCancellation: (orderId: string, approve: boolean, notes?: string) => Promise<void>;
  onCreateSampleOrder: () => Promise<void>;
  onViewOrderDetails: (order: DeliveryOrder) => void;
  onRefresh: () => void;
}

export const AdminSimulationPanel: React.FC<AdminSimulationPanelProps> = ({
  allOrders,
  settings,
  onToggleDeliveryEnabled,
  onResolveCancellation,
  onCreateSampleOrder,
  onViewOrderDetails,
  onRefresh,
}) => {
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const cancellationRequests = allOrders.filter((o) => o.status === 'cancellation_pending');

  const handleResolve = async (orderId: string, approve: boolean) => {
    const notes = adminNotes[orderId] || '';
    setLoadingAction(orderId + (approve ? '-approve' : '-reject'));
    try {
      await onResolveCancellation(orderId, approve, notes);
      setAdminNotes((prev) => {
        const copy = { ...prev };
        delete copy[orderId];
        return copy;
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner explaining Admin Boundaries */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold">لوحة قرارات الإدارة (طلبات البيت)</h2>
              <p className="text-xs text-slate-400">
                محاكاة صلاحيات الإدارة الحصرية: الفصل في طلبات الإلغاء، والتحكم في تفعيل الخدمة
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            title="تحديث البيانات"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-3 text-xs text-slate-300 leading-relaxed border border-slate-700">
          <strong>محددات الصلاحيات:</strong> الدليفري لا يستطيع اتخاذ القرار النهائي بإلغاء الطلب، ولا يمكنه تعديل تكلفة التوصيل أو بيانات الفواتير أو تعطيل الخدمة. هذه العمليات حصرية لإدارة النظام.
        </div>
      </div>

      {/* Admin Controls: Toggle Delivery & Create Order */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Toggle Service */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Power className={`w-5 h-5 ${settings.delivery_enabled ? 'text-emerald-600' : 'text-rose-600'}`} />
              <h3 className="font-bold text-sm text-neutral-900">
                حالة خدمة التوصيل (delivery_enabled)
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              الجدول: <code className="text-[11px] bg-neutral-100 px-1 py-0.5 rounded">delivery_settings</code>
            </p>
          </div>

          <button
            onClick={() => onToggleDeliveryEnabled(!settings.delivery_enabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 space-x-reverse shadow-xs ${
              settings.delivery_enabled
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{settings.delivery_enabled ? 'تعطيل الخدمة' : 'تفعيل الخدمة الآن'}</span>
          </button>
        </div>

        {/* Create Sample Incoming Order */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <PlusCircle className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-sm text-neutral-900">
                إنشاء طلب جديد للتجربة
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              يُنشئ طلباً بحالة <code className="text-[11px] bg-amber-50 text-amber-800 px-1 py-0.5 rounded font-bold">pending_review</code>
            </p>
          </div>

          <button
            disabled={!settings.delivery_enabled}
            onClick={onCreateSampleOrder}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 space-x-reverse"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إرسال طلب جديد</span>
          </button>
        </div>
      </div>

      {/* Cancellation Pending Review Queue */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="bg-orange-50/70 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-sm text-orange-950">
              طلبات الإلغاء بانتظار قرار الإدارة ({cancellationRequests.length})
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800">
            cancellation_pending
          </span>
        </div>

        <div className="p-6">
          {cancellationRequests.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              لا توجد طلبات إلغاء معلقة للمراجعة حالياً.
            </div>
          ) : (
            <div className="space-y-4">
              {cancellationRequests.map((order) => (
                <div
                  key={order.id}
                  className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-neutral-200">
                        {order.order_number}
                      </span>
                      <span className="text-xs font-bold text-neutral-800">
                        العميل: {order.customer_name} ({order.phone_number})
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500">
                      طلب الإلغاء: {order.cancellation_requested_at ? new Date(order.cancellation_requested_at).toLocaleTimeString('ar-EG') : 'غير محدد'}
                    </span>
                  </div>

                  {/* Reason from Driver */}
                  <div className="bg-white rounded-xl p-3 border border-neutral-200 text-xs text-neutral-800 space-y-1">
                    <strong className="text-orange-900 block">سبب الإلغاء المرفوع من السائق:</strong>
                    <p className="leading-relaxed">{order.cancellation_reason}</p>
                  </div>

                  {/* Admin notes input */}
                  <div>
                    <input
                      type="text"
                      placeholder="ملاحظات قرار الإدارة (اختياري)..."
                      value={adminNotes[order.id] || ''}
                      onChange={(e) =>
                        setAdminNotes((prev) => ({ ...prev, [order.id]: e.target.value }))
                      }
                      className="w-full text-xs rounded-xl border border-neutral-300 p-2.5 bg-white focus:outline-hidden focus:border-slate-500"
                    />
                  </div>

                  {/* Decisions Buttons */}
                  <div className="flex items-center justify-end space-x-2 space-x-reverse pt-1">
                    <button
                      onClick={() => onViewOrderDetails(order)}
                      className="px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-200 rounded-xl transition flex items-center space-x-1 space-x-reverse"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>فحص الطلب</span>
                    </button>

                    {/* Reject -> Revert to accepted */}
                    <button
                      disabled={loadingAction === order.id + '-reject'}
                      onClick={() => handleResolve(order.id, false)}
                      className="px-4 py-1.5 text-xs font-bold bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl transition flex items-center space-x-1 space-x-reverse"
                      title="رفض الإلغاء وإعادة الطلب للسائق كـ accepted"
                    >
                      <X className="w-3.5 h-3.5 text-rose-600" />
                      <span>رفض الإلغاء (إعادة كـ accepted)</span>
                    </button>

                    {/* Approve -> change to cancelled */}
                    <button
                      disabled={loadingAction === order.id + '-approve'}
                      onClick={() => handleResolve(order.id, true)}
                      className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition flex items-center space-x-1 space-x-reverse"
                      title="الموافقة على الإلغاء وتحويل الحالة إلى cancelled"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>الموافقة على الإلغاء (تحويل إلى cancelled)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Orders Audit Table (RLS & Driver Assignment Verification) */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-neutral-900">
            سجل فحص جميع طلبات النظام (لأغراض التدقيق وRLS)
          </h3>
          <span className="text-xs text-neutral-500">
            إجمالي الطلبات المسجلة: {allOrders.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-xs text-right">
            <thead className="bg-neutral-50 text-neutral-600 font-bold">
              <tr>
                <th className="px-4 py-3">رقم الطلب</th>
                <th className="px-4 py-3">العميل</th>
                <th className="px-4 py-3">العنوان</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">السائق المسند</th>
                <th className="px-4 py-3 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {allOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono font-bold text-neutral-900">{ord.order_number}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-800">{ord.customer_name}</td>
                  <td className="px-4 py-3 text-neutral-600">{ord.governorate} - {ord.center}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ord.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-neutral-500">
                    {ord.assigned_driver_id ? ord.assigned_driver_id.slice(0, 8) + '...' : 'غير مسند (متاح)'}
                  </td>
                  <td className="px-4 py-3 text-left font-bold text-neutral-900">
                    {ord.total_amount.toFixed(2)} ج.م
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
