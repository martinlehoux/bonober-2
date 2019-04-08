const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const fileUpload = require("express-fileupload");
const mongoDBStore = require('connect-mongodb-session')(session);
const config = require("./config.json");

const Client = require("./models/client");
const Produit = require("./models/produit");
// const Course = require("./models/course");

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

const app = express();
const store = new mongoDBStore({
  uri: "mongodb://localhost/bonober",
  collection: "sessions"
});
app.set('view engine', 'pug');
app.use(morgan('tiny'));
app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitialized: false,
  store
}));
// app.use("/images", express.static('images'));
// app.use("/static", express.static("static"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

// Login checker

app.get("/", (req, res) => res.render("index", { loggedIn: Boolean(req.session.loggedIn) }));
app.post("/connexion", (req, res) => {
  if (!req.body.password || req.body.password !== config.password) res.send("bad password");
  else {
    req.session.loggedIn = true;
    res.redirect("/");
  }
});
app.get("/deconnexion", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
app.use((req, res, next) => {
  if (req.session.loggedIn) next();
  else res.redirect("/");
});
app.get("/clients", (req, res) => {
  Client
    .find()
    .exec()
    .then(clients => {
      if (req.query.search) clients = search(req.query.search, clients);
      res.render("clients", { clients, loggedIn: Boolean(req.session.loggedIn) })
    })
});
app.get("/clients/nouveau", (req, res) => res.render("nouveau-client", { loggedIn: Boolean(req.session.loggedIn) }));
app.post("/clients", (req, res) => {
  if (req.body.membre) req.body.membre = true;
  Client
    .create(req.body)
    .then(() => res.redirect("/clients"))
    .catch(err => res.send(err));
});
app.get("/clients/:id", (req, res) => {
  Promise
    .all([
      Client.findById(req.params.id).populate("commandes.produit").exec(),
      Produit.find().exec(),
    ])
    .then(([client, produits]) => res.render("client", { client, produits, loggedIn: Boolean(req.session.loggedIn) }));
});
app.get("/clients/:id/modifier", (req, res) => {
  Client
    .findById(req.params.id).exec()
    .then(client => res.render("modifier-client", { client }));
});
app.post("/clients/:id/modifier", (req, res) => {
  if (req.body.membre) req.body.membre = true;
  else req.body.membre = undefined;
  Client.findOneAndUpdate({ _id: req.params.id }, { ...req.body }).exec();
  res.redirect("/clients/" + req.params.id);
});
app.post("/clients/:id/supprimer", (req, res) => {
  Client.findOneAndDelete({ _id: req.params.id }).exec()
  res.redirect("/clients");
})
app.post("/clients/:id/operations", (req, res) => {
  Client
    .findOneAndUpdate({ _id: req.params.id }, { $push: { operations: { montant: req.body.montant } }, $inc: { solde: req.body.montant } }, (err, client) => console.log(err));
  res.redirect("/clients/" + req.params.id);
});
app.get("/clients/:idClient/achat/:idProduit", (req, res) => {
  Produit
    .findById(req.params.idProduit).exec()
    .then(produit => {
      Client.findOneAndUpdate({ _id: req.params.idClient }, { $push: { commandes: { produit } }, $inc: { solde: -produit.prixUnitaire } }).exec();
      res.redirect("/clients/" + req.params.idClient);
    })
    .catch(err => res.send(err));
});
app.get("/produits", (req, res) => {
  Promise
    .all([
      Produit.find({ categorie: "boisson" }).exec(),
      Produit.find({ categorie: "nourriture" }).exec(),
      Produit.find({ categorie: "autre" }).exec()
    ])
    .then(([boissons, nourritures, autres]) => res.render("produits", { boissons, nourritures, autres, loggedIn: Boolean(req.session.loggedIn) }));
});
app.get("/produits/nouveau", (req, res) => res.render("nouveau-produit", { loggedIn: Boolean(req.session.loggedIn) }));
app.post("/produits", (req, res) => {
  const image = req.files.image;
  if (image) {
    image.mv("images/" + image.name);
  }
  Produit
    .create({ ...req.body, image: image && image.name })
    .then(() => res.redirect("/produits"))
    .catch(err => res.send(err));
});
app.get("/produits/:id", (req, res) => {
  Produit
    .findById(req.params.id).exec()
    .then(produit => res.render("produit", { produit, loggedIn: Boolean(req.session.loggedIn) }));
});
app.get("/produits/:id/modifier", (req, res) => {
  Produit
    .findById(req.params.id).exec()
    .then(produit => res.render("modifier-produit", { produit, loggedIn: Boolean(req.session.loggedIn) }));
});
app.post("/produits/:id/modifier", (req, res) => {
  const image = req.files.image;
  if (image) {
    image.mv("images/" + image.name);
    Produit.findOneAndUpdate({ _id: req.params.id }, { image: image.name }).exec();
  }
  Produit.findOneAndUpdate({ _id: req.params.id }, { ...req.body }).exec();
  res.redirect("/produits/" + req.params.id);
});
app.post("/produits/:id/supprimer", (req, res) => {
  Produit.findOneAndDelete({ _id: req.params.id }).exec()
  res.redirect("/produits");
});
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

mongoose.connect('mongodb://localhost/bonober', err => {
  if (err) {
    console.error('ERROR Unable to connect to Mongo database')
  } else {
    console.log('Server connected to Mongo database');
    app.listen(config.port, () => {
      console.log(`Server listening on http://localhost:${config.port}`);
    });
  }
});
