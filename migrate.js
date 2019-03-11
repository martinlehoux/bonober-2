const mongoose = require('mongoose');

const Client = require("./models/client");
const Produit = require("./models/clients");

mongoose.connect('mongodb://localhost/bonober', err => {
  if (err) console.error(err);
  else require("mongodb").MongoClient.connect('mongodb://localhost:27017', (err, client) => {
      if (err) console.error(err);
      else {
        const db = client.db("bonober-prod");
        db.collection("customers").find({}).toArray((err, customers) => {
          customers.forEach(customer => {
            Client.create({
              prenom: customer.firstName,
              nom: customer.lastName,
              promotion: customer.promoYear,
              membre: customer.isNegativeAllowed,
              solde: customer.balance
            });
          });
        });
        db.collection('products').find({}).toArray((err, products) => {
          products.forEach(product => {
            Produit.create({
              nom: product.name,
              prixUnitaire: product.unitPrice,
              categorie: product.category
            });
          });
        });
      }
    }
  );
});