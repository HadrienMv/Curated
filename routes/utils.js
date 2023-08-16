const express = require('express');
const router = express.Router();

const getMessage = (error, type = 'danger') => {
  if(typeof error === 'object'){
    return {type, content:error.message}
  }
  return {type, content:error}
}

const isEmpty = (value) => {
  return !value || value === ''
}

const isLink = (link) => {
  const validLinkRegex = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/
  return validLinkRegex.test(link);
}

function getYouTubeEmbedUrl(videoUrl) {
  const videoIdRegex = /(?:\/embed\/|\/watch\?v=|v=|\/\d{1,2}\/|\/u\/\w\/|\/embed\/|\/v\/|\/e\/|\/watch\?v=|v=|\/d{1,2}\/|\/u\/\w\/|\/v\/|\/e\/)([^#\&\?]*).*/;
  const match = videoUrl.match(videoIdRegex);
  if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null; // Invalid URL format
}

const getCurrentUser = (req) => {
  if (!req.session.currentUser) {
      return null
  }
  return req.session.currentUser._id;
}

function getYouTubeThumbnailUrl(videoUrl) {
  const videoIdRegex = /(?:\/embed\/|\/watch\?v=|v=|\/\d{1,2}\/|\/u\/\w\/|\/embed\/|\/v\/|\/e\/|\/watch\?v=|v=|\/d{1,2}\/|\/u\/\w\/|\/v\/|\/e\/)([^#\&\?]*).*/;
  const match = videoUrl.match(videoIdRegex);
  if (match && match[1]) {
      return `http://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return null; // Invalid URL format
}

function getYouTubeTitle(videoUrl) {
  const videoIdRegex = /(?:\/embed\/|\/watch\?v=|v=|\/\d{1,2}\/|\/u\/\w\/|\/embed\/|\/v\/|\/e\/|\/watch\?v=|v=|\/d{1,2}\/|\/u\/\w\/|\/v\/|\/e\/)([^#\&\?]*).*/;
  const match = videoUrl.match(videoIdRegex);
  if (match && match[1]) {
      fetch(`https://noembed.com/embed?dataType=json&url=http://www.youtube.com/watch?v=${match[1]}`)
      .then(res => res.text())
      .then(text => JSON.parse(text))
      .then(json => json.title)
  }
  return null; // Invalid URL format
}

module.exports = {
  getMessage, 
  isEmpty,
  isLink, 
  getYouTubeEmbedUrl,
  getCurrentUser,
  getYouTubeThumbnailUrl,
  getYouTubeTitle
}