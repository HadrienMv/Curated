const express = require('express');
const Bucket = require('../models/Bucket.model');
const Resource = require('../models/Resource.model');
const { isLoggedIn, isLoggedOut } = require('../middleware/route.guard');
const { getMessage, isEmpty, isLink, getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeTitle } = require('./utils');
const router = express.Router();


// Page for adding a resource to a bucket
router.get('/:bucketId/add', isLoggedIn, async (req, res) => {
  const {bucketId} = req.params
  try{
    const bucket = await Bucket.findById(bucketId).populate('resources');
    bucket['videoCount'] = bucket.resources.length
    res.render('resources/new-resource', bucket)
  }catch(error){
    const message = getMessage(error);
    res.render('resources/new-resource', {message, active: 'buckets'});
  }
})

// Adding a resource to a bucket
router.post('/:bucketId/add', async (req, res) => {
  const { bucketId } = req.params;
  const { link } = req.body

  if(isEmpty(link)){
    const message = getMessage('The link field cannot be empty');
    res.render('resources/new-resource', {message, active: 'buckets'})
}

  if (!isLink(link)) {
    const message = getMessage('Invalid link');
    res.render('resources/new-resource', { message, active: 'buckets' })
  }

  try {
    let url = link;
    
    url = getYouTubeEmbedUrl(link);
    thumbnailUrl = getYouTubeThumbnailUrl(link)
    videoTitle = await getYouTubeTitle(link)
    console.log('title of video ', videoTitle);
    
    const oldBucket = await Bucket.findById(bucketId);
    const bucketResources = oldBucket.resources;
    const resource = await Resource.create({url, thumbnail: thumbnailUrl, videoTitle});
    const updatedResources = [resource._id, ...bucketResources]
    const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, {resources:updatedResources}, {new: true})
    const message = getMessage(`Video added successfully`,'success');
   
    res.redirect(`/buckets/${bucketId}/details`)
  }
  catch (error) {
    const message = getMessage(error);
    res.render('resources/new-resource', {message})
  }
});


router.post('/:bucketId/:id/delete', async(req, res) => {
  const {bucketId, id} = req.params;

  const bucket = await Bucket.findById(bucketId).populate('resources');
  if (!bucket) {
    return res.redirect('/buckets/all');
  }
  
  try {
    // Find the index of the video to be removed
    const resourceIndex = bucket.resources.findIndex(resource => resource._id.equals(id));
    if (resourceIndex === -1) {
      return res.render(`buckets/bucket-details`, {bucket});
    }
    
    // Remove the resource ID from the bucket's resources array
    bucket.resources.splice(resourceIndex, 1);

    // Save the updated bucket
    const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, {resources: bucket.resources}, {new:true}).populate('resources')

    // Delete the video document
    await Resource.findByIdAndDelete(id);
    const message = getMessage('Video removed successfully', 'success')

    res.redirect(`/buckets/${bucketId}/details`);
  } catch (err) {
    const message = getMessage(err);
    res.render('/buckets/details', {message, bucket});
  }
})

module.exports = router