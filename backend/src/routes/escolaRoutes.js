const express = require('express');
const escolaController = require('../controllers/escolaController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// GET /api/schools
router.get('/', async (req, res, next) => {
  try {
    const escolas = await escolaController.listarEscolas();
    return res.status(200).json(escolas.map((e) => e.toJSON()));
  } catch (err) {
    return next(err);
  }
});

// GET /api/schools/:id
router.get('/:id', async (req, res, next) => {
  try {
    const escola = await escolaController.buscarEscolaPorId(req.params.id);
    return res.status(200).json(escola.toJSON());
  } catch (err) {
    return next(err);
  }
});

// POST /api/schools
router.post('/', async (req, res, next) => {
  try {
    const escola = await escolaController.criarEscola(req.body || {});
    return res.status(201).json(escola.toJSON());
  } catch (err) {
    return next(err);
  }
});

// PUT /api/schools/:id
router.put('/:id', async (req, res, next) => {
  try {
    const escola = await escolaController.atualizarEscola(req.params.id, req.body || {});
    return res.status(200).json(escola.toJSON());
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/schools/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await escolaController.excluirEscola(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
