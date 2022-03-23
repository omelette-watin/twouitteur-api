const router = require("express").Router()
const tweetController = require("../controllers/tweet")
const authJwt = require("../middlewares/authJwt")
const verifyTweet = require("../middlewares/verifyTweet")

router.get("/feed", authJwt.verifyToken, tweetController.getMyFeed)
router.get("/:id", tweetController.getTweetById)
router.get("/replies/:id", tweetController.getTweetReplies)
router.get("/hashtag/:name", tweetController.getTweetsByHashtag)
router.post("/", authJwt.verifyToken, verifyTweet.validateContent, tweetController.tweet)
router.post("/:id", authJwt.verifyToken, verifyTweet.validateContent, tweetController.reply)
router.post("/like/:id", authJwt.verifyToken, tweetController.likeTweet)
router.post("/retweet/:id", authJwt.verifyToken, tweetController.retweetTweet)


module.exports = router
