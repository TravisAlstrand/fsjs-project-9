const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/async-handler');
const { authenticateUser } = require('../middleware/auth-user');
const { User, Course } = require('../models');


/* USER ROUTES */

// return all properties and values for the currently authenticated User
router.get('/users', authenticateUser, asyncHandler( async (req, res) => {

  // retrieve the current authenticated user's information from the Request object's currentUser property
  const user = req.currentUser;

  res.status(200);

  // use the Response object's json() method to return the current user's information formatted as JSON
  res.json({
    "firstName": user.firstName,
    "lastName": user.lastName,
    "emailAddress": user.emailAddress
  });
}));

// create a new user
router.post('/users', asyncHandler( async (req, res) => {
  try {
    // wait to create new user using info in request body
    await User.create(req.body);
    // set location header to '/'
    res.setHeader('Location', '/');
    res.status(201);
    // stop from infinite 'loading'
    res.end()
  } catch(error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else {
      throw error;
    }
  }
}));

/* COURSE ROUTES */

// return all courses including the User associated with each course
router.get('/courses', asyncHandler( async (req, res) => {

  // array to store all courses
  const allCourses = await Course.findAll();

  // create new array, excluding 'created at'/'updated at' properties & values
  const courses = allCourses.map(({id, title, description, estimatedTime, materialsNeeded, userId}) => {
    return { id, title, description, estimatedTime, materialsNeeded, userId};
  });
  res.status(200);
  res.json(courses);
}));

// return the corresponding course including the User associated with that course
router.get('/courses/:id', asyncHandler( async (req, res) => {

  // variable for course id requested
  const courseId = req.params.id;

  // variable for course object with requested id
  const course = await Course.findByPk(courseId);

  // check if course exists
  if (course === null) {
    res.status(404);
    res.json({"message": "Course does not exist"});
  } else {
    res.status(200);
    res.json({
      "id": course.id,
      "title": course.title,
      "description": course.description,
      "estimatedTime": course.estimatedTime,
      "materialsNeeded": course.materialsNeeded,
      "userId": course.userId
    });
  }
}));

// create a new course
router.post('/courses', authenticateUser, asyncHandler( async (req, res) => {

  // retrieve the current authenticated user's information from the Request object's currentUser property
  const user = req.currentUser;

  if (user) {
    try {
      // wait to create new course using info in request body
      const newCourse = await Course.create(req.body);
      // set location header to '/'
      res.setHeader('Location', '/courses/' + newCourse.id);
      res.status(201);
      // stop from infinite 'loading'
      res.end()
    } catch(error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  };
}));

// update the corresponding course 
router.put('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
  res.status(204);
}));

// delete the corresponding course
router.delete('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
  res.status(204);
}));

module.exports = router;