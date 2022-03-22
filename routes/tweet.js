const router = require("express").Router()
const tweetController = require("../controllers/tweet")
const authJwt = require("../middlewares/authJwt")
const verifyTweet = require("../middlewares/verifyTweet")

router.get("/feed", authJwt.verifyToken, tweetController.getMyFeed)
router.get("/:id", tweetController.getTweetById)
router.post("/", authJwt.verifyToken, verifyTweet.validateContent, tweetController.tweet)

module.exports = router
