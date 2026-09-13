import React, { useState } from 'react';
import { 
  UserCheck, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  User, 
  KeyRound, 
  Mail, 
  CreditCard, 
  FileText, 
  Sparkles,
  ArrowRight,
  BadgeCheck,
  Power
} from 'lucide-react';
import { DeliveryDriver } from '../types/delivery';
import { deliveryService } from '../services/deliveryService';

interface DriverAuthPageProps {
  currentDriver: DeliveryDriver | null;
  drivers: DeliveryDriver[];
  onSelectDriver: (driver: DeliveryDriver) => void;
  onDriverRegistered: (newDriver: DeliveryDriver) => void;
  onNavigateToOrders: () => void;
  onToggleActiveStatus?: (driverId: string, isActive: boolean) => void;
}

export const DriverAuthPage: React.FC<DriverAuthPageProps> = ({
  currentDriver,
  drivers,
  onSelectDriver,
  onDriverRegistered,
  onNavigateToOrders,
  onToggleActiveStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'register' | 'switch'>('register');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successDriver, setSuccessDriver] = useState<DeliveryDriver | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('دراجة نارية (موتوسيكل)');
  const [nationalId, setNationalId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const vehicleOptions = [
    'دراجة نارية (موتوسيكل)',
    'سيارة نقل خفيف (فان / ربع نقل)',
    'سيارة ملاكي صغيرة',
    'سكوتر كهربائي / دراجة',
  ];

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (!fullName.trim()) {
        throw new Error('يرجى كتابة الاسم الكامل للكابتن');
      }
      if (!phone.trim() || phone.trim().length < 10) {
        throw new Error('يرجى إدخال رقم هاتف صحيح مكون من 10 إلى 11 رقماً على الأقل');
      }

      const newDriver = await deliveryService.registerDriver({
        full_name: fullName.trim(),
        phone: phone.trim(),
        vehicle_type: vehicleType,
        national_id: nationalId.trim() || undefined,
        license_number: licenseNumber.trim() || undefined,
        email: email.trim() || undefined,
        password: password.trim() || undefined,
      });

      setSuccessDriver(newDriver);
      onDriverRegistered(newDriver);

      // Reset form fields
      setFullName('');
      setPhone('');
      setNationalId('');
      setLicenseNumber('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'تعذر تسجيل الكابتن، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCurrentDriverActive = async () => {
    if (!currentDriver) return;
    try {
      const updated = await deliveryService.toggleDriverActive(currentDriver.id, !currentDriver.is_active);
      if (onToggleActiveStatus) {
        onToggleActiveStatus(currentDriver.id, updated.is_active);
      }
      onSelectDriver(updated);
    } catch (err: any) {
      setErrorMsg(err?.message || 'فشل تحديث حالة السائق');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm border border-emerald-700/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 space-x-reverse bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-emerald-400/30">
            <ShieldCheck className="w-4 h-4" />
            <span>نظام توثيق وهوية الدليفري المعتمد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            تسجيل وهوية كابتن الدليفري
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            من هنا يتم تسجيل الكباتن الجدد وربط حساباتهم بقاعدة البيانات، ومنحهم الدور الرسمي{' '}
            <code className="bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-300 font-mono text-xs">role: delivery_driver</code>{' '}
            وصلاحيات قبول وتوصيل الطلبات وإدارتها وفق شروط الأمان و RLS.
          </p>
        </div>
      </div>

      {/* Current Active Driver Status Card */}
      {currentDriver && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 space-x-reverse flex-wrap gap-y-1">
                  <span className="font-bold text-neutral-900 text-base">
                    {currentDriver.full_name}
                  </span>
                  <span className="inline-flex items-center space-x-1 space-x-reverse px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>كابتن معتمد ({currentDriver.role})</span>
                  </span>
                  <span
                    className={`inline-flex items-center space-x-1 space-x-reverse px-2 py-0.5 rounded-full text-xs font-semibold ${
                      currentDriver.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${currentDriver.is_active ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    <span>{currentDriver.is_active ? 'الحساب نشط' : 'الحساب معطل (غير مفعل)'}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-4 space-x-reverse text-xs text-neutral-500 flex-wrap gap-y-1">
                  <span className="flex items-center space-x-1 space-x-reverse">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{currentDriver.phone}</span>
                  </span>
                  <span className="flex items-center space-x-1 space-x-reverse">
                    <Truck className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{currentDriver.vehicle_type || 'دراجة نارية'}</span>
                  </span>
                  <span className="font-mono text-neutral-400">
                    ID: {currentDriver.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse self-end md:self-center">
              <button
                type="button"
                onClick={handleToggleCurrentDriverActive}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 space-x-reverse ${
                  currentDriver.is_active
                    ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
                title="لاختبار منع السائق غير النشط من قبول الطلبات"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{currentDriver.is_active ? 'تعطيل الحساب تجريبياً' : 'إعادة تنشيط الحساب'}</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToOrders}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs flex items-center space-x-1.5 space-x-reverse"
              >
                <span>الانتقال للطلبات</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </div>

          {!currentDriver.is_active && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2 space-x-reverse">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                <strong>تنبيه الصلاحية:</strong> هذا الحساب معطل حالياً (<code>is_active = false</code>). وفقاً لقواعد النظام، لن يتمكن السائق من قبول أي طلب حتى يتم تنشيط الحساب.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Success Registration Celebration Banner */}
      {successDriver && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 text-emerald-950 shadow-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-emerald-900">
                  تم تسجيل واعتماد الكابتن ({successDriver.full_name}) بنجاح!
                </h3>
                <p className="text-xs text-emerald-800">
                  تم ربط الحساب برقم هاتف {successDriver.phone} وإسناد الدور الرسمي{' '}
                  <code className="font-bold font-mono">role: delivery_driver</code> وحالة النشاط{' '}
                  <code className="font-bold font-mono">is_active: true</code>.
                </p>
                <div className="pt-2 flex items-center space-x-3 space-x-reverse">
                  <button
                    type="button"
                    onClick={onNavigateToOrders}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center space-x-1.5 space-x-reverse"
                  >
                    <span>البدء بالعمل وقبول الطلبات الآن</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuccessDriver(null)}
                    className="text-xs text-emerald-700 hover:underline font-semibold"
                  >
                    إغلاق التنبيه
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form & Privileges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Tabs & Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 space-x-reverse bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200">
            <button
              type="button"
              onClick={() => setActiveSubTab('register')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 space-x-reverse ${
                activeSubTab === 'register'
                  ? 'bg-white text-emerald-800 shadow-xs border border-neutral-200/60'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>تسجيل كابتن جديد</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('switch')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 space-x-reverse ${
                activeSubTab === 'switch'
                  ? 'bg-white text-emerald-800 shadow-xs border border-neutral-200/60'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>قائمة الكباتن المسجلين ({drivers.length})</span>
            </button>
          </div>

          {/* Tab 1: Registration Form */}
          {activeSubTab === 'register' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-base font-bold text-neutral-900">
                  استمارة تسجيل كابتن دليفري جديد
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  أدخل بيانات الكابتن الرسمية لإدراجه في جدول <code>delivery_drivers</code> وتمكينه من النظام.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2 space-x-reverse">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700">
                      الاسم الكامل (رباعي) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="مثال: حسام الدين عبد الله"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pr-10 pl-3 text-xs font-medium text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700">
                      رقم الهاتف المحمول <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01012345678"
                        dir="ltr"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pr-10 pl-3 text-xs font-medium text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-right"
                      />
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700">
                      وسيلة التوصيل <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Truck className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pr-10 pl-3 text-xs font-medium text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      >
                        {vehicleOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* National ID */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700">
                      الرقم القومي (اختياري للتوثيق)
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
                      <input
                        type="text"
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                        placeholder="14 رقماً قومياً"
                        maxLength={14}
                        dir="ltr"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pr-10 pl-3 text-xs font-medium text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-right"
                      />
                    </div>
                  </div>

                  {/* Driver License */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700">
                      رقم رخصة القيادة (اختياري)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="رقم رخصة السائق أو المركبة"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pr-10 pl-3 text-xs font-medium text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Optional Email for Supabase Auth */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700">
                      البريد الإلكتروني (للربط مع Supabase Auth)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="driver@talabat-albayt.com"
                        dir="ltr"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pr-10 pl-3 text-xs font-medium text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-right"
                      />
                    </div>
                  </div>

                  {/* Optional Password */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700">
                      كلمة المرور (اختيارية)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pr-10 pl-3 text-xs font-medium text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      عند تحديد بريد وكلمة مرور، سيتم إنشاء حساب رسمي في <code>auth.users</code> وربط معرفه بـ <code>delivery_drivers.user_id</code>.
                    </p>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>إتمام التسجيل وتفعيل كافة صلاحيات الدليفري</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Switch / View Registered Drivers */}
          {activeSubTab === 'switch' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="text-base font-bold text-neutral-900">
                  الكباتن المعتمدون في النظام ({drivers.length})
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  انقر على أي سائق لتبديل الجلسة فوراً واستعراض شاشة الطلبات بصلاحياته.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {drivers.map((d) => {
                  const isCurrent = currentDriver?.id === d.id;
                  return (
                    <div
                      key={d.id}
                      className={`p-4 rounded-xl border transition relative flex flex-col justify-between space-y-3 ${
                        isCurrent
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-1.5 space-x-reverse">
                            <span className="font-bold text-sm text-neutral-900">
                              {d.full_name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-600 text-white rounded-md">
                                الجلسة الحالية
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 mt-1 space-y-0.5">
                            <p className="flex items-center space-x-1 space-x-reverse">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <span>{d.phone}</span>
                            </p>
                            <p className="flex items-center space-x-1 space-x-reverse">
                              <Truck className="w-3 h-3 text-neutral-400" />
                              <span>{d.vehicle_type || 'دراجة نارية'}</span>
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            d.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {d.is_active ? 'نشط' : 'معطل'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-neutral-400">
                          {d.id.slice(0, 8)}...
                        </span>
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectDriver(d);
                              onNavigateToOrders();
                            }}
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold text-neutral-700 transition flex items-center space-x-1 space-x-reverse"
                          >
                            <span>تسجيل الدخول بهذا الحساب</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Privileges & Verification Checklist */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center space-x-2 space-x-reverse">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>صلاحيات كابتن الدليفري المعتمد</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                تُمنح هذه الصلاحيات تلقائياً لكل حساب يحمل الدور <code>delivery_driver</code> وتكون حالته <code>is_active = true</code>.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start space-x-3 space-x-reverse">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800">
                    استعراض الطلبات الجديدة
                  </h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                    رؤية الطلبات المعروضة بحالة <code>pending_review</code> وقراءة تفاصيل العميل والموقع والعناصر.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start space-x-3 space-x-reverse">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800">
                    قبول الطلب والإسناد الذاتي
                  </h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                    تحويل حالة الطلب إلى <code>accepted</code> وإسناده لمعرف السائق مع توثيق <code>accepted_at</code>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start space-x-3 space-x-reverse">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800">
                    إتمام التوصيل والتسليم
                  </h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                    زر «تم التوصيل» متاح حصراً بعد القبول، لتحديث الحالة إلى <code>completed</code> وتوثيق وقت التسليم.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start space-x-3 space-x-reverse">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800">
                    طلب الإلغاء بملاحظة مسببة
                  </h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                    رفع طلب إلغاء إلى <code>cancellation_pending</code> مع إجبارية إدخال السبب وإرساله لقرار الإدارة.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start space-x-3 space-x-reverse">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800">
                    العزل الأمني وسياسات RLS
                  </h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                    حماية كاملة في قاعدة البيانات تمنع أي سائق آخر من رؤية أو تعديل الطلبات المسندة إليك.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
