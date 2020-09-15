const express = require("express");
const Client = require("../models/client");
const Produit = require("../models/produit");

const clientRouter = express.Router();

function search(word, users) {
  word = word.toLowerCase();
  const result = [];
  users.forEach(user => {
    if (
      (user.nom && user.nom.toLowerCase().includes(word)) ||
      (user.prenom && user.prenom.toLowerCase().includes(word)) ||
      (user.surnom && user.surnom.toLowerCase().includes(word))
    ) result.push(user);
    else if (word.split(" ").every(part => {
      return (
        (user.nom && user.nom.toLowerCase().includes(part)) ||
        (user.prenom && user.prenom.toLowerCase().includes(part)) ||
        (user.surnom && user.surnom.toLowerCase().includes(part))
      )
    })) result.push(user);
  });
  return result;
}

clientRouter.get("/", (req, res) => {
  Client
    .find()
    .exec()
    .then(clients => {
      if (req.query.search) clients = search(req.query.search, clients);
      if (req.query.membre) clients = clients.filter(client => client.membre);
      res.render("clients", { clients, loggedIn: Boolean(req.session.loggedIn) })
    })
});

clientRouter.get("/nouveau", (req, res) => res.render("nouveau-client", { loggedIn: Boolean(req.session.loggedIn) }));

clientRouter.post("", (req, res) => {
  if (req.body.membre) req.body.membre = true;
  Client
    .create(req.body)
    .then(() => res.redirect("/clients"))
    .catch(err => res.send(err));
});

clientRouter.get("/:id", (req, res) => {
  Promise
    .all([
      Client.findById(req.params.id).populate("commandes.produit").exec(),
      Produit.find().exec(),
    ])
    .then(([client, produits]) => {
      // Best products
      const bestProductsMap = client.commandes.reduce((summary, commande) => {
        if (summary[commande.produit.nom]) {
          summary[commande.produit.nom]++
        } else {
          summary[commande.produit.nom] = 1
        }
        return summary
      }, {});
      const bestProducts = Object.entries(bestProductsMap)
        .map(([name, number]) => ({ name, number }))
        .sort((product1, product2) => product2.number - product1.number)
        .slice(0, 3)
      // Total spent
      res.render("client", {
        client,
        bestProducts,
        nourriture: produits.filter(produit => produit.categorie == "nourriture"),
        boissons: produits.filter(produit => produit.categorie == "boisson"),
        produits, loggedIn: Boolean(req.session.loggedIn)
      })
    });
});

clientRouter.get("/:id/modifier", (req, res) => {
  Client
    .findById(req.params.id).exec()
    .then(client => res.render("modifier-client", { client }));
});

clientRouter.post("/:id/modifier", (req, res) => {
  if (req.body.membre) req.body.membre = true;
  else req.body.membre = undefined;
  Client.findOneAndUpdate({ _id: req.params.id }, { ...req.body }).exec();
  res.redirect("/clients/" + req.params.id);
});

clientRouter.post("/:id/supprimer", (req, res) => {
  Client.findOneAndDelete({ _id: req.params.id }).exec()
  res.redirect("/clients");
});

clientRouter.post("/:id/operations", (req, res) => {
  Client
    .findOneAndUpdate({ _id: req.params.id }, { $push: { operations: { montant: req.body.montant } }, $inc: { solde: req.body.montant } }, (err, client) => console.log(err));
  res.redirect("/clients/" + req.params.id);
});

clientRouter.get("/:idClient/achat/:idProduit", (req, res) => {
  Produit
    .findById(req.params.idProduit).exec()
    .then(produit => {
      Client.findOneAndUpdate({ _id: req.params.idClient }, { $push: { commandes: { produit } }, $inc: { solde: -produit.prixUnitaire, totalSpent: produit.prixUnitaire } }).exec();
      res.redirect("/clients/" + req.params.idClient);
    })
    .catch(err => res.send(err));
});

clientRouter.post("/:idClient/commande", (req, res) => {
  console.log(req.body);
  Promise.all(
    req.body.map(productId =>
      Produit.findById(productId).exec()
        .then(produit =>
          Client.findOneAndUpdate({ _id: req.params.idClient }, { $push: { commandes: { produit } }, $inc: { solde: -produit.prixUnitaire, totalSpent: produit.prixUnitaire } }).exec()
        )
    )).then(() => res.redirect("/clients/" + req.params.idClient))
    .catch(err => res.send(err))

})

module.exports = clientRouter;
