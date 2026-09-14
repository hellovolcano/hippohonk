const router = require('express').Router();
const { getArtistImage } = require('../../services/spotify');

// GET /api/spotify/artist-image?spotify_url=...
// Always resolves to { image: url|null } - never errors out to the client,
// since the caller should just fall back to the default band image.
router.get('/artist-image', async (req, res) => {
  try {
    const { spotify_url } = req.query;
    if (!spotify_url) {
      return res.json({ image: null });
    }

    const image = await getArtistImage(spotify_url);
    res.json({ image });
  } catch (err) {
    console.error(err);
    res.json({ image: null });
  }
});

module.exports = router;
