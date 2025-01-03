//^ backend/routes/api/reviews.js
const express = require('express');
const { requireAuth, checkOwnership } = require('../../utils/auth');
const { Spot, Image, Review, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const formatDate = require('../api/utils/date-formatter');

const router = express.Router();

const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isLength({ max: 250 })
    .withMessage('Review text is required'),
  check('stars')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isNumeric()
    .withMessage('Stars must be an integer from 1 to 5'), //? custom check for 1-5
  handleValidationErrors
];

//~GET REVIEWS FOR CURR USER
//! require auth
router.get('/current', requireAuth, async (req, res) => {
    try {
      const reviews = await Review.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: Spot,
            attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
            include: [{
              model: Image,
              as: 'Images',
              attributes: ['url'],
              limit: 1,
            }],
          },
          {
            model: Image,
            as: 'Images',
            attributes: ['id', 'url'],
          },
        ],
      });

      if (!reviews) {
        return res.status(404).json({ error: `No reviews found for spot ${spotId} `});
      };

      const responseData = reviews.map( review => {
        const { User, Spot, Images, createdAt, updatedAt, ...reviewData } = review.get();
        const reviewImages = review.Images ? review.Images.map( image => ({
          id: image.id,
          url: image.url
        })) : [];

        return {
          ...reviewData,
          createdAt: formatDate(createdAt),
          updatedAt: formatDate(updatedAt),
          User: {
            id: User.id,
            firstName: User.firstName,
            lastName: User.lastName
          },
          Spot: {
            id: Spot.id,
            ownerId: Spot.ownerId,
            address: Spot.address,
            city: Spot.city,
            state: Spot.state,
            country: Spot.country,
            lat: Spot.lat,
            lng: Spot.lng,
            name: Spot.name,
            price: Spot.price,
            previewImage: Spot.Images.length ? Spot.Images[0].url : null
          },
          ReviewImages: reviewImages
        };

      });

      res.json({ Reviews: responseData });

    } catch (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
})

//~EDIT A REVIEW
//! require auth and own
router.put('/:reviewId', requireAuth, checkOwnership(Review, validateReview, 'reviewId', 'userId'),
async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.reviewId);

        if (!review) return res.status(404).json({ message: `review coudn't be found` });

        review.set({
            ...req.body
        });

        review.save({ validate: true });

        const reviewObj = review.get();
        reviewObj.createdAt = formatDate(reviewObj.createdAt);
        reviewObj.updatedAt = formatDate(reviewObj.updatedAt);

        res.json(reviewObj);
    } catch (error) {
        console.error('Error deleteing review:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

//~DELETE A REVIEW
//! requires auth and ownership
router.delete('/:reviewId', requireAuth, checkOwnership(Review, 'reviewId', 'userId'),
async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.reviewId);

        if (!review) return res.status(404).json({ message: `Review coudn't be found` })

        review.destroy();

        res.json({ message: 'Successfully deleted' });

    } catch (error) {
        console.error('Error deleteing review:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

//~ADD IMAGE TO REVIEW
//! requires auth and review ownership
router.post('/:reviewId/images', requireAuth, checkOwnership(Review, 'reviewId', 'userId'),
async (req, res) => {
    const imageData = req.body;
    const reviewId  = req.params.reviewId;

    const review = await Review.findByPk(reviewId);

    if (!review) return res.status(404).json({ message: "Review couldn't be found" });

    const imageCount = await Image.count({ where: { imageableId: reviewId, imageableType: 'review' }});

    if (imageCount >= 10) {
        return res.status(403).json(
            {
                message: 'Maximum number of images for this resouce was reached'
            });
    };


    try {
        const newImage = await Image.create({
            ...imageData,
            imageableId: reviewId,
            imageableType: 'review',
        }, { validate: true });

        const imageObj = newImage.get();

        delete imageObj.preview;
        delete imageObj.imageableId;
        delete imageObj.imageableType;
        delete imageObj.createdAt;
        delete imageObj.updatedAt;

        res.status(201).json(imageObj);

    } catch (error) {
        console.error('Error creating image:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    };

});


module.exports = router;
