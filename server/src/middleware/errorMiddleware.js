// Express error middleware used by all server routes.
export function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

export function errorHandler(err, _req, res, _next) {
  let statusCode = 500;

  // Preserve any route-specific status code unless the response is still at 200.
  if (res.statusCode && res.statusCode !== 200) {
    statusCode = res.statusCode;
  }

  let stack;
  if (process.env.NODE_ENV !== 'production') {
    stack = err.stack;
  }

  res.status(statusCode).json({
    message: err.message,
    stack
  });
}
