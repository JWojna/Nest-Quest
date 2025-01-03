//^ backend/utils/validation.js
const { validationResult } = require('express-validator');
const { check } = require('express-validator')

//~ middleware for formatting errors from express-validator middleware
//~ (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors
      .array()
      .forEach(error => errors[error.path] = error.msg);

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad request.";
    next(err);
  }
  next();
};

const validateSignup = [
  check('firstName')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide your first name'),
  check('lastName')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide your last name'),
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors
];

const validateSpot = [
  check('address')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Street address is required'),
  check('city')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('City is required'),
  check('state')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Country is required'),
  check('lat')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isNumeric()
    .withMessage('Latitude must be numeric')
    .custom((value, { req }) => {
      const num = Number(value);
      if (num < -90 || num > 90) {
          throw new Error('Latitude must be within -90 and 90')
      }
      return true;
    }),
  check('lng')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isNumeric()
    .withMessage('Latitude must be numeric')
    .custom((value, { req }) => {
      const num = Number(value);
      if (num < -180 || num > 180) {
          throw new Error('Latitude must be within -180 and 180')
      }
      return true;
    }),
  check('name')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  check('description')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isLength({ min: 2, max: 250 })
    .withMessage('Description is required'),
  check('price')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isNumeric()
    .withMessage('Price must be a number')
    .custom((value, { req }) => {
      const num = Number(value);
      if (num < 0) {
          throw new Error('Price per day must be a positive number')
      }
      return true;
    }),
  handleValidationErrors
];

const validateBooking = [
  check('startDate')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isDate()
    .withMessage('startDate cannot be in the past'), //? custom validators?
  check('endDate')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isDate()
    .withMessage('endDate cannot be on or before startDate'), //? custom validators?
  handleValidationErrors
];

const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isLength({ max: 250 })
    .withMessage('Review text is required'),
  check('stars')
    .exists({ checkFalsy: true })
    .notEmpty()
    .isNumeric()
    .withMessage('Stars must be an integer from 1 to 5'), //? custom check for 1-5
  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin,
  validateSpot,
  validateBooking,
  validateReview,
  // handleValidationErrors
};
