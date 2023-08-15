const session = require('express-session');
const MongoStore = require('connect-mongo')

module.exports = app => {
  app.set('trust proxy', 1);

  // use session
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Curated",
        }),
      cookie: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production' ? true : false,
        httpOnly: true,
        maxAge: 48 * 60 * 60 * 1000
      }
    })
  );
};
