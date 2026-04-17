// Middleware that reads the token and attaches the authenticated user to the request.
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const token = authHeader.replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
  const user = await User.findById(decoded.userId).select('-passwordHash');

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  req.user = user;
  next();
});
