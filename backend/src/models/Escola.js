const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Escola extends Model {
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      endereco: this.endereco,
    };
  }
}

Escola.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(150), allowNull: false },
    endereco: { type: DataTypes.STRING(255), allowNull: false },
  },
  {
    sequelize,
    modelName: 'Escola',
    tableName: 'escolas',
    timestamps: false,
  }
);

module.exports = Escola;
