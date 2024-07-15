const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  expirationTime: {
    type: Date,
    default: null,
  },
  keys: {
    auth: {
      type: String,
      required: true,
    },
    p256dh: {
      type: String,
      required: true,
    },
  },
});


module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);

