const router = require("express").Router()
const userController = require("../controllers/user")
const authJwt = require("../middlewares/authJwt")

router.get("/me", authJwt.verifyToken, userController.me)
router.get("/:userId", userController.getUserById)
router.get("/name/:username", userController.getUserByUsername)

router.post("/:followedUserId/follow", authJwt.verifyToken, userController.follow)

module.exports = router
