const adminService = require('../services/adminService');

/**
 * GET /api/admin/dashboard
 */
const getStats = async (req, res) => {
  try {
    const data = await adminService.getDashboardStats();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

module.exports = { getStats };
