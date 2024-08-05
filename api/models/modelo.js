// models/clientView.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientViewSchema = new Schema({
  customer_id: {
    type: String,
    required: true
  },
  customer_name: {
    type: String,
    required: true
  },
  municipio: {
    type: String,
    required: true
  },
  flavor: {
    type: String,
    required: true
  },
  order_date: {
    type: Date,
    required: true
  },
  total_orders: {
    type: Number,
    required: true
  },
  total_amount_spent: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('clientView', clientViewSchema);
