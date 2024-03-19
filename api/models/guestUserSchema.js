// const mongoose = require('mongoose');

// const guestUserSchema = mongoose.Schema({
//     _id: mongoose.Schema.Types.ObjectId,
//     email: { 
//         type: String, 
//         required: true, 
//         unique: true, 
//         match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
//     },
//     name: { type: String, required: true },
//     paternalLastname: { type: String },
//     maternalLastname: { type: String },
//     phone: { type: String },
//     address: { type: String },
//     city: { type: String },
//     postalCode: { type: String },
//     country: { type: String },
//     status: { type: String, required: true, default: 'ACTIVE' },
//     createdAt: { type: Date, default: Date.now }
// }, { versionKey: false });

// module.exports = mongoose.model('GuestUser', guestUserSchema);
