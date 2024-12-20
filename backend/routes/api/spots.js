//^ backend/routes/api/spots.js
const express = require('express');
const { Spot, Image, Review } = require('../../db/models');
const { Op, fn, col } = require('sequelize');


const router = express.Router();

const formatDate = (date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date(date)).replace(/\/|, /g, '-');
  };



//~ GET ALL SPOTS
router.get('/', async (req, res) => {
    try {

        //^ get all spots including preview image data
        const spots = await Spot.findAll({
            include: [{
                model: Image,
                as: 'Images',
                where: { preview: true },
                attributes: ['url'],
                limit: 1
            }],
        });

        //^ get all associated review star ratings and avg them
        const reviewAverages = await Review.findAll({
            attributes: ['spotId', [fn('AVG', col('stars')), 'avgRating']],
            group: ['spotId']
        });

        //^ map avg agg to spotId
        const avgRateMap = {};
        reviewAverages.forEach( reviewAverage => {
            avgRateMap[reviewAverage.spotId] = reviewAverage.dataValues.avgRating;
        });

        const responseData = spots.map(spot => ({
            id: spot.id,
            owner: spot.ownerId,
            address: spot.address,
            city: spot.city,
            state: spot.state,
            country: spot.country,
            lat: spot.lat,
            lng: spot.lng,
            name: spot.name,
            descrpition: spot.descrpition,
            price: spot.price,
            createdAt: formatDate(spot.createdAt),
            updatedAt: formatDate(spot.updatedAt),
            avgRating: avgRateMap[spot.id] || 1,
            previewImage: spot.Images[0]?.url || null
        }));

        return res.json({ Spots: responseData });

    } catch (error) {
        console.error('Error fetching spots:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    };

});

module.exports = router;
