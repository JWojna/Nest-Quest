//^ backend/routes/api/spots.js
const express = require('express');
const { Spot, Image, Review } = require('../../db/models');
const { Op } = require('sequelize');


const router = express.Router();


//~ GET ALL SPOTS
router.get('/', async (req, res) => {
    try {
        const previewImage = await Image.findAll({
            attributes: ['url'],
            where: {
                [Op.and]: [{ imageableType: 'spot' }, { preview: true }]
            },
        });

        previewUrl = JSON.stringify(previewImage)

        console.log(previewUrl, '==========');

        const spots = await Spot.findAll({
            include: {
                attributes: ['url'],
                model: Image,
                where: {
                    [Op.and]: [{ imageableType: 'spot'}, { preview: true }]
                },
            }
        });

        return res.json(spots);

    } catch (error) {
        console.error('Error fetching spots:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    };

});

module.exports = router;
