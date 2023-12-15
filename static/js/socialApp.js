//Client side of Social
var SocialManager = new Backbone.Marionette.Application();
//Initialize Variables and Functions
var ENTER_KEY = 13;
var DELETE_KEY = 46;
var BACKSPACE_KEY = 8;
var ESCAPE_KEY = 27;
//Maximum upload file size
var MAX_FILE_SIZE = 51457280;
//Page size
var PAGE_SIZE = 20;
//Scroll value and scroll handler
var prevScroll, scrollHandler;
//Back history fragment
var backHistoryFragment;
//Variable to save link data
var linkEmbedData;
//Add regions of the application
SocialManager.addRegions({
    headerRegion: ".mainHeader",
    featuredRegion: ".mainFeatured",
    contentRegion: ".mainContent",
    overlayRegion: ".overlay",
    modalRegion: ".modal",
    popupRegion: ".popup",
});
//Navigate function to change url
SocialManager.navigate = function (route, options) {
    options || (options = {});
    Backbone.history.navigate(route, options);
};
//Find current route
SocialManager.getCurrentRoute = function () {
    return Backbone.history.fragment;
};
//Start
SocialManager.on("start", function () {
    if (Backbone.history) {
        Backbone.history.start({ pushState: true });
    }
    //Show login window
    $(".js-login").click(function (ev) {
        ev.preventDefault();
        SocialManager.vent.trigger("loginOverlay:show");
    });
    //Show signup window
    $(".js-signup").click(function (ev) {
        ev.preventDefault();
        SocialManager.vent.trigger("signupOverlay:show");
    });
    //Show more dropdown
    $(".js-more").click(function (ev) {
        ev.preventDefault();
        $(".navMore").toggle();
    });
    //Show add tag overlay
    $(".js-add-tag").click(function (ev) {
        ev.preventDefault();
        $(".navMore").hide();
        SocialManager.vent.trigger("newTagOverlay:show");
    });
    //Show add badge overlay
    $(".js-add-badge").click(function (ev) {
        ev.preventDefault();
        $(".navMore").hide();
        SocialManager.vent.trigger("badgesOverlay:show");
    });
    //Show add discussion overlay
    $(".js-add-discussion").click(function (ev) {
        ev.preventDefault();
        SocialManager.vent.trigger("newDiscussionOverlay:show");
    });
    //Show featured page
    $(".js-nav-today").click(function (ev) {
        ev.preventDefault();
        SocialManager.vent.trigger("featured:show");
    });
    //Show recent discussions
    $(".js-nav-recent").click(function (ev) {
        ev.preventDefault();
        //Show discussions
        if ($(".mainHeader .tagHeader").data("tag")) {
            //Show recent discussions of a tag
            SocialManager.vent.trigger(
                "discussions:show",
                "recent",
                $(".mainHeader .tagHeader").data("tag")
            );
        } else {
            //Show tags
            if (!$(".mainHeader .all-tags").length) {
                SocialManager.vent.trigger("tags:show", "all");
            }
            SocialManager.vent.trigger("discussions:show", "recent");
        }
    });
    //Show top discussions
    $(".js-nav-top").click(function (ev) {
        ev.preventDefault();
        if ($(".mainHeader .tagHeader").data("tag")) {
            //Show top discussions of a tag
            SocialManager.vent.trigger(
                "discussions:show",
                "top",
                $(".mainHeader .tagHeader").data("tag")
            );
        } else {
            //Show tags
            if (!$(".mainHeader .all-tags").length) {
                SocialManager.vent.trigger("tags:show", "all");
            }
            SocialManager.vent.trigger("discussions:show", "top");
        }
    });
    //Show my discussions
    $(".js-nav-my").click(function (ev) {
        ev.preventDefault();
        $(".mainNav a, .profile-people > a").removeClass("selected");
        $(".mainNav .js-nav-my").addClass("selected");
        SocialManager.vent.trigger("profileData:show", "", "", "discussions");
    });
    //Show queued discussions
    $(".js-nav-queued").click(function (ev) {
        ev.preventDefault();
        $(".mainNav a, .profile-people > a").removeClass("selected");
        $(".mainNav .js-nav-queued").addClass("selected");
        SocialManager.vent.trigger("profileData:show", "", "", "queued");
    });
    //Show activity
    $(".js-activity").click(function (ev) {
        ev.preventDefault();
        var $target = $(ev.currentTarget);
        if ($target.hasClass("selected")) {
            SocialManager.commands.execute("close:popup");
        } else {
            $target.addClass("selected");
            SocialManager.vent.trigger("activity:show");
        }
    });
    //Show settings modal
    $(".js-settings").click(function (ev) {
        ev.preventDefault();
        $(".navMore").hide();
        SocialManager.vent.trigger("settings:show");
    });
    //On mousedown
    $(document).mousedown(function (ev) {
        var $target = $(ev.target);
        //Hide more dropdown
        var moreDropdown = $(".navMore");
        var moreBtn = $target.hasClass("js-more");
        if (
            moreDropdown.is(":visible") &&
            !moreDropdown.is(ev.target) &&
            moreDropdown.has(ev.target).length === 0 &&
            !moreBtn
        ) {
            moreDropdown.hide();
        }
        //Hide popup
        var popup = $(".popup");
        var popupBtn =
            $target.hasClass("js-activity") ||
            $target.parent().hasClass("js-activity");
        if (
            popup.is(":visible") &&
            !popup.is(ev.target) &&
            popup.has(ev.target).length === 0 &&
            !popupBtn
        ) {
            SocialManager.commands.execute("close:popup");
        }
    });
    //On resize
    $(window).resize(function () {
        //Set height of activity area
        if ($(".popup > div").length) {
            //Set offset
            var offset = $(".navBar .link-activity").offset().left - 190 + "px";
            $(".popup").css("left", offset);
            //Set max height
            $(".popup .all-activity").css(
                "maxHeight",
                $("body").height() - 200
            );
        }
    });
});
//Show overlay
SocialManager.commands.setHandler("show:overlay", function () {
    //Hide scroll on main page
    prevScroll = $("body").scrollTop();
    $("body").css("overflow", "hidden");
    if ($("body").width() < 700 || $("html").hasClass("touchevents")) {
        $("html").css("overflow", "hidden");
        $("html, body").css("position", "fixed");
    }
    $("body").scrollTop(prevScroll);
});
//Close overlay
SocialManager.commands.setHandler("close:overlay", function (view) {
    if (!$(".overlay-box > *").length) return;
    //remove animate class on overlay box
    $(".overlay-box").removeClass("animate");
    //after animation, remove view, change route and hide overlay
    setTimeout(function () {
        $(".overlay-box > *").remove();
        $(".overlay").hide();
        if (!$(".sidebarWrap").hasClass("u-mobile")) {
            $("html, body").css("overflow", "").css("position", "");
            if (prevScroll) {
                $("html, body").scrollTop(prevScroll);
                prevScroll = "";
            }
        }
    }, 300);
});
//Close modal
SocialManager.commands.setHandler("close:modal", function (view) {
    if (!$(".modal .modal-box > *").length) return;
    //Remove backbone history fragment
    if (backHistoryFragment) {
        if (backHistoryFragment == "recent") {
            SocialManager.navigate("social/recent");
        } else {
            SocialManager.navigate(backHistoryFragment);
        }
        backHistoryFragment = "";
    }
    //remove animate class on modal box
    $(".modal .modal-box").removeClass("animate");
    //after animation, remove view, change route and hide overlay
    setTimeout(function () {
        $(".modal .modal-box > *").remove();
        $(".modal").hide();
        if (!$(".sidebarWrap").hasClass("u-mobile")) {
            $("html, body").css("overflow", "").css("position", "");
            if (prevScroll) {
                $("html, body").scrollTop(prevScroll);
                prevScroll = "";
            }
        }
    }, 300);
});
//Close popup
SocialManager.commands.setHandler("close:popup", function () {
    $(".js-activity").removeClass("selected");
    $(".popup > div").remove();
    $(".popup").removeClass("popup-activity").hide();
});
//Close featured
SocialManager.commands.setHandler("close:featured", function () {
    $(".mainFeatured > div").remove();
});
//Router of the application
SocialManager.module(
    "SocialApp",
    function (SocialApp, SocialManager, Backbone, Marionette, $, _) {
        SocialApp.Router = Marionette.AppRouter.extend({
            appRoutes: {
                "social/login": "loginOverlayView",
                "social/signup": "signupOverlayView",
                "social/forgot": "forgotOverlayView",
                "social/_=_": "featuredView",
                social: "featuredView",
                "social/me": "userView",
                "social/queued": "userQueueView",
                "social/:type": "discussionsView",
                "social/tag/:slug": "oneTagView",
                "social/tag/:slug/:type": "oneTagView",
                "social/discussion/:slug": "oneDiscussionView",
                "social/user/:slug": "userView",
                "social/me/:type": "userTypeView",
                "social/user/:slug/:type": "userTypeView",
            },
        });
        //API functions for each route
        var API = {
            loginOverlayView: function (email) {
                if ($(".mainWrap").data("user")) {
                    SocialManager.navigate("");
                } else {
                    SocialManager.SocialApp.EntityController.Controller.showOneDiscussion();
                    SocialManager.SocialApp.EntityController.Controller.showLoginOverlay(
                        email
                    );
                }
            },
            justLoginOverlayView: function (email) {
                SocialManager.SocialApp.EntityController.Controller.showLoginOverlay(
                    email
                );
            },
            signupOverlayView: function () {
                if ($(".mainWrap").data("user")) {
                    SocialManager.navigate("");
                } else {
                    SocialManager.SocialApp.EntityController.Controller.showOneDiscussion();
                    SocialManager.SocialApp.EntityController.Controller.showSignupOverlay();
                }
            },
            justSignupOverlayView: function () {
                SocialManager.SocialApp.EntityController.Controller.showSignupOverlay();
            },
            forgotOverlayView: function (email) {
                if ($(".mainWrap").data("user")) {
                    SocialManager.navigate("");
                } else {
                    SocialManager.SocialApp.EntityController.Controller.showOneDiscussion();
                    SocialManager.SocialApp.EntityController.Controller.showForgotOverlay(
                        email
                    );
                }
            },
            justForgotOverlayView: function (email) {
                SocialManager.SocialApp.EntityController.Controller.showForgotOverlay(
                    email
                );
            },
            featuredView: function () {
                if ($(".mainWrap").data("user")) {
                    SocialManager.SocialApp.EntityController.Controller.showStreak();
                }
                SocialManager.SocialApp.EntityController.Controller.showOneDiscussion();
            },
            discussionsView: function (type) {
                SocialManager.SocialApp.EntityController.Controller.showTags(
                    "all"
                );
                SocialManager.SocialApp.EntityController.Controller.showDiscussions(
                    type
                );
            },
            onlyDiscussionsView: function (type, tag_id, user_id) {
                SocialManager.SocialApp.EntityController.Controller.showDiscussions(
                    type,
                    tag_id,
                    user_id
                );
            },
            tagsView: function (type) {
                SocialManager.SocialApp.EntityController.Controller.showTags(
                    type
                );
            },
            oneTagView: function (slug, type) {
                SocialManager.SocialApp.EntityController.Controller.showOneTag(
                    slug,
                    type
                );
            },
            oneDiscussionView: function (slug) {
                //Store back history
                backHistoryFragment = "recent";
                //Show
                if ($(".mainWrap").data("user")) {
                    SocialManager.SocialApp.EntityController.Controller.showTags(
                        "all"
                    );
                    SocialManager.SocialApp.EntityController.Controller.showDiscussions(
                        "recent"
                    );
                } else {
                    SocialManager.SocialApp.EntityController.Controller.showTags();
                    SocialManager.SocialApp.EntityController.Controller.showDiscussions(
                        "recent"
                    );
                }
                SocialManager.SocialApp.EntityController.Controller.showOneDiscussion(
                    slug
                );
            },
            justOneDiscussionView: function (slug) {
                SocialManager.SocialApp.EntityController.Controller.showOneDiscussion(
                    slug
                );
            },
            tagsOverlayView: function (slug) {
                SocialManager.SocialApp.EntityController.Controller.showTagsOverlay(
                    slug
                );
            },
            exploreTagsView: function (hasClicked) {
                SocialManager.SocialApp.EntityController.Controller.showExploreTags(
                    hasClicked
                );
            },
            selectBadgesOverlayView: function (discussion_id, badge) {
                SocialManager.SocialApp.EntityController.Controller.showSelectBadgesOverlay(
                    discussion_id,
                    badge
                );
            },
            moderatorsOverlayView: function (slug) {
                SocialManager.SocialApp.EntityController.Controller.showModeratorsOverlay(
                    slug
                );
            },
            userView: function (slug) {
                SocialManager.SocialApp.EntityController.Controller.showUserDetails(
                    slug
                );
            },
            userQueueView: function () {
                SocialManager.SocialApp.EntityController.Controller.showUserDetails(
                    "",
                    "queued"
                );
            },
            userTypeView: function (slug, type) {
                if (slug && !type) {
                    SocialManager.SocialApp.EntityController.Controller.showUserDetails(
                        "",
                        slug
                    );
                } else {
                    SocialManager.SocialApp.EntityController.Controller.showUserDetails(
                        slug,
                        type
                    );
                }
            },
            usersView: function (id, type) {
                SocialManager.SocialApp.EntityController.Controller.showUsers(
                    id,
                    type
                );
            },
            newTagOverlayView: function () {
                SocialManager.SocialApp.EntityController.Controller.showNewTagOverlay();
            },
            editTagOverlayView: function (tag_id) {
                SocialManager.SocialApp.EntityController.Controller.showEditTagOverlay(
                    tag_id
                );
            },
            tagMembersOverlayView: function (tag_id, is_edit) {
                SocialManager.SocialApp.EntityController.Controller.showTagMembersOverlay(
                    tag_id,
                    is_edit
                );
            },
            newDiscussionOverlayView: function () {
                SocialManager.SocialApp.EntityController.Controller.showNewDiscussionOverlay();
            },
            badgesOverlayView: function () {
                SocialManager.SocialApp.EntityController.Controller.showBadgesOverlay();
            },
            activityView: function () {
                SocialManager.SocialApp.EntityController.Controller.showActivity();
            },
            settingsView: function () {
                SocialManager.SocialApp.EntityController.Controller.showSettings();
            },
        };
        //Triggers to particular views
        //Show login overlay window
        SocialManager.vent.on("loginOverlay:show", function (email) {
            SocialManager.navigate("social/login");
            API.justLoginOverlayView(email);
        });
        //Show signup overlay window
        SocialManager.vent.on("signupOverlay:show", function () {
            SocialManager.navigate("social/signup");
            API.justSignupOverlayView();
        });
        //Show forgot overlay window
        SocialManager.vent.on("forgotOverlay:show", function (email) {
            SocialManager.navigate("social/forgot");
            API.justForgotOverlayView(email);
        });
        //Show featured
        SocialManager.vent.on("featured:show", function () {
            SocialManager.navigate("social");
            API.featuredView();
        });
        //Show recent discussions
        SocialManager.vent.on("recentDiscussions:show", function () {
            SocialManager.navigate("social/recent");
            API.discussionsView("recent");
        });
        //Show queued discussions
        SocialManager.vent.on("queuedDiscussions:show", function () {
            SocialManager.navigate("social/queued");
            API.userQueueView();
        });
        //Show all discussions
        SocialManager.vent.on("discussions:show", function (type, tag_id) {
            if (tag_id) {
                if (type == "recent") {
                    SocialManager.navigate("social/tag/" + tag_id);
                } else {
                    SocialManager.navigate("social/tag/" + tag_id + "/" + type);
                }
            } else if (type != "daily") {
                SocialManager.navigate("social/" + type);
            }
            API.onlyDiscussionsView(type, tag_id);
        });
        //Show tags
        SocialManager.vent.on("tags:show", function (type) {
            API.tagsView(type);
        });
        //Show new tag overlay
        SocialManager.vent.on("newTagOverlay:show", function () {
            API.newTagOverlayView();
        });
        //Show edit tag overlay
        SocialManager.vent.on("editTagOverlay:show", function (tag_id) {
            API.editTagOverlayView(tag_id);
        });
        //Show tag and tagged discussions
        SocialManager.vent.on("tag:show", function (slug) {
            API.oneTagView(slug);
        });
        //Show tag members overlay
        SocialManager.vent.on("tagMembers:show", function (tag_id, is_edit) {
            API.tagMembersOverlayView(tag_id, is_edit);
        });
        //Show new discussion overlay
        SocialManager.vent.on("newDiscussionOverlay:show", function () {
            API.newDiscussionOverlayView();
        });
        //Show one discussion window with comments
        SocialManager.vent.on("oneDiscussion:show", function (slug) {
            //Store back history
            backHistoryFragment = Backbone.history.getFragment() || "recent";
            //Navigate
            SocialManager.navigate("social/discussion/" + slug);
            API.justOneDiscussionView(slug);
        });
        //Show tags overlay
        SocialManager.vent.on("tagsOverlay:show", function (slug) {
            API.tagsOverlayView(slug);
        });
        //Show explore tags overlay
        SocialManager.vent.on("exploreTags:show", function (hasClicked) {
            API.exploreTagsView(hasClicked);
        });
        //Show select badges overlay
        SocialManager.vent.on(
            "selectBadgeOverlay:show",
            function (discussion_id, badge) {
                API.selectBadgesOverlayView(discussion_id, badge);
            }
        );
        //Show moderators overlay
        SocialManager.vent.on("moderatorsOverlay:show", function (slug) {
            API.moderatorsOverlayView(slug);
        });
        //Show badges
        SocialManager.vent.on("badgesOverlay:show", function () {
            API.badgesOverlayView();
        });
        //Show user
        SocialManager.vent.on("user:show", function (slug) {
            API.userView(slug);
        });
        //Show profile data
        SocialManager.vent.on("profileData:show", function (_id, slug, type) {
            if (_id && $(".mainWrap").data("user") != _id) {
                //Navigate
                if (type == "discussions") {
                    SocialManager.navigate("social/user/" + slug);
                } else {
                    SocialManager.navigate("social/user/" + slug + "/" + type);
                }
                //Show
                if (type == "following" || type == "followers") {
                    API.usersView(_id, type);
                } else if (type == "discussions") {
                    API.onlyDiscussionsView("user", "", _id);
                }
            } else {
                //Navigate
                if (type == "discussions") {
                    SocialManager.navigate("social/me");
                } else if (type == "queued") {
                    SocialManager.navigate("social/queued");
                } else {
                    SocialManager.navigate("social/me/" + type);
                }
                //Show
                if (type == "following" || type == "followers") {
                    API.usersView("", type);
                } else if (type == "discussions") {
                    API.onlyDiscussionsView("my");
                } else if (type == "queued") {
                    API.onlyDiscussionsView("queued");
                }
            }
        });
        //Show activity
        SocialManager.vent.on("activity:show", function () {
            API.activityView();
        });
        //Show settings overlay
        SocialManager.vent.on("settings:show", function () {
            API.settingsView();
        });
        //Initialize router with API
        SocialManager.addInitializer(function () {
            new SocialApp.Router({ controller: API });
        });
    }
);
//Models and Collections of the Application
SocialManager.module(
    "Entities",
    function (Entities, SocialManager, Backbone, Marionette, $, _) {
        //Streak
        Entities.Streak = Backbone.Model.extend({
            idAttribute: "_id",
            urlRoot: "/api/streak",
        });
        //Tag Model and Collection
        Entities.Tag = Backbone.Model.extend({
            initialize: function (options) {
                this._action = options._action;
                this._id = options._id;
            },
            url: function () {
                if (this._action) {
                    return "/api/tag/" + this._id + "/" + this._action;
                } else if (this._id) {
                    return "/api/tag/" + this._id;
                } else {
                    return "/api/tag";
                }
            },
            idAttribute: "_id",
        });
        Entities.TagCollection = Backbone.Collection.extend({
            initialize: function (models, options) {
                //_type is type of tags: all, my etc
                this._type = options._type;
            },
            url: function () {
                if (this._type) {
                    return "/api/tags/" + this._type;
                } else {
                    return "/api/tags";
                }
            },
            model: Entities.Tag,
        });
        //Discussion Model and Collection
        Entities.Discussion = Backbone.Model.extend({
            initialize: function (options) {
                //type is type of discussion - text, link, poll etc.
                //_action are discussion actions - edit, pin etc
                this._type = options.type;
                this._action = options._action;
                this._id = options._id;
            },
            url: function () {
                //Get - Edit single discussion
                if (this._action) {
                    return "/api/discussion/" + this._id + "/" + this._action;
                } else if (this._id) {
                    return "/api/discussion/" + this._id;
                } else if (this._type) {
                    return "/api/discussion/" + this._type;
                } else {
                    return "/api/discussion";
                }
            },
            idAttribute: "_id",
        });
        Entities.DiscussionCollection = Backbone.Collection.extend({
            initialize: function (models, options) {
                //_type is type of discussions- recent, top, my, voted, search
                //_tag is tag id
                //_user is user id
                //_text is search text
                this._type = options._type;
                this._tag = options._tag;
                this._user = options._user;
                this._text = options._text;
                this._page = options._page;
            },
            url: function () {
                if (this._text || this._type == "search") {
                    return (
                        "/api/search/discussions?text=" +
                        this._text +
                        "&page=" +
                        this._page
                    );
                } else if (this._type && this._tag) {
                    return (
                        "/api/discussions/" +
                        this._type +
                        "?tag=" +
                        this._tag +
                        "&page=" +
                        this._page
                    );
                } else if (this._user) {
                    return (
                        "/api/discussions/" +
                        this._type +
                        "?user=" +
                        this._user +
                        "&page=" +
                        this._page
                    );
                } else if (this._type) {
                    return (
                        "/api/discussions/" + this._type + "?page=" + this._page
                    );
                } else {
                    return "/api/discussions?page=" + this._page;
                }
            },
            model: Entities.Discussion,
        });
        //Comment Model
        Entities.Comment = Backbone.Model.extend({
            initialize: function (options) {
                this._action = options._action;
                this._id = options._id;
            },
            url: function () {
                //Get - Edit single comment or reply
                if (this._action) {
                    return "/api/comment/" + this._id + "/" + this._action;
                } else if (this._id) {
                    return "/api/comment/" + this._id;
                } else {
                    return "/api/comment";
                }
            },
            idAttribute: "_id",
        });
        //Badge Model and Collection
        Entities.Badge = Backbone.Model.extend({
            urlRoot: "/api/badge",
            idAttribute: "_id",
        });
        Entities.BadgeCollection = Backbone.Collection.extend({
            url: "/api/badges",
            model: Entities.Badge,
        });
        //Activity
        Entities.ActivityCollection = Backbone.Collection.extend({
            initialize: function (models, options) {
                this._page = options._page;
            },
            url: function () {
                if (this._page) {
                    return "/api/activity?page=" + this._page;
                } else {
                    return "/api/activity";
                }
            },
        });
        //User
        Entities.User = Backbone.Model.extend({
            initialize: function (options) {
                if (options) this._id = options._id;
            },
            url: function () {
                if (this._id) {
                    return "/api/user/" + this._id;
                } else {
                    return "/api/me";
                }
            },
            idAttribute: "_id",
        });
        //Following
        Entities.Following = Backbone.Model.extend({
            urlRoot: "/api/following",
            idAttribute: "_id",
        });
        Entities.FollowingList = Backbone.Collection.extend({
            initialize: function (models, options) {
                //_id is user_id
                this._id = options._id;
            },
            url: function () {
                if (this._id) {
                    return "/api/following?user=" + this._id;
                } else {
                    return "/api/following";
                }
            },
            model: Entities.Following,
        });
        //Followers
        Entities.FollowerList = Backbone.Collection.extend({
            initialize: function (models, options) {
                //_id is user_id
                this._id = options._id;
            },
            url: function () {
                if (this._id) {
                    return "/api/followers?user=" + this._id;
                } else {
                    return "/api/followers";
                }
            },
        });
        //Link Preview
        Entities.LinkPreview = Backbone.Model.extend({
            initialize: function (options) {
                this._url = options._url;
            },
            url: function () {
                if (this._url) {
                    return "/api/embedlink?url=" + this._url;
                }
            },
            idAttribute: "_id",
        });
        //Functions to get data
        var API = {
            getStreak: function () {
                var streak = new Entities.Streak({});
                var defer = $.Deferred();
                streak.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                    error: function () {
                        defer.reject();
                    },
                });
                return defer.promise();
            },
            getTags: function (_type) {
                var tagList = new Entities.TagCollection([], {
                    _type: _type,
                });
                var defer = $.Deferred();
                tagList.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getOneTag: function (_id) {
                var tag = new Entities.Tag({
                    _id: _id,
                });
                var defer = $.Deferred();
                tag.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getDiscussions: function (_type, _tag, _user, _text, _page) {
                var discussions = new Entities.DiscussionCollection([], {
                    _type: _type,
                    _tag: _tag,
                    _user: _user,
                    _text: _text,
                    _page: _page,
                });
                var defer = $.Deferred();
                discussions.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                    error: function () {
                        defer.reject();
                    },
                });
                return defer.promise();
            },
            getOneDiscussion: function (_id) {
                var discussion = new Entities.Discussion({
                    _id: _id,
                });
                var defer = $.Deferred();
                discussion.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                    error: function () {
                        defer.reject();
                    },
                });
                return defer.promise();
            },
            getBadges: function () {
                var badges = new Entities.BadgeCollection();
                var defer = $.Deferred();
                badges.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                    error: function () {
                        defer.reject();
                    },
                });
                return defer.promise();
            },
            getActivities: function (_page) {
                var activities = new Entities.ActivityCollection([], {
                    _page: _page,
                });
                var defer = $.Deferred();
                activities.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                    error: function () {
                        defer.reject();
                    },
                });
                return defer.promise();
            },
            getUserDetails: function (_id) {
                var user = new Entities.User({
                    _id: _id,
                });
                var defer = $.Deferred();
                user.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getFollowers: function (_id) {
                var followers = new Entities.FollowerList([], {
                    _id: _id,
                });
                var defer = $.Deferred();
                followers.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                    error: function () {
                        defer.reject();
                    },
                });
                return defer.promise();
            },
            getFollowing: function (_id) {
                var following = new Entities.FollowingList([], {
                    _id: _id,
                });
                var defer = $.Deferred();
                following.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                    error: function () {
                        defer.reject();
                    },
                });
                return defer.promise();
            },
            getLinkPreview: function (_url) {
                var linkpreview = new Entities.LinkPreview({
                    _url: _url,
                });
                var defer = $.Deferred();
                linkpreview.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                    error: function () {
                        defer.reject();
                    },
                });
                return defer.promise();
            },
        };
        //Request Response Callbacks
        SocialManager.reqres.setHandler("streak:entities", function () {
            return API.getStreak();
        });
        SocialManager.reqres.setHandler("tag:entities", function (_type) {
            return API.getTags(_type);
        });
        SocialManager.reqres.setHandler("tag:entity", function (_id) {
            return API.getOneTag(_id);
        });
        SocialManager.reqres.setHandler(
            "discussion:entities",
            function (_type, _tag, _user, _text, _page) {
                return API.getDiscussions(_type, _tag, _user, _text, _page);
            }
        );
        SocialManager.reqres.setHandler("discussion:entity", function (_id) {
            return API.getOneDiscussion(_id);
        });
        SocialManager.reqres.setHandler("badge:entities", function () {
            return API.getBadges();
        });
        SocialManager.reqres.setHandler("activity:entities", function (_page) {
            return API.getActivities(_page);
        });
        SocialManager.reqres.setHandler("userDetails:entity", function (slug) {
            return API.getUserDetails(slug);
        });
        SocialManager.reqres.setHandler("followers:entities", function (_id) {
            return API.getFollowers(_id);
        });
        SocialManager.reqres.setHandler("following:entities", function (_id) {
            return API.getFollowing(_id);
        });
        SocialManager.reqres.setHandler("linkPreview:entity", function (_url) {
            return API.getLinkPreview(_url);
        });
    }
);
//Views of the Application
SocialManager.module(
    "SocialApp.EntityViews",
    function (EntityViews, SocialManager, Backbone, Marionette, $, _) {
        //Login view
        EntityViews.LoginView = Marionette.ItemView.extend({
            template: "loginTemplate",
            events: {
                "mousedown .js-close, .js-forgot, .js-signup, .js-submit, .label, .social-connect a":
                    "doNothing",
                "click .js-close": "closeOverlay",
                "click .js-forgot": "showForgotOverlay",
                "click .js-signup": "showSignupOverlay",
                "blur .js-email input": "checkEmail",
                "blur .js-password input": "checkPassword",
                "focus .input": "showError",
                "submit .js-form": "submitForm",
            },
            doNothing: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.navigate("social");
                SocialManager.commands.execute("close:overlay");
            },
            showForgotOverlay: function (ev) {
                ev.preventDefault();
                var email = this.$(".js-email input").val() || "";
                SocialManager.vent.trigger("forgotOverlay:show", email);
            },
            showSignupOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.vent.trigger("signupOverlay:show");
            },
            checkEmail: function () {
                var emailVal = this.$(".js-email input").val();
                if (!emailVal) {
                    this.$(".js-email .u-formError")
                        .text("Please enter an email address:")
                        .hide();
                    this.$(".js-email input").addClass("hasError");
                } else {
                    this.$(".js-email .u-formError").text("").hide();
                    this.$(".js-email input").removeClass("hasError");
                }
            },
            checkPassword: function () {
                var passwordVal = this.$(".js-password input").val();
                if (!passwordVal) {
                    this.$(".js-password .u-formError")
                        .text("Please enter a password:")
                        .hide();
                    this.$(".js-password input").addClass("hasError");
                } else if (passwordVal.length < 8) {
                    this.$(".js-password .u-formError")
                        .text("Passwords must be 8 characters or more:")
                        .hide();
                    this.$(".js-password input").addClass("hasError");
                } else {
                    this.$(".js-password .u-formError").text("").hide();
                    this.$(".js-password input").removeClass("hasError");
                }
            },
            showError: function (ev) {
                var $target = $(ev.target);
                $target.removeClass("hasError");
                $target.prev().show();
            },
            submitForm: function (ev) {
                this.checkPassword();
                if (!this.$(".input.hasError").length) {
                    return true;
                } else {
                    ev.preventDefault();
                    this.$(".input.hasError").eq(0).focus();
                    return false;
                }
            },
        });
        //Signup view
        EntityViews.SignupView = Marionette.ItemView.extend({
            template: "signupTemplate",
            events: {
                "mousedown .js-close, .js-login, .js-submit": "doNothing",
                "click .js-close": "closeOverlay",
                "click .js-login": "showLoginOverlay",
                "blur .js-name input": "checkName",
                "blur .js-email input": "checkEmail",
                "blur .js-password input": "checkPassword",
                "focus .input": "showError",
                "submit .js-form": "submitForm",
            },
            doNothing: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.navigate("social");
                SocialManager.commands.execute("close:overlay");
            },
            showLoginOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.vent.trigger("loginOverlay:show");
            },
            checkName: function () {
                var alphaSpace = /^[a-zA-Z\s]+$/;
                var nameVal = this.$(".js-name input").val().trim();
                if (!nameVal) {
                    this.$(".js-name .u-formError")
                        .text("Please enter your name:")
                        .hide();
                    this.$(".js-name input").addClass("hasError");
                } else if (!alphaSpace.test(nameVal)) {
                    this.$(".js-name .u-formError")
                        .text("Name contains invalid characters:")
                        .hide();
                    this.$(".js-name input").addClass("hasError");
                } else {
                    //Set first name greeting
                    var firstname = nameVal.split(" ")[0];
                    this.$("h2.message span").text(", " + firstname);
                    //hide name errors
                    this.$(".js-name .u-formError").text("").hide();
                    this.$(".js-name input").removeClass("hasError");
                }
            },
            checkEmail: function () {
                var emailRegex =
                    /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                var emailVal = this.$(".js-email input").val();
                if (!emailVal) {
                    this.$(".js-email .u-formError")
                        .text("Please enter an email address:")
                        .hide();
                    this.$(".js-email input").addClass("hasError");
                } else if (!emailRegex.test(emailVal)) {
                    this.$(".js-email .u-formError")
                        .text("Please enter a valid email address:")
                        .hide();
                    this.$(".js-email input").addClass("hasError");
                } else {
                    this.$(".js-email .u-formError").text("").hide();
                    this.$(".js-email input").removeClass("hasError");
                }
            },
            checkPassword: function () {
                var passwordVal = this.$(".js-password input").val();
                if (!passwordVal) {
                    this.$(".js-password .u-formError")
                        .text("Please enter a password:")
                        .hide();
                    this.$(".js-password input").addClass("hasError");
                } else if (passwordVal.length < 8) {
                    this.$(".js-password .u-formError")
                        .text("Passwords must be 8 characters or more:")
                        .hide();
                    this.$(".js-password input").addClass("hasError");
                } else {
                    this.$(".js-password .u-formError").text("").hide();
                    this.$(".js-password input").removeClass("hasError");
                }
            },
            showError: function (ev) {
                var $target = $(ev.target);
                $target.removeClass("hasError");
                $target.prev().show();
            },
            submitForm: function (ev) {
                this.checkName();
                this.checkEmail();
                this.checkPassword();
                if (!this.$(".input.hasError").length) {
                    return true;
                } else {
                    ev.preventDefault();
                    this.$(".input.hasError").eq(0).focus();
                    return false;
                }
            },
        });
        //Forgot password view
        EntityViews.ForgotView = Marionette.ItemView.extend({
            template: "forgotTemplate",
            events: {
                "mousedown .js-close, .js-login, .js-submit": "doNothing",
                "click .js-close": "closeOverlay",
                "click .js-login": "showLoginOverlay",
                "blur .js-email input": "checkEmail",
                "focus .input": "showError",
                "submit .js-form": "submitForm",
            },
            doNothing: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.navigate("social");
                SocialManager.commands.execute("close:overlay");
            },
            showLoginOverlay: function (ev) {
                ev.preventDefault();
                var email = this.$(".js-email input").val() || "";
                SocialManager.vent.trigger("loginOverlay:show", email);
            },
            checkEmail: function () {
                var emailRegex =
                    /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                var emailVal = this.$(".js-email input").val();
                if (!emailVal) {
                    this.$(".js-email .u-formError")
                        .text("Please enter an email address:")
                        .hide();
                    this.$(".js-email input").addClass("hasError");
                } else if (!emailRegex.test(emailVal)) {
                    this.$(".js-email .u-formError")
                        .text("Please enter a valid email address:")
                        .hide();
                    this.$(".js-email input").addClass("hasError");
                } else {
                    this.$(".js-email .u-formError").text("").hide();
                    this.$(".js-email input").removeClass("hasError");
                }
            },
            showError: function (ev) {
                var $target = $(ev.target);
                $target.removeClass("hasError");
                $target.prev().show();
            },
            submitForm: function (ev) {
                this.checkEmail();
                if (!this.$(".input.hasError").length) {
                    return true;
                } else {
                    ev.preventDefault();
                    this.$(".input.hasError").eq(0).focus();
                    return false;
                }
            },
        });
        //Streak view
        EntityViews.StreakView = Marionette.ItemView.extend({
            template: "streakTemplate",
        });
        //New tag view
        EntityViews.NewTagView = Marionette.ItemView.extend({
            template: "newTagTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "input .tag-name": "showSaveButton",
                "click .js-save:not(.u-disabled)": "saveTag",
                "input .tag-desc": "showDoneBtn",
                "click .privacy-label input": "showDoneBtn",
                "click .js-activate-tag": "toggleActiveState",
                "click .js-delete-tag": "deleteTag",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.commands.execute("close:overlay");
            },
            showSaveButton: function (ev) {
                if (this.$(".tag-name").val().trim()) {
                    this.$(".js-save").removeClass("u-disabled");
                } else {
                    this.$(".js-save").addClass("u-disabled");
                }
            },
            saveTag: function (ev) {
                ev.preventDefault();
                var value = {
                    name: this.$(".tag-name").val().trim(),
                    desc: this.$(".tag-desc").val(),
                };
                //Check if private
                if (this.$(".privacy-label input").is(":checked")) {
                    value.is_public = false;
                } else {
                    value.is_public = true;
                }
                //Create - Edit tag
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    this.trigger("update:tag", value);
                } else {
                    this.trigger("save:tag", value);
                }
            },
            showDoneBtn: function (ev) {
                if (
                    this.$(".overlay-box").hasClass("edit-box") &&
                    this.$(".tag-name").val().trim()
                ) {
                    this.$(".js-save").removeClass("u-disabled");
                }
            },
            toggleActiveState: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("tag-edit-activate")) {
                    this.trigger("activate:tag");
                } else if ($target.hasClass("tag-edit-deactivate")) {
                    this.trigger("deactivate:tag");
                }
            },
            deleteTag: function (ev) {
                ev.preventDefault();
                if (!this.$(".overlay-box").hasClass("edit-box")) return;
                //Delete
                var _this = this;
                swal(
                    {
                        title: "Are you ABSOLUTELY sure?",
                        text: "This action <span style='color:#f00'>CANNOT</span> be undone. <br><br> This will permanently delete the tag and all its discussions.",
                        html: true,
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#f00",
                        confirmButtonText: "Yes, delete it!",
                        closeOnConfirm: false,
                    },
                    function () {
                        swal.close();
                        _this.trigger("delete:tag");
                    }
                );
            },
        });
        //Tag member item view
        EntityViews.TagMemberItemView = Marionette.ItemView.extend({
            tagName: "div",
            className: "person",
            template: "memberOneTemplate",
            events: {
                "click .add-user": "addUser",
                "click .remove-user": "removeUser",
            },
            addUser: function () {
                var value = {
                    user_id: this.model.get("user")._id,
                };
                this.trigger("add:user", value);
            },
            removeUser: function () {
                if (this.model.get("user")) {
                    var value = {
                        user_id: this.model.get("user")._id,
                        exclude_email: this.model.get("user").email,
                    };
                } else {
                    var value = {
                        email: this.model.get("email"),
                    };
                }
                this.trigger("remove:user", value);
            },
        });
        //Tag members view
        EntityViews.TagMembersView = Marionette.CompositeView.extend({
            template: "tagMembersTemplate",
            childView: EntityViews.TagMemberItemView,
            childViewContainer: "div.member-list",
            events: {
                "click .js-close, .js-done": "closeOverlay",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    var members_length = this.$(".member-list .person").length;
                    //Update members count
                    if (!members_length) {
                        $(".header-info .members-count").remove();
                    } else {
                        if ($(".header-info .members-count").length) {
                            $(".header-info .members-count span").text(
                                "+" + members_length
                            );
                        } else {
                            $(".header-info .header-users .btn-invite").before(
                                "<p class='members-count user-initials'><span>+" +
                                    members_length +
                                    "</span></p>"
                            );
                        }
                    }
                } else {
                    if (this.$(".overlay-box").data("slug")) {
                        SocialManager.vent.trigger(
                            "tag:show",
                            this.$(".overlay-box").data("slug")
                        );
                    }
                }
                SocialManager.commands.execute("close:overlay");
            },
        });
        //Tag item view
        EntityViews.TagItemView = Marionette.ItemView.extend({
            tagName: "a",
            className: "one-tag",
            template: "tagOneTemplate",
            initialize: function () {
                this.$el.attr("href", "/social/tag/" + this.model.get("slug"));
                this.$el.attr("data-slug", this.model.get("slug"));
                this.$el.css(
                    "border-left-color",
                    this.model.get("color") + ";"
                );
            },
            events: {
                click: "getTaggedDiscussions",
            },
            getTaggedDiscussions: function (ev) {
                if (ev.metaKey || ev.ctrlKey) return;
                ev.preventDefault();
                if ($(".mainWrap").data("user")) {
                    SocialManager.vent.trigger(
                        "tag:show",
                        this.model.get("slug")
                    );
                } else {
                    SocialManager.vent.trigger("loginOverlay:show");
                }
            },
        });
        //Tag collection view
        EntityViews.TagsView = Marionette.CollectionView.extend({
            className: "all-tags",
            childView: EntityViews.TagItemView,
            events: {
                "click .explore-tags": "showExploreTags",
            },
            showExploreTags: function (ev) {
                ev.preventDefault();
                SocialManager.vent.trigger("exploreTags:show", true);
            },
        });
        //One tag view
        EntityViews.OneTagView = Marionette.ItemView.extend({
            template: "tagHeaderTemplate",
            className: "tagHeader",
            events: {
                "click .edit-tag": "showEditTagOverlay",
                "click .edit-members": "showEditTagMembersOverlay",
                "click .join-tag": "joinTag",
                "click .unjoin-tag": "unJoinTag",
                "click .leave-tag": "leaveTag",
                "click .subscribe-tag": "subscribeToTag",
                "click .unsubscribe-tag": "unsubscribeFromTag",
            },
            showEditTagOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.vent.trigger(
                    "editTagOverlay:show",
                    this.model.get("_id")
                );
            },
            showEditTagMembersOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.vent.trigger(
                    "tagMembers:show",
                    this.model.get("_id"),
                    true
                );
            },
            joinTag: function (ev) {
                ev.preventDefault();
                this.trigger("join:tag", this.model.get("_id"));
            },
            unJoinTag: function (ev) {
                ev.preventDefault();
                this.trigger("unjoin:tag", this.model.get("_id"));
            },
            leaveTag: function (ev) {
                ev.preventDefault();
                this.trigger("leave:tag", this.model.get("_id"));
            },
            subscribeToTag: function (ev) {
                ev.preventDefault();
                this.trigger("subscribe:tag", this.model.get("_id"));
            },
            unsubscribeFromTag: function (ev) {
                ev.preventDefault();
                this.trigger("unsubscribe:tag", this.model.get("_id"));
            },
        });
        //New discussion view
        EntityViews.NewDiscussionView = Marionette.ItemView.extend({
            template: "newDiscussionTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "click .discussion-type > div": "showEntityArea",
                "input .link-embed": "showPreviewLink",
                "click .link-add": "embedLink",
                "click .one-shot": "selectImage",
                "click #drop": "openFileBrowser",
                "click .ch-dropbox": "openDropboxChooser",
                "keyup .new-poll": "addPoll",
                "keydown .cell": "keydownUpdatePolls",
                "keyup .cell": "keyupUpdatePolls",
                "click .file-input": "doNothing",
                "click .status-select > div": "selectStatus",
                "click .js-save": "saveDiscussion",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.commands.execute("close:overlay");
            },
            showEntityArea: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                this.$(".discussion-type > div").removeClass("selected");
                $target.addClass("selected");
                this.$(".entity-area > div").hide();
                this.$(".js-save").addClass("u-hide");
                //Show entity area
                if ($target.hasClass("type-text")) {
                    this.$(".entity-area .text-discussion").show();
                    this.$(".text-discussion-title").focus();
                } else if ($target.hasClass("type-link")) {
                    this.$(".entity-area .link-discussion").show();
                    this.$(".link-embed").focus();
                } else if ($target.hasClass("type-file")) {
                    this.$(".entity-area .file-discussion").show();
                    this.$(".file-discussion-title").focus();
                    this.trigger("open:fileBrowser");
                    this.trigger("open:driveChooser");
                } else if ($target.hasClass("type-poll")) {
                    this.$(".entity-area .poll-discussion").show();
                    this.$(".poll-discussion-title").focus();
                }
            },
            showPreviewLink: function (ev) {
                var url = this.$(".link-embed").val().trim();
                if (validator.isURL(url)) {
                    this.$(".link-add").removeClass("u-hide");
                } else {
                    this.$(".link-add").addClass("u-hide");
                }
            },
            embedLink: function (ev) {
                var url = this.$(".link-embed").val().trim();
                //Disable input
                this.$(".link-embed").prop("disabled", true);
                this.$(".link-add").text("Loading...");
                //Get Preview
                var _this = this;
                var fetchingLinkpreview = SocialManager.request(
                    "linkPreview:entity",
                    url
                );
                $.when(fetchingLinkpreview).done(function (data) {
                    //Save link data
                    linkEmbedData = data;
                    //Hide preview button
                    _this
                        .$(".link-add")
                        .text("Preview link")
                        .addClass("u-hide");
                    //Show Preview
                    _this.$(".link-preview").show();
                    _this.$(".preview-title").text(data.get("title"));
                    _this
                        .$(".preview-provider a")
                        .attr("href", data.get("url"))
                        .text(data.get("provider_name"));
                    //Show shots
                    if (data.get("images") && data.get("images").length) {
                        for (var i = 0; i < data.get("images").length; i++) {
                            //Get image with http protocol
                            var imageUrl = data
                                .get("images")
                                [i].url.replace(/^https:\/\//i, "http://");
                            //Show only images which are large
                            if (
                                data.get("images")[i].width > 200 &&
                                data.get("images")[i].height > 100
                            ) {
                                _this
                                    .$(".preview-shots")
                                    .append(
                                        "<div class='one-shot last'></div>"
                                    );
                                _this
                                    .$(".preview-shots .one-shot.last")
                                    .css(
                                        "background-image",
                                        'url("' + imageUrl + '")'
                                    )
                                    .removeClass("last");
                            }
                        }
                        //Show shots and desc
                        if (_this.$(".preview-shots > div").length) {
                            _this
                                .$(".preview-shots > div")
                                .eq(0)
                                .addClass("selected");
                            _this.$(".preview-shots").show();
                        } else {
                            _this
                                .$(".preview-desc")
                                .text(data.get("description"));
                        }
                    }
                    //Show save button
                    _this.$(".js-save").removeClass("u-hide");
                });
            },
            selectImage: function (ev) {
                var $target = $(ev.currentTarget);
                this.$(".preview-shots .one-shot").removeClass("selected");
                $target.addClass("selected");
            },
            openFileBrowser: function (ev) {
                this.$(".file-discussion .file-input").click();
            },
            openDropboxChooser: function () {
                this.trigger("open:dropBoxChooser");
            },
            addPoll: function (ev) {
                ev.stopPropagation();
                var $target = $(ev.target);
                //If empty return
                var content = $target.val().trim();
                if (!content) return;
                //else add new poll and focus on it
                this.$(".draft-polls .new-poll-row").before(
                    "<p class='row'><span class='radio-cell'></span><span class='cell' contenteditable='true'>" +
                        content +
                        "</span><span aria-hidden='true' class='icon icon-remove'></span></p>"
                );
                placeCaretAtEnd(
                    $(".draft-polls .new-poll-row").prev().find(".cell")[0]
                );
                $target.val("");
                //Show save button
                if (
                    this.$(".poll-discussion-title").val().trim() &&
                    this.$(".draft-polls .row").length > 1
                ) {
                    this.$(".js-save").removeClass("u-hide");
                }
            },
            keydownUpdatePolls: function (ev) {
                var $target = $(ev.target);
                //caretOffset gives the position (int) of caret.
                //beforeCaret and afterCaret gives text before and after cursor position
                var caretOffset = getCaretCharacterOffsetWithin($target[0]);
                var lengthString = $target.text().length;
                var beforeCaret = $target.text().substring(0, caretOffset);
                var afterCaret = $target
                    .text()
                    .substring(caretOffset, lengthString);
                //On key press: ENTER, BACKSPACE OR DELETE
                if (ev.which == ENTER_KEY) {
                    ev.preventDefault();
                    ev.stopPropagation();
                } else if (ev.which == BACKSPACE_KEY && !beforeCaret.length) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    //Focus at end of previous element
                    placeCaretAtEnd($target.parent().prev().find(".cell")[0]);
                    //Insert target's text at cursor
                    insertTextAtCursor($target.text());
                    //Remove poll
                    $target.parent().remove();
                } else if (
                    ev.which == DELETE_KEY &&
                    !afterCaret.length &&
                    !$target.parent().next().hasClass("new-poll-row")
                ) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    //Insert next element's text at current position
                    var nextText = $target.parent().next().find(".cell").text();
                    insertTextAtCursor(nextText);
                    //Remove poll
                    $target.parent().next().remove();
                }
                //Show save button
                if (
                    this.$(".poll-discussion-title").val().trim() &&
                    this.$(".draft-polls .row").length > 1
                ) {
                    this.$(".js-save").removeClass("u-hide");
                }
            },
            keyupUpdatePolls: function (ev) {
                var $target = $(ev.target);
                var caretOffset = getCaretCharacterOffsetWithin($target[0]);
                var lengthString = $target.text().length;
                var beforeCaret = $target.text().substring(0, caretOffset);
                var afterCaret = $target
                    .text()
                    .substring(caretOffset, lengthString);
                //On ENTER and Update on typing
                if (ev.which == ENTER_KEY) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    if (afterCaret) {
                        //Update current poll
                        $target.text(beforeCaret);
                        //Create new poll with afterCaret content
                        $target
                            .parent()
                            .after(
                                "<p class='row'><span class='radio-cell'></span><span class='cell' contenteditable='true'>" +
                                    afterCaret +
                                    "</span><span aria-hidden='true' class='icon icon-remove'></span></p>"
                            );
                        //Focus on new poll
                        $target.parent().next().find(".cell").focus();
                    } else if (
                        $target.parent().next().hasClass("new-poll-row")
                    ) {
                        this.$(".draft-polls input.new-poll").focus();
                    } else {
                        //Create new poll with content
                        $target
                            .parent()
                            .after(
                                "<p class='row'><span class='radio-cell'></span><span class='cell' contenteditable='true'></span><span aria-hidden='true' class='icon icon-remove'></span></p>"
                            );
                        $target.parent().next().find(".cell").focus();
                    }
                }
                //Show save button
                if (
                    this.$(".poll-discussion-title").val().trim() &&
                    this.$(".draft-polls .row").length > 1
                ) {
                    this.$(".js-save").removeClass("u-hide");
                }
            },
            doNothing: function (ev) {
                ev.stopPropagation();
            },
            selectStatus: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                this.$(".status-select > div").removeClass("selected");
                $target.addClass("selected");
            },
            saveDiscussion: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("uploading")) return;
                if (this.$(".type-link").hasClass("selected")) {
                    if (!linkEmbedData) return;
                    //Selected image
                    if (this.$(".one-shot.selected").length) {
                        var image = this.$(".one-shot.selected")
                            .css("background-image")
                            .replace(/^url\(["']?/, "")
                            .replace(/["']?\)$/, "");
                    }
                    var value = {
                        type: "link",
                        linkdata: linkEmbedData,
                        image: image,
                    };
                    linkEmbedData = "";
                } else if (this.$(".type-text").hasClass("selected")) {
                    var value = {
                        type: "text",
                        title: this.$(".text-discussion-title").val().trim(),
                    };
                } else if (this.$(".type-poll").hasClass("selected")) {
                    //Get polls
                    var polls = [];
                    var num = this.$(".draft-polls").children(".row").length;
                    for (var i = 0; i < num; i++) {
                        if (
                            this.$(".draft-polls span.cell").eq(i).text().trim()
                        )
                            polls.push(
                                this.$(".draft-polls span.cell").eq(i).text()
                            );
                    }
                    //Create
                    var value = {
                        type: "poll",
                        title: this.$(".poll-discussion-title").val().trim(),
                        polls: polls,
                    };
                }
                //Select status
                if (this.$(".status-queued").hasClass("selected")) {
                    value.status = "queued";
                }
                this.trigger("save:discussion", value);
            },
        });
        //Discussion item view
        EntityViews.DiscussionItemView = Marionette.ItemView.extend({
            tagName: "a",
            className: "one-card",
            template: "discussionOneTemplate",
            initialize: function () {
                this.$el.attr(
                    "href",
                    "/social/discussion/" + this.model.get("slug")
                );
                this.$el.data("id", this.model.get("_id"));
            },
            events: {
                click: "getDiscussion",
                "click .card-provider a": "showProvider",
                "click .radio-cell": "toggleStatus",
                "click .card-info .user-label": "showUser",
                "click .comment-main a.name": "showUser",
            },
            getDiscussion: function (ev) {
                if (ev.metaKey || ev.ctrlKey) return;
                ev.preventDefault();
                ev.stopPropagation();
                //Show discussion
                if ($(".mainWrap").data("user")) {
                    SocialManager.vent.trigger(
                        "oneDiscussion:show",
                        this.model.get("slug")
                    );
                } else {
                    SocialManager.vent.trigger("loginOverlay:show");
                }
            },
            showProvider: function (ev) {
                ev.stopPropagation();
            },
            toggleStatus: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.target);
                if ($target.hasClass("selected")) {
                    //Remove vote
                    $target.removeClass("selected");
                    this.$(".polls-list").addClass("not-voted");
                    //Update total number of votes
                    var votes = parseInt(this.$(".card-provider b").text());
                    if (votes > 1) {
                        votes = votes - 1;
                        if (votes == 1) {
                            this.$(".card-provider").html("<b> 1 </b> vote");
                        } else {
                            this.$(".card-provider").html(
                                "<b> " + votes + " </b> votes"
                            );
                        }
                    } else {
                        votes = 0;
                        this.$(".card-provider").html("<b> No </b> votes");
                    }
                    //Update count
                    var count = parseInt($target.next().find("b").text());
                    if (count > 1) {
                        count = count - 1;
                        $target.next().find("b").text(count);
                    } else {
                        count = 0;
                        $target.next().find("b").remove();
                    }
                    //Update bar for all options
                    var rows = this.$(".polls-list .row");
                    for (var i = 0; i < rows.length; i++) {
                        if (rows.eq(i).find("b").length) {
                            //Get count
                            var count = parseInt(rows.eq(i).find("b").text());
                            var percentage = (count / votes) * 100;
                            rows.eq(i)
                                .next()
                                .find(".row-percent")
                                .css("width", percentage + "%");
                        } else {
                            rows.eq(i)
                                .next()
                                .find(".row-percent")
                                .css("width", "");
                        }
                    }
                    //Send
                    var value = {
                        discussion_id: this.model.get("_id"),
                        ref_id: $target.next().data("pollid"),
                        position: 7,
                    };
                } else {
                    //Check if there are other votes
                    if (this.$(".radio-cell.selected").length) {
                        //Remove previous votes
                        this.$(".radio-cell.selected").click();
                    }
                    //Add current
                    $target.addClass("selected");
                    this.$(".polls-list").removeClass("not-voted");
                    //Update total number of votes
                    var votes = parseInt(this.$(".card-provider b").text());
                    if (isNaN(votes)) {
                        votes = 1;
                        this.$(".card-provider").html("<b> 1 </b> vote");
                    } else {
                        votes = votes + 1;
                        this.$(".card-provider").html(
                            "<b> " + votes + " </b> votes"
                        );
                    }
                    //Get count
                    if ($target.next().find("b").length) {
                        //Update count
                        var count = parseInt($target.next().find("b").text());
                        count = count + 1;
                        $target.next().find("b").text(count);
                    } else {
                        var count = 1;
                        $target
                            .next()
                            .html($target.next().text() + "<b> 1 </b>");
                    }
                    //Update bar for all options
                    var rows = this.$(".polls-list .row");
                    for (var i = 0; i < rows.length; i++) {
                        //Get count
                        if (rows.eq(i).find("b").length) {
                            var count = parseInt(rows.eq(i).find("b").text());
                            //Update voted bar
                            var percentage = (count / votes) * 100;
                            rows.eq(i)
                                .next()
                                .find(".row-percent")
                                .css("width", percentage + "%");
                        }
                    }
                    //Send
                    var value = {
                        discussion_id: this.model.get("_id"),
                        ref_id: $target.next().data("pollid"),
                        position: 6,
                    };
                }
                this.trigger("update:poll", value);
            },
            showUser: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                //Check if logged in
                if (!$(".mainWrap").data("user")) {
                    SocialManager.vent.trigger("loginOverlay:show");
                    return;
                }
                var $target = $(ev.currentTarget);
                SocialManager.vent.trigger(
                    "user:show",
                    $target.data("username")
                );
            },
        });
        //Discussions section view
        EntityViews.DiscussionsSectionView = Marionette.CompositeView.extend({
            template: "discussionsSectionTemplate",
            childView: EntityViews.DiscussionItemView,
            childViewContainer: "div.section-discussions",
            initialize: function () {
                var discussions = this.model.get("discussions");
                this.collection = new Backbone.Collection(discussions);
            },
        });
        //Empty discussions view
        EntityViews.EmptyDiscussionsView = Marionette.ItemView.extend({
            tagName: "div",
            className: "zero-items",
            template: "emptyDiscussionsTemplate",
        });
        //Discussions collection view
        EntityViews.DiscussionsView = Marionette.CollectionView.extend({
            childView: EntityViews.DiscussionsSectionView,
            emptyView: EntityViews.EmptyDiscussionsView,
        });
        //One reply view
        EntityViews.ReplyItemView = Marionette.ItemView.extend({
            tagName: "div",
            className: "one-reply",
            template: "oneReplyTemplate",
            initialize: function () {
                this.$el.attr("data-id", this.model.get("_id"));
            },
            events: {
                "click .like-btn": "toggleLike",
                "click .edit-btn:not(.uploading)": "editComment",
                "click .delete-btn": "deleteComment",
            },
            toggleLike: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    var value = {
                        comment_id: this.model.get("_id"),
                        like_action: "unlike",
                    };
                    $target.removeClass("selected");
                } else {
                    var value = {
                        comment_id: this.model.get("_id"),
                        like_action: "like",
                    };
                    $target.addClass("selected");
                }
                this.trigger("toggle:like", value);
            },
            editComment: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.target);
                if ($target.hasClass("save-btn")) {
                    var value = {
                        comment_id: this.model.get("_id"),
                    };
                    this.trigger("update:comment", value);
                } else {
                    $(".selected-comment .cancel-btn").click();
                    //Show save and cancel btn
                    this.$el.addClass("selected-comment");
                    $target.addClass("save-btn").text("Save");
                    $target
                        .parent()
                        .find(".delete-btn")
                        .addClass("cancel-btn")
                        .text("Cancel");
                    //Show editor
                    this.trigger("edit:comment");
                }
            },
            deleteComment: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("cancel-btn")) {
                    this.trigger("cancel:editComment");
                } else {
                    var value = {
                        comment_id: this.model.get("_id"),
                        index: $(
                            ".one-comment[data-id='" +
                                this.model.get("reply_to") +
                                "']"
                        ).index(),
                    };
                    if (
                        confirm("Are you sure you want to delete this reply?")
                    ) {
                        this.trigger("delete:comment", value);
                    }
                }
            },
        });
        //One Comment view
        EntityViews.CommentItemView = Marionette.CompositeView.extend({
            tagName: "div",
            className: "one-comment",
            template: "oneCommentTemplate",
            childView: EntityViews.ReplyItemView,
            childViewContainer: "div.all-replies",
            initialize: function () {
                var reply_modals = [];
                this.$el.attr("data-id", this.model.get("_id"));
                var replies = this.model.get("replies");
                if (replies && replies.length) {
                    for (var i = 0; i < replies.length; i++) {
                        var reply = new SocialManager.Entities.Comment(
                            replies[i]
                        );
                        reply_modals.push(reply);
                    }
                }
                this.collection = new Backbone.Collection(reply_modals);
            },
            events: {
                "click .js-comment-respond .reply-btn": "showReplyBox",
                "click .js-comment-like": "toggleLike",
                "click .js-comment-actions .edit-btn:not(.uploading)":
                    "editComment",
                "click .js-comment-actions .delete-btn": "deleteComment",
            },
            showReplyBox: function (ev) {
                var $target = $(ev.currentTarget);
                if (this.$el.hasClass("selected-reply")) {
                    //Unselect comment
                    this.$el.removeClass("selected-reply");
                    //Checkbox
                    if ($(".go-anon input").is(":checked")) {
                        var is_checked = true;
                    }
                    //Append comment box
                    var html = this.$(".new-comment").html();
                    this.$(".new-comment").remove();
                    $(".discussion-comments").append(
                        "<div class='new-comment form-text'>" + html + "</div>"
                    );
                    //Set checkbox
                    if (is_checked) {
                        $(".go-anon input").prop("checked", is_checked);
                    }
                    //Hide cancel btn
                    $target.text("Reply");
                    //Show editor
                    this.trigger("show:editorForReply");
                } else {
                    //Select comment
                    $(".js-comment-respond .reply-btn").text("Reply");
                    $(".discussion-comments .one-comment").removeClass(
                        "selected-reply"
                    );
                    this.$el.addClass("selected-reply");
                    //Checkbox
                    if ($(".go-anon input").is(":checked")) {
                        var is_checked = true;
                    }
                    //Append comment box
                    var html = $(".discussion-comments .new-comment").html();
                    $(".discussion-comments .new-comment").remove();
                    this.$(".js-comment-respond").before(
                        "<div class='new-comment form-text'>" + html + "</div>"
                    );
                    this.$(".new-comment").css("marginTop", "10px");
                    //Set checkbox
                    if (is_checked) {
                        $(".go-anon input").prop("checked", is_checked);
                    }
                    //Show cancel btn
                    $target.text("Cancel").show();
                    //Show editor
                    this.trigger("show:editorForReply");
                }
            },
            toggleLike: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    var value = {
                        comment_id: this.model.get("_id"),
                        like_action: "unlike",
                    };
                    $target.removeClass("selected");
                } else {
                    var value = {
                        comment_id: this.model.get("_id"),
                        like_action: "like",
                    };
                    $target.addClass("selected");
                }
                this.trigger("toggle:like", value);
            },
            editComment: function (ev) {
                ev.preventDefault();
                var $target = $(ev.target);
                if ($target.hasClass("save-btn")) {
                    var value = {
                        comment_id: this.model.get("_id"),
                    };
                    this.trigger("update:comment", value);
                } else {
                    $(".selected-comment .cancel-btn").click();
                    //Show save and cancel btn
                    this.$el.addClass("selected-comment");
                    $target.addClass("save-btn").text("Save");
                    $target
                        .parent()
                        .find(".delete-btn")
                        .addClass("cancel-btn")
                        .text("Cancel");
                    //Show editor
                    this.trigger("edit:comment");
                }
            },
            deleteComment: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("cancel-btn")) {
                    this.trigger("cancel:editComment");
                } else {
                    var value = {
                        comment_id: this.model.get("_id"),
                    };
                    if (
                        confirm("Are you sure you want to delete this comment?")
                    ) {
                        this.trigger("delete:comment", value);
                    }
                }
            },
        });
        //One discussion view
        EntityViews.OneDiscussionView = Marionette.CompositeView.extend({
            template: "oneDiscussionTemplate",
            childViewContainer: "div.all-comments",
            childView: EntityViews.CommentItemView,
            initialize: function () {
                var comments = [],
                    comment_modals = [];
                var arr = this.model.get("comments");
                if (arr && arr.length) {
                    for (var i = 0; i < arr.length; i++) {
                        if (!arr[i].reply_to) {
                            comments.push(arr[i]);
                        } else {
                            var last_comment = comments[comments.length - 1];
                            if (last_comment.replies) {
                                last_comment.replies.push(arr[i]);
                            } else {
                                last_comment.replies = [arr[i]];
                            }
                        }
                    }
                }
                for (var i = 0; i < comments.length; i++) {
                    var comment = new SocialManager.Entities.Comment(
                        comments[i]
                    );
                    comment_modals.push(comment);
                }
                this.collection = new Backbone.Collection(comment_modals);
            },
            events: {
                "click .js-close": "closeModal",
                "click .go-anon :checkbox": "goAnon",
                "click .js-submit:not(.uploading)": "addNewComment",
                "click .radio-cell": "toggleStatus",
                "click .edit-discussion": "editDiscussion",
                "click .update-edit": "updateEdit",
                "click .cancel-edit": "cancelEdit",
                "click .tag-discussion": "showTagsOverlay",
                "click .edit-badge": "showBadgesOverlay",
                "click .edit-moderators": "showModeratorsOverlay",
                "click .discussion-info .user-label": "showUser",
                "click .comment-creator a.name": "showUser",
                "click .delete-discussion": "deleteDiscussion",
                "click .feature-discussion": "featureDiscussion",
            },
            closeModal: function (ev) {
                ev.preventDefault();
                SocialManager.commands.execute("close:modal");
            },
            goAnon: function (ev) {
                var $target = $(ev.target);
                var selected = $target.is(":checked");
                if (selected) {
                    this.$(".go-anon span").text(" Remove anonymity");
                    this.$(".js-submit").prop(
                        "value",
                        "Add comment anonymously"
                    );
                } else {
                    this.$(".go-anon span").text(" Go anonymous");
                    this.$(".js-submit").prop("value", "Add comment");
                }
            },
            addNewComment: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                //Check if logged in
                if (!$(".mainWrap").data("user")) {
                    SocialManager.vent.trigger("loginOverlay:show");
                    return;
                }
                //Add comment
                if ($(".one-comment.selected-reply .one-reply").length) {
                    var reply_id = this.$(
                        ".one-comment.selected-reply .one-reply"
                    )
                        .last()
                        .data("id");
                } else {
                    var reply_id = this.$(".one-comment.selected-reply").data(
                        "id"
                    );
                }
                var value = {
                    discussion_id: this.model.get("_id"),
                    anon: this.$(".go-anon :checkbox").is(":checked"),
                    reply_to: this.$(".one-comment.selected-reply").data("id"),
                    index: this.$(".one-comment.selected-reply").index(),
                };
                this.trigger("add:comment", value);
            },
            toggleStatus: function (ev) {
                ev.stopPropagation();
                var $target = $(ev.target);
                if ($target.hasClass("selected")) {
                    //Remove vote
                    $target.removeClass("selected");
                    this.$(".polls-list").addClass("not-voted");
                    //Update total number of votes
                    var votes = parseInt(
                        this.$(".discussion-provider b").text()
                    );
                    if (votes > 1) {
                        votes = votes - 1;
                        if (votes == 1) {
                            this.$(".discussion-provider").html(
                                "<b> 1 </b> vote"
                            );
                        } else {
                            this.$(".discussion-provider").html(
                                "<b> " + votes + " </b> votes"
                            );
                        }
                    } else {
                        votes = 0;
                        this.$(".discussion-provider").html(
                            "<b> No </b> votes"
                        );
                    }
                    //Update count
                    var count = parseInt($target.next().find("b").text());
                    if (count > 1) {
                        count = count - 1;
                        $target.next().find("b").text(count);
                    } else {
                        count = 0;
                        $target.next().find("b").remove();
                    }
                    //Update bar for all options
                    var rows = this.$(".polls-list .row");
                    for (var i = 0; i < rows.length; i++) {
                        if (rows.eq(i).find("b").length) {
                            //Get count
                            var count = parseInt(rows.eq(i).find("b").text());
                            var percentage = (count / votes) * 100;
                            rows.eq(i)
                                .next()
                                .find(".row-percent")
                                .css("width", percentage + "%");
                        } else {
                            rows.eq(i)
                                .next()
                                .find(".row-percent")
                                .css("width", "");
                        }
                    }
                    //Send
                    var value = {
                        discussion_id: this.model.get("_id"),
                        ref_id: $target.next().data("pollid"),
                        position: 7,
                    };
                } else {
                    //Check if there are other votes
                    if (this.$(".radio-cell.selected").length) {
                        //Remove previous votes
                        this.$(".radio-cell.selected").click();
                    }
                    //Add current
                    $target.addClass("selected");
                    this.$(".polls-list").removeClass("not-voted");
                    //Update total number of votes
                    var votes = parseInt(
                        this.$(".discussion-provider b").text()
                    );
                    if (isNaN(votes)) {
                        votes = 1;
                        this.$(".discussion-provider").html("<b> 1 </b> vote");
                    } else {
                        votes = votes + 1;
                        this.$(".discussion-provider").html(
                            "<b> " + votes + " </b> votes"
                        );
                    }
                    //Get count
                    if ($target.next().find("b").length) {
                        //Update count
                        var count = parseInt($target.next().find("b").text());
                        count = count + 1;
                        $target.next().find("b").text(count);
                    } else {
                        var count = 1;
                        $target
                            .next()
                            .html($target.next().text() + "<b> 1 </b>");
                    }
                    //Update bar for all options
                    var rows = this.$(".polls-list .row");
                    for (var i = 0; i < rows.length; i++) {
                        //Get count
                        if (rows.eq(i).find("b").length) {
                            var count = parseInt(rows.eq(i).find("b").text());
                            //Update voted bar
                            var percentage = (count / votes) * 100;
                            rows.eq(i)
                                .next()
                                .find(".row-percent")
                                .css("width", percentage + "%");
                        }
                    }
                    //Send
                    var value = {
                        discussion_id: this.model.get("_id"),
                        ref_id: $target.next().data("pollid"),
                        position: 6,
                    };
                }
                this.trigger("update:poll", value);
            },
            editDiscussion: function (ev) {
                ev.preventDefault();
                this.$(".discussion-title input").removeAttr("readonly");
                this.$(".discussion-actions .discussion-toolbar").addClass(
                    "u-hide"
                );
                this.$(".discussion-actions .discussion-edit").removeClass(
                    "u-hide"
                );
                //Show editor
                this.trigger("edit:discussion");
            },
            updateEdit: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("uploading")) {
                    return;
                } else {
                    var value = {
                        title: this.$(".discussion-title input").val(),
                    };
                    //Update discussion
                    this.trigger("update:discussion", value);
                }
            },
            cancelEdit: function (ev) {
                ev.preventDefault();
                this.trigger("cancel:edit");
            },
            showTagsOverlay: function (ev) {
                ev.preventDefault();
                $(".modal").addClass("u-hide");
                SocialManager.vent.trigger(
                    "tagsOverlay:show",
                    this.model.get("slug")
                );
            },
            showBadgesOverlay: function (ev) {
                ev.preventDefault();
                $(".modal").addClass("u-hide");
                SocialManager.vent.trigger(
                    "selectBadgeOverlay:show",
                    this.model.get("_id"),
                    this.model.get("badge")
                );
            },
            showModeratorsOverlay: function (ev) {
                ev.preventDefault();
                $(".modal").addClass("u-hide");
                SocialManager.vent.trigger(
                    "moderatorsOverlay:show",
                    this.model.get("slug")
                );
            },
            showUser: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                //Check if logged in
                if (!$(".mainWrap").data("user")) {
                    SocialManager.vent.trigger("loginOverlay:show");
                    return;
                }
                //Close modal
                SocialManager.commands.execute("close:modal");
                //Show user
                var $target = $(ev.currentTarget);
                SocialManager.vent.trigger(
                    "user:show",
                    $target.data("username")
                );
            },
            deleteDiscussion: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var value = {
                    discussion_id: this.model.get("_id"),
                };
                if (
                    confirm(
                        "Are you sure you want to permanently delete this discussion?"
                    )
                ) {
                    this.trigger("delete:discussion", value);
                }
            },
            featureDiscussion: function (ev) {
                ev.preventDefault();
                this.trigger("feature:discussion");
            },
        });
        //One tag view
        EntityViews.DiscussionTagItemView = Marionette.ItemView.extend({
            tagName: "a",
            className: "one-tag",
            template: "discussionTagOneTemplate",
            initialize: function () {
                this.$el.css(
                    "border-left-color",
                    this.model.get("color") + ";"
                );
            },
            events: {
                click: "removeTag",
            },
            removeTag: function (ev) {
                ev.preventDefault();
                this.trigger("remove:tag", this.model);
            },
        });
        //Discussion tags view
        EntityViews.DiscussionTagsView = Marionette.CompositeView.extend({
            template: "discussionTagManyTemplate",
            childView: EntityViews.DiscussionTagItemView,
            childViewContainer: "div.tag-list",
            initialize: function () {
                //Tags
                if (this.model) {
                    var tags = this.model.get("tags");
                    this.collection = new Backbone.Collection(tags);
                }
            },
            events: {
                "click .js-close, .js-done": "closeOverlay",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.commands.execute("close:overlay");
                //Open modal if hidden
                if ($(".modal").hasClass("u-hide")) {
                    $(".modal").removeClass("u-hide");
                }
            },
        });
        //Explore one tag view
        EntityViews.ExploreTagItemView = Marionette.ItemView.extend({
            className: "explore-one",
            template: "exploreTagOneTemplate",
            events: {
                "click .subscribe-tag": "toggleSubscribe",
            },
            toggleSubscribe: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    this.trigger("unsubscribe:tag", this.model.get("_id"));
                } else {
                    this.trigger("subscribe:tag", this.model.get("_id"));
                }
            },
        });
        //Explore tags view
        EntityViews.ExploreTagsView = Marionette.CompositeView.extend({
            template: "exploreTagManyTemplate",
            childView: EntityViews.ExploreTagItemView,
            childViewContainer: "div.explore-tag-list",
            className: "explore-panel",
            events: {
                "click .js-close": "closeModal",
            },
            closeModal: function (ev) {
                ev.preventDefault();
                SocialManager.commands.execute("close:modal");
                SocialManager.vent.trigger("featured:show");
            },
        });
        //One badge view
        EntityViews.DiscussionBadgeItemView = Marionette.ItemView.extend({
            tagName: "p",
            className: "one-badge",
            template: "discussionBadgeOneTemplate",
            initialize: function () {
                this.$el.attr("data-id", this.model.get("_id"));
            },
            events: {
                click: "selectBadge",
            },
            selectBadge: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                //Update
                if ($target.hasClass("selected")) {
                    this.trigger("unselect:badge", this.model.get("_id"));
                    //Unselect previous badge
                    $(".discussion-badges .one-badge.selected .badge-name").css(
                        "backgroundColor",
                        ""
                    );
                    $(".discussion-badges .one-badge.selected").removeClass(
                        "selected"
                    );
                } else {
                    //Unselect previous badge
                    $(".discussion-badges .one-badge.selected .badge-name").css(
                        "backgroundColor",
                        ""
                    );
                    $(".discussion-badges .one-badge.selected").removeClass(
                        "selected"
                    );
                    //Select new badge
                    this.trigger("select:badge", this.model.get("_id"));
                }
            },
        });
        //Discussion badges view
        EntityViews.DiscussionBadgesView = Marionette.CompositeView.extend({
            template: "discussionBadgeManyTemplate",
            childView: EntityViews.DiscussionBadgeItemView,
            childViewContainer: "div.badge-list",
            events: {
                "click .js-close, .js-done": "closeOverlay",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.commands.execute("close:overlay");
                //Open modal if hidden
                if ($(".modal").hasClass("u-hide")) {
                    $(".modal").removeClass("u-hide");
                }
            },
        });
        //One moderator view
        EntityViews.DiscussionModeratorItemView = Marionette.ItemView.extend({
            tagName: "div",
            className: "person",
            template: "moderatorOneTemplate",
            events: {
                "click .remove-user": "removeModerator",
            },
            removeModerator: function (ev) {
                ev.preventDefault();
                this.trigger("remove:moderator", this.model);
            },
        });
        //Discussion moderators view
        EntityViews.DiscussionModeratorsView = Marionette.CompositeView.extend({
            template: "moderatorManyTemplate",
            childView: EntityViews.DiscussionModeratorItemView,
            childViewContainer: "div.member-list",
            initialize: function () {
                //Moderators
                if (this.model) {
                    var moderators = this.model.get("moderators");
                    this.collection = new Backbone.Collection(moderators);
                }
            },
            events: {
                "click .js-close, .js-done": "closeOverlay",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.commands.execute("close:overlay");
                //Open modal if hidden
                if ($(".modal").hasClass("u-hide")) {
                    $(".modal").removeClass("u-hide");
                }
            },
        });
        //One badge view
        EntityViews.BadgeItemView = Marionette.ItemView.extend({
            className: "one-badge",
            template: "badgeOneTemplate",
            events: {
                click: "removeBadge",
            },
            removeBadge: function (ev) {
                ev.preventDefault();
                this.trigger("remove:badge", this.model);
            },
        });
        //Badges view
        EntityViews.BadgesView = Marionette.CompositeView.extend({
            template: "badgeManyTemplate",
            childView: EntityViews.BadgeItemView,
            childViewContainer: "div.badge-list",
            events: {
                "click .js-save": "saveBadge",
                "click .js-close": "closeOverlay",
            },
            saveBadge: function (ev) {
                ev.preventDefault();
                var value = {
                    name: this.$(".badge-name").val().trim(),
                    desc: this.$(".badge-desc").val(),
                };
                this.trigger("save:badge", value);
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                SocialManager.commands.execute("close:overlay");
            },
        });
        //Profile view
        EntityViews.ProfileView = Marionette.ItemView.extend({
            tagName: "div",
            className: "profile-panel",
            template: "profileTemplate",
            initialize: function () {
                this.$el.attr("data-id", this.model.get("_id"));
                //Is current user
                if ($(".mainWrap").data("user") == this.model.get("_id")) {
                    $(".mainWrap").addClass("my-profile");
                } else {
                    $(".mainWrap").removeClass("my-profile");
                }
            },
            events: {
                "click .profile-follow": "toggleFollow",
                "click .js-following": "showFollowing",
                "click .js-followers": "showFollowers",
            },
            toggleFollow: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var user_id = this.model.get("_id");
                var $target = $(ev.currentTarget);
                //Toggle follow
                if ($target.hasClass("selected")) {
                    this.trigger("unfollow:user", user_id);
                    $target.text("Follow").removeClass("selected");
                } else {
                    this.trigger("follow:user", user_id);
                    $target.text("Following").addClass("selected");
                }
            },
            showFollowing: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                $(".mainNav a, .profile-people > a").removeClass("selected");
                if ($target.hasClass("selected")) {
                    $(".mainNav .js-nav-my").addClass("selected");
                    SocialManager.vent.trigger(
                        "profileData:show",
                        this.model.get("_id"),
                        this.model.get("username"),
                        "discussions"
                    );
                } else {
                    $(".js-following").addClass("selected");
                    //Show user's following
                    SocialManager.vent.trigger(
                        "profileData:show",
                        this.model.get("_id"),
                        this.model.get("username"),
                        "following"
                    );
                }
            },
            showFollowers: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                $(".mainNav a, .profile-people > a").removeClass("selected");
                if ($target.hasClass("selected")) {
                    $(".mainNav .js-nav-my").addClass("selected");
                    SocialManager.vent.trigger(
                        "profileData:show",
                        this.model.get("_id"),
                        this.model.get("username"),
                        "discussions"
                    );
                } else {
                    $(".js-followers").addClass("selected");
                    //Show user's followers
                    SocialManager.vent.trigger(
                        "profileData:show",
                        this.model.get("_id"),
                        this.model.get("username"),
                        "followers"
                    );
                }
            },
        });
        //One user view
        EntityViews.UserItemView = Marionette.ItemView.extend({
            tagName: "div",
            className: "user-card",
            template: "userOneTemplate",
            events: {
                "click .user-box": "showUser",
                "click .profile-follow": "toggleFollow",
            },
            toggleFollow: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var user_id = this.model.get("_id");
                var $target = $(ev.currentTarget);
                //Toggle follow
                if ($target.hasClass("selected")) {
                    this.trigger("unfollow:user", user_id);
                    $target.text("Follow").removeClass("selected");
                } else {
                    this.trigger("follow:user", user_id);
                    $target.text("Following").addClass("selected");
                }
            },
            showUser: function (ev) {
                ev.preventDefault();
                if (this.model.get("_id") == $(".mainWrap").data("user")) {
                    SocialManager.vent.trigger("user:show");
                } else {
                    SocialManager.vent.trigger(
                        "user:show",
                        this.model.get("username")
                    );
                }
            },
        });
        //Empty users view
        EntityViews.EmptyUsersView = Marionette.ItemView.extend({
            tagName: "div",
            className: "zero-items",
            template: "emptyUsersTemplate",
        });
        //Users collection view
        EntityViews.UsersView = Marionette.CollectionView.extend({
            childView: EntityViews.UserItemView,
            emptyView: EntityViews.EmptyUsersView,
        });
        //One activity view
        EntityViews.ActivityItemView = Marionette.ItemView.extend({
            tagName: "a",
            className: "one-activity",
            template: "activityOneTemplate",
            initialize: function () {
                if (this.model.get("is_new")) {
                    this.$el.addClass("is-new");
                }
                //Set url
                if (
                    this.model.get("action") == "subscribed_to_tag" ||
                    this.model.get("action") == "join" ||
                    this.model.get("action") == "invited"
                ) {
                    this.$el.attr(
                        "href",
                        "/social/tag/" + this.model.get("entity").tag.slug
                    );
                } else if (this.model.get("action") == "follow_user") {
                    this.$el.attr(
                        "href",
                        "/social/user/" + this.model.get("creator").username
                    );
                } else {
                    this.$el.attr(
                        "href",
                        "/social/discussion/" +
                            this.model.get("entity").discussion.slug
                    );
                }
            },
            events: {
                click: "showActivity",
            },
            showActivity: function (ev) {
                if (ev.metaKey || ev.ctrlKey) return;
                ev.preventDefault();
                SocialManager.commands.execute("close:popup");
                //Navigate
                if (
                    this.model.get("action") == "subscribed_to_tag" ||
                    this.model.get("action") == "join" ||
                    this.model.get("action") == "invited"
                ) {
                    SocialManager.vent.trigger(
                        "tag:show",
                        this.model.get("entity").tag.slug
                    );
                } else if (this.model.get("action") == "follow_user") {
                    SocialManager.vent.trigger(
                        "user:show",
                        this.model.get("creator").username
                    );
                } else {
                    SocialManager.vent.trigger(
                        "oneDiscussion:show",
                        this.model.get("entity").discussion.slug
                    );
                }
            },
        });
        //Empty activities view
        EntityViews.EmptyActivitiesView = Marionette.ItemView.extend({
            tagName: "div",
            className: "zero-message",
            template: "emptyActivitiesTemplate",
        });
        //Activities view
        EntityViews.ActivitiesView = Marionette.CompositeView.extend({
            template: "activityManyTemplate",
            childView: EntityViews.ActivityItemView,
            childViewContainer: "div.all-activity",
            emptyView: EntityViews.EmptyActivitiesView,
        });
        //Settings View
        EntityViews.SettingsView = Marionette.ItemView.extend({
            template: "userSettingsTemplate",
            className: "settings-panel",
            events: {
                "click .js-close": "closeModal",
                "click .upload-btn": "uploadDp",
                "click .update-btn": "editProfile",
            },
            closeModal: function (ev) {
                ev.preventDefault();
                SocialManager.commands.execute("close:modal");
            },
            uploadDp: function (ev) {
                ev.preventDefault();
                this.$(".file-input").click();
            },
            editProfile: function (ev) {
                ev.preventDefault();
                var value = {
                    name: this.$(".profile-name").val().trim(),
                    about: this.$(".profile-about").val().trim(),
                    job_title: this.$(".profile-job").val().trim(),
                    job_org: this.$(".profile-org").val().trim(),
                    country: this.$(".select-country").val(),
                    city: this.$(".profile-city").val().trim(),
                    sex: this.$(".select-gender").val(),
                    phone: this.$(".profile-phone").val().trim(),
                };
                //Check if password is present or not
                if (this.$(".profile-old-pwd").val()) {
                    value.oldpwd = this.$(".profile-old-pwd").val().trim();
                    value.newpwd = this.$(".profile-new-pwd").val().trim();
                }
                this.trigger("update:profile", value);
            },
        });
    }
);
//Common Views of the application - Loading
SocialManager.module(
    "Common.Views",
    function (Views, SocialManager, Backbone, Marionette, $, _) {
        //Loading page
        Views.Loading = Marionette.ItemView.extend({
            tagName: "div",
            className: "loading-area",
            template: "loadingTemplate",
        });
    }
);
//Controllers of the Application
SocialManager.module(
    "SocialApp.EntityController",
    function (EntityController, SocialManager, Backbone, Marionette, $, _) {
        EntityController.Controller = {
            showLoginOverlay: function (email) {
                $(".overlay").show();
                var loginView =
                    new SocialManager.SocialApp.EntityViews.LoginView();
                //SHOW
                loginView.on("show", function () {
                    //Animate overlay box
                    setTimeout(function () {
                        loginView.$(".overlay-box").addClass("animate");
                    }, 100);
                    //Focus on email input
                    loginView.$(".js-email input").val(email).focus();
                    //hide scroll on main page
                    SocialManager.commands.execute("show:overlay");
                });
                //Show login view overlay
                SocialManager.overlayRegion.show(loginView);
            },
            showSignupOverlay: function () {
                $(".overlay").show();
                var signupView =
                    new SocialManager.SocialApp.EntityViews.SignupView();
                //SHOW
                signupView.on("show", function () {
                    //Animate overlay box
                    setTimeout(function () {
                        signupView.$(".overlay-box").addClass("animate");
                    }, 100);
                    //Focus on name input
                    signupView.$(".js-name input").focus();
                    //hide scroll on main page
                    SocialManager.commands.execute("show:overlay");
                });
                //Show signup view overlay
                SocialManager.overlayRegion.show(signupView);
            },
            showForgotOverlay: function (email) {
                $(".overlay").show();
                var forgotView =
                    new SocialManager.SocialApp.EntityViews.ForgotView();
                //SHOW
                forgotView.on("show", function () {
                    //Animate overlay box
                    setTimeout(function () {
                        forgotView
                            .$(".overlay-box")
                            .addClass("animate")
                            .addClass("navigateURI");
                    }, 100);
                    //Focus on email input
                    forgotView.$(".js-email input").val(email).focus();
                    //hide scroll on main page
                    SocialManager.commands.execute("show:overlay");
                });
                //Show forgot password view overlay
                SocialManager.overlayRegion.show(forgotView);
            },
            showStreak: function (selected_date) {
                //Fetch
                var fetchingStreak = SocialManager.request("streak:entities");
                $.when(fetchingStreak).done(function (streak) {
                    var streakView =
                        new SocialManager.SocialApp.EntityViews.StreakView();
                    //Show
                    streakView.on("show", function () {
                        var json = {};
                        var attrs = streak.attributes;
                        for (var key in attrs) {
                            if (attrs.hasOwnProperty(key)) {
                                var time =
                                    new Date(
                                        attrs[key].date.replace(/-/g, "/")
                                    ).getTime() / 1000;
                                json[time] = attrs[key].count;
                            }
                        }
                        //Set cal
                        var cal = new CalHeatMap();
                        var mapDate = new Date();
                        mapDate.setMonth(mapDate.getMonth());
                        //Initialize cal
                        cal.init({
                            domain: "month",
                            subDomain: "x_day",
                            data: json,
                            start: mapDate,
                            cellSize: 20,
                            range: 6,
                            legend: [1, 2, 3, 4],
                            domainGutter: 20,
                            tooltip: true,
                            itemName: ["comment", "comments"],
                            label: {
                                position: "top",
                            },
                            onClick: function (date, nb) {
                                //nb is count
                                if (nb > 0) {
                                    cal.highlight(date);
                                    var formattedDate =
                                        date.getFullYear() +
                                        "-" +
                                        (date.getMonth() + 1) +
                                        "-" +
                                        date.getDate();
                                }
                            },
                        });
                    });
                    SocialManager.headerRegion.show(streakView);
                });
            },
            showTags: function (type) {
                //Fetch tags
                var fetchingTags = SocialManager.request("tag:entities", type);
                $.when(fetchingTags).done(function (tags) {
                    var tagsView =
                        new SocialManager.SocialApp.EntityViews.TagsView({
                            collection: tags,
                        });
                    //Show
                    tagsView.on("show", function () {
                        if (type) {
                            tagsView.$el.prepend(
                                "<span class='explore-tags'>Explore more tags</span>"
                            );
                        }
                    });
                    //Add tag
                    SocialManager.vent.off("add:tag");
                    SocialManager.vent.on("add:tag", function (tag) {
                        tags.add(tag, { at: 0 });
                    });
                    //Remove tag
                    SocialManager.vent.off("remove:tag");
                    SocialManager.vent.on("remove:tag", function (tag_id) {
                        var tag = tags.get(tag_id);
                        tags.remove(tag);
                    });
                    SocialManager.headerRegion.show(tagsView);
                });
            },
            showOneTag: function (slug, type) {
                //Fetch tag
                var fetchingTag = SocialManager.request("tag:entity", slug);
                $.when(fetchingTag).done(function (tag) {
                    var oneTagView =
                        new SocialManager.SocialApp.EntityViews.OneTagView({
                            model: tag,
                        });
                    //Show
                    oneTagView.on("show", function () {
                        //Show tag name
                        document.title = tag.get("name") + " - MGIEP Social";
                        //Add tag id to header
                        oneTagView.$el.data("tag", tag.get("_id"));
                        //Show tagged discussions
                        if (!type) type = "recent";
                        SocialManager.vent.trigger(
                            "discussions:show",
                            type,
                            tag.get("_id")
                        );
                    });
                    //Join tag
                    oneTagView.on("join:tag", function (value) {
                        var edit_tag = new SocialManager.Entities.Tag({
                            _id: value,
                            _action: "join",
                        });
                        edit_tag.set({});
                        edit_tag.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    oneTagView
                                        .$(".join-tag")
                                        .removeClass("join-tag")
                                        .addClass("unjoin-project")
                                        .text("Remove request");
                                },
                            }
                        );
                    });
                    //Unjoin tag
                    oneTagView.on("unjoin:tag", function (value) {
                        var edit_tag = new SocialManager.Entities.Tag({
                            _id: value,
                            _action: "unjoin",
                        });
                        edit_tag.set({});
                        edit_tag.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    oneTagView
                                        .$(".unjoin-tag")
                                        .removeClass("unjoin-tag")
                                        .addClass("join-tag")
                                        .text("Request to join");
                                },
                            }
                        );
                    });
                    //Leave tag
                    oneTagView.on("leave:tag", function (value) {
                        var edit_tag = new SocialManager.Entities.Tag({
                            _id: value,
                            _action: "remove_member",
                        });
                        edit_tag.set({});
                        edit_tag.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    oneTagView
                                        .$(".leave-tag")
                                        .removeClass("leave-tag")
                                        .addClass("join-tag")
                                        .text("Request to join");
                                },
                            }
                        );
                    });
                    //Subscribe to tag
                    oneTagView.on("subscribe:tag", function (value) {
                        var edit_tag = new SocialManager.Entities.Tag({
                            _id: value,
                            _action: "subscribe",
                        });
                        edit_tag.set({});
                        edit_tag.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    oneTagView
                                        .$(".subscribe-tag")
                                        .removeClass("subscribe-tag")
                                        .addClass("unsubscribe-tag")
                                        .text("Unsubscribe");
                                },
                            }
                        );
                    });
                    //Unsubscribe from tag
                    oneTagView.on("unsubscribe:tag", function (value) {
                        var edit_tag = new SocialManager.Entities.Tag({
                            _id: value,
                            _action: "unsubscribe",
                        });
                        edit_tag.set({});
                        edit_tag.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    oneTagView
                                        .$(".unsubscribe-tag")
                                        .removeClass("unsubscribe-tag")
                                        .addClass("subscribe-tag")
                                        .text("Subscribe");
                                },
                            }
                        );
                    });
                    SocialManager.headerRegion.show(oneTagView);
                });
            },
            showDiscussions: function (type, tag_id, user_id) {
                //Select nav
                if (type == "top" || type == "recent") {
                    $(".mainNav .nav-profile").addClass("u-hide");
                    $(".mainNav a, .profile-people > a").removeClass(
                        "selected"
                    );
                    $(".mainNav .nav-front").removeClass("u-hide");
                    if (tag_id) {
                        $(".mainNav .js-nav-today").addClass("u-hide");
                    } else {
                        $(".mainNav .js-nav-today").removeClass("u-hide");
                    }
                    if (type == "top") {
                        $(".mainNav .js-nav-top").addClass("selected");
                    } else {
                        $(".mainNav .js-nav-recent").addClass("selected");
                    }
                }
                //Close featured region
                if (type != "daily") {
                    SocialManager.commands.execute("close:featured");
                }
                //Off scroll handler
                $(window).off("scroll", scrollHandler);
                //Show loading page
                var loadingView = new SocialManager.Common.Views.Loading();
                SocialManager.contentRegion.show(loadingView);
                //If public
                if ($(".mainWrap").data("user")) {
                    var fetchingDiscussions = SocialManager.request(
                        "discussion:entities",
                        type,
                        tag_id,
                        user_id
                    );
                } else {
                    var fetchingDiscussions = SocialManager.request(
                        "discussion:entities"
                    );
                }
                //Fetch
                $.when(fetchingDiscussions).done(function (discussions) {
                    //Group discussions by sections
                    if (type == "top") {
                        var discussionsBySections =
                            groupDiscussionsByTop(discussions);
                    } else {
                        var discussionsBySections =
                            groupDiscussionsByDate(discussions);
                    }
                    //Show view
                    var discussionsView =
                        new SocialManager.SocialApp.EntityViews.DiscussionsView(
                            {
                                collection: discussionsBySections,
                            }
                        );
                    //Show
                    discussionsView.on("show", function () {
                        //Masonry
                        if ($("body").width() >= 660) {
                            $(".mainContent .section-discussions").masonry({
                                itemSelector: ".one-card",
                                columnWidth: 330,
                            });
                        }
                        //If previously featured
                        if (type == "daily") {
                            $(
                                ".mainContent > div > div:first-child .section-label"
                            )
                                .text("Previously featured discussions:")
                                .show();
                        }
                        //Check if explore tags cookie is present
                        if (
                            !Cookies.get("exploreTags") &&
                            $(".mainWrap").data("user")
                        ) {
                            SocialManager.vent.trigger("exploreTags:show");
                        }
                        //All discussions
                        var allDiscussions = discussions.toJSON();
                        var $loading = $(".loading-data");
                        //Pagination
                        $loading.data("page", 1).removeClass("u-loaded");
                        //Check if less than page size
                        if (discussions.length < PAGE_SIZE) {
                            $loading.addClass("u-loaded");
                        }
                        //Fetch more discussions
                        scrollHandler = function () {
                            var docHeight = $(document).height() - 100;
                            if (
                                $(window).scrollTop() + $(window).height() >=
                                    docHeight &&
                                !$loading.hasClass("u-loaded") &&
                                !$loading.hasClass("u-loading")
                            ) {
                                $loading.show().addClass("u-loading");
                                if ($(".mainWrap").data("user")) {
                                    var fetchingNextDiscussions =
                                        SocialManager.request(
                                            "discussion:entities",
                                            type,
                                            tag_id,
                                            user_id,
                                            "",
                                            $loading.data("page") + 1
                                        );
                                } else {
                                    var fetchingNextDiscussions =
                                        SocialManager.request(
                                            "discussion:entities",
                                            "",
                                            "",
                                            "",
                                            "",
                                            $loading.data("page") + 1
                                        );
                                }
                                $.when(fetchingNextDiscussions).done(function (
                                    nextDiscussions
                                ) {
                                    //Add new discussions to all discussions
                                    allDiscussions = allDiscussions.concat(
                                        nextDiscussions.toJSON()
                                    );
                                    var discussionCollection =
                                        new Backbone.Collection(allDiscussions);
                                    if (type == "top") {
                                        var discussionCollectionBySections =
                                            groupDiscussionsByTop(
                                                discussionCollection
                                            );
                                    } else {
                                        var discussionCollectionBySections =
                                            groupDiscussionsByDate(
                                                discussionCollection
                                            );
                                    }
                                    //Reset view collection with new collection
                                    discussionsView.collection.reset(
                                        discussionCollectionBySections.models
                                    );
                                    //Masonry
                                    if ($("body").width() >= 660) {
                                        $(
                                            ".mainContent .section-discussions"
                                        ).masonry({
                                            itemSelector: ".one-card",
                                            columnWidth: 330,
                                        });
                                    }
                                    //Loaded
                                    $loading
                                        .data("page", $loading.data("page") + 1)
                                        .hide()
                                        .removeClass("u-loading");
                                    if (nextDiscussions.length < PAGE_SIZE) {
                                        $loading.addClass("u-loaded");
                                    }
                                });
                            }
                        };
                        $(window).on("scroll", scrollHandler);
                    });
                    //UPDATE POLL
                    discussionsView.on(
                        "childview:childview:update:poll",
                        function (childView, model, options) {
                            var discussion =
                                new SocialManager.Entities.Discussion({
                                    _id: options.discussion_id,
                                    _action: "edit_poll",
                                });
                            discussion.set({
                                ref_id: options.ref_id,
                                position: options.position,
                            });
                            discussion.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {},
                                }
                            );
                        }
                    );
                    //Add discussion
                    SocialManager.vent.off("add:discussion");
                    SocialManager.vent.on(
                        "add:discussion",
                        function (discussion) {
                            //Navigate
                            if (discussion.get("status") == "queued") {
                                SocialManager.vent.trigger(
                                    "queuedDiscussions:show"
                                );
                            } else {
                                SocialManager.vent.trigger(
                                    "recentDiscussions:show"
                                );
                            }
                        }
                    );
                    SocialManager.contentRegion.show(discussionsView);
                });
            },
            showOneDiscussion: function (slug) {
                //Check if featured
                if (slug) {
                    $(".modal").show();
                } else {
                    $(".mainNav .nav-profile").addClass("u-hide");
                    $(".mainNav a, .profile-people > a").removeClass(
                        "selected"
                    );
                    $(".mainNav .nav-front").removeClass("u-hide");
                    $(".mainNav .js-nav-today")
                        .removeClass("u-hide")
                        .addClass("selected");
                }
                //Fetch a discussion
                var fetchingDiscussion = SocialManager.request(
                    "discussion:entity",
                    slug
                );
                $.when(fetchingDiscussion).done(function (discussion) {
                    var oneDiscussionView =
                        new SocialManager.SocialApp.EntityViews.OneDiscussionView(
                            {
                                model: discussion,
                            }
                        );
                    //Editor
                    var discussionEditor,
                        commentEditor,
                        oneCommentEditor,
                        prevCommentHTML;
                    var discussionEditorFiles = [],
                        commentEditorFiles = [],
                        oneCommentEditorFiles = [];
                    //SHOW
                    oneDiscussionView.on("show", function () {
                        if (slug) {
                            //Animate modal box
                            setTimeout(function () {
                                oneDiscussionView
                                    .$(".modal-box")
                                    .addClass("animate");
                            }, 100);
                            //hide scroll on main page
                            SocialManager.commands.execute("show:overlay");
                        } else {
                            //Add class if without login
                            if (!$(".mainWrap").data("user")) {
                                oneDiscussionView
                                    .$(".modal-box")
                                    .addClass("without-login");
                                oneDiscussionView
                                    .$(".comment-btn.entity-btn")
                                    .val("Login to comment");
                            }
                            //Show daily discussions
                            SocialManager.vent.trigger(
                                "discussions:show",
                                "daily"
                            );
                        }
                        //Editor
                        //Wait till editor is ready
                        oneDiscussionView
                            .$(".comment-text")
                            .bind("click mousedown dblclick", function (ev) {
                                ev.preventDefault();
                                ev.stopImmediatePropagation();
                            });
                        commentEditor = setUpAlloyToolbar(
                            false,
                            document.querySelector(".comment-text"),
                            false,
                            false
                        );
                        var nativeEditor = commentEditor.get("nativeEditor");
                        //On editor ready
                        nativeEditor.on("instanceReady", function (ev) {
                            oneDiscussionView.$(".comment-text").unbind();
                        });
                        //On image upload
                        nativeEditor.on("imageAdd", function (ev) {
                            var id = generateRandomUUID();
                            ev.data.file.id = id;
                            commentEditorFiles.push(ev.data.file);
                            $(ev.data.el.$)
                                .addClass("upload-image")
                                .attr("data-id", id);
                        });
                    });
                    //Show editor
                    oneDiscussionView.on(
                        "childview:show:editorForReply",
                        function (childView, model) {
                            //Destroy
                            if (commentEditor) commentEditor.destroy();
                            //Editor
                            //Wait till editor is ready
                            oneDiscussionView
                                .$(".comment-text")
                                .bind(
                                    "click mousedown dblclick",
                                    function (ev) {
                                        ev.preventDefault();
                                        ev.stopImmediatePropagation();
                                    }
                                );
                            commentEditor = setUpAlloyToolbar(
                                false,
                                document.querySelector(".comment-text"),
                                false,
                                false
                            );
                            var nativeEditor =
                                commentEditor.get("nativeEditor");
                            //On editor ready
                            nativeEditor.on("instanceReady", function (ev) {
                                oneDiscussionView.$(".comment-text").unbind();
                                //Focus
                                nativeEditor.setData("");
                                nativeEditor.focus();
                            });
                            //On image upload
                            nativeEditor.on("imageAdd", function (ev) {
                                var id = generateRandomUUID();
                                ev.data.file.id = id;
                                commentEditorFiles.push(ev.data.file);
                                $(ev.data.el.$)
                                    .addClass("upload-image")
                                    .attr("data-id", id);
                            });
                        }
                    );
                    //Edit discussion
                    oneDiscussionView.on("edit:discussion", function () {
                        if (discussion.get("type") != "text") return;
                        //Editor
                        //Wait till editor is ready
                        oneDiscussionView
                            .$(".discussion-content")
                            .bind("click mousedown dblclick", function (ev) {
                                ev.preventDefault();
                                ev.stopImmediatePropagation();
                            });
                        discussionEditor = setUpAlloyToolbar(
                            false,
                            document.querySelector(".discussion-text"),
                            false,
                            false
                        );
                        var nativeEditor = discussionEditor.get("nativeEditor");
                        //On editor ready
                        nativeEditor.on("instanceReady", function (ev) {
                            oneDiscussionView.$(".discussion-content").unbind();
                        });
                        //On image upload
                        nativeEditor.on("imageAdd", function (ev) {
                            var id = generateRandomUUID();
                            ev.data.file.id = id;
                            discussionEditorFiles.push(ev.data.file);
                            $(ev.data.el.$)
                                .addClass("upload-image")
                                .attr("data-id", id);
                        });
                    });
                    //Cancel edit
                    oneDiscussionView.on("cancel:edit", function () {
                        if (
                            discussion.get("type") == "text" &&
                            discussionEditor
                        ) {
                            //Set previous data
                            var nativeEditor =
                                discussionEditor.get("nativeEditor");
                            nativeEditor.setData(discussion.get("desc"));
                            //Destroy
                            discussionEditor.destroy();
                        }
                        oneDiscussionView
                            .$(".discussion-actions .discussion-edit")
                            .addClass("u-hide");
                        oneDiscussionView
                            .$(".discussion-title input")
                            .attr("readonly", true)
                            .val(discussion.get("title"))
                            .focus();
                        oneDiscussionView
                            .$(".discussion-actions .discussion-toolbar")
                            .removeClass("u-hide");
                    });
                    //Update discussion
                    oneDiscussionView.on("update:discussion", function (value) {
                        if (discussion.get("type") == "text") {
                            if (discussionEditor) {
                                var nativeEditor =
                                    discussionEditor.get("nativeEditor");
                                value.desc = nativeEditor.getData();
                            }
                            if (
                                (!value.title && !value.desc) ||
                                (value.title == discussion.get("title") &&
                                    value.desc == discussion.get("desc"))
                            ) {
                                oneDiscussionView.$(".js-cancel-edit").click();
                                return;
                            }
                            //Update discussion
                            var edit_discussion =
                                new SocialManager.Entities.Discussion({
                                    _id: discussion.get("_id"),
                                    _action: "edit",
                                });
                            edit_discussion.set({
                                title: value.title,
                                desc: value.desc,
                            });
                            //Save and upload image
                            async.series(
                                [
                                    function (callback) {
                                        if (
                                            oneDiscussionView.$(
                                                ".discussion-text .upload-image"
                                            ).length
                                        ) {
                                            oneDiscussionView
                                                .$(".update-edit")
                                                .text("Uploading...")
                                                .addClass("uploading");
                                            oneDiscussionView
                                                .$(".cancel-edit")
                                                .addClass("u-hide");
                                            oneDiscussionView
                                                .$(".discussion-title input")
                                                .attr("readonly", true);
                                            //Upload
                                            editorUploadImage(
                                                discussionEditorFiles,
                                                function (image_urls) {
                                                    discussionEditorFiles = [];
                                                    if (
                                                        image_urls &&
                                                        image_urls.length
                                                    ) {
                                                        var first_image =
                                                            oneDiscussionView
                                                                .$(
                                                                    ".discussion-text img"
                                                                )
                                                                .attr("src");
                                                        edit_discussion.set(
                                                            "desc",
                                                            nativeEditor.getData()
                                                        );
                                                        edit_discussion.set(
                                                            "images",
                                                            image_urls
                                                        );
                                                        edit_discussion.set(
                                                            "image",
                                                            first_image
                                                        );
                                                        //Get bound
                                                        var image = new Image();
                                                        image.src = first_image;
                                                        image.onload =
                                                            function () {
                                                                var bound =
                                                                    (this
                                                                        .height *
                                                                        270) /
                                                                    this.width;
                                                                if (bound) {
                                                                    bound =
                                                                        parseInt(
                                                                            bound
                                                                        );
                                                                    edit_discussion.set(
                                                                        "bound",
                                                                        bound
                                                                    );
                                                                }
                                                                callback();
                                                            };
                                                        image.onerror =
                                                            function () {
                                                                callback();
                                                            };
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            );
                                        } else {
                                            callback();
                                        }
                                    },
                                ],
                                function (err) {
                                    edit_discussion.save(
                                        {},
                                        {
                                            success: function () {
                                                discussionEditor.destroy();
                                                oneDiscussionView
                                                    .$(".update-edit")
                                                    .text("Edit")
                                                    .removeClass("uploading");
                                                oneDiscussionView
                                                    .$(
                                                        ".discussion-actions .discussion-edit"
                                                    )
                                                    .addClass("u-hide");
                                                oneDiscussionView
                                                    .$(
                                                        ".discussion-title input"
                                                    )
                                                    .attr("readonly", true);
                                                oneDiscussionView
                                                    .$(
                                                        ".discussion-actions .discussion-toolbar"
                                                    )
                                                    .removeClass("u-hide");
                                                //Update model
                                                discussion.set(
                                                    "title",
                                                    edit_discussion.get("title")
                                                );
                                                discussion.set(
                                                    "desc",
                                                    edit_discussion.get("desc")
                                                );
                                            },
                                        }
                                    );
                                }
                            );
                        } else {
                            var edit_discussion =
                                new SocialManager.Entities.Discussion({
                                    _id: discussion.get("_id"),
                                    _action: "edit",
                                });
                            edit_discussion.set({
                                title: value.title,
                            });
                            edit_discussion.save(
                                {},
                                {
                                    success: function () {
                                        oneDiscussionView
                                            .$(
                                                ".discussion-actions .discussion-edit"
                                            )
                                            .addClass("u-hide");
                                        oneDiscussionView
                                            .$(".discussion-title input")
                                            .attr("readonly", true);
                                        oneDiscussionView
                                            .$(
                                                ".discussion-actions .discussion-toolbar"
                                            )
                                            .removeClass("u-hide");
                                        //Update model
                                        discussion.set(
                                            "title",
                                            edit_discussion.get("title")
                                        );
                                    },
                                }
                            );
                        }
                    });
                    //ADD COMMENT
                    oneDiscussionView.on("add:comment", function (value) {
                        //Pass date from client side
                        var date = new Date(Date.now());
                        var formattedDate =
                            date.getFullYear() +
                            "-" +
                            (date.getMonth() + 1) +
                            "-" +
                            date.getDate();
                        //Get comment
                        var nativeEditor = commentEditor.get("nativeEditor");
                        //New comment
                        var new_comment = new SocialManager.Entities.Comment({
                            comment: nativeEditor.getData(),
                            discussion_id: value.discussion_id,
                            anon: value.anon,
                            reply_to: value.reply_to,
                            date: formattedDate,
                        });
                        //Save and upload image
                        async.series(
                            [
                                function (callback) {
                                    if (
                                        oneDiscussionView.$(".upload-image")
                                            .length
                                    ) {
                                        oneDiscussionView
                                            .$(".js-submit.comment-btn")
                                            .val("Uploading...")
                                            .addClass("uploading");
                                        editorUploadImage(
                                            commentEditorFiles,
                                            function (image_urls) {
                                                commentEditorFiles = [];
                                                if (
                                                    image_urls &&
                                                    image_urls.length
                                                ) {
                                                    new_comment.set(
                                                        "comment",
                                                        nativeEditor.getData()
                                                    );
                                                    new_comment.set(
                                                        "images",
                                                        image_urls
                                                    );
                                                    callback();
                                                } else {
                                                    callback();
                                                }
                                            }
                                        );
                                    } else {
                                        callback();
                                    }
                                },
                            ],
                            function (err) {
                                new_comment.save(
                                    {},
                                    {
                                        success: function () {
                                            //Add
                                            if (!value.reply_to) {
                                                oneDiscussionView.collection.add(
                                                    new_comment
                                                );
                                                //Focus on comment box
                                                nativeEditor.setData("");
                                                nativeEditor.focus();
                                            } else {
                                                oneDiscussionView.children
                                                    .findByIndex(value.index)
                                                    .collection.add(
                                                        new_comment
                                                    );
                                                //Hide reply box
                                                oneDiscussionView
                                                    .$(
                                                        ".one-comment.selected-reply .reply-btn"
                                                    )
                                                    .click();
                                            }
                                            oneDiscussionView
                                                .$(".js-submit.comment-btn")
                                                .val("Add comment")
                                                .removeClass("uploading");
                                        },
                                    }
                                );
                            }
                        );
                    });
                    //LIKE-UNLIKE COMMENT
                    oneDiscussionView.on(
                        "childview:toggle:like",
                        function (childView, model) {
                            _toggleLike(model.comment_id, model.like_action);
                        }
                    );
                    oneDiscussionView.on(
                        "childview:childview:toggle:like",
                        function (childView, model, options) {
                            _toggleLike(
                                options.comment_id,
                                options.like_action
                            );
                        }
                    );
                    var _toggleLike = function (comment_id, like_action) {
                        var comment = new SocialManager.Entities.Comment({
                            _id: comment_id,
                            _action: like_action,
                        });
                        comment.set({});
                        comment.save({}, { success: function () {} });
                    };
                    //EDIT COMMENT / REPLY
                    oneDiscussionView.on(
                        "childview:edit:comment",
                        function (childView, model) {
                            _editComment(childView);
                        }
                    );
                    oneDiscussionView.on(
                        "childview:childview:edit:comment",
                        function (childView, model, options) {
                            _editComment(childView, true);
                        }
                    );
                    var _editComment = function (childView, isReply) {
                        //Editor
                        //Wait till editor is ready
                        childView
                            .$(".comment-html")
                            .bind("click mousedown dblclick", function (ev) {
                                ev.preventDefault();
                                ev.stopImmediatePropagation();
                            });
                        oneCommentEditor = setUpAlloyToolbar(
                            false,
                            document.querySelector(
                                ".selected-comment .comment-html"
                            ),
                            false,
                            false
                        );
                        var nativeEditor = oneCommentEditor.get("nativeEditor");
                        //On editor ready
                        nativeEditor.on("instanceReady", function (ev) {
                            childView.$(".comment-html").unbind();
                            prevCommentHTML = nativeEditor.getData();
                        });
                        //On image upload
                        nativeEditor.on("imageAdd", function (ev) {
                            var id = generateRandomUUID();
                            ev.data.file.id = id;
                            oneCommentEditorFiles.push(ev.data.file);
                            $(ev.data.el.$)
                                .addClass("upload-image")
                                .attr("data-id", id);
                        });
                    };
                    //CANCEL COMMENT EDIT
                    oneDiscussionView.on(
                        "childview:cancel:editComment",
                        function (childView, model) {
                            _cancelEditComment(childView);
                        }
                    );
                    oneDiscussionView.on(
                        "childview:childview:cancel:editComment",
                        function (childView, model, options) {
                            _cancelEditComment(childView, true);
                        }
                    );
                    var _cancelEditComment = function (childView, isReply) {
                        //Set previous data
                        var nativeEditor = oneCommentEditor.get("nativeEditor");
                        nativeEditor.setData(prevCommentHTML);
                        prevCommentHTML = "";
                        //Destroy
                        oneCommentEditor.destroy();
                        //Reset
                        if (isReply) {
                            childView
                                .$(".save-btn")
                                .text("Edit")
                                .removeClass("save-btn");
                            childView
                                .$(".delete-btn")
                                .text("Delete")
                                .removeClass("cancel-btn");
                        } else {
                            childView
                                .$(".js-comment-actions .save-btn")
                                .text("Edit")
                                .removeClass("save-btn");
                            childView
                                .$(".js-comment-actions .delete-btn")
                                .text("Delete")
                                .removeClass("cancel-btn");
                        }
                        oneDiscussionView
                            .$(".selected-comment")
                            .removeClass("selected-comment");
                    };
                    //UPDATE COMMENT
                    oneDiscussionView.on(
                        "childview:update:comment",
                        function (childView, model) {
                            _updateComment(model.comment_id, childView);
                        }
                    );
                    oneDiscussionView.on(
                        "childview:childview:update:comment",
                        function (childView, model, options) {
                            _updateComment(options.comment_id, childView, true);
                        }
                    );
                    var _updateComment = function (
                        comment_id,
                        childView,
                        isReply
                    ) {
                        if (oneCommentEditor) {
                            var nativeEditor =
                                oneCommentEditor.get("nativeEditor");
                            var comment = nativeEditor.getData();
                        }
                        //Update comment
                        var edit_comment = new SocialManager.Entities.Comment({
                            _id: comment_id,
                            _action: "edit",
                        });
                        edit_comment.set({
                            comment: comment,
                        });
                        //Save and upload image
                        async.series(
                            [
                                function (callback) {
                                    if (
                                        childView.$(
                                            ".comment-html .upload-image"
                                        ).length
                                    ) {
                                        if (isReply) {
                                            childView
                                                .$(".edit-btn")
                                                .text("Uploading...")
                                                .addClass("uploading");
                                            childView
                                                .$(".delete-btn")
                                                .addClass("u-hide");
                                        } else {
                                            childView
                                                .$(
                                                    ".js-comment-actions .edit-btn"
                                                )
                                                .text("Uploading...")
                                                .addClass("uploading");
                                            childView
                                                .$(
                                                    ".js-comment-actions .delete-btn"
                                                )
                                                .addClass("u-hide");
                                        }
                                        //Upload
                                        editorUploadImage(
                                            oneCommentEditorFiles,
                                            function (image_urls) {
                                                oneCommentEditorFiles = [];
                                                if (
                                                    image_urls &&
                                                    image_urls.length
                                                ) {
                                                    edit_comment.set(
                                                        "comment",
                                                        nativeEditor.getData()
                                                    );
                                                    edit_comment.set(
                                                        "images",
                                                        image_urls
                                                    );
                                                    callback();
                                                } else {
                                                    callback();
                                                }
                                            }
                                        );
                                    } else {
                                        callback();
                                    }
                                },
                            ],
                            function (err) {
                                edit_comment.save(
                                    {},
                                    {
                                        success: function () {
                                            oneCommentEditor.destroy();
                                            prevCommentHTML = "";
                                            if (isReply) {
                                                childView
                                                    .$(".edit-btn")
                                                    .text("Edit")
                                                    .removeClass("uploading")
                                                    .removeClass("save-btn");
                                                childView
                                                    .$(".delete-btn")
                                                    .text("Delete")
                                                    .removeClass("u-hide")
                                                    .removeClass("cancel-btn");
                                            } else {
                                                childView
                                                    .$(
                                                        ".js-comment-actions .edit-btn"
                                                    )
                                                    .text("Edit")
                                                    .removeClass("uploading")
                                                    .removeClass("save-btn");
                                                childView
                                                    .$(
                                                        ".js-comment-actions .delete-btn"
                                                    )
                                                    .text("Delete")
                                                    .removeClass("u-hide")
                                                    .removeClass("cancel-btn");
                                            }
                                            oneDiscussionView
                                                .$(".selected-comment")
                                                .removeClass(
                                                    "selected-comment"
                                                );
                                        },
                                    }
                                );
                            }
                        );
                    };
                    //DELETE COMMENT
                    oneDiscussionView.on(
                        "childview:delete:comment",
                        function (childView, model) {
                            _deleteComment(model.comment_id);
                        }
                    );
                    oneDiscussionView.on(
                        "childview:childview:delete:comment",
                        function (childView, model, options) {
                            _deleteComment(options.comment_id, options.index);
                        }
                    );
                    var _deleteComment = function (comment_id, index) {
                        var comment = new SocialManager.Entities.Comment({
                            _id: comment_id,
                        });
                        comment.destroy({
                            dataType: "text",
                            success: function (model, response) {
                                if (index != null) {
                                    var comment = oneDiscussionView.children
                                        .findByIndex(index)
                                        .collection.get(comment_id);
                                    oneDiscussionView.children
                                        .findByIndex(index)
                                        .collection.remove(comment);
                                } else {
                                    var comment =
                                        oneDiscussionView.collection.get(
                                            comment_id
                                        );
                                    oneDiscussionView.collection.remove(
                                        comment
                                    );
                                }
                            },
                        });
                    };
                    //UPDATE POLL
                    oneDiscussionView.on("update:poll", function (value) {
                        var discussion = new SocialManager.Entities.Discussion({
                            _id: value.discussion_id,
                            _action: "edit_poll",
                        });
                        discussion.set({
                            ref_id: value.ref_id,
                            position: value.position,
                        });
                        discussion.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {},
                            }
                        );
                    });
                    //FEATURE DISCUSSION
                    oneDiscussionView.on("feature:discussion", function () {
                        var edit_discussion =
                            new SocialManager.Entities.Discussion({
                                _id: discussion.get("_id"),
                                _action: "feature",
                            });
                        edit_discussion.set({});
                        edit_discussion.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    SocialManager.commands.execute(
                                        "close:modal"
                                    );
                                    SocialManager.vent.trigger("featured:show");
                                },
                            }
                        );
                    });
                    //DELETE DISCUSSION
                    oneDiscussionView.on("delete:discussion", function (value) {
                        var discussion = new SocialManager.Entities.Discussion({
                            _id: value.discussion_id,
                        });
                        discussion.destroy({
                            dataType: "text",
                            success: function (model, response) {
                                SocialManager.commands.execute("close:modal");
                                location.reload();
                            },
                        });
                    });
                    //Check if featured
                    if (slug) {
                        SocialManager.modalRegion.show(oneDiscussionView);
                    } else {
                        SocialManager.featuredRegion.show(oneDiscussionView);
                    }
                });
            },
            showTagsOverlay: function (slug) {
                $(".overlay").show();
                var excluded_tags = [];
                //Fetch discussion
                var fetchingDiscussion = SocialManager.request(
                    "discussion:entity",
                    slug
                );
                $.when(fetchingDiscussion).done(function (discussion) {
                    var tagsView =
                        new SocialManager.SocialApp.EntityViews.DiscussionTagsView(
                            {
                                model: discussion,
                            }
                        );
                    //Show
                    tagsView.on("show", function () {
                        setTimeout(function () {
                            tagsView.$(".overlay-box").addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        SocialManager.commands.execute("show:overlay");
                        //Add tags to excluded
                        if (
                            discussion.get("tags") &&
                            discussion.get("tags").length
                        ) {
                            var discussion_tags = discussion.get("tags");
                            for (var i = 0; i < discussion_tags.length; i++) {
                                excluded_tags.push(discussion_tags[i]._id);
                            }
                        }
                        //Typeahead for tags
                        //Remote fetch tags
                        var tagList = new Bloodhound({
                            datumTokenizer:
                                Bloodhound.tokenizers.obj.whitespace("value"),
                            queryTokenizer:
                                Bloodhound.tokenizers.obj.whitespace,
                            remote: {
                                url: "/api/search/tags?name=%QUERY&excluded=%EXCLUDED",
                                replace: function (url) {
                                    return url
                                        .replace(
                                            "%EXCLUDED",
                                            JSON.stringify(excluded_tags)
                                        )
                                        .replace(
                                            "%QUERY",
                                            tagsView
                                                .$(".tags-input.tt-input")
                                                .val()
                                        );
                                },
                                filter: function (parsedResponse) {
                                    return parsedResponse;
                                },
                            },
                        });
                        //Initialize tags
                        tagList.initialize();
                        //Show typeahead
                        tagsView.$(".tags-input").typeahead(
                            {
                                hint: true,
                                highlight: true,
                                minLength: 1,
                            },
                            {
                                name: "name",
                                displayKey: "name",
                                limit: 5,
                                source: tagList.ttAdapter(),
                                templates: {
                                    empty: [
                                        '<div class="no-find">',
                                        "No such tags found.",
                                        "</div>",
                                    ].join("\n"),
                                    suggestion: Handlebars.compile(
                                        "<p class='name'>{{name}}</p>"
                                    ),
                                },
                            }
                        );
                        //Focus
                        tagsView.$(".tags-input").focus();
                        //Add new tag on typeahead autocomplete
                        tagsView
                            .$(".tags-input")
                            .on(
                                "typeahead:selected typeahead:autocompleted",
                                function (e, datum) {
                                    var new_tag =
                                        new SocialManager.Entities.Discussion({
                                            _id: discussion.get("_id"),
                                            _action: "add_tag",
                                        });
                                    new_tag.set({
                                        tag: datum._id,
                                    });
                                    new_tag.save(
                                        {},
                                        {
                                            success: function () {
                                                var $input =
                                                    tagsView.$(".tags-input");
                                                $input
                                                    .typeahead("val", "")
                                                    .focus();
                                                //Add tag
                                                var tag = new_tag.toJSON();
                                                tagsView.collection.add(tag);
                                                //Add to excluded
                                                excluded_tags.push(tag._id);
                                            },
                                        }
                                    );
                                }
                            );
                    });
                    //Remove tag
                    tagsView.on(
                        "childview:remove:tag",
                        function (childView, model) {
                            var edit_discussion =
                                new SocialManager.Entities.Discussion({
                                    _id: discussion.get("_id"),
                                    _action: "remove_tag",
                                });
                            edit_discussion.set({
                                tag: model.get("_id"),
                            });
                            edit_discussion.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        tagsView.collection.remove(model);
                                        //Remove element from excluded tags
                                        var index = excluded_tags.indexOf(
                                            model.get("_id")
                                        );
                                        if (index > -1) {
                                            excluded_tags.splice(index, 1);
                                        }
                                    },
                                }
                            );
                        }
                    );
                    SocialManager.overlayRegion.show(tagsView);
                });
            },
            showExploreTags: function (hasClicked) {
                //Fetch tags
                var fetchingTags = SocialManager.request(
                    "tag:entities",
                    "explore"
                );
                $.when(fetchingTags).done(function (tags) {
                    var exploreTagsView =
                        new SocialManager.SocialApp.EntityViews.ExploreTagsView(
                            {
                                collection: tags,
                            }
                        );
                    //Show
                    exploreTagsView.on("show", function () {
                        //Show this modal only if tags are present
                        if (tags.length) {
                            $(".modal").show();
                            //Animate modal box
                            setTimeout(function () {
                                exploreTagsView
                                    .$(".modal-box")
                                    .addClass("animate");
                            }, 100);
                            //hide scroll on main page
                            SocialManager.commands.execute("show:overlay");
                            //Set explore tags cookie
                            Cookies.set("exploreTags", 1);
                        } else {
                            if (hasClicked)
                                alert(
                                    "You seem to have subscribed to all tags!"
                                );
                            SocialManager.commands.execute("close:modal");
                        }
                    });
                    //Subscribe to tag
                    exploreTagsView.on(
                        "childview:subscribe:tag",
                        function (childView, model) {
                            var edit_tag = new SocialManager.Entities.Tag({
                                _id: model,
                                _action: "subscribe",
                            });
                            edit_tag.set({});
                            edit_tag.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        childView
                                            .$(".subscribe-tag")
                                            .addClass("selected")
                                            .text("Subscribed");
                                    },
                                }
                            );
                        }
                    );
                    //Unsubscribe from tag
                    exploreTagsView.on(
                        "childview:unsubscribe:tag",
                        function (childView, model) {
                            var edit_tag = new SocialManager.Entities.Tag({
                                _id: model,
                                _action: "unsubscribe",
                            });
                            edit_tag.set({});
                            edit_tag.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        childView
                                            .$(".subscribe-tag")
                                            .removeClass("selected")
                                            .text("Subscribe");
                                    },
                                }
                            );
                        }
                    );
                    SocialManager.modalRegion.show(exploreTagsView);
                });
            },
            showSelectBadgesOverlay: function (discussion_id, badge) {
                $(".overlay").show();
                //Fetch badges
                var fetchingBadges = SocialManager.request("badge:entities");
                $.when(fetchingBadges).done(function (badges) {
                    var badgesView =
                        new SocialManager.SocialApp.EntityViews.DiscussionBadgesView(
                            {
                                collection: badges,
                            }
                        );
                    //Show
                    badgesView.on("show", function () {
                        setTimeout(function () {
                            badgesView.$(".overlay-box").addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        SocialManager.commands.execute("show:overlay");
                        //Show selected badge
                        if (badge) {
                            $(
                                ".discussion-badges .one-badge[data-id='" +
                                    badge._id +
                                    "']"
                            ).addClass("selected");
                            $(".one-badge.selected .badge-name").css(
                                "backgroundColor",
                                badge.color
                            );
                        }
                    });
                    //Add badge to discussion
                    badgesView.on(
                        "childview:select:badge",
                        function (childView, model) {
                            var new_badge =
                                new SocialManager.Entities.Discussion({
                                    _id: discussion_id,
                                    _action: "add_badge",
                                });
                            new_badge.set({
                                badge: model,
                            });
                            new_badge.save(
                                {},
                                {
                                    success: function () {
                                        //Select
                                        $(
                                            ".discussion-badges .one-badge[data-id='" +
                                                new_badge.get("_id") +
                                                "']"
                                        ).addClass("selected");
                                        $(
                                            ".one-badge.selected .badge-name"
                                        ).css(
                                            "backgroundColor",
                                            new_badge.get("color")
                                        );
                                    },
                                }
                            );
                        }
                    );
                    //Remove badge from discussion
                    badgesView.on(
                        "childview:unselect:badge",
                        function (childView, model) {
                            var edit_discussion =
                                new SocialManager.Entities.Discussion({
                                    _id: discussion_id,
                                    _action: "remove_badge",
                                });
                            edit_discussion.set({
                                badge: model,
                            });
                            edit_discussion.save();
                        }
                    );
                    SocialManager.overlayRegion.show(badgesView);
                });
            },
            showModeratorsOverlay: function (slug) {
                $(".overlay").show();
                var excluded_ids = [];
                //Fetch discussion
                var fetchingDiscussion = SocialManager.request(
                    "discussion:entity",
                    slug
                );
                $.when(fetchingDiscussion).done(function (discussion) {
                    var moderatorsView =
                        new SocialManager.SocialApp.EntityViews.DiscussionModeratorsView(
                            {
                                model: discussion,
                            }
                        );
                    //Show
                    moderatorsView.on("show", function () {
                        setTimeout(function () {
                            moderatorsView
                                .$(".overlay-box")
                                .addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        SocialManager.commands.execute("show:overlay");
                        //Add ids to excluded
                        if (
                            discussion.get("moderators") &&
                            discussion.get("moderators").length
                        ) {
                            var discussion_moderators =
                                discussion.get("moderators");
                            for (
                                var i = 0;
                                i < discussion_moderators.length;
                                i++
                            ) {
                                excluded_ids.push(discussion_moderators[i]._id);
                            }
                        }
                        //Typeahead for users
                        //Remote fetch user list
                        var userList = new Bloodhound({
                            datumTokenizer:
                                Bloodhound.tokenizers.obj.whitespace("value"),
                            queryTokenizer:
                                Bloodhound.tokenizers.obj.whitespace,
                            remote: {
                                url: "/api/search/users?text=%QUERY&excluded=%EXCLUDED",
                                replace: function (url) {
                                    return url
                                        .replace(
                                            "%EXCLUDED",
                                            JSON.stringify(excluded_ids)
                                        )
                                        .replace(
                                            "%QUERY",
                                            moderatorsView
                                                .$(".collab-input.tt-input")
                                                .val()
                                        );
                                },
                                filter: function (parsedResponse) {
                                    return parsedResponse;
                                },
                            },
                        });
                        //Initialize userlist
                        userList.initialize();
                        //Show typeahead
                        moderatorsView.$(".collab-input").typeahead(
                            {
                                hint: true,
                                highlight: true,
                                minLength: 1,
                            },
                            {
                                name: "email",
                                displayKey: "name",
                                limit: 5,
                                source: userList.ttAdapter(),
                                templates: {
                                    empty: [
                                        '<div class="no-find">',
                                        "Unable to find any users.",
                                        "</div>",
                                    ].join("\n"),
                                    suggestion: Handlebars.compile(
                                        "<p class='name'>{{name}}</p>"
                                    ),
                                },
                            }
                        );
                        //Focus
                        moderatorsView.$(".collab-input").focus();
                        //Add new moderator on typeahead autocomplete
                        moderatorsView
                            .$(".collab-input")
                            .on(
                                "typeahead:selected typeahead:autocompleted",
                                function (e, datum) {
                                    var new_moderator =
                                        new SocialManager.Entities.Discussion({
                                            _id: discussion.get("_id"),
                                            _action: "add_moderator",
                                        });
                                    new_moderator.set({
                                        user_id: datum._id,
                                    });
                                    new_moderator.save(
                                        {},
                                        {
                                            success: function () {
                                                var $input =
                                                    moderatorsView.$(
                                                        ".collab-input"
                                                    );
                                                $input
                                                    .typeahead("val", "")
                                                    .focus();
                                                //Add moderator
                                                var moderator =
                                                    new_moderator.toJSON();
                                                moderatorsView.collection.add(
                                                    moderator
                                                );
                                                //Add to excluded
                                                excluded_ids.push(datum._id);
                                            },
                                        }
                                    );
                                }
                            );
                    });
                    //Remove moderator
                    moderatorsView.on(
                        "childview:remove:moderator",
                        function (childView, model) {
                            var edit_discussion =
                                new SocialManager.Entities.Discussion({
                                    _id: discussion.get("_id"),
                                    _action: "remove_moderator",
                                });
                            edit_discussion.set({
                                user_id: model.get("_id"),
                            });
                            edit_discussion.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        moderatorsView.collection.remove(model);
                                        //Remove element from excluded ids
                                        var index = excluded_ids.indexOf(
                                            model.get("_id")
                                        );
                                        if (index > -1) {
                                            excluded_ids.splice(index, 1);
                                        }
                                    },
                                }
                            );
                        }
                    );
                    SocialManager.overlayRegion.show(moderatorsView);
                });
            },
            showUserDetails: function (slug, type) {
                //Select nav
                $(".mainNav .nav-front, .mainNav .nav-profile").addClass(
                    "u-hide"
                );
                $(".mainNav a, .profile-people > a").removeClass("selected");
                if (!slug || slug == $(".mainWrap").data("username")) {
                    $(".mainNav .nav-profile").removeClass("u-hide");
                    if (type == "queued") {
                        $(".mainNav .js-nav-queued").addClass("selected");
                    } else if (!type) {
                        $(".mainNav .js-nav-my").addClass("selected");
                    }
                } else {
                    $(".mainNav .nav-profile").addClass("u-hide");
                }
                //Close featured region
                SocialManager.commands.execute("close:featured");
                //Show loading page
                var loadingView = new SocialManager.Common.Views.Loading();
                SocialManager.contentRegion.show(loadingView);
                //Fetch user
                var fetchingUser = SocialManager.request(
                    "userDetails:entity",
                    slug
                );
                $.when(fetchingUser).done(function (user) {
                    var profileView =
                        new SocialManager.SocialApp.EntityViews.ProfileView({
                            model: user,
                        });
                    //Show
                    profileView.on("show", function () {
                        document.title = user.get("name") + " - MGIEP Social";
                        //Select nav
                        if (type == "following") {
                            $(".js-following").addClass("selected");
                        } else if (type == "followers") {
                            $(".js-followers").addClass("selected");
                        }
                        //Show user's data
                        if (!type) type = "discussions";
                        SocialManager.vent.trigger(
                            "profileData:show",
                            user.get("_id"),
                            user.get("username"),
                            type
                        );
                    });
                    //Follow user
                    profileView.on("follow:user", function (value) {
                        var new_following =
                            new SocialManager.Entities.Following({
                                user_id: value,
                            });
                        new_following.save();
                    });
                    //Unfollow user
                    profileView.on("unfollow:user", function (value) {
                        var following = new SocialManager.Entities.Following({
                            _id: value,
                        });
                        following.destroy();
                    });
                    SocialManager.headerRegion.show(profileView);
                });
            },
            showUsers: function (_id, type, search_text) {
                //Show loading page
                var loadingView = new SocialManager.Common.Views.Loading();
                SocialManager.contentRegion.show(loadingView);
                //Search
                if (search_text) {
                    var fetchingUsers = SocialManager.request(
                        "search:entities",
                        "users",
                        search_text
                    );
                } else {
                    if (type == "following") {
                        var fetchingUsers = SocialManager.request(
                            "following:entities",
                            _id
                        );
                    } else if (type == "followers") {
                        var fetchingUsers = SocialManager.request(
                            "followers:entities",
                            _id
                        );
                    }
                }
                //Fetch users
                $.when(fetchingUsers).done(function (users) {
                    var usersView =
                        new SocialManager.SocialApp.EntityViews.UsersView({
                            collection: users,
                        });
                    //Show
                    usersView.on("show", function () {
                        $(".mainContent > div").masonry({
                            itemSelector: ".user-card",
                            columnWidth: 300,
                        });
                        //Show empty states
                        if (search_text) {
                            usersView
                                .$(".empty-message.empty-search")
                                .removeClass("u-hide");
                        }
                    });
                    //Follow user
                    usersView.on(
                        "childview:follow:user",
                        function (childView, model) {
                            var new_following =
                                new SocialManager.Entities.Following({
                                    user_id: model,
                                });
                            new_following.save();
                        }
                    );
                    //Unfollow user
                    usersView.on(
                        "childview:unfollow:user",
                        function (childView, model) {
                            var following =
                                new SocialManager.Entities.Following({
                                    _id: model,
                                });
                            following.destroy();
                        }
                    );
                    SocialManager.contentRegion.show(usersView);
                });
            },
            showNewTagOverlay: function () {
                $(".overlay").show();
                //New tag view
                var newTagView =
                    new SocialManager.SocialApp.EntityViews.NewTagView();
                //Show
                newTagView.on("show", function () {
                    setTimeout(function () {
                        newTagView.$(".overlay-box").addClass("animate");
                    }, 100);
                    //Hide scroll on main page
                    SocialManager.commands.execute("show:overlay");
                    //Focus
                    newTagView.$(".tag-name").focus();
                });
                //Save new tag
                newTagView.on("save:tag", function (value) {
                    var new_tag = new SocialManager.Entities.Tag({
                        name: value.name,
                        desc: value.desc,
                        is_public: value.is_public,
                    });
                    new_tag.save(
                        {},
                        {
                            success: function () {
                                SocialManager.vent.trigger("add:tag", new_tag);
                                //Show tag members overlay if private
                                if (value.is_public) {
                                    SocialManager.commands.execute(
                                        "close:overlay"
                                    );
                                } else {
                                    SocialManager.vent.trigger(
                                        "tagMembers:show",
                                        new_tag.get("_id")
                                    );
                                }
                            },
                        }
                    );
                });
                SocialManager.overlayRegion.show(newTagView);
            },
            showEditTagOverlay: function (tag_id) {
                $(".overlay").show();
                //Fetch tag
                var fetchingTag = SocialManager.request("tag:entity", tag_id);
                $.when(fetchingTag).done(function (tag) {
                    //New tag view
                    var newTagView =
                        new SocialManager.SocialApp.EntityViews.NewTagView();
                    //Show
                    newTagView.on("show", function () {
                        //Add edit class
                        newTagView.$(".overlay-box").addClass("edit-box");
                        newTagView.$(".overlay-header").text("Edit Tag");
                        //Delete tag
                        newTagView.$(".tag-edit-footer").removeClass("u-hide");
                        //Animate overlay box
                        setTimeout(function () {
                            newTagView.$(".overlay-box").addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        SocialManager.commands.execute("show:overlay");
                        //Fill values
                        newTagView.$(".tag-name").val(tag.get("name")).focus();
                        if (!tag.get("is_public")) {
                            newTagView
                                .$(".privacy-label input")
                                .prop("checked", true);
                        }
                        //Fill description
                        if (tag.get("desc")) {
                            var html = tag
                                .get("desc")
                                .replace(/<br\s*[\/]?>/gi, "\n");
                            var tmp = document.createElement("div");
                            tmp.innerHTML = html;
                            var desc = tmp.textContent || tmp.innerText || "";
                            newTagView.$(".tag-desc").val(desc);
                        }
                        //Is active
                        if (tag.get("is_active")) {
                            newTagView
                                .$(".js-activate-tag")
                                .removeClass("tag-edit-activate")
                                .addClass("tag-edit-deactivate")
                                .text("Deactivate");
                        }
                    });
                    //Update tag
                    newTagView.on("update:tag", function (value) {
                        var edit_tag = new SocialManager.Entities.Tag({
                            _id: tag_id,
                            _action: "edit",
                        });
                        edit_tag.set({
                            name: value.name,
                            desc: value.desc,
                            is_public: value.is_public,
                        });
                        edit_tag.save(
                            {},
                            {
                                success: function () {
                                    SocialManager.commands.execute(
                                        "close:overlay"
                                    );
                                    $(".tagHeader .tag-name").text(
                                        edit_tag.get("name")
                                    );
                                    $(".tagHeader .tag-desc").html(
                                        edit_tag.get("desc")
                                    );
                                },
                            }
                        );
                    });
                    //Activate tag
                    newTagView.on("activate:tag", function () {
                        var edit_tag = new SocialManager.Entities.Tag({
                            _id: tag_id,
                            _action: "activate",
                        });
                        edit_tag.set({});
                        edit_tag.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    newTagView
                                        .$(".js-activate-tag")
                                        .removeClass("tag-edit-activate")
                                        .addClass("tag-edit-deactivate")
                                        .text("Deactivate");
                                },
                            }
                        );
                    });
                    //Deactivate
                    newTagView.on("deactivate:tag", function () {
                        var edit_tag = new SocialManager.Entities.Tag({
                            _id: tag_id,
                            _action: "deactivate",
                        });
                        edit_tag.set({});
                        edit_tag.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    newTagView
                                        .$(".js-activate-tag")
                                        .removeClass("tag-edit-deactivate")
                                        .addClass("tag-edit-activate")
                                        .text("Activate");
                                },
                            }
                        );
                    });
                    //Delete tag
                    newTagView.on("delete:tag", function () {
                        var edit_tag = new SocialManager.Entities.Tag({
                            _id: tag_id,
                        });
                        edit_tag.destroy({
                            dataType: "text",
                            success: function (model, response) {},
                        });
                    });
                    SocialManager.overlayRegion.show(newTagView);
                });
            },
            showTagMembersOverlay: function (tag_id, is_edit) {
                if (is_edit) $(".overlay").show();
                var excluded_ids = [$(".mainWrap").data("user")];
                //Fetch tag
                var fetchingTag = SocialManager.request("tag:entity", tag_id);
                $.when(fetchingTag).done(function (tag) {
                    var members = new Backbone.Collection(tag.get("members"));
                    var membersView =
                        new SocialManager.SocialApp.EntityViews.TagMembersView({
                            collection: members,
                        });
                    //Show
                    membersView.on("show", function () {
                        if (is_edit) {
                            membersView.$(".overlay-box").addClass("edit-box");
                            //Animate overlay box
                            setTimeout(function () {
                                membersView
                                    .$(".overlay-box")
                                    .addClass("animate");
                            }, 100);
                            //Hide scroll on main page
                            SocialManager.commands.execute("show:overlay");
                        } else {
                            membersView
                                .$(".overlay-box")
                                .addClass("animate")
                                .data("slug", tag.get("slug"));
                        }
                        //Add creator and members to excluded
                        excluded_ids.push(tag.get("creator")._id);
                        if (tag.get("members") && tag.get("members").length) {
                            var tag_members = tag.get("members");
                            for (var i = 0; i < tag_members.length; i++) {
                                if (tag_members[i].user) {
                                    excluded_ids.push(tag_members[i].user._id);
                                }
                            }
                        }
                        //Typeahead for users
                        //Remote fetch user list
                        var userList = new Bloodhound({
                            datumTokenizer:
                                Bloodhound.tokenizers.obj.whitespace("value"),
                            queryTokenizer:
                                Bloodhound.tokenizers.obj.whitespace,
                            remote: {
                                url: "/api/search/users?text=%QUERY&excluded=%EXCLUDED",
                                replace: function (url) {
                                    return url
                                        .replace(
                                            "%EXCLUDED",
                                            JSON.stringify(excluded_ids)
                                        )
                                        .replace(
                                            "%QUERY",
                                            membersView
                                                .$(".collab-input.tt-input")
                                                .val()
                                        );
                                },
                                filter: function (parsedResponse) {
                                    return parsedResponse;
                                },
                            },
                        });
                        //Initialize userlist
                        userList.initialize();
                        //Show typeahead
                        membersView
                            .$(".collab-input")
                            .typeahead(
                                {
                                    hint: true,
                                    highlight: true,
                                    minLength: 1,
                                },
                                {
                                    name: "email",
                                    displayKey: "name",
                                    limit: 5,
                                    source: userList.ttAdapter(),
                                    templates: {
                                        empty: [
                                            '<div class="no-find">',
                                            "Unable to find any users.",
                                            "</div>",
                                        ].join("\n"),
                                        suggestion: Handlebars.compile(
                                            "<p class='name'>{{name}}</p>"
                                        ),
                                    },
                                }
                            )
                            .keyup(function (ev) {
                                var $input = membersView.$(".collab-input");
                                var email = $input.typeahead("val");
                                if (
                                    validator.isEmail(email) &&
                                    membersView.$(".no-find").length
                                ) {
                                    setTimeout(function () {
                                        membersView
                                            .$(".no-find")
                                            .text(
                                                "Press enter to invite this user"
                                            );
                                    }, 600);
                                    //Invite user by email
                                    if (ev.which == ENTER_KEY) {
                                        var new_member =
                                            new SocialManager.Entities.Tag({
                                                _id: tag_id,
                                                _action: "add_member",
                                            });
                                        new_member.set({
                                            email: email,
                                        });
                                        new_member.save(
                                            {},
                                            {
                                                success: function () {
                                                    $input
                                                        .typeahead("val", "")
                                                        .focus();
                                                    members.add(new_member);
                                                    //Add to excluded
                                                    if (
                                                        new_member.get("user")
                                                    ) {
                                                        excluded_ids.push(
                                                            new_member.get(
                                                                "user"
                                                            )._id
                                                        );
                                                    }
                                                },
                                            }
                                        );
                                    }
                                }
                            });
                        //Focus
                        membersView.$(".collab-input").focus();
                        //Add new collaborators on typeahead autocomplete
                        membersView
                            .$(".collab-input")
                            .on(
                                "typeahead:selected typeahead:autocompleted",
                                function (e, datum) {
                                    var new_member =
                                        new SocialManager.Entities.Tag({
                                            _id: tag_id,
                                            _action: "add_member",
                                        });
                                    new_member.set({
                                        user_id: datum._id,
                                    });
                                    new_member.save(
                                        {},
                                        {
                                            success: function () {
                                                var $input =
                                                    membersView.$(
                                                        ".collab-input"
                                                    );
                                                $input
                                                    .typeahead("val", "")
                                                    .focus();
                                                //Add member
                                                members.add(new_member);
                                                //Add to excluded
                                                excluded_ids.push(datum._id);
                                            },
                                        }
                                    );
                                }
                            );
                    });
                    //Add inactive collaborator
                    membersView.on(
                        "childview:add:user",
                        function (childView, model) {
                            var new_member = new SocialManager.Entities.Tag({
                                _id: tag_id,
                                _action: "add_member",
                            });
                            new_member.set({
                                user_id: model.user_id,
                            });
                            new_member.save(
                                {},
                                {
                                    success: function () {
                                        childView.$(".add-user").remove();
                                    },
                                }
                            );
                        }
                    );
                    //Remove collaborator
                    membersView.on(
                        "childview:remove:user",
                        function (childView, model) {
                            var tag = new SocialManager.Entities.Tag({
                                _id: tag_id,
                                _action: "remove_member",
                            });
                            tag.set({
                                user_id: model.user_id,
                                email: model.email,
                            });
                            tag.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        if (
                                            model.user_id ==
                                            $(".mainWrap").data("user")
                                        ) {
                                            //Leave
                                            SocialManager.commands.execute(
                                                "close:overlay"
                                            );
                                            SocialManager.vent.trigger(
                                                "remove:tag",
                                                tag_id
                                            );
                                        } else {
                                            childView.$el.remove();
                                            //Remove user_id from excluded ids
                                            if (model.user_id) {
                                                var index =
                                                    excluded_ids.indexOf(
                                                        model.user_id
                                                    );
                                                if (index > -1) {
                                                    excluded_ids.splice(
                                                        index,
                                                        1
                                                    );
                                                }
                                            }
                                        }
                                    },
                                }
                            );
                        }
                    );
                    SocialManager.overlayRegion.show(membersView);
                });
            },
            showNewDiscussionOverlay: function () {
                $(".overlay").show();
                var newDiscussionView =
                    new SocialManager.SocialApp.EntityViews.NewDiscussionView();
                //Editor
                var newEditor;
                var newEditorFiles = [];
                //Show
                newDiscussionView.on("show", function () {
                    setTimeout(function () {
                        newDiscussionView.$(".overlay-box").addClass("animate");
                    }, 100);
                    //Hide scroll on main page
                    SocialManager.commands.execute("show:overlay");
                    //Show link area
                    newDiscussionView.$(".entity-area .text-discussion").show();
                    newDiscussionView.$(".text-discussion-title").focus();
                    //Editor
                    //Wait till editor is ready
                    newDiscussionView
                        .$(".entity-text")
                        .bind("click mousedown dblclick", function (ev) {
                            ev.preventDefault();
                            ev.stopImmediatePropagation();
                        });
                    newEditor = setUpAlloyToolbar(
                        false,
                        document.querySelector(".text-discussion textarea"),
                        false,
                        false
                    );
                    var nativeEditor = newEditor.get("nativeEditor");
                    //On editor ready
                    nativeEditor.on("instanceReady", function (ev) {
                        newDiscussionView.$(".entity-text").unbind();
                        //On change
                        nativeEditor.on("change", function (e) {
                            var desc = nativeEditor.getData();
                            if (desc) {
                                newDiscussionView
                                    .$(".js-save")
                                    .removeClass("u-hide");
                            } else {
                                newDiscussionView
                                    .$(".js-save")
                                    .addClass("u-hide");
                            }
                        });
                        //On enter key focus
                        newDiscussionView
                            .$(".text-discussion-title")
                            .keyup(function (ev) {
                                if (ev.which == ENTER_KEY) {
                                    var $target = $(ev.target);
                                    var caretOffset =
                                        $target.getCursorPosition();
                                    var lengthString = $target.val().length;
                                    var afterCaret = $target
                                        .val()
                                        .substring(caretOffset, lengthString);
                                    //Set data
                                    if (!afterCaret) {
                                        nativeEditor.focus();
                                    }
                                }
                            });
                    });
                    //On image upload
                    nativeEditor.on("imageAdd", function (ev) {
                        var id = generateRandomUUID();
                        ev.data.file.id = id;
                        newEditorFiles.push(ev.data.file);
                        $(ev.data.el.$)
                            .addClass("upload-image")
                            .attr("data-id", id);
                    });
                });
                //Tag id
                var tag_id = $(".mainHeader .tagHeader").data("tag");
                //UPLOAD FILES ON AMAZON S3
                newDiscussionView.on("open:fileBrowser", function () {
                    newDiscussionView.$(".direct-upload").each(function () {
                        //For each file selected, process and upload
                        var form = $(this);
                        var fileCount = 0;
                        var uploadCount = 0;
                        $(this).fileupload({
                            dropZone: $("#drop"),
                            url: form.attr("action"), //Grab form's action src
                            type: "POST",
                            autoUpload: true,
                            dataType: "xml", //S3's XML response,
                            add: function (event, data) {
                                if (data.files[0].size >= MAX_FILE_SIZE) return;
                                fileCount += 1;
                                //Upload through CORS
                                $.ajax({
                                    url: "/api/signed",
                                    type: "GET",
                                    dataType: "json",
                                    data: { title: data.files[0].name }, // Send filename to /signed for the signed response
                                    async: false,
                                    success: function (data) {
                                        // Now that we have our data, we update the form so it contains all
                                        // the needed data to sign the request
                                        form.find("input[name=key]").val(
                                            data.key
                                        );
                                        form.find("input[name=policy]").val(
                                            data.policy
                                        );
                                        form.find("input[name=signature]").val(
                                            data.signature
                                        );
                                        form.find(
                                            "input[name=Content-Type]"
                                        ).val(data.contentType);
                                    },
                                });
                                data.files[0].s3Url = form
                                    .find("input[name=key]")
                                    .val();
                                data.submit();
                            },
                            start: function (e) {
                                $("#drop span").html("Uploaded <b></b>");
                            },
                            progressall: function (e, data) {
                                var progress = parseInt(
                                    (data.loaded / data.total) * 100,
                                    10
                                );
                                $("#drop span b").text(progress + "%"); // Update progress bar percentage
                            },
                            fail: function (e, data) {
                                $("#drop span").html(
                                    "Choose files or drag and drop them here"
                                );
                            },
                            done: function (e, data) {
                                //Select status
                                if (
                                    newDiscussionView
                                        .$(".status-queued")
                                        .hasClass("selected")
                                ) {
                                    var status = "queued";
                                } else {
                                    var status = "other";
                                }
                                //File name
                                var file_name = data.files[0].name;
                                //Get extension of the file
                                var index = file_name.lastIndexOf(".");
                                var file_ext = file_name.substring(
                                    index + 1,
                                    file_name.length
                                );
                                var card_name = decodeURIComponent(
                                    file_name.substring(0, index)
                                );
                                //Url
                                var url =
                                    "https://d1c337161ud3pr.cloudfront.net/" +
                                    encodeURIComponent(data.files[0].s3Url)
                                        .replace(/'/g, "%27")
                                        .replace(/"/g, "%22");
                                //Get extension
                                var image_extensions = [
                                    "jpg",
                                    "png",
                                    "gif",
                                    "jpeg",
                                ];
                                if (image_extensions.indexOf(file_ext) < 0) {
                                    //Save file
                                    var new_discussion =
                                        new SocialManager.Entities.Discussion({
                                            type: "file",
                                            title: card_name,
                                            provider: {
                                                name: "Social",
                                                url: url,
                                            },
                                            file: {
                                                size: data.files[0].size,
                                                ext: file_ext,
                                            },
                                            tags: [tag_id],
                                            status: status,
                                        });
                                    //Save discussion
                                    new_discussion.save(
                                        {},
                                        {
                                            success: function () {
                                                uploadCount += 1;
                                                SocialManager.vent.trigger(
                                                    "add:discussion",
                                                    new_discussion
                                                );
                                                SocialManager.commands.execute(
                                                    "close:overlay"
                                                );
                                            },
                                        }
                                    );
                                } else {
                                    //Save image
                                    var new_discussion =
                                        new SocialManager.Entities.Discussion({
                                            type: "image",
                                            title: card_name,
                                            provider: {
                                                name: "Social",
                                                url: url,
                                            },
                                            file: {
                                                size: data.files[0].size,
                                                ext: file_ext,
                                            },
                                            image: url,
                                            tags: [tag_id],
                                            status: status,
                                        });
                                    var image = new Image();
                                    image.src = window.URL.createObjectURL(
                                        data.files[0]
                                    );
                                    image.onload = function () {
                                        var bound =
                                            (image.naturalHeight * 270) /
                                            image.naturalWidth;
                                        if (bound) {
                                            bound = parseInt(bound);
                                            new_discussion.set("bound", bound);
                                        }
                                        window.URL.revokeObjectURL(image.src);
                                        //Save discussion
                                        new_discussion.save(
                                            {},
                                            {
                                                success: function () {
                                                    uploadCount += 1;
                                                    SocialManager.vent.trigger(
                                                        "add:discussion",
                                                        new_discussion
                                                    );
                                                    SocialManager.commands.execute(
                                                        "close:overlay"
                                                    );
                                                },
                                            }
                                        );
                                    };
                                    image.onerror = function () {
                                        //Save discussion
                                        new_discussion.save(
                                            {},
                                            {
                                                success: function () {
                                                    uploadCount += 1;
                                                    SocialManager.vent.trigger(
                                                        "add:discussion",
                                                        new_discussion
                                                    );
                                                    SocialManager.commands.execute(
                                                        "close:overlay"
                                                    );
                                                },
                                            }
                                        );
                                    };
                                }
                            },
                        });
                    });
                });
                //CHOOSE AND SAVE FILES FROM GOOGLE DRIVE
                newDiscussionView.on("open:driveChooser", function () {
                    //Google Drive
                    var picker = new FilePicker({
                        apiKey: "AIzaSyAe7bRkxvcagYJbOqjbc0dRh4jNa46Eziw",
                        clientId:
                            "657304246782-pj2nspp4b4ieseognmdjs1s2h3hqchbe.apps.googleusercontent.com",
                        buttonEl: $(".ch-drive")[0],
                        onSelect: function (file) {
                            //Select status
                            if (
                                newDiscussionView
                                    .$(".status-queued")
                                    .hasClass("selected")
                            ) {
                                var status = "queued";
                            } else {
                                var status = "other";
                            }
                            //Get name of file without extension
                            var index = file.title.lastIndexOf(".");
                            var file_name = file.title.substring(0, index);
                            //Check image or file
                            if (
                                file.mimeType &&
                                file.mimeType.split("/")[0] == "image"
                            ) {
                                //Get thumbnail and its bound
                                var thumbnail = file.thumbnailLink;
                                thumbnail =
                                    thumbnail.substring(
                                        0,
                                        thumbnail.length - 3
                                    ) + 270;
                                //Save image
                                var new_discussion =
                                    new SocialManager.Entities.Discussion({
                                        type: "image",
                                        title:
                                            $(
                                                ".file-discussion-title.entity-title"
                                            ).val() || file_name,
                                        provider: {
                                            name: "Google Drive",
                                            url: file.alternateLink,
                                        },
                                        file: {
                                            size: file.fileSize || "",
                                            ext: file.fileExtension,
                                        },
                                        image: thumbnail,
                                        tags: [tag_id],
                                        status: status,
                                    });
                                //Get bound
                                var image = new Image();
                                image.src = thumbnail;
                                image.onload = function () {
                                    new_discussion.set("bound", this.height);
                                    new_discussion.save(
                                        {},
                                        {
                                            success: function () {
                                                SocialManager.vent.trigger(
                                                    "add:discussion",
                                                    new_discussion
                                                );
                                                SocialManager.commands.execute(
                                                    "close:overlay"
                                                );
                                            },
                                        }
                                    );
                                };
                                image.onerror = function () {
                                    new_discussion.save(
                                        {},
                                        {
                                            success: function () {
                                                SocialManager.vent.trigger(
                                                    "add:discussion",
                                                    new_discussion
                                                );
                                                SocialManager.commands.execute(
                                                    "close:overlay"
                                                );
                                            },
                                        }
                                    );
                                };
                            } else {
                                //Google docs
                                if (
                                    file.mimeType ==
                                    "application/vnd.google-apps.document"
                                ) {
                                    file_name = file.title;
                                    var file_ext = "doc";
                                } else if (
                                    file.mimeType ==
                                    "application/vnd.google-apps.presentation"
                                ) {
                                    file_name = file.title;
                                    var file_ext = "ppt";
                                } else if (
                                    file.mimeType ==
                                    "application/vnd.google-apps.spreadsheet"
                                ) {
                                    file_name = file.title;
                                    var file_ext = "sheet";
                                } else if (
                                    file.mimeType ==
                                    "application/vnd.google-apps.form"
                                ) {
                                    file_name = file.title;
                                    var file_ext = "form";
                                } else {
                                    var file_ext = file.fileExtension;
                                    var thumbnail = file.thumbnailLink;
                                }
                                //Save thumbnail
                                if (thumbnail) {
                                    //Get thumbnail and its bound
                                    thumbnail =
                                        thumbnail.substring(
                                            0,
                                            thumbnail.length - 3
                                        ) + 270;
                                    //Save file
                                    var new_discussion =
                                        new SocialManager.Entities.Discussion({
                                            type: "file",
                                            title:
                                                $(
                                                    ".file-discussion-title.entity-title"
                                                ).val() || file_name,
                                            provider: {
                                                name: "Google Drive",
                                                url: file.alternateLink,
                                            },
                                            file: {
                                                size: file.fileSize || "",
                                                ext: file_ext,
                                            },
                                            image: thumbnail,
                                            tags: [tag_id],
                                            status: status,
                                        });
                                    //Get bound
                                    var image = new Image();
                                    image.src = thumbnail;
                                    image.onload = function () {
                                        new_discussion.set(
                                            "bound",
                                            this.height
                                        );
                                        new_discussion.save(
                                            {},
                                            {
                                                success: function () {
                                                    SocialManager.vent.trigger(
                                                        "add:discussion",
                                                        new_discussion
                                                    );
                                                    SocialManager.commands.execute(
                                                        "close:overlay"
                                                    );
                                                },
                                            }
                                        );
                                    };
                                    image.onerror = function () {
                                        new_discussion.save(
                                            {},
                                            {
                                                success: function () {
                                                    SocialManager.vent.trigger(
                                                        "add:discussion",
                                                        new_discussion
                                                    );
                                                    SocialManager.commands.execute(
                                                        "close:overlay"
                                                    );
                                                },
                                            }
                                        );
                                    };
                                } else {
                                    //Save file
                                    var new_discussion =
                                        new SocialManager.Entities.Discussion({
                                            type: "file",
                                            title:
                                                $(
                                                    ".file-discussion-title.entity-title"
                                                ).val() || file_name,
                                            provider: {
                                                name: "Google Drive",
                                                url: file.alternateLink,
                                            },
                                            file: {
                                                size: file.fileSize || "",
                                                ext: file_ext,
                                            },
                                            tags: [tag_id],
                                            status: status,
                                        });
                                    new_discussion.save(
                                        {},
                                        {
                                            success: function () {
                                                SocialManager.vent.trigger(
                                                    "add:discussion",
                                                    new_discussion
                                                );
                                                SocialManager.commands.execute(
                                                    "close:overlay"
                                                );
                                            },
                                        }
                                    );
                                }
                            }
                        },
                    });
                });
                //CHOOSE AND SAVE FILES FROM DROPBOX
                newDiscussionView.on("open:dropBoxChooser", function () {
                    Dropbox.choose({
                        linkType: "preview",
                        multiselect: true,
                        success: function (files) {
                            //Select status
                            if (
                                newDiscussionView
                                    .$(".status-queued")
                                    .hasClass("selected")
                            ) {
                                var status = "queued";
                            } else {
                                var status = "other";
                            }
                            //Process each selected file
                            async.eachSeries(
                                files,
                                function (f, callback) {
                                    //Get extension of the file
                                    var file_name = f.name;
                                    var index = file_name.lastIndexOf(".");
                                    var extension = file_name.substring(
                                        index + 1,
                                        file_name.length
                                    );
                                    file_name = file_name.substring(0, index);
                                    //Get icon based on file_type
                                    if (f.thumbnailLink) {
                                        // strip off the existing query parameters
                                        var baseThumbnail =
                                            f.thumbnailLink.split("?")[0];
                                        // add "?mode=crop&bounding_box=800"
                                        var cropped =
                                            baseThumbnail +
                                            "?" +
                                            $.param({
                                                mode: "crop",
                                                bounding_box: 256,
                                            });
                                        var bound = 270;
                                    }
                                    //Get file type
                                    var image_extensions = [
                                        "jpg",
                                        "png",
                                        "gif",
                                        "jpeg",
                                    ];
                                    if (
                                        image_extensions.indexOf(extension) > -1
                                    ) {
                                        var type = "image";
                                    } else {
                                        var type = "file";
                                    }
                                    //Save file
                                    var new_discussion =
                                        new SocialManager.Entities.Discussion({
                                            type: type,
                                            title:
                                                $(
                                                    ".file-discussion-title.entity-title"
                                                ).val() || file_name,
                                            provider: {
                                                name: "Dropbox",
                                                url: f.link,
                                                favicon: f.icon.replace(
                                                    "64",
                                                    "128"
                                                ),
                                            },
                                            file: {
                                                size: f.bytes,
                                                ext: extension,
                                            },
                                            image: cropped,
                                            bound: bound,
                                            tags: [tag_id],
                                            status: status,
                                        });
                                    new_discussion.save(
                                        {},
                                        {
                                            success: function () {
                                                SocialManager.vent.trigger(
                                                    "add:discussion",
                                                    new_discussion
                                                );
                                                callback();
                                            },
                                        }
                                    );
                                },
                                function (err) {
                                    SocialManager.commands.execute(
                                        "close:overlay"
                                    );
                                }
                            );
                        },
                        cancel: function () {},
                    });
                });
                //SAVE DISCUSSION
                newDiscussionView.on("save:discussion", function (value) {
                    if (value.type == "link") {
                        if (!value.image) {
                            var new_discussion =
                                new SocialManager.Entities.Discussion({
                                    type: "link",
                                    linkdata: value.linkdata,
                                    tags: [tag_id],
                                    status: value.status,
                                });
                            new_discussion.save(
                                {},
                                {
                                    success: function () {
                                        SocialManager.vent.trigger(
                                            "add:discussion",
                                            new_discussion
                                        );
                                        SocialManager.commands.execute(
                                            "close:overlay"
                                        );
                                    },
                                }
                            );
                        } else {
                            var new_discussion =
                                new SocialManager.Entities.Discussion({
                                    type: "link",
                                    linkdata: value.linkdata,
                                    image: value.image,
                                    tags: [tag_id],
                                    status: value.status,
                                });
                            //Get bound
                            var image = new Image();
                            image.src = value.image;
                            image.onload = function () {
                                var bound = (this.height * 270) / this.width;
                                if (bound) {
                                    bound = parseInt(bound);
                                    new_discussion.set("bound", bound);
                                }
                                new_discussion.save(
                                    {},
                                    {
                                        success: function () {
                                            SocialManager.vent.trigger(
                                                "add:discussion",
                                                new_discussion
                                            );
                                            SocialManager.commands.execute(
                                                "close:overlay"
                                            );
                                        },
                                    }
                                );
                            };
                            image.onerror = function () {
                                new_discussion.save(
                                    {},
                                    {
                                        success: function () {
                                            SocialManager.vent.trigger(
                                                "add:discussion",
                                                new_discussion
                                            );
                                            SocialManager.commands.execute(
                                                "close:overlay"
                                            );
                                        },
                                    }
                                );
                            };
                        }
                    } else if (value.type == "text") {
                        //Get desc
                        var nativeEditor = newEditor.get("nativeEditor");
                        //Add
                        var new_discussion =
                            new SocialManager.Entities.Discussion({
                                type: "text",
                                title: value.title,
                                desc: nativeEditor.getData(),
                                tags: [tag_id],
                                status: value.status,
                            });
                        //Save and upload image
                        async.series(
                            [
                                function (callback) {
                                    if (
                                        newDiscussionView.$(".upload-image")
                                            .length
                                    ) {
                                        newDiscussionView
                                            .$(".js-save")
                                            .text("Uploading...")
                                            .addClass("uploading");
                                        editorUploadImage(
                                            newEditorFiles,
                                            function (image_urls) {
                                                newEditorFiles = [];
                                                if (
                                                    image_urls &&
                                                    image_urls.length
                                                ) {
                                                    new_discussion.set(
                                                        "desc",
                                                        nativeEditor.getData()
                                                    );
                                                    new_discussion.set(
                                                        "images",
                                                        image_urls
                                                    );
                                                    new_discussion.set(
                                                        "image",
                                                        image_urls[0]
                                                    );
                                                    //Get bound
                                                    var image = new Image();
                                                    image.src = image_urls[0];
                                                    image.onload = function () {
                                                        var bound =
                                                            (this.height *
                                                                270) /
                                                            this.width;
                                                        if (bound) {
                                                            bound =
                                                                parseInt(bound);
                                                            new_discussion.set(
                                                                "bound",
                                                                bound
                                                            );
                                                        }
                                                        callback();
                                                    };
                                                    image.onerror =
                                                        function () {
                                                            callback();
                                                        };
                                                } else {
                                                    callback();
                                                }
                                            }
                                        );
                                    } else {
                                        callback();
                                    }
                                },
                            ],
                            function (err) {
                                new_discussion.save(
                                    {},
                                    {
                                        success: function () {
                                            SocialManager.vent.trigger(
                                                "add:discussion",
                                                new_discussion
                                            );
                                            SocialManager.commands.execute(
                                                "close:overlay"
                                            );
                                        },
                                    }
                                );
                            }
                        );
                    } else if (value.type == "poll") {
                        //Add
                        var new_discussion =
                            new SocialManager.Entities.Discussion({
                                type: "poll",
                                title: value.title,
                                polls: value.polls,
                                tags: [tag_id],
                                status: value.status,
                            });
                        //Save
                        new_discussion.save(
                            {},
                            {
                                success: function () {
                                    SocialManager.vent.trigger(
                                        "add:discussion",
                                        new_discussion
                                    );
                                    SocialManager.commands.execute(
                                        "close:overlay"
                                    );
                                },
                            }
                        );
                    }
                });
                SocialManager.overlayRegion.show(newDiscussionView);
            },
            showBadgesOverlay: function () {
                $(".overlay").show();
                //Fetch badges
                var fetchingBadges = SocialManager.request("badge:entities");
                $.when(fetchingBadges).done(function (badges) {
                    var badgesView =
                        new SocialManager.SocialApp.EntityViews.BadgesView({
                            collection: badges,
                        });
                    //Show
                    badgesView.on("show", function () {
                        setTimeout(function () {
                            badgesView.$(".overlay-box").addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        SocialManager.commands.execute("show:overlay");
                    });
                    //Save new badge
                    badgesView.on("save:badge", function (value) {
                        var new_badge = new SocialManager.Entities.Badge({
                            name: value.name,
                            desc: value.desc,
                        });
                        new_badge.save(
                            {},
                            {
                                success: function () {
                                    badges.add(new_badge, { at: 0 });
                                    //Clear
                                    badgesView.$(".badge-name").val("");
                                    badgesView.$(".badge-desc").val("");
                                },
                            }
                        );
                    });
                    SocialManager.overlayRegion.show(badgesView);
                });
            },
            showActivity: function () {
                //Get offset
                var offset =
                    $(".navBar .link-activity").offset().left - 190 + "px";
                $(".popup").css("left", offset);
                //Show popup
                $(".popup").show();
                //Fetch activity
                var fetchingActivities =
                    SocialManager.request("activity:entities");
                $.when(fetchingActivities).done(function (activities) {
                    var activitiesView =
                        new SocialManager.SocialApp.EntityViews.ActivitiesView({
                            collection: activities,
                        });
                    //Show
                    activitiesView.on("show", function () {
                        $(".navBar.with-social .activity-count").remove();
                        //Set height of activity area
                        activitiesView
                            .$(".all-activity")
                            .css("max-height", $("body").height() - 200);
                    });
                    SocialManager.popupRegion.show(activitiesView);
                });
            },
            showSettings: function () {
                $(".modal").show();
                //Fetch current user
                var fetchingUser = SocialManager.request("userDetails:entity");
                $.when(fetchingUser).done(function (user) {
                    var settingsView =
                        new SocialManager.SocialApp.EntityViews.SettingsView({
                            model: user,
                        });
                    //Show
                    settingsView.on("show", function () {
                        //Animate modal box
                        setTimeout(function () {
                            settingsView.$(".modal-box").addClass("animate");
                        }, 100);
                        //hide scroll on main page
                        SocialManager.commands.execute("show:overlay");
                        //Show about
                        if (user.get("about")) {
                            var tmp = document.createElement("div");
                            tmp.innerHTML = user
                                .get("about")
                                .replace(/<br\s*[\/]?>/gi, "\n");
                            var about = tmp.textContent || tmp.innerText || "";
                            settingsView.$(".profile-about").val(about);
                        }
                        //Upload dp
                        $(".dp-upload").each(function () {
                            /* For each file selected, process and upload */
                            var form = $(this);
                            $(this).fileupload({
                                dropZone: $(".profile-dp"),
                                url: form.attr("action"), //Grab form's action src
                                type: "POST",
                                autoUpload: true,
                                dataType: "xml", //S3's XML response,
                                add: function (event, data) {
                                    //Check file type
                                    var fileType = data.files[0].name
                                            .split(".")
                                            .pop(),
                                        allowedtypes = "jpeg,jpg,png,gif";
                                    if (allowedtypes.indexOf(fileType) < 0) {
                                        alert("Invalid file type, aborted");
                                        return false;
                                    }
                                    //Upload through CORS
                                    $.ajax({
                                        url: "/api/signed",
                                        type: "GET",
                                        dataType: "json",
                                        data: { title: data.files[0].name }, // Send filename to /signed for the signed response
                                        async: false,
                                        success: function (data) {
                                            // Now that we have our data, we update the form so it contains all
                                            // the needed data to sign the request
                                            form.find("input[name=key]").val(
                                                data.key
                                            );
                                            form.find("input[name=policy]").val(
                                                data.policy
                                            );
                                            form.find(
                                                "input[name=signature]"
                                            ).val(data.signature);
                                            form.find(
                                                "input[name=Content-Type]"
                                            ).val(data.contentType);
                                        },
                                    });
                                    data.submit();
                                },
                                send: function (e, data) {
                                    settingsView
                                        .$(".upload-btn")
                                        .html("Uploading <span>...</span>");
                                },
                                progress: function (e, data) {
                                    var percent = Math.round(
                                        (e.loaded / e.total) * 100
                                    );
                                    settingsView
                                        .$(".upload-btn span")
                                        .text(percent + "%");
                                },
                                fail: function (e, data) {
                                    settingsView
                                        .$(".upload-btn")
                                        .html("Upload");
                                },
                                success: function (data) {
                                    var image_url =
                                        "https://d1c337161ud3pr.cloudfront.net/" +
                                        form.find("input[name=key]").val();
                                    image_url = encodeURI(image_url);
                                    //Update User
                                    var user =
                                        new SocialManager.Entities.User();
                                    user.set({
                                        dp: image_url,
                                    });
                                    user.save(
                                        {},
                                        {
                                            success: function () {
                                                settingsView
                                                    .$(
                                                        ".profile-dp .profile-initials"
                                                    )
                                                    .remove();
                                                if (
                                                    settingsView.$(
                                                        ".profile-image"
                                                    ).length
                                                ) {
                                                    settingsView
                                                        .$(".profile-image")
                                                        .css(
                                                            "backgroundImage",
                                                            "url(" +
                                                                image_url +
                                                                ")"
                                                        );
                                                } else {
                                                    settingsView
                                                        .$(".profile-dp")
                                                        .prepend(
                                                            "<div class='profile-image'></div>"
                                                        );
                                                    settingsView
                                                        .$(".profile-image")
                                                        .css(
                                                            "backgroundImage",
                                                            "url(" +
                                                                image_url +
                                                                ")"
                                                        );
                                                }
                                                settingsView
                                                    .$(".upload-btn")
                                                    .html("Upload");
                                            },
                                        }
                                    );
                                },
                            });
                        });
                        //Show chosen on touch devices
                        if (!$("html").hasClass("touchevents")) {
                            //Pre-populate gender and country
                            if (user.get("sex"))
                                settingsView
                                    .$(
                                        ".select-gender option[value=" +
                                            user.get("sex") +
                                            "]"
                                    )
                                    .prop("selected", true);
                            if (user.get("country"))
                                settingsView
                                    .$(
                                        ".select-country option[value='" +
                                            user.get("country") +
                                            "']"
                                    )
                                    .prop("selected", true);
                            //Add chosen to dropdown
                            settingsView.$(".select-gender").chosen({
                                width: "300px",
                                disable_search_threshold: 13,
                            });
                            settingsView.$(".select-country").chosen({
                                width: "300px",
                                disable_search_threshold: 13,
                            });
                        } else {
                            settingsView
                                .$(".select-gender > option:first-child")
                                .remove();
                            settingsView
                                .$(".select-country > option:first-child")
                                .remove();
                            settingsView
                                .$(".select-gender")
                                .prepend(
                                    "<option value='' disabled selected>Gender</option>"
                                )
                                .val("");
                            settingsView
                                .$(".select-country")
                                .prepend(
                                    "<option value='' disabled selected>Country</option>"
                                )
                                .val("");
                            //Pre-populate gender and country
                            if (user.get("sex"))
                                settingsView
                                    .$(
                                        ".select-gender option[value=" +
                                            user.get("sex") +
                                            "]"
                                    )
                                    .prop("selected", true);
                            if (user.get("country"))
                                settingsView
                                    .$(
                                        ".select-country option[value='" +
                                            user.get("country") +
                                            "']"
                                    )
                                    .prop("selected", true);
                        }
                    });
                    //Update profile
                    settingsView.on("update:profile", function (value) {
                        var user = new SocialManager.Entities.User();
                        user.set({
                            name: value.name,
                            about: value.about,
                            job: {
                                title: value.job_title,
                                org: value.job_org,
                            },
                            country: value.country,
                            city: value.city,
                            sex: value.sex,
                            phone: value.phone,
                            oldpwd: value.oldpwd,
                            newpwd: value.newpwd,
                        });
                        user.save(
                            {},
                            {
                                success: function () {
                                    SocialManager.commands.execute(
                                        "close:modal"
                                    );
                                },
                            }
                        );
                    });
                    //Show settings in modal region
                    SocialManager.modalRegion.show(settingsView);
                });
            },
        };
    }
);
