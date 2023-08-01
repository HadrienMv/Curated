const express = require('express');
const Bucket = require('../models/Bucket.model');
const Resource = require('../models/Resource.model');
const isLoggedIn = require('../middleware/isLoggedOut');
const isLoggedOut = require('../middleware/isLoggedIn');
const router = express.Router();

/* GET home page */
router.get("/", async (req, res, next) => {
  const allBuckets = await Bucket.find()
  res.render("index",{buckets:allBuckets});
});

module.exports = router;