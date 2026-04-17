import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, BedDouble, Wallet, 
  Calendar, ArrowUpRight, ArrowDownRight, RefreshCcw 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const settings = { headers: { Authorization: `Bearer ${token}` } };
      
      const statsRes = await fetch('http://localhost:5000/api/admin/dashboard', settings);
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.data);

      const bookingsRes = await fetch('http://localhost:5000/api/admin/bookings', settings);
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success) setRecentBookings(bookingsData.data.slice(0, 5));
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const cards = [
    { 
      label: 'รายได้รวมทั้งหมด', 
      value: `฿${stats?.total_revenue?.toLocaleString() || '0'}`, 
      icon: Wallet, 
      color: 'bg-emerald-500', 
      trend: `฿${stats?.revenue_today?.toLocaleString()} วันนี้`,
      isUp: true 
    },
    { 
      label: 'รายการจองทั้งหมด', 
      value: stats?.total_bookings || '0', 
      icon: Calendar, 
      color: 'bg-blue-500', 
      trend: `${stats?.pending_payment} รอชำระเงิน`,
      isUp: false 
    },
    { 
      label: 'ห้องที่เข้าพักแล้ว', 
      value: stats?.paid_bookings || '0', 
      icon: BedDouble, 
      color: 'bg-amber-500', 
      trend: 'ชำระเงินแล้ว',
      isUp: true 
    },
    { 
      label: 'สมาชิกทั้งหมด', 
      value: '24', // Mock for now
      icon: Users, 
      color: 'bg-purple-500', 
      trend: '+2 สัปดาห์นี้',
      isUp: true 
    },
  ];

  const chartData = [
    { name: 'รายได้วันนี้', value: stats?.revenue_today || 0 },
    { name: 'รายได้เดือนนี้', value: stats?.revenue_month || 0 },
    { name: 'รายได้รวม', value: stats?.total_revenue || 0 },
  ];

  if (loading && !stats) return <div className="text-slate-400 font-bold italic animate-pulse">กำลังอัปเดตข้อมูล Dashboard...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">ภาพรวมระบบ (Overview)</h2>
          <p className="text-slate-500 mt-1">สถิติเรียลไทม์และประสิทธิภาพของรีสอร์ท</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          รีเฟรชข้อมูล
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                <card.icon size={24} />
              </div>
              {card.isUp ? (
                <span className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                  <ArrowUpRight size={14} className="mr-1" /> ACTIVE
                </span>
              ) : (
                <span className="flex items-center text-amber-500 text-xs font-bold bg-amber-50 px-2 py-1 rounded-full">
                  <TrendingUp size={14} className="mr-1" /> TREND
                </span>
              )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{card.label}</h3>
            <p className="text-3xl font-black text-slate-800 my-1">{card.value}</p>
            <p className="text-xs text-slate-400 font-medium">{card.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={20} />
            วิเคราะห์รายได้ (Revenue Analysis)
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={index === 0 ? '#10b981' : (index === 1 ? '#3b82f6' : '#8b5cf6')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">รายการจองล่าสุด</h3>
          <div className="space-y-6">
            {recentBookings.length > 0 ? recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                  {booking.profiles?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{booking.profiles?.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">ห้อง: {booking.rooms?.name}</p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  booking.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
                  booking.status === 'pending_payment' ? 'bg-amber-50 text-amber-600' : 
                  'bg-slate-50 text-slate-400'
                }`}>
                  {booking.status === 'paid' ? 'พักแล้ว' : booking.status === 'pending_payment' ? 'รอโอนเงิน' : 'ยกเลิก'}
                </div>
              </div>
            )) : (
              <p className="text-slate-400 italic text-sm text-center py-10">ไม่พบรายการจองล่าสุด</p>
            )}
          </div>
          <button 
            onClick={() => navigate('/admin/bookings')}
            className="w-full mt-8 py-3 rounded-xl border-2 border-slate-50 text-sm font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all font-sans"
          >
            ดูรายงานทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
