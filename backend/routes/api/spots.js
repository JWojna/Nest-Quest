//^ backend/routes/api/spots.js
const express = require('express');
const { Spot, Image, Review, User } = require('../../db/models');
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
            attributes: ['spotId', [fn('SUM', col('stars')), 'sumStars'], [fn('COUNT', col('stars')), 'reviewCount']],
            group: ['spotId']
        });

        //^ map avg agg to spotId
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

        return res.json({ Spots: responseData });

    } catch (error) {
        console.error('Error fetching spots:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    };

});


//~ GET SPOT DETAILS BY SPOT ID
router.get('/:spotId', async (req, res) => {
    const spotId = req.params.spotId;
    try {
        const spot = await Spot.findByPk(spotId);

        const owner = await User.findByPk(spot.ownerId)

        const spotImages = await Image.findAll({
            where: {
                imageableType: 'spot',
                imageableId: spotId
            }
        })

        const reviews = await Review.findAll({
            where: { spotId: spotId},
            attributes: ['spotId', [fn('SUM', col('stars')), 'sumStars'], [fn('COUNT', col('stars')), 'reviewCount']],
            group: ['spotId']
        });

        let sumStars;
        let reviewCount;

        const  { sumStars: totalStars, reviewCount: totalCount } = reviews[0].dataValues;
        sumStars = totalStars;
        reviewCount = totalCount;


        const { createdAt, updatedAt, ...spotData } = spot.get();

        const responseData = {
            ...spotData,
            createdAt: formatDate(spot.createdAt),
            updatedAt: formatDate(spot.updatedAt),
            numRatings: reviewCount,
            avgStarRating: sumStars / reviewCount || null,
            spotImages: spotImages.map( image => ({
                id: image.id,
                url: image.url,
                preview: image.preview
            })) || null,
            Owner: {
                id: owner.id,
                firstName: owner.firstName,
                lastName: owner.lastName
            }
        }



        return res.json(responseData);
    } catch (error) {
        console.error('Error fetching spot:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

})





module.exports = router;
