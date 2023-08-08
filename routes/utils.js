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



module.exports = {
  getMessage, 
  isEmpty,
  isLink, 
  getYouTubeEmbedUrl

}