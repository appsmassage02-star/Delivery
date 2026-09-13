import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';
import { DeliveryOrder } from '../types/delivery';

interface CancelRequestModalProps {
  order: DeliveryOrder;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderId: string, reason: string) => Promise<void>;
}

export const CancelRequestModal: React.FC<CancelRequestModalProps> = ({
  order,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReason = reason.trim();
    if (!cleanReason) {
      setError('ملاحظة سبب الإلغاء إجبارية ولا يمكن إرسال الطلب بدونها.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(order.id, cleanReason);
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء رفع طلب الإلغاء.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse text-orange-800 font-bold">
            <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
            <span>طلب إلغاء الطلب للمراجعة</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 rounded-lg p-1 hover:bg-orange-100/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-xs text-neutral-600 space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-neutral-800">رقم الطلب:</span>
              <span className="font-mono text-neutral-900">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-neutral-800">العميل:</span>
              <span>{order.customer_name} ({order.phone_number})</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-neutral-800">العنوان:</span>
              <span>{order.governorate} - {order.center}</span>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2 space-x-reverse">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>تنبيه أمني ونظامي:</strong> كابتن الدليفري لا يملك صلاحية الإلغاء النهائي المباشر. سيتم تحويل حالة الطلب إلى <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-bold">cancellation_pending</code> ورفعه للوحة الإدارة للفحص والموافقة أو الرفض.
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1">
              سبب طلب الإلغاء (ملاحظة إجبارية) <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="مثال: العميل لا يرد على الهاتف منذ نصف ساعة، أو العنوان غير صحيح، أو رفض الاستلام..."
              className="w-full text-sm rounded-xl border border-neutral-300 p-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition"
            >
              تراجع
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="px-5 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 space-x-reverse"
            >
              {loading ? (
                <span>جاري الإرسال...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>إرسال طلب الإلغاء للإدارة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
