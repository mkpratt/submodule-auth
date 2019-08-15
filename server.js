import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import path from 'path'

import passport from 'passport'
import dotenv from 'dotenv'

import configurePassport from './config/passport.js'
import userRouter from './routes/api/user.route.js'

const app = express()

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
)

app.use(bodyParser.json())

dotenv.config({
  path: './.env'
})

// DB Config
const db = process.env.MONGODB_URI

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log('MongoDB successfully connected'))
  .catch(err => console.log(err))

// Passport middleware
app.use(passport.initialize())

// Passport config
configurePassport(passport)

// Routes
app.use('/api/users', userRouter)

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    const __dirname = path.resolve()
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const port = process.env.PORT || 5000
console.log('HELLO FROM SUBMODULE CHANGE :)')
app.listen(port, () => console.log(`Server running on port ${port}`))
