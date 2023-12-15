//Passport authentication strategies
var LocalStrategy = require("passport-local").Strategy;
var RememberMeStrategy = require("passport-remember-me").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var TwitterStrategy = require("passport-twitter").Strategy;
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
//Async
var async = require("async");
//load the User model
var User = require("../app/models/user").User;
var LoginToken = require("../app/models/logintoken").LoginToken;
var validator = require("validator");
//Load user's block
var UserBlock = require("../app/models/entity").UserBlock;
//Tag
var Tag = require("../app/models/entity").Tag;
//Load the auth variables
var configAuth = require("./auth");
//Email
var Email = require("../config/mail.js");
//UUID
const { v4: uuidv4 } = require("uuid");
//Load crypto for hashing
var crypto = require("crypto"),
    shortid = require("shortid");
//Modules for anonymous ids
var Chance = require("chance"),
    chance = new Chance();
//Passport function
module.exports = function (passport) {
    //passport needs ability to serialize and unserialize users out of session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
    //LOCAL SIGNUP
    passport.use(
        "local-signup",
        new LocalStrategy(
            {
                //by default, local strategy user username and password, we will override with email
                usernameField: "email",
                passwordField: "password",
                passReqToCallback: true, //allows us to pass in the req from our route
            },
            function (req, email, password, done) {
                if (email) email = email.toLowerCase();
                //async - User.findOne wont fire unless data is sent back
                process.nextTick(function () {
                    User.findOne(
                        { email: email },
                        function (err, existingUser) {
                            if (err) return done(err);
                            if (existingUser)
                                return done(
                                    null,
                                    false,
                                    req.flash(
                                        "errorMessage",
                                        "That email is already taken"
                                    )
                                );
                            //we are not logged in, so we are creating a new user
                            var alphaSpace = /^[a-zA-Z\s]+$/;
                            if (
                                !req.user &&
                                validator.isEmail(email) &&
                                password.length >= 8 &&
                                req.body.name &&
                                alphaSpace.test(req.body.name)
                            ) {
                                var newUser = new User();
                                newUser.email = email;
                                newUser.password =
                                    newUser.generateHash(password);
                                newUser.name = req.body.name.trim();
                                newUser.initials = req.body.name
                                    .split(" ")
                                    .map(function (s) {
                                        return s.charAt(0);
                                    })
                                    .join("")
                                    .toUpperCase();
                                newUser.username = shortid.generate();
                                newUser.accountCreated = new Date(Date.now());
                                newUser.anon.id = shortid.generate();
                                newUser.anon.name = chance.name().split(" ")[0];
                                newUser.save(function (err) {
                                    if (err) return done(err);
                                    else {
                                        async.parallel(
                                            [
                                                function (callback) {
                                                    var new_block =
                                                        new UserBlock({
                                                            user: newUser._id,
                                                        });
                                                    new_block.save(function (
                                                        err
                                                    ) {
                                                        callback();
                                                    });
                                                },
                                                function (callback) {
                                                    //Add user to invited tags
                                                    Tag.update(
                                                        {
                                                            "members.email":
                                                                newUser.email,
                                                            "members.permit_val":
                                                                "invited",
                                                        },
                                                        {
                                                            $set: {
                                                                "members.$.user":
                                                                    newUser._id,
                                                                "members.$.email":
                                                                    "",
                                                                "members.$.permit_val":
                                                                    "active",
                                                            },
                                                        },
                                                        { multi: true },
                                                        function (
                                                            err,
                                                            numAffected
                                                        ) {
                                                            callback();
                                                        }
                                                    );
                                                },
                                            ],
                                            function (err) {
                                                //if successful, return the new user and send email
                                                var content = {
                                                    email: newUser.email,
                                                    name: newUser.name,
                                                    firstName:
                                                        newUser.name.split(
                                                            " "
                                                        )[0],
                                                    subject:
                                                        "Welcome to UNESCO MGIEP's Social!",
                                                };
                                                Email.sendOneMail(
                                                    "signup",
                                                    content,
                                                    function (
                                                        err,
                                                        responseStatus
                                                    ) {}
                                                );
                                                //Return user
                                                return done(null, newUser);
                                            }
                                        );
                                    }
                                });
                            } else if (
                                !req.body.name ||
                                !alphaSpace.test(req.body.name)
                            ) {
                                return done(
                                    null,
                                    false,
                                    req.flash(
                                        "errorMessage",
                                        "Name contains invalid characters"
                                    )
                                );
                            } else if (
                                validator.isEmail(email) &&
                                password.length < 8
                            ) {
                                return done(
                                    null,
                                    false,
                                    req.flash(
                                        "errorMessage",
                                        "Password must be 8 character or more."
                                    )
                                );
                            } else {
                                return done(
                                    null,
                                    false,
                                    req.flash(
                                        "errorMessage",
                                        "Email address is invalid."
                                    )
                                );
                            }
                        }
                    );
                });
            }
        )
    );
    //LOCAL LOGIN
    passport.use(
        "local-login",
        new LocalStrategy(
            {
                usernameField: "email",
                passwordField: "password",
                passReqToCallback: true,
            },
            function (req, email, password, done) {
                if (email) email = email.toLowerCase();
                process.nextTick(function () {
                    User.findOne(
                        { $or: [{ email: email }, { username: email }] },
                        function (err, user) {
                            if (err) return done(err);
                            if (!user)
                                return done(
                                    null,
                                    false,
                                    req.flash(
                                        "errorMessage",
                                        "No such user exists."
                                    )
                                );
                            if (!user.password)
                                return done(
                                    null,
                                    false,
                                    req.flash(
                                        "errorMessage",
                                        "No local account exists."
                                    )
                                );
                            if (
                                !!(
                                    user.lockUntil &&
                                    user.lockUntil > Date.now()
                                )
                            ) {
                                //If user is currently locked
                                return done(
                                    null,
                                    false,
                                    req.flash(
                                        "errorMessage",
                                        "Your account is locked due to security reasons. Please reset password."
                                    )
                                );
                            } else if (!user.validPassword(password)) {
                                //If password is wrong, when user is not locked or lock is expired
                                user.incLoginAttempts(function (err) {
                                    if (err) return done(err);
                                    return done(
                                        null,
                                        false,
                                        req.flash(
                                            "errorMessage",
                                            "Invalid email or password."
                                        )
                                    );
                                });
                            } else if (user.loginAttempts) {
                                //Reset login attempts when password is correct, before lock or when lock is expired
                                user.resetLoginAttempts(function (err) {
                                    if (err) return done(err);
                                    return done(null, user);
                                });
                            } else {
                                return done(null, user);
                            }
                        }
                    );
                });
            }
        )
    );
    //REMEMBER ME - cookie strategy.
    passport.use(
        new RememberMeStrategy(
            function (token, done) {
                var hashed_token = crypto
                    .createHash("md5")
                    .update(token)
                    .digest("hex");
                LoginToken.findOne(
                    { token: hashed_token },
                    function (err, logintoken) {
                        if (err) {
                            return done(err);
                        }
                        if (!logintoken) {
                            return done(null, false);
                        }
                        //Delete single use token
                        var userid = logintoken.userid;
                        logintoken.remove();
                        //Send User
                        User.findOne({ _id: userid }, function (err, user) {
                            if (err) {
                                return done(err);
                            }
                            if (!user) {
                                return done(null, false);
                            }
                            return done(null, user);
                        });
                    }
                );
            },
            function (user, done) {
                var token = user._id + uuidv4();
                var hashed_token = crypto
                    .createHash("md5")
                    .update(token)
                    .digest("hex");
                var loginToken = new LoginToken({
                    userid: user._id,
                    token: hashed_token,
                });
                loginToken.save(function (err) {
                    if (err) {
                        return done(err);
                    }
                    return done(null, token);
                });
            }
        )
    );
    //FACEBOOK
    passport.use(
        new FacebookStrategy(
            {
                // pull in our app id and secret from our auth.js file
                clientID: configAuth.facebookAuth.clientID,
                clientSecret: configAuth.facebookAuth.clientSecret,
                callbackURL: configAuth.facebookAuth.callbackURL,
                profileFields: ["id", "name", "email"],
                passReqToCallback: true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
            },
            // facebook will send back the token and profile
            function (req, token, refreshToken, profile, done) {
                // asynchronous
                process.nextTick(function () {
                    //check if the user is already logged in
                    if (!req.user) {
                        // find the user in the database based on their facebook id
                        User.findOne(
                            { "facebook.id": profile.id },
                            function (err, user) {
                                // if there is an error, stop everything and return that
                                // ie an error connecting to the database
                                if (err) return done(err);
                                // if the user is found, then log them in
                                if (user) {
                                    // if there is a user id already but no token (user was linked at one point and then removed)
                                    // just add our token and profile information
                                    if (!user.facebook.token) {
                                        user.facebook.token = token;
                                        user.facebook.name =
                                            profile.name.givenName +
                                            " " +
                                            profile.name.familyName;
                                        user.facebook.email =
                                            profile.emails[0].value;
                                        user.save(function (err) {
                                            if (err) throw err;
                                            return done(null, user);
                                        });
                                    }
                                    return done(null, user); // user found, return that user
                                } else {
                                    User.findOne(
                                        { email: profile.emails[0].value },
                                        function (err, existingUser) {
                                            if (err) return done(err);
                                            // check to see if there's already a user with that email
                                            if (existingUser) {
                                                // if there is user with such email id, connect accounts
                                                // set all of the facebook information in our user model
                                                existingUser.facebook.id =
                                                    profile.id; // set the users facebook id
                                                existingUser.facebook.token =
                                                    token; // we will save the token that facebook provides to the user
                                                existingUser.facebook.name =
                                                    profile.name.givenName +
                                                    " " +
                                                    profile.name.familyName; // look at the passport user profile to see how names are returned
                                                existingUser.facebook.email =
                                                    profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                                                // save our user to the database
                                                existingUser.save(function (
                                                    err
                                                ) {
                                                    if (err) throw err;
                                                    // if successful, return the new user
                                                    return done(
                                                        null,
                                                        existingUser
                                                    );
                                                });
                                            } else {
                                                // if there is no user found with that facebook id, create them
                                                var newUser = new User();
                                                // set all of the facebook information in our user model
                                                newUser.facebook.id =
                                                    profile.id; // set the users facebook id
                                                newUser.facebook.token = token; // we will save the token that facebook provides to the user
                                                newUser.facebook.name =
                                                    profile.name.givenName +
                                                    " " +
                                                    profile.name.familyName; // look at the passport user profile to see how names are returned
                                                newUser.facebook.email =
                                                    profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                                                newUser.email =
                                                    profile.emails[0].value; // Add to Primary email, name, initials
                                                newUser.username =
                                                    shortid.generate();
                                                newUser.name =
                                                    profile.name.givenName +
                                                    " " +
                                                    profile.name.familyName;
                                                newUser.initials = newUser.name
                                                    .split(" ")
                                                    .map(function (s) {
                                                        return s.charAt(0);
                                                    })
                                                    .join("")
                                                    .toUpperCase();
                                                newUser.dp.s =
                                                    "https://graph.facebook.com/" +
                                                    profile.id +
                                                    "/picture?width=200";
                                                newUser.dp.m =
                                                    "https://graph.facebook.com/" +
                                                    profile.id +
                                                    "/picture?width=200";
                                                newUser.accountCreated =
                                                    new Date(Date.now());
                                                newUser.anon.id =
                                                    shortid.generate();
                                                newUser.anon.name = chance
                                                    .name()
                                                    .split(" ")[0];
                                                // save our user to the database
                                                newUser.save(function (err) {
                                                    if (err) throw err;
                                                    else {
                                                        async.parallel(
                                                            [
                                                                function (
                                                                    callback
                                                                ) {
                                                                    var new_block =
                                                                        new UserBlock(
                                                                            {
                                                                                user: newUser._id,
                                                                            }
                                                                        );
                                                                    new_block.save(
                                                                        function (
                                                                            err
                                                                        ) {
                                                                            callback();
                                                                        }
                                                                    );
                                                                },
                                                                function (
                                                                    callback
                                                                ) {
                                                                    //Add user to invited tags
                                                                    Tag.update(
                                                                        {
                                                                            "members.email":
                                                                                newUser.email,
                                                                            "members.permit_val":
                                                                                "invited",
                                                                        },
                                                                        {
                                                                            $set: {
                                                                                "members.$.user":
                                                                                    newUser._id,
                                                                                "members.$.email":
                                                                                    "",
                                                                                "members.$.permit_val":
                                                                                    "active",
                                                                            },
                                                                        },
                                                                        {
                                                                            multi: true,
                                                                        },
                                                                        function (
                                                                            err,
                                                                            numAffected
                                                                        ) {
                                                                            callback();
                                                                        }
                                                                    );
                                                                },
                                                            ],
                                                            function (err) {
                                                                //if successful, return the new user and send email
                                                                var content = {
                                                                    email: newUser.email,
                                                                    name: newUser.name,
                                                                    firstName:
                                                                        newUser.name.split(
                                                                            " "
                                                                        )[0],
                                                                    subject:
                                                                        "Welcome to UNESCO MGIEP's Social!",
                                                                };
                                                                Email.sendOneMail(
                                                                    "signup",
                                                                    content,
                                                                    function (
                                                                        err,
                                                                        responseStatus
                                                                    ) {}
                                                                );
                                                                //Return user
                                                                return done(
                                                                    null,
                                                                    newUser
                                                                );
                                                            }
                                                        );
                                                    }
                                                });
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    } else {
                        // user already exists and is logged in, we have to link accounts
                        var user = req.user; // pull the user out of the session
                        User.findOne(
                            { "facebook.email": profile.emails[0].value },
                            function (err, auser) {
                                if (
                                    auser &&
                                    auser._id.toString() != user._id.toString()
                                ) {
                                    //Some other user is using this gmail id
                                    return done(err);
                                } else {
                                    // update the current users facebook credentials
                                    user.facebook.id = profile.id;
                                    user.facebook.token = token;
                                    user.facebook.name =
                                        profile.name.givenName +
                                        " " +
                                        profile.name.familyName;
                                    user.facebook.email =
                                        profile.emails[0].value;
                                    // save the user
                                    user.save(function (err) {
                                        if (err) throw err;
                                        return done(null, user);
                                    });
                                }
                            }
                        );
                    }
                });
            }
        )
    );
    //GOOGLE
    passport.use(
        new GoogleStrategy(
            {
                clientID: configAuth.googleAuth.clientID,
                clientSecret: configAuth.googleAuth.clientSecret,
                callbackURL: configAuth.googleAuth.callbackURL,
                passReqToCallback: true, // allows us to pass back the entire request to the callback
            },
            function (req, token, refreshToken, profile, done) {
                // make the code asynchronous
                // User.findOne won't fire until we have all our data back from Google
                process.nextTick(function () {
                    if (!req.user) {
                        // try to find the user based on their google id
                        User.findOne(
                            { "google.id": profile.id },
                            function (err, user) {
                                if (err) return done(err);
                                if (user) {
                                    // if there is a user id already but no token (user was linked at one point and then removed)
                                    if (!user.google.token) {
                                        user.google.token = token;
                                        user.google.name = profile.displayName;
                                        user.google.email =
                                            profile.emails[0].value; // pull the first email
                                        user.save(function (err) {
                                            if (err) throw err;
                                            return done(null, user);
                                        });
                                    }
                                    // if a user is found, log them in
                                    return done(null, user);
                                } else {
                                    User.findOne(
                                        { email: profile.emails[0].value },
                                        function (err, existingUser) {
                                            if (err) return done(err);
                                            // check to see if there's already a user with that email
                                            if (existingUser) {
                                                // if there is user with such email id, connect accounts
                                                // set all of the google information in our user model
                                                existingUser.google.id =
                                                    profile.id;
                                                existingUser.google.token =
                                                    token;
                                                existingUser.google.name =
                                                    profile.displayName;
                                                existingUser.google.email =
                                                    profile.emails[0].value; // pull the first email
                                                // save our user to the database
                                                existingUser.save(function (
                                                    err
                                                ) {
                                                    if (err) throw err;
                                                    // if successful, return the new user
                                                    return done(
                                                        null,
                                                        existingUser
                                                    );
                                                });
                                            } else {
                                                // if the user isnt in our database, create a new user
                                                var newUser = new User();
                                                // set all of the relevant information
                                                newUser.google.id = profile.id;
                                                newUser.google.token = token;
                                                newUser.google.name =
                                                    profile.displayName;
                                                newUser.google.email =
                                                    profile.emails[0].value; // pull the first email
                                                newUser.email =
                                                    profile.emails[0].value; // Add to Primary email, name, initials
                                                newUser.username =
                                                    shortid.generate();
                                                newUser.name =
                                                    profile.displayName;
                                                newUser.initials =
                                                    profile.displayName
                                                        .split(" ")
                                                        .map(function (s) {
                                                            return s.charAt(0);
                                                        })
                                                        .join("")
                                                        .toUpperCase();
                                                newUser.dp.s =
                                                    profile._json["picture"];
                                                newUser.dp.m =
                                                    profile._json["picture"];
                                                newUser.accountCreated =
                                                    new Date(Date.now());
                                                newUser.anon.id =
                                                    shortid.generate();
                                                newUser.anon.name = chance
                                                    .name()
                                                    .split(" ")[0];
                                                // save the user
                                                newUser.save(function (err) {
                                                    if (err) throw err;
                                                    else {
                                                        async.parallel(
                                                            [
                                                                function (
                                                                    callback
                                                                ) {
                                                                    var new_block =
                                                                        new UserBlock(
                                                                            {
                                                                                user: newUser._id,
                                                                            }
                                                                        );
                                                                    new_block.save(
                                                                        function (
                                                                            err
                                                                        ) {
                                                                            callback();
                                                                        }
                                                                    );
                                                                },
                                                                function (
                                                                    callback
                                                                ) {
                                                                    //Add user to invited tags
                                                                    Tag.update(
                                                                        {
                                                                            "members.email":
                                                                                newUser.email,
                                                                            "members.permit_val":
                                                                                "invited",
                                                                        },
                                                                        {
                                                                            $set: {
                                                                                "members.$.user":
                                                                                    newUser._id,
                                                                                "members.$.email":
                                                                                    "",
                                                                                "members.$.permit_val":
                                                                                    "active",
                                                                            },
                                                                        },
                                                                        {
                                                                            multi: true,
                                                                        },
                                                                        function (
                                                                            err,
                                                                            numAffected
                                                                        ) {
                                                                            callback();
                                                                        }
                                                                    );
                                                                },
                                                            ],
                                                            function (err) {
                                                                //if successful, return the new user and send email
                                                                var content = {
                                                                    email: newUser.email,
                                                                    name: newUser.name,
                                                                    firstName:
                                                                        newUser.name.split(
                                                                            " "
                                                                        )[0],
                                                                    subject:
                                                                        "Welcome to UNESCO MGIEP's Social!",
                                                                };
                                                                Email.sendOneMail(
                                                                    "signup",
                                                                    content,
                                                                    function (
                                                                        err,
                                                                        responseStatus
                                                                    ) {}
                                                                );
                                                                //Return user
                                                                return done(
                                                                    null,
                                                                    newUser
                                                                );
                                                            }
                                                        );
                                                    }
                                                });
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    } else {
                        // user already exists and is logged in, we have to link accounts
                        var user = req.user; // pull the user out of the session
                        User.findOne(
                            { "google.email": profile.emails[0].value },
                            function (err, auser) {
                                if (
                                    auser &&
                                    auser._id.toString() != user._id.toString()
                                ) {
                                    //Some other user is using this gmail id
                                    return done(err);
                                } else {
                                    user.google.id = profile.id;
                                    user.google.token = token;
                                    user.google.name = profile.displayName;
                                    user.google.email = profile.emails[0].value; // pull the first email
                                    user.save(function (err) {
                                        if (err) throw err;
                                        return done(null, user);
                                    });
                                }
                            }
                        );
                    }
                });
            }
        )
    );
    //TWITTER
    passport.use(
        new TwitterStrategy(
            {
                consumerKey: configAuth.twitterAuth.consumerKey,
                consumerSecret: configAuth.twitterAuth.consumerSecret,
                callbackURL: configAuth.twitterAuth.callbackURL,
                passReqToCallback: true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
            },
            function (req, token, refreshToken, profile, done) {
                // make the code asynchronous
                // User.findOne won't fire until we have all our data back from Twitter
                process.nextTick(function () {
                    if (!req.user) {
                        // try to find the user based on their twitter id
                        User.findOne(
                            { "twitter.id": profile.id },
                            function (err, user) {
                                if (err) return done(err);
                                if (user) {
                                    // if there is a user id already but no token (user was linked at one point and then removed)
                                    if (!user.twitter.token) {
                                        user.twitter.token = token;
                                        user.twitter.username =
                                            profile.username;
                                        user.twitter.name = profile.displayName;
                                        user.save(function (err) {
                                            if (err) throw err;
                                            return done(null, user);
                                        });
                                    }
                                    // if a user is found, log them in
                                    return done(null, user);
                                } else {
                                    // if the user isnt in our database, create a new user
                                    var newUser = new User();
                                    // set all of the relevant information
                                    newUser.twitter.id = profile.id;
                                    newUser.twitter.token = token;
                                    newUser.twitter.username = profile.username;
                                    newUser.twitter.name = profile.displayName;
                                    newUser.username = profile.username;
                                    newUser.email = profile.username;
                                    newUser.name = profile.displayName;
                                    newUser.initials = profile.displayName
                                        .split(" ")
                                        .map(function (s) {
                                            return s.charAt(0);
                                        })
                                        .join("")
                                        .toUpperCase();
                                    newUser.dp.s =
                                        profile.photos[0].value.replace(
                                            "_normal",
                                            ""
                                        );
                                    newUser.dp.m =
                                        profile.photos[0].value.replace(
                                            "_normal",
                                            ""
                                        );
                                    newUser.accountCreated = new Date(
                                        Date.now()
                                    );
                                    newUser.anon.id = shortid.generate();
                                    newUser.anon.name = chance
                                        .name()
                                        .split(" ")[0];
                                    // save the user
                                    newUser.save(function (err) {
                                        if (err) throw err;
                                        // if successful, return the new user and send email
                                        else {
                                            //Insert new user block
                                            var new_block = new UserBlock({
                                                user: newUser._id,
                                            });
                                            new_block.save(function (err) {
                                                return done(null, newUser);
                                            });
                                        }
                                    });
                                }
                            }
                        );
                    } else {
                        // user already exists and is logged in, we have to link accounts
                        var user = req.user; // pull the user out of the session
                        User.findOne(
                            { "twitter.username": profile.username },
                            function (err, auser) {
                                if (
                                    auser &&
                                    auser._id.toString() != user._id.toString()
                                ) {
                                    //Some other user is using this twitter id
                                    return done(err);
                                } else {
                                    user.twitter.id = profile.id;
                                    user.twitter.token = token;
                                    user.twitter.username = profile.displayName;
                                    user.twitter.name = profile.displayName;
                                    user.save(function (err) {
                                        if (err) throw err;
                                        return done(null, user);
                                    });
                                }
                            }
                        );
                    }
                });
            }
        )
    );
};
