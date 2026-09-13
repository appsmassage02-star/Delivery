import React, { useState } from 'react';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Database, 
  ShieldCheck, 
  Table, 
  Key, 
  Lock,
  Layers,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { SUPABASE_DELIVERY_SCHEMA_SQL } from '../lib/sql_schema';
import { getSavedSupabaseConfig, saveSupabaseConfig, resetSupabaseClient } from '../lib/supabase';

interface SchemaDocumentationProps {
  onConfigSaved: () => void;
}

const CLEAN_RESET_SQL = `-- كود تنظيف الجداول القديمة تماماً والبدء من الصفر
DROP TABLE IF EXISTS public.delivery_order_status_history CASCADE;
DROP TABLE IF EXISTS public.delivery_order_items CASCADE;
DROP TABLE IF EXISTS public.delivery_orders CASCADE;
DROP TABLE IF EXISTS public.delivery_drivers CASCADE;
DROP TABLE IF EXISTS public.delivery_settings CASCADE;
`;

export const SchemaDocumentation: React.FC<SchemaDocumentationProps> = ({ onConfigSaved }) => {
  const currentConfig = getSavedSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [copied, setCopied] = useState(false);
  const [copiedReset, setCopiedReset] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_DELIVERY_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyReset = () => {
    navigator.clipboard.writeText(CLEAN_RESET_SQL + '\n' + SUPABASE_DELIVERY_SCHEMA_SQL);
    setCopiedReset(true);
    setTimeout(() => setCopiedReset(false), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
    resetSupabaseClient();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    onConfigSaved();
  };

  return (
    <div className="space-y-6">
      {/* Alert on Error 42703 */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 space-x-reverse">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 text-xs">
          <h4 className="font-bold text-amber-950 text-sm">
            حل الخطأ: ERROR: 42703: column delivery_order_items.order_id does not exist
          </h4>
          <p className="text-amber-800 leading-relaxed">
            <strong>سبب الخطأ:</strong> جدول <code>delivery_order_items</code> كان موجوداً في قاعدة Supabase مسبقاً قبل تشغيل السكربت، وبما أن أمر <code>CREATE TABLE IF NOT EXISTS</code> يتخطى الجداول الموجودة، لم يُضف عمود <code>order_id</code> إلى جدولك القديم مما أدى لفشل سياسات الأمان RLS.
          </p>
          <p className="text-amber-900 font-medium">
            <strong>الحل المعتمد في هذا التحديث:</strong> تم تزويد السكربت بالمعالجة الذاتية (Self-Healing) التي تعيد تسمية <code>delivery_order_id</code> إلى <code>order_id</code> إن وجد وتضيف عمود <code>order_id</code> تلقائياً عبر <code>ALTER TABLE ... ADD COLUMN IF NOT EXISTS</code>.
          </p>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              بنية وربط قاعدة بيانات Supabase (مشروع طلبات البيت)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              استخدام الجداول والأعمدة والحالات المعتمدة حرفياً دون تعديل
            </p>
          </div>
        </div>

        {/* 5 Tables Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs space-y-1">
            <span className="font-mono font-bold text-emerald-800 block">1. delivery_settings</span>
            <p className="text-neutral-600">إعدادات الخدمة العامة وحالة التفعيل (<code>delivery_enabled</code>).</p>
          </div>
          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs space-y-1">
            <span className="font-mono font-bold text-emerald-800 block">2. delivery_drivers</span>
            <p className="text-neutral-600">هوية السائق مرتبطة بـ <code>auth.users.id</code> ورتبة <code>delivery_driver</code>.</p>
          </div>
          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs space-y-1">
            <span className="font-mono font-bold text-emerald-800 block">3. delivery_orders</span>
            <p className="text-neutral-600">بيانات الطلب، العميل، العنوان، الفاتورة، والحالات الخمس.</p>
          </div>
          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs space-y-1">
            <span className="font-mono font-bold text-emerald-800 block">4. delivery_order_items</span>
            <p className="text-neutral-600">عناصر وسلة المنتجات والكميات والأسعار (يتضمن عمود <code>order_id</code>).</p>
          </div>
          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs space-y-1 sm:col-span-2 lg:col-span-2">
            <span className="font-mono font-bold text-emerald-800 block">5. delivery_order_status_history</span>
            <p className="text-neutral-600">توثيق تسلسلي لتاريخ وتغير الحالات (من، إلى، المسؤول، الدور، والسبب).</p>
          </div>
        </div>

        {/* The 5 Official Statuses */}
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
          <h4 className="text-xs font-bold text-neutral-800 flex items-center space-x-1.5 space-x-reverse">
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
            <span>الحالات الخمس المعتمدة حصراً (delivery_order_status):</span>
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg font-mono bg-amber-100 text-amber-900 font-semibold">
              pending_review
            </span>
            <span className="px-2.5 py-1 rounded-lg font-mono bg-blue-100 text-blue-900 font-semibold">
              accepted
            </span>
            <span className="px-2.5 py-1 rounded-lg font-mono bg-orange-100 text-orange-900 font-semibold">
              cancellation_pending
            </span>
            <span className="px-2.5 py-1 rounded-lg font-mono bg-rose-100 text-rose-900 font-semibold">
              cancelled
            </span>
            <span className="px-2.5 py-1 rounded-lg font-mono bg-emerald-100 text-emerald-900 font-semibold">
              completed
            </span>
          </div>
        </div>
      </div>

      {/* Supabase Connection Form */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Database className="w-5 h-5 text-sky-600" />
          <h3 className="text-sm font-bold text-neutral-900">
            ربط مشروع Supabase المباشر (اختياري)
          </h3>
        </div>
        <p className="text-xs text-neutral-500">
          يمكنك إدخال رابط مشروع Supabase ومفتاح Anon Key للاتصال بقاعدة بياناتك المباشرة، أو الاستمرار بذاكرة المحاكاة المتزامنة لاختبار كافة الوظائف.
        </p>

        <form onSubmit={handleSaveConfig} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Supabase Anon Public Key
              </label>
              <input
                type="password"
                dir="ltr"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-neutral-400">
              * يتم تخزين المفاتيح محلياً فقط دون إرسالها لأي خادم خارجي.
            </span>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              {saveSuccess ? 'تم الحفظ وتحديث الاتصال!' : 'حفظ إعدادات الاتصال'}
            </button>
          </div>
        </form>
      </div>

      {/* SQL Script & RLS Policies */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <FileCode2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                كود SQL الجاهز والمصحح للتشغيل في Supabase SQL Editor
              </h3>
              <p className="text-xs text-neutral-500">يتضمن الفحص والإصلاح الذاتي للأعمدة والسياسات</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReset}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 space-x-reverse"
              title="نسخ كود التنظيف النظيف الشامل (DROP CASCADE)"
            >
              {copiedReset ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تم نسخ كود التهيئة النظيفة!</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                  <span>نسخ كود البدء النظيف (Reset)</span>
                </>
              )}
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 space-x-reverse shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>تم النسخ للحافظة</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ كود SQL الكامل</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-neutral-900 text-neutral-200 rounded-2xl p-4 overflow-x-auto text-xs font-mono max-h-96 leading-relaxed border border-neutral-800" dir="ltr">
          <pre>{SUPABASE_DELIVERY_SCHEMA_SQL}</pre>
        </div>
      </div>
    </div>
  );
};
