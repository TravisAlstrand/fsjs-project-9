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
    console.log(credentials);
  }
};
