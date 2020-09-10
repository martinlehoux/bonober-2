const express = require("express");
const Produit = require("../models/produit");

const produitRouter = express.Router();

produitRouter.get("/", (req, res) => {
  Promise
    .all([
      Produit.find({ categorie: "boisson" }).exec(),
      Produit.find({ categorie: "nourriture" }).exec(),
      Produit.find({ categorie: "autre" }).exec()
    ])
    .then(([boissons, nourritures, autres]) => res.render("produits", { boissons, nourritures, autres, loggedIn: Boolean(req.session.loggedIn) }));
});

produitRouter.get("/nouveau", (req, res) => res.render("nouveau-produit", { loggedIn: Boolean(req.session.loggedIn) }));

produitRouter.post("/", (req, res) => {
  const image = req.files.image;
  if (image) {
    image.mv("images/" + image.name);
  }
  Produit
    .create({ ...req.body, image: image && image.name })
    .then(() => res.redirect("/produits"))
    .catch(err => res.send(err));
});

produitRouter.get("/:id", (req, res) => {
  Produit
    .findById(req.params.id).exec()
    .then(produit => res.render("produit", { produit, loggedIn: Boolean(req.session.loggedIn) }));
});

produitRouter.get("/:id/modifier", (req, res) => {
  Produit
    .findById(req.params.id).exec()
    .then(produit => res.render("modifier-produit", { produit, loggedIn: Boolean(req.session.loggedIn) }));
});

produitRouter.post("/:id/modifier", (req, res) => {
  const image = req.files?.image;
  if (image) {
    image.mv("images/" + image.name);
    Produit.findOneAndUpdate({ _id: req.params.id }, { image: image.name }).exec();
  }
  Produit.findOneAndUpdate({ _id: req.params.id }, { ...req.body }).exec();
  res.redirect("/produits/" + req.params.id);
});

produitRouter.post("/:id/supprimer", (req, res) => {
  Produit.findOneAndDelete({ _id: req.params.id }).exec()
  res.redirect("/produits");
});

module.exports = produitRouter;
