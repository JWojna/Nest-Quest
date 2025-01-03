const express = require('express');
const { Spot, Image, Review, User, Booking } = require('../../db/models');
const { requireAuth, checkOwnership } = require('../../utils/auth');
const formatDate = require('../api/utils/date-formatter');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateBooking = [
  check('startDate')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isDate()
    .withMessage('startDate cannot be in the past'), //? custom validators?
  check('endDate')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isDate()
    .withMessage('endDate cannot be on or before startDate'), //? custom validators?
  handleValidationErrors
];


const router = express.Router();

//^ get curr date for checks
const currDate = new Date();

//~GET BOOKINGS BY CURR USER
//! req auth
router.get('/current', requireAuth, async (req, res) => {
    //^ date extractor
    const extractDate = (formattedDate) => { return formattedDate.split(' ')[0]; };

    try {
      const bookings = await Booking.findAll({
        where: { userId: req.user.id },
        include: [{
            model: Spot,
            attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
            include: [{
              model: Image,
              as: 'Images',
              attributes: ['url'],
              limit: 1,
            }],
          },
        ],
      });

      if (!bookings) {
        return res.status(404).json({ error: `No bookings found`});
      };

      const responseData = bookings.map( booking => {
        const { Spot, Images, startDate, endDate, createdAt, updatedAt, userId,  ...bookingData } = booking.get();

        return {
          ...bookingData,
          createdAt: formatDate(createdAt),
          updatedAt: formatDate(updatedAt),
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
          userId: booking.userId,
          startDate: extractDate(formatDate(startDate)),
          endDate: extractDate(formatDate(endDate)),
          createdAt: formatDate(createdAt),
          updatedAt: formatDate(updatedAt),
        };

      });

      res.json({'Bookings': responseData })
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
})

//~EDIT A BOOKING
//! require auth and ownership
router.put('/:bookingId', requireAuth, checkOwnership(Booking, validateBooking, 'bookingId', 'userId'),
async (req, res) => {
    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) return res.status(404).json({ 'message': `Booking couildn't be found` });

    try {
        booking.set({
            ...req.body
        });

        booking.save({ validate: true });

        const responseData = booking.get()
        responseData.startDate = formatDate(responseData.startDate).split(' ')[0];
        responseData.endDate = formatDate(responseData.endDate).split(' ')[0];
        responseData.createdAt = formatDate(responseData.createdAt);
        responseData.updatedAt = formatDate(responseData.updatedAt);

        const resRemodel = {
            id: responseData.id,
            spotId: responseData.spotId,
            userId: responseData.userId,
            startDate: responseData.startDate,
            endDate: responseData.endDate,
            createdAt: responseData.createdAt,
            updatedAt: responseData.updatedAt
          }

        res.json(resRemodel)
    } catch (error) {
        console.error('Error editing booking:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }


})


//~DELETE A BOOKING
//! req auth and ownership of booking
router.delete('/:bookingId', requireAuth, checkOwnership(Booking, 'bookingId', 'userId'),
async (req, res) => {
    const booking = await Booking.findByPk(req.params.bookingId);

    if (!booking) return res.status(404).json({ 'message': `Booking couildn't be found` });

    if (booking.startDate <= currDate && booking.endDate >= currDate) {
        return res.status(403).json({ 'message': `Bookings that have been started can't be deleted`});
    };


    try {
        booking.destroy();

        res.json({ 'message': 'Successfully deleted'})
    } catch (error) {
        console.error('Error deleteing booking:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

})


module.exports = router;
