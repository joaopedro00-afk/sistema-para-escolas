const express = require('express');
const alunoController = require('../controllers/alunoController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

function serializeAluno(aluno) {
  return {
    id: aluno.id,
    nome: aluno.nome,
    cpf: aluno.cpf,
    data_nascimento: aluno.data_nascimento,
    professor_id: aluno.professor_id,
    professor: aluno.professor
      ? {
          id: aluno.professor.id,
          nome: aluno.professor.usuario ? aluno.professor.usuario.nome : undefined,
          escola: aluno.professor.escola ? aluno.professor.escola.nome : undefined,
        }
      : undefined,
  };
}

// GET /api/students
router.get('/', async (req, res, next) => {
  try {
    const alunos = await alunoController.listarAlunos();
    return res.status(200).json(alunos.map(serializeAluno));
  } catch (err) {
    return next(err);
  }
});

// GET /api/students/:id
router.get('/:id', async (req, res, next) => {
  try {
    const aluno = await alunoController.buscarAlunoPorId(req.params.id);
    return res.status(200).json(serializeAluno(aluno));
  } catch (err) {
    return next(err);
  }
});

// POST /api/students
router.post('/', async (req, res, next) => {
  try {
    const aluno = await alunoController.criarAluno(req.body || {});
    return res.status(201).json(serializeAluno(aluno));
  } catch (err) {
    return next(err);
  }
});

// PUT /api/students/:id
router.put('/:id', async (req, res, next) => {
  try {
    const aluno = await alunoController.atualizarAluno(req.params.id, req.body || {});
    return res.status(200).json(serializeAluno(aluno));
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await alunoController.excluirAluno(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
