//User Schema Definition
var mongoose = require("mongoose"),
    bcrypt = require("bcryptjs"),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;
//Defining salt constant
var SALT_WORK_FACTOR = 10,
    MAX_LOGIN_ATTEMPTS = 5,
    LOCK_TIME = 30 * 60 * 10000;
//Defining the User Schema
var UserSchema = new Schema({
    email: { type: String, required: true, index: { unique: true } },
    username: { type: String, index: { unique: true } },
    password: { type: String },
    prev_password: { type: String },
    name: String,
    initials: String,
    dp: {
        s: String,
        m: String,
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String,
    },
    twitter: {
        id: String,
        token: String,
        name: String,
        username: String,
    },
    type: {
        type: String,
        enum: ["admin", "editor", "normal", "verified", "blocked"],
        default: "normal",
    },
    karma: { type: Number, default: 10 },
    anon: {
        id: String,
        name: String,
    },
    city: String,
    country: String,
    sex: { type: String, enum: ["M", "F", "O"] },
    phone: Number,
    about: String,
    job: {
        title: String,
        org: String,
    },
    accountCreated: { type: Date, default: Date.now },
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number },
    requestToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: String,
    following: Number,
    followers: Number,
    is_follower: Boolean,
    is_local: Boolean,
});
//Methods for UserSchema
//Generate password hash
UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(
        password,
        bcrypt.genSaltSync(SALT_WORK_FACTOR),
        null
    );
};
//checking if password is valid
UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};
//Increment login Attempts
UserSchema.methods.incLoginAttempts = function (cb) {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        //if we have a previous lock that has expired
        return this.update(
            {
                $set: { loginAttempts: 1 },
                $unset: { lockUntil: 1 },
            },
            cb
        );
    } else if (!this.lockUntil && this.loginAttempts == MAX_LOGIN_ATTEMPTS) {
        //if user is not locked and this is his MAX_LOGIN_ATTEMPTS
        return this.update(
            {
                $set: { lockUntil: Date.now() + LOCK_TIME },
            },
            cb
        );
    } else {
        // if user is not locked, then increment loginAttempts
        return this.update(
            {
                $inc: { loginAttempts: 1 },
            },
            cb
        );
    }
};
//Reset Login Attempts
UserSchema.methods.resetLoginAttempts = function (cb) {
    return this.update(
        {
            $set: { loginAttempts: 0 },
            $unset: { lockUntil: 1 },
        },
        cb
    );
};
//Create the model for User and expose it to app
module.exports.User = mongoose.model("User", UserSchema);
