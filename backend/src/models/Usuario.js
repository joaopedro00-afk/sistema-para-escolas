const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Usuario extends Model {
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      cpf: this.cpf,
      data_nascimento: this.data_nascimento,
      created_at: this.created_at,
    };
  }
}

Usuario.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    cpf: { type: DataTypes.STRING(11), allowNull: false, unique: true },
    senha_hash: { type: DataTypes.STRING(255), allowNull: false },
    data_nascimento: { type: DataTypes.DATEONLY, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Usuario;
