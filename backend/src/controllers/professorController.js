const bcrypt = require('bcryptjs');
const { sequelize, Professor, Usuario, Escola, Aluno } = require('../models');
const { limparCpf, isCpfValido, isDataValida, isSenhaForte } = require('../utils/validators');

const includeRelacoes = [
  { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'cpf', 'data_nascimento'] },
  { model: Escola, as: 'escola', attributes: ['id', 'nome', 'endereco'] },
];

async function listarProfessores() {
  return Professor.findAll({ include: includeRelacoes, order: [['id', 'ASC']] });
}

async function buscarProfessorPorId(id) {
  const professor = await Professor.findByPk(id, { include: includeRelacoes });
  if (!professor) {
    const error = new Error('Professor nao encontrado');
    error.status = 404;
    throw error;
  }
  return professor;
}

function validarDadosProfessor({ nome, cpf, senha, data_nascimento, escola_id }) {
  if (!nome || !cpf || !senha || !escola_id) {
    const error = new Error('Nome, CPF, senha e escola sao obrigatorios');
    error.status = 400;
    throw error;
  }
  if (!isCpfValido(cpf)) {
    const error = new Error('CPF invalido');
    error.status = 400;
    throw error;
  }
  if (!isSenhaForte(senha)) {
    const error = new Error('Senha deve ter ao menos 6 caracteres, com letras e numeros');
    error.status = 400;
    throw error;
  }
  if (data_nascimento && !isDataValida(data_nascimento)) {
    const error = new Error('Data de nascimento invalida (use YYYY-MM-DD)');
    error.status = 400;
    throw error;
  }
}

// Cria o Usuario (login) e o Professor associado em uma unica transacao
async function criarProfessor(data) {
  validarDadosProfessor(data);
  const cpfLimpo = limparCpf(data.cpf);

  const escola = await Escola.findByPk(data.escola_id);
  if (!escola) {
    const error = new Error('Escola informada nao existe');
    error.status = 400;
    throw error;
  }

  const cpfExistente = await Usuario.findOne({ where: { cpf: cpfLimpo } });
  if (cpfExistente) {
    const error = new Error('Ja existe um usuario cadastrado com esse CPF');
    error.status = 409;
    throw error;
  }

  return sequelize.transaction(async (t) => {
    const senha_hash = await bcrypt.hash(data.senha, 10);

    const usuario = await Usuario.create(
      {
        nome: data.nome,
        cpf: cpfLimpo,
        senha_hash,
        data_nascimento: data.data_nascimento || null,
      },
      { transaction: t }
    );

    const professor = await Professor.create(
      { usuario_id: usuario.id, escola_id: data.escola_id },
      { transaction: t }
    );

    professor.usuario = usuario;
    professor.escola = escola;
    return professor;
  });
}

async function atualizarProfessor(id, data) {
  const professor = await buscarProfessorPorId(id);
  if (data.escola_id) {
    const escola = await Escola.findByPk(data.escola_id);
    if (!escola) {
      const error = new Error('Escola informada nao existe');
      error.status = 400;
      throw error;
    }
    professor.escola_id = data.escola_id;
    await professor.save();
  }
  return buscarProfessorPorId(professor.id);
}

// Exclui o Professor e tambem o Usuario (login) e os Alunos vinculados a ele,
// para nao deixar CPF "preso" no banco impedindo um novo cadastro
async function excluirProfessor(id) {
  const professor = await buscarProfessorPorId(id);

  return sequelize.transaction(async (t) => {
    await Aluno.destroy({ where: { professor_id: professor.id }, transaction: t });
    await Professor.destroy({ where: { id: professor.id }, transaction: t });
    await Usuario.destroy({ where: { id: professor.usuario_id }, transaction: t });
  });
}

module.exports = {
  listarProfessores,
  buscarProfessorPorId,
  criarProfessor,
  atualizarProfessor,
  excluirProfessor,
};
