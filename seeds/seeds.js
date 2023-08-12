const mongoose = require('mongoose')
const Bucket = require('../models/Bucket.model')
const Resource = require('../models/Resource.model')

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Curated";

const buckets = [
    {
      name: "How I learned to play guitar like a pro",
      description: "I've always dreamed of playing guitar. It's hard but thanks to these youtube resources, I can now hold my own around the bondfire.",
      upVote: [],
      downVote: [],
      resources: []
    },
    {
      name: "How I became my family's very own top chef",
      description: "I used to be awful at cooking. These resources helped me get into the motions and dust out my cooking pan. I'm now the designated cook for my family home parties.",
      upVote: [],
      downVote: [],
      resources: []
    },
    {
        name: "How I became my family's very own top chef",
        description: "I used to be awful at cooking. These resources helped me get into the motions and dust out my cooking pan. I'm now the designated cook for my family home parties.",
        upVote: [],
        downVote: [],
        resources: []
    },
    {
        name: "How I became my family's very own top chef",
        description: "I used to be awful at cooking. These resources helped me get into the motions and dust out my cooking pan. I'm now the designated cook for my family home parties.",
        upVote: [],
        downVote: [],
        resources: []
    },
    {
        name: "How I became my family's very own top chef",
        description: "I used to be awful at cooking. These resources helped me get into the motions and dust out my cooking pan. I'm now the designated cook for my family home parties.",
        upVote: [],
        downVote: [],
        resources: []
    },
    {
        name: "How I became my family's very own top chef",
        description: "I used to be awful at cooking. These resources helped me get into the motions and dust out my cooking pan. I'm now the designated cook for my family home parties.",
        upVote: [],
        downVote: [],
        resources: []
    },
    {
        name: "How I became my family's very own top chef",
        description: "I used to be awful at cooking. These resources helped me get into the motions and dust out my cooking pan. I'm now the designated cook for my family home parties.",
        upVote: [],
        downVote: [],
        resources: []
    }
  ];

const resources = [
    {
      title: "Guitar 101",
      type: "Video",
      rating: 4,
      url: "https://www.youtube.com/watch?v=BBz-Jyr23M4&ab_channel=AndyGuitar",
      thumbnail: "https://img.youtube.com/vi/BBz-Jyr23M4/0.jpg",
      review: "Such a great video to get started"
    },
    {
        title: "How to choose your guitar",
        type: "Video",
        rating: 3,
        url: "https://www.youtube.com/watch?v=r2vpU3hgbRs&ab_channel=PaulDavids",
        thumbnail: "https://img.youtube.com/vi/r2vpU3hgbRs/0.jpg",
        review: "Such a great video to get started"
    }
  ];

mongoose
  .connect(MONGO_URI)
  .then((x) => {
    return Resource.insertMany(resources);
  })
  .then((x) => {
    return Bucket.insertMany(buckets)
  })
  .catch((err) => {
    console.log(`An error occurred while creating books from the DB: ${err}`);
  });