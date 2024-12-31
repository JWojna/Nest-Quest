const express = require('express');
const { Spot, Image, Review, User, Booking } = require('../../db/models');
const { requireAuth, checkOwnership } = require('../../utils/auth');
const formatDate = require('../api/utils/date-formatter');


const router = express.Router();

//^ get curr date for checks
const currDate = new Date();

//~EDIT A BOOKING
//! require auth and ownership
router.put('/:bookingId', requireAuth, checkOwnership(Booking, 'bookingId', 'userId'),
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
