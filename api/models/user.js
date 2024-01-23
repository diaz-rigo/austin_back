const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: { type: String, required: true },
    rol: { type: String, required: true, default: 'CLIENT' },
    name: { type: String, required: true },
    maternalLastname: { type: String }, // Nuevo campo de apellido materno
    paternalLastname: { type: String }, // Nuevo campo de apellido paterno
    phone: { type: String }, // Nuevo campo de teléfono
    status: { type: String, required: true, default: 'ACTIVE' },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
    securityQuestion: { type: String },
    securityAnswer: { type: String },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { versionKey: false });

module.exports = mongoose.model('User', userSchema);
