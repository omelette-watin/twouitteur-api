const { object, string } = require("yup")
const errors = {
  content: {
    required: "Tell us something unique !",
    length: "Your tweet must have between 1 and 140 characters"
  }
}
const tweetContentSchema = object({
  content: string()
    .required(errors.content.required)
    .min(1, errors.content.length)
    .max(140, errors.content.length)

})
const validateContent = async (req, res, next) => {
  const { content } = req.body

  try {
    req.body = await tweetContentSchema.validate(
      { content },
      { abortEarly: false }
    )
    next()
  } catch (err) {
    return res.status(400).send({
      erreurs: err.errors,
    })
  }
}
const verifySignup = {
  validateContent,
}

module.exports = verifySignup