const { Usuario } = require('../models');

async function listarUsuarios() {
  return Usuario.findAll({ order: [['id', 'ASC']] });
}

module.exports = { listarUsuarios };
