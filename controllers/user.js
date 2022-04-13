const {
  findUserById,
  findUserByEmailOrUsername,
  follow,
  findFollowsByUserId,
} = require("../services/user")

exports.me = async (req, res) => {
  try {
    const me = await findUserById(req.userId, {
      include: {
        likes: {
          select: {
            tweetId: true,
          },
        },
        retweets: {
          select: {
            tweetId: true,
          },
        },
      },
    })

    if (!me) {
      return res.status(404).send({
        message: "User not found",
      })
    }

    return res.status(200).send({
      id: me.id,
      username: me.username,
      profilename: me.profilename || me.username,
      email: me.email,
      image: me.image,
      likes: me.likes.map((like) => like.tweetId),
      retweets: me.retweets.map((retweet) => retweet.tweetId),
    })
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.getUserById = async (req, res) => {
  const { userId } = req.params

  try {
    const user = await findUserById(userId, {
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            tweets: true,
            retweets: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).send({
        message: "User not found",
      })
    }

    return res.status(200).send({
      id: user.id,
      username: user.username,
      profilename: user.profilename || user.username,
      stats: user._count,
    })
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.getUserByUsername = async (req, res) => {
  const { username } = req.params

  try {
    const user = await findUserByEmailOrUsername(username, username, {
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            tweets: true,
            retweets: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).send({
        message: "User not found",
      })
    }

    return res.status(200).send({
      id: user.id,
      username: user.username,
      profilename: user.profilename || user.username,
      stats: user._count,
    })
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.follow = async (req, res) => {
  const {
    userId,
    params: { followedUserId },
  } = req

  try {
    const followResult = await follow(userId, followedUserId)

    return res.status(200).send(followResult)
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

exports.getMyFollows = async (req, res) => {
  const { userId } = req.params

  try {
    const follows = await findFollowsByUserId(userId, {
      select: {
        id: true,
        username: true,
      },
    })

    return res.status(200).send({
      follows,
    })
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    })
  }
}

// update account
// delete account
// block/unblock ?
