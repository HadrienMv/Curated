const express = require('express');
const moment = require('moment')
const fileUploader = require('../config/cloudinary.config');
const Bucket = require('../models/Bucket.model');
const Resource = require('../models/Resource.model');
const User = require('../models/User.model');
const { isLoggedIn, isLoggedOut } = require('../middleware/route.guard');
const router = express.Router();

/* GET home page */
router.get("/", async (req, res, next) => {
  const allBuckets = await Bucket.find().populate('owner').populate('resources')
  allBuckets.forEach(bucket => {
    bucket['newCreatedAt'] = moment(bucket['createdAt']).format('MM-DD-YYYY')
    bucket['videoCount'] = bucket['resources'].length
    bucket['upVoteCount'] = bucket['upVote'].length
    bucket['downVoteCount'] = bucket['downVote'].length
  })
  res.render("index",{buckets:allBuckets});
});

// GET create buckets page
router.get("/create", isLoggedIn, async (req, res, next) => {
  User.findById(req.session.currentUser._id)
  .then(myUser => res.render("create", myUser))
})

// GET profile page
router.get('/profile', isLoggedIn, (req, res, next) => {
  User.findById(req.session.currentUser._id)
  .then(myUser => {
    myUser['bucketsCount'] = myUser.buckets.length
    myUser['newDob'] = moment(myUser['dob']).format('MM-DD-YYYY')
    myUser['newCreatedAt'] = moment(myUser['createdAt']).format('MMMM YYYY')
    res.render('profile', myUser)
  })
})

// GET profile edit page
router.get('/profile/edit', isLoggedIn, (req, res, next) => {
  User.findById(req.session.currentUser._id)
  .then(myUser => {
    myUser['bucketsCount'] = myUser.buckets.length
    myUser['newDob'] = moment(myUser['dob']).format('YYYY-MM-DD')
    myUser['newCreatedAt'] = moment(myUser['createdAt']).format('MMMM YYYY')
    res.render('profile-edit' , myUser)
  })
})

// POST profile edits
router.post('/profile/edit', isLoggedIn, (req, res, next) => {
  const {email, interests, location, dob, aboutMe} = req.body
  const message = {
    type: 'success',
    content: 'Updated successfully'
  }
  User.findByIdAndUpdate({_id : req.session.currentUser._id}, {email:email, interests:interests, location:location, dob:dob, aboutMe: aboutMe}, {new: true})
  .then(myUser => {
    myUser['message'] = message
    myUser['bucketsCount'] = myUser.buckets.length
    myUser['newDob'] = moment(myUser['dob']).format('YYYY-MM-DD')
    myUser['newCreatedAt'] = moment(myUser['createdAt']).format('MMMM YYYY')
    res.render('profile', myUser)
  })
})

// POST profile picture update
router.post('/update-picture', fileUploader.single('profilePic'), (req, res) => {
  User.findByIdAndUpdate(req.session.currentUser._id, {profilePic: req.file.path}, {new:true})
  .then(myUser => {
    myUser['bucketsCount'] = myUser.buckets.length
    myUser['newDob'] = moment(myUser['dob']).format('YYYY-MM-DD')
    myUser['newCreatedAt'] = moment(myUser['createdAt']).format('MMMM YYYY')
    res.render('profile', myUser)
  })
});

// GET profile deletion modal
router.get('/profile/delete', isLoggedIn, (req, res, next) => {
  User.findByIdAndDelete(req.session.currentUser._id)
  .then(result => {
    message = {
      type : 'danger',
      content: 'User deleted successfully'
    }
    req.app.locals.currentUser = null;
    res.render('auth/login', {message})
    })
})

module.exports = router;