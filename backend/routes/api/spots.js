//^ backend/routes/api/spots.js
const express = require('express');
const { Spot } = require('../../db/models')

const router = express.Router();


//~ GET ALL SPOTS
router.get('/', async (req, res) => {
    console.log(req);
    console.log('GET /api/spots');
    try {
        const spots = await Spot.findAll();
        console.log(spots);

        return res.json(spots);

    } catch (error) {
        console.error('Error fetching spots:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    };

});

module.exports = router;
