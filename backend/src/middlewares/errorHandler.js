const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({ error: 'Registro duplicado (verifique o CPF informado)' });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({ error: 'Referencia invalida (escola/professor inexistente)' });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
  }

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error('Erro inesperado:', err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
}

module.exports = errorHandler;
