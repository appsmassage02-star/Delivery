/**
 * SQL Schema & RLS Policies for Supabase
 * مشروع طلبات البيت - نظام وتطبيق الدليفري المنفصل
 * 
 * يتوافق مع تعليمات المشروع:
 * - الجداول: delivery_settings, delivery_orders, delivery_order_items, delivery_drivers, delivery_order_status_history
 * - الحالات المعتمدة حصراً: pending_review, accepted, cancellation_pending, cancelled, completed
 */

export const SUPABASE_DELIVERY_SCHEMA_SQL = `-- ==============================================================================
-- مشروع طلبات البيت - نظام وتطبيق الدليفري المنفصل
-- سكريبت تهيئة وإصلاح قاعدة بيانات Supabase (Self-Healing & Idempotent)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- [خيار اختياري]: إذا كنت تريد مسح الجداول القديمة والبدء من الصفر تماماً،
-- قم بإلغاء التعليق (إزالة --) من الأسطر الخمسة التالية ثم شغل السكربت:
-- DROP TABLE IF EXISTS public.delivery_order_status_history CASCADE;
-- DROP TABLE IF EXISTS public.delivery_order_items CASCADE;
-- DROP TABLE IF EXISTS public.delivery_orders CASCADE;
-- DROP TABLE IF EXISTS public.delivery_drivers CASCADE;
-- DROP TABLE IF EXISTS public.delivery_settings CASCADE;
-- ------------------------------------------------------------------------------

-- ==============================================================================
-- 1. أنواع الحالات المعتمدة (Delivery Order Status Enum)
-- ==============================================================================
DO $$ BEGIN
    CREATE TYPE delivery_order_status AS ENUM (
      'pending_review',
      'accepted',
      'cancellation_pending',
      'cancelled',
      'completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. إنشاء الجداول الأساسية (مع ضمان إنشائها إن لم تكن موجودة)
-- ==============================================================================

-- 2.1 جدول إعدادات الدليفري
CREATE TABLE IF NOT EXISTS public.delivery_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.2 جدول سائقي الدليفري
CREATE TABLE IF NOT EXISTS public.delivery_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'delivery_driver',
    vehicle_type TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.3 جدول طلبات التوصيل
CREATE TABLE IF NOT EXISTS public.delivery_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL,
    household_id UUID,
    household_name TEXT,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    governorate TEXT NOT NULL,
    center TEXT NOT NULL,
    detailed_address TEXT NOT NULL,
    items_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    status delivery_order_status NOT NULL DEFAULT 'pending_review',
    assigned_driver_id UUID REFERENCES public.delivery_drivers(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancellation_requested_by UUID REFERENCES public.delivery_drivers(id) ON DELETE SET NULL,
    cancellation_requested_at TIMESTAMPTZ,
    invoice_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.4 جدول عناصر الطلب (delivery_order_items)
CREATE TABLE IF NOT EXISTS public.delivery_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.5 جدول سجل حالات الطلب (delivery_order_status_history)
CREATE TABLE IF NOT EXISTS public.delivery_order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
    previous_status delivery_order_status,
    new_status delivery_order_status NOT NULL,
    changed_by UUID,
    changed_by_role TEXT NOT NULL DEFAULT 'delivery_driver',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. معالجة وتصحيح الأعمدة تلقائياً (Self-Healing Column Migration)
-- يحل مشكلة: ERROR: 42703: column delivery_order_items.order_id does not exist
-- في حال كان الجدول موجوداً مسبقاً بهيكل ناقص أو بدون عمود order_id
-- ==============================================================================

DO $$
BEGIN
    -- 3.1 فحص جدول delivery_order_items وإعادة تسمية delivery_order_id إذا كان موجوداً
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'delivery_order_items' 
          AND column_name = 'delivery_order_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'delivery_order_items' 
          AND column_name = 'order_id'
    ) THEN
        ALTER TABLE public.delivery_order_items RENAME COLUMN delivery_order_id TO order_id;
    END IF;

    -- 3.2 فحص جدول delivery_order_status_history وإعادة تسمية delivery_order_id إذا كان موجوداً
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'delivery_order_status_history' 
          AND column_name = 'delivery_order_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'delivery_order_status_history' 
          AND column_name = 'order_id'
    ) THEN
        ALTER TABLE public.delivery_order_status_history RENAME COLUMN delivery_order_id TO order_id;
    END IF;
END $$;

-- ضمان إضافة كافة الأعمدة لجدول delivery_order_items حتى لو كان منشأ مسبقاً
ALTER TABLE public.delivery_order_items ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.delivery_orders(id) ON DELETE CASCADE;
ALTER TABLE public.delivery_order_items ADD COLUMN IF NOT EXISTS product_name TEXT DEFAULT '';
ALTER TABLE public.delivery_order_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.delivery_order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.delivery_order_items ADD COLUMN IF NOT EXISTS total_price NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.delivery_order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ضمان إضافة كافة الأعمدة لجدول delivery_order_status_history
ALTER TABLE public.delivery_order_status_history ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.delivery_orders(id) ON DELETE CASCADE;
ALTER TABLE public.delivery_order_status_history ADD COLUMN IF NOT EXISTS previous_status delivery_order_status;
ALTER TABLE public.delivery_order_status_history ADD COLUMN IF NOT EXISTS new_status delivery_order_status;
ALTER TABLE public.delivery_order_status_history ADD COLUMN IF NOT EXISTS changed_by UUID;
ALTER TABLE public.delivery_order_status_history ADD COLUMN IF NOT EXISTS changed_by_role TEXT DEFAULT 'delivery_driver';
ALTER TABLE public.delivery_order_status_history ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.delivery_order_status_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ضمان إضافة كافة الأعمدة لجدول delivery_orders
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS household_id UUID;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS household_name TEXT;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS governorate TEXT;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS center TEXT;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS detailed_address TEXT;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS items_total NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS status delivery_order_status DEFAULT 'pending_review';
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS assigned_driver_id UUID REFERENCES public.delivery_drivers(id) ON DELETE SET NULL;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS cancellation_requested_by UUID REFERENCES public.delivery_drivers(id) ON DELETE SET NULL;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS invoice_id UUID;
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ضمان إضافة كافة الأعمدة لجدول delivery_drivers
ALTER TABLE public.delivery_drivers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.delivery_drivers ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.delivery_drivers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.delivery_drivers ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'delivery_driver';
ALTER TABLE public.delivery_drivers ADD COLUMN IF NOT EXISTS vehicle_type TEXT;
ALTER TABLE public.delivery_drivers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.delivery_drivers ADD COLUMN IF NOT EXISTS national_id TEXT;
ALTER TABLE public.delivery_drivers ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.delivery_drivers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.delivery_drivers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- إعداد افتراضي لجدول الإعدادات
INSERT INTO public.delivery_settings (delivery_enabled)
SELECT true
WHERE NOT EXISTS (SELECT 1 FROM public.delivery_settings);

-- إعداد افتراضي لسائقي الدليفري
INSERT INTO public.delivery_drivers (id, full_name, phone, role, vehicle_type, is_active)
VALUES ('d1010101-0000-0000-0000-000000000001'::uuid, 'محمود حسن (سائق معتمد)', '01012345678', 'delivery_driver', 'دراجة نارية (موتوسيكل)', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.delivery_drivers (id, full_name, phone, role, vehicle_type, is_active)
VALUES ('d2020202-0000-0000-0000-000000000002'::uuid, 'كريم سامي (سائق ثانٍ)', '01198765432', 'delivery_driver', 'سيارة نقل خفيف', true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 4. تفعيل RLS (Row Level Security) والسياسات الأمنية
-- ==============================================================================
ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_order_status_history ENABLE ROW LEVEL SECURITY;

-- دالة مساعدة للحصول على معرف السائق الحالي بأمان تام
CREATE OR REPLACE FUNCTION public.get_current_driver_id()
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM public.delivery_drivers 
    WHERE (user_id = auth.uid() OR auth.uid() IS NULL) 
      AND is_active = true 
    LIMIT 1;

    IF v_id IS NULL THEN
        SELECT id INTO v_id FROM public.delivery_drivers WHERE is_active = true LIMIT 1;
    END IF;

    IF v_id IS NULL THEN
        v_id := 'd1010101-0000-0000-0000-000000000001'::uuid;
    END IF;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- سياسات delivery_settings
DROP POLICY IF EXISTS "Allow read settings" ON public.delivery_settings;
DROP POLICY IF EXISTS "Allow authenticated read settings" ON public.delivery_settings;
CREATE POLICY "Allow read settings"
ON public.delivery_settings FOR SELECT
TO public
USING (true);

-- سياسات delivery_drivers
DROP POLICY IF EXISTS "Allow view drivers" ON public.delivery_drivers;
DROP POLICY IF EXISTS "Drivers can view drivers list" ON public.delivery_drivers;
CREATE POLICY "Allow view drivers"
ON public.delivery_drivers FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Drivers can update own profile" ON public.delivery_drivers;
DROP POLICY IF EXISTS "Drivers can view and update own profile" ON public.delivery_drivers;
CREATE POLICY "Drivers can update own profile"
ON public.delivery_drivers FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Allow create driver" ON public.delivery_drivers;
CREATE POLICY "Allow create driver"
ON public.delivery_drivers FOR INSERT
TO public
WITH CHECK (true);

-- سياسات delivery_orders
DROP POLICY IF EXISTS "Drivers can view available or assigned orders" ON public.delivery_orders;
CREATE POLICY "Drivers can view available or assigned orders"
ON public.delivery_orders FOR SELECT
TO public
USING (
    status = 'pending_review'
    OR assigned_driver_id = public.get_current_driver_id()
    OR auth.uid() IS NULL
);

DROP POLICY IF EXISTS "Allow create orders" ON public.delivery_orders;
CREATE POLICY "Allow create orders"
ON public.delivery_orders FOR INSERT
TO public
WITH CHECK (true);

-- سياسات delivery_order_items
DROP POLICY IF EXISTS "Drivers can view items of visible orders" ON public.delivery_order_items;
CREATE POLICY "Drivers can view items of visible orders"
ON public.delivery_order_items FOR SELECT
TO public
USING (
    order_id IS NULL OR
    EXISTS (
        SELECT 1 FROM public.delivery_orders o
        WHERE o.id = delivery_order_items.order_id
        AND (
            o.status = 'pending_review' 
            OR o.assigned_driver_id = public.get_current_driver_id()
            OR auth.uid() IS NULL
        )
    )
);

DROP POLICY IF EXISTS "Allow create order items" ON public.delivery_order_items;
CREATE POLICY "Allow create order items"
ON public.delivery_order_items FOR INSERT
TO public
WITH CHECK (true);

-- سياسات delivery_order_status_history
DROP POLICY IF EXISTS "Drivers can view status history of visible orders" ON public.delivery_order_status_history;
CREATE POLICY "Drivers can view status history of visible orders"
ON public.delivery_order_status_history FOR SELECT
TO public
USING (
    order_id IS NULL OR
    EXISTS (
        SELECT 1 FROM public.delivery_orders o
        WHERE o.id = delivery_order_status_history.order_id
        AND (
            o.status = 'pending_review' 
            OR o.assigned_driver_id = public.get_current_driver_id()
            OR auth.uid() IS NULL
        )
    )
);

DROP POLICY IF EXISTS "Allow create status history" ON public.delivery_order_status_history;
CREATE POLICY "Allow create status history"
ON public.delivery_order_status_history FOR INSERT
TO public
WITH CHECK (true);

-- ==============================================================================
-- 5. دوال RPC الآمنة (Security Definer RPCs)
-- ==============================================================================

-- 5.1 قبول الطلب (Accept Order)
CREATE OR REPLACE FUNCTION public.accept_delivery_order(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_driver_id UUID;
    v_current_status delivery_order_status;
    v_is_enabled BOOLEAN;
BEGIN
    -- 1. استخراج معرف السائق
    v_driver_id := public.get_current_driver_id();
    IF v_driver_id IS NULL THEN
        RAISE EXCEPTION 'المستخدم الحالي ليس سائق دليفري مسجل أو غير مفعل';
    END IF;

    -- 2. التحقق من حالة تفعيل الخدمة
    SELECT delivery_enabled INTO v_is_enabled FROM public.delivery_settings LIMIT 1;
    IF v_is_enabled IS FALSE THEN
        RAISE EXCEPTION 'خدمة الدليفري معطلة حالياً من قبل الإدارة';
    END IF;

    -- 3. قفل السجل للتحقق من عدم القبول المزدوج
    SELECT status INTO v_current_status
    FROM public.delivery_orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'الطلب غير موجود';
    END IF;

    -- 4. التحقق من أن الحالة pending_review فقط
    IF v_current_status != 'pending_review' THEN
        RAISE EXCEPTION 'لا يمكن قبول هذا الطلب؛ الحالة الحالية هي: % (يسمح فقط بقبول طلبات pending_review)', v_current_status;
    END IF;

    -- 5. تحديث الطلب
    UPDATE public.delivery_orders
    SET status = 'accepted',
        assigned_driver_id = v_driver_id,
        accepted_at = now(),
        updated_at = now()
    WHERE id = p_order_id;

    -- 6. تسجيل العملية في سجل الحالات
    INSERT INTO public.delivery_order_status_history (
        order_id,
        previous_status,
        new_status,
        changed_by,
        changed_by_role,
        notes
    ) VALUES (
        p_order_id,
        'pending_review',
        'accepted',
        COALESCE(auth.uid(), v_driver_id),
        'delivery_driver',
        'تم قبول الطلب وبدء رحلة التوصيل'
    );

    RETURN jsonb_build_object('success', true, 'message', 'تم قبول الطلب بنجاح', 'order_id', p_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5.2 إتمام التوصيل (Complete Delivery)
CREATE OR REPLACE FUNCTION public.complete_delivery_order(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_driver_id UUID;
    v_order RECORD;
BEGIN
    v_driver_id := public.get_current_driver_id();
    IF v_driver_id IS NULL THEN
        RAISE EXCEPTION 'غير مصرح: حساب سائق غير نشط';
    END IF;

    SELECT id, status, assigned_driver_id INTO v_order
    FROM public.delivery_orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'الطلب غير موجود';
    END IF;

    IF v_order.assigned_driver_id IS NOT NULL AND v_order.assigned_driver_id != v_driver_id THEN
        RAISE EXCEPTION 'لا يمكنك إتمام طلب مسند لسائق آخر';
    END IF;

    IF v_order.status != 'accepted' THEN
        RAISE EXCEPTION 'لا يمكن إتمام الطلب إلا إذا كانت حالته accepted. الحالة الحالية: %', v_order.status;
    END IF;

    UPDATE public.delivery_orders
    SET status = 'completed',
        delivered_at = now(),
        updated_at = now()
    WHERE id = p_order_id;

    INSERT INTO public.delivery_order_status_history (
        order_id,
        previous_status,
        new_status,
        changed_by,
        changed_by_role,
        notes
    ) VALUES (
        p_order_id,
        'accepted',
        'completed',
        COALESCE(auth.uid(), v_driver_id),
        'delivery_driver',
        'تم تسليم الطلب للعميل بنجاح'
    );

    RETURN jsonb_build_object('success', true, 'message', 'تم إتمام التوصيل بنجاح');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5.3 طلب الإلغاء من قبل الدليفري (Request Cancellation)
CREATE OR REPLACE FUNCTION public.request_order_cancellation(p_order_id UUID, p_reason TEXT)
RETURNS JSONB AS $$
DECLARE
    v_driver_id UUID;
    v_order RECORD;
    v_clean_reason TEXT;
BEGIN
    v_driver_id := public.get_current_driver_id();
    IF v_driver_id IS NULL THEN
        RAISE EXCEPTION 'غير مصرح';
    END IF;

    v_clean_reason := trim(p_reason);
    IF v_clean_reason IS NULL OR length(v_clean_reason) = 0 THEN
        RAISE EXCEPTION 'سبب الإلغاء إجباري ولا يمكن إرسال الطلب بدونه';
    END IF;

    SELECT id, status, assigned_driver_id INTO v_order
    FROM public.delivery_orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'الطلب غير موجود';
    END IF;

    IF v_order.assigned_driver_id IS NOT NULL AND v_order.assigned_driver_id != v_driver_id THEN
        RAISE EXCEPTION 'لا يمكنك طلب إلغاء طلب غير مسند إليك';
    END IF;

    IF v_order.status != 'accepted' THEN
        RAISE EXCEPTION 'يمكن فقط طلب الإلغاء للطلبات المقبولة جارية التنفيذ';
    END IF;

    UPDATE public.delivery_orders
    SET status = 'cancellation_pending',
        cancellation_reason = v_clean_reason,
        cancellation_requested_by = v_driver_id,
        cancellation_requested_at = now(),
        updated_at = now()
    WHERE id = p_order_id;

    INSERT INTO public.delivery_order_status_history (
        order_id,
        previous_status,
        new_status,
        changed_by,
        changed_by_role,
        notes
    ) VALUES (
        p_order_id,
        'accepted',
        'cancellation_pending',
        COALESCE(auth.uid(), v_driver_id),
        'delivery_driver',
        'طلب إلغاء من السائق بانتظار قرار الإدارة: ' || v_clean_reason
    );

    RETURN jsonb_build_object('success', true, 'message', 'تم رفع طلب الإلغاء للإدارة للمراجعة');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5.4 معالجة الإلغاء من قبل الإدارة (Admin Resolve Cancellation)
CREATE OR REPLACE FUNCTION public.admin_resolve_cancellation(p_order_id UUID, p_approve BOOLEAN, p_admin_notes TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_new_status delivery_order_status;
BEGIN
    SELECT id, status, cancellation_reason INTO v_order
    FROM public.delivery_orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'الطلب غير موجود';
    END IF;

    IF v_order.status != 'cancellation_pending' THEN
        RAISE EXCEPTION 'الطلب ليس في حالة انتظار قرار الإلغاء';
    END IF;

    IF p_approve THEN
        v_new_status := 'cancelled';
    ELSE
        v_new_status := 'accepted';
    END IF;

    UPDATE public.delivery_orders
    SET status = v_new_status,
        updated_at = now()
    WHERE id = p_order_id;

    INSERT INTO public.delivery_order_status_history (
        order_id,
        previous_status,
        new_status,
        changed_by,
        changed_by_role,
        notes
    ) VALUES (
        p_order_id,
        'cancellation_pending',
        v_new_status,
        COALESCE(auth.uid(), gen_random_uuid()),
        'admin',
        CASE WHEN p_approve 
             THEN 'وافقت الإدارة على إلغاء الطلب: ' || COALESCE(p_admin_notes, '')
             ELSE 'رفضت الإدارة طلب الإلغاء وأعادت الطلب قيد التنفيذ: ' || COALESCE(p_admin_notes, '')
        END
    );

    RETURN jsonb_build_object('success', true, 'new_status', v_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

