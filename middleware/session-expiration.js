module.exports = (req, res, next) => {
  if(!req.session.currentUser && req.app.locals.currentUser){
    delete req.app.locals.currentUser
  }
  next();
};
