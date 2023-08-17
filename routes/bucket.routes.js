const express = require('express');
const Bucket = require('../models/Bucket.model');
const Resource = require('../models/Resource.model');
const User = require('../models/User.model')
const { isLoggedIn, isLoggedOut } = require('../middleware/route.guard');
const { getMessage, isEmpty, isLink, getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeTitle} = require('./utils');
const router = express.Router();

//Display create form
router.get("/create", isLoggedIn, async (req, res, next) => {
    res.render('buckets/new-bucket')
});

// handle the creation of a new bucket with a movie
router.post("/create", isLoggedIn, async (req, res, next) => {

    const userId = getCurrentUser(req);

    const { bucketName, bucketDescription, resourceLink} = req.body
    
    const bucketTags = ['business', 'lifestyle', 'food', 'arts', 'music', 'health']
    let myTags = []
    bucketTags.forEach(tag => {
        if (req.body[tag] != undefined) {
            myTags.push(tag.toLowerCase())
        }
    })

    console.log(myTags)

    if (isEmpty(bucketDescription) || isEmpty(bucketName) || isEmpty(resourceLink)) {
        const message = getMessage('None of the fields can be empty');
        res.render('buckets/new-bucket', { message })
    }

    if (!isLink(resourceLink)) {
        const message = getMessage('Invalid link');
        res.render('buckets/new-bucket', { message })
    }

    try {
        let url = resourceLink;
        url = getYouTubeEmbedUrl(resourceLink);
        thumbnail = getYouTubeThumbnailUrl(resourceLink)
        videoTitle = await getYouTubeTitle(resourceLink)
        console.log('video title ', videoTitle); 

        const newResource = await Resource.create({url, thumbnail, videoTitle});
        const newBucket = await Bucket.create({ name: bucketName, description: bucketDescription, tags: myTags, resources: [newResource._id], owner: userId });
        const myUser = await User.findByIdAndUpdate(userId, {$push : {"buckets": newBucket}}, {new: true})
        const userBuckets = await getAllUserBuckets(userId);
        const message = getMessage(`${newBucket.name} created successfully`, 'success')

        res.render('buckets/buckets', { message, buckets: userBuckets })
        
    } catch (error) {
        const message = getMessage(error);
        res.render('buckets/new-bucket', { message })
    }
});

// Bucket details 
router.get('/:bucketId/details', isLoggedIn, async (req, res) => {
    const { bucketId } = req.params
    try {
        const bucket = await Bucket.findById(bucketId).populate('resources').populate('owner');
        
        res.render('buckets/bucket-details', {bucket, active:'buckets'})
    } catch (error) {
        const message = getMessage(error);
        res.render('buckets/buckets', { message, active:'buckets'})
    }
})

//Bucket edit page 
router.get("/:bucketId/update", isLoggedIn, async (req, res) => {
    const {bucketId} = req.params;

    try{
        const bucket = await Bucket.findById(bucketId);

        res.render("buckets/edit-bucket", {bucket, active:'buckets'})
    }catch(error){
        const message = getMessage(error);

        res.render('buckets/bucket-details', {message, active:'buckets'})
    }
})

//Handle updating bucket info
router.post("/:bucketId/update", isLoggedIn, async (req, res) => {
    const {bucketId} =  req.params 

    const { name, description } = req.body

    if (isEmpty(description) || isEmpty(name) ) {
        const message = getMessage('None of the fields can be empty');
        res.render('buckets/edit-bucket', { bucket:{name, description, _id:bucketId}, message, active:'buckets' })
        return
    }

    try {
        const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, {name, description}, {new: true}).populate("resources");
        const message = getMessage(`${updatedBucket.name} updated successfully`, 'success');

        res.render('buckets/bucket-details', {bucket: updatedBucket, message, active:'buckets'})
    }catch(error){
        const message = getMessage(error);
        res.render('buckets/edit-bucket', { bucket:{name, description, _id:bucketId}, message, active:'buckets'})
    }
});


//Removing a bucket
router.post('/:bucketId/delete', isLoggedIn, async(req, res) => {
    const {bucketId} = req.params

    const bucket = await Bucket.findById(bucketId).populate('resources');
    if (!bucket) {
      return res.redirect('/buckets');
    }

    try {
        // Delete associated resources
        await Resource.deleteMany({ _id: { $in: bucket.resources } });
    
        // Delete the bucket
        await Bucket.findByIdAndDelete(bucketId)
    
        res.redirect('/buckets/all');
      } catch (err) {
        const message = getMessage(err);
        res.render('buckets/bucket-details', { bucket, message, active:'buckets' });
      }
    
})

/* GET buckets main page */
router.get("/all", isLoggedIn, async (req, res, next) => {
    const userId = getCurrentUser(req);

    try {
        const buckets = await getAllUserBuckets(userId);
        res.render('buckets/buckets', { buckets , active:'buckets'})

    } catch (error) {
        const message = getMessage(error);
        res.render('buckets/buckets', { message, active:'buckets' })
    }
});

/* Upvote bucket */
router.get('/:bucketId/upvote', isLoggedIn, async (req, res, next) => {
    const {bucketId} =  req.params
    const myUser = req.session.currentUser;

    try {
        const myTest = await checkHasVoted(bucketId, myUser)

        if (!myTest) {
            const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, {$push : {"upVote": myUser}}, {new: true});
            res.redirect(req.originalUrl.slice(0, -7))
        }
        res.redirect(req.originalUrl.slice(0, -7))
        
    }catch(error){
        const message = getMessage(error);
        console.log(message)
    }
})

/* Downvote bucket */
router.get('/:bucketId/downvote', isLoggedIn, async (req, res, next) => {
    const {bucketId} =  req.params
    const myUser = req.session.currentUser;

    try {
        const myTest = await checkHasVoted(bucketId, myUser)

        if (!myTest) {
            const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, {$push : {"downVote": myUser}}, {new: true});
            res.redirect(req.originalUrl.slice(0, -9))
        }
        res.redirect(req.originalUrl.slice(0, -9))
        
    }catch(error){
        const message = getMessage(error);
        console.log(message)
    }
})

// Bucket details 
router.get('/:bucketId', async (req, res) => {
    const { bucketId } = req.params
    try {
        const bucket = await Bucket.findById(bucketId).populate('resources').populate('owner');
        
        res.render('buckets/bucket-details-view', {bucket, active:'buckets'})
    } catch (error) {
        const message = getMessage(error);
        res.render('buckets/buckets', { message, active:'buckets'})
    }
})

const getAllUserBuckets = (userId) => {
    return Bucket.find({ owner: userId }).populate('resources')
}

const getCurrentUser = (req) => {
    if (!req.session.currentUser) {
        return null
    }

    return req.session.currentUser._id;
}

const checkHasVoted = async (bucketId, user) => {
    const bucket = await Bucket.findById(bucketId)
    const upvotes = getArrayOfIds(bucket.upVote)
    const downvotes = getArrayOfIds(bucket.downVote)
    if (upvotes.includes(user._id) || downvotes.includes(user._id)) {
        return true
    }
    else {
        return false
    }
}

const getArrayOfIds = (objects) => {
    const result = []
    objects.forEach(object => result.push(object.toString()))
    return result
}

module.exports = router;


