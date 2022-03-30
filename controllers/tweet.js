const { findTweetById, getUserFeed, like, retweet, createTweet, createReply, findRepliesByTweetId, findTweetsByHashtag } = require("../services/tweet")

exports.tweet = async (req, res) => {
  const {
    userId,
    body: { content },
  } = req

  try {
    const newTweet = await createTweet(content, userId)

    return res.status(200).send({
      message: "Tweet posted",
      id: newTweet.id,
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
      id: newReply.id,
    })
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.getTweetById = async (req, res) => {
  const { tweetId } = req.params

  try {
    const tweet = await findTweetById(tweetId, {
      include: {
        _count: {
          select: {
            responses: true,
            likes: true,
            retweets: true,
          },
        },
      },
    })

    if (!tweet) {
      return res.status(404).send({
        message: "Tweet not found",
      })
    }

    return res.status(200).send(
      tweet,
    )
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.getTweetReplies = async (req, res) => {
  const { tweetId } = req.params

  try {
    const replies = await findRepliesByTweetId(tweetId, {
      include: {
        _count: {
          select: {
            responses: true,
            likes: true,
            retweets: true,
          },
        },
      },
    })

    return res.status(200).send(
      replies,
    )
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.getMyFeed = async (req, res) => {
  const { userId } = req

  try {
    const myFeed = await getUserFeed(userId, {
      include: {
        _count: {
          select: {
            responses: true,
            likes: true,
            retweets: true,
          },
        },
      },
    })

    return res.status(200).send(myFeed)
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.likeTweet = async (req, res) => {
  const {
    userId,
    params: { tweedId },
  } = req

  try {
    const likeResult = await like(tweedId, userId)

    return res.status(200).send(likeResult)
  } catch (err) {
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

exports.getTweetsByHashtag = async (req, res) => {
  const {
    params: { name }
  } = req

  try {
    const tweets = await findTweetsByHashtag(name)

    return res.status(200).send(tweets)
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

// getTweetsByContent
// getMyLikes