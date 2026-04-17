import React, { useState, useEffect } from 'react';
import { 
  User, Shield, ShieldOff, Search, 
  Loader2, Mail, Calendar, UserCheck, 
  UserMinus, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const AdminUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Fetch Users Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const toggleBan = async (userId, currentStatus) => {
    const actionStr = currentStatus ? 'ปลดแบน' : 'แบน';
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการ ${actionStr} ผู้ใช้นี้?`)) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ is_banned: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('ดำเนินการไม่สำเร็จ');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">รายชื่อสมาชิก</h2>
          <p className="text-slate-500 text-sm">ตรวจสอบรายชื่อแขกและสมาชิกของระบบ</p>
        </div>
        
        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text"
             placeholder="ค้นหาชื่อ หรือ อีเมล..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-11 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-700 text-sm w-full md:w-80"
           />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold italic text-xs uppercase tracking-widest">กำลังดึงข้อมูลสมาชิก...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อสมาชิก</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">วันที่เข้าร่วม</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">สถานะ</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">สิทธิ์ (Role)</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-all shadow-lg ${user.is_banned ? 'bg-slate-400 opacity-50' : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-100'}`}>
                          {user.full_name?.charAt(0) || <User size={20} />}
                        </div>
                        <div>
                          <p className={`font-black tracking-tight ${user.is_banned ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {user.full_name || 'ไม่ได้ระบุชื่อ'}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                            <Mail size={10} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2 text-slate-500">
                         <Calendar size={14} className="text-slate-300" />
                         <span className="text-xs font-bold text-slate-600">{format(new Date(user.created_at), 'dd MMM yyyy')}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                      {user.is_banned ? (
                        <span className="bg-rose-50 text-rose-500 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-rose-100 flex items-center gap-1 w-fit">
                           <ShieldOff size={12} /> Banned (ถูกแบน)
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-1 w-fit">
                           <UserCheck size={12} /> Active (ปกติ)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-rose-500' : 'text-slate-400'}`}>
                         {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ลูกค้า'}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => toggleBan(user.id, user.is_banned)}
                          disabled={isProcessing}
                          className={`p-3 rounded-xl transition-all active:scale-95 ${
                            user.is_banned 
                            ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100' 
                            : 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                          }`}
                          title={user.is_banned ? 'ปลดแบนผู้ใช้' : 'แบนผู้ใช้'}
                        >
                          {user.is_banned ? <UserCheck size={20} /> : <UserMinus size={20} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <p className="text-slate-400 font-bold italic">ไม่พบรายชื่อที่ค้นหา</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
