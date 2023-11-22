'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const users = require("../data/user.json")
    
    await queryInterface.bulkInsert('Users', users.map(users => {
      return {
        ...users,
        createdAt: new Date,
        updatedAt: new Date,
      }
    }))
  },

  async down (queryInterface, Sequelize) {
    
    await queryInterface.bulkDelete('Users', null, {});
    
  }
};
