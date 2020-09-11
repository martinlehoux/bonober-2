const mongoose = require("mongoose");
const Operation = require("./operation");
const Commande = require("./commande");

const Client = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  surnom: { type: String },
  promotion: { type: Number },
  membre: { type: Boolean, default: false },
  solde: { type: Number, default: 0 },
  operations: [Operation],
  commandes: [Commande],
  totalSpent: { type: Number, default: 0 },
});

Client.index({ "$**": 'text' });

module.exports = mongoose.model('Client', Client);