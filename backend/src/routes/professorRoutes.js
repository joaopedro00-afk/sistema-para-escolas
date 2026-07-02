const express = require('express');
const professorController = require('../controllers/professorController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

function serializeProfessor(professor) {
  return {
    id: professor.id,
    escola_id: professor.escola_id,
    usuario_id: professor.usuario_id,
    nome: professor.usuario ? professor.usuario.nome : undefined,
    cpf: professor.usuario ? professor.usuario.cpf : undefined,
    data_nascimento: professor.usuario ? professor.usuario.data_nascimento : undefined,
    escola: professor.escola ? { id: professor.escola.id, nome: professor.escola.nome } : undefined,
  };
}

// POST /api/teachers -> publica, pois cria o proprio login do professor
router.post('/', async (req, res, next) => {
  try {
    const professor = await professorController.criarProfessor(req.body || {});
    return res.status(201).json(serializeProfessor(professor));
  } catch (err) {
    return next(err);
  }
});

router.use(authMiddleware);

// GET /api/teachers
router.get('/', async (req, res, next) => {
  try {
    const professores = await professorController.listarProfessores();
    return res.status(200).json(professores.map(serializeProfessor));
  } catch (err) {
    return next(err);
  }
});

// GET /api/teachers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const professor = await professorController.buscarProfessorPorId(req.params.id);
    return res.status(200).json(serializeProfessor(professor));
  } catch (err) {
    return next(err);
  }
});

// PUT /api/teachers/:id (troca de escola)
router.put('/:id', async (req, res, next) => {
  try {
    const professor = await professorController.atualizarProfessor(req.params.id, req.body || {});
    return res.status(200).json(serializeProfessor(professor));
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/teachers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await professorController.excluirProfessor(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
