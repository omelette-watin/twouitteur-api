const router = require("express").Router()
const testController = require("../controllers/test")
const authJwt = require("../middlewares/authJwt")

router.get("/public", testController.openAccess)
router.get("/users-only", authJwt.verifyToken, testController.userOnlyAccess)
router.get(
  "/admin-only",
  authJwt.verifyToken,
  authJwt.isAdmin,
  testController.adminOnlyAccess
)

module.exports = router
