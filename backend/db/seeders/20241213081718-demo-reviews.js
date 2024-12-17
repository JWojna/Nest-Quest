'use strict';

const { Review } = require('../models');

if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {


  },

  async down (queryInterface, Sequelize) {
 
  }
};
