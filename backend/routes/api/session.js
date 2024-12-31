//^ backend/routes/api/session.js
const express = require('express')
const { Op, fn, col, where } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User, Spot, Review, Image } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { format } = require('sequelize/lib/utils');

const router = express.Router();

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors
];

//~ Restore session user
router.get(
    '/',
    (req, res) => {
      const { user } = req;
      if (user) {
        const safeUser = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
        };
        return res.json({
          user: safeUser
        });
      } else return res.json({ user: null });
    }
  );

//~ Log in
router.post(
  '/',
  validateLogin,
  async (req, res, next) => {
    const { credential, password } = req.body;

    const user = await User.unscoped().findOne({
      where: {
        [Op.or]: {
          username: credential,
          email: credential
        }
      }
    });

    if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
      const err = new Error('Login failed');
      err.status = 401;
      err.title = 'Login failed';
      err.errors = { credential: 'The provided credentials were invalid.' };
      return next(err);
    }

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser
    });
  }
);

//~ Logout
router.delete(
'/',
(_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
}
);

//~GET SPOTS OWNED BY CURRENT USER
router.get('/spots', requireAuth, async (req, res) => {
  try {
      const spots = await Spot.findAll({
        where: {
          ownerId: req.user.id
        },
        include: [{
          model: Image,
          as: 'Images',
          where: { preview: true },
          attributes: ['url'],
          limit: 1
        }],
      });

      const reviewAverages = await Review.findAll({
          attributes: ['spotId', [fn('SUM', col('stars')), 'sumStars'], [fn('COUNT', col('stars')), 'reviewCount']],
          group: ['spotId']
      });

      const avgRateMap = {};
      reviewAverages.forEach( reviewAverage => {
          const { spotId, sumStars, reviewCount } = reviewAverage.dataValues;
          const avgRating = sumStars / reviewCount;
          avgRateMap[spotId] = avgRating;
      });

      const responseData = spots.map(spot => {
          const spotObj = spot.get();

          delete spotObj.Images;

          return {
              ...spotObj,
              createdAt: formatDate(spot.createdAt),
              updatedAt: formatDate(spot.updatedAt),
              avgRating: avgRateMap[spot.id] || 1,
              previewImage: spot.Images[0]?.url || null
          }
      });

      res.json({ Spots: responseData });
  } catch (error) {
    console.error('Error fetching spot:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  };


});

//~GET REVIEWS FOR CURR USER
//! require auth
router.get('/reviews', requireAuth, async (req, res) => {
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



module.exports = router;
