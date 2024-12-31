const express = require('express');
const { Spot, Image, Review, User, Booking } = require('../../db/models');
const { requireAuth, checkOwnership } = require('../../utils/auth');
const formatDate = require('../api/utils/date-formatter');
const { json } = require('sequelize');

const router = express.Router();

//~EDIT A BOOKING
//! require auth and ownership


//~DELETE A BOOKING
//! req auth and ownership of booking
router.delete('/:bookingId', requireAuth, checkOwnership(Booking, 'bookingId', 'userId'),
async (req, res) => {
    const booking = await Booking.findByPk(req.params.bookingId);

    if (!booking) return res.status(404).json({ 'message': `Booking couildn't be found` });

    const currDate = new Date();

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
