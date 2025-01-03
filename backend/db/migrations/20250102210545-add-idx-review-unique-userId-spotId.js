'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    await queryInterface.addIndex('NEST_QUEST_SCHEMA.Reviews', ['userId', 'spotId'], {
      name: 'idxUserIdSpotId',
      unique: true
    }, options);
  },

  async down (queryInterface, Sequelize) {
    // options.tableName = 'Reviews';
    await queryInterface.removeIndex('NEST_QUEST_SCHEMA.Reviews', 'idxUserIdSpotId');
  }
};
