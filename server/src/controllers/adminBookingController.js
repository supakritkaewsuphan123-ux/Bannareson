const supabase = require('../config/supabase');
const adminService = require('../services/adminService');

/**
 * GET /api/admin/bookings
 */
/**
 * GET /api/admin/payments
 * Fetch bookings that have a pending payment (slip uploaded)
 */
const getAllPayments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        bookings (
          *,
          profiles (full_name, email),
          rooms (name)
        )
      `)
      .eq('status', 'pending')
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles (full_name, email),
        rooms (name, type),
        payments (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/admin/bookings/:id/cancel
 */
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;

    await adminService.logAction(req.user.id, 'cancel_booking', id, { reason: 'Admin forced cancel' });

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/admin/payments/:id/approve
 */
const approvePayment = async (req, res) => {
  const { id } = req.params; // booking_id
  try {
    await adminService.approvePayment(req.user.id, id);
    res.json({ success: true, message: 'Payment approved successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/admin/payments/:id/reject
 */
const rejectPayment = async (req, res) => {
  const { id } = req.params; // booking_id
  const { reason } = req.body;
  try {
    await adminService.rejectPayment(req.user.id, id, reason);
    res.json({ success: true, message: 'Payment rejected successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAllBookings, getAllPayments, cancelBooking, approvePayment, rejectPayment };
