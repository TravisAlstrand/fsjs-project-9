'use strict';
const bcrypt = require('bcryptjs');
const auth = require('basic-auth');
const { User } = require('../models');

// Middleware to authenticate the request using Basic Authentication
exports.authenticateUser = async (req, res, next) => {

  // store the message to display if errors occur
  let message;

  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  // if the user's credentials are available...
  if (credentials) {

    // find a user in db with a matching email address in request
    const user = await User.findOne({ where: {emailAddress: credentials.name} });

    // if a user was successfully retrieved from the database...
    if (user) {

      // compare the user's password (from the Authorization header) to the encrypted password retrieved from the database
      // The compareSync() method returns true if the passwords match or false they don't
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);

      // if the passwords match...
      if (authenticated) {

        // Store the user on the Request object
        // req.currentUser means that you're adding a property named currentUser to the request object and setting it to the authenticated user.
        req.currentUser = user;
        
      } else {
        message = `Authentication error for ${credentials.name}`;
      }
    } else {
      message = `User not found for ${credentials.name}`;
    }
  } else {
    message = `Auth header not found`;
  }

  // if there is any of the three error messages found...
  if (message) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  }
};

