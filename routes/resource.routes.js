const express = require('express');
const Bucket = require('../models/Bucket.model');
const Resource = require('../models/Resource.model');
const { isLoggedIn, isLoggedOut } = require('../middleware/route.guard');
const { getMessage, isEmpty, isLink, getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeTitle } = require('./utils');
const router = express.Router();


// Page for adding a resource to a bucket
router.get('/:bucketId/add', isLoggedIn, async (req, res) => {
  const { bucketId } = req.params
  try {
    const bucket = await Bucket.findById(bucketId).populate('resources');
    if (req.session.currentUser._id === bucket.owner._id.toString()) {
      bucket['videoCount'] = bucket.resources.length
      res.render('resources/new-resource', {bucket})
    }
    else {
      res.redirect('/feed/all')
    }
    
  }catch(error){
    const message = getMessage(error);
    console.log(message);
    res.render('resources/new-resource', { active: 'buckets' });
  }
})

// Adding a resource to a bucket
router.post('/:bucketId/add', async (req, res) => {
  const { bucketId } = req.params

  const oldBucket = await Bucket.findById(bucketId).populate("resources");
  if (!oldBucket) {
    const message = getMessage("Invalid bucket to associate videos")
    return res.render('resources/new-resource', { message, active: 'buckets' });
  }
  try {

    const videoURLs = JSON.parse(req.body.videos);

    if(!videoURLs.length){
      const message = getMessage("No link was provided");
      return res.render('resources/new-resource', { message, bucket:oldBucket, active: 'buckets' });
    }

    videoURLs.forEach(link => {
      if (!isLink(link)) {
        const message = getMessage('Invalid link');
        return res.render('resources/new-resource', { message, bucket:oldBucket, active: 'buckets' })
      }
    })

    //Creating multiple videos
    const videosIDs = await Promise.all(videoURLs.map(async (link) => {

      const url = getYouTubeEmbedUrl(link);
      const thumbnailUrl = getYouTubeThumbnailUrl(link)
      const videoTitle = await getYouTubeTitle(link)

      const resource = await Resource.create({ url, thumbnail: thumbnailUrl, videoTitle });
      return resource._id
    }));
  

    const bucketResources = oldBucket.resources;
    const updatedResources = [...videosIDs, ...bucketResources]
    const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, { resources: updatedResources }, { new: true });

    return res.redirect(`/buckets/${bucketId}/details`)

  } catch (error) {
    const message = getMessage(error);
    console.log(message);
    res.render('resources/new-resource')
  }
});


router.post('/:bucketId/:id/delete', async (req, res) => {
  const { bucketId, id } = req.params;

  const bucket = await Bucket.findById(bucketId).populate('resources');
  if (!bucket) {
    return res.redirect('/buckets/all');
  }

  try {
    // Find the index of the video to be removed
    const resourceIndex = bucket.resources.findIndex(resource => resource._id.equals(id));
    if (resourceIndex === -1) {
      return res.render(`buckets/bucket-details`, { bucket });
    }

    // Remove the resource ID from the bucket's resources array
    bucket.resources.splice(resourceIndex, 1);

    // Save the updated bucket
    const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, { resources: bucket.resources }, { new: true }).populate('resources')

    // Delete the video document
    await Resource.findByIdAndDelete(id);
    const message = getMessage('Video removed successfully', 'success')

    res.redirect(`/buckets/${bucketId}/details`);
  } catch (err) {
    const message = getMessage(err);
    console.log(message);
    res.render('/buckets/details', {bucket });
  }
})

module.exports = router