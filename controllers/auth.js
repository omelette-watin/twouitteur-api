const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const authConfig = require("../config/auth")
const { createUser, findUserByEmailOrUsername } = require("../services/user")

exports.register = async (req, res) => {
  const { username, email, password } = req.body

  try {
    const newUser = await createUser(username, email, password)

    if (newUser) {
      req.session.token = jwt.sign({ id: newUser.id }, authConfig.SECRET_KEY, {
        expiresIn: 86400,
      })

      return res.status(200).send({
        message: "Account successfully created",
      })
    }
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.login = async (req, res) => {
  const { username, password } = req.body

  try {
    const existingUser = await findUserByEmailOrUsername(username, username)

    if (!existingUser) {
      return res.status(404).send({
        message: "Invalid credentials",
      })
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    )

    if (!isPasswordValid) {
      return res.status(401).send({
        message: "Invalid password",
      })
    }

    req.session.token = jwt.sign(
      { id: existingUser.id },
      authConfig.SECRET_KEY,
      {
        expiresIn: 86400,
      }
    )

    return res.status(200).send({
      message: "You are logged in",
      user: {
        id: existingUser.id,
        username: existingUser.username,
        profilename: existingUser.profilename,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
      },
    })
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.logout = async (req, res) => {
  try {
    req.session = null

    return res.status(200).send({
      message: "You are logged out",
    })
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}
