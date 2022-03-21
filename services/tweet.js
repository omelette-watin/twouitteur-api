const { prisma } = require("../config/prisma")
const extractHashtags = (str) => {
  const reg = /(?<=[\s>]|^)#(\d*[A-Za-zÀ-ÖØ-öø-ÿ_-]+\d*)\b/gu
  const hashtags = str.match(reg)

  if (hashtags) {
    return hashtags.map((n) => n.replace("#", ""))
  }

  return null
}

exports.tweet = async (content, userId) => {
  console.log(content, userId)

  try {
    const hashtags = extractHashtags(content)
    console.log(hashtags)

    if (!hashtags) {
      return await prisma.tweet.create({
        data: {
          content,
          authorId: userId,
        },
      })
    }

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

    return await prisma.tweet.create({
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

exports.findTweetById = async (tweetId, options = {}) => {
  try {
    return await prisma.tweet.findUnique({
      where: {
        id: tweetId,
      },
      ...options,
    })
  } catch (err) {
    throw new Error(err)
  }
}

exports.getUserFeed = async (userId, options = {}) => {
  try {
    return await prisma.tweet.findMany({
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
