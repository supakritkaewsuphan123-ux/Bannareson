import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import axios from 'axios';
import { 
  Clock, CreditCard, Upload, CheckCircle2, 
  AlertCircle, Landmark, ExternalLink, X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bankInfo, setBankInfo] = useState(null);

  // Navigation Blocker
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !success && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (!success) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [success]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const config = { headers: { Authorization: `Bearer ${session.access_token}` } };
        
        const [bookingRes, bankRes] = await Promise.all([
          axios.get(`${API_BASE}/bookings/${bookingId}`, config),
          axios.get(`${API_BASE}/bookings/payment-info`, config)
        ]);

        setBooking(bookingRes.data);
        setBankInfo(bankRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [bookingId]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const handleConfirmPayment = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const fileName = `${Date.now()}_${bookingId}.jpg`;
      const { error: storageError, data: storageData } = await supabase.storage
        .from('slips')
        .upload(fileName, file);

      if (storageError) {
        console.error('Storage Error:', storageError);
        throw new Error(`Storage Error: ${storageError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage.from('slips').getPublicUrl(fileName);

      const response = await axios.post(`${API_BASE}/bookings/upload-slip`, {
        booking_id: bookingId,
        slip_url: publicUrl,
        amount: booking.rooms.price
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      setSuccess(true);
      setShowModal(true);
      // Automatically redirect after 5 seconds if they don't click
      setTimeout(() => {
        navigate('/my-bookings');
      }, 5000);

    } catch (err) {
      alert(`ข้อผิดพลาด: ${err.message || 'Unknown Error'}`);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (!booking || !bankInfo) return <div className="h-96 flex items-center justify-center font-bold text-slate-400">กำลังโหลด...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 mt-10 px-4">
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-800 p-8 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-3">
             <CreditCard /> ชำระเงินเพื่อยืนยันการจอง
          </h2>
          <p className="opacity-70 text-sm mt-1">กรุณาโอนเงินและอัปโหลดหลักฐานภายใน 30 นาที</p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* ข้อมูลธนาคาร */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Landmark className="text-primary-600" size={20} /> ข้อมูลการโอนเงิน
            </h3>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">ธนาคาร</p>
                <p className="text-xl font-bold text-slate-800">{bankInfo.bank_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">เลขที่บัญชี</p>
                <p className="text-3xl font-black text-primary-600 tracking-wider">{bankInfo.account_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">ชื่อบัญชี</p>
                <p className="text-lg font-bold text-slate-700">{bankInfo.account_name}</p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">ยอดเงินที่ต้องโอน</p>
                <p className="text-3xl font-black text-slate-800">฿{Number(booking.rooms.price).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="p-4 bg-white border-2 border-slate-100 rounded-3xl shadow-sm">
                <img src={bankInfo.qr_code_url} alt="QR Code" className="w-40 h-40 object-contain" />
                <p className="text-center text-[10px] font-bold text-slate-400 mt-2">สแกนเพื่อจ่าย (PromtPay)</p>
              </div>
            </div>
          </div>

          {/* ช่องอัปโหลดสลิป */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Upload className="text-secondary-600" size={20} /> แจ้งหลักฐานการโอนเงิน
            </h3>

            <div className="space-y-6">
              {!preview ? (
                <label className="border-2 border-dashed border-slate-200 rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all group">
                  <div className="bg-slate-100 p-4 rounded-full group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                    <Upload size={32} className="text-slate-400" />
                  </div>
                  <p className="mt-4 font-bold text-slate-500">คลิกเพื่ออัปโหลดไฟล์สลิป</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG ไม่เกิน 5MB</p>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-3xl overflow-hidden border-4 border-slate-100 shadow-lg bg-slate-100">
                    <img src={preview} alt="Slip" className="w-full h-auto max-h-[300px] object-contain" />
                    <button 
                      onClick={() => {setFile(null); setPreview(null);}}
                      className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-full shadow-lg hover:scale-110"
                    >
                      <AlertCircle size={20} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleConfirmPayment}
                    disabled={uploading}
                    className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all
                      ${uploading ? 'bg-slate-200 text-slate-400' : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-98 shadow-primary-200'}
                    `}
                  >
                    {uploading ? 'กำลังทำงาน...' : 'ยืนยันแจ้งโอนเงิน'}
                  </button>
                </div>
              )}

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 text-amber-700">
                <Clock className="flex-shrink-0" size={20} />
                <p className="text-xs leading-relaxed">
                   กรุณาอัปโหลดสลิปที่มียอดเงินตรงกับยอดจอง ระบบจะใช้เวลาตรวจสอบครู่เดียวเท่านั้น
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal (เด้งขึ้นมาสวยๆ) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="bg-white rounded-[2.5rem] p-10 text-center shadow-2xl max-w-sm w-full relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
              
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={56} />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-800 mb-2">ส่งสลิปสำเร็จ!</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                 แอดมินได้รับข้อมูลการโอนเงินของคุณแล้ว<br/>กำลังดำเนินการตรวจสอบครับ
              </p>

              <button 
                onClick={() => navigate('/my-bookings')}
                className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all shadow-xl shadow-slate-200"
              >
                ไปหน้าการจองของฉัน <ExternalLink size={18} />
              </button>
              
              <p className="text-[10px] text-slate-300 mt-6 uppercase tracking-widest font-bold">
                 Redirecting in 5 seconds...
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leave Warning Modal */}
      <AnimatePresence>
        {blocker.state === 'blocked' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-10 text-center shadow-2xl max-w-sm w-full"
            >
              <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={48} />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-4">ยืนยันการออกจากหน้านี้?</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                 หากคุณออกจากหน้านี้โดยที่ยังไม่แจ้งโอนเงิน <span className="font-bold text-rose-500">การจองของคุณจะถูกยกเลิกทันที</span>
              </p>

              <div className="space-y-3">
                <button 
                  disabled={uploading}
                  onClick={async (e) => {
                    const btn = e.currentTarget;
                    btn.disabled = true;
                    btn.innerText = 'กำลังยกเลิก...';
                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      await axios.delete(`${API_BASE}/bookings/${bookingId}`, {
                        headers: { Authorization: `Bearer ${session.access_token}` }
                      });
                    } catch (err) {
                      console.error('Cancel error:', err);
                    }
                    blocker.proceed();
                  }}
                  className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-50"
                >
                  ยืนยันการยกเลิกและออกไป
                </button>
                <button 
                  onClick={() => blocker.reset()}
                  className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  อยู่หน้านี้ต่อเพื่อชำระเงิน
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payment;
