const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error(`[goalgrid] Error: ${err.message}`);
  res.status(statusCode).json({
    detail: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
};

module.exports = { errorHandler };
