const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Aluno extends Model {
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      cpf: this.cpf,
      data_nascimento: this.data_nascimento,
      professor_id: this.professor_id,
    };
  }
}

Aluno.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    cpf: { type: DataTypes.STRING(11), allowNull: false, unique: true },
    data_nascimento: { type: DataTypes.DATEONLY, allowNull: true },
    professor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'professores', key: 'id' },
    },
  },
  {
    sequelize,
    modelName: 'Aluno',
    tableName: 'alunos',
    timestamps: false,
  }
);

module.exports = Aluno;
