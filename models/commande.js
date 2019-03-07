const mongoose = require("mongoose");

const Commande = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  prix: { type: Number, required: true },
  produits: [{
    nom: { type: String, required: true },
    quantite: { type: Number, required: true }
  }]
});

module.exports = Commande;