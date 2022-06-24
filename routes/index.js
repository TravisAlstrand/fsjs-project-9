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
  const allCourses = await Course.findAll({
    include: {
      model: User, 
      as: 'creator',
      attributes: ['firstName', 'lastName', 'emailAddress']
    }
  });

  // create new array, excluding 'created at'/'updated at' properties & values
  const courses = allCourses.map(({id, title, description, estimatedTime, materialsNeeded, userId, creator}) => {
    return { id, title, description, estimatedTime, materialsNeeded, userId, creator};
  });
  res.status(200);
  res.json(courses);
}));

// return the corresponding course including the User associated with that course
router.get('/courses/:id', asyncHandler( async (req, res) => {

  // variable for course id requested
  const courseId = req.params.id;

  // variable for course object with requested id
  const course = await Course.findByPk(courseId, {
    include: {
      model: User,
      as: 'creator',
      attributes: ['firstName', 'lastName', 'emailAddress']
    }
  });

  // check if course exists
  if (course === null) {
    res.status(404);
    res.json({"message": "Course does not exist"});
  } else {
    res.status(200);
    res.json({course});
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

  // retrieve the current authenticated user's information from the Request object's currentUser property
  const user = req.currentUser;

  // variable for course id requested
  const courseId = req.params.id;

  try {
    // find course with requested id
    const course = await Course.findByPk(courseId);

    // if the course exists...
    if (course !== null) {

      // if the user was authenticated & their id matches course's userId (creator of course)
      if (user && user.id === course.userId) {

        // update the course with request info
        await course.update(req.body);
        res.status(204)
        res.end();
      } else { /* if user is not course creator... */
        res.status(403);
        res.json({ "message": "You do not have access to this course"});
      }
    } else { /* if course does not exist... */
      res.status(404);
      res.json({ "message": "Course does not exist"});
    }
  } catch(error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else {
      throw error;
    }
  }
}));

// delete the corresponding course
router.delete('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {

  // retrieve the current authenticated user's information from the Request object's currentUser property
  const user = req.currentUser;

  // variable for course id requested
  const courseId = req.params.id;

  // find course with requested id
  const course = await Course.findByPk(courseId);

  // if the course exists...
  if (course) {

    // if the user was authenticated & their id matches course's userId (creator of course)
    if (user && user.id === course.userId) {

      // delete the course from db
      await course.destroy();
      res.status(204);
      res.end();
    } else { /* if user is not course creator... */
    res.status(403);
    res.json({ "message": "You do not have access to this course"});
    }
  } else { /* if course does not exist... */
  res.status(404);
  res.json({ "message": "Course does not exist"});
}
}));

module.exports = router;