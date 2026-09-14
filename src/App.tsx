import React, { useState, useEffect, useCallback } from 'react';
import { 
  DeliveryDriver, 
  DeliveryOrder, 
  DeliverySettings 
} from './types/delivery';
import { deliveryService } from './services/deliveryService';
import { Navbar } from './components/Navbar';
import { OrdersList } from './components/OrdersList';
import { OrderDetailModal } from './components/OrderDetailModal';
import { CancelRequestModal } from './components/CancelRequestModal';
import { AdminSimulationPanel } from './components/AdminSimulationPanel';
import { TestSuitePanel } from './components/TestSuitePanel';
import { SchemaDocumentation } from './components/SchemaDocumentation';
import { DriverAuthPage } from './components/DriverAuthPage';
import { DriverProfilePage } from './components/DriverProfilePage';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { AlertCircle, CheckCircle2, Truck } from 'lucide-react';
import { getSavedSupabaseConfig } from './lib/supabase';

export default function App() {
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [currentDriver, setCurrentDriver] = useState<DeliveryDriver | null>(null);
  const [settings, setSettings] = useState<DeliverySettings>({
    id: 'default',
    delivery_enabled: true,
  });
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [allOrdersForAdmin, setAllOrdersForAdmin] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view tab: desktop and mobile unified
  const [activeTab, setActiveTab] = useState<'orders' | 'admin' | 'tests' | 'schema' | 'auth' | 'pending' | 'accepted' | 'completed' | 'rejected' | 'profile'>('orders');

  // Modals state
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<DeliveryOrder | null>(null);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<DeliveryOrder | null>(null);

  // Toast / notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [fetchedDrivers, fetchedSettings] = await Promise.all([
        deliveryService.getDrivers(),
        deliveryService.getSettings(),
      ]);

      setDrivers(fetchedDrivers);
      setSettings(fetchedSettings);

      const driverToUse = currentDriver || fetchedDrivers[0];
      if (!currentDriver && fetchedDrivers.length > 0) {
        setCurrentDriver(fetchedDrivers[0]);
      }

      if (driverToUse) {
        const [driverOrders, allOrders] = await Promise.all([
          deliveryService.getOrdersForDriver(driverToUse.id),
          deliveryService.getAllOrdersForAdmin(),
        ]);
        setOrders(driverOrders);
        setAllOrdersForAdmin(allOrders);

        // Update selected order detail if open
        if (selectedOrderForDetail) {
          const fresh = allOrders.find((o) => o.id === selectedOrderForDetail.id);
          if (fresh) setSelectedOrderForDetail(fresh);
        }
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      showToast(err?.message || 'فشل في تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentDriver, selectedOrderForDetail]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Driver Switch
  const handleSelectDriver = async (driver: DeliveryDriver) => {
    setCurrentDriver(driver);
    setLoading(true);
    try {
      const [driverOrders, allOrders] = await Promise.all([
        deliveryService.getOrdersForDriver(driver.id),
        deliveryService.getAllOrdersForAdmin(),
      ]);
      setOrders(driverOrders);
      setAllOrdersForAdmin(allOrders);
      showToast(`تم التبديل إلى السائق: ${driver.full_name}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Driver Registration & Immediate Access
  const handleDriverRegistered = async (newDriver: DeliveryDriver) => {
    setDrivers((prev) => [newDriver, ...prev.filter((d) => d.id !== newDriver.id)]);
    setCurrentDriver(newDriver);
    showToast(`تم تسجيل الكابتن ${newDriver.full_name} بنجاح وتفعيل كافة الصلاحيات!`);
    await loadData();
  };

  const handleToggleDriverActiveStatus = (driverId: string, isActive: boolean) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, is_active: isActive } : d))
    );
    if (currentDriver && currentDriver.id === driverId) {
      setCurrentDriver((prev) => (prev ? { ...prev, is_active: isActive } : null));
    }
    showToast(isActive ? 'تم تنشيط حساب السائق' : 'تم تعطيل حساب السائق');
  };

  // 3. قبول الطلب
  const handleAcceptOrder = async (orderId: string) => {
    if (!currentDriver) return;
    try {
      const res = await deliveryService.acceptOrder(orderId, currentDriver.id);
      showToast(res.message);
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'تعذر قبول الطلب', 'error');
    }
  };

  // 4. إتمام التوصيل
  const handleCompleteOrder = async (orderId: string) => {
    if (!currentDriver) return;
    try {
      const res = await deliveryService.completeOrder(orderId, currentDriver.id);
      showToast(res.message);
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'تعذر إتمام التوصيل', 'error');
    }
  };

  // 5. طلب الإلغاء
  const handleRequestCancelSubmit = async (orderId: string, reason: string) => {
    if (!currentDriver) return;
    try {
      const res = await deliveryService.requestCancellation(orderId, currentDriver.id, reason);
      showToast(res.message);
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'تعذر رفع طلب الإلغاء', 'error');
      throw err;
    }
  };

  // 6. قرارات الإدارة
  const handleAdminResolveCancellation = async (orderId: string, approve: boolean, notes?: string) => {
    try {
      const res = await deliveryService.adminResolveCancellation(orderId, approve, notes);
      showToast(
        approve 
          ? 'وافقت الإدارة على الإلغاء وتم تحويل الحالة إلى cancelled' 
          : 'رفضت الإدارة الإلغاء وتمت إعادة الحالة إلى accepted'
      );
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'فشل معالجة الإلغاء', 'error');
    }
  };

  // 7. تفعيل أو تعطيل الخدمة
  const handleToggleDeliveryEnabled = async (enabled: boolean) => {
    try {
      const updated = await deliveryService.updateSettings(enabled);
      setSettings(updated);
      showToast(enabled ? 'تم تفعيل خدمة الدليفري' : 'تم تعطيل خدمة الدليفري من قبل الإدارة');
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'فشل تعديل حالة الخدمة', 'error');
    }
  };

  // إنشاء طلب تجريبي
  const handleCreateSampleOrder = async () => {
    try {
      const newOrder = await deliveryService.createSampleOrder();
      showToast(`تم إنشاء طلب تجريبي جديد: ${newOrder.order_number}`);
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'فشل إنشاء الطلب', 'error');
    }
  };

  // إعادة تهيئة البيانات
  const handleResetData = () => {
    deliveryService.resetAllToSeed();
    loadData();
    showToast('تمت إعادة ضبط البيانات التجريبية الأولية بنجاح');
  };

  if (loading && !currentDriver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-600 font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold">جاري تهيئة تطبيق الدليفري المنفصل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 left-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold flex items-center space-x-2 space-x-reverse ${
              toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      {currentDriver ? (
        <Navbar
          currentDriver={currentDriver}
          drivers={drivers}
          onSelectDriver={handleSelectDriver}
          settings={settings}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenSupabaseConfig={() => setActiveTab('schema')}
          onResetData={handleResetData}
        />
      ) : (
        <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-neutral-900 text-base">تطبيق الدليفري - طلبات البيت</h1>
              <p className="text-xs text-neutral-500">يرجى تسجيل حساب الكابتن للدخول للنظام وبدء العمل</p>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {!currentDriver && (
          <DriverAuthPage
            currentDriver={null}
            drivers={drivers}
            onSelectDriver={handleSelectDriver}
            onDriverRegistered={handleDriverRegistered}
            onNavigateToOrders={() => setActiveTab('orders')}
            onToggleActiveStatus={handleToggleDriverActiveStatus}
          />
        )}

        {/* 1. All Orders View (Desktop Default) */}
        {currentDriver && activeTab === 'orders' && (
          <OrdersList
            orders={orders}
            currentDriver={currentDriver}
            settings={settings}
            onAcceptOrder={handleAcceptOrder}
            onCompleteOrder={handleCompleteOrder}
            onRequestCancel={(order) => setSelectedOrderForCancel(order)}
            onViewDetails={(order) => setSelectedOrderForDetail(order)}
            mobileViewMode="all"
          />
        )}

        {/* 2. Mobile Tab: Pending Review Orders (الطلبات المتاحة للقبول) */}
        {currentDriver && activeTab === 'pending' && (
          <OrdersList
            orders={orders}
            currentDriver={currentDriver}
            settings={settings}
            onAcceptOrder={handleAcceptOrder}
            onCompleteOrder={handleCompleteOrder}
            onRequestCancel={(order) => setSelectedOrderForCancel(order)}
            onViewDetails={(order) => setSelectedOrderForDetail(order)}
            mobileViewMode="pending"
          />
        )}

        {/* 3. Mobile Tab: Accepted Active Orders (الطلبات المقبولة قيد التوصيل) */}
        {currentDriver && activeTab === 'accepted' && (
          <OrdersList
            orders={orders}
            currentDriver={currentDriver}
            settings={settings}
            onAcceptOrder={handleAcceptOrder}
            onCompleteOrder={handleCompleteOrder}
            onRequestCancel={(order) => setSelectedOrderForCancel(order)}
            onViewDetails={(order) => setSelectedOrderForDetail(order)}
            mobileViewMode="accepted"
          />
        )}

        {/* 4. Mobile Tab: Completed Orders (الطلبات التي تم توصيلها بنجاح) */}
        {currentDriver && activeTab === 'completed' && (
          <OrdersList
            orders={orders}
            currentDriver={currentDriver}
            settings={settings}
            onAcceptOrder={handleAcceptOrder}
            onCompleteOrder={handleCompleteOrder}
            onRequestCancel={(order) => setSelectedOrderForCancel(order)}
            onViewDetails={(order) => setSelectedOrderForDetail(order)}
            mobileViewMode="completed"
          />
        )}

        {/* 5. Mobile Tab: Rejected / Cancelled Orders (الطلبات المرفوضة والملغاة) */}
        {currentDriver && activeTab === 'rejected' && (
          <OrdersList
            orders={orders}
            currentDriver={currentDriver}
            settings={settings}
            onAcceptOrder={handleAcceptOrder}
            onCompleteOrder={handleCompleteOrder}
            onRequestCancel={(order) => setSelectedOrderForCancel(order)}
            onViewDetails={(order) => setSelectedOrderForDetail(order)}
            mobileViewMode="rejected"
          />
        )}

        {/* 6. Mobile Tab: Driver Profile Page (الملف الشخصي للكابتن) */}
        {currentDriver && activeTab === 'profile' && (
          <DriverProfilePage
            currentDriver={currentDriver}
            drivers={drivers}
            settings={settings}
            isSupabaseConfigured={Boolean(getSavedSupabaseConfig().url)}
            onSelectDriver={handleSelectDriver}
            onToggleActiveStatus={handleToggleDriverActiveStatus}
            onNavigateToTests={() => setActiveTab('tests')}
            onNavigateToAdmin={() => setActiveTab('admin')}
            onNavigateToSchema={() => setActiveTab('schema')}
            onLogout={() => {
              setCurrentDriver(null);
              setActiveTab('auth');
              showToast('تم تسجيل الخروج من الجلسة');
            }}
            stats={{
              totalAccepted: orders.filter((o) => o.status === 'accepted' && o.assigned_driver_id === currentDriver.id).length,
              totalCompleted: orders.filter((o) => o.status === 'completed' && o.assigned_driver_id === currentDriver.id).length,
              totalPendingCancellation: orders.filter((o) => o.status === 'cancellation_pending' && o.assigned_driver_id === currentDriver.id).length,
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminSimulationPanel
            orders={orders}
            allOrders={allOrdersForAdmin}
            settings={settings}
            onToggleDeliveryEnabled={handleToggleDeliveryEnabled}
            onResolveCancellation={handleAdminResolveCancellation}
            onCreateSampleOrder={handleCreateSampleOrder}
            onViewOrderDetails={(order) => setSelectedOrderForDetail(order)}
            onRefresh={loadData}
          />
        )}

        {currentDriver && activeTab === 'tests' && (
          <TestSuitePanel
            currentDriver={currentDriver}
            onRefreshAll={loadData}
          />
        )}

        {activeTab === 'auth' && (
          <DriverAuthPage
            currentDriver={currentDriver}
            drivers={drivers}
            onSelectDriver={handleSelectDriver}
            onDriverRegistered={handleDriverRegistered}
            onNavigateToOrders={() => setActiveTab('orders')}
            onToggleActiveStatus={handleToggleDriverActiveStatus}
          />
        )}

        {activeTab === 'schema' && (
          <SchemaDocumentation
            onConfigSaved={loadData}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar: visible on mobile, provides instant native 5-tab switching */}
      {currentDriver && (
        <div className="md:hidden">
          <MobileBottomNav
            activeTab={
              ['pending', 'accepted', 'completed', 'rejected', 'profile'].includes(activeTab)
                ? (activeTab as MobileTab)
                : activeTab === 'orders'
                ? 'pending'
                : 'profile'
            }
            onChangeTab={(tab) => setActiveTab(tab)}
            counts={{
              pending: orders.filter((o) => o.status === 'pending_review').length,
              accepted: orders.filter((o) => o.status === 'accepted' && o.assigned_driver_id === currentDriver.id).length,
              completed: orders.filter((o) => o.status === 'completed' && o.assigned_driver_id === currentDriver.id).length,
              rejected: orders.filter((o) => o.status === 'cancelled' || o.status === 'cancellation_pending').length,
            }}
          />
        </div>
      )}

      {/* Order Detail Modal */}
      {currentDriver && (
        <OrderDetailModal
          order={selectedOrderForDetail}
          currentDriver={currentDriver}
          isOpen={Boolean(selectedOrderForDetail)}
          onClose={() => setSelectedOrderForDetail(null)}
          onAccept={handleAcceptOrder}
          onComplete={handleCompleteOrder}
          onRequestCancel={(order) => {
            setSelectedOrderForDetail(null);
            setSelectedOrderForCancel(order);
          }}
        />
      )}

      {/* Cancel Request Modal (Mandatory Note) */}
      {selectedOrderForCancel && (
        <CancelRequestModal
          order={selectedOrderForCancel}
          isOpen={Boolean(selectedOrderForCancel)}
          onClose={() => setSelectedOrderForCancel(null)}
          onSubmit={handleRequestCancelSubmit}
        />
      )}
    </div>
  );
}
