const router = require('express').Router()
const sequelize = require('../../config/connection')
const { Festival, Lineup } = require('../../models')
const requireAuth = require('../../middleware/auth')
const requireAdmin = require('../../middleware/admin')
const { Op } = require('sequelize')

// find all festivals
router.get('/', (req,res) => {
    Festival.findAll({
        order: [
            ["date", "DESC"]
        ]
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

// GET /api/festivals/upcoming
router.get("/upcoming", async (req, res) => {
  try {
    // Compare against today's date at midnight (server time)
    const todayStr = new Date().toISOString().slice(0, 10);

    const festivals = await Festival.findAll({
      where: {
        date: { [Op.gte]: todayStr },
      },
      order: [["date", "ASC"]],
    });

    res.json(festivals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// find one festival by slug
router.get('/:slug', (req,res) => {
    Festival.findOne({
        where: {
            slug: req.params.slug
        },
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

// create a festival
router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      name,
      slug,
      date,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: "name and slug are required" });
    }

    const newFestival = await Festival.create({
      name,
      slug,
      date,
    });

    return res.status(201).json(newFestival);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// update a festival
// PUT /api/festivals/:id
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const festivalId = Number(req.params.id);
    if (!Number.isFinite(festivalId)) {
      return res.status(400).json({ message: "Invalid festival id" });
    }

    const { name, slug, date } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: "name and slug are required" });
    }

    const [updatedCount] = await Festival.update(
      { name, slug, date },
      { where: { id: festivalId } }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Festival not found" });
    }

    const updatedFestival = await Festival.findByPk(festivalId);
    return res.json(updatedFestival);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// delete a festival (and its lineup entries)
// DELETE /api/festivals/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const festivalId = Number(req.params.id);
    if (!Number.isFinite(festivalId)) {
      return res.status(400).json({ message: "Invalid festival id" });
    }

    await sequelize.transaction(async (t) => {
      await Lineup.destroy({ where: { festival_id: festivalId }, transaction: t });
      const deletedCount = await Festival.destroy({ where: { id: festivalId }, transaction: t });
      if (deletedCount === 0) {
        throw Object.assign(new Error("Festival not found"), { status: 404 });
      }
    });

    return res.status(204).end();
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router
