'use strict';
module.exports = (sequelize, DataTypes) => {
  const Conversion = sequelize.define('Conversion', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: {
      type: DataTypes.STRING
    },
    downloadUrl: {
      type: DataTypes.TEXT
    },
    content: {
      type: DataTypes.TEXT
    },
    voiceType: {
        type: DataTypes.STRING
    },
    languageCode: {
      type: DataTypes.STRING
    },
    ssmlGender: {
      type: DataTypes.STRING
    },
    speed: {
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {});

  Conversion.associate = function(models) {
   Conversion.belongsTo(models.User)
  };

  return Conversion;
};