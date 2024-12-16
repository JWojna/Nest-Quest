'use strict';

const { Image } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Image.bulkCreate([
      {
        url: 'fakeimage.com',
        preview: true,
        imageableId: 2,
        imageableType: 'spot'
      },
      {
        url: 'fakeimage.com',
        preview: true,
        imageableId: 2,
        imageableType: 'review'
      },
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Images')
  }
};
