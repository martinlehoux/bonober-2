const mongoose = require("mongoose");

const Course = new mongoose.Schema({
  conducteur: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  produits: [{
    produit: { type: mongoose.Schema.Types.ObjectId, ref: "Produit", required: true },
    quantite: { type: Number, required: true },
    prix: { type: Number, required: true }
  }],
  prixFournitures: { type: Number, default: 0 }
});

module.exports = mongoose.model("Course", Course);