const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = {
  validateTaskInput: data => {
    let errors = {};

    // Validate the length and if it's empty
    // Validator only tests strings (thus the use of isEmpty)
    data.name = !isEmpty(data.name) ? data.name : '';
    data.pointValue = !isEmpty(data.pointValue) ? data.pointValue : '';

    if(Validator.isEmpty(data.name)){
      errors.name = 'Name field is required';
    }
    if(Validator.isEmpty(data.pointValue)){
      errors.pointValue = 'Point value field is required';
    }

    return {
      errors,
      isValid: isEmpty(errors)
    };
  }
};