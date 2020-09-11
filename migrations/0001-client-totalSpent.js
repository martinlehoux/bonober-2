const mongoose = require('mongoose');

const Client = require('../models/client');
const Produit = require("../models/produit");

mongoose.connect('mongodb://localhost/bonober', err => {
  if (err) {
    console.error('ERROR Unable to connect to Mongo database')
  } else {
    console.log('Server connected to Mongo database');
    Client.find({ totalSpent: undefined }).populate("commandes.produit").exec().then(clients => {
      console.log(`${clients.length} clients found with no totalSpent`)
      clients.forEach(client => {
        Client.findOneAndUpdate(
          { _id: client._id },
          { $set: { totalSpent: client.commandes.reduce((total, commande) => commande.produit.prixUnitaire + total, 0) } }
        ).exec().catch(err => console.log(err));
        console.log(`${client.nom} ${client.prenom} updated`);
      })
      process.exit(0);
    })
  }
});
