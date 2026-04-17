const express = require('express');
const cors = require('cors');
const { authenticate, isAdmin } = require('./middleware/auth');
const roomController = require('./controllers/roomController');
const bookingController = require('./controllers/bookingController');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const allowedOrigins = [
  'https://mintcream-pheasant-479607.hostingersite.com',
  'http://localhost:5173',
  'http://localhost:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Public Routes
app.get('/api/rooms', roomController.getAllRooms);
app.get('/api/resort-info', (req, res) => {
  const supabase = require('./config/supabase');
  supabase.from('settings').select('resort_map_url').eq('id', 1).single()
    .then(({ data, error }) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    });
});

// Protected Routes (Users)
app.post('/api/bookings/book', authenticate, bookingController.createBooking);
app.post('/api/bookings/upload-slip', authenticate, bookingController.uploadSlip);
app.get('/api/bookings/my-bookings', authenticate, bookingController.getMyBookings);
app.get('/api/bookings/payment-info', authenticate, bookingController.getPaymentInfo);
app.get('/api/bookings/:id', authenticate, bookingController.getBookingById);
app.delete('/api/bookings/:id', authenticate, bookingController.cancelBooking);

// Admin Routes (Refactored)
app.use('/api/admin', adminRoutes);

// Centralized Error Handler (Step 1.5)
app.use((err, req, res, next) => {
  console.error('Final Error Catch:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
