const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = {
  validateLoginInput: data => {
    let errors = {};

    // Validate the length and if it's empty
    // Validator only tests strings (thus the use of isEmpty)
    data.username = !isEmpty(data.username) ? data.username : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if(Validator.isEmpty(data.username)){
      errors.email = 'Username field is required';
    }
    if(Validator.isEmpty(data.password)){
      errors.password = 'Password field is required';
    }

    return {
      errors,
      isValid: isEmpty(errors)
    };
  }
};