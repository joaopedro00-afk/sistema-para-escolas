const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Escola = require('./Escola');
const Professor = require('./Professor');
const Aluno = require('./Aluno');

// Um professor pertence a um usuario (dados de login) e a uma escola
Professor.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasOne(Professor, { foreignKey: 'usuario_id', as: 'professor' });

Professor.belongsTo(Escola, { foreignKey: 'escola_id', as: 'escola' });
Escola.hasMany(Professor, { foreignKey: 'escola_id', as: 'professores' });

// Um aluno pertence a um professor
Aluno.belongsTo(Professor, { foreignKey: 'professor_id', as: 'professor' });
Professor.hasMany(Aluno, { foreignKey: 'professor_id', as: 'alunos' });

module.exports = {
  sequelize,
  Usuario,
  Escola,
  Professor,
  Aluno,
};
