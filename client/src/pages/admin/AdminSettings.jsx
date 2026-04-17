import React, { useState, useEffect } from 'react';
import { 
  Save, Landmark, CreditCard, Clock, 
  Loader2, QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const AdminSettings = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    bank_name: '',
    account_number: '',
    account_name: '',
    qr_code_url: '',
    resort_map_url: '',
    booking_expiry_mins: 30
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Fetch Settings Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSettings();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('บันทึกการตั้งค่าสำเร็จ!');
        if (data.data) setSettings(data.data); // Update with fresh data from server
      } else {
        alert(data.message || 'บันทึกการตั้งค่าไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Save Settings Error:', error);
      alert(`บันทึกการตั้งค่าล้มเหลว: ${error.message}\n(โปรดตรวจสอบว่าเปิด Server แล้วหรือยัง)`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
        <Loader2 className="animate-spin" size={40} />
        <p className="font-bold italic text-xs uppercase tracking-widest">กำลังดึงข้อมูลการตั้งค่า...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">ตั้งค่าระบบ (Settings)</h2>
        <p className="text-slate-500 text-sm">จัดการข้อมูลธนาคารและกฎการจองส่วนกลาง</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bank & Payment Information */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <Landmark size={20} />
             </div>
             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">ข้อมูลบัญชีธนาคาร</h3>
          </div>
          
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ชื่อธนาคาร</label>
                <div className="relative">
                   <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                     type="text"
                     value={settings.bank_name}
                     onChange={(e) => setSettings({...settings, bank_name: e.target.value})}
                     placeholder="เช่น กสิกรไทย, ไทยพาณิชย์"
                     className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700 font-sans"
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">เลขที่บัญชี</label>
                <input 
                  type="text"
                  value={settings.account_number}
                  onChange={(e) => setSettings({...settings, account_number: e.target.value})}
                  placeholder="000-0-00000-0"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ชื่อเจ้าของบัญชี</label>
                <input 
                  type="text"
                  value={settings.account_name}
                  onChange={(e) => setSettings({...settings, account_name: e.target.value})}
                  placeholder="เช่น บจก. บ้านนารีสอร์ท"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ลิงก์รูป QR Code (PromtPay)</label>
                <div className="relative">
                   <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                     type="text"
                     value={settings.qr_code_url}
                     onChange={(e) => setSettings({...settings, qr_code_url: e.target.value})}
                     placeholder="https://..."
                     className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700 font-mono text-sm"
                   />
                </div>
             </div>

             <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ลิงก์รูปผังรีสอร์ท (Resort Map Image URL)</label>
                <div className="relative">
                   <input 
                     type="text"
                     value={settings.resort_map_url}
                     onChange={(e) => setSettings({...settings, resort_map_url: e.target.value})}
                     placeholder="https://... (แนะนำรูปที่มีสัดส่วน แนวนอน)"
                     className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700 text-sm"
                   />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 pl-1">รูปที่จะแสดงในหน้า "ผังรีสอร์ท" เพื่อให้ลูกค้ากดจอง</p>
             </div>
          </div>
        </div>

        {/* Booking Configuration */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Clock size={20} />
             </div>
             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">กฎการจอง</h3>
          </div>
          
          <div className="p-10">
             <div className="max-w-xs space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">เวลาจำกัดการโอนเงิน (นาที)</label>
                <div className="flex items-center gap-4">
                   <input 
                     type="number"
                     value={settings.booking_expiry_mins}
                     onChange={(e) => setSettings({...settings, booking_expiry_mins: parseInt(e.target.value)})}
                     className="w-32 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold text-slate-700"
                   />
                   <span className="text-slate-400 font-bold italic text-sm">นาที</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">หากลูกค้าไม่แจ้งโอนสลิปภายในเวลานี้ ห้องจะถูกปลดล็อกให้คนอื่นจองได้โดยอัตโนมัติ</p>
             </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4">
           <button 
             type="button"
             onClick={fetchSettings}
             className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
           >
              ยกเลิกการเปลี่ยนแปลง
           </button>
           <button 
             disabled={isSaving}
             className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 disabled:opacity-50"
           >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              บันทึกการตั้งค่าทั้งหมด
           </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
