const express = require('express');
const Bucket = require('../models/Bucket.model');
const Resource = require('../models/Resource.model');
const { isLoggedIn, isLoggedOut } = require('../middleware/route.guard');
const { getMessage, isEmpty, isLink, getYouTubeEmbedUrl } = require('./utils');
const router = express.Router();


router.get('/:bucketId/add', isLoggedIn, async (req, res) => {
  const {bucketId} = req.params
  try{
    const bucket = await Bucket.findById(bucketId);
    res.render('resources/new-resource', bucket)
  }catch(error){
    const message = getMessage(error);
    res.render('resources/new-resource', {message, active: 'buckets'});
  }
})


router.post('/:bucketId/add', async (req, res) => {
  const { bucketId } = req.params;
  const { isText, link, title } = req.body

  if(isEmpty(title) || isEmpty(link)){
    const message = getMessage('None of the fields can be empty');
    res.render('resources/new-resource', {message, active: 'buckets'})
}

  if (!isLink(link)) {
    const message = getMessage('Invalid link to resource');
    res.render('resources/new-resource', { message, active: 'buckets' })
  }

  try {
    const type  = !isText ? 'video' : 'text'
    let url = link;

    if(!isText){
        url = getYouTubeEmbedUrl(link);
    }
    
    const oldBucket = await Bucket.findById(bucketId);
    const bucketResources = oldBucket.resources;
    const resource = await Resource.create({title, url, type});
    const updatedResources = [resource._id, ...bucketResources]
    const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, {resources:updatedResources}, {new: true}).populate('resources')
    const message = getMessage(`${resource.title} added successfully`,'success');
   
    res.render('buckets/bucket-details', {bucket:updatedBucket, message, active: 'buckets'})
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
    const updatedBucket = await Bucket.findByIdAndUpdate(bucketId, {resources: bucket.resources})

    // Delete the video document
    await Resource.findByIdAndDelete(id);

    res.render(`buckets/bucket-details`, {bucket: updatedBucket});
  } catch (err) {
    const message = getMessage(err);
    res.render('buckets/details', {message, bucket});
  }
})

module.exports = router