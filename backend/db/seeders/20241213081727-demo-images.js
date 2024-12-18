'use strict';

const { Image, Spot, Review } = require('../models');
//^import data
const imageData = require('../data/imageData');
//^Import shuffler
const shuffleArray = require('../data/utils/shuffle');

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

      shuffleArray(reviews);
      shuffleArray(spots);

      imageData.forEach( (image, index) => {
        if (image.imageableType === 'spot') {
          image.imageableId = spots[(index % spots.length)].id;
        } else if (image.imageableType === 'review') {
          image.imageableId = reviews[(index % reviews.length)].id;
        }
      });

      await Image.bulkCreate(imageData, { validate: true });
    } catch (error) {
      console.error('Error seeding images',error);
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Images', options);
  }
};
