'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('Spots', ['price', 'lat', 'lng'], {
      name: 'idxPriceLatLng',
      unique: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('Spots', 'idxPriceLatLng', options);
  }
};
