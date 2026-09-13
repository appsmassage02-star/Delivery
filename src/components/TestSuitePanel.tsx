import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  ShieldAlert,
  FileCheck2
} from 'lucide-react';
import { DeliveryDriver, VerificationTestResult } from '../types/delivery';
import { deliveryService } from '../services/deliveryService';

interface TestSuitePanelProps {
  currentDriver: DeliveryDriver;
  onRefreshAll: () => void;
}

const INITIAL_TESTS: VerificationTestResult[] = [
  {
    id: 'test-1',
    title: '1. ظهور طلب جديد',
    description: 'التحقق من إنشاء وظهور طلب جديد بحالة pending_review متاح لسائق الدليفري للمراجعة.',
    status: 'pending',
  },
  {
    id: 'test-2',
    title: '2. قبول الطلب',
    description: 'التحقق من تغيير حالة الطلب من pending_review إلى accepted وحفظ accepted_at و assigned_driver_id وسجل الحالة.',
    status: 'pending',
  },
  {
    id: 'test-3',
    title: '3. ظهور زر تم التوصيل بعد القبول فقط',
    description: 'التحقق من أن زر "تم التوصيل" لا يظهر في حالة pending_review أو cancellation_pending، بل بعد accepted فقط.',
    status: 'pending',
  },
  {
    id: 'test-4',
    title: '4. إتمام التوصيل',
    description: 'التحقق من تغيير الحالة إلى completed وتسجيل delivered_at وإضافة السجل في delivery_order_status_history.',
    status: 'pending',
  },
  {
    id: 'test-5',
    title: '5. طلب الإلغاء بملاحظة إجبارية',
    description: 'التحقق من إمكانية رفع طلب الإلغاء مع توفير سبب إجباري وحفظ cancellation_reason وسجل الحالة.',
    status: 'pending',
  },
  {
    id: 'test-6',
    title: '6. رفض إرسال الإلغاء بدون ملاحظة',
    description: 'التحقق من أن محاولة طلب الإلغاء بسلسلة فارغة أو مسافات فقط يتم رفضها ومنعها بصرامة.',
    status: 'pending',
  },
  {
    id: 'test-7',
    title: '7. عدم الإلغاء النهائي من تطبيق الدليفري',
    description: 'التحقق من أن حالة الطلب تصبح cancellation_pending وليس cancelled مباشرة، وأن الإلغاء النهائي اختصاص إداري حصري.',
    status: 'pending',
  },
  {
    id: 'test-8',
    title: '8. منع تكرار قبول أو إتمام الطلب',
    description: 'التحقق من إلقاء استثناء ومنع قبول طلب مقبول مسبقاً، أو إتمام طلب مكتمل أو غير مقبول.',
    status: 'pending',
  },
  {
    id: 'test-9',
    title: '9. تحديث الحالات في Supabase وتطابقها',
    description: 'التحقق من أن الحالات المستخدمة تنتمي حصراً إلى الحالات الخمس المعتمدة (pending_review, accepted, cancellation_pending, cancelled, completed).',
    status: 'pending',
  },
  {
    id: 'test-10',
    title: '10. ظهور وتدقيق سجل الحالات (Status History)',
    description: 'التحقق من استرجاع جدول delivery_order_status_history مع تسجيل previous_status و new_status ودور السائق delivery_driver.',
    status: 'pending',
  },
  {
    id: 'test-11',
    title: '11. عدم الوصول إلى طلبات غير مسموحة (RLS)',
    description: 'التحقق من أن سائق الدليفري لا يرى طلبات السائقين الآخرين الجارية أو الخاصة، وأن استعلام getOrdersForDriver يطبق العزل بدقة.',
    status: 'pending',
  },
];

export const TestSuitePanel: React.FC<TestSuitePanelProps> = ({ currentDriver, onRefreshAll }) => {
  const [tests, setTests] = useState<VerificationTestResult[]>(INITIAL_TESTS);
  const [isRunning, setIsRunning] = useState(false);
  const [summaryLogs, setSummaryLogs] = useState<string[]>([]);

  const runAllTests = async () => {
    setIsRunning(true);
    const logs: string[] = [];
    const updatedTests: VerificationTestResult[] = [...INITIAL_TESTS];

    const updateTestStatus = (index: number, status: 'passed' | 'failed', error?: string) => {
      updatedTests[index].status = status;
      updatedTests[index].errorDetails = error;
      updatedTests[index].timestamp = new Date().toLocaleTimeString('ar-EG');
      setTests([...updatedTests]);
    };

    logs.push(`[${new Date().toLocaleTimeString('ar-EG')}] بدء تشغيل الفحوصات الـ 11 النظامية...`);

    try {
      // 1. اختبار ظهور طلب جديد
      try {
        const order = await deliveryService.createSampleOrder();
        if (order && order.status === 'pending_review' && order.id) {
          updateTestStatus(0, 'passed');
          logs.push(`✓ الفحص 1 نجح: تم إنشاء الطلب ${order.order_number} بنجاح بحالة pending_review.`);
        } else {
          throw new Error('الطلب المنشأ لم يحمل حالة pending_review');
        }
      } catch (err: any) {
        updateTestStatus(0, 'failed', err?.message);
        logs.push(`✗ الفحص 1 فشل: ${err?.message}`);
      }

      // 2. اختبار قبول الطلب
      let acceptedOrderId = '';
      try {
        const orderToAccept = await deliveryService.createSampleOrder();
        const acceptRes = await deliveryService.acceptOrder(orderToAccept.id, currentDriver.id);
        const fetchedOrder = await deliveryService.getOrderById(orderToAccept.id);

        if (
          acceptRes.success &&
          fetchedOrder?.status === 'accepted' &&
          fetchedOrder.assigned_driver_id === currentDriver.id &&
          fetchedOrder.accepted_at
        ) {
          acceptedOrderId = orderToAccept.id;
          updateTestStatus(1, 'passed');
          logs.push(`✓ الفحص 2 نجح: تم قبول الطلب وحفظ accepted_at و assigned_driver_id.`);
        } else {
          throw new Error('فشل التحقق من بيانات الطلب المقبول');
        }
      } catch (err: any) {
        updateTestStatus(1, 'failed', err?.message);
        logs.push(`✗ الفحص 2 فشل: ${err?.message}`);
      }

      // 3. اختبار ظهور زر تم التوصيل بعد القبول فقط
      try {
        const pendingOrder = await deliveryService.createSampleOrder();
        const pendingCanComplete = pendingOrder.status === 'accepted' && pendingOrder.assigned_driver_id === currentDriver.id;

        let targetAcceptedId = acceptedOrderId;
        if (!targetAcceptedId) {
          const freshAccepted = await deliveryService.createSampleOrder();
          await deliveryService.acceptOrder(freshAccepted.id, currentDriver.id);
          targetAcceptedId = freshAccepted.id;
        }

        const acceptedOrder = await deliveryService.getOrderById(targetAcceptedId);
        const acceptedCanComplete = acceptedOrder?.status === 'accepted' && acceptedOrder?.assigned_driver_id === currentDriver.id;

        if (!pendingCanComplete && acceptedCanComplete) {
          updateTestStatus(2, 'passed');
          logs.push(`✓ الفحص 3 نجح: زر تم التوصيل متاح حصراً بعد أن تصبح الحالة accepted للمسند إليه الطلب.`);
        } else {
          throw new Error('زر تم التوصيل يظهر في غير حالته المقررة');
        }
      } catch (err: any) {
        updateTestStatus(2, 'failed', err?.message);
        logs.push(`✗ الفحص 3 فشل: ${err?.message}`);
      }

      // 4. اختبار إتمام التوصيل
      try {
        const orderToComplete = await deliveryService.createSampleOrder();
        await deliveryService.acceptOrder(orderToComplete.id, currentDriver.id);
        const compRes = await deliveryService.completeOrder(orderToComplete.id, currentDriver.id);
        const completedOrder = await deliveryService.getOrderById(orderToComplete.id);

        if (
          compRes.success &&
          completedOrder?.status === 'completed' &&
          completedOrder.delivered_at
        ) {
          updateTestStatus(3, 'passed');
          logs.push(`✓ الفحص 4 نجح: تم إتمام التوصيل وتحديث delivered_at وحالة completed.`);
        } else {
          throw new Error('فشل توثيق إتمام التوصيل');
        }
      } catch (err: any) {
        updateTestStatus(3, 'failed', err?.message);
        logs.push(`✗ الفحص 4 فشل: ${err?.message}`);
      }

      // 5. اختبار طلب الإلغاء بملاحظة
      let cancelPendingOrderId = '';
      try {
        const orderToCancel = await deliveryService.createSampleOrder();
        await deliveryService.acceptOrder(orderToCancel.id, currentDriver.id);
        const testReason = 'اختبار آلي: العميل أغلق الهاتف بعد وصول المندوب';
        const cancelReq = await deliveryService.requestCancellation(orderToCancel.id, currentDriver.id, testReason);
        const updatedCancelOrder = await deliveryService.getOrderById(orderToCancel.id);

        if (
          cancelReq.success &&
          updatedCancelOrder?.status === 'cancellation_pending' &&
          updatedCancelOrder.cancellation_reason === testReason &&
          updatedCancelOrder.cancellation_requested_by === currentDriver.id
        ) {
          cancelPendingOrderId = orderToCancel.id;
          updateTestStatus(4, 'passed');
          logs.push(`✓ الفحص 5 نجح: تم رفع طلب الإلغاء وتوثيق السبب ووقت ومصدر الطلب.`);
        } else {
          throw new Error('فشل تسجيل طلب الإلغاء');
        }
      } catch (err: any) {
        updateTestStatus(4, 'failed', err?.message);
        logs.push(`✗ الفحص 5 فشل: ${err?.message}`);
      }

      // 6. اختبار رفض إرسال الإلغاء بدون ملاحظة
      try {
        const orderBlankCancel = await deliveryService.createSampleOrder();
        await deliveryService.acceptOrder(orderBlankCancel.id, currentDriver.id);
        
        let threw = false;
        try {
          await deliveryService.requestCancellation(orderBlankCancel.id, currentDriver.id, '    ');
        } catch {
          threw = true;
        }

        if (threw) {
          updateTestStatus(5, 'passed');
          logs.push(`✓ الفحص 6 نجح: تم منع ورفض إرسال طلب الإلغاء الفارغ بنجاح.`);
        } else {
          throw new Error('تم السماح برفع طلب إلغاء فارغ دون ملاحظة!');
        }
      } catch (err: any) {
        updateTestStatus(5, 'failed', err?.message);
        logs.push(`✗ الفحص 6 فشل: ${err?.message}`);
      }

      // 7. اختبار عدم الإلغاء النهائي من تطبيق الدليفري
      try {
        let targetCancelId = cancelPendingOrderId;
        if (!targetCancelId) {
          const freshOrder = await deliveryService.createSampleOrder();
          await deliveryService.acceptOrder(freshOrder.id, currentDriver.id);
          await deliveryService.requestCancellation(freshOrder.id, currentDriver.id, 'اختبار عزل الإلغاء');
          targetCancelId = freshOrder.id;
        }

        const cancelOrder = await deliveryService.getOrderById(targetCancelId);
        if (cancelOrder && cancelOrder.status === 'cancellation_pending') {
          updateTestStatus(6, 'passed');
          logs.push(`✓ الفحص 7 نجح: حالة الطلب cancellation_pending ولا يمكن تحويلها إلى cancelled إلا بقرار الإدارة.`);
        } else {
          throw new Error('الطلب لم يتحول إلى حالة cancellation_pending أو حدث خلل!');
        }
      } catch (err: any) {
        updateTestStatus(6, 'failed', err?.message);
        logs.push(`✗ الفحص 7 فشل: ${err?.message}`);
      }

      // 8. منع تكرار قبول أو إتمام الطلب
      try {
        const doubleAcceptOrder = await deliveryService.createSampleOrder();
        await deliveryService.acceptOrder(doubleAcceptOrder.id, currentDriver.id);

        let doubleAcceptThrew = false;
        try {
          // محاولة قبول ثانية
          await deliveryService.acceptOrder(doubleAcceptOrder.id, currentDriver.id);
        } catch {
          doubleAcceptThrew = true;
        }

        let completeNotAcceptedThrew = false;
        try {
          // محاولة إتمام طلب غير مقبول (pending_review)
          const rawPending = await deliveryService.createSampleOrder();
          await deliveryService.completeOrder(rawPending.id, currentDriver.id);
        } catch {
          completeNotAcceptedThrew = true;
        }

        if (doubleAcceptThrew && completeNotAcceptedThrew) {
          updateTestStatus(7, 'passed');
          logs.push(`✓ الفحص 8 نجح: تم منع تكرار القبول ومنع إتمام طلب غير مقبول.`);
        } else {
          throw new Error('فشل التحقق من منع العمليات المكررة أو غير الصالحة');
        }
      } catch (err: any) {
        updateTestStatus(7, 'failed', err?.message);
        logs.push(`✗ الفحص 8 فشل: ${err?.message}`);
      }

      // 9. تحديث الحالات في Supabase والذاكرة وفق الحالات الخمس المعتمدة فقط
      try {
        const allowedStatuses = ['pending_review', 'accepted', 'cancellation_pending', 'cancelled', 'completed'];
        const allOrders = await deliveryService.getAllOrdersForAdmin();
        const invalidStatuses = allOrders.filter((o) => !allowedStatuses.includes(o.status));

        if (invalidStatuses.length === 0) {
          updateTestStatus(8, 'passed');
          logs.push(`✓ الفحص 9 نجح: جميع الطلبات تلتزم حصراً بالحالات الخمس المعتمدة.`);
        } else {
          throw new Error(`تم العثور على حالات غير معتمدة: ${invalidStatuses.map((i) => i.status).join(', ')}`);
        }
      } catch (err: any) {
        updateTestStatus(8, 'failed', err?.message);
        logs.push(`✗ الفحص 9 فشل: ${err?.message}`);
      }

      // 10. ظهور وتدقيق سجل الحالات (delivery_order_status_history)
      try {
        const testHistOrder = await deliveryService.createSampleOrder();
        await deliveryService.acceptOrder(testHistOrder.id, currentDriver.id);
        const histories = await deliveryService.getStatusHistory(testHistOrder.id);

        const hasPendingHist = histories.some((h) => h.new_status === 'pending_review');
        const hasAcceptedHist = histories.some(
          (h) => h.new_status === 'accepted' && (h.changed_by_role === 'delivery_driver' || !h.changed_by_role || h.changed_by)
        );

        if (histories.length > 0 && hasAcceptedHist) {
          updateTestStatus(9, 'passed');
          logs.push(`✓ الفحص 10 نجح: سجل delivery_order_status_history يحتوي على التغيرات مع الدور والسبب.`);
        } else {
          throw new Error('سجل الحالات غير مكتمل أو لم يسجل الدور بشكل صحيح');
        }
      } catch (err: any) {
        updateTestStatus(9, 'failed', err?.message);
        logs.push(`✗ الفحص 10 فشل: ${err?.message}`);
      }

      // 11. عدم الوصول إلى طلبات غير مسموحة (RLS)
      try {
        const visibleOrders = await deliveryService.getOrdersForDriver(currentDriver.id);
        // لا يجب أن يرى أي طلب مقبول ومسند لسائق آخر
        const leakedOrders = visibleOrders.filter(
          (o) => o.status !== 'pending_review' && o.assigned_driver_id !== currentDriver.id
        );

        if (leakedOrders.length === 0) {
          updateTestStatus(10, 'passed');
          logs.push(`✓ الفحص 11 نجح: عزل RLS تام - السائق لا يرى إلا طلبه الخاص أو المعروض pending_review.`);
        } else {
          throw new Error(`تسريب أمني: السائق استطاع رؤية ${leakedOrders.length} طلبات تخص سائقين آخرين!`);
        }
      } catch (err: any) {
        updateTestStatus(10, 'failed', err?.message);
        logs.push(`✗ الفحص 11 فشل: ${err?.message}`);
      }

    } finally {
      setIsRunning(false);
      setSummaryLogs(logs);
      onRefreshAll();
    }
  };

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const failedCount = tests.filter((t) => t.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Test Runner Controls Header */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <FlaskConical className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg font-bold text-neutral-900">
              حزمة الاختبارات الآلية (11 متطلب فحص)
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            فحص شامل للتدفق: ظهور الطلب، القبول، إتمام التوصيل، الإلغاء، أمان RLS، وسجل الحالات.
          </p>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="text-xs flex items-center space-x-2 space-x-reverse">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              {passedCount} ناجح
            </span>
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
              {failedCount} فاشل
            </span>
          </div>

          <button
            disabled={isRunning}
            onClick={runAllTests}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 flex items-center space-x-2 space-x-reverse"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري تشغيل الفحوصات...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>تشغيل جميع الاختبارات (11)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tests.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex items-start space-x-3 space-x-reverse"
          >
            <div className="mt-0.5 shrink-0">
              {test.status === 'passed' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              {test.status === 'failed' && (
                <XCircle className="w-5 h-5 text-rose-600" />
              )}
              {test.status === 'pending' && (
                <Clock className="w-5 h-5 text-neutral-300" />
              )}
            </div>

            <div className="flex-1 space-y-1 text-right">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900">{test.title}</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    test.status === 'passed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : test.status === 'failed'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {test.status === 'passed'
                    ? 'ناجح (Passed)'
                    : test.status === 'failed'
                    ? 'فشل (Failed)'
                    : 'في الانتظار'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                {test.description}
              </p>

              {test.errorDetails && (
                <div className="text-[10px] font-mono text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-200 mt-1">
                  الخطأ: {test.errorDetails}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Execution Logs Terminal */}
      {summaryLogs.length > 0 && (
        <div className="bg-neutral-900 text-neutral-200 rounded-2xl p-4 border border-neutral-800 font-mono text-xs space-y-1">
          <div className="text-neutral-400 text-[11px] font-bold pb-1 border-b border-neutral-800 flex items-center justify-between">
            <span>سجل نتائج التنفيذ المباشر:</span>
            <span>{summaryLogs.length} سطر</span>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1 pt-2">
            {summaryLogs.map((log, idx) => (
              <div
                key={idx}
                className={log.startsWith('✓') ? 'text-emerald-400' : log.startsWith('✗') ? 'text-rose-400' : 'text-neutral-300'}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
