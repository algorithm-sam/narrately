'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
   up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
        name: 'John Doe',
        email: 'ultimate.admin@narrately.com',
        username: 'ultimate_narrately',
        password: bcrypt.hashSync('.ymJ3we-o.84', 8),
        isActive: true,
        isAdmin:true,
        isSuperAdmin: true,
        createdAt: '2019-01-01 00:00:00',
        updatedAt: '2019-01-01 00:00:00'
      }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
