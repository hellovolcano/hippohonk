const { User } = require('../models');

module.exports = async function requireAdmin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findByPk(req.session.userId, { attributes: ['admin'] });
    if (!user?.admin) return res.status(403).json({ message: "Forbidden" });
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
