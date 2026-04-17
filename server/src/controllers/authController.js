import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';

// This controller handles account creation, email verification, sign-in,
// password recovery, and the authenticated user profile endpoint.

function createSessionToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

function createRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashStoredToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function userPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified
  };
}

// Create a new user account and send the email verification link.
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required.');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409);
    throw new Error('An account with that email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = createRandomToken();

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    emailVerificationTokenHash: hashStoredToken(verificationToken)
  });

  const verifyUrl = `${process.env.CLIENT_URL || 'https://garnish-demo.com'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

  await sendEmail({
    to: user.email,
    subject: 'Verify your Garnish account',
    html: `<p>Welcome to Garnish.</p><p>Please verify your account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
  });

  res.status(201).json({
    user: userPayload(user),
    token: createSessionToken(user._id),
    message: 'Account created. Verification email sent.'
  });
});

// Mark the account as verified and return a live session for auto sign-in.
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, token } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });

  if (!user || !token || user.emailVerificationTokenHash !== hashStoredToken(token)) {
    res.status(400);
    throw new Error('Invalid verification link.');
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = null;
  await user.save();

  res.json({
    message: 'Email verified successfully. You are now signed in.',
    user: userPayload(user),
    token: createSessionToken(user._id)
  });
});

// Sign an existing user in after validating credentials and verification state.
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email || '').toLowerCase() });
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  if (!user.isEmailVerified) {
    res.status(403);
    throw new Error('Please verify your email before logging in.');
  }

  res.json({
    user: userPayload(user),
    token: createSessionToken(user._id)
  });
});

// Send a password reset link without revealing whether the account exists.
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });

  if (!user) {
    return res.json({ message: 'If the account exists, a reset email has been sent.' });
  }

  const resetToken = createRandomToken();
  user.passwordResetTokenHash = hashStoredToken(resetToken);
  user.passwordResetExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || 'https://garnish-demo.com'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your Garnish password',
    html: `<p>Use the following password reset link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
  });

  res.json({ message: 'If the account exists, a reset email has been sent.' });
});

// Finalize the password reset after validating the token and expiry window.
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });

  if (!user || !token || !password) {
    res.status(400);
    throw new Error('Invalid password reset request.');
  }

  if (
    user.passwordResetTokenHash !== hashStoredToken(token) ||
    !user.passwordResetExpiresAt ||
    user.passwordResetExpiresAt.getTime() < Date.now()
  ) {
    res.status(400);
    throw new Error('Reset token is invalid or expired.');
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  await user.save();

  res.json({ message: 'Password reset successfully.' });
});

// Return the current authenticated user for app bootstrapping on web and mobile.
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: userPayload(req.user) });
});
