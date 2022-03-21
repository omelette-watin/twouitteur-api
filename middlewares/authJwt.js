const jwt = require("jsonwebtoken")
const authConfig = require("../config/auth")
const { findUserById } = require("../services/user")
const verifyToken = (req, res, next) => {
  const token = req.session.token

  if (!token) {
    return res.status(403).send({ message: "No token provided" })
  }

  jwt.verify(token, authConfig.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized",
      })
    }

    req.userId = decoded.id
  })
  next()
}
const isAdmin = async (req, res, next) => {
  const { userId } = req

  try {
    const user = await findUserById(userId)

    if (!user.isAdmin)
      {return res.status(403).send({
        message: "Unauthorized",
      })}

    next()
  } catch (err) {
    return res.status(500).send({
      message: err.message
    })
  }
}
const authJwt = {
  verifyToken,
  isAdmin,
}

module.exports = authJwt
