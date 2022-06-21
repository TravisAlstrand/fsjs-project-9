// error check function for each route
exports.asyncHandler = (cb) => {
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(err) {
      // forward error to global error handler
      next(err);
    }
  }
}