const { object, string } = require("yup")
const { findUserByEmailOrUsername } = require("../services/user")
const registerSchema = object({
  username: string()
    .required("All fields are required")
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(15, "Username must be less than 15 characters")
    .matches(/^[0-9A-Za-zÀ-ÖØ-öø-ÿ_-]+$/, "Username cannot contain special characters or spaces"),
  email: string().required("All fields are required").email("Invalid email"),
  password: string()
    .required("All fields are required")
    .min(8, "Password must be at least 8 characters")
    .max(40, "Password must be less than 40 characters")
    .matches(
      /\d/,
      "Password must contain at least 1 upper case, 1 lower case and one number"
    )
    .matches(
      /[A-ZÀ-Ö]/,
      "Password must contain at least 1 upper case, 1 lower case and one number"
    )
    .matches(
      /[a-zØ-öø-ÿ]/,
      "Password must contain at least 1 upper case, 1 lower case and one number"
    ),
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

    if (
      existingUser &&
      existingUser.email === email &&
      existingUser.username === username
    ) {
      return res.status(400).send({
        mailError: "This email is already used",
        usernameError: "This username is already used",
      })
    }

    if (existingUser && existingUser.email === email) {
      return res.status(400).send({
        mailError: "This email is already used",
      })
    }

    if (existingUser && existingUser.username === username) {
      return res.status(400).send({
        usernameError: "This username is already used",
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
