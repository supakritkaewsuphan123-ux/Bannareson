-- 1. เพิ่มพิกัดตำแหน่งห้องพัก (สำหรับระบบผังอัจฉริยะ)
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS x_pos DECIMAL(5,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS y_pos DECIMAL(5,2) DEFAULT 50.00;

-- 2. เพิ่มช่องเก็บลิงก์รูปผังรีสอร์ทในตารางตั้งค่า
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS resort_map_url TEXT;

-- 3. ตั้งค่ารูปแผนผังตัวอย่าง (Optional)
UPDATE public.settings 
SET resort_map_url = '/images/resort-map.png'
WHERE id = 1;

-- 4. เพิ่มสถานะ "รอการตรวจสอบ" (Awaiting Verification) ให้กับการจอง
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('pending_payment', 'awaiting_verification', 'paid', 'cancelled'));

-- 5. สร้างตารางการตั้งค่าและบันทึกแอดมิน (หากยังไม่มี)
CREATE TABLE IF NOT EXISTS public.settings (
    id SERIAL PRIMARY KEY,
    bank_name TEXT,
    account_number TEXT,
    account_name TEXT,
    qr_code_url TEXT,
    resort_map_url TEXT,
    booking_expiry_mins INTEGER DEFAULT 30,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ใส่ข้อมูลตั้งค่าเริ่มต้น (หากยังไม่มี)
INSERT INTO public.settings (id, bank_name, account_number, account_name, qr_code_url, resort_map_url, booking_expiry_mins)
VALUES (1, 'Kasikorn Bank (KBank)', '123-456-7890', 'Baan Na Resort Co., Ltd.', 'https://example.com/qr-code.png', '/images/resort-map.png', 30)
ON CONFLICT (id) DO NOTHING;

-- 7. เปิดใช้งาน RLS สำหรับตารางใหม่
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage logs" ON public.admin_logs;
CREATE POLICY "Admins can manage logs" ON public.admin_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
