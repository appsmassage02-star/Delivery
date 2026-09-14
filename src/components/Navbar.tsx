import React from 'react';
import { 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  ShieldCheck, 
  UserCheck, 
  UserPlus,
  Power, 
  FileCode2,
  FlaskConical,
  RotateCcw
} from 'lucide-react';
import { DeliveryDriver, DeliverySettings } from '../types/delivery';
import { getSavedSupabaseConfig } from '../lib/supabase';

interface NavbarProps {
  currentDriver: DeliveryDriver;
  drivers: DeliveryDriver[];
  onSelectDriver: (driver: DeliveryDriver) => void;
  settings: DeliverySettings;
  activeTab: string;
  onChangeTab: (tab: any) => void;
  onOpenSupabaseConfig: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDriver,
  drivers,
  onSelectDriver,
  settings,
  activeTab,
  onChangeTab,
  onOpenSupabaseConfig,
  onResetData,
}) => {
  const { url } = getSavedSupabaseConfig();
  const isSupabaseConfigured = Boolean(url);

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="font-bold text-lg text-neutral-900 tracking-tight">
                  تطبيق الدليفري
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  طلبات البيت
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium hidden sm:block">
                نظام إدارة وقبول وتوصيل الطلبات المنفصل
              </p>
            </div>
          </div>

          {/* Service Status & Supabase Connection */}
          <div className="flex items-center space-x-2 space-x-reverse">
            {/* Delivery Service Toggle Indicator */}
            <div 
              className={`flex items-center space-x-1.5 space-x-reverse px-2.5 py-1 rounded-full text-xs font-semibold border ${
                settings.delivery_enabled 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{settings.delivery_enabled ? 'خدمة التوصيل مفعلة' : 'الخدمة معطلة حالياً'}</span>
            </div>

            {/* Supabase Status Pill */}
            <button
              onClick={onOpenSupabaseConfig}
              className={`flex items-center space-x-1.5 space-x-reverse px-2.5 py-1 rounded-full text-xs font-semibold border transition hover:opacity-90 ${
                isSupabaseConfigured
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-neutral-100 text-neutral-700 border-neutral-200'
              }`}
              title="إعدادات الاتصال بقاعدة Supabase"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured ? 'Supabase متصل' : 'قاعدة البيانات (محاكاة)'}</span>
            </button>

            {/* Quick Register Driver Button */}
            <button
              onClick={() => onChangeTab('auth')}
              className={`flex items-center space-x-1.5 space-x-reverse px-3 py-1 rounded-lg text-xs font-bold border transition ${
                activeTab === 'auth'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="تسجيل كابتن جديد أو استعراض الهوية والصلاحيات"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تسجيل كابتن</span>
            </button>

            {/* Driver Profile Switcher */}
            <div className="relative flex items-center bg-neutral-100 rounded-lg p-1 border border-neutral-200">
              <UserCheck className="w-4 h-4 text-neutral-600 mr-1 ml-1.5" />
              <select
                aria-label="تحديد السائق النشط"
                value={currentDriver.id}
                onChange={(e) => {
                  const found = drivers.find((d) => d.id === e.target.value);
                  if (found) onSelectDriver(found);
                }}
                className="bg-transparent text-xs font-semibold text-neutral-800 pr-2 pl-6 py-1 focus:outline-hidden cursor-pointer"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} ({d.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={onResetData}
              title="إعادة تهيئة البيانات الأولية"
              className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Hidden on mobile phones where MobileBottomNav takes over, visible on md+ screens) */}
        <div className="hidden md:flex space-x-4 space-x-reverse -mb-px border-t border-neutral-100 overflow-x-auto text-sm">
          <button
            onClick={() => onChangeTab('orders')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center space-x-1.5 space-x-reverse whitespace-nowrap transition ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>طلبات الدليفري</span>
          </button>

          <button
            onClick={() => onChangeTab('auth')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center space-x-1.5 space-x-reverse whitespace-nowrap transition ${
              activeTab === 'auth'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل وهوية الكابتن</span>
          </button>

          <button
            onClick={() => onChangeTab('admin')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center space-x-1.5 space-x-reverse whitespace-nowrap transition ${
              activeTab === 'admin'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>لوحة الإدارة (محاكاة القرارات)</span>
          </button>

          <button
            onClick={() => onChangeTab('tests')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center space-x-1.5 space-x-reverse whitespace-nowrap transition ${
              activeTab === 'tests'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>فحص الاختبارات (11 اختبار)</span>
          </button>

          <button
            onClick={() => onChangeTab('schema')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center space-x-1.5 space-x-reverse whitespace-nowrap transition ${
              activeTab === 'schema'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>مخطط Supabase وSQL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
