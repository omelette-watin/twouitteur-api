const { tweet, findTweetById, getUserFeed, like, retweet } = require("../services/tweet")

exports.tweet = async (req, res) => {
  const {
    userId,
    body: { content },
  } = req

  try {
    const newTweet = await tweet(content, userId)

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

exports.getMyFeed = async (req, res) => {
  const { userId } = req

  try {
    const mytweetFeed = await getUserFeed(userId)

    return res.status(200).send(mytweetFeed)
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

    return res.status(200).send({
      tweet,
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