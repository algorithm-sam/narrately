'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Conversions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      downloadUrl: {
        type: Sequelize.TEXT
      },
      content: {
        type: Sequelize.TEXT
      },
      voiceType: {
        type: Sequelize.STRING
      },
      languageCode: {
        type: Sequelize.STRING
      },
      ssmlGender: {
        type: Sequelize.STRING
      },
      speed: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Conversions');
  }
};