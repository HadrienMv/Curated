const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const SALTROUNDS = 10;

const User = require("../models/User.model");

//middlewares
const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");

//create a new user 
router.get("/register", isLoggedOut, (req, res) => {
  console.log("requesting signup")
  res.render("auth/signup");
});

// POST /auth/signup
router.post("/register", isLoggedOut, async (req, res, next) => {
  const { username, email, password, confirmPassword, aboutMe, interests, location, dob } = req.body;

  // Checking if any of the mandatory fields are emtpy
  if (isEmpty(email) || isEmpty(password)) {
    const message = {
      type: 'danger',
      content: 'Email or password cannot be empty.'
    }
    res.status(400).render("auth/signup", { message });

    return;
  }

  // Checking to see if passwords match 
  if (!isMatch(password, confirmPassword)) {
    const message = {
      type: 'danger',
      content: 'Passwords do not match'
    }
    res.status(400).render("auth/signup", { message });

    return;
  }


  // checking is the password meets minimun criteria
  if (!isPasswordValid(password)) {
    const message = {
      type: 'danger',
      content: 'Password must be 6-16 characters-long and contain at least 1 special character (!@#$%^&*) and 1 number.'
    }
    return res.status(400).render('auth/signup', { message })
  }

  try {
    const SALT = await bcrypt.genSalt(SALTROUNDS);
    const passwordHashed = await bcrypt.hash(password, SALT);
    const newUser = await User.create({username, password: passwordHashed, email, aboutMe, interests, location, dob })
    const message = {
      type: 'success',
      content: 'User created successfully. You can now log in.'
    }
    res.render('auth/login', { message });

  } catch (error) {
    const message = {
      type: 'danger',
    }
    if (error instanceof mongoose.Error.ValidationError) {
      message['content'] = error.message;
      res.status(500).render("auth/signup", { message });
    } else if (error.code === 11000) {
      message['content'] = "Username and email need to be unique. Provide a valid username or email."
      res.status(500).render("auth/signup", { message });
    } else {
      next(error);
    }
  }
});

// GET /auth/login
router.get("/login", isLoggedOut, (req, res) => {
  res.render("auth/login");
});

// POST /auth/login
router.post("/login", isLoggedOut, async (req, res, next) => {
  const { email, password } = req.body;

  // Check that username, email, and password are provided
  if (isEmpty(email) || isEmpty(password)) {
    const message = {
      type: 'danger',
      content: 'Email or password cannot be empty.'
    }

    res.status(400).render("auth/login", { message });
    return;
  }

  // checking is the password meets minimun criteria
  if (!isPasswordValid(password)) {
    const message = {
      type: 'danger',
      content: 'Incorrect email or password'
    }
    return res.status(400).render('auth/login', { message })
  }

  try {
    //Find a user with the email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Incorrect email or password')
    }
    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      throw new Error('Incorrect email or password')
    }

    req.session.currentUser = user.toObject();
    // Remove the password field
    delete req.session.currentUser.password;
    // setting the current user in the app locals
    req.app.locals.currentUser = user.toObject();

    res.redirect("/");

  } catch (error) {
    if (error.message) {
      const message = {
        type: 'danger',
        content: error.message
      }
      res.status(400)
        .render('auth/login', { message })
    }

    next(error)
  }
});

// GET /auth/logout
router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      const message = getError(err)
      res.status(500).render("auth/logout", {message});
      return;
    }
    req.app.locals.currentUser = null;
    res.redirect("/");
  });
});


//utility functions 
const isEmpty = (value) => {
  return !value || value === ''
}

const isMatch = (password1, password2) => {
  return password1 === password2;
}

const isPasswordValid = (password) => {
  const passwordValidatorRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
  return passwordValidatorRegex.test(password);
}

const getError = (error) => {
  return {type: 'danger', content:error.message}
}
module.exports = router;
