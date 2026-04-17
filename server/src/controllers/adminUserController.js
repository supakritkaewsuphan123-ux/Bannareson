const supabase = require('../config/supabase');
const adminService = require('../services/adminService');

/**
 * GET /api/admin/users
 */
const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/admin/users/:id/ban
 */
const toggleBanStatus = async (req, res) => {
  const { id } = req.params;
  const { is_banned } = req.body;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_banned })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await adminService.logAction(req.user.id, 'ban_user', id, { is_banned });

    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, toggleBanStatus };
