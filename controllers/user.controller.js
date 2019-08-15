import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

// Load User model
import User from '../models/user.model.js'

// Load input validation
import validateRegisterInput from '../validation/register.validation.js'
import validateLoginInput from '../validation/login.validation.js'
import validateEmailInput from '../validation/forgot-password.validation.js'
import validatePasswordInput from '../validation/password.validation.js'

// Salt Rounds
const BCRYPT_SALT_ROUNDS = 12

export function user_register(req, res) {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body)

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors)
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        return res.status(400).json({ email: 'Email already exists' })
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        })

        // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              throw err
            }
            
            newUser.password = hash
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err))
          })
        })
      }
    })
}

export function user_login(req, res) {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body)

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors)
  }

  const email = req.body.email
  const password = req.body.password

  // Find user by email
  User.findOne({ email })
    .then(user => {
      // Check if user exists
      if (!user) {
        return res.status(404).json({ emailnotfound: 'Email not found' })
      }

      // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name
          }

          // Sign token
          jwt.sign(
            payload,
            process.env.JWT_SEC,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token
              })
            }
          )
        } else {
          return res
            .status(400)
            .json({ password: 'Password incorrect' })
        }
      })
    })
}

export function user_forgot_password(req, res) {
  const { errors, isValid } = validateEmailInput(req.body)

  if (!isValid) {
    return res.status(400).json(errors)
  }

  const email = req.body.email
  const location = req.body.location

  User.findOne({ email })
    .then(user => {
      if (user === null) {
        return res.status(400).json({ email: 'Email not in database' })
      } else {
        const token = crypto.randomBytes(20).toString('hex')

        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 360000

        user.save(function(err) {
          if (err) {
            console.log(err)
          }
        })

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: `${process.env.NM_EMAIL}`,
            pass: `${process.env.NM_EMAIL_PASS}`,
          },
        })

        const mailOptions = {
          from: `Pura Scents`,
          to: `${user.email}`,
          subject: 'Password Reset Request',
          text:
            `Requested password reset link:\n\n` +
            `${location.origin}/reset/${token}\n`
        }

        transporter.sendMail(mailOptions, function(err, response) {
          if (err) {
            return res.status(400).json({ emailSendError: 'Unexpected error: Email could not be sent'})
          } else {
            return res.status(200).json({
              emailSendSuccess: 'Password reset email sent',
              emailSendError: null,
            })
          }
        })
      }
  })
}

export function user_validate_token(req, res) {
  User.findOne({ 
    resetPasswordToken: req.query.resetPasswordToken,
    resetPasswordExpires: {
      $gt: Date.now(),
    },
  })
    .then(user => {
      if (user === null) {
        return res.status(403).json({ passwordLinkInvalid: 'Password reset link is invalid or expired' })
      } else {
        res.status(200).json({
          email: user.email,
          messages: { passwordLinkValid: 'Password reset link is valid' },
        })
      }
    })
}

export function user_reset_password(req, res) {
  const { errors, isValid } = validatePasswordInput(req.body)

  if (!isValid) {
    return res.status(400).json(errors)
  }

  const email = req.body.email

  User.findOne({ email })
    .then(user => {
      if (user === null) {
        return res.status(400).json({ email: 'Email not in database' })
      } else {
        bcrypt
          .hash(req.body.password, BCRYPT_SALT_ROUNDS)
          .then(hashedPassword => {

            user.password = hashedPassword
            user.resetPasswordToken = null
            user.resetPasswordExpires = null

            user.save(function(err) {
              if (err) {
                console.log(err)
              }
            })
          })
          .then(() => {
            res.status(200).send({ passwordUpdateSuccess: 'Password updated successfully!'})
          })
      }
    })
}