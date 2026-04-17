import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Eye, 
  Loader2, ExternalLink, AlertTriangle, X,
  ShieldCheck, FileText, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const AdminPayments = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error('Fetch Payments Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPayments();
  }, [token]);

  const handleApprove = async (bookingId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการ "อนุมัติ" การชำระเงินนี้?')) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/admin/payments/${bookingId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPayment(null);
        fetchPayments();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('การอนุมัติล้มเหลว');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async (bookingId) => {
    if (!rejectReason) {
      setShowRejectInput(true);
      return;
    }
    
    setIsVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/admin/payments/${bookingId}/reject`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPayment(null);
        setRejectReason('');
        setShowRejectInput(false);
        fetchPayments();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('การปฏิเสธล้มเหลว');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">รายการชำระเงิน & สลิป</h2>
          <p className="text-slate-500 text-sm">ตรวจสอบสลิปการโอนเงินและอนุมัติรายการ</p>
        </div>
        <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 flex items-center gap-2">
           <Clock className="text-amber-500" size={18} />
           <span className="text-amber-700 font-bold text-sm">รอตรวจสอบ {payments.length} รายการ</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold italic text-xs uppercase tracking-widest">กำลังดึงข้อมูลสลิป...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map((p) => (
            <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
               <div className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setSelectedPayment(p)}>
                  <img src={p.slip_url} alt="Slip" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                     <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                        <Eye size={24} />
                     </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase text-amber-600 shadow-sm">
                    รอตรวจสอบ
                  </div>
               </div>
               
               <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <User size={20} />
                     </div>
                     <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 truncate">{p.bookings?.profiles?.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{p.bookings?.profiles?.email}</p>
                     </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ยอดเงิน</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ห้อง</span>
                     </div>
                     <div className="flex justify-between items-end">
                        <span className="text-xl font-black text-emerald-600">฿{Number(p.amount).toLocaleString()}</span>
                        <span className="font-bold text-slate-700">{p.bookings?.rooms?.name}</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => setSelectedPayment(p)}
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-slate-100"
                  >
                    ตรวจสอบสลิป
                  </button>
               </div>
            </div>
          ))}
          
          {payments.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={40} />
              </div>
              <p className="text-slate-400 font-bold italic">เรียบร้อย! ไม่มีสลิปที่รอรับการตรวจสอบ</p>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">จัดการได้เยี่ยมยอด</p>
            </div>
          )}
        </div>
      )}

      {/* Verification Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isVerifying && setSelectedPayment(null)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-300">
             {/* Slip Preview */}
             <div className="md:w-1/2 bg-slate-100 relative group">
                <img src={selectedPayment.slip_url} alt="Slip Full" className="w-full h-full object-contain" />
                <a 
                  href={selectedPayment.slip_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl text-slate-800 shadow-xl border border-slate-100 hover:scale-110 transition-all flex items-center gap-2 font-bold text-sm"
                >
                  <ExternalLink size={18} /> ดูรูปต้นฉบับ
                </a>
             </div>

             {/* Verification Controls */}
             <div className="md:w-1/2 p-10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-8">
                     <div>
                        <h3 className="text-2xl font-black text-slate-800">ตรวจสอบสลิป</h3>
                        <p className="text-slate-400 text-sm font-medium">ยืนยันความถูกต้องของข้อมูลการโอนเงิน</p>
                     </div>
                     <button onClick={() => setSelectedPayment(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-300 transition-colors">
                        <X size={24} />
                     </button>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                           <User size={24} />
                        </div>
                        <div>
                           <p className="font-black text-slate-800">{selectedPayment.bookings?.profiles?.full_name}</p>
                           <p className="text-xs text-slate-400 font-medium">{selectedPayment.bookings?.profiles?.email}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/50">
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">ยอดเงินที่โอน</p>
                           <p className="text-2xl font-black text-emerald-600">฿{Number(selectedPayment.amount).toLocaleString()}</p>
                        </div>
                        <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50">
                           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">ห้องที่เลือก</p>
                           <p className="text-xl font-black text-indigo-600">{selectedPayment.bookings?.rooms?.name}</p>
                        </div>
                     </div>

                     <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                           <FileText size={16} className="text-slate-400" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">รหัสการจอง (Internal ID)</span>
                        </div>
                        <p className="text-xs font-mono font-bold text-slate-500">{selectedPayment.booking_id}</p>
                     </div>
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                   {showRejectInput ? (
                      <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-300">
                         <div className="relative">
                            <AlertTriangle className="absolute left-4 top-4 text-rose-500" size={18} />
                            <textarea 
                              placeholder="เหตุผลที่ไม่ผ่าน (เช่น ยอดเงินไม่ครบ, สลิปซ้ำ)..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="w-full pl-12 pr-6 py-4 bg-rose-50 border border-rose-100 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-rose-700 text-sm placeholder:text-rose-300 resize-none"
                              rows={2}
                            />
                         </div>
                         <div className="flex gap-2">
                            <button 
                              onClick={() => setShowRejectInput(false)}
                              className="flex-grow py-4 rounded-2xl font-black text-xs uppercase text-slate-400 hover:bg-slate-50 transition-all"
                            >
                               ยกเลิก
                            </button>
                            <button 
                              onClick={() => handleReject(selectedPayment.booking_id)}
                              disabled={isVerifying || !rejectReason}
                              className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all disabled:opacity-50"
                            >
                               ยืนยันการปฏิเสธ
                            </button>
                         </div>
                      </div>
                   ) : (
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setShowRejectInput(true)}
                          disabled={isVerifying}
                          className="flex-grow py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest text-rose-500 border-2 border-rose-100 hover:bg-rose-50 transition-all disabled:opacity-50"
                        >
                           ปฏิเสธ (Reject)
                        </button>
                        <button 
                          onClick={() => handleApprove(selectedPayment.booking_id)}
                          disabled={isVerifying}
                          className="flex-[2] bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                           {isVerifying ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={18} /> อนุมัติ & ยืนยัน</>}
                        </button>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
