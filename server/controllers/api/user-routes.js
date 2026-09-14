const router = require('express').Router()
const sequelize = require('../../config/connection')
const { User } = require('../../models')
const bcrypt = require("bcrypt");
const requireAuth = require('../../middleware/auth')
const requireAdmin = require('../../middleware/admin')

// find all users
router.get('/', requireAuth, async (req, res) => {
  try {
    const { active, reviewer } = req.query;
    const where = {};

    if (active !== undefined) where.active = active === 'true';
    if (reviewer !== undefined) where.reviewer = reviewer === 'true';

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_digest'] }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const password_digest = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password_digest,
      first_name,
      last_name,
    });

    req.session.userId = user.id;

    const safeUser = user.toJSON();
    delete safeUser.password_digest;

    return res.status(201).json(safeUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({
      where: { email },
      // make sure the digest is available for compare
      attributes: { include: ["password_digest"] },
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.password_digest) {
      return res.status(500).json({ message: "Missing password hash for user" });
    }

    const valid = await bcrypt.compare(password, user.password_digest);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    req.session.userId = user.id;

    // return safe user (exclude digest)
    const safeUser = user.toJSON();
    delete safeUser.password_digest;

    return res.json(safeUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/users/me
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: [
        "id",
        "email",
        "first_name",
        "last_name",
        "description",
        "reviewer",
        "active",
        "admin"
      ],
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/users/:id/role - admin-only: set active/reviewer/admin flags and name on any user
router.patch("/:id/role", requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const fields = {};
    if (req.body.active !== undefined) fields.active = !!req.body.active;
    if (req.body.reviewer !== undefined) fields.reviewer = !!req.body.reviewer;
    if (req.body.admin !== undefined) fields.admin = !!req.body.admin;
    if (req.body.first_name !== undefined) fields.first_name = req.body.first_name;
    if (req.body.last_name !== undefined) fields.last_name = req.body.last_name;

    await user.update(fields);

    const safeUser = user.toJSON();
    delete safeUser.password_digest;

    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/users/me
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { first_name, last_name, description } = req.body;

    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ first_name, last_name, description });

    const safeUser = user.toJSON();
    delete safeUser.password_digest;

    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// logout route
router.post('/logout', (req, res) => {
    if (req.session.userId) {
        req.session.destroy(() => {
            res.status(204).end()
        })
    }
    else {
        res.status(404).end()
    }
})

// GET /api/users/:id - public profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: [
        "id",
        "first_name",
        "last_name",
        "description",
        "reviewer",
        "admin"
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router
