const express = require('express');
const Bucket = require('../models/Bucket.model');
const Resource = require('../models/Resource.model');
const {isLoggedIn, isLoggedOut} = require('../middleware/route.guard')
const router = express.Router();

/* GET home page */
router.get("/:userId", isLoggedIn, async (req, res, next) => {
    const {userId} = req.params;
    console.log('user id buckets ', userId);
    res.render('buckets/buckets')
});

module.exports = router;