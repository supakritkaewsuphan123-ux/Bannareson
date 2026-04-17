const supabase = require('../config/supabase');

/**
 * Create a new booking
 */
const createBooking = async (req, res) => {
  const { room_id } = req.body;
  const user_id = req.user.id;

  if (!room_id) {
    return res.status(400).json({ error: 'Room ID is required' });
  }

  try {
    // 1. Get dynamic expiry from settings
    const { data: settings } = await supabase.from('settings').select('booking_expiry_mins').eq('id', 1).single();
    const expiryMins = settings?.booking_expiry_mins || 30;
    const expiresAt = new Date(Date.now() + expiryMins * 60 * 1000).toISOString();

    // 2. Call the Postgres function for Atomic Booking
    const { data: bookingId, error } = await supabase.rpc('create_booking', {
      p_user_id: user_id,
      p_room_id: room_id,
      p_expires_at: expiresAt
    });

    if (error) {
      if (error.message.includes('occupied')) {
        return res.status(409).json({ error: 'Room is already occupied or reserved.' });
      }
      throw error;
    }

    res.status(201).json({ 
      message: 'Booking created successfully', 
      booking_id: bookingId,
      expires_at: expiresAt 
    });
  } catch (error) {
    console.error('CreateBooking Error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Handle slip upload
 */
const uploadSlip = async (req, res) => {
  const { booking_id, slip_url, amount } = req.body;
  const user_id = req.user.id;

  if (!booking_id || !slip_url) {
    return res.status(400).json({ error: 'Booking ID and Slip URL are required' });
  }

  try {
    // 1. Verify booking ownership and status
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('user_id', user_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found or access denied' });
    }

    if (new Date(booking.expires_at) < new Date()) {
      // API layer check for expiry
      await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking_id);
      return res.status(400).json({ error: 'Booking has expired' });
    }

    // 2. Create Payment record (status: pending)
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id,
        slip_url,
        amount,
        status: 'pending'
      });

    if (paymentError) throw paymentError;
    
    // 3. Update Booking status to awaiting_verification
    await supabase
      .from('bookings')
      .update({ status: 'awaiting_verification' })
      .eq('id', booking_id);

    res.json({ message: 'Slip uploaded successfully. Waiting for admin approval.' });
  } catch (error) {
    console.error('UploadSlip Error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get booking by ID
 */
const getBookingById = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, rooms(*)')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's booking history
 */
const getMyBookings = async (req, res) => {
  const user_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, rooms(*), payments(*)')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaymentInfo = async (req, res) => {
  try {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    // Fallback to env or defaults
    res.json({
      bank_name: process.env.BANK_NAME || 'Kasikorn Bank (KBank)',
      account_number: process.env.BANK_ACCOUNT_NUMBER || '123-456-7890',
      account_name: process.env.BANK_ACCOUNT_NAME || 'Baan Na Resort Co., Ltd.',
      qr_code_url: process.env.QR_CODE_URL || 'https://example.com/qr-code.png'
    });
  }
};

/**
 * Cancel a booking
 */
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('user_id', user_id)
      .eq('status', 'pending_payment');

    if (error) throw error;
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createBooking, uploadSlip, getBookingById, getMyBookings, getPaymentInfo, cancelBooking };
