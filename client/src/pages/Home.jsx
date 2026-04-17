import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MapPin, Star, Wifi, Coffee, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${API_BASE}/rooms`);
        setRooms(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div>
      <section className="relative h-[400px] rounded-[3rem] overflow-hidden mb-16 shadow-2xl">
        <img 
          src="/images/hero_new.jpg" 
          alt="Resort Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex flex-col justify-end p-12 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-secondary-400 mb-4 font-bold tracking-widest uppercase text-sm">
              <MapPin size={16} /> นครนายก, ประเทศไทย
            </div>
            <h1 className="text-5xl font-bold mb-4">บ้านนารีสอท (Baan Na Resort)</h1>
            <p className="text-xl text-slate-200 max-w-2xl mb-8">สัมผัสโอเอซิสแห่งความสุข ท่ามกลางธรรมชาติที่โอบล้อม พร้อมความสะดวกสบายที่ลงตัว</p>
            <button onClick={() => navigate('/map')} className="btn-secondary py-4 px-10 text-lg rounded-2xl w-fit">ดูผังรีสอร์ทและจองห้องพัก</button>
          </motion.div>
        </div>
      </section>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">รายการห้องพัก</h2>
          <p className="text-slate-500">เลือกห้องพักที่เหมาะกับสไตล์ของคุณ</p>
        </div>
        <div className="flex gap-2">
            {[Wifi, Coffee, Wind].map((Icon, i) => (
                <div key={i} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <Icon size={20} />
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {rooms.map((room) => (
          <motion.div 
            key={room.id}
            whileHover={{ y: -10 }}
            className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col"
          >
            <div className="h-64 relative overflow-hidden">
              <img 
                src={room.image_url} 
                alt={room.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg backdrop-blur-md
                ${room.status === 'available' ? 'bg-secondary-500/90 text-white' : ''}
                ${room.status === 'reserved' ? 'bg-amber-500/90 text-white' : ''}
                ${room.status === 'booked' ? 'bg-rose-500/90 text-white' : ''}
              `}>
                {room.status === 'available' ? 'ว่าง' : room.status === 'reserved' ? 'รอชำระเงิน' : 'จองแล้ว'}
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">ห้อง {room.name}</h3>
                  <p className="text-slate-400 text-sm font-medium">{room.type}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={16} fill="currentColor" />
                  <span className="font-bold">4.9</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed">{room.description}</p>
              
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">฿{Number(room.price).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">ต่อคืน (รวมภาษีแล้ว)</p>
                </div>
                <button 
                  onClick={() => navigate('/map')}
                  disabled={room.status !== 'available'}
                  className={`px-6 py-3 rounded-xl font-bold transition-all
                    ${room.status === 'available' ? 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                  `}
                >
                  {room.status === 'available' ? 'จองห้องนี้' : 'ไม่ว่าง'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
