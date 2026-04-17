const supabase = require('../config/supabase');

/**
 * 1. authenticate: ตรวจสอบ Supabase JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }

    req.user = user; // เก็บเฉพาะข้อมูลพื้นฐานจาก Auth
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * 2. banCheck: ตรวจสอบว่า User ถูกแบนหรือไม่
 */
const banCheck = async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_banned')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(401).json({ success: false, message: 'User profile not found' });
    }

    if (profile.is_banned) {
      return res.status(403).json({ success: false, message: 'Forbidden: Your account has been banned' });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * 3. isAdmin: ตรวจสอบสิทธิ์ Admin จาก Database เท่านั้น
 */
const isAdmin = async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profile && profile.role === 'admin') {
      req.user.role = 'admin';
      next();
    } else {
      res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = { authenticate, banCheck, isAdmin };
