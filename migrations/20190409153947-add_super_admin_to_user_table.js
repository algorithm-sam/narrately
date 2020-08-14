'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Users', // name of Source model
      'isSuperAdmin', // name of the key we're adding 
      {
        type: Sequelize.BOOLEAN
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Users', // name of Source model
      'isSuperAdmin' // key we want to remove
    );
  }
};