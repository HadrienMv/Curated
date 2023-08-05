const express = require('express');
const Bucket = require('../models/Bucket.model');
const Resource = require('../models/Resource.model');
const {isLoggedIn, isLoggedOut} = require('../middleware/route.guard');
const { getMessage, isEmpty, isLink } = require('./utils');
const router = express.Router();


router.get("/create", isLoggedIn, async (req, res, next) => {
    res.render('buckets/new-bucket')
});

router.post("/create", isLoggedIn, async (req, res, next) => {

    const userId = getCurrentUser(req);

    const {bucketName, bucketDescription, resourceName, resourceLink, isText} = req.body

    if(isEmpty(bucketDescription) || isEmpty(bucketName) || isEmpty(resourceLink) || isEmpty(resourceName)){
        const message = getMessage('None of the fields can be empty');
        res.render('buckets/new-bucket', {message})
    }

    if(!isLink(resourceLink)){
        const message  = getMessage('Invalid link to resource');
        res.render('buckets/new-bucket', {message})
    }

    try{
        const type  = !isText ? 'video' : 'text'
        const newResource = await Resource.create({title:resourceName, url:resourceLink, type});
        const newBucket = await Bucket.create({name:bucketName, description:bucketDescription, resources:[newResource._id], owner:userId});
        const userBuckets = await getAllUserBuckets(userId);
        const message = getMessage(`${newBucket.name} created successfully`, 'success')
        res.render('buckets/buckets', {message, buckets:userBuckets} )
    }catch(error){
        const message = getMessage(error);
        res.render('buckets/new-bucket', {message})
    }
});

// Bucket details 
router.get('/:bucketId/details', isLoggedIn, async(req, res) => {
    const {bucketId} = req.params
    try{
        const bucket = await Bucket.findById(bucketId).populate('resources')
        res.render('buckets/bucket-details', {bucket})
    }catch(error){
        const message = getMessage(error);
        res.render('buckets/buckets', {message})
    }
})

/* GET buckets main page */
router.get("/all", isLoggedIn, async (req, res, next) => {
    const userId = getCurrentUser(req);
    console.log('user_')

    try{

        const buckets = await getAllUserBuckets(userId);
        res.render('buckets/buckets', {buckets})

    }catch(error){
        const message = getMessage(error);
        res.render('buckets/buckets', {message})
    }
    res.render('buckets/buckets')
});


const getAllUserBuckets = (userId)=> {
    return Bucket.find({owner:userId})
}

const getCurrentUser = (req) => {
    if(!req.session.currentUser){
        return null
    }

    return req.session.currentUser._id;
}

module.exports = router;


