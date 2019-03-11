const mongoose = require("mongoose");

const Produit = new mongoose.Schema({
  nom: { type: String, required: true },
  stock: { type: Number, default: 0 },
  prixUnitaire: { type: Number, required: true },
  categorie: { type: String, enum: ["boisson", "nourriture", "autre"], default: "autre" },
  image: { type: String }
});

module.exports = mongoose.model("Produit", Produit);