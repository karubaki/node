//Client side of MGIEP Website
var PageManager = new Backbone.Marionette.Application();
//Site url
var siteURL = "https://mgiep.unesco.org/";
//Scroll value and scroll handler
var prevScroll, scrollHandler;
//Search timer
var searchTimer;
//Add regions of the application
PageManager.addRegions({
    mainRegion: ".mainWrap",
    contentRegion: ".contentWrap",
    overlayRegion: ".overlay",
    menuRegion: ".menuWrap",
    footerRegion: ".footerWrap",
    resultsRegion: ".search-results",
    sidebarRegion: ".sidebarWrap",
});
//Navigate function to change url
PageManager.navigate = function (route, options) {
    options || (options = {});
    Backbone.history.navigate(route, options);
};
//Find current route
PageManager.getCurrentRoute = function () {
    return Backbone.history.fragment;
};
//Start
PageManager.on("start", function () {
    if (Backbone.history) {
        Backbone.history.start({ pushState: true });
    }
    //Menu
    $(".js-show-menu").click(function (e) {
        $("body").css("overflow", "hidden");
        if ($("body").width() < 700 || $("html").hasClass("touchevents")) {
            $("html").css("overflow", "hidden");
            $("html, body").css("position", "fixed");
        }
        $(".menu-overlay").removeClass("u-hide");
    });
    $(".js-close-menu").click(function (e) {
        $(".menu-overlay").addClass("u-hide");
        $("html, body").css("overflow", "").css("position", "");
    });
    //Search
    $(".js-search").click(function (ev) {
        if ($(".searchWrap").hasClass("u-hide")) {
            $(".searchWrap").removeClass("u-hide");
            $(".searchWrap input").focus();
        } else {
            $(".searchWrap input").val("");
            $(".search-results > div").remove();
            $(".searchWrap").addClass("u-hide");
        }
    });
    //Search results
    $(".search-text").on("input", function (ev) {
        var search_text = $(".search-text").val().trim();
        if (search_text) {
            //Reset searchTimer
            clearTimeout(searchTimer);
            searchTimer = null;
            //Set search timer
            searchTimer = setTimeout(function () {
                PageManager.vent.trigger("searchResults:show", search_text);
            }, 500);
        } else {
            //Clear timer
            if (searchTimer) {
                clearTimeout(searchTimer);
                searchTimer = null;
            }
            $(".search-results > div").remove();
        }
    });
    //Show feed
    $(".js-feed").click(function (ev) {
        var $target = $(ev.currentTarget);
        if ($target.hasClass("is-active")) {
            $target.removeClass("is-active");
            PageManager.commands.execute("close:sidebar");
        } else {
            $target.addClass("is-active");
            PageManager.vent.trigger("feed:show");
        }
    });
    //Show/hide menu
    $(".menu-overlay .menu-level.level-1 > a").click(function (ev) {
        var $target = $(ev.currentTarget);
        if ($target.attr("href") == "#") {
            ev.preventDefault();
            ev.stopPropagation();
            $target.toggleClass("active");
            $target.next().toggle();
        }
    });
    $(".menuWrap .menu-level.level-1 > a").mouseenter(function (ev) {
        var $target = $(ev.currentTarget);
        if ($target.attr("href") == "#") {
            ev.preventDefault();
            ev.stopPropagation();
            $(".menuWrap .active").removeClass("active");
            $(".menuWrap .level-2").hide();
            $target.parent().addClass("active");
            $target.next().show();
        }
    });
    $(".menuWrap, .active .level-2").mouseleave(function (ev) {
        var $target = $(ev.currentTarget);
        $(".menuWrap .active").removeClass("active");
        $(".menuWrap .level-2").hide();
    });
    //Close overlay on ESC Key and mousedown
    $(document).keyup(function (e) {
        if (e.keyCode == 27 && $(".overlay").css("display") != "none") {
            PageManager.commands.execute("close:overlay");
        }
    });
    $(document).mousedown(function (e) {
        var $target = $(e.target);
        //Close overlay
        var container = $(".overlay-box");
        if (
            container.length &&
            !container.is(e.target) &&
            container.has(e.target).length === 0
        ) {
            PageManager.commands.execute("close:overlay");
        }
        //Close searchWrap
        var searchWrap = $(".searchWrap");
        if (
            !searchWrap.hasClass("u-hide") &&
            !searchWrap.is(e.target) &&
            searchWrap.has(e.target).length === 0 &&
            !$target.hasClass("js-search")
        ) {
            $(".js-search").click();
        }
    });
    //Cookie
    if (
        $("body").hasClass("page-institute") &&
        $("body").hasClass("page-home")
    ) {
        var visit_count = Cookies.get("visit_count");
        if (visit_count) {
            visit_count = parseInt(visit_count) + 1;
            Cookies.set("visit_count", visit_count);
        } else {
            Cookies.set("visit_count", 1);
        }
        //Redirect if more than 3
        if (Cookies.get("visit_count")) {
            var visit_count = parseInt(Cookies.get("visit_count"));
            if (visit_count > 3) {
                window.location = "/newsroom";
                Cookies.set("visit_count", 0);
            }
        }
    }
    //On resize
    $(window).resize(function () {
        //Change image size
        $(".text-image").each(function (i) {
            //If image has square or circle shape
            if (
                $(this).parent().hasClass("shape-square") ||
                $(this).parent().hasClass("shape-circle")
            ) {
                return;
            }
            var image_width = $(this).width();
            var image_height = parseInt(image_width / 2);
            $(this).css("height", image_height);
        });
        //Change image size of article
        $(".articleWrap .embed-image").each(function (i) {
            var image_width = $(this).width();
            var image_height = parseInt(image_width / 2);
            $(this).css("height", image_height);
        });
    });
    //Save form
    $(".footer-embed .btn-next").click(function (ev) {
        var email = $(".footer-email").val().trim();
        if (email && validator.isEmail(email)) {
            $(".footer-email-div").addClass("u-hide");
            $(".footer-name-div").removeClass("u-hide");
            $(".footer-message").text("");
            $(".footer-name").focus();
        } else {
            $(".footer-message").text("Please enter a valid email address.");
        }
    });
    $(".footer-embed .btn-save-form").click(function (ev) {
        var email = $(".footer-email").val().trim();
        var name = $(".footer-name").val().trim();
        if (name) {
            // POST request
            var formData = { name: name, email: email };
            $.ajax({
                url: "/api/form",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(formData),
                dataType: "json",
                success: function (response) {
                    $(".footer-email").val("");
                    $(".footer-name").val("");
                    $(".footer-name-div").addClass("u-hide");
                    $(".footer-email-div").removeClass("u-hide");
                    $(".footer-message").text(
                        "Thanks for submitting your details."
                    );
                    setTimeout(function () {
                        $(".footer-message").text("");
                    }, 1500);
                },
                error: function () {
                    $(".footer-email").val("");
                    $(".footer-name").val("");
                    $(".footer-name-div").addClass("u-hide");
                    $(".footer-email-div").removeClass("u-hide");
                    $(".footer-message").text(
                        "Thanks for submitting your details."
                    );
                    setTimeout(function () {
                        $(".footer-message").text("");
                    }, 1500);
                },
            });
        } else {
            $(".footer-message").text("Please enter your name.");
        }
    });
});
//Show overlay
PageManager.commands.setHandler("show:overlay", function () {
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
PageManager.commands.setHandler("close:overlay", function (view) {
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
//Close sidebar
PageManager.commands.setHandler("close:sidebar", function () {
    if (!$(".sidebarWrap > div").length) return;
    //remove animate class on sidebar box
    $(".overlay").removeClass("with-sidebar");
    $(".sidebar-box").removeClass("animate");
    //after animation, remove view, change route and hide sidebar
    setTimeout(function () {
        $(".sidebarWrap > div").remove();
        $(".sidebarWrap").hide();
    }, 300);
});
//Router of the application
PageManager.module(
    "PageApp",
    function (PageApp, PageManager, Backbone, Marionette, $, _) {
        PageApp.Router = Marionette.AppRouter.extend({
            appRoutes: {
                "": "pageView",
                newsroom: "pageView",
                ":url": "pageView",
                "article/:slug": "articleView",
            },
        });
        //API functions for each route
        var API = {
            pageView: function () {
                PageManager.PageApp.EntityController.Controller.showPage();
            },
            articleView: function (slug) {
                PageManager.PageApp.EntityController.Controller.showArticle(
                    slug
                );
            },
            searchResultsView: function (text) {
                PageManager.PageApp.EntityController.Controller.showSearchResults(
                    text
                );
            },
            feedView: function () {
                PageManager.PageApp.EntityController.Controller.showFeed();
            },
        };
        //Triggers to particular views
        //Show page
        PageManager.vent.on("page:show", function () {
            API.pageView();
        });
        //Show search results
        PageManager.vent.on("searchResults:show", function (text) {
            API.searchResultsView(text);
        });
        //Show feed
        PageManager.vent.on("feed:show", function () {
            API.feedView();
        });
        //Show
        //Initialize router with API
        PageManager.addInitializer(function () {
            new PageApp.Router({ controller: API });
        });
    }
);
//Models and Collections of the application
PageManager.module(
    "Entities",
    function (Entities, PageManager, Backbone, Marionette, $, _) {
        //Page Model
        Entities.Page = Backbone.Model.extend({
            initialize: function (options) {
                this._id = options._id;
            },
            url: function () {
                if (this._id) {
                    return "/api/public/page/" + this._id;
                }
            },
            idAttribute: "_id",
        });
        Entities.PageCollection = Backbone.Collection.extend({
            initialize: function (models, options) {
                //_type is type of pages: all, public etc
                this._type = options._type;
            },
            url: function () {
                return "/api/pages/" + this._type;
            },
            model: Entities.Page,
        });
        //ArticleBlock Models and Collection
        Entities.ArticleBlock = Backbone.Model.extend({
            initialize: function (options) {
                this._id = options._id;
            },
            url: function () {
                return "/api/articleblock/" + this._id;
            },
            idAttribute: "_id",
        });
        Entities.ArticleBlockCollection = Backbone.Collection.extend({
            initialize: function (models, options) {
                //slug is article slug
                this.slug = options.slug;
            },
            url: function () {
                return "/api/public/articleblocks/" + this.slug;
            },
            model: Entities.ArticleBlock,
        });
        //Search
        Entities.Search = Backbone.Model.extend({
            initialize: function (models, options) {
                this._text = encodeURIComponent(options._text);
                this._page = options._page;
            },
            url: function () {
                if (this._page) {
                    return (
                        "/api/public/search/?text=" +
                        this._text +
                        "&page=" +
                        this._page
                    );
                } else {
                    return "/api/public/search/?text=" + this._text;
                }
            },
        });
        //Feed
        Entities.Feed = Backbone.Collection.extend({
            url: function () {
                return "/api/public/feed";
            },
            model: Entities.ArticleBlock,
        });
        //Functions to get data
        var API = {
            getPages: function (_type) {
                var pages = new Entities.PageCollection([], {
                    _type: _type,
                });
                var defer = $.Deferred();
                pages.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getOnePage: function (_id) {
                var page = new Entities.Page({
                    _id: _id,
                });
                var defer = $.Deferred();
                page.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getArticleBlocks: function (slug) {
                var articleBlocks = new Entities.ArticleBlockCollection([], {
                    slug: slug,
                });
                var defer = $.Deferred();
                articleBlocks.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getSearchResults: function (_text, _page) {
                var search = new Entities.Search([], {
                    _text: _text,
                    _page: _page,
                });
                var defer = $.Deferred();
                search.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getFeed: function () {
                var feed = new Entities.Feed();
                var defer = $.Deferred();
                feed.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
        };
        PageManager.reqres.setHandler("page:entities", function (_type) {
            return API.getPages(_type);
        });
        PageManager.reqres.setHandler("page:entity", function (_id) {
            return API.getOnePage(_id);
        });
        PageManager.reqres.setHandler("articleBlock:entities", function (_id) {
            return API.getArticleBlocks(_id);
        });
        PageManager.reqres.setHandler(
            "search:entities",
            function (_text, _page) {
                return API.getSearchResults(_text, _page);
            }
        );
        PageManager.reqres.setHandler("feed:entities", function () {
            return API.getFeed();
        });
    }
);
//Views of the application
PageManager.module(
    "PageApp.EntityViews",
    function (EntityViews, PageManager, Backbone, Marionette, $, _) {
        //Sub block item view
        EntityViews.SubBlockItemView = Marionette.ItemView.extend({
            template: "publicSubBlockItemTemplate",
            initialize: function () {
                //Add class
                if (this.model.get("type") == "body_text") {
                    this.$el.addClass("body-text-block");
                    if (
                        this.model.get("shape") &&
                        this.model.get("shape") == "background"
                    ) {
                        this.$el.addClass("with-overlay");
                    }
                } else if (this.model.get("type") == "body_html") {
                    this.$el.addClass("html-block");
                } else if (this.model.get("type") == "body_embed") {
                    this.$el.addClass("body-embed-block");
                } else if (this.model.get("type") == "logos") {
                    this.$el.addClass("logos-block");
                } else if (this.model.get("type") == "calendar") {
                    this.$el.addClass("calendar-block");
                } else if (this.model.get("type") == "feed") {
                    this.$el.addClass("feed-block");
                }
            },
            onRender: function () {
                //Add styles
                addSubBlockStyle(this.model, this.$el);
            },
        });
        //Block item view
        EntityViews.PublicBlockItemView = Marionette.CompositeView.extend({
            className: "one-block",
            template: "publicBlockItemTemplate",
            childView: EntityViews.SubBlockItemView,
            childViewContainer: "div.container-row.sub-blocks",
            initialize: function () {
                //Get sub blocks
                if (
                    this.model.get("type") == "container" &&
                    this.model.get("formula") == "empty"
                ) {
                    var sub_blocks = this.model.get("blocks");
                    this.collection = new Backbone.Collection(sub_blocks);
                }
            },
            events: {
                "click .button-embed": "showVideo",
                "click .section-left-item": "showSectionItem",
                "click .tab-title": "goToSlide",
            },
            onRender: function () {
                //Add styles
                addBlockStyle(this.model, this.$el);
            },
            showVideo: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("block-btnb")) {
                    var embed_code = this.model.get("buttonb").embed;
                } else {
                    var embed_code = this.model.get("button").embed;
                }
                $(".overlay .overlay-box").append(embed_code);
                $(".overlay").show();
                //Animate overlay box
                setTimeout(function () {
                    $(".overlay .overlay-box").addClass("animate");
                }, 100);
                //Hide scroll on main page
                PageManager.commands.execute("show:overlay");
            },
            showSectionItem: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("active")) {
                    return;
                } else {
                    this.$(
                        ".section-left-item, .section-right-item"
                    ).removeClass("active");
                    $target.addClass("active");
                    var index = this.$(".section-left-item").index($target);
                    this.$(".section-right-align")
                        .children()
                        .eq(index)
                        .addClass("active");
                }
            },
            goToSlide: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("active")) {
                    return;
                } else {
                    var index = this.$(".tab-title").index($target);
                    this.$(".carousel-blocks").slick("slickGoTo", index);
                }
            },
        });
        //Page blocks view
        EntityViews.PublicBlocksView = Marionette.CollectionView.extend({
            className: "blocksWrap",
            childView: EntityViews.PublicBlockItemView,
            initialize: function () {
                var blocks = this.model.get("blocks");
                this.collection = new Backbone.Collection(blocks);
            },
        });
        //Article block item view
        EntityViews.PublicArticleBlockItemView = Marionette.ItemView.extend({
            className: "article-block",
            template: "publicArticleBlockItemTemplate",
            events: {
                "click .toggle-block .block-title": "showToggle",
            },
            showToggle: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                if ($target.parent().hasClass("active")) {
                    $target.parent().removeClass("active");
                    this.$(".toggle-block .block-desc").addClass("u-hide");
                } else {
                    $target.parent().addClass("active");
                    this.$(".toggle-block .block-desc").removeClass("u-hide");
                }
            },
        });
        //Article blocks view
        EntityViews.PublicArticleBlocksView = Marionette.CollectionView.extend({
            className: "publicBlocksWrap",
            childView: EntityViews.PublicArticleBlockItemView,
        });
        //Public page item view
        EntityViews.PageItemView = Marionette.ItemView.extend({
            template: "publicPageItemTemplate",
            tagName: "a",
            className: "one-page",
            initialize: function () {
                this.$el.attr("data-order", this.model.get("order"));
                this.$el.attr("data-level", this.model.get("level"));
                //Link
                if (this.model.get("ref_url")) {
                    this.$el.attr("href", this.model.get("ref_url"));
                } else if (this.model.get("url")) {
                    this.$el.attr("href", siteURL + this.model.get("url"));
                }
            },
        });
        //Public pages view
        EntityViews.PublicPagesView = Marionette.CompositeView.extend({
            template: "publicPagesTemplate",
            childView: EntityViews.PageItemView,
            childViewContainer: "div.all-items",
        });
        //Search results view
        EntityViews.SearchResultsView = Marionette.ItemView.extend({
            template: "publicSearchResultsTemplate",
        });
        //Feed item view
        EntityViews.FeedItemView = Marionette.ItemView.extend({
            template: "publicFeedItemTemplate",
            tagName: "a",
            className: "one-feed",
            initialize: function () {
                this.$el.attr("target", "_blank");
                this.$el.attr(
                    "href",
                    siteURL + "article/" + this.model.get("slug")
                );
            },
        });
        //Feed view
        EntityViews.FeedView = Marionette.CompositeView.extend({
            template: "publicFeedTemplate",
            childView: EntityViews.FeedItemView,
            childViewContainer: "div.feed-items",
        });
    }
);
//Common Views of the application - Loading
PageManager.module(
    "Common.Views",
    function (Views, PageManager, Backbone, Marionette, $, _) {
        //Loading page
        Views.Loading = Marionette.ItemView.extend({
            tagName: "div",
            className: "loading-area",
            template: "loadingTemplate",
        });
    }
);
//Controllers of the Application
PageManager.module(
    "PageApp.EntityController",
    function (EntityController, PageManager, Backbone, Marionette, $, _) {
        EntityController.Controller = {
            showPage: function () {
                //Fetch page
                var fetchingPage = PageManager.request(
                    "page:entity",
                    $(".mainWrap").data("page")
                );
                $.when(fetchingPage).done(function (page) {
                    var publicBlocksView =
                        new PageManager.PageApp.EntityViews.PublicBlocksView({
                            model: page,
                        });
                    //Show
                    publicBlocksView.on("show", function () {
                        //Twitter widget load
                        if (publicBlocksView.$(".feed-block").length) {
                            twttr.widgets.load();
                        }
                        //Infogram
                        if (publicBlocksView.$(".infogram-embed").length) {
                            !(function (e, i, n, s) {
                                var t = "InfogramEmbeds",
                                    d = e.getElementsByTagName("script")[0];
                                if (window[t] && window[t].initialized)
                                    window[t].process && window[t].process();
                                else if (!e.getElementById(n)) {
                                    var o = e.createElement("script");
                                    (o.async = 1),
                                        (o.id = n),
                                        (o.src =
                                            "https://e.infogram.com/js/dist/embed-loader-min.js"),
                                        d.parentNode.insertBefore(o, d);
                                }
                            })(document, 0, "infogram-async");
                        }
                        //Kindness stories
                        publicBlocksView.$(".kindness-stories").text(
                            $(".mainWrap")
                                .data("stories")
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        );
                        if (publicBlocksView.$(".kindness-stories").length) {
                            $.get(siteURL + "api/stories", function (data) {
                                publicBlocksView
                                    .$(".kindness-stories")
                                    .text(
                                        data.stories
                                            .toString()
                                            .replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                ","
                                            )
                                    );
                            });
                        }
                        //Section items
                        if (
                            publicBlocksView.$(".section-block.section-list")
                                .length
                        ) {
                            $(
                                ".section-list .section-left-item:first-child"
                            ).addClass("active");
                            $(
                                ".section-list .section-right-item:first-child"
                            ).addClass("active");
                        }
                        //Gallery
                        if (publicBlocksView.$(".gallery-block").length) {
                            publicBlocksView.$(".gallery-block").slick({
                                autoplay: true,
                                dots: true,
                                infinite: true,
                                speed: 300,
                                slidesToShow: 1,
                                centerMode: true,
                                variableWidth: true,
                            });
                        }
                        //Text carousel
                        if (publicBlocksView.$(".carousel-blocks").length) {
                            //On load
                            publicBlocksView
                                .$(".carousel-blocks")
                                .on("init", function (event, slick) {
                                    var tabs = slick.$list
                                        .parent()
                                        .parent()
                                        .children(".carousel-tabs")
                                        .children(".tab-title");
                                    var selectedTab = tabs.eq(0);
                                    tabs.removeClass("active");
                                    selectedTab.addClass("active");
                                    //Copy style
                                    if (slick.$list.parent().data("style")) {
                                        var style = slick.$list
                                            .parent()
                                            .data("style");
                                        slick.$list.attr("style", style);
                                        slick.$list
                                            .parent()
                                            .removeAttr("data-style");
                                    }
                                });
                            //Slick
                            publicBlocksView.$(".carousel-blocks").slick({
                                autoplay: true,
                                dots: true,
                                infinite: true,
                                speed: 300,
                                slidesToShow: 1,
                            });
                            //On slide change
                            publicBlocksView
                                .$(".carousel-blocks")
                                .on(
                                    "afterChange",
                                    function (event, slick, currentSlide) {
                                        var tabs = slick.$list
                                            .parent()
                                            .parent()
                                            .children(".carousel-tabs")
                                            .children(".tab-title");
                                        var selectedTab = tabs.eq(currentSlide);
                                        tabs.removeClass("active");
                                        selectedTab.addClass("active");
                                    }
                                );
                        }
                        //Change image size
                        publicBlocksView.$(".text-image").each(function (i) {
                            //If image has square or circle shape
                            if (
                                $(this).parent().hasClass("shape-square") ||
                                $(this).parent().hasClass("shape-circle")
                            ) {
                                return;
                            }
                            var image_width = $(this).width();
                            var image_height = parseInt(image_width / 2);
                            $(this).css("height", image_height);
                        });
                        //Carousel container
                        if (publicBlocksView.$(".view-as-carousel").length) {
                            if ($("body").width() > 700) {
                                $(".view-as-carousel").slick({
                                    autoplay: true,
                                    dots: true,
                                    infinite: true,
                                    speed: 300,
                                    slidesToShow: 3,
                                });
                            } else {
                                $(".view-as-carousel").slick({
                                    autoplay: true,
                                    dots: true,
                                    infinite: true,
                                    speed: 300,
                                    slidesToShow: 1,
                                });
                                $(".view-as-carousel").css("display", "block");
                            }
                        }
                    });
                    PageManager.mainRegion.show(publicBlocksView);
                });
            },
            showArticle: function (slug) {
                //Show loading page
                var loadingView = new PageManager.Common.Views.Loading();
                PageManager.contentRegion.show(loadingView);
                //Fetch article
                var fetchingArticleBlocks = PageManager.request(
                    "articleBlock:entities",
                    slug
                );
                $.when(fetchingArticleBlocks).done(function (articleBlocks) {
                    var articleBlocksView =
                        new PageManager.PageApp.EntityViews.PublicArticleBlocksView(
                            {
                                collection: articleBlocks,
                            }
                        );
                    //Show
                    articleBlocksView.on("show", function () {
                        //Gallery
                        if (articleBlocksView.$(".gallery-block").length) {
                            $(".gallery-block").slick({
                                autoplay: true,
                                dots: true,
                                infinite: true,
                                speed: 300,
                                slidesToShow: 1,
                                centerMode: true,
                                variableWidth: true,
                            });
                        }
                        //Change image size of article
                        $(".articleWrap .embed-image").each(function (i) {
                            var image_width = $(this).width();
                            var image_height = parseInt(image_width / 2);
                            $(this).css("height", image_height);
                        });
                        //Change image size
                        articleBlocksView.$(".text-image").each(function (i) {
                            var image_width = $(this).width();
                            var image_height = parseInt(image_width / 2);
                            $(this).css("height", image_height);
                        });
                        //Show audio player
                        articleBlocksView.$(".audio-block audio").audioPlayer();
                        //Show audio player
                        if (articleBlocksView.$(".view-audio").length) {
                            var audioPlayerOptions = {
                                controls: true,
                                width: 600,
                                height: 300,
                                fluid: false,
                                plugins: {
                                    wavesurfer: {
                                        src: "live",
                                        waveColor: "#ffffff",
                                        progressColor: "#ffffff",
                                        debug: false,
                                        cursorWidth: 1,
                                        msDisplayMax: 20,
                                        hideScrollbar: true,
                                    },
                                },
                            };
                            articleBlocksView
                                .$(".view-audio")
                                .each(function (index) {
                                    videojs(
                                        document.getElementsByClassName(
                                            "view-audio"
                                        )[index],
                                        audioPlayerOptions,
                                        function () {}
                                    );
                                });
                        }
                        //Show video player
                        if (articleBlocksView.$(".view-video").length) {
                            articleBlocksView
                                .$(".view-video")
                                .each(function (index) {
                                    videojs(
                                        document.getElementsByClassName(
                                            "view-video"
                                        )[index],
                                        {},
                                        function () {}
                                    );
                                });
                        }
                        //Show audio journal
                        var audioJournalOptions = {
                            controls: true,
                            width: 600,
                            height: 300,
                            fluid: false,
                            plugins: {
                                wavesurfer: {
                                    src: "live",
                                    waveColor: "#ffffff",
                                    progressColor: "#ffffff",
                                    debug: false,
                                    cursorWidth: 1,
                                    msDisplayMax: 20,
                                    hideScrollbar: true,
                                },
                                record: {
                                    audio: true,
                                    video: false,
                                    maxLength: 20,
                                    debug: false,
                                },
                            },
                        };
                        var audioJournalPlayers = [];
                        var audioPlayerIds = [];
                        articleBlocksView.$(".journal-audio").each(function () {
                            audioPlayerIds.push(this.id);
                            audioJournalPlayers.push(
                                videojs(this.id, audioJournalOptions)
                            );
                        });
                        audioJournalPlayers.forEach(function (player, i) {
                            //data is available
                            player.on("finishRecord", function () {
                                //Upload file
                                var element = $("#" + audioPlayerIds[i])
                                    .next()
                                    .next();
                                element.each(function () {
                                    //For each file selected, process and upload
                                    var form = $(this);
                                    $(this).fileupload({
                                        url: form.attr("action"), //Grab form's action src
                                        type: "POST",
                                        autoUpload: true,
                                        dataType: "xml", //S3's XML response,
                                        add: function (event, data) {
                                            //Upload through CORS
                                            $.ajax({
                                                url: "/api/signed",
                                                type: "GET",
                                                dataType: "json",
                                                data: {
                                                    title: data.files[0].name,
                                                }, // Send filename to /signed for the signed response
                                                async: false,
                                                success: function (data) {
                                                    // Now that we have our data, we update the form so it contains all
                                                    // the needed data to sign the request
                                                    form.find(
                                                        "input[name=key]"
                                                    ).val(data.key);
                                                    form.find(
                                                        "input[name=policy]"
                                                    ).val(data.policy);
                                                    form.find(
                                                        "input[name=signature]"
                                                    ).val(data.signature);
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
                                            form.prev().html(
                                                "Uploaded <b></b>"
                                            );
                                        },
                                        progressall: function (e, data) {
                                            var progress = parseInt(
                                                (data.loaded / data.total) *
                                                    100,
                                                10
                                            );
                                            form.prev()
                                                .find("b")
                                                .text(progress + "%"); // Update progress bar percentage
                                        },
                                        fail: function (e, data) {
                                            form.prev().html(
                                                "Click microphone above to record your audio"
                                            );
                                        },
                                        done: function (e, data) {},
                                    });
                                });
                            });
                        });
                        //Show video journal
                        var videoJournalOptions = {
                            controls: true,
                            width: 480,
                            height: 360,
                            fluid: false,
                            plugins: {
                                record: {
                                    audio: true,
                                    video: true,
                                    maxLength: 10,
                                    debug: false,
                                },
                            },
                        };
                        var videoJournalPlayers = [];
                        var videoPlayerIds = [];
                        articleBlocksView.$(".journal-video").each(function () {
                            videoPlayerIds.push(this.id);
                            videoJournalPlayers.push(
                                videojs(this.id, videoJournalOptions)
                            );
                        });
                        videoJournalPlayers.forEach(function (player, i) {
                            //data is available
                            player.on("finishRecord", function () {
                                //Upload file
                                var element = $("#" + videoPlayerIds[i])
                                    .next()
                                    .next();
                                element.each(function () {
                                    //For each file selected, process and upload
                                    var form = $(this);
                                    $(this).fileupload({
                                        url: form.attr("action"), //Grab form's action src
                                        type: "POST",
                                        autoUpload: true,
                                        dataType: "xml", //S3's XML response,
                                        add: function (event, data) {
                                            //Upload through CORS
                                            $.ajax({
                                                url: "/api/signed",
                                                type: "GET",
                                                dataType: "json",
                                                data: {
                                                    title: data.files[0].name,
                                                }, // Send filename to /signed for the signed response
                                                async: false,
                                                success: function (data) {
                                                    // Now that we have our data, we update the form so it contains all
                                                    // the needed data to sign the request
                                                    form.find(
                                                        "input[name=key]"
                                                    ).val(data.key);
                                                    form.find(
                                                        "input[name=policy]"
                                                    ).val(data.policy);
                                                    form.find(
                                                        "input[name=signature]"
                                                    ).val(data.signature);
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
                                            form.prev().html(
                                                "Uploaded <b></b>"
                                            );
                                        },
                                        progressall: function (e, data) {
                                            var progress = parseInt(
                                                (data.loaded / data.total) *
                                                    100,
                                                10
                                            );
                                            form.prev()
                                                .find("b")
                                                .text(progress + "%"); // Update progress bar percentage
                                        },
                                        fail: function (e, data) {
                                            form.prev().html(
                                                "Click microphone above to record your video"
                                            );
                                        },
                                        done: function (e, data) {},
                                    });
                                });
                            });
                        });
                    });
                    PageManager.contentRegion.show(articleBlocksView);
                });
            },
            showSearchResults: function (text) {
                //Fetch results
                var fetchingResults = PageManager.request(
                    "search:entities",
                    text
                );
                $.when(fetchingResults).done(function (results) {
                    var resultsView =
                        new PageManager.PageApp.EntityViews.SearchResultsView({
                            model: results,
                        });
                    PageManager.resultsRegion.show(resultsView);
                });
            },
            showFeed: function () {
                $(".sidebarWrap").show();
                //Fetch feed
                var fetchingFeed = PageManager.request("feed:entities");
                $.when(fetchingFeed).done(function (feed) {
                    var feedView = new PageManager.PageApp.EntityViews.FeedView(
                        {
                            collection: feed,
                        }
                    );
                    //Show
                    feedView.on("show", function () {
                        //Animate sidebar box
                        setTimeout(function () {
                            feedView.$(".sidebar-box").addClass("animate");
                            $(".overlay").addClass("with-sidebar");
                        }, 100);
                    });
                    PageManager.sidebarRegion.show(feedView);
                });
            },
        };
    }
);
