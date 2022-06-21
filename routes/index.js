const express = require('express');
const router = express.Router();

// error check function for each route
function asyncHandler(cb) {
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(err) {
      // forward error to global error handler
      next(err);
    }
  }
}

/* USER ROUTES */

// return all properties and values for the currently authenticated User
router.get('/users', asyncHandler( async (req, res) => {
  res.status(200);
}));

// create a new user
router.post('/users', asyncHandler( async (req, res) => {
  res.status(201);
}));

/* COURSE ROUTES */

// return all courses including the User associated with each course
router.get('/courses', asyncHandler( async (req, res) => {
  res.status(200);
}));

// return the corresponding course including the User associated with that course
router.get('/courses/:id', asyncHandler( async (req, res) => {
  res.status(200);
}));

// create a new course
router.post('/courses', asyncHandler( async (req, res) => {
  res.status(201);
}));

// update the corresponding course 
router.put('/courses/:id', asyncHandler( async (req, res) => {
  res.status(204);
}));

// delete the corresponding course
router.delete('/courses/:id', asyncHandler( async (req, res) => {
  res.status(204);
}));

module.exports = router;