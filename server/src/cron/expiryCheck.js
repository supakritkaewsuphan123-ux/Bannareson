const cron = require('node-cron');
const supabase = require('../config/supabase');

/**
 * Cron Job runs every minute to cleanup expired bookings
 */
const initExpiryCron = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Running expiry check cron...');
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('status', 'pending_payment')
        .lt('expires_at', new Date().toISOString())
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log(`Cancelled ${data.length} expired bookings.`);
      }
    } catch (error) {
      console.error('Cron Expiry Check Error:', error);
    }
  });
};

module.exports = { initExpiryCron };
