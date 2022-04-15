const {
  findTweetById,
  getUserFeed,
  like,
  retweet,
  createTweet,
  createReply,
  findRepliesByTweetId,
  findTweetsByHashtag,
} = require("../services/tweet")

exports.getTweetById = async (req, res) => {
  const { tweetId } = req.params

  try {
    const tweet = await findTweetById(tweetId, {
      author: true,
      originalTweet: true,
      stats: true,
    })

    if (!tweet) {
      return res.status(404).send({
        message: "Tweet not found",
      })
    }

    return res.status(200).send(tweet)
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.getTweetReplies = async (req, res) => {
  const {
    params: { tweetId },
    query: { cursor, order },
  } = req

  try {
    const options = {
      take: 5,
      cursor,
      order,
      include: {
        author: true,
        originalTweet: true,
        stats: true,
      },
    }
    const replies = await findRepliesByTweetId(tweetId, options)

    return res.status(200).send(replies)
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.getMyFeed = async (req, res) => {
  const { userId } = req
  const { cursor, order } = req.query

  try {
    const options = {
      take: 5,
      cursor,
      order,
      include: {
        author: true,
        originalTweet: true,
        stats: true,
      },
    }
    const myFeed = await getUserFeed(userId, options)

    return res.status(200).send(myFeed)
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.getTweetsByHashtag = async (req, res) => {
  const {
    params: { name },
    query: { cursor, order },
  } = req

  try {
    const options = {
      take: 5,
      cursor,
      order,
      include: {
        author: true,
        originalTweet: true,
        stats: true,
      },
    }
    const tweets = await findTweetsByHashtag(name, options)

    return res.status(200).send(tweets)
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.tweet = async (req, res) => {
  const {
    userId,
    body: { content },
  } = req

  try {
    const newTweet = await createTweet(content, userId)

    return res.status(200).send({
      message: "Tweet posted",
      tweet: newTweet,
    })
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.reply = async (req, res) => {
  const {
    userId,
    params: { tweetId },
    body: { content },
  } = req

  try {
    const newReply = await createReply(content, userId, tweetId)

    return res.status(200).send({
      message: "Tweet posted",
      tweet: newReply,
    })
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.likeTweet = async (req, res) => {
  const {
    userId,
    params: { tweetId },
  } = req

  try {
    const likeResult = await like(tweetId, userId)

    return res.status(200).send(likeResult)
  } catch (err) {
    console.log(err)

    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.retweetTweet = async (req, res) => {
  const {
    userId,
    params: { tweetId },
  } = req

  try {
    const retweetResult = await retweet(tweetId, userId)

    return res.status(200).send(retweetResult)
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

// getTweetsByContent
// getMyLikes
// deleteTweet
// getMyRetweets
