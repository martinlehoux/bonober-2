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
      Promise.all(
        clients.map(client => {
          Client.findOneAndUpdate(
            { _id: client._id },
            { $set: { totalSpent: client.commandes.reduce((total, commande) => commande.produit.prixUnitaire + total, 0) } }
          ).exec()
            .then(() => console.log(`${client.nom} ${client.prenom} updated`))
            .catch(err => console.log(err));
        })

      ).then(() => process.exit(0));
    })
  }
});
