'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    await queryInterface.addIndex('NEST_QUEST_SCHEMA.Spots', ['price', 'lat', 'lng'], {
      name: 'idxPriceLatLng',
      unique: false
    }, options);
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    await queryInterface.removeIndex('NEST_QUEST_SCHEMA.Spots', 'idxPriceLatLng');
  }
};
