import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, CreditCard, ChevronRight, PackageCheck } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const API_BASE = 'http://localhost:5000/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await axios.get(`${API_BASE}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center">กำลังโหลดรายการจอง...</div>;

  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">ประวัติการจองของฉัน</h1>
        <p className="text-slate-500">ติดตามสถานะการจองห้องพักของคุณ</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-slate-100">
           <PackageCheck size={64} className="mx-auto text-slate-200 mb-4" />
           <p className="text-xl font-medium text-slate-400">ยังไม่มีรายการจองในขณะนี้</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row"
            >
              <div className="md:w-48 h-48 md:h-auto overflow-hidden">
                <img src={booking.rooms.image_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-slate-800">ห้อง {booking.rooms.name}</h3>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                      ${booking.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : ''}
                      ${booking.status === 'pending_payment' ? 'bg-amber-100 text-amber-600' : ''}
                      ${booking.status === 'cancelled' ? 'bg-rose-100 text-rose-500' : ''}
                    `}>
                      {booking.status === 'paid' ? 'สำเร็จ' : booking.status === 'pending_payment' ? 'รอตรวจสอบ' : 'ยกเลิกแล้ว'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-sm">
                    <div className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(booking.created_at), 'd MMM yyyy', { locale: th })}</div>
                    <div className="flex items-center gap-1"><CreditCard size={14} /> ฿{Number(booking.rooms.price).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                   <p className="text-sm text-slate-400">
                     หมายเลขการจอง: <span className="font-mono text-xs">{booking.id.slice(0, 8)}</span>
                   </p>
                   {booking.status === 'pending_payment' && !booking.payments?.[0] && (
                     <a href={`/payment/${booking.id}`} className="flex items-center gap-1 text-primary-600 font-bold text-sm hover:underline">
                       ไปหน้าชำระเงิน <ChevronRight size={16} />
                     </a>
                   )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
