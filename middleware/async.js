//earlier approach, decided to use express-async-errors instead

module.exports = function asyncMiddleware(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (exception) {
      next(exception);
    }
  };
};
