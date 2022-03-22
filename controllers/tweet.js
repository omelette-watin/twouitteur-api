const { findTweetById, getUserFeed, like, retweet, createTweet, createReply, findRepliesByTweetId } = require("../services/tweet")

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
    params: { id },
    body: { content },
  } = req

  try {
    const newReply = await createReply(content, userId, id)

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
  const { id } = req.params

  try {
    const tweet = await findTweetById(id, {
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
  const { id } = req.params

  try {
    const replies = await findRepliesByTweetId(id, {
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
    params: { id },
  } = req

  try {
    const likeResult = await like(id, userId)

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
    params: { id },
  } = req

  try {
    const retweetResult = await retweet(id, userId)

    return res.status(200).send(retweetResult)
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}