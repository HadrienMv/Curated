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


module.exports = {
  getMessage, 
  isEmpty,
  isLink

}