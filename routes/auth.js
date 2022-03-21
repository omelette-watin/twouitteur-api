const router = require("express").Router()
const verifiySignup = require("../middlewares/verifyRegister")
const authController = require("../controllers/auth")

router.post(
  "/register",
  verifiySignup.validateData,
  verifiySignup.checkDuplicateUsernameOrEmail,
  authController.register
)
router.post("/login", authController.login)
router.post("/logout", authController.logout)

module.exports = router
