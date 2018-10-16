const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = {
  validateRegisterInput: data => {
    let errors = {};
    // Validate the length and if it's empty
    // Validator only tests strings (thus the use of isEmpty)
    // Name validation
    data.name = !isEmpty(data.name) ? data.name : '';
    if(!Validator.isLength(data.name, { min: 2, max: 30 })){
      errors.name = 'Name must be between 2 and 30 characters';
    }
    if(Validator.isEmpty(data.name)){
      errors.name = 'Name field is required';
    }

    // Username validation
    data.username = !isEmpty(data.username) ? data.username : '';
    if(!Validator.isLength(data.username, { min: 2, max: 30 })){
      errors.name = 'Username must be between 2 and 30 characters';
    }
    if(Validator.isEmpty(data.username)){
      errors.name = 'Username field is required';
    }

    // Email validation (for parents only)
    if(data.email!==undefined){
      data.email = !isEmpty(data.email) ? data.email : '';
      if(Validator.isEmpty(data.email)){
        errors.email = 'Email field is required';
      }
      if(!Validator.isEmail(data.email)){
        errors.email = 'Email is invalid.';
      }
    }
    
    // Password validation
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';    
    if(Validator.isEmpty(data.password)){
      errors.password = 'Password field is required';
    }
    if(!Validator.isLength(data.password, { min: 6, max: 30 })){
      errors.password = 'Password must be between 6 and 30 characters';
    }
    if(Validator.isEmpty(data.password2)){
      errors.password2 = 'Confirm Password field is required';
    }
    if(!Validator.equals(data.password, data.password2)){
      errors.password2 = 'Passwords must match';
    }
    return {
      errors,
      isValid: isEmpty(errors)
    };
  }
};