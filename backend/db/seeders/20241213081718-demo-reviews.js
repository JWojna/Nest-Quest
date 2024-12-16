'use strict';

const { Review } = require('../models');

if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        userId: 1,
        spotId: 2,
        review: 'This was an awesome place!',
        stars: 5,
      },
      {
        userId: 2,
        spotId: 2,
        review: 'This was an awesome!',
        stars: 4,
      },
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Reviews')
  }
};
