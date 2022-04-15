const router = require("express").Router()
const tweetController = require("../controllers/tweet")
const authJwt = require("../middlewares/authJwt")
const verifyTweet = require("../middlewares/verifyTweet")

router.get("/feed", authJwt.verifyToken, tweetController.getMyFeed)
router.get("/:tweetId", tweetController.getTweetById)
router.get("/:tweetId/replies", tweetController.getTweetReplies)
router.get("/hashtag/:name", tweetController.getTweetsByHashtag)
router.get("/user/:userId", tweetController.getTweetsByUserId)

router.post(
  "/",
  authJwt.verifyToken,
  verifyTweet.validateContent,
  tweetController.tweet
)
router.post(
  "/:tweetId/reply",
  authJwt.verifyToken,
  verifyTweet.validateContent,
  tweetController.reply
)
router.post("/:tweetId/like", authJwt.verifyToken, tweetController.likeTweet)
router.post(
  "/:tweetId/retweet",
  authJwt.verifyToken,
  tweetController.retweetTweet
)

module.exports = router
