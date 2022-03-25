const { object, string } = require("yup")
const { findUserByEmailOrUsername } = require("../services/user")
const possibleErrors = {
  common: {
    required: "All fields are required",
  },
  username: {
    length: "Your username must have between 3 and 15 characters",
    nospace: "Your username mustn't have whitespaces",
    noat: "Your password mustn't have '@' symbol",
    emoji: "Your password mustn't have emojis in it",
    used: "This username is already used",
  },
  email: {
    invalid: "Your email adress is invalid",
    used: "This email adress is already used",
  },
  password: {
    length: "Your password must have between 8 and 40 characters",
    digit: "Your password must include at least 1 number",
    upper: "Your password must include at least 1 upper case letter",
    lower: "Your password must include at least 1 lower case letter",
  },
}
const registerSchema = object({
  username: string()
    .required(possibleErrors.common.required)
    .trim()
    .min(3, possibleErrors.username.length)
    .max(15, possibleErrors.username.length)
    .matches(/^[^\s)]+$/, possibleErrors.username.nospace)
    .matches(/^[^@]+$/, possibleErrors.username.noat)
    .matches(/^[\u0020-\u007e\u00a0-\u00ff\u0152\u0153\u0178]+$/, possibleErrors.username.emoji),
  email: string()
    .required(possibleErrors.common.required)
    .email(possibleErrors.invalid),
  password: string()
    .required(possibleErrors.common.required)
    .min(8, possibleErrors.password.length)
    .max(40, possibleErrors.password.length)
    .matches(/\d/, possibleErrors.password.digit)
    .matches(/[A-ZÀ-Ö]/, possibleErrors.password.upper)
    .matches(/[a-zØ-öø-ÿ]/, possibleErrors.password.lower),
})
const validateData = async (req, res, next) => {
  const { username, email, password } = req.body

  try {
    req.body = await registerSchema.validate(
      { username, email, password },
      { abortEarly: false }
    )
    next()
  } catch (err) {
    return res.status(400).send({
      errors: err.errors,
    })
  }
}
const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  const { username, email } = req.body

  try {
    const existingUser = await findUserByEmailOrUsername(username, email)

    if (existingUser && existingUser.email === username) {
      return res.status(400).send({
        errors: [possibleErrors.email.used],
      })
    }

    if (existingUser && existingUser.username === username) {
      return res.status(400).send({
        errors: [possibleErrors.username.used],
      })
    }

    next()
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}
const verifySignup = {
  validateData,
  checkDuplicateUsernameOrEmail,
}

module.exports = verifySignup
