const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/login
router.post('/', async (req, res, next) => {
  try {
    const { token, usuario } = await authController.autenticar(req.body || {});
    return res.status(200).json({ token, usuario });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
