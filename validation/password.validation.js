import Validator from 'validator'
import isEmpty from 'is-empty'

const validateLoginInput = function validateLoginInput(data) {
  let errors = {}

  // Convert empty fields to an empty string so we can use validator functions
  data.password = !isEmpty(data.password) ? data.password : ''

  // Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password is required'
  }
  
  return {
    errors,
    isValid: isEmpty(errors)
  }
}

export default validateLoginInput
