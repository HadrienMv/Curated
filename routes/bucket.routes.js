const express = require('express');
const Bucket = require('../models/Bucket.model');
const Resource = require('../models/Resource.model');
const User = require('../models/User.model')
const { isLoggedIn, isLoggedOut } = require('../middleware/route.guard');
const { getMessage, isEmpty, isLink, getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeTitle} = require('./utils');
const router = express.Router();
const bucketTags = ['business', 'lifestyle', 'food', 'arts', 'music', 'health']

//Display create form
router.get("/create", isLoggedIn, async (req, res, next) => {
    res.render('buckets/new-bucket')
});

// handle the creation of a new bucket with a movie
router.post("/create", isLoggedIn, async (req, res, next) => {

    const userId = getCurrentUser(req);

    const { bucketName, bucketDescription} = req.body
    
    let myTags = []
    bucketTags.forEach(tag => {
        if (req.body[tag] != undefined) {
            myTags.push(tag.toLowerCase())
        }
    })

    if (isEmpty(bucketDescription) || isEmpty(bucketName)) {
        const message = getMessage('None of the fields can be empty');
        res.render('buckets/new-bucket', { message })
    }

    try {
        const newBucket = await Bucket.create({ name: bucketName, description: bucketDescription, tags: myTags, owner: userId });
        const myUser = await User.findByIdAndUpdate(userId, {$push : {"buckets": newBucket}}, {new: true})
        const userBuckets = await getAllUserBuckets(userId);
        const message = getMessage(`"${newBucket.name}" collection created successfully`, 'success')

        res.redirect(`/resources/${newBucket._id}/add`)
        
    } catch (error) {
        const message = getMessage(error);
        console.log(message);
        res.render('buckets/new-bucket')
    }
});

// Bucket details 
router.get('/:bucketId/details', isLoggedIn, async (req, res) => {
    const { bucketId } = req.params

    try {
        const bucket = await Bucket.findById(bucketId).populate('resources').populate('owner');

        if (req.session.currentUser._id === bucket.owner._id.toString()) {
            res.render('buckets/bucket-details', {bucket, active:'buckets'})
        } else {
            res.redirect('/feed/all')
        }
    } catch (error) {
        const message = getMessage(error);
        console.log(message)
        res.render('buckets/buckets', { active:'buckets'})
    }
})

//Bucket edit page 
router.get("/:bucketId/update", isLoggedIn, (req, res) => {
    const {bucketId} = req.params;

    try{
        Bucket.findById(bucketId).populate('resources')
        .then(bucket => {
            if (req.session.currentUser._id === bucket.owner._id.toString()) {
                bucketTags.forEach(tag => {
                    if (bucket.tags.includes(tag)) {
                        bucket[tag] = 'checked'
                    }
                    else {
                        bucket[tag] = ''
                    }
                })
                bucket['videoCount'] = bucket.resources.length
    
                res.render("buckets/edit-bucket", {bucket, active:'buckets'})
            } else {
                res.redirect('/feed/all')
            }
        })
    } catch(error){
        const message = getMessage(error);
        console.log(message)
        res.render('buckets/bucket-details', {active:'buckets'})
    }
})

//Handle updating bucket info
router.post("/:bucketId/update", isLoggedIn, async (req, res) => {
    const {bucketId} =  req.params
    const { name, description } = req.body

    let myTags = []
    bucketTags.forEach(tag => {
        if (req.body[tag] != undefined) {
            myTags.push(tag.toLowerCase())
        }
    })

    if (isEmpty(description) || isEmpty(name) ) {
        const message = getMessage('None of the fields can be empty');
        res.render('buckets/edit-bucket', { bucket:{name, description, _id:bucketId}, message, active:'buckets' })
        return
    }

    try {
        const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, {name, description, tags: myTags}, {new: true}).populate("resources");
        const message = getMessage(`"${updatedBucket.name}" collection updated successfully`, 'success');

        res.render('buckets/bucket-details', {bucket: updatedBucket, message, active:'buckets'})
    }catch(error){
        const message = getMessage(error);
        console.log(message)
        res.render('buckets/edit-bucket', { bucket:{name, description, _id:bucketId}, active:'buckets'})
    }
});


//Removing a bucket
router.post('/:bucketId/delete', isLoggedIn, async(req, res) => {
    const {bucketId} = req.params

    const bucket = await Bucket.findById(bucketId).populate('resources').populate('owner');

    if (!bucket) {
      return res.redirect('/buckets');
    }

    try {
        // Delete associated resources
        await Resource.deleteMany({ _id: { $in: bucket.resources } });
    
        // Delete the bucket
        await Bucket.findByIdAndDelete(bucketId)

        // Update user profile
        const user = await User.findById(req.session.currentUser._id)
        for (let i=0; i<user.buckets.length; i++) {
            if (user.buckets[i].toString() === bucketId) {
                user.buckets.pop(i)
            }
        }
        await User.findByIdAndUpdate(req.session.currentUser._id, {buckets: user.buckets}, {new: true})
    
        res.redirect('/buckets/all');
    } catch (err) {
        const message = getMessage(err);
        console.log(message)
        res.render('buckets/bucket-details', { bucket, active:'buckets' });
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
router.get('/:bucketId', (req, res) => {
    const { bucketId } = req.params
    try {
        Bucket.findById(bucketId).populate('resources').populate('owner')
        .then(bucket => {
            const currentUser = req.session.currentUser
            if (currentUser && currentUser._id === bucket.owner._id.toString()) {
                bucket['authentified'] = 'true'
            }
            res.render('buckets/bucket-details-view', {bucket, active:'buckets'})
        })

    } catch (error) {
        const message = getMessage(error);
        console.log(message);
        res.render('buckets/buckets', { active:'buckets'})
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


