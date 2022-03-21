const router = require("express").Router()
const userController = require("../controllers/user")
const authJwt = require("../middlewares/authJwt")

router.get("/me", authJwt.verifyToken, userController.me)
router.get("/id/:id", userController.getUserById)
router.get("/name/:username", userController.getUserByUsername)

module.exports = router
