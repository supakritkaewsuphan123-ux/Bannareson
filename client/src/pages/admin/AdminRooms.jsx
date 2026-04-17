import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, X, Upload, 
  Image as ImageIcon, Loader2, Save,
  ZoomIn, ZoomOut, Maximize
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const AdminRooms = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resortMap, setResortMap] = useState('');
  const [zoom, setZoom] = useState(1);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Standard',
    price: '',
    description: '',
    image_url: '',
    x_pos: 50,
    y_pos: 50
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setRooms(data.data);
    } catch (error) {
      console.error('Fetch Rooms Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResortMap(data.data.resort_map_url);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (token) {
      fetchRooms();
      fetchSettings();
    }
  }, [token]);

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        type: room.type,
        price: room.price,
        description: room.description || '',
        image_url: room.image_url || '',
        x_pos: room.x_pos || 50,
        y_pos: room.y_pos || 50
      });
    } else {
      setEditingRoom(null);
      setFormData({ name: '', type: 'Standard', price: '', description: '', image_url: '', x_pos: 50, y_pos: 50 });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
    setZoom(1); // Reset zoom
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบห้องนี้?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/rooms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchRooms();
      else alert(data.message);
    } catch (error) {
      alert('การลบผิดพลาด');
    }
  };

  const handleUploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `room-images/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('rooms')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('rooms')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image_url;

      if (selectedFile) {
        finalImageUrl = await handleUploadImage(selectedFile);
      }

      const body = { ...formData, image_url: finalImageUrl };
      const url = editingRoom 
        ? `http://localhost:5000/api/admin/rooms/${editingRoom.id}` 
        : 'http://localhost:5000/api/admin/rooms';
      
      const method = editingRoom ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchRooms();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Submit Error:', error);
      alert('บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">จัดการห้องพัก</h2>
          <p className="text-slate-500 text-sm">สร้างและแก้ไขห้องพักของรีสอร์ท</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} /> เพิ่มห้องพักใหม่
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold italic">กำลังโหลดข้อมูลห้องพัก...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">รูปห้อง</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">ชื่อห้อง</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">ประเภท</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">ราคา</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      {room.image_url ? (
                        <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{room.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                      room.type === 'Suite' ? 'bg-purple-50 text-purple-600' :
                      room.type === 'Deluxe' ? 'bg-blue-50 text-blue-600' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {room.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600 tracking-tight">
                    ฿{Number(room.price).toLocaleString()}
                  </td>
                  <td className="px-8 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenModal(room)}
                      className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(room.id)}
                      className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rooms.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium italic">ไม่พบข้อมูลห้องพัก โปรดเพิ่มห้องพักเพื่อเริ่มใช้งาน</div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-2xl font-black text-slate-800">
                 {editingRoom ? 'แก้ไขข้อมูลห้อง' : 'เพิ่มห้องพักใหม่'}
               </h3>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                  <X size={24} />
               </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">ชื่อห้อง</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="เช่น R01"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">ประเภทห้อง</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 appearance-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">ราคา (บาท)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="1200"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">รูปภาพห้อง</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="flex-grow flex items-center justify-center gap-2 px-5 py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-bold hover:bg-emerald-100 transition-all cursor-pointer"
                    >
                      <Upload size={18} /> {selectedFile ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                  </div>
                  {selectedFile && <p className="text-[10px] text-emerald-500 font-bold truncate">✓ เลือกแล้ว: {selectedFile.name}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">รายละเอียด</label>
                <textarea 
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="ใส่รายละเอียดเกี่ยวกับห้องพัก..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 resize-none"
                />
              </div>

              {/* Coordinate Picker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pl-1">
                   <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">ตำแหน่งบนผังรีสอร์ท (พิกัด: {formData.x_pos}%, {formData.y_pos}%)</label>
                      <span className="text-[10px] text-emerald-500 font-bold italic">คลิกบนรูปเพื่อย้ายจุด</span>
                   </div>
                   
                   {/* Zoom Controls */}
                   <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                      <button 
                        type="button"
                        onClick={() => setZoom(prev => Math.max(1, prev - 0.5))}
                        className="p-2 hover:bg-white rounded-xl transition-all text-slate-500 hover:text-emerald-500 shadow-sm"
                        title="Zoom Out"
                      >
                         <ZoomOut size={16} />
                      </button>
                      <div className="px-2 text-[10px] font-black text-slate-400 border-x border-slate-200">
                         {zoom.toFixed(1)}x
                      </div>
                      <button 
                        type="button"
                        onClick={() => setZoom(prev => Math.min(4, prev + 0.5))}
                        className="p-2 hover:bg-white rounded-xl transition-all text-slate-500 hover:text-emerald-500 shadow-sm"
                        title="Zoom In"
                      >
                         <ZoomIn size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setZoom(1)}
                        className="p-2 hover:bg-white rounded-xl transition-all text-slate-500 hover:text-emerald-500 shadow-sm"
                        title="Reset Zoom"
                      >
                         <Maximize size={16} />
                      </button>
                   </div>
                </div>
                
                {resortMap ? (
                   <div className="rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100">
                      <div className="max-h-[500px] overflow-auto scrollbar-hide bg-slate-200/50">
                        <div 
                          className="relative cursor-crosshair transition-all duration-300"
                          style={{ width: `${zoom * 100}%` }}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
                            const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
                            console.log('New Position:', x, y);
                            setFormData(prev => ({ ...prev, x_pos: parseFloat(x), y_pos: parseFloat(y) }));
                          }}
                        >
                           <img 
                             src={resortMap} 
                             alt="Resort Map" 
                             className="w-full h-auto block shadow-sm" 
                             onDragStart={(e) => e.preventDefault()} 
                           />
                           
                           {/* Corrected Centering Dot */}
                           <div 
                             className="absolute w-6 h-6 -ml-3 -mt-3 bg-emerald-500 text-white rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white transition-all duration-300 pointer-events-none z-20"
                             style={{ left: `${formData.x_pos}%`, top: `${formData.y_pos}%` }}
                           >
                              <span className="text-[6px] font-black leading-none">{formData.name || '?'}</span>
                              <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500 opacity-20 -z-10"></div>
                           </div>
                        </div>
                      </div>
                   </div>
                ) : (
                   <div className="p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                      <p className="text-slate-400 text-xs italic">โปรดตั้งค่า "รูปผังรีสอร์ท" ในหน้าการตั้งค่าก่อนเพื่อกำหนดตำแหน่ง</p>
                   </div>
                )}
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-grow py-5 rounded-[2rem] font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                >
                  ยกเลิก
                </button>
                <button 
                  disabled={isSubmitting}
                  className="flex-[2] bg-slate-900 text-white py-5 rounded-[2rem] font-black hover:bg-emerald-500 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest text-xs"
                >
                  {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> กำลังประมวลผล...</> : <><Save size={18} /> บันทึกข้อมูลห้อง</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;
