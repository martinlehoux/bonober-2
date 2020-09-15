const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const fileUpload = require("express-fileupload");
const mongoDBStore = require('connect-mongodb-session')(session);
const config = require("./config.json");

const Client = require('./models/client');

const authorizationRouter = require("./controllers/authorization");
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

// DEV MODE
if (!config.production) {
  app.use("/images", express.static('images'));
  app.use("/static", express.static("static"));
}

// MIDDLEWARES
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());


app.get("/", (req, res) => {
  // Best clients
  Client.find()
    .sort({ totalSpent: -1 })
    .limit(20)
    .exec()
    .then(bestClients => res.render("index", { loggedIn: Boolean(req.session.loggedIn), bestClients }))
});
app.use("/", authorizationRouter);
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
