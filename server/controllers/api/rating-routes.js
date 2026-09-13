const router = require('express').Router()
const { Op } = require('sequelize')
const sequelize = require('../../config/connection')
const { Rating, User, Band } = require('../../models')
const requireAuth = require('../../middleware/auth')
const requireReviewer = require('../../middleware/reviewer')

// GET /api/ratings - optionally filter by band_id (comma-separated allowed) or user_id
router.get('/', async (req, res) => {
  const { band_id, user_id } = req.query;
  const where = {};

  if (band_id !== undefined) {
    const bandIds = String(band_id).split(',').map((v) => v.trim());
    where.band_id = bandIds.length > 1 ? { [Op.in]: bandIds } : bandIds[0];
  }
  if (user_id !== undefined) where.user_id = user_id;

  // On a band's page, only show ratings from active reviewers.
  // Review mode passes all=true to bypass this, since a reviewer's own rating
  // should always be visible/editable to them there, active or not.
  const userInclude = { model: User, attributes: ['id', 'first_name', 'last_name'] };
  if (band_id !== undefined && req.query.all !== 'true') {
    userInclude.where = { active: true, reviewer: true };
    userInclude.required = true;
  }

  try {
    const ratings = await Rating.findAll({
      where,
      include: [
        userInclude,
        { model: Band, attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(ratings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ratings/:id
router.get('/:id', async (req, res) => {
  try {
    const rating = await Rating.findByPk(req.params.id);
    if (!rating) return res.status(404).json({ message: 'Rating not found' });
    res.json(rating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/ratings
router.post('/', requireAuth, async (req, res) => {
  try {
    const { band_id, rating } = req.body;

    if (!band_id || rating === undefined) {
      return res.status(400).json({ message: 'band_id and rating are required' });
    }

    const newRating = await Rating.create({
      band_id,
      rating,
      user_id: req.session.userId,
    });

    res.status(201).json(newRating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/ratings/batch
// Body: { ratings: [{ band_id, rating }] }. rating null/undefined deletes the entry.
// Only affects the current user's own ratings. Returns recalculated average_rating per affected band.
router.post('/batch', requireReviewer, async (req, res) => {
  try {
    const { ratings } = req.body;
    if (!Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({ message: 'ratings array is required' });
    }

    const userId = req.session.userId;
    const affectedBandIds = [];

    await sequelize.transaction(async (t) => {
      for (const change of ratings) {
        const bandId = change.band_id;
        if (!bandId) continue;

        affectedBandIds.push(bandId);

        if (change.rating === null || change.rating === undefined) {
          await Rating.destroy({ where: { band_id: bandId, user_id: userId }, transaction: t });
          continue;
        }

        const [existing] = await Rating.findOrCreate({
          where: { band_id: bandId, user_id: userId },
          defaults: { rating: change.rating },
          transaction: t,
        });

        if (existing.rating !== change.rating) {
          await existing.update({ rating: change.rating }, { transaction: t });
        }
      }
    });

    const bands = await Band.findAll({
      where: { id: { [Op.in]: affectedBandIds } },
      attributes: [
        'id',
        [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('ratings.rating')), 1), 'average_rating'],
      ],
      include: [{ model: Rating, attributes: [] }],
      group: ['bands.id'],
    });

    res.json({ updated: bands });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/ratings/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const existing = await Rating.findByPk(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Rating not found' });
    if (existing.user_id !== req.session.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { rating } = req.body;
    await existing.update({ rating });

    res.json(existing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/ratings/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const existing = await Rating.findByPk(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Rating not found' });
    if (existing.user_id !== req.session.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await existing.destroy();
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router
