const express = require('express');
const authController = require('../controllers/authController');
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// POST /api/users -> cadastro publico de usuario
router.post('/', async (req, res, next) => {
  try {
    const usuario = await authController.criarUsuario(req.body || {});
    return res.status(201).json(usuario.toJSON());
  } catch (err) {
    return next(err);
  }
});

// GET /api/users -> listagem (requer login)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const usuarios = await usuarioController.listarUsuarios();
    return res.status(200).json(usuarios.map((u) => u.toJSON()));
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
