const mongoose = require('mongoose');

// Define the schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  inStock: Boolean,
});

// Export the model
module.exports = mongoose.model('Product', productSchema);
