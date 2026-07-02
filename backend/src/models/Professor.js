const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Professor extends Model {
  toJSON() {
    return {
      id: this.id,
      usuario_id: this.usuario_id,
      escola_id: this.escola_id,
    };
  }
}

Professor.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'usuarios', key: 'id' },
    },
    escola_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'escolas', key: 'id' },
    },
  },
  {
    sequelize,
    modelName: 'Professor',
    tableName: 'professores',
    timestamps: false,
  }
);

module.exports = Professor;
