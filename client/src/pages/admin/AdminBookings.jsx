import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, User, 
  CheckCircle2, XCircle, Clock,
  Eye, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const AdminBookings = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Fetch Bookings Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBookings();
  }, [token]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> พักแล้ว (ยืนยัน)</span>;
      case 'pending_payment':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1 w-fit"><Clock size={12}/> รอโอนเงิน</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1 w-fit"><XCircle size={12}/> ยกเลิกแล้ว</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-50 text-slate-400 border border-slate-100 flex items-center gap-1 w-fit">{status}</span>;
    }
  };

  const filteredBookings = bookings.filter(b => {
    const guestName = b.profiles?.full_name?.toLowerCase() || '';
    const roomName = b.rooms?.name?.toLowerCase() || '';
    const bookingId = b.id.toString();
    
    const matchesSearch = guestName.includes(searchTerm.toLowerCase()) || 
                          roomName.includes(searchTerm.toLowerCase()) ||
                          bookingId.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">รายการการจองทั้งหมด</h2>
          <p className="text-slate-500 text-sm">ตรวจสอบและติดตามการจองห้องพักของแขก</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text"
               placeholder="ค้นหาชื่อแขก หรือ ชื่อห้อง..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-11 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700 text-sm w-full md:w-64"
             />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700 text-sm appearance-none"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="pending_payment">รอโอนเงิน</option>
            <option value="paid">ชำระแล้ว</option>
            <option value="cancelled">ยกเลิกแล้ว</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold italic uppercase tracking-widest text-xs">กำลังดึงข้อมูลการจอง...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ข้อมูลแขก</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ห้อง & ประเภท</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">วันที่จอง</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">สถานะ</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ยอดเงิน</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{b.profiles?.full_name || 'ไม่ได้ระบุชื่อ'}</p>
                          <p className="text-[10px] text-slate-400 font-medium tracking-tight">{b.profiles?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="font-bold text-slate-700">{b.rooms?.name}</p>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{b.rooms?.type}</p>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2 text-slate-500">
                         <Calendar size={14} className="text-slate-300" />
                         <span className="text-xs font-bold text-slate-600">{format(new Date(b.created_at), 'dd MMM yyyy')}</span>
                       </div>
                       <p className="text-[10px] text-slate-400 font-medium pl-6">{format(new Date(b.created_at), 'HH:mm')}</p>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(b.status)}
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-800 tracking-tight">฿{Number(b.total_price || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all active:scale-90"
                        title="ดูรายละเอียด"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredBookings.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Calendar size={32} />
              </div>
              <p className="text-slate-400 font-bold italic">ไม่พบรายการการจอง</p>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
