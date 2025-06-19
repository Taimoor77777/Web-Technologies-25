const mongoose = require('mongoose');

// Define the schema
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  image: String
});

// Export the model
module.exports = mongoose.model('Product', productSchema);
