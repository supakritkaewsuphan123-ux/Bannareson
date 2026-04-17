const supabase = require('../config/supabase');

/**
 * Get all rooms with their dynamic status
 * Status logic:
 * - 'booked' if has a 'paid' booking
 * - 'reserved' if has 'pending_payment' AND not expired
 * - 'available' otherwise
 */
const getAllRooms = async (req, res) => {
  try {
    // 1. Fetch all rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .order('name', { ascending: true });

    if (roomsError) throw roomsError;

    // 2. Fetch all active/paid bookings
    const { data: activeBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('room_id, status, expires_at')
      .in('status', ['pending_payment', 'paid'])
      .gt('expires_at', new Date().toISOString());

    if (bookingsError) throw bookingsError;

    // 3. Map status to rooms
    const roomsWithStatus = rooms.map(room => {
      const booking = activeBookings.find(b => b.room_id === room.id);
      let dynamicStatus = 'available';

      if (booking) {
        if (booking.status === 'paid') {
          dynamicStatus = 'booked';
        } else if (booking.status === 'pending_payment') {
          dynamicStatus = 'reserved';
        }
      }

      return {
        ...room,
        status: dynamicStatus,
        booking_info: booking || null
      };
    });

    res.json(roomsWithStatus);
  } catch (error) {
    console.error('GetRooms Error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllRooms };
