const express = require('express');
const moment = require('moment')
const fileUploader = require('../config/cloudinary.config');
const Bucket = require('../models/Bucket.model');
const Resource = require('../models/Resource.model');
const { isLoggedIn, isLoggedOut } = require('../middleware/route.guard');
const User = require('../models/User.model');
const router = express.Router();

/* GET home page */
router.get("/", async (req, res, next) => {
  const allBuckets = await Bucket.find()
  res.render("index",{buckets:allBuckets});
});

// GET create buckets page
router.get("/create", isLoggedIn, async (req, res, next) => {
  User.findById(req.session.currentUser._id)
  .then(myUser => res.render("create", myUser))
})

router.get('/profile', isLoggedIn, (req, res, next) => {
  User.findById(req.session.currentUser._id)
  .then(myUser => {
    myUser['bucketsCount'] = myUser.buckets.length
    myUser['newDob'] = moment(myUser['dob']).format('MM-DD-YYYY')
    myUser['newCreatedAt'] = moment(myUser['createdAt']).format('MMMM YYYY')
    res.render('profile', myUser)
  })
})

router.get('/profile/edit', isLoggedIn, (req, res, next) => {
  User.findById(req.session.currentUser._id)
  .then(myUser => {
    myUser['bucketsCount'] = myUser.buckets.length
    myUser['newDob'] = moment(myUser['dob']).format('YYYY-MM-DD')
    myUser['newCreatedAt'] = moment(myUser['createdAt']).format('MMMM YYYY')
    res.render('profile-edit' , myUser)
  })
})

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

router.post('/update-picture', fileUploader.single('profilePic'), (req, res) => {
  User.findByIdAndUpdate(req.session.currentUser._id, {profilePic: req.file.path}, {new:true})
  .then(myUser => {
    myUser['bucketsCount'] = myUser.buckets.length
    myUser['newDob'] = moment(myUser['dob']).format('YYYY-MM-DD')
    myUser['newCreatedAt'] = moment(myUser['createdAt']).format('MMMM YYYY')
    res.render('profile', myUser)
  })
});

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