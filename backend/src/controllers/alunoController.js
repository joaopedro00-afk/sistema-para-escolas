const { Aluno, Professor, Usuario, Escola } = require('../models');
const { limparCpf, isCpfValido, isDataValida } = require('../utils/validators');

const includeRelacoes = [
  {
    model: Professor,
    as: 'professor',
    attributes: ['id', 'escola_id'],
    include: [
      { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'cpf'] },
      { model: Escola, as: 'escola', attributes: ['id', 'nome'] },
    ],
  },
];

async function listarAlunos() {
  return Aluno.findAll({ include: includeRelacoes, order: [['id', 'ASC']] });
}

async function buscarAlunoPorId(id) {
  const aluno = await Aluno.findByPk(id, { include: includeRelacoes });
  if (!aluno) {
    const error = new Error('Aluno nao encontrado');
    error.status = 404;
    throw error;
  }
  return aluno;
}

function validarDadosAluno({ nome, cpf, professor_id }) {
  if (!nome || !cpf || !professor_id) {
    const error = new Error('Nome, CPF e professor sao obrigatorios');
    error.status = 400;
    throw error;
  }
  if (!isCpfValido(cpf)) {
    const error = new Error('CPF invalido');
    error.status = 400;
    throw error;
  }
}

async function criarAluno(data) {
  validarDadosAluno(data);
  const cpfLimpo = limparCpf(data.cpf);

  if (data.data_nascimento && !isDataValida(data.data_nascimento)) {
    const error = new Error('Data de nascimento invalida (use YYYY-MM-DD)');
    error.status = 400;
    throw error;
  }

  const professor = await Professor.findByPk(data.professor_id);
  if (!professor) {
    const error = new Error('Professor informado nao existe');
    error.status = 400;
    throw error;
  }

  const cpfExistente = await Aluno.findOne({ where: { cpf: cpfLimpo } });
  if (cpfExistente) {
    const error = new Error('Ja existe um aluno cadastrado com esse CPF');
    error.status = 409;
    throw error;
  }

  const aluno = await Aluno.create({
    nome: data.nome,
    cpf: cpfLimpo,
    data_nascimento: data.data_nascimento || null,
    professor_id: data.professor_id,
  });

  return buscarAlunoPorId(aluno.id);
}

async function atualizarAluno(id, data) {
  const aluno = await buscarAlunoPorId(id);

  if (data.professor_id) {
    const professor = await Professor.findByPk(data.professor_id);
    if (!professor) {
      const error = new Error('Professor informado nao existe');
      error.status = 400;
      throw error;
    }
    aluno.professor_id = data.professor_id;
  }

  aluno.nome = data.nome ?? aluno.nome;
  if (data.data_nascimento) {
    if (!isDataValida(data.data_nascimento)) {
      const error = new Error('Data de nascimento invalida (use YYYY-MM-DD)');
      error.status = 400;
      throw error;
    }
    aluno.data_nascimento = data.data_nascimento;
  }

  await aluno.save();
  return buscarAlunoPorId(aluno.id);
}

async function excluirAluno(id) {
  const aluno = await buscarAlunoPorId(id);
  await aluno.destroy();
}

module.exports = {
  listarAlunos,
  buscarAlunoPorId,
  criarAluno,
  atualizarAluno,
  excluirAluno,
};
