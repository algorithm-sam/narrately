'use strict';

module.exports =  {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Users', // name of Source model
      'passwordResetToken', // name of the key we're adding 
      {
        type: Sequelize.STRING
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Users', // name of Source model
      'passwordResetToken' // key we want to remove
    );
  }
};