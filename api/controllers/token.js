const mongoose = require("mongoose");
const Token = require("../models/apiToken");

exports.getAll = (req, res, next) => {
    Token.find()
        .exec()
        .then(tokens => {
            res.status(200).json(tokens);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.create = (req, res, next) => {
    const token = new Token({
        _id: new mongoose.Types.ObjectId(), // Añade 'new' aquí
        date: req.body.date,
        description: req.body.description,
        apiToken: req.body.apiToken,
    });

    token.save()
        .then(result => {
            res.status(201).json(result);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};


exports.get = (req, res, next) => {
    const tokenId = req.params.id;

    Token.findById(tokenId)
        .exec()
        .then(token => {
            if (!token) {
                return res.status(404).json({ message: "Token not found" });
            }
            res.status(200).json(token);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.delete = (req, res, next) => {
    const tokenId = req.params.id;

    Token.deleteOne({ _id: tokenId })
        .exec()
        .then(result => {
            res.status(200).json({
                _id: tokenId,
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};
