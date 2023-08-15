const express = require('express');
const Bucket = require('../models/Bucket.model');
const Resource = require('../models/Resource.model');
const User = require('../models/User.model')
const { isLoggedIn, isLoggedOut } = require('../middleware/route.guard');
const { getMessage, isEmpty, isLink, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } = require('./utils');
const router = express.Router();

//Display create form
router.get("/create", isLoggedIn, async (req, res, next) => {
    res.render('buckets/new-bucket')
});

// handle the creation of a new bucket with a movie
router.post("/create", isLoggedIn, async (req, res, next) => {

    const userId = getCurrentUser(req);

    const { bucketName, bucketDescription, resourceName, resourceLink, isText } = req.body

    if (isEmpty(bucketDescription) || isEmpty(bucketName) || isEmpty(resourceLink) || isEmpty(resourceName)) {
        const message = getMessage('None of the fields can be empty');
        res.render('buckets/new-bucket', { message })
    }

    if (!isLink(resourceLink)) {
        const message = getMessage('Invalid link to resource');
        res.render('buckets/new-bucket', { message })
    }

    try {
        const type = !isText ? 'video' : 'text'
        let url = resourceLink;

        if (!isText) {
            url = getYouTubeEmbedUrl(resourceLink);
            thumbnailUrl = getYouTubeThumbnailUrl(resourceLink)
        }

        const newResource = await Resource.create({ title: resourceName, url, type, thumbnail: thumbnailUrl});
        const newBucket = await Bucket.create({ name: bucketName, description: bucketDescription, resources: [newResource._id], owner: userId });
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
        const bucket = await Bucket.findById(bucketId).populate('resources');
        res.render('buckets/bucket-details', {bucket})
    } catch (error) {
        const message = getMessage(error);
        res.render('buckets/buckets', { message })
    }
})

//Bucket edit page 
router.get("/:bucketId/update", isLoggedIn, async (req, res) => {
    const {bucketId} = req.params;

    try{
        const bucket = await Bucket.findById(bucketId);

        res.render("buckets/edit-bucket", {bucket})
    }catch(error){
        const message = getMessage(error);

        res.render('buckets/bucket-details', {message})
    }
})

//Handle updating bucket info
router.post("/:bucketId/update", isLoggedIn, async (req, res) => {
    const {bucketId} =  req.params 

    const { name, description } = req.body

    if (isEmpty(description) || isEmpty(name) ) {
        const message = getMessage('None of the fields can be empty');
        res.render('buckets/edit-bucket', { bucket:{name, description, _id:bucketId}, message })
        return
    }

    try {
        const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, {name, description}, {new: true}).populate("resources");
        const message = getMessage(`${updatedBucket.name} updated successfully`, 'success');

        res.render('buckets/bucket-details', {bucket: updatedBucket, message})
    }catch(error){
        const message = getMessage(error);
        res.render('buckets/edit-bucket', { bucket:{name, description, _id:bucketId}, message})
    }
});


//Removing a bucket
router.post('/:bucketId/delete', async(req, res) => {
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
        res.render('buckets/bucket-details', { bucket, message });
      }
    
})

/* GET buckets main page */
router.get("/all", isLoggedIn, async (req, res, next) => {
    const userId = getCurrentUser(req);

    try {

        const buckets = await getAllUserBuckets(userId);
        res.render('buckets/buckets', { buckets })

    } catch (error) {
        const message = getMessage(error);
        res.render('buckets/buckets', { message })
    }
});

/* Upvote bucket */
router.get('/:bucketId/upvote', isLoggedIn, async (req, res, next) => {
    const {bucketId} =  req.params
    const myUser = req.session.currentUser;

    try {
        const myTest = await checkHasVoted(bucketId, myUser)
        console.log(myTest)

        if (myTest) {
            const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, {$push : {"upVote": myUser}}, {new: true});
            res.redirect('/')
        }
        res.redirect('/')
        
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
        console.log(myTest)

        if (myTest) {
            const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, {$push : {"downVote": myUser}}, {new: true});
            res.redirect('/')
        }
        res.redirect('/')
        
    }catch(error){
        const message = getMessage(error);
        console.log(message)
    }
})

const getAllUserBuckets = (userId) => {
    return Bucket.find({ owner: userId })
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
        return false
    }
    else {
        return true
    }
}

const getArrayOfIds = (objects) => {
    const result = []
    objects.forEach(object => result.push(object.toString()))
    return result
}

module.exports = router;


