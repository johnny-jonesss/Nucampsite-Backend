const mongoose = require('mongoose');

require('mongoose-currency').loadType(mongoose);

const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }],
    campsites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campsites'
    }]
}, {
    timestamps: true
});

const Favorite = mongoose.model('favorite', favoriteSchema);

module.exports = Favorite;