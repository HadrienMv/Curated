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
    res.render('resources/new-resource', {message});
  }
})


router.post('/:bucketId/add', async (req, res) => {
  const { bucketId } = req.params;
  const { isText, link, title } = req.body

  if(isEmpty(title) || isEmpty(link)){
    const message = getMessage('None of the fields can be empty');
    res.render('resources/new-resource', {message})
}


  if (!isLink(link)) {
    const message = getMessage('Invalid link to resource');
    res.render('resources/new-resource', { message })
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
    updatedBucket['message']=message;
    res.render('buckets/bucket-details', updatedBucket)
  }
  catch (error) {
    const message = getMessage(error);
    res.render('resources/new-resource', {message})
  }
})

module.exports = router