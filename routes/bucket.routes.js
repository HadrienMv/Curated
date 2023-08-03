const express = require('express');
const Bucket = require('../models/Bucket.model');
const Resource = require('../models/Resource.model');
const isLoggedIn = require('../middleware/isLoggedIn');
const isLoggedOut = require('../middleware/isLoggedOut');
const router = express.Router();

/* GET home page */
router.get("/:userId", isLoggedIn, async (req, res, next) => {
    const {userId} = req.params;
    console.log('user id buckets ', userId);
    res.render('buckets/buckets')
});

module.exports = router;