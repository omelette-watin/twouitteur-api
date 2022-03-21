require("dotenv/config")

const SECRET_KEY = process.env.SECRET_KEY || "mySecretKey"

module.exports = {
  SECRET_KEY,
}
