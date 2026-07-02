const { sequelize, Escola, Professor, Usuario, Aluno } = require('../models');

async function listarEscolas() {
  return Escola.findAll({ order: [['id', 'ASC']] });
}

async function buscarEscolaPorId(id) {
  const escola = await Escola.findByPk(id);
  if (!escola) {
    const error = new Error('Escola nao encontrada');
    error.status = 404;
    throw error;
  }
  return escola;
}

function validarEscola({ nome, endereco }) {
  if (!nome || !endereco) {
    const error = new Error('Nome e endereco sao obrigatorios');
    error.status = 400;
    throw error;
  }
}

async function criarEscola(data) {
  validarEscola(data);
  return Escola.create({ nome: data.nome, endereco: data.endereco });
}

async function atualizarEscola(id, data) {
  const escola = await buscarEscolaPorId(id);
  escola.nome = data.nome ?? escola.nome;
  escola.endereco = data.endereco ?? escola.endereco;
  await escola.save();
  return escola;
}

// Exclui a escola e, em cascata, os professores vinculados a ela
// (junto com os usuarios/logins e alunos desses professores)
async function excluirEscola(id) {
  const escola = await buscarEscolaPorId(id);
  const professores = await Professor.findAll({ where: { escola_id: escola.id } });

  return sequelize.transaction(async (t) => {
    for (const professor of professores) {
      await Aluno.destroy({ where: { professor_id: professor.id }, transaction: t });
      await Professor.destroy({ where: { id: professor.id }, transaction: t });
      await Usuario.destroy({ where: { id: professor.usuario_id }, transaction: t });
    }
    await escola.destroy({ transaction: t });
  });
}

module.exports = {
  listarEscolas,
  buscarEscolaPorId,
  criarEscola,
  atualizarEscola,
  excluirEscola,
};
