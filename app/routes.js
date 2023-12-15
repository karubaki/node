var crypto = require("crypto"),
    async = require("async"),
    mongoose = require("mongoose"),
    User = require("../app/models/user").User,
    LoginToken = require("../app/models/logintoken").LoginToken,
    Site = require("../app/models/entity").Site,
    Page = require("../app/models/entity").Page,
    Block = require("../app/models/entity").Block,
    Activity = require("../app/models/entity").Activity,
    Email = require("../config/mail.js");
//UUID
const { v4: uuidv4 } = require("uuid");
//Utilities
var Utility = require("../app/utility");
//Routes
module.exports = function (app, passport) {
    var siteRoute = {
        home: function (req, res) {
            Site.findOne({}, function (err, site) {
                Page.findOne({ category: "institute" }, function (err, page) {
                    if (!page) return res.sendStatus(404);
                    //Ticker
                    if (site.ticker) {
                        var tickers = site.ticker;
                        tickers = tickers.map((ticker) => ticker.toJSON());
                    } else {
                        var tickers = [];
                    }
                    //Render
                    res.render("site/page", {
                        page: page._id,
                        url: page.url,
                        title: page.title || site.title,
                        desc: page.desc || site.desc,
                        meta:
                            page.image.meta || page.image.m || site.image.meta,
                        menu: page.menu.html || site.menu.html,
                        social: site.social,
                        contact: site.contact,
                        notice_desc: site.notice.desc,
                        notice_link: site.notice.link,
                        ticker: tickers,
                        stories: site.stories,
                        type: "institute",
                        subtype: "home",
                        theme: site.theme,
                        back_color: site.color.back,
                        text_color: site.color.text,
                    });
                });
            });
        },
        newsroom: function (req, res) {
            Site.findOne({}, function (err, site) {
                Page.findOne({ category: "newsroom" }, function (err, page) {
                    if (!page) return res.sendStatus(404);
                    //Ticker
                    if (site.ticker) {
                        var tickers = site.ticker;
                        tickers = tickers.map((ticker) => ticker.toJSON());
                    } else {
                        var tickers = [];
                    }
                    //Render
                    res.render("site/page", {
                        page: page._id,
                        url: page.url,
                        title: page.title || site.title,
                        desc: page.desc || site.desc,
                        meta:
                            page.image.meta || page.image.m || site.image.meta,
                        menu: page.menu.html || site.menu.html,
                        social: site.social,
                        contact: site.contact,
                        notice_desc: site.notice.desc,
                        notice_link: site.notice.link,
                        ticker: tickers,
                        stories: site.stories,
                        type: "newsroom",
                        subtype: "home",
                        theme: site.theme,
                        back_color: site.color.back,
                        text_color: site.color.text,
                    });
                });
            });
        },
        login: function (req, res) {
            if (req.isAuthenticated()) {
                res.redirect("/dashboard");
            } else {
                res.render("site/login");
            }
        },
        signup: function (req, res) {
            if (req.isAuthenticated()) {
                res.redirect("/dashboard");
            } else {
                res.render("site/signup");
            }
        },
        forgot: function (req, res) {
            if (req.isAuthenticated()) {
                res.redirect("/dashboard");
            } else {
                res.render("site/forgot");
            }
        },
        privacy: function (req, res) {
            res.redirect("https://mgiep.unesco.org/article/privacy-policy");
        },
        kindnessday: function (req, res) {
            res.redirect("https://kindnessday.world");
        },
        seek: function (req, res) {
            res.redirect("https://mgiep.unesco.org/seek");
        },
        iseea: function (req, res) {
            res.render("site/iseea");
        },
        iseeaweb: function (req, res) {
            res.redirect("https://mgiep.unesco.org/iseeareport");
        },
        page: function (req, res) {
            Site.findOne({}, function (err, site) {
                Page.findOne({ url: req.params.url }, function (err, page) {
                    if (!page) return res.render("site/404");
                    if (page.is_archived) return res.render("site/404");
                    //Ticker
                    if (site.ticker) {
                        var tickers = site.ticker;
                        tickers = tickers.map((ticker) => ticker.toJSON());
                    } else {
                        var tickers = [];
                    }
                    //Render
                    res.render("site/page", {
                        page: page._id,
                        url: page.url,
                        title: page.title || site.title,
                        desc: page.desc || site.desc,
                        meta:
                            page.image.meta || page.image.m || site.image.meta,
                        menu: page.menu.html || site.menu.html,
                        social: site.social,
                        contact: site.contact,
                        notice_desc: site.notice.desc,
                        notice_link: site.notice.link,
                        ticker: tickers,
                        stories: site.stories,
                        type: "institute",
                        theme: site.theme,
                        back_color: site.color.back,
                        text_color: site.color.text,
                    });
                });
            });
        },
        article: function (req, res) {
            Block.findOne(
                { slug: req.params.slug, type: "content" },
                function (err, article) {
                    if (!article) return res.render("site/404");
                    if (article.is_archived) return res.render("site/404");
                    if (article.url.ref) res.redirect(article.url.ref);
                    else {
                        Site.findOne({}, function (err, site) {
                            //Ticker
                            if (site.ticker) {
                                var tickers = site.ticker;
                                tickers = tickers.map((ticker) =>
                                    ticker.toJSON()
                                );
                            } else {
                                var tickers = [];
                            }
                            //Article JSON
                            var article_json = {
                                id: article._id,
                                slug: article.slug,
                                category: article.category,
                                title: article.text.title,
                                desc: article.text.desc,
                                meta:
                                    article.image.meta ||
                                    article.image.m ||
                                    site.image.meta,
                                image: article.image.m,
                                html: article.text.html,
                                embed: article.url.embed,
                                menu: site.menu.html,
                                social: site.social,
                                contact: site.contact,
                                notice_desc: site.notice.desc,
                                notice_link: site.notice.link,
                                ticker: tickers,
                                type: "institute",
                                theme: site.theme,
                                back_color: site.color.back,
                                text_color: site.color.text,
                            };
                            //Render
                            if (article.style == "bold") {
                                res.render("site/article_bold", article_json);
                            } else {
                                res.render("site/article", article_json);
                            }
                        });
                    }
                }
            );
        },
        dashboard: function (req, res) {
            if (req.isAuthenticated()) {
                Site.findOne({}, function (err, site) {
                    //Render
                    res.render("app/dashboard", {
                        userid: req.user.id,
                        username: req.user.username,
                        initials: req.user.initials,
                        dp: req.user.dp.s,
                        type: req.user.type,
                        theme: site.theme,
                    });
                });
            } else {
                res.redirect("/login");
            }
        },
    };
    //Site main page
    app.get("/", siteRoute.home);
    app.get("/newsroom", siteRoute.newsroom);
    app.get("/login", siteRoute.login);
    app.get("/signup", siteRoute.signup);
    app.get("/forgot", siteRoute.forgot);
    app.get("/dashboard", siteRoute.dashboard);
    app.get("/privacy", siteRoute.privacy);
    app.get("/world-kindness-day", siteRoute.kindnessday);
    app.get("/cit", siteRoute.seek);
    app.get("/iseeareport", siteRoute.iseea);
    app.get("/iseeaweb", siteRoute.iseeaweb);
    app.get("/:url", siteRoute.page);
    app.get("/article/:slug", siteRoute.article);
    app.get("/dashboard/:type", siteRoute.dashboard);
    app.get("/dashboard/:type/:filter", siteRoute.dashboard);
    app.get("/dashboard/:type/folder/:id", siteRoute.dashboard);
    //process the login form
    app.post(
        "/login",
        passport.authenticate("local-login", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        function (req, res, next) {
            // Issue a remember me cookie if the option was checked
            if (!req.body.remember_me) {
                return next();
            }
            var token = req.user._id + uuidv4();
            var hashed_token = crypto
                .createHash("md5")
                .update(token)
                .digest("hex");
            var loginToken = new LoginToken({
                userid: req.user._id,
                token: hashed_token,
            });
            loginToken.save(function () {
                res.cookie("remember_me", token, {
                    path: "/",
                    httpOnly: true,
                    maxAge: 604800000,
                });
                return next();
            });
        },
        function (req, res) {
            if (req.session.redirectURL) {
                res.redirect(req.session.redirectURL);
                req.session.redirectURL = null;
            } else {
                res.redirect("/dashboard");
            }
        }
    );
    //process the signup form
    app.post(
        "/signup",
        passport.authenticate("local-signup", {
            failureRedirect: "/signup",
            failureFlash: true,
        }),
        function (req, res, next) {
            // Issue a remember me cookie
            var token = req.user._id + uuidv4();
            var hashed_token = crypto
                .createHash("md5")
                .update(token)
                .digest("hex");
            var loginToken = new LoginToken({
                userid: req.user._id,
                token: hashed_token,
            });
            loginToken.save(function () {
                res.cookie("remember_me", token, {
                    path: "/",
                    httpOnly: true,
                    maxAge: 604800000,
                });
                return next();
            });
        },
        function (req, res) {
            if (req.session.redirectURL) {
                res.redirect(req.session.redirectURL);
                req.session.redirectURL = null;
            } else {
                res.redirect("/dashboard");
            }
        }
    );
    //process the forgot password form
    app.post("/forgot", function (req, res, next) {
        /* async waterfall - Runs the tasks array of functions in series,
         each passing their results to the next in the array. */
        async.waterfall(
            [
                // create random reset Token
                function (done) {
                    crypto.randomBytes(32, function (err, buf) {
                        var token = buf.toString("hex");
                        done(err, token);
                    });
                },
                //Update user's resetPasswordToken and resetPasswordExpires
                function (token, done) {
                    User.findOne(
                        { email: req.body.email },
                        function (err, user) {
                            if (!user) {
                                req.flash(
                                    "errorMessage",
                                    "No account with that email address exists"
                                );
                                return res.redirect("/forgot");
                            }
                            user.resetPasswordToken = token;
                            user.resetPasswordExpires =
                                Date.now() + 60 * 60 * 1000; // 1 hour
                            user.save(function (err) {
                                done(err, token, user);
                                req.flash(
                                    "successMessage",
                                    "An email has been sent to " +
                                        user.email +
                                        " with further instructions."
                                );
                                res.redirect("/");
                            });
                        }
                    );
                },
                //Send password reset email
                function (token, user, done) {
                    var content = {
                        email: user.email,
                        name: user.name,
                        firstName: user.name.split(" ")[0],
                        subject: "UNESCO MGIEP: Password Reset",
                        resetUrl: "https://mgiep.unesco.org/reset/" + token,
                    };
                    Email.sendOneMail(
                        "reset",
                        content,
                        function (err, responseStatus) {
                            done(err, user.email);
                        }
                    );
                },
            ],
            function (err, userEmail) {
                if (err) return next(err);
                return true;
            }
        );
    });
    //password reset page
    app.get("/reset/:token", function (req, res) {
        User.findOne(
            {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now() },
            },
            function (err, user) {
                if (!user) {
                    req.flash(
                        "errorMessage",
                        "Password reset token is invalid or has expired."
                    );
                    return res.redirect("/forgot");
                }
                res.render("site/reset", {
                    email: user.email,
                    token: req.params.token,
                    errorMessage: req.flash("errorMessage"),
                });
            }
        );
    });
    //Save new password
    app.post("/reset/:token", function (req, res) {
        async.waterfall(
            [
                function (done) {
                    User.findOne(
                        {
                            resetPasswordToken: req.params.token,
                            resetPasswordExpires: { $gt: Date.now() },
                        },
                        function (err, user) {
                            if (!user) {
                                req.flash(
                                    "errorMessage",
                                    "Password reset token is invalid or has expired."
                                );
                                return res.redirect("/forgot");
                            } else if (
                                !req.body.password ||
                                req.body.password.length < 8
                            ) {
                                req.flash(
                                    "errorMessage",
                                    "Password must be 8 character or more."
                                );
                                return res.redirect(
                                    "/reset/" + req.params.token
                                );
                            } else if (
                                req.body.password != req.body.password2
                            ) {
                                req.flash(
                                    "errorMessage",
                                    "The passwords don't match, please try again."
                                );
                                return res.redirect(
                                    "/reset/" + req.params.token
                                );
                            }
                            user.prev_password = user.password;
                            user.password = user.generateHash(
                                req.body.password
                            );
                            //Remove reset password token to make them invalid
                            user.resetPasswordToken = undefined;
                            user.resetPasswordExpires = undefined;
                            //Reset login Attempts on password change
                            user.loginAttempts = 0;
                            user.lockUntil = undefined;
                            user.save(function (err) {
                                //Login - Passport exposes a login() function on req
                                req.login(user, function (err) {
                                    done(err, user);
                                });
                            });
                        }
                    );
                },
                function (user, done) {
                    //Send password confirmation email
                    var content = {
                        email: user.email,
                        name: user.name,
                        firstName: user.name.split(" ")[0],
                        subject: "UNESCO MGIEP: Password Changed",
                        resetUrl: "https://mgiep.unesco.org/forgot",
                    };
                    Email.sendOneMail(
                        "password_changed",
                        content,
                        function (err, responseStatus) {
                            done(err, responseStatus);
                        }
                    );
                },
            ],
            function (err, responseStatus) {
                if (err) return next(err);
                return res.redirect("/dashboard");
            }
        );
    });
    //Logout handler by passport
    app.get("/site/logout", function (req, res) {
        // clear the remember me cookie when logging out
        res.clearCookie("remember_me");
        req.logout();
        req.session.destroy(function (err) {
            res.redirect("/login");
        });
    });
};
