//^ backend/routes/api/spots.js
const express = require('express');
const { Op, fn, col } = require('sequelize');
const { Spot, Image, Review, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const formatDate = require('../api/utils/date-formatter');

const router = express.Router();

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

});

//~ GET REVIEWS BY SPOTID
router.get('/:spotId/reviews', async (req, res) => {

    const reviews = await Review.findAll({
        where: {
            spotId: req.params.spotId
        },
        include: [
            {
                model: Image,
                as: 'Images',
                attributes: ['id', 'url'],
            },
            {
                model: User,
                as: 'User',
                attributes: ['id', 'firstName', 'lastName'],
            },
        ],
    });

    const responseData = reviews.map(review => {
        const reviewObj = review.get();

        const reviewImages = reviewObj.Images.map( image => ({
            id: image.id,
            url: image.url,
        }));

        delete reviewObj.Images;

        return {
            ...reviewObj,
            createdAt: formatDate(review.createdAt),
            updatedAt: formatDate(review.updatedAt),
            User: reviewObj.User ? {
                id: reviewObj.User.id,
                firstName: reviewObj.User.firstName,
                lastName: reviewObj.User.lastName
            } : null,
            ReviewImages: reviewImages || null
        }
    });




    res.json({ Reviews: responseData })
})

//~ CREATE A SPOT
//! is allowing dupes
router.post('/', requireAuth, async (req, res) => {
    const spotData = req.body;



    try {
        const owner = await User.findByPk(req.user.id);

        const spot = await Spot.create({
            ownerId: owner.id,
            ...spotData
        });

        const spotObj = spot.get();

        spotObj.createdAt = formatDate(spotObj.createdAt);
        spotObj.updatedAt = formatDate(spotObj.updatedAt);

        res.status(201).json(spotObj);

    } catch (error) {
        console.error('Error creating spot:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

})





module.exports = router;
