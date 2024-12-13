'use strict';


const { Booking } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Booking.bulkCreate([

    ], { validate: true });

  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Bookings')
  }
};
