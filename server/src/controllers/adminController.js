const supabase = require('../config/supabase');

/**
 * Get all bookings with payment info for admin
 */
const getAdminBookings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles (full_name, phone, email),
        rooms (name, price),
        payments (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Approve booking
 */
const approveBooking = async (req, res) => {
  const { booking_id } = req.body;
  try {
    // 1. Update Booking status to paid
    await supabase.from('bookings').update({ status: 'paid' }).eq('id', booking_id);
    
    // 2. Update Payment status to approved
    await supabase.from('payments').update({ status: 'approved' }).eq('id', booking_id); // Assuming 1:1 for simplicity or link via table

    // Note: Better to fetch payment_id from booking_id
    const { data: payment } = await supabase.from('payments').select('id').eq('booking_id', booking_id).single();
    if (payment) {
       await supabase.from('payments').update({ status: 'approved' }).eq('id', payment.id);
    }

    res.json({ message: 'Booking approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reject booking
 */
const rejectBooking = async (req, res) => {
  const { booking_id } = req.body;
  try {
    // 1. Update Booking status to cancelled
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking_id);
    
    // 2. Update Payment status to rejected
    const { data: payment } = await supabase.from('payments').select('id').eq('booking_id', booking_id).single();
    if (payment) {
       await supabase.from('payments').update({ status: 'rejected' }).eq('id', payment.id);
    }

    res.json({ message: 'Booking rejected and room released' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Dashboard Stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Total income from 'paid' bookings
    const { data: paidBookings } = await supabase
      .from('bookings')
      .select('rooms(price)')
      .eq('status', 'paid');
    
    const totalIncome = paidBookings?.reduce((sum, b) => sum + Number(b.rooms.price), 0) || 0;

    // Total active reservations
    const { count: activeBookings } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending_payment', 'paid']);

    // Pending slips
    const { count: pendingSlips } = await supabase
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    res.json({
      totalIncome,
      activeBookings,
      pendingSlips
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAdminBookings, approveBooking, rejectBooking, getDashboardStats };
