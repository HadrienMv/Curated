const session = require('express-session');

module.exports = app => {
  app.set('trust proxy', 1);

  // use session
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: false,
      proxy: true,
      name: 'Curated-application-cookie',
      cookie: {
        sameSite: 'none',
        secure: true,
        httpOnly: true,
        maxAge: 48 * 60 * 60 * 1000
      }
    })
  );
};
