import JwtStrategy from 'passport-jwt/lib/strategy.js'
import ExtractJwt from 'passport-jwt/lib/extract_jwt.js'

import User from '../models/user.model.js'

const configurePassport = passport => {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SEC
      }, 
      (jwt_payload, done) => {
        User.findById(jwt_payload.id)
          .then(user => {
            if (user) {
              return done(null, user);
            }
            return done(null, false);
          })
          .catch(err => console.log(err));
    })
  )
}

export default configurePassport
