const { prisma } = require("../config/prisma")
const extractHashtags = (str) => {
  const reg = /(?<=[\s>]|^)#(\d*[A-Za-zÀ-ÖØ-öø-ÿ_-]+\d*)\b/gu
  const hashtags = str.match(reg)

  if (hashtags) {
    return hashtags.map((n) => n.replace("#", ""))
  }

  return null
}
const handleHashtags = async (hashtags) => {
  const existingHashtags = await prisma.hashtag.findMany({
    where: {
      name: {
        in: hashtags,
      },
    },
  })
  const notExistingHashtags = hashtags.filter(
    (n) => !existingHashtags.map((h) => h.name).includes(n)
  )

  return { existingHashtags, notExistingHashtags }
}

exports.createTweet = async (content, userId) => {
  try {
    const hashtags = extractHashtags(content)

    if (!hashtags) {
      return prisma.tweet.create({
        data: {
          content: content.toString("utf8"),
          authorId: userId,
        },
      })
    }

    const { existingHashtags, notExistingHashtags } = await handleHashtags(
      hashtags
    )

    return prisma.tweet.create({
      data: {
        content,
        authorId: userId,
        hashtags: {
          connect: existingHashtags.map((h) => ({
            id: h.id,
          })),
          create: notExistingHashtags.map((n) => ({ name: n })),
        },
      },
    })
  } catch (err) {
    throw new Error(err)
  }
}

exports.createReply = async (content, userId, tweetId) => {
  try {
    const hashtags = extractHashtags(content)

    if (!hashtags) {
      return prisma.tweet.create({
        data: {
          content,
          authorId: userId,
          originalTweetId: tweetId,
        },
      })
    }

    const { existingHashtags, notExistingHashtags } = await handleHashtags(
      hashtags
    )

    return prisma.tweet.create({
      data: {
        content,
        authorId: userId,
        originalTweetId: tweetId,
        hashtags: {
          connect: existingHashtags.map((h) => ({
            id: h.id,
          })),
          create: notExistingHashtags.map((n) => ({ name: n })),
        },
      },
    })
  } catch (err) {
    throw new Error(err)
  }
}

exports.findTweetById = async (tweetId, options = {}) => {
  try {
    return prisma.tweet.findUnique({
      where: {
        id: tweetId,
      },
      ...options,
    })
  } catch (err) {
    throw new Error(err)
  }
}

exports.findRepliesByTweetId = async (tweetId, options = {}) => {
  try {
    return prisma.tweet.findMany({
      where: {
        originalTweetId: tweetId,
      },
      orderBy: {
        likes: {
          _count: "desc",
        },
      },
      ...options,
    })
  } catch (err) {
    throw new Error(err)
  }
}

exports.findTweetsByHashtag = async (hashtag, options = {}) => {
  try {
    return prisma.tweet.findMany({
      where: {
        hashtags: {
          some: {
            name: hashtag,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      ...options,
    })
  } catch (err) {
    throw new Error(err)
  }
}

exports.getUserFeed = async (userId, options = {}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { following: true },
    })

    if (user.following.length === 0) {
      return prisma.tweet.findMany({
        orderBy: {
          createdAt: "desc",
        },
        ...options,
      })
    }

    return prisma.tweet.findMany({
      where: {
        OR: [
          {
            author: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
          {
            likes: {
              some: {
                user: {
                  followers: {
                    some: {
                      followerId: userId,
                    },
                  },
                },
              },
            },
          },
          {
            retweets: {
              some: {
                user: {
                  followers: {
                    some: {
                      followerId: userId,
                    },
                  },
                },
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      ...options,
    })
  } catch (err) {
    throw new Error(err)
  }
}

exports.like = async (tweetId, userId) => {
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        tweetId,
        userId,
      },
    })

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      return { message: "Tweet unliked" }
    }

    await prisma.like.create({
      data: {
        userId,
        tweetId,
      },
    })

    return { message: "Tweet liked" }
  } catch (err) {
    throw new Error(err)
  }
}

exports.retweet = async (tweetId, userId) => {
  try {
    const existingRetweet = await prisma.retweet.findFirst({
      where: {
        tweetId,
        userId,
      },
    })

    if (existingRetweet) {
      await prisma.like.delete({
        where: {
          id: existingRetweet.id,
        },
      })

      return { message: "Tweet not retweeted anymore" }
    }

    await prisma.like.create({
      data: {
        tweetId,
        userId,
      },
    })

    return { message: "Tweet retweeted" }
  } catch (err) {
    throw new Error(err)
  }
}
