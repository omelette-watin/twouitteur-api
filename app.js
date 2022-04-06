const express = require("express")
const cors = require("cors")
const cookieSession = require("cookie-session")
const routes = require("./routes")
const morgan = require("morgan")
require("dotenv").config()

const app = express()
app.use(
  cors({
    origin: process.env.FRONT_URL || "http://192.168.1.72:3000",
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cookieSession({
    name: "tweeteur-session",
    secret: process.env.SECRET_COOKIE || "mySecretCookie",
    httpOnly: true,
  })
)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept")
  next()
})
app.use(morgan("dev"))

app.get("/", async (req, res) => {
  return res.status(200).json("🐤 Tweeteur's API 🐤")
})

app.use("/auth", routes.authRoutes)
app.use("/user", routes.userRoutes)
app.use("/tweet", routes.tweetRoutes)
app.use("/test", routes.testRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`))