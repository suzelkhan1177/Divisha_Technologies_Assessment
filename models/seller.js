const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const sellerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  storeInfo: {
    address: String,
    gst: String,
    logo: String,
    storeTimings: String,
  },
  categories: [{
    name: String,
    subcategories: [String],
  }],
  inventory: [{
    category: String,
    subcategory: String,
    productName: String,
    mrp: Number,
    sp: Number,
    quantity: Number,
    images: [String],
  }],
  url: String,
  tokens: [{ token: { type: String, required: true } }]
});


sellerSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, 'secretKey', { expiresIn: '1h' });
  this.tokens.push({ token });
  return token;
};
  
  const Seller = mongoose.model('Seller', sellerSchema);

  module.exports = Seller;