const supabase = require('../config/supabase');

/**
 * Admin Service - จัดการ Logic หลักและประสานงานกับ Database
 */
const adminService = {
  
  /**
   * บันทึกประวัติการทำงานของ Admin
   */
  logAction: async (adminId, action, targetId, details = {}) => {
    try {
      await supabase.from('admin_logs').insert([{
        admin_id: adminId,
        action,
        target_id: targetId,
        details
      }]);
    } catch (error) {
      console.error('Logging Error:', error);
      // ไม่ throw error เพื่อไม่ให้ขัดจังหวะ process หลัก แต่ควร log แยกไว้
    }
  },

  /**
   * ดึงสถิติ Dashboard ด้วย RPC
   */
  getDashboardStats: async () => {
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
    if (error) throw error;
    return data;
  },

  /**
   * อนุมัติการชำระเงิน (Success: status -> paid)
   */
  approvePayment: async (adminId, bookingId) => {
    // 1. อัปเดตสถานะการจอง
    const { error: bError } = await supabase
      .from('bookings')
      .update({ status: 'paid' })
      .eq('id', bookingId)
      .in('status', ['pending_payment', 'awaiting_verification']); // รองรับทั้งสองสถานะ

    if (bError) throw bError;

    // 2. อัปเดตสถานะการชำระเงิน
    const { error: pError } = await supabase
      .from('payments')
      .update({ status: 'approved' })
      .eq('booking_id', bookingId);

    if (pError) throw pError;

    // 3. บันทึก Log
    await adminService.logAction(adminId, 'approve_payment', bookingId);
    
    return { success: true };
  },

  /**
   * ปฏิเสธการชำระเงิน (Reject: status -> cancelled)
   */
  rejectPayment: async (adminId, bookingId, reason) => {
    const { error: bError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (bError) throw bError;

    const { error: pError } = await supabase
      .from('payments')
      .update({ status: 'rejected' })
      .eq('booking_id', bookingId);

    if (pError) throw pError;

    await adminService.logAction(adminId, 'reject_payment', bookingId, { reason });

    return { success: true };
  }
};

module.exports = adminService;
