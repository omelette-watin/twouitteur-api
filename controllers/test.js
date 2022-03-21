exports.openAccess = (req, res) => {
  return res.status(200).send({
    message: "Contenu disponible à tous",
  })
}

exports.userOnlyAccess = (req, res) => {
  return res.status(200).send({
    message: "Contenu disponible à tous les utilisateurs",
  })
}

exports.adminOnlyAccess = (req, res) => {
  return res.status(200).send({
    message: "Contenu disponible à tous les administrateurs",
  })
}
