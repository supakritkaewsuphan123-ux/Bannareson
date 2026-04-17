import React from 'react';
  import { NavLink, Outlet, useNavigate } from 'react-router-dom';
  import { motion } from 'framer-motion';
  import { 
    LayoutDashboard, BedDouble, CalendarCheck, 
    Wallet, Users, Settings, LogOut, Home, Menu, X
  } from 'lucide-react';
  import { useAuth } from '../context/AuthContext';
  
  const AdminLayout = () => {
    const { profile, signOut } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const navigate = useNavigate();
  
    const menuItems = [
      { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/admin/rooms', icon: BedDouble, label: 'Manage Rooms' },
      { path: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
      { path: '/admin/payments', icon: Wallet, label: 'Payments/Slips' },
      { path: '/admin/users', icon: Users, label: 'User History' },
      { path: '/admin/settings', icon: Settings, label: 'Resort Settings' },
    ];
  
    const handleLogout = async () => {
      await signOut();
      navigate('/');
    };
  
    return (
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="bg-slate-900 text-white flex-shrink-0 relative transition-all hidden md:flex flex-col overflow-hidden"
        >
          {/* Logo Section */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Home className="text-white" size={24} />
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl tracking-tight"
              >
                Baan Na <span className="text-emerald-400">Admin</span>
              </motion.span>
            )}
          </div>
  
          {/* Menu Items */}
          <nav className="flex-grow p-4 space-y-2 mt-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
                  ${isActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={22} className="flex-shrink-0" />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </NavLink>
            ))}
          </nav>
  
          {/* User Profile / Logout */}
          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
            >
              <LogOut size={22} className="flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium">ออกจากระบบ</span>}
            </button>
          </div>
        </motion.aside>
  
        {/* Main Content */}
        <main className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Top Header */}
          <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                 className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
               >
                 <Menu size={24} />
               </button>
               <h1 className="text-xl font-bold text-slate-800">ระบบจัดการหลังบ้าน (Admin Panel)</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{profile?.full_name || 'Admin User'}</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">เจ้าของรีสอร์ท</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-500">
                {profile?.full_name?.charAt(0) || 'A'}
              </div>
            </div>
          </header>
  
          {/* Page Content */}
          <div className="flex-grow overflow-y-auto p-8 bg-slate-50 scrollbar-hide">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    );
  };
  
  export default AdminLayout;
