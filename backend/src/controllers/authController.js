const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { limparCpf, isCpfValido, isDataValida, isSenhaForte } = require('../utils/validators');

async function autenticar({ cpf, senha }) {
  const cpfLimpo = limparCpf(cpf);
  if (!cpfLimpo || !senha) {
    const error = new Error('CPF e senha sao obrigatorios');
    error.status = 400;
    throw error;
  }

  const usuario = await Usuario.findOne({ where: { cpf: cpfLimpo } });
  if (!usuario) {
    const error = new Error('CPF ou senha invalidos');
    error.status = 401;
    throw error;
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaCorreta) {
    const error = new Error('CPF ou senha invalidos');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, cpf: usuario.cpf },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return { token, usuario: usuario.toJSON() };
}

function validarDadosUsuario({ nome, cpf, senha, data_nascimento }) {
  if (!nome || !cpf || !senha) {
    const error = new Error('Nome, CPF e senha sao obrigatorios');
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

async function criarUsuario(data) {
  validarDadosUsuario(data);
  const cpfLimpo = limparCpf(data.cpf);

  const existente = await Usuario.findOne({ where: { cpf: cpfLimpo } });
  if (existente) {
    const error = new Error('Ja existe um usuario cadastrado com esse CPF');
    error.status = 409;
    throw error;
  }

  const senha_hash = await bcrypt.hash(data.senha, 10);

  const usuario = await Usuario.create({
    nome: data.nome,
    cpf: cpfLimpo,
    senha_hash,
    data_nascimento: data.data_nascimento || null,
  });

  return usuario;
}

module.exports = { autenticar, criarUsuario, validarDadosUsuario };
