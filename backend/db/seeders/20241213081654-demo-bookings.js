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
      {
        userId: 2,
        spotId: 2,
        startDate: "2021-11-19",
        endDate: "2021-11-20",
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Bookings')
  }
};
