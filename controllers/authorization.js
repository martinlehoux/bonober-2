const express = require("express");
const config = require("../config.json");

const authorizationRouter = express.Router();

authorizationRouter.post("/connexion", (req, res) => {
  if (!req.body.password || req.body.password !== config.password) res.send("bad password");
  else {
    req.session.loggedIn = true;
    res.redirect("/");
  }
});

authorizationRouter.get("/deconnexion", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

authorizationRouter.use((req, res, next) => {
  if (req.session.loggedIn) next();
  else res.redirect("/");
});

module.exports = authorizationRouter;
