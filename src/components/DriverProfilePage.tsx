import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Truck, 
  CreditCard, 
  FileText, 
  Mail, 
  ShieldCheck, 
  Power, 
  BadgeCheck, 
  LogOut, 
  FlaskConical, 
  Sliders, 
  ExternalLink,
  ChevronLeft,
  Database,
  Info
} from 'lucide-react';
import { DeliveryDriver, DeliverySettings } from '../types/delivery';
import { deliveryService } from '../services/deliveryService';

interface DriverProfilePageProps {
  currentDriver: DeliveryDriver;
  drivers: DeliveryDriver[];
  settings: DeliverySettings;
  isSupabaseConfigured: boolean;
  onSelectDriver: (driver: DeliveryDriver) => void;
  onToggleActiveStatus: (driverId: string, isActive: boolean) => void;
  onNavigateToTests: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToSchema: () => void;
  onLogout: () => void;
  stats: {
    totalAccepted: number;
    totalCompleted: number;
    totalPendingCancellation: number;
  };
}

export const DriverProfilePage: React.FC<DriverProfilePageProps> = ({
  currentDriver,
  drivers,
  settings,
  isSupabaseConfigured,
  onSelectDriver,
  onToggleActiveStatus,
  onNavigateToTests,
  onNavigateToAdmin,
  onNavigateToSchema,
  onLogout,
  stats,
}) => {
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-200">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 rounded-3xl p-6 text-white shadow-sm border border-emerald-700/50 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5 space-x-reverse">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                <User className="w-7 h-7 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <h1 className="text-lg font-extrabold text-white tracking-tight">
                    {currentDriver.full_name}
                  </h1>
                  <BadgeCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                </div>
                <p className="text-xs text-emerald-200/90 font-mono mt-0.5">
                  {currentDriver.phone}
                </p>
                <div className="mt-2 inline-flex items-center space-x-1.5 space-x-reverse px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  <Truck className="w-3.5 h-3.5" />
                  <span>{currentDriver.vehicle_type || 'دراجة نارية (موتوسيكل)'}</span>
                </div>
              </div>
            </div>

            <div className="text-left">
              <span
                className={`inline-flex items-center space-x-1 space-x-reverse px-2.5 py-1 rounded-full text-xs font-bold ${
                  currentDriver.is_active
                    ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${currentDriver.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span>{currentDriver.is_active ? 'نشط' : 'معطل'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs text-center">
          <span className="text-[11px] font-semibold text-neutral-500 block mb-1">
            قيد التوصيل
          </span>
          <span className="text-xl font-extrabold text-amber-600 font-mono">
            {stats.totalAccepted}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs text-center">
          <span className="text-[11px] font-semibold text-neutral-500 block mb-1">
            تم تسليمها
          </span>
          <span className="text-xl font-extrabold text-teal-600 font-mono">
            {stats.totalCompleted}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs text-center">
          <span className="text-[11px] font-semibold text-neutral-500 block mb-1">
            طلبات الإلغاء
          </span>
          <span className="text-xl font-extrabold text-rose-600 font-mono">
            {stats.totalPendingCancellation}
          </span>
        </div>
      </div>

      {/* Driver Identity Details */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-neutral-50/80 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-700 flex items-center space-x-1.5 space-x-reverse">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>بيانات الهوية والتوثيق الرسمي</span>
          </h2>
          <span className="text-[10px] font-mono text-neutral-400">
            ID: {currentDriver.id.slice(0, 8)}...
          </span>
        </div>

        <div className="divide-y divide-neutral-100 text-xs">
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-neutral-500 flex items-center space-x-2 space-x-reverse">
              <User className="w-4 h-4 text-neutral-400" />
              <span>الاسم الكامل</span>
            </span>
            <span className="font-bold text-neutral-900">{currentDriver.full_name}</span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-neutral-500 flex items-center space-x-2 space-x-reverse">
              <Phone className="w-4 h-4 text-neutral-400" />
              <span>رقم الهاتف</span>
            </span>
            <span className="font-bold font-mono text-neutral-900" dir="ltr">{currentDriver.phone}</span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-neutral-500 flex items-center space-x-2 space-x-reverse">
              <Truck className="w-4 h-4 text-neutral-400" />
              <span>وسيلة التوصيل</span>
            </span>
            <span className="font-bold text-neutral-900">{currentDriver.vehicle_type || 'دراجة نارية'}</span>
          </div>

          {currentDriver.national_id && (
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-neutral-500 flex items-center space-x-2 space-x-reverse">
                <CreditCard className="w-4 h-4 text-neutral-400" />
                <span>الرقم القومي</span>
              </span>
              <span className="font-mono text-neutral-800" dir="ltr">{currentDriver.national_id}</span>
            </div>
          )}

          {currentDriver.license_number && (
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-neutral-500 flex items-center space-x-2 space-x-reverse">
                <FileText className="w-4 h-4 text-neutral-400" />
                <span>رقم الرخصة</span>
              </span>
              <span className="font-mono text-neutral-800">{currentDriver.license_number}</span>
            </div>
          )}

          {currentDriver.email && (
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-neutral-500 flex items-center space-x-2 space-x-reverse">
                <Mail className="w-4 h-4 text-neutral-400" />
                <span>البريد الإلكتروني</span>
              </span>
              <span className="font-mono text-neutral-800" dir="ltr">{currentDriver.email}</span>
            </div>
          )}

          <div className="p-3.5 flex items-center justify-between bg-neutral-50/50">
            <span className="text-neutral-600 font-semibold">حالة استقبال الطلبات</span>
            <button
              type="button"
              onClick={() => onToggleActiveStatus(currentDriver.id, !currentDriver.is_active)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 space-x-reverse ${
                currentDriver.is_active
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{currentDriver.is_active ? 'تعطيل الحساب تجريبياً' : 'تفعيل الحساب الآن'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Settings & Testing Options (Non-intrusive access) */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-4 space-y-3">
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          أدوات النظام والفحص الميداني
        </h2>

        {/* 1. صفحة فحص الاختبارات النظامية (الحفاظ الصارم عليها) */}
        <button
          type="button"
          onClick={onNavigateToTests}
          className="w-full p-3 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 rounded-2xl flex items-center justify-between transition text-purple-950 group"
        >
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="font-bold text-xs block text-purple-950">
                فحص الاختبارات النظامية الـ 11
              </span>
              <span className="text-[11px] text-purple-700/90 block mt-0.5">
                فحص RLS، القبول، التوصيل، الإلغاء وحصانة البيانات
              </span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition" />
        </button>

        {/* 2. لوحة محاكاة قرارات الإدارة */}
        <button
          type="button"
          onClick={onNavigateToAdmin}
          className="w-full p-3 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 rounded-2xl flex items-center justify-between transition text-neutral-900 group"
        >
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="font-bold text-xs block text-neutral-900">
                لوحة قرارات الإدارة ومفتاح التوصيل
              </span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">
                الفصل في الإلغاء ({stats.totalPendingCancellation}) ومفتاح الخدمة العام
              </span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition" />
        </button>

        {/* 3. توثيق Supabase و SQL */}
        <button
          type="button"
          onClick={onNavigateToSchema}
          className="w-full p-3 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 rounded-2xl flex items-center justify-between transition text-neutral-900 group"
        >
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="font-bold text-xs block text-neutral-900">
                بيانات قاعدة Supabase والمخطط
              </span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">
                {isSupabaseConfigured ? 'متصل بقاعدة البيانات السحابية' : 'يعمل بنمط التخزين المحلي الآمن'}
              </span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition" />
        </button>
      </div>

      {/* Account Switching & Logout Actions */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowSwitchModal(true)}
          className="w-full py-3 px-4 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs transition shadow-2xs flex items-center justify-center space-x-2 space-x-reverse"
        >
          <User className="w-4 h-4 text-neutral-500" />
          <span>تبديل حساب الكابتن ({drivers.length} مسجلين)</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/80 text-rose-800 font-bold text-xs transition flex items-center justify-center space-x-2 space-x-reverse"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج من الجلسة الحالية</span>
        </button>
      </div>

      {/* Driver Switch Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">
                اختر حساب الكابتن للدخول
              </h3>
              <button
                type="button"
                onClick={() => setShowSwitchModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-bold"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-2">
              {drivers.map((d) => {
                const isSelected = d.id === currentDriver.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      onSelectDriver(d);
                      setShowSwitchModal(false);
                    }}
                    className={`w-full text-right p-3 rounded-2xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{d.full_name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{d.phone}</div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        d.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {d.is_active ? 'نشط' : 'معطل'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
