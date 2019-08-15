import express from 'express'

import {
  user_login,
  user_register,
  user_forgot_password,
  user_validate_token,
  user_reset_password,
} from '../../controllers/user.controller.js'

const userRouter = express.Router()

// @route POST api/users/register
// @desc Register user
// @access Public
userRouter.post('/register', user_register)

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
userRouter.post('/login', user_login)

// @route POST api/users/forgot-password
// @desc Request reset user password email
// @access Public
userRouter.post('/forgot-password', user_forgot_password)

// @route GET api/users/validate-token
// @desc Validates password reset token
// @access Public
userRouter.get('/validate-token', user_validate_token)

// @route POST api/users/reset-password
// @desc Reset user password
// @access Public
userRouter.post('/reset-password', user_reset_password)

export default userRouter
