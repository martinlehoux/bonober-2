const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const fileUpload = require("express-fileupload");
const mongoDBStore = require('connect-mongodb-session')(session);
const config = require("./config.json");

const clientRouter = require("./controllers/client");
const produitRouter = require("./controllers/produit");


const app = express();
const store = new mongoDBStore({
  uri: "mongodb://localhost/bonober",
  collection: "sessions",
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

app.use("/clients", clientRouter);

app.use("/produits", produitRouter);

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
