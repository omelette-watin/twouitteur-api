const { prisma } = require("../config/prisma")
const bcrypt = require("bcryptjs")

exports.findUserById = async (userId, options = {}) => {
  try {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      ...options,
    })
  } catch (err) {
    throw new Error(err)
  }
}

exports.findUserByEmailOrUsername = async (username, email, options = {}) => {
  try {
    return prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
      ...options,
    })
  } catch (err) {
    throw new Error(err)
  }
}

exports.createUser = async (username, email, password) => {
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    return prisma.user.create({
      data: {
        username,
        profilename: username,
        email,
        password: hashedPassword,
      },
    })
  } catch (err) {
    throw new Error(err)
  }
}

exports.follow = async (followerId, followingId) => {
  try {
    const existingFollow = await prisma.follows.findFirst({
      where: {
        followerId,
        followingId,
      },
    })

    if (existingFollow) {
      await prisma.follows.deleteMany({
        where: {
          followerId,
          followingId,
        },
      })

      return { message: "User unfollowed" }
    }

    await prisma.follows.create({
      data: {
        followerId,
        followingId,
      },
    })

    return { message: "User followed" }
  } catch (err) {
    throw new Error(err)
  }
}

exports.findFollowsByUserId = async (userId, options =  {}) => {
  try {
    return prisma.user.findMany({
      where: {
        followers: {
          some: {
            id: userId
          }
        }
      },
      ...options,
    })
  } catch (err) {
    throw new Error(err)
  }
}