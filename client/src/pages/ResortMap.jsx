import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Info, CheckCircle2, Clock, Ban, Map as MapIcon, ZoomIn } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const ResortMap = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [settings, setSettings] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rooms`);
      setRooms(res.data);
    } catch (err) {
      console.error('Fetch rooms error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/resort-info`);
      setSettings(res.data);
    } catch (err) {
      console.error('Fetch settings error:', err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchSettings();
    const interval = setInterval(fetchRooms, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const bookRoom = async (roomId) => {
    if (!user) { navigate('/login'); return; }
    
    try {
      const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession());
      const res = await axios.post(`${API_BASE}/bookings/book`, { room_id: roomId }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      
      navigate(`/payment/${res.data.booking_id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
       <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
       <p className="font-bold italic">กำลังโหลดแผนผังอัจฉริยะ...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full mb-4">
           <MapIcon size={18} />
           <span className="text-sm font-black uppercase tracking-widest">Interactive Map Upgrade</span>
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-2">แผนผังรีสอร์ท (Resort Map)</h1>
        <p className="text-slate-500 font-medium">จิ้มเลือกห้องที่คุณต้องการจองบนแผนที่ได้ทันที</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
          <span className="text-sm font-bold text-slate-600">ว่าง (Available)</span>
        </div>
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-50"></div>
          <span className="text-sm font-bold text-slate-600">รอตรวจสอบ (Reserved)</span>
        </div>
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="w-4 h-4 rounded-full bg-rose-500 ring-4 ring-rose-50"></div>
          <span className="text-sm font-bold text-slate-600">จองแล้ว (Booked)</span>
        </div>
      </div>

      {/* Main Interactive Map */}
      <div className="relative group">
         <div className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl shadow-xl z-10 border border-slate-100 text-slate-400">
            <ZoomIn size={20} />
         </div>
         
         <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl border-4 border-white overflow-hidden relative">
            {settings?.resort_map_url ? (
               <div className="relative">
                  <img 
                    src={settings.resort_map_url} 
                    alt="Resort Layout Map" 
                    className="w-full h-auto rounded-[2.5rem]"
                  />
                  
                  {/* Room Markers Overlay */}
                  {rooms.map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.1, zIndex: 50 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (room.status === 'available') {
                          setSelectedRoom(room);
                        }
                      }}
                      className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-xl border-2 border-white transition-all
                        ${room.status === 'available' ? 'bg-emerald-500 text-white shadow-emerald-200' : ''}
                        ${room.status === 'reserved' ? 'bg-amber-500 text-white cursor-not-allowed opacity-90' : ''}
                        ${room.status === 'booked' ? 'bg-rose-500 text-white cursor-not-allowed opacity-80' : ''}
                      `}
                      style={{ left: `${room.x_pos || 50}%`, top: `${room.y_pos || 50}%` }}
                    >
                       <span className="text-[10px] font-black leading-none">{room.name}</span>
                       <span className="text-[8px] font-bold opacity-75 mt-0.5">
                         {room.status === 'available' ? 'ว่าง' : (room.status === 'reserved' ? 'รอ' : 'พัก')}
                       </span>
                       
                       {/* Decorative pulsing effect */}
                       {room.status === 'available' && (
                         <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500 opacity-20 -z-10 pointer-events-none"></div>
                       )}
                    </motion.div>
                  ))}
               </div>
            ) : (
               <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 text-slate-300 rounded-[2.5rem] p-10 text-center">
                  <MapIcon size={64} className="mb-4 opacity-20" />
                  <p className="max-w-xs font-medium italic">ยังไม่ได้ตั้งค่ารูปผังรีสอร์ท โปรดตั้งค่าในระบบหลังบ้านก่อนเพื่อเริ่มใช้งานระบบแผนที่อัจฉริยะ</p>
               </div>
            )}
         </div>
      </div>

      {/* Room Details Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="h-64 relative group">
                <img src={selectedRoom.image_url} alt={selectedRoom.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <button 
                  onClick={() => setSelectedRoom(null)}
                  className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/20 hover:bg-white text-slate-800 flex items-center justify-center backdrop-blur-md transition-all shadow-xl"
                >✕</button>
                <div className="absolute bottom-6 left-6 px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">
                   Room {selectedRoom.name}
                </div>
              </div>
              <div className="p-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800">จองห้อง {selectedRoom.name}</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{selectedRoom.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-500 font-black text-2xl tracking-tighter">฿{Number(selectedRoom.price).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ราคาต่อคืน</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                   <p className="text-slate-600 text-sm leading-relaxed italic">"{selectedRoom.description}"</p>
                </div>
                <button 
                  onClick={() => bookRoom(selectedRoom.id)}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-lg font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl shadow-slate-100 transform active:scale-95"
                >
                   ยืนยันรายการจอง
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResortMap;
