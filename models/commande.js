const mongoose = require("mongoose");

const Commande = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true }
});

module.exports = Commande;