const Authentication = async (req, res, next) => {
  try {
    // Authentication code
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  AUTH: [Authentication],
};
