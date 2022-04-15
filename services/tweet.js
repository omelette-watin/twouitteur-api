const { prisma } = require("../config/prisma")
const extractHashtags = (str) => {
  const reg = /\B(#[0-9A-Za-zÀ-ÖØ-öø-ÿ_-]+)(?![0-9A-Za-zÀ-ÖØ-öø-ÿ_-])/g
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
const incIdLtThan = (cursor) => {
  if (!cursor || !parseInt(cursor)) {
    return {}
  }

  return {
    incId: {
      lt: parseInt(cursor),
    },
  }
}
const orderBy = (str) => {
  if (!str || str === "latest") {
    return {
      createdAt: "desc",
    }
  }

  if (str === "popular") {
    return {
      likes: {
        _count: "desc",
      },
    }
  }
}
const includeFields = ({ author, originalTweet, stats }) => {
  const include = {}

  if (author) {
    include.author = {
      select: {
        username: true,
        profilename: true,
        image: true,
        id: true,
      },
    }
  }

  if (originalTweet) {
    include.originalTweet = {
      select: {
        author: {
          select: {
            username: true,
          },
        },
      },
    }
  }

  if (stats) {
    include._count = {
      select: {
        responses: true,
        likes: true,
        retweets: true,
      },
    }
  }

  return include
}
const genericFinder = async (
  whereCondition,
  take = 10,
  cursor = null,
  order = "latest",
  include = {}
) => {
  try {
    return prisma.tweet.findMany({
      where: {
        ...whereCondition,
        ...incIdLtThan(cursor),
      },
      take,
      orderBy: orderBy(order),
      include: includeFields(include),
    })
  } catch (err) {
    throw new Error(err)
  }
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

exports.findRepliesByTweetId = async (tweetId, ...rest) => {
  try {
    return genericFinder({ originalTweetId: tweetId }, ...rest)
  } catch (err) {
    throw new Error(err)
  }
}

exports.findTweetsByHashtag = async (hashtagName, ...rest) => {
  try {
    return genericFinder({ hashtags: { some: { name: hashtagName } } }, ...rest)
  } catch (err) {
    throw new Error(err)
  }
}

exports.getUserFeed = async (userId, ...rest) => {
  try {
    return genericFinder({}, ...rest)
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
      await prisma.retweet.delete({
        where: {
          id: existingRetweet.id,
        },
      })

      return { message: "Tweet not retweeted anymore" }
    }

    await prisma.retweet.create({
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

/** exports.getUserFeed = async (userId, options = {}) => {
  try {
    const feed = await prisma.tweet.findMany({
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

    return prisma.tweet.findMany({
      orderBy: {
        createdAt: "desc",
      },
      ...options,
    })
  } catch (err) {
    throw new Error(err)
  }
} **/
