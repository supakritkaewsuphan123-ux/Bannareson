const supabase = require('../config/supabase');
const adminService = require('../services/adminService');

/**
 * GET /api/admin/rooms
 */
const getAllRooms = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*, room_images(image_url)')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/rooms
 */
const createRoom = async (req, res) => {
  const { name, type, price, description, x_pos, y_pos, images } = req.body;
  try {
    // 1. สร้างห้อง
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert([{ 
        name, 
        type, 
        price, 
        description, 
        x_pos: x_pos || 50, 
        y_pos: y_pos || 50 
      }])
      .select()
      .single();

    if (roomError) throw roomError;

    await adminService.logAction(req.user.id, 'create_room', room.id, { name: room.name });
    if (images && images.length > 0) {
      const imageData = images.map(img => ({ room_id: room.id, image_url: img }));
      await supabase.from('room_images').insert(imageData);
    }

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/rooms/:id
 */
const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { name, type, price, description, x_pos, y_pos } = req.body;
  
  try {
    const updates = { name, type, price, description, x_pos, y_pos };
    
    // Remove undefined fields to allow partial updates
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    await adminService.logAction(req.user.id, 'update_room', id);

    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/admin/rooms/:id
 */
const deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) throw error;

    await adminService.logAction(req.user.id, 'delete_room', id);

    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAllRooms, createRoom, updateRoom, deleteRoom };
