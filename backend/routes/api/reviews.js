//^ backend/routes/api/reviews.js
const express = require('express');
const { requireAuth, checkOwnership } = require('../../utils/auth');
const { Spot, Image, Review, User } = require('../../db/models');
const { check } = require('express-validator');
const formatDate = require('../api/utils/date-formatter');

const router = express.Router();

//~EDIT A REVIEW
//! require auth and own
router.put('/:reviewId', requireAuth, checkOwnership(Review, 'reviewId', 'userId'),
async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.reviewId);

        if (!review) return res.status(404).json({ message: `review coudn't be found` });

        review.set({
            ...req.body
        });

        review.save({ validate: true });

        const reviewObj = review.get();
        reviewObj.createdAt = formatDate(reviewObj.createdAt);
        reviewObj.updatedAt = formatDate(reviewObj.updatedAt);

        res.json(reviewObj);
    } catch (error) {
        console.error('Error deleteing review:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

//~DELETE A REVIEW
//! requires auth and ownership
router.delete('/:reviewId', requireAuth, checkOwnership(Review, 'reviewId', 'userId'),
async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.reviewId);

        if (!review) return res.status(404).json({ message: `review coudn't be found` })

        review.destroy();

        res.json({ message: 'Successfully deleted' });

    } catch (error) {
        console.error('Error deleteing review:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})


module.exports = router;
