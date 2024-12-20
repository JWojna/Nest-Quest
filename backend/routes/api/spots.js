//^ backend/routes/api/spots.js
const express = require('express');
const { Spot, Image, Review } = require('../../db/models');
const { Op, where } = require('sequelize');


const router = express.Router();


//~ GET ALL SPOTS
router.get('/', async (req, res) => {
    try {
        // const previewImage = await Image.findAll({
        //     attributes: ['url', 'id'],
        //     where: {
        //         [Op.and]: [{ imageableType: 'spot' }, { preview: true }]
        //     },
        // });
        // previewUrl = JSON.stringify(previewImage)
        // console.log(previewImage.id, '==========');
        const spots = await Spot.findAll({
            include: [{
                model: Image,
                as: 'Images',
                where: { preview: true },
                attributes: ['url'],
                limit: 1
            }]
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
            createdAt: spot.createdAt,
            updatedAt: spot.updatedAt,
            previewImage: spot.Images[0]?.url || null
        }));

        return res.json({ Spots: responseData });

    } catch (error) {
        console.error('Error fetching spots:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    };

});

module.exports = router;
