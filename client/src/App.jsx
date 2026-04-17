import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ResortMap from './pages/ResortMap';
import Login from './pages/Login';
import Register from './pages/Register';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import AdminRooms from './pages/admin/AdminRooms';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import { AuthProvider, useAuth } from './context/AuthContext';

// Existing Root Layout component
const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/map", element: <ResortMap /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/payment/:bookingId", element: <Payment /> },
      { path: "/my-bookings", element: <MyBookings /> },
    ]
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { path: "", element: <AdminDashboard /> },
      { path: "rooms", element: <AdminRooms /> },
      { path: "bookings", element: <AdminBookings /> },
      { path: "payments", element: <AdminPayments /> },
      { path: "users", element: <AdminUsers /> },
      { path: "settings", element: <AdminSettings /> },
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
