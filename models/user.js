const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: "Listing"
    }]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);