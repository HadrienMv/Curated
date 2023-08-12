
const isLoggedIn = (req, res, next) => {
  if (!req.session.currentUser) {
    console.log('Not actually logged in')
    return res.redirect('/login');
  }
  console.log(`Req.session = ${req.session}`)
  console.log(`Req.app.locals.currentUser = ${req.app.locals.currentUser}`)
  next();
};

const isLoggedOut = (req, res, next) => {
  if (req.session.currentUser) {
    return res.redirect('/');
  }
  next();
};

module.exports = {
  isLoggedIn,
  isLoggedOut
};
