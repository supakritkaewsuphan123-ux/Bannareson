const express = require('express');
const router = express.Router();
const { authenticate, banCheck, isAdmin } = require('../middleware/auth');

// Controllers
const dashboardController = require('../controllers/adminDashboardController');
const roomController = require('../controllers/adminRoomController');
const bookingController = require('../controllers/adminBookingController');
const userController = require('../controllers/adminUserController');
const settingsController = require('../controllers/adminSettingsController');

// All routes here require: Authentication -> Ban Check -> Admin Check
router.use(authenticate, banCheck, isAdmin);

/**
 * Dashboard Routes
 */
router.get('/dashboard', dashboardController.getStats);

/**
 * Room Management
 */
router.get('/rooms', roomController.getAllRooms);
router.post('/rooms', roomController.createRoom);
router.put('/rooms/:id', roomController.updateRoom);
router.delete('/rooms/:id', roomController.deleteRoom);

/**
 * Booking Management
 */
router.get('/bookings', bookingController.getAllBookings);
router.patch('/bookings/:id/cancel', bookingController.cancelBooking);

/**
 * Payment/Slip Management
 */
router.get('/payments', bookingController.getAllPayments);
router.patch('/payments/:id/approve', bookingController.approvePayment);
router.patch('/payments/:id/reject', bookingController.rejectPayment);

/**
 * User Management
 */
router.get('/users', userController.getAllUsers);
router.patch('/users/:id/ban', userController.toggleBanStatus);

/**
 * Settings Management
 */
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

module.exports = router;
