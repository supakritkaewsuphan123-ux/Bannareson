import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData.email, formData.password, formData.fullName, formData.phone);
      navigate('/');
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary-100 text-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">สร้างบัญชีใหม่</h1>
          <p className="text-slate-500 mt-2">เข้าร่วมกับเราเพื่อสัมผัสประสบการณ์ที่พักสุดพิเศษ</p>
        </div>

        {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm mb-6 border border-rose-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 px-1">ชื่อ-นามสกุล</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                name="fullName" type="text" required value={formData.fullName} onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary-500 transition-all"
                placeholder="สมชาย ใจดี"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 px-1">เบอร์โทรศัพท์</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                name="phone" type="tel" required value={formData.phone} onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary-500 transition-all"
                placeholder="081-234-5678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 px-1">อีเมล</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                name="email" type="email" required value={formData.email} onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary-500 transition-all"
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 px-1">รหัสผ่าน</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                name="password" type="password" required value={formData.password} onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary-500 transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="btn-secondary w-full py-4 rounded-2xl text-lg shadow-secondary-500/20 mt-4 disabled:opacity-50"
          >
            {loading ? 'เคำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500">
          มีบัญชีอยู่แล้ว? <Link to="/login" className="text-primary-600 font-bold hover:underline">เข้าสู่ระบบที่นี่</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
