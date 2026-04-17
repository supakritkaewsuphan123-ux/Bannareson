const supabase = require('../config/supabase');
const adminService = require('../services/adminService');

/**
 * GET /api/admin/settings
 */
const getSettings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/settings
 */
const updateSettings = async (req, res) => {
  const { id, updated_at, ...updates } = req.body;
  try {
    // Validate inputs
    if (updates.booking_expiry_mins && updates.booking_expiry_mins <= 0) {
      return res.status(400).json({ success: false, message: 'Expiry must be > 0' });
    }

    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;

    await adminService.logAction(req.user.id, 'update_settings', 1, updates);

    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
