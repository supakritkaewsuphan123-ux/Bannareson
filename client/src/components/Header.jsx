import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Palmtree, User, LogOut, LayoutDashboard, Map as MapIcon, CalendarDays } from 'lucide-react';

const Header = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="glass sticky top-0 z-50 w-full mb-6">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary-700 font-bold text-xl">
          <Palmtree className="text-secondary-600" />
          <span>Baan Na Resort</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-slate-600 hover:text-primary-600 font-medium">ห้องพัก</Link>
          <Link to="/map" className="text-slate-600 hover:text-primary-600 font-medium flex items-center gap-1">
            <MapIcon size={18} /> ผังรีสอร์ท
          </Link>
          {user && (
            <Link to="/my-bookings" className="text-slate-600 hover:text-primary-600 font-medium flex items-center gap-1">
              <CalendarDays size={18} /> รายการจองของฉัน
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {profile?.role === 'admin' && (
                <Link to="/admin" className="text-secondary-600 hover:text-secondary-700 font-medium flex items-center gap-1">
                  <LayoutDashboard size={18} /> Admin
                </Link>
              )}
              <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-slate-200">
                <User size={16} className="text-slate-500" />
                <span className="text-sm font-medium text-slate-700">{profile?.full_name || 'User'}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-500 hover:text-rose-500 transition-colors"
                title="Log Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-slate-600 hover:text-primary-600 font-medium px-4">เข้าสู่ระบบ</Link>
              <Link to="/register" className="btn-primary py-2 px-5">สมัครสมาชิก</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
