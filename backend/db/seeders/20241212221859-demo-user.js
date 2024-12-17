'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

//^ import data
const users = require('../data/userData');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate(users, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null , options);
  }
};
