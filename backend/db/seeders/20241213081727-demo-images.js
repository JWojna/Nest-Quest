'use strict';

const { Image, Spot, Review } = require('../models');
//^import data
const imageData = require('../data/imageData');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const spots = await Spot.findAll();
      const reviews = await Review.findAll();

      imageData.forEach( image => {
        if (image.imageableType === 'spot') {
          image.imageableId = spots[Math.floor(Math.random() * spots.length)].id;
        } else if (image.imageableType === 'review') {
          image.imageableId = reviews[Math.floor(Math.random() * reviews.length)].id;
        }
      });

      await Image.bulkCreate(imageData, { validate: true });
    } catch (error) {
      console.error('Error seeding images',error);
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Images', null, options);
  }
};
