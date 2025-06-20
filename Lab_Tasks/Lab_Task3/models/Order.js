// models/Order.js
// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema({
//   userEmail: {
//     type: String,
//     required: true
//   },
//   items: [String], // or an array of objects like { name, price }
//   totalPrice: Number,
//   date: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model("Order", orderSchema);

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    name: String,
    phone: String,
    address: String,
    items: Array,
    total: Number,
    status: {
        type: String,
        default: 'Pending'
    },
    userEmail: String, // optional: if using login system
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
