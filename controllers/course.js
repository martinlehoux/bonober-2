// app.get("/courses", (req, res) => {
//   Course
//     .find().populate("conducteur").exec()
//     .then(courses => res.render("courses", { courses }));
// });
// app.get("/courses/nouvelle", (req, res) => {
//   Promise
//     .all([
//       Client.find({ membre: true }).exec(),
//       Produit.find({}).exec()
//     ])
//     .then(([membres, produits]) => res.render("nouvelle-course", { membres, produits }));
// });
// app.post("/courses/nouvelle", (req, res) => {
//   const produits = [];
//   for (i = 0; i < parseInt(req.body.total); i++) {
//     produits.push({
//       produit: req.body[`produit[${i}]`],
//       quantite: req.body[`quantite[${i}]`],
//       prix: parseInt(req.body[`prix[${i}]`])
//     });
//   }
//   const prix = parseInt(req.body.prixFournitures) + produits.reduce((total, now) => total + now.prix, 0);
//   Course
//     .create({
//       conducteur: req.body.conducteur,
//       produits,
//       prixFournitures: req.body.prixFournitures,
//       prix
//     })
//     .then(() => res.redirect("/courses"))
//     .catch(err => res.send(err));
// });
// app.get("/courses/:id", (req, res) => {
//   Course
//     .findOne({ _id: req.params.id }).exec()
//     .then(course => {
//       res.render("course", { course });
//     }); //
// });
