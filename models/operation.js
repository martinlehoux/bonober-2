const mongoose = require("mongoose");

const Operation = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  montant: { type: Number, required: true },
  motif: { type: String, default: "recharge" }
});

module.exports = Operation;