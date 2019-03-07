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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

// Login checker

app.get("/", (req, res) => res.render("index"));
app.get("/clients", (req, res) => {
  Client.find({}, (err, clients) => res.render("clients", { clients }));
});
app.get("/clients/nouveau", (req, res) => res.render("nouveau-client"));
app.post("/clients/nouveau", (req, res) => {
  Client
    .create(req.body)
    .then(() => res.redirect("/clients"))
    .catch(err => console.error(err));
});
app.get("/produits", (req, res) => {
  Produit.find({}, (err, produits) => res.render("produits", { produits }));
});
app.get("/produits/nouveau", (req, res) => res.render("nouveau-produit"));
app.post("/produits/nouveau", (req, res) => {
  const image = req.files.image;
  if (image) {
    image.mv("images/"+image.name);
  }
  Produit
    .create({ ...req.body, image })
    .then(() => res.redirect("/produits"))
    .catch(err => console.error(err));
});

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
