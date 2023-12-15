//Client side of MGIEP Website
var DashManager = new Backbone.Marionette.Application();
//Initialize variables and functions
var ENTER_KEY = 13;
var DELETE_KEY = 46;
var BACKSPACE_KEY = 8;
var ESCAPE_KEY = 27;
//Maximum upload file size
var MAX_FILE_SIZE = 151457280;
//Page size
var PAGE_SIZE = 20;
//Scroll value and scroll handler
var prevScroll, scrollHandler;
//Variable to save link data
var linkEmbedData;
//Find and search timer
var findTimer, searchTimer;
//Data array for each block
var blockDataArray = [];
//Section items array
var sectionItemsArray = [];
//Carousel array
var carouselImagesArray = [];
//Calendar events array
var calEventsArray = [];
//Add regions of the application
DashManager.addRegions({
    mainRegion: ".mainWrap",
    overlayRegion: ".overlay",
    modalRegion: ".modal",
});
//Navigate function to change url
DashManager.navigate = function (route, options) {
    options || (options = {});
    Backbone.history.navigate(route, options);
};
//Find current route
DashManager.getCurrentRoute = function () {
    return Backbone.history.fragment;
};
//Start
DashManager.on("start", function () {
    if (Backbone.history) {
        Backbone.history.start({ pushState: true });
    }
    //Show pages
    $(".js-pages").click(function (ev) {
        if (ev.metaKey || ev.ctrlKey) return;
        ev.preventDefault();
        DashManager.vent.trigger("pages:show");
    });
    //Show articles
    $(".js-articles").click(function (ev) {
        if (ev.metaKey || ev.ctrlKey) return;
        ev.preventDefault();
        DashManager.vent.trigger("articles:show");
    });
    //Show files
    $(".js-files").click(function (ev) {
        if (ev.metaKey || ev.ctrlKey) return;
        ev.preventDefault();
        DashManager.vent.trigger("files:show");
    });
    //Show people
    $(".js-people").click(function (ev) {
        if (ev.metaKey || ev.ctrlKey) return;
        ev.preventDefault();
        DashManager.vent.trigger("people:show");
    });
    //Show site settings
    $(".js-settings").click(function (ev) {
        if (ev.metaKey || ev.ctrlKey) return;
        ev.preventDefault();
        DashManager.vent.trigger("settings:show");
    });
    //Search
    $(".search-text").on("input", function (ev) {
        var search_text = $(".search-text").val().trim();
        if (search_text) {
            //Reset searchTimer
            clearTimeout(searchTimer);
            searchTimer = null;
            //Set search timer
            searchTimer = setTimeout(function () {
                if ($(".js-pages").hasClass("selected")) {
                    DashManager.vent.trigger(
                        "searchResults:show",
                        "pages",
                        search_text
                    );
                } else if ($(".js-articles").hasClass("selected")) {
                    DashManager.vent.trigger(
                        "searchResults:show",
                        "articles",
                        search_text
                    );
                } else if ($(".js-files").hasClass("selected")) {
                    DashManager.vent.trigger(
                        "searchResults:show",
                        "files",
                        search_text
                    );
                } else if ($(".js-people").hasClass("selected")) {
                    DashManager.vent.trigger(
                        "searchResults:show",
                        "persons",
                        search_text
                    );
                }
            }, 500);
        } else {
            //Clear timer
            if (searchTimer) {
                clearTimeout(searchTimer);
                searchTimer = null;
            }
            //Show all
            if ($(".js-pages").hasClass("selected")) {
                DashManager.vent.trigger("pages:show");
            } else if ($(".js-articles").hasClass("selected")) {
                DashManager.vent.trigger("articles:show");
            } else if ($(".js-files").hasClass("selected")) {
                DashManager.vent.trigger("files:show");
            } else if ($(".js-people").hasClass("selected")) {
                DashManager.vent.trigger("people:show");
            }
        }
    });
    //Show activity
    $(".js-activity").click(function (ev) {
        if (ev.metaKey || ev.ctrlKey) return;
        ev.preventDefault();
        DashManager.vent.trigger("activity:show");
    });
    //Show profile
    $(".js-profile").click(function (ev) {
        if (ev.metaKey || ev.ctrlKey) return;
        ev.preventDefault();
        DashManager.vent.trigger("profile:show");
    });
});
//Show overlay
DashManager.commands.setHandler("show:overlay", function () {
    //Hide scroll on main page
    prevScroll = $("body").scrollTop();
    $("body").css("overflow", "hidden");
    if ($("body").width() < 700 || $("html").hasClass("touchevents")) {
        $("html").css("overflow", "hidden");
        $("html, body").css("position", "fixed");
    }
    $("body").scrollTop(prevScroll);
    //Add box-shadow
    setTimeout(function () {
        $(".overlay").addClass("with-shadow");
    }, 300);
});
DashManager.commands.setHandler("close:overlay", function (view) {
    if (!$(".overlay > div").length) return;
    //Check if modal is present
    if ($(".modal > div").length) {
        //remove modal
        $(".modal-box").removeClass("animate");
        $(".modal > div").remove();
        $(".modal").hide();
        //remove animate class on overlay box
        $(".overlay").removeClass("with-shadow");
        $(".overlay-box").removeClass("animate");
        //after animation, remove view, change route and hide overlay
        setTimeout(function () {
            $(".overlay > div").remove();
            $(".overlay").hide();
            $("html, body").css("overflow", "").css("position", "");
            if (prevScroll) {
                $("html, body").scrollTop(prevScroll);
                prevScroll = "";
            }
        }, 300);
    } else {
        //remove animate class on overlay box
        $(".overlay").removeClass("with-shadow");
        $(".overlay-box").removeClass("animate");
        //Remove selected item
        if ($(".toolbarWrap").is(":hidden")) {
            $(".selected-item").removeClass("selected-item");
        }
        //after animation, remove view, change route and hide overlay
        setTimeout(function () {
            $(".overlay > div").remove();
            $(".overlay").hide();
            $("html, body").css("overflow", "").css("position", "");
            if (prevScroll) {
                $("html, body").scrollTop(prevScroll);
                prevScroll = "";
            }
        }, 300);
    }
});
DashManager.commands.setHandler("close:modal", function (view) {
    if (!$(".modal > div").length) return;
    //remove animate class on modal box
    $(".modal-box").removeClass("animate");
    //after animation, remove view, change route and hide overlay
    setTimeout(function () {
        $(".modal > div").remove();
        $(".modal").hide();
    }, 300);
});
//Router of the application
DashManager.module(
    "DashApp",
    function (DashApp, DashManager, Backbone, Marionette, $, _) {
        DashApp.Router = Marionette.AppRouter.extend({
            appRoutes: {
                dashboard: "pagesView",
                "dashboard/page/:page_id": "pageBlocksView",
                "dashboard/articles": "articlesView",
                "dashboard/articles/folder/:folder_id": "folderArticlesView",
                "dashboard/article/:article_id": "articleBlocksView",
                "dashboard/files": "filesView",
                "dashboard/files/folder/:folder_id": "filesView",
                "dashboard/people": "peopleView",
                "dashboard/people/:type": "peopleView",
                "dashboard/settings": "settingsView",
                "dashboard/activity": "activityView",
                "dashboard/profile": "profileView",
            },
        });
        //API functions for each route
        var API = {
            newPageOverlayView: function () {
                DashManager.DashApp.EntityController.Controller.showNewPageOverlay();
            },
            editPageOverlayView: function (page_id) {
                DashManager.DashApp.EntityController.Controller.showEditPageOverlay(
                    page_id
                );
            },
            pagesView: function () {
                DashManager.DashApp.EntityController.Controller.showPages();
            },
            pageBlocksView: function (page_id) {
                DashManager.DashApp.EntityController.Controller.showPageBlocks(
                    page_id
                );
            },
            allBlocksOverlayView: function (showSubBlocks) {
                DashManager.DashApp.EntityController.Controller.showAllBlocksOverlay(
                    showSubBlocks
                );
            },
            newBlockOverlayView: function (type) {
                DashManager.DashApp.EntityController.Controller.showNewBlockOverlay(
                    type
                );
            },
            editBlockOverlayView: function (block_id, container_id) {
                DashManager.DashApp.EntityController.Controller.showEditBlockOverlay(
                    block_id,
                    container_id
                );
            },
            editThemeOverlayView: function (
                block_id,
                block_type,
                container_id
            ) {
                DashManager.DashApp.EntityController.Controller.showEditThemeOverlay(
                    block_id,
                    block_type,
                    container_id
                );
            },
            blockTagsOverlayView: function (block_id) {
                DashManager.DashApp.EntityController.Controller.showBlockTagsOverlay(
                    block_id
                );
            },
            newArticleOverlayView: function () {
                DashManager.DashApp.EntityController.Controller.showNewArticleOverlay();
            },
            articlePersonsOverlayView: function (article_id) {
                DashManager.DashApp.EntityController.Controller.showArticlePersonsOverlay(
                    article_id
                );
            },
            relatedPagsOverlayView: function (article_id) {
                DashManager.DashApp.EntityController.Controller.showRelatedPagesOverlay(
                    article_id
                );
            },
            articleTagsOverlayView: function (article_id) {
                DashManager.DashApp.EntityController.Controller.showArticleTagsOverlay(
                    article_id
                );
            },
            editArticleOverlayView: function (article_id, is_folder) {
                DashManager.DashApp.EntityController.Controller.showEditArticleOverlay(
                    article_id,
                    is_folder
                );
            },
            editContentOverlayView: function (article_id) {
                DashManager.DashApp.EntityController.Controller.showEditContentOverlay(
                    article_id
                );
            },
            articlesView: function (type, folder_id) {
                DashManager.DashApp.EntityController.Controller.showArticles(
                    type,
                    "",
                    folder_id
                );
            },
            folderArticlesView: function (folder_id) {
                DashManager.DashApp.EntityController.Controller.showArticles(
                    "",
                    "",
                    folder_id
                );
            },
            articleBlocksView: function (article_id) {
                DashManager.DashApp.EntityController.Controller.showArticleBlocks(
                    article_id
                );
            },
            allArticleBlocksOverlayView: function () {
                DashManager.DashApp.EntityController.Controller.showAllArticleBlocksOverlay();
            },
            newArticleBlockOverlayView: function (type) {
                DashManager.DashApp.EntityController.Controller.showNewArticleBlockOverlay(
                    type
                );
            },
            editArticleBlockOverlayView: function (block_id) {
                DashManager.DashApp.EntityController.Controller.showEditArticleBlockOverlay(
                    block_id
                );
            },
            mcqOptionsOverlayView: function (block_id, is_edit) {
                DashManager.DashApp.EntityController.Controller.showMcqOptionsOverlay(
                    block_id,
                    is_edit
                );
            },
            filesView: function (folder_id) {
                DashManager.DashApp.EntityController.Controller.showFiles(
                    "",
                    "",
                    folder_id
                );
            },
            editFileOverlayView: function (file_id, is_folder) {
                DashManager.DashApp.EntityController.Controller.showEditFileOverlay(
                    file_id,
                    is_folder
                );
            },
            newPersonOverlayView: function () {
                DashManager.DashApp.EntityController.Controller.showNewPersonOverlay();
            },
            editPersonOverlayView: function (person_id) {
                DashManager.DashApp.EntityController.Controller.showEditPersonOverlay(
                    person_id
                );
            },
            peopleView: function (type) {
                DashManager.DashApp.EntityController.Controller.showPeople(
                    type
                );
            },
            settingsView: function () {
                DashManager.DashApp.EntityController.Controller.showSettings();
            },
            searchResultsView: function (type, text) {
                if (type == "pages") {
                    DashManager.DashApp.EntityController.Controller.showPages(
                        "search",
                        text
                    );
                } else if (type == "articles") {
                    DashManager.DashApp.EntityController.Controller.showArticles(
                        "search",
                        text
                    );
                } else if (type == "files") {
                    DashManager.DashApp.EntityController.Controller.showFiles(
                        "search",
                        text
                    );
                } else if (type == "persons") {
                    DashManager.DashApp.EntityController.Controller.showPeople(
                        "search",
                        text
                    );
                }
            },
            activityView: function () {
                DashManager.DashApp.EntityController.Controller.showActivity();
            },
            profileView: function () {
                DashManager.DashApp.EntityController.Controller.showProfile();
            },
            selectImageModalView: function () {
                DashManager.DashApp.EntityController.Controller.showSelectImageModal();
            },
            addArticlesToFolderOverlayView: function (folder_id) {
                DashManager.DashApp.EntityController.Controller.showAddArticlesToFolderOverlay(
                    folder_id
                );
            },
            addFilesToFolderOverlayView: function (folder_id) {
                DashManager.DashApp.EntityController.Controller.showAddFilesToFolderOverlay(
                    folder_id
                );
            },
        };
        //Triggers to particular views
        //Show new page overlay
        DashManager.vent.on("newPageOverlay:show", function () {
            API.newPageOverlayView();
        });
        //Show edit page overlay
        DashManager.vent.on("editPageOverlay:show", function (page_id) {
            API.editPageOverlayView(page_id);
        });
        //Show all pages
        DashManager.vent.on("pages:show", function () {
            DashManager.navigate("dashboard");
            API.pagesView();
        });
        //Show page blocks
        DashManager.vent.on("pageBlocks:show", function (page_id) {
            DashManager.navigate("dashboard/page/" + page_id);
            API.pageBlocksView(page_id);
        });
        //Show list of all blocks in overlay
        DashManager.vent.on("allBlocksOverlay:show", function (showSubBlocks) {
            API.allBlocksOverlayView(showSubBlocks);
        });
        //Show new block overlay
        DashManager.vent.on("newBlockOverlay:show", function (type) {
            API.newBlockOverlayView(type);
        });
        //Show edit block overlay
        DashManager.vent.on(
            "editBlockOverlay:show",
            function (block_id, container_id) {
                API.editBlockOverlayView(block_id, container_id);
            }
        );
        //Show edit theme overlay
        DashManager.vent.on(
            "editThemeOverlay:show",
            function (block_id, block_type, container_id) {
                API.editThemeOverlayView(block_id, block_type, container_id);
            }
        );
        //Show block tags overlay
        DashManager.vent.on("blockTags:show", function (block_id) {
            API.blockTagsOverlayView(block_id);
        });
        //Show new article overlay
        DashManager.vent.on("newArticleOverlay:show", function () {
            API.newArticleOverlayView();
        });
        //Show article persons overlay
        DashManager.vent.on("articlePersons:show", function (article_id) {
            API.articlePersonsOverlayView(article_id);
        });
        //Show related pages overlay
        DashManager.vent.on("relatedPages:show", function (article_id) {
            API.relatedPagsOverlayView(article_id);
        });
        //Show article tags overlay
        DashManager.vent.on("articleTags:show", function (article_id) {
            API.articleTagsOverlayView(article_id);
        });
        //Show edit article overlay
        DashManager.vent.on(
            "editArticleOverlay:show",
            function (article_id, is_folder) {
                API.editArticleOverlayView(article_id, is_folder);
            }
        );
        //Show edit content overlay
        DashManager.vent.on("editContentOverlay:show", function (article_id) {
            API.editContentOverlayView(article_id);
        });
        //Show all articles
        DashManager.vent.on("articles:show", function (type, folder_id) {
            if (type) {
                DashManager.navigate("dashboard/articles/" + type);
                API.articlesView(type);
            } else if (folder_id) {
                DashManager.navigate("dashboard/articles/folder/" + folder_id);
                API.articlesView("", folder_id);
            } else {
                DashManager.navigate("dashboard/articles");
                API.articlesView();
            }
        });
        //Show article blocks
        DashManager.vent.on("articleBlocks:show", function (article_id) {
            DashManager.navigate("dashboard/article/" + article_id);
            API.articleBlocksView(article_id);
        });
        //Show list of all articleblocks in overlay
        DashManager.vent.on("allArticleBlocksOverlay:show", function () {
            API.allArticleBlocksOverlayView();
        });
        //Show new articleblock overlay
        DashManager.vent.on("newArticleBlockOverlay:show", function (type) {
            API.newArticleBlockOverlayView(type);
        });
        //Show edit articleblock overlay
        DashManager.vent.on(
            "editArticleBlockOverlay:show",
            function (block_id) {
                API.editArticleBlockOverlayView(block_id);
            }
        );
        //Show mcq options overlay
        DashManager.vent.on("mcqOptions:show", function (block_id, is_edit) {
            API.mcqOptionsOverlayView(block_id, is_edit);
        });
        //Show all files
        DashManager.vent.on("files:show", function (folder_id) {
            if (folder_id) {
                DashManager.navigate("dashboard/files/folder/" + folder_id);
                API.filesView(folder_id);
            } else {
                DashManager.navigate("dashboard/files");
                API.filesView();
            }
        });
        //Show edit file overlay
        DashManager.vent.on(
            "editFileOverlay:show",
            function (file_id, is_folder) {
                API.editFileOverlayView(file_id, is_folder);
            }
        );
        //Show new person overlay
        DashManager.vent.on("newPersonOverlay:show", function () {
            API.newPersonOverlayView();
        });
        //Show edit person overlay
        DashManager.vent.on("editPersonOverlay:show", function (person_id) {
            API.editPersonOverlayView(person_id);
        });
        //Show all people
        DashManager.vent.on("people:show", function (type) {
            if (type) {
                DashManager.navigate("dashboard/people/" + type);
                API.peopleView(type);
            } else {
                DashManager.navigate("dashboard/people");
                API.peopleView();
            }
        });
        //Show site settings
        DashManager.vent.on("settings:show", function () {
            DashManager.navigate("dashboard/settings");
            API.settingsView();
        });
        //Show search results
        DashManager.vent.on("searchResults:show", function (type, text) {
            API.searchResultsView(type, text);
        });
        //Show activity
        DashManager.vent.on("activity:show", function () {
            DashManager.navigate("dashboard/activity");
            API.activityView();
        });
        //Show profile
        DashManager.vent.on("profile:show", function () {
            DashManager.navigate("dashboard/profile");
            API.profileView();
        });
        //Show select image modal
        DashManager.vent.on("selectImageModal:show", function () {
            API.selectImageModalView();
        });
        //Show add articles to folder overlay
        DashManager.vent.on(
            "addArticlesToFolderOverlay:show",
            function (folder_id) {
                API.addArticlesToFolderOverlayView(folder_id);
            }
        );
        //Show add files to folder overlay
        DashManager.vent.on(
            "addFilesToFolderOverlay:show",
            function (folder_id) {
                API.addFilesToFolderOverlayView(folder_id);
            }
        );
        //Show
        //Initialize router with API
        DashManager.addInitializer(function () {
            new DashApp.Router({ controller: API });
        });
    }
);
//Models and Collections of the application
DashManager.module(
    "Entities",
    function (Entities, DashManager, Backbone, Marionette, $, _) {
        //Page Models and Collections
        Entities.Page = Backbone.Model.extend({
            initialize: function (options) {
                this._action = options._action;
                this._id = options._id;
            },
            url: function () {
                if (this._action) {
                    return "/api/page/" + this._id + "/" + this._action;
                } else if (this._id) {
                    return "/api/page/" + this._id;
                } else {
                    return "/api/page";
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
        //Block Models and Collection
        Entities.Block = Backbone.Model.extend({
            initialize: function (options) {
                //type of block: header, content etc.
                //_action are block actions - edit, add_people etc.
                this._container = options._container;
                this._type = options.type;
                this._action = options._action;
                this._id = options._id;
            },
            url: function () {
                if (this._container) {
                    if (this._action) {
                        return (
                            "/api/subblock/" +
                            this._container +
                            "/" +
                            this._id +
                            "/" +
                            this._action
                        );
                    } else if (this._id) {
                        return (
                            "/api/subblock/" + this._container + "/" + this._id
                        );
                    }
                } else {
                    if (this._action) {
                        return "/api/block/" + this._id + "/" + this._action;
                    } else if (this._id) {
                        return "/api/block/" + this._id;
                    } else if (this._type) {
                        return "/api/block/" + this._type;
                    } else {
                        return "/api/block";
                    }
                }
            },
            idAttribute: "_id",
        });
        Entities.BlockCollection = Backbone.Collection.extend({
            initialize: function (models, options) {
                //_type is type of blocks: page, content
                this._type = options._type;
                this._category = options._category;
                this._folder = options._folder;
                this._page = options._page;
            },
            url: function () {
                if (this._type && this._category) {
                    return (
                        "/api/blocks/" +
                        this._type +
                        "?category=" +
                        this._category +
                        "&page=" +
                        this._page
                    );
                } else if (this._type && this._folder) {
                    return (
                        "/api/blocks/" +
                        this._type +
                        "?folder=" +
                        this._folder +
                        "&page=" +
                        this._page
                    );
                } else if (this._type) {
                    return "/api/blocks/" + this._type + "?page=" + this._page;
                }
            },
            model: Entities.Block,
        });
        //ArticleBlock Models and Collection
        Entities.ArticleBlock = Backbone.Model.extend({
            initialize: function (options) {
                //type of articleblock: text, gallery etc.
                //_action are block actions - edit, add_people etc.
                this._type = options.type;
                this._action = options._action;
                this._id = options._id;
            },
            url: function () {
                if (this._action) {
                    return "/api/articleblock/" + this._id + "/" + this._action;
                } else if (this._id) {
                    return "/api/articleblock/" + this._id;
                } else if (this._type) {
                    return "/api/articleblock/" + this._type;
                } else {
                    return "/api/articleblock";
                }
            },
            idAttribute: "_id",
        });
        Entities.ArticleBlockCollection = Backbone.Collection.extend({
            initialize: function (models, options) {
                //_id is article id
                this._id = options._id;
            },
            url: function () {
                return "/api/articleblocks/" + this._id;
            },
            model: Entities.ArticleBlock,
        });
        //File Models and Collection
        Entities.File = Backbone.Model.extend({
            initialize: function (options) {
                if (options) {
                    this._id = options._id;
                    this._action = options._action;
                }
            },
            url: function () {
                if (this._action) {
                    return "/api/file/" + this._id + "/" + this._action;
                } else if (this._id) {
                    return "/api/file/" + this._id;
                } else {
                    return "/api/file";
                }
            },
            idAttribute: "_id",
        });
        Entities.FileCollection = Backbone.Collection.extend({
            initialize: function (models, options) {
                this._type = options._type;
                this._folder = options._folder;
                this._page = options._page;
            },
            url: function () {
                if (this._type) {
                    return (
                        "/api/files?type=" + this._type + "&page=" + this._page
                    );
                } else if (this._folder) {
                    return (
                        "/api/files?folder=" +
                        this._folder +
                        "&page=" +
                        this._page
                    );
                } else {
                    return "/api/files" + "?page=" + this._page;
                }
            },
            model: Entities.File,
        });
        //Person Models and Collection
        Entities.Person = Backbone.Model.extend({
            initialize: function (options) {
                this._action = options._action;
                this._id = options._id;
            },
            url: function () {
                if (this._action) {
                    return "/api/person/" + this._id + "/" + this._action;
                } else if (this._id) {
                    return "/api/person/" + this._id;
                } else {
                    return "/api/person";
                }
            },
            idAttribute: "_id",
        });
        Entities.PersonCollection = Backbone.Collection.extend({
            initialize: function (models, options) {
                //_type is type of persons: team, partner, author etc
                this._type = options._type;
                this._page = options._page;
            },
            url: function () {
                if (this._type) {
                    return (
                        "/api/persons?type=" +
                        this._type +
                        "&page=" +
                        this._page
                    );
                } else {
                    return "/api/persons" + "?page=" + this._page;
                }
            },
            model: Entities.Person,
        });
        //Site
        Entities.Site = Backbone.Model.extend({
            initialize: function (options) {
                if (options) {
                    this._id = options._id;
                    this._action = options._action;
                }
            },
            url: function () {
                if (this._id && this._action) {
                    return "/api/site/" + this._id + "/" + this._action;
                } else {
                    return "/api/site";
                }
            },
            idAttribute: "_id",
        });
        //Search
        Entities.Search = Backbone.Collection.extend({
            initialize: function (models, options) {
                this._type = options._type;
                this._text = encodeURIComponent(options._text);
                this._page = options._page;
            },
            url: function () {
                if (this._type && this._page) {
                    return (
                        "/api/search/" +
                        this._type +
                        "?text=" +
                        this._text +
                        "&page=" +
                        this._page
                    );
                } else if (this._type) {
                    return "/api/search/" + this._type + "?text=" + this._text;
                } else {
                    return "/api/search/pages?text=" + this._text;
                }
            },
        });
        //Activity
        Entities.ActivityCollection = Backbone.Collection.extend({
            initialize: function (models, options) {
                this._page = options._page;
            },
            url: function () {
                if (this._page) {
                    return "/api/logs?page=" + this._page;
                } else {
                    return "/api/logs";
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
        //App results
        Entities.AppResults = Backbone.Model.extend({
            initialize: function (options) {
                this._type = options._type;
                this._search = options._search;
            },
            url: function () {
                if (this._type && this._search) {
                    return (
                        "/api/search/" + this._type + "?search=" + this._search
                    );
                }
            },
            idAttribute: "_id",
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
            getArticles: function (_category, _folder, _page) {
                var blocks = new Entities.BlockCollection([], {
                    _type: "content",
                    _category: _category,
                    _folder: _folder,
                    _page: _page,
                });
                var defer = $.Deferred();
                blocks.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getOneBlock: function (_id, _container) {
                var block = new Entities.Block({
                    _id: _id,
                    _container: _container,
                });
                var defer = $.Deferred();
                block.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getArticleBlocks: function (_id) {
                var articleBlocks = new Entities.ArticleBlockCollection([], {
                    _id: _id,
                });
                var defer = $.Deferred();
                articleBlocks.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getOneArticleBlock: function (_id) {
                var block = new Entities.ArticleBlock({
                    _id: _id,
                });
                var defer = $.Deferred();
                block.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getFiles: function (_type, _folder, _page) {
                var files = new Entities.FileCollection([], {
                    _type: _type,
                    _folder: _folder,
                    _page: _page,
                });
                var defer = $.Deferred();
                files.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getOneFile: function (_id) {
                var file = new Entities.File({
                    _id: _id,
                });
                var defer = $.Deferred();
                file.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getPersons: function (_type, _page) {
                var persons = new Entities.PersonCollection([], {
                    _type: _type,
                    _page: _page,
                });
                var defer = $.Deferred();
                persons.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getOnePerson: function (_id) {
                var person = new Entities.Person({
                    _id: _id,
                });
                var defer = $.Deferred();
                person.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getSiteDetails: function () {
                var site = new Entities.Site();
                var defer = $.Deferred();
                site.fetch({
                    success: function (data) {
                        defer.resolve(data);
                    },
                });
                return defer.promise();
            },
            getSearchResults: function (_type, _text, _page) {
                var search = new Entities.Search([], {
                    _type: _type,
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
            getActivities: function (_page) {
                var activities = new Entities.ActivityCollection([], {
                    _page: _page,
                });
                var defer = $.Deferred();
                activities.fetch({
                    success: function (data) {
                        defer.resolve(data);
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
            getAppResults: function (_type, _search) {
                var appresults = new Entities.AppResults({
                    _type: _type,
                    _search: _search,
                });
                var defer = $.Deferred();
                appresults.fetch({
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
        DashManager.reqres.setHandler("page:entities", function (_type) {
            return API.getPages(_type);
        });
        DashManager.reqres.setHandler("page:entity", function (_id) {
            return API.getOnePage(_id);
        });
        DashManager.reqres.setHandler(
            "article:entities",
            function (_category, _folder, _page) {
                return API.getArticles(_category, _folder, _page);
            }
        );
        DashManager.reqres.setHandler(
            "block:entity",
            function (_id, _container) {
                return API.getOneBlock(_id, _container);
            }
        );
        DashManager.reqres.setHandler("articleBlock:entities", function (_id) {
            return API.getArticleBlocks(_id);
        });
        DashManager.reqres.setHandler("articleBlock:entity", function (_id) {
            return API.getOneArticleBlock(_id);
        });
        DashManager.reqres.setHandler(
            "person:entities",
            function (_type, _page) {
                return API.getPersons(_type, _page);
            }
        );
        DashManager.reqres.setHandler("person:entity", function (_id) {
            return API.getOnePerson(_id);
        });
        DashManager.reqres.setHandler(
            "file:entities",
            function (_type, _folder, _page) {
                return API.getFiles(_type, _folder, _page);
            }
        );
        DashManager.reqres.setHandler("file:entity", function (_id) {
            return API.getOneFile(_id);
        });
        DashManager.reqres.setHandler("siteDetails:entity", function () {
            return API.getSiteDetails();
        });
        DashManager.reqres.setHandler(
            "search:entities",
            function (_type, _text, _page) {
                return API.getSearchResults(_type, _text, _page);
            }
        );
        DashManager.reqres.setHandler("activity:entities", function (_page) {
            return API.getActivities(_page);
        });
        DashManager.reqres.setHandler("linkPreview:entity", function (_url) {
            return API.getLinkPreview(_url);
        });
        DashManager.reqres.setHandler(
            "appResults:entity",
            function (_type, _search) {
                return API.getAppResults(_type, _search);
            }
        );
    }
);
//Views of the application
DashManager.module(
    "DashApp.EntityViews",
    function (EntityViews, DashManager, Backbone, Marionette, $, _) {
        //New page view
        EntityViews.NewPageView = Marionette.ItemView.extend({
            template: "newPageTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "click input, textarea": "showSelectImageModal",
                "click .content-choose span": "selectType",
                "click .js-save-page": "savePage",
                "click .js-archive-page": "archivePage",
                "click .js-unarchive-page": "unarchivePage",
                "click .js-delete-page": "deletePage",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
            showSelectImageModal: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("js-select-image")) {
                    if (
                        $target.hasClass("selected") &&
                        $(".modal > div").length
                    )
                        return;
                    //Select current input
                    this.$(".js-select-image").removeClass("selected");
                    $target.addClass("selected");
                    //Show modal
                    if (!$(".modal > div").length)
                        DashManager.vent.trigger("selectImageModal:show");
                } else {
                    //Close modal
                    this.$(".js-selected-image").removeClass("selected");
                    DashManager.commands.execute("close:modal");
                }
            },
            selectType: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    $target.removeClass("selected");
                } else {
                    this.$(".content-choose span").removeClass("selected");
                    $target.addClass("selected");
                }
                //Show custom url if not institute or newsroom
                if (
                    this.$(".choose-institute").hasClass("selected") ||
                    this.$(".choose-newsroom").hasClass("selected")
                ) {
                    this.$(".page-custom-url").addClass("u-hide");
                } else {
                    this.$(".page-custom-url").removeClass("u-hide");
                }
                //If external show page-ref
                if (this.$(".choose-external").hasClass("selected")) {
                    this.$(
                        ".page-custom-url, .page-desc, .page-images"
                    ).addClass("u-hide");
                    this.$(".page-ref").removeClass("u-hide");
                } else {
                    this.$(".page-desc, .page-images").removeClass("u-hide");
                    this.$(".page-ref").addClass("u-hide");
                }
                //If project show page-other
                if (this.$(".choose-project").hasClass("selected")) {
                    this.$(".page-other").removeClass("u-hide");
                } else {
                    this.$(".page-other").addClass("u-hide");
                }
                //Close modal
                this.$(".js-select-image").removeClass("selected");
                DashManager.commands.execute("close:modal");
            },
            savePage: function (ev) {
                ev.preventDefault();
                var value = {
                    title: this.$(".page-title").val().trim(),
                    desc: this.$(".page-desc").val().trim(),
                    url: this.$(".page-url").val().trim(),
                    ref_url: this.$(".page-ref-url").val(),
                    image: this.$(".page-image").val(),
                    meta: this.$(".page-meta").val(),
                    menu: this.$(".page-menu").val().trim(),
                };
                //Category
                if (this.$(".choose-institute").hasClass("selected")) {
                    value.category = "institute";
                } else if (this.$(".choose-newsroom").hasClass("selected")) {
                    value.category = "newsroom";
                } else if (this.$(".choose-project").hasClass("selected")) {
                    value.category = "project";
                } else if (this.$(".choose-event").hasClass("selected")) {
                    value.category = "event";
                } else if (this.$(".choose-external").hasClass("selected")) {
                    value.category = "external";
                } else {
                    value.category = "other";
                }
                //Order
                if ($(".one-page").hasClass("selected")) {
                    value.order = $(".one-page.selected").data("order") + 1;
                    value.level = $(".one-page.selected").data("level");
                } else {
                    value.order = $(".one-page").length;
                    value.level = 1;
                }
                //Remove selected class
                $(".one-page.selected").removeClass("selected");
                //Create - Edit page
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    this.trigger("update:page", value);
                } else {
                    this.trigger("save:page", value);
                }
            },
            archivePage: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (
                    confirm(
                        "Are you sure you want to archive this page? This will make the page private."
                    )
                ) {
                    this.trigger("archive:page");
                }
            },
            unarchivePage: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (
                    confirm(
                        "Are you sure you want to unarchive this page? This will make the page public."
                    )
                ) {
                    this.trigger("unarchive:page");
                }
            },
            deletePage: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (
                    confirm(
                        "Are you sure you want to delete this page and all its blocks?"
                    )
                ) {
                    this.trigger("delete:page");
                }
            },
        });
        //Page item view
        EntityViews.PageItemView = Marionette.ItemView.extend({
            template: "pageItemTemplate",
            className: "one-page",
            initialize: function () {
                this.$el.attr("data-order", this.model.get("order"));
                this.$el.attr("data-level", this.model.get("level"));
                //Is archived
                if (this.model.get("is_archived")) {
                    this.$el.addClass("is-archived");
                }
            },
            events: {
                click: "showPageBlocks",
                "click .add-below": "showNewPageOverlay",
                "click .edit-page": "showEditPageOverlay",
                "click .move-up": "moveUp",
                "click .move-down": "moveDown",
                "click .preview-page": "previewPage",
            },
            showPageBlocks: function (ev) {
                ev.preventDefault();
                DashManager.vent.trigger(
                    "pageBlocks:show",
                    this.model.get("_id")
                );
            },
            showNewPageOverlay: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                $target.parent().parent().addClass("selected");
                DashManager.vent.trigger("newPageOverlay:show");
            },
            showEditPageOverlay: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                $target.parent().parent().addClass("selected-item");
                DashManager.vent.trigger(
                    "editPageOverlay:show",
                    this.model.get("_id")
                );
            },
            moveUp: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                this.trigger("move:up", this.model);
            },
            moveDown: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                this.trigger("move:down", this.model);
            },
            previewPage: function (ev) {
                ev.stopPropagation();
            },
        });
        //Pages view
        EntityViews.PagesView = Marionette.CompositeView.extend({
            template: "pagesTemplate",
            childView: EntityViews.PageItemView,
            childViewContainer: "div.all-items",
            events: {
                "click .js-add-page": "showNewPageOverlay",
            },
            showNewPageOverlay: function (ev) {
                ev.preventDefault();
                DashManager.vent.trigger("newPageOverlay:show");
            },
        });
        //All blocks list view
        EntityViews.AllBlocksView = Marionette.ItemView.extend({
            template: "allBlocksTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "click .block-select": "selectBlock",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
            selectBlock: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("js-header-block")) {
                    //Default header
                    DashManager.vent.trigger("newBlockOverlay:show", "header");
                } else if ($target.hasClass("js-header-v-block")) {
                    //Header with video
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "header_video"
                    );
                } else if ($target.hasClass("js-header-bg-block")) {
                    //Header with background image
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "header_bg"
                    );
                } else if ($target.hasClass("js-header-media-block")) {
                    //Header with center-aligned media
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "header_media"
                    );
                } else if ($target.hasClass("js-section-block")) {
                    //Default section
                    DashManager.vent.trigger("newBlockOverlay:show", "section");
                } else if ($target.hasClass("js-section-basic-block")) {
                    //Basic section
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "section_basic"
                    );
                } else if ($target.hasClass("js-section-media-block")) {
                    //Section with media
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "section_media"
                    );
                } else if ($target.hasClass("js-section-list-block")) {
                    //Section with a list of items
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "section_list"
                    );
                } else if ($target.hasClass("js-container-block")) {
                    //Container block
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "container"
                    );
                } else if ($target.hasClass("js-body-t-block")) {
                    //Body text block
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "body_text"
                    );
                } else if ($target.hasClass("js-body-h-block")) {
                    //Body HTML block
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "body_html"
                    );
                } else if ($target.hasClass("js-body-e-block")) {
                    //Body embed block
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "body_embed"
                    );
                } else if ($target.hasClass("js-body-c-block")) {
                    //Default carousel
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "body_carousel"
                    );
                } else if ($target.hasClass("js-body-ct-block")) {
                    //Text carousel
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "body_carousel_text"
                    );
                } else if ($target.hasClass("js-people-block")) {
                    //People block
                    DashManager.vent.trigger("newBlockOverlay:show", "people");
                } else if ($target.hasClass("js-logos-block")) {
                    //Logos block
                    DashManager.vent.trigger("newBlockOverlay:show", "logos");
                } else if ($target.hasClass("js-breather-block")) {
                    //Breather block
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "breather"
                    );
                } else if ($target.hasClass("js-calendar-block")) {
                    //Calendar block
                    DashManager.vent.trigger(
                        "newBlockOverlay:show",
                        "calendar"
                    );
                }
            },
        });
        //New block view
        EntityViews.NewBlockView = Marionette.ItemView.extend({
            template: "newBlockTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "click input, textarea": "showSelectImageModal",
                "click .choose-orientation span": "selectOrientation",
                "click .choose-formula span": "selectFormula",
                "click .choose-shape span": "selectShape",
                "click .choose-article-type span": "selectType",
                "click .js-add-item": "addSectionItem",
                "click .remove-item": "removeSectionItem",
                "click .js-add-image": "addImage",
                "click .remove-image": "removeImage",
                "click .remove-person": "removePerson",
                "click .js-add-event": "addEvent",
                "click .remove-event": "removeEvent",
                "click .js-save-block": "saveBlock",
                "click .js-delete-block": "deleteBlock",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
            showSelectImageModal: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("js-select-image")) {
                    if (
                        $target.hasClass("selected") &&
                        $(".modal > div").length
                    )
                        return;
                    //Select current input
                    this.$(".js-select-image").removeClass("selected");
                    $target.addClass("selected");
                    //Show modal
                    if (!$(".modal > div").length)
                        DashManager.vent.trigger("selectImageModal:show");
                } else {
                    //Close modal
                    this.$(".js-selected-image").removeClass("selected");
                    DashManager.commands.execute("close:modal");
                }
            },
            selectOrientation: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    $target.removeClass("selected");
                    this.$(".choose-media-left").addClass("selected");
                } else {
                    this.$(".choose-orientation span").removeClass("selected");
                    $target.addClass("selected");
                }
            },
            selectFormula: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    $target.removeClass("selected");
                    this.$(".choose-empty").addClass("selected");
                    this.$(".container-rows").addClass("u-hide");
                } else {
                    this.$(".choose-formula span").removeClass("selected");
                    $target.addClass("selected");
                    //If empty
                    if ($target.hasClass("choose-empty")) {
                        this.$(".container-rows").addClass("u-hide");
                    } else {
                        this.$(".container-rows").removeClass("u-hide");
                    }
                }
            },
            selectShape: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    $target.removeClass("selected");
                    this.$(".choose-rectangle").addClass("selected");
                } else {
                    this.$(".choose-shape span").removeClass("selected");
                    $target.addClass("selected");
                }
            },
            selectType: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    $target.removeClass("selected");
                } else {
                    this.$(".choose-article-type span").removeClass("selected");
                    $target.addClass("selected");
                }
            },
            addSectionItem: function (ev) {
                ev.preventDefault();
                if (this.$(".section-title").val().trim()) {
                    //Add
                    if (this.$(".overlay-box").hasClass("edit-box")) {
                        var value = {
                            title: this.$(".section-title").val().trim(),
                            desc: this.$(".section-desc").val().trim(),
                            button_text: this.$(".section-button-text")
                                .val()
                                .trim(),
                            buttonb_text: this.$(".section-buttonb-text")
                                .val()
                                .trim(),
                            image_m: this.$(".section-image").val().trim(),
                            embed: this.$(".section-embed").val().trim(),
                        };
                        var button_url = this.$(".section-button-url").val();
                        var buttonb_url = this.$(".section-buttonb-url").val();
                        //Check if buttons have URL or embed code
                        if (button_url && validator.isURL(button_url)) {
                            value.button_url = button_url;
                        } else if (button_url) {
                            value.button_embed = button_url;
                        }
                        if (buttonb_url && validator.isURL(buttonb_url)) {
                            value.buttonb_url = buttonb_url;
                        } else if (buttonb_url) {
                            value.buttonb_embed = buttonb_url;
                        }
                        this.trigger("add:item", value);
                    } else {
                        var item = {
                            title: this.$(".section-title").val().trim(),
                            desc: this.$(".section-desc").val().trim(),
                            "button.text": this.$(".section-button-text")
                                .val()
                                .trim(),
                            "buttonb.text": this.$(".section-buttonb-text")
                                .val()
                                .trim(),
                            "image.m": this.$(".section-image").val().trim(),
                            embed: this.$(".section-embed").val().trim(),
                        };
                        var button_url = this.$(".section-button-url").val();
                        var buttonb_url = this.$(".section-buttonb-url").val();
                        //Check if buttons have URL or embed code
                        if (button_url && validator.isURL(button_url)) {
                            item["button.url"] = button_url;
                        } else if (button_url) {
                            item["button.embed"] = button_url;
                        }
                        if (buttonb_url && validator.isURL(buttonb_url)) {
                            item["buttonb.url"] = buttonb_url;
                        } else if (buttonb_url) {
                            item["buttonb.embed"] = buttonb_url;
                        }
                        this.$(".section-items-list").append(
                            "<div class='one-section-item'><p class='title'>" +
                                item.title +
                                "</p><span class='remove-item u-delete'>Remove</span></div>"
                        );
                        //Add to array
                        sectionItemsArray.push(item);
                    }
                    //Empty states
                    this.$(".section-title").val("").focus();
                    this.$(".section-desc").val("");
                    this.$(".section-button-text").val("");
                    this.$(".section-button-url").val("");
                    this.$(".section-buttonb-text").val("");
                    this.$(".section-buttonb-url").val("");
                    this.$(".section-image").val("");
                    this.$(".section-embed").val("");
                } else {
                    return;
                }
            },
            removeSectionItem: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                //Save
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    var value = {
                        item_id: $target.parent().data("id"),
                    };
                    this.trigger("remove:item", value);
                } else {
                    var index = $target.parent().index();
                    //Remove from array
                    if (index > -1) {
                        sectionItemsArray.splice(index, 1);
                    }
                }
                //Remove element
                $target.parent().remove();
            },
            addImage: function (ev) {
                ev.preventDefault();
                if (
                    this.$(".body-c-image").val().trim() ||
                    this.$(".body-c-embed").val().trim()
                ) {
                    if (this.$(".overlay-box").hasClass("edit-box")) {
                        var value = {
                            title: this.$(".body-c-title").val().trim(),
                            desc: this.$(".body-c-desc").val().trim(),
                            button_text: this.$(".body-c-button-text")
                                .val()
                                .trim(),
                            buttonb_text: this.$(".body-c-buttonb-text")
                                .val()
                                .trim(),
                            image_m: this.$(".body-c-image").val().trim(),
                            image_l: this.$(".body-c-image").val().trim(),
                            embed: this.$(".body-c-embed").val().trim(),
                        };
                        //Check if link or button
                        if (this.$(".body-c-link").val()) {
                            var button_url = this.$(".body-c-link").val();
                        } else {
                            var button_url = this.$(".body-c-button-url").val();
                            var buttonb_url = this.$(
                                ".body-c-buttonb-url"
                            ).val();
                        }
                        //Check if buttons have URL or embed code
                        if (button_url && validator.isURL(button_url)) {
                            value.button_url = button_url;
                        } else if (button_url) {
                            value.button_embed = button_url;
                        }
                        if (buttonb_url && validator.isURL(buttonb_url)) {
                            value.buttonb_url = buttonb_url;
                        } else if (buttonb_url) {
                            value.buttonb_embed = buttonb_url;
                        }
                    } else {
                        var image_item = {
                            title: this.$(".body-c-title").val().trim(),
                            desc: this.$(".body-c-desc").val().trim(),
                            "button.text": this.$(".body-c-button-text")
                                .val()
                                .trim(),
                            "buttonb.text": this.$(".body-c-buttonb-text")
                                .val()
                                .trim(),
                            "file.m": this.$(".body-c-image").val().trim(),
                            "file.l": this.$(".body-c-image").val().trim(),
                            embed: this.$(".body-c-embed").val().trim(),
                        };
                        //Check if link or button
                        if (this.$(".body-c-link").val()) {
                            var button_url = this.$(".body-c-link").val();
                        } else {
                            var button_url = this.$(".body-c-button-url").val();
                            var buttonb_url = this.$(
                                ".body-c-buttonb-url"
                            ).val();
                        }
                        //Check if buttons have URL or embed code
                        if (button_url && validator.isURL(button_url)) {
                            image_item["button.url"] = button_url;
                        } else if (button_url) {
                            image_item["button.embed"] = button_url;
                        }
                        if (buttonb_url && validator.isURL(buttonb_url)) {
                            image_item["buttonb.url"] = buttonb_url;
                        } else if (buttonb_url) {
                            image_item["buttonb.embed"] = buttonb_url;
                        }
                    }
                    //Get bound if image
                    if (this.$(".body-c-image").val().trim()) {
                        var image_src = this.$(".body-c-image").val().trim();
                        //Get bound
                        var _this = this;
                        var image = new Image();
                        image.src = image_src;
                        image.onload = function () {
                            var bound =
                                (image.naturalWidth * 400) /
                                image.naturalHeight;
                            if (bound) {
                                bound = parseInt(bound);
                                if (
                                    _this.$(".overlay-box").hasClass("edit-box")
                                ) {
                                    value.bound = bound;
                                } else {
                                    image_item.bound = bound;
                                }
                            }
                            window.URL.revokeObjectURL(image.src);
                            //Add image or add to array
                            if (_this.$(".overlay-box").hasClass("edit-box")) {
                                _this.trigger("add:image", value);
                            } else {
                                carouselImagesArray.push(image_item);
                                var title_label =
                                    image_item.title || "Image: " + image_src;
                                _this
                                    .$(".body-images-list")
                                    .append(
                                        "<div class='one-image'><p class='title'>" +
                                            title_label +
                                            "</p><span class='remove-image u-delete'>Remove</span></div>"
                                    );
                            }
                            //Empty states
                            _this.$(".body-c-title").val("");
                            _this.$(".body-c-desc").val("");
                            _this.$(".body-c-link").val("");
                            _this.$(".body-c-button-text").val("");
                            _this.$(".body-c-button-url").val("");
                            _this.$(".body-c-buttonb-text").val("");
                            _this.$(".body-c-buttonb-url").val("");
                            _this.$(".body-c-image").val("");
                            _this.$(".body-c-embed").val("");
                        };
                        image.onerror = function () {
                            if (_this.$(".overlay-box").hasClass("edit-box")) {
                                value.bound = 600;
                            } else {
                                image_item.bound = 600;
                            }
                            //Add image or add to array
                            if (_this.$(".overlay-box").hasClass("edit-box")) {
                                _this.trigger("add:image", value);
                            } else {
                                carouselImagesArray.push(image_item);
                                var title_label =
                                    image_item.title || "Image: " + image_src;
                                _this
                                    .$(".body-images-list")
                                    .append(
                                        "<div class='one-image'><p class='title'>" +
                                            title_label +
                                            "</p><span class='remove-image u-delete'>Remove</span></div>"
                                    );
                            }
                            //Empty states
                            _this.$(".body-c-title").val("");
                            _this.$(".body-c-desc").val("");
                            _this.$(".body-c-link").val("");
                            _this.$(".body-c-button-text").val("");
                            _this.$(".body-c-button-url").val("");
                            _this.$(".body-c-buttonb-text").val("");
                            _this.$(".body-c-buttonb-url").val("");
                            _this.$(".body-c-image").val("");
                            _this.$(".body-c-embed").val("");
                        };
                    } else {
                        //Add image or add to array
                        if (this.$(".overlay-box").hasClass("edit-box")) {
                            this.trigger("add:image", value);
                        } else {
                            carouselImagesArray.push(image_item);
                            var title_label =
                                image_item.title || "Image: " + image_src;
                            this.$(".body-images-list").append(
                                "<div class='one-image'><p class='title'>" +
                                    title_label +
                                    "</p><span class='remove-image u-delete'>Remove</span></div>"
                            );
                        }
                        //Empty states
                        this.$(".body-c-title").val("");
                        this.$(".body-c-desc").val("");
                        this.$(".body-c-link").val("");
                        this.$(".body-c-button-text").val("");
                        this.$(".body-c-button-url").val("");
                        this.$(".body-c-buttonb-text").val("");
                        this.$(".body-c-buttonb-url").val("");
                        this.$(".body-c-image").val("");
                        this.$(".body-c-embed").val("");
                    }
                } else {
                    return;
                }
            },
            removeImage: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                //Save
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    var value = {
                        image_id: $target.parent().data("id"),
                    };
                    this.trigger("remove:image", value);
                } else {
                    var index = $target.parent().index();
                    //Remove from array
                    if (index > -1) {
                        carouselImagesArray.splice(index, 1);
                    }
                }
                //Remove element
                $target.parent().remove();
            },
            removePerson: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                var value = {
                    person_id: $target.parent().data("id"),
                };
                $target.parent().remove();
                //Save
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    this.trigger("removeCreated:person", value);
                } else {
                    this.trigger("remove:person", value);
                }
            },
            addEvent: function (ev) {
                ev.preventDefault();
                if (this.$(".event-title").val().trim()) {
                    //Date
                    var startDate, endDate;
                    //Get GMT Time
                    if (this.$(".event-start").datepicker("getDate")) {
                        var date = this.$(".event-start").datepicker("getDate");
                        var timeZoneOffset = new Date().getTimezoneOffset();
                        date = new Date(
                            new Date(date).getTime() +
                                timeZoneOffset * 60 * 1000
                        );
                        startDate = date;
                    }
                    if (this.$(".event-end").datepicker("getDate")) {
                        var date = this.$(".event-end").datepicker("getDate");
                        var timeZoneOffset = new Date().getTimezoneOffset();
                        date = new Date(
                            new Date(date).getTime() +
                                timeZoneOffset * 60 * 1000
                        );
                        endDate = date;
                    }
                    //Event
                    if (this.$(".overlay-box").hasClass("edit-box")) {
                        var value = {
                            title: this.$(".event-title").val().trim(),
                            desc: this.$(".event-desc").val().trim(),
                            start_date: startDate,
                            end_date: endDate,
                            image_m: this.$(".event-image").val(),
                            image_l: this.$(".event-image").val(),
                            url: this.$(".event-url").val().trim(),
                            location: this.$(".event-location").val().trim(),
                        };
                        this.trigger("add:event", value);
                    } else {
                        var event = {
                            title: this.$(".event-title").val().trim(),
                            desc: this.$(".event-desc").val().trim(),
                            "date.start": startDate,
                            "date.end": endDate,
                            "image.m": this.$(".event-image").val(),
                            "image.l": this.$(".event-image").val(),
                            url: this.$(".event-url").val().trim(),
                            location: this.$(".event-location").val().trim(),
                        };
                        this.$(".events-list").append(
                            "<div class='one-event'><p class='title'>" +
                                event.title +
                                "</p><span class='remove-event u-delete'>Remove</span></div>"
                        );
                        //Add to array
                        calEventsArray.push(event);
                    }
                    //Empty states
                    this.$(".event-title").val("");
                    this.$(".event-desc").val("");
                    this.$(".event-start").val("");
                    this.$(".event-end").val("");
                    this.$(".event-image").val("");
                    this.$(".event-url").val("");
                    this.$(".event-location").val("");
                } else {
                    return;
                }
            },
            removeEvent: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                //Save
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    var value = {
                        event_id: $target.parent().data("id"),
                    };
                    this.trigger("remove:event", value);
                } else {
                    var index = $target.parent().index();
                    //Remove from array
                    if (index > -1) {
                        calEventsArray.splice(index, 1);
                    }
                }
                //Remove element
                $target.parent().remove();
            },
            saveBlock: function (ev) {
                ev.preventDefault();
                //Get block type
                var type = this.$(".new-block-panel").data("type");
                //Save block based on type
                switch (type) {
                    case "header":
                        //Default header
                        var value = {
                            type: "header",
                            title: this.$(".header-title").val().trim(),
                            desc: this.$(".header-desc").val().trim(),
                            button_text: this.$(".header-button-text")
                                .val()
                                .trim(),
                            buttonb_text: this.$(".header-buttonb-text")
                                .val()
                                .trim(),
                            image_bg: this.$(".header-image").val().trim(),
                            story_title: this.$(".header-story-title")
                                .val()
                                .trim(),
                            story_text: this.$(".header-story-text")
                                .val()
                                .trim(),
                            story_url: this.$(".header-story-url").val().trim(),
                        };
                        var button_url = this.$(".header-button-url").val();
                        var buttonb_url = this.$(".header-buttonb-url").val();
                        break;
                    case "header_video":
                        //Header with video
                        var value = {
                            type: "header_video",
                            title: this.$(".header-title").val().trim(),
                            desc: this.$(".header-desc").val().trim(),
                            button_text: this.$(".header-button-text")
                                .val()
                                .trim(),
                            buttonb_text: this.$(".header-buttonb-text")
                                .val()
                                .trim(),
                            embed: this.$(".header-embed").val().trim(),
                        };
                        var button_url = this.$(".header-button-url").val();
                        var buttonb_url = this.$(".header-buttonb-url").val();
                        break;
                    case "header_bg":
                        //Header with background image
                        var value = {
                            type: "header_bg",
                            title: this.$(".header-title").val().trim(),
                            desc: this.$(".header-desc").val().trim(),
                            button_text: this.$(".header-button-text")
                                .val()
                                .trim(),
                            buttonb_text: this.$(".header-buttonb-text")
                                .val()
                                .trim(),
                            image_bg: this.$(".header-image").val().trim(),
                        };
                        var button_url = this.$(".header-button-url").val();
                        var buttonb_url = this.$(".header-buttonb-url").val();
                        break;
                    case "header_media":
                        //Header with center-aligned media
                        var value = {
                            type: "header_media",
                            title: this.$(".header-title").val().trim(),
                            desc: this.$(".header-desc").val().trim(),
                            button_text: this.$(".header-button-text")
                                .val()
                                .trim(),
                            buttonb_text: this.$(".header-buttonb-text")
                                .val()
                                .trim(),
                            image_m: this.$(".header-image").val().trim(),
                            embed: this.$(".header-embed").val().trim(),
                        };
                        var button_url = this.$(".header-button-url").val();
                        var buttonb_url = this.$(".header-buttonb-url").val();
                        break;
                    case "section":
                        //Default section
                        var value = {
                            type: "section",
                            title: this.$(".section-title").val().trim(),
                            desc: this.$(".section-desc").val(),
                            button_text: this.$(".section-button-text")
                                .val()
                                .trim(),
                            buttonb_text: this.$(".section-buttonb-text")
                                .val()
                                .trim(),
                        };
                        var button_url = this.$(".section-button-url").val();
                        var buttonb_url = this.$(".section-buttonb-url").val();
                        break;
                    case "section_basic":
                        //Basic section
                        var value = {
                            type: "section_basic",
                            title: this.$(".section-title").val().trim(),
                            desc: this.$(".section-desc").val(),
                            button_text: this.$(".section-button-text")
                                .val()
                                .trim(),
                            buttonb_text: this.$(".section-buttonb-text")
                                .val()
                                .trim(),
                        };
                        var button_url = this.$(".section-button-url").val();
                        var buttonb_url = this.$(".section-buttonb-url").val();
                        break;
                    case "section_media":
                        //Section with media
                        var value = {
                            type: "section_media",
                            title: this.$(".section-title").val().trim(),
                            desc: this.$(".section-desc").val(),
                            button_text: this.$(".section-button-text")
                                .val()
                                .trim(),
                            buttonb_text: this.$(".section-buttonb-text")
                                .val()
                                .trim(),
                            image_m: this.$(".section-image").val().trim(),
                            embed: this.$(".section-embed").val().trim(),
                        };
                        var button_url = this.$(".section-button-url").val();
                        var buttonb_url = this.$(".section-buttonb-url").val();
                        //Select orientation
                        if (this.$(".choose-media-left").hasClass("selected")) {
                            value.orientation = "left";
                        } else {
                            value.orientation = "right";
                        }
                        break;
                    case "section_list":
                        //Section with a list of items
                        var value = {
                            type: "section_list",
                            items: sectionItemsArray,
                        };
                        break;
                    case "container":
                        //Container
                        var value = {
                            type: "container",
                        };
                        //Select formula
                        if (this.$(".choose-tags").hasClass("selected")) {
                            value.formula = "tags";
                            value.row_count = parseInt(
                                this.$(".container-rows").val().trim()
                            );
                        } else {
                            value.formula = "empty";
                        }
                        break;
                    case "body_text":
                        //Body text block
                        var value = {
                            type: "body_text",
                            title: this.$(".body-t-title").val().trim(),
                            desc: this.$(".body-t-desc").val(),
                            button_text: this.$(".body-t-button-text")
                                .val()
                                .trim(),
                            image_m: this.$(".body-t-image").val().trim(),
                            label: this.$(".body-t-label").val(),
                        };
                        var button_url = this.$(".body-t-button-url").val();
                        //Select shape
                        if (this.$(".choose-rectangle").hasClass("selected")) {
                            value.shape = "rectangle";
                        } else if (
                            this.$(".choose-square").hasClass("selected")
                        ) {
                            value.shape = "square";
                        } else if (
                            this.$(".choose-circle").hasClass("selected")
                        ) {
                            value.shape = "circle";
                        } else {
                            value.shape = "background";
                        }
                        break;
                    case "body_html":
                        //Body HTML block
                        var value = {
                            type: "body_html",
                        };
                        break;
                    case "body_embed":
                        //Body embed block
                        var value = {
                            type: "body_embed",
                            title: this.$(".body-e-title").val().trim(),
                            desc: this.$(".body-e-desc").val(),
                            button_text: this.$(".body-e-button-text")
                                .val()
                                .trim(),
                            buttonb_text: this.$(".body-e-buttonb-text")
                                .val()
                                .trim(),
                            embed: this.$(".body-e-embed").val(),
                        };
                        var button_url = this.$(".body-e-button-url").val();
                        var buttonb_url = this.$(".body-e-buttonb-url").val();
                        break;
                    case "body_carousel":
                        //Default carousel
                        var value = {
                            type: "body_carousel",
                            gallery: carouselImagesArray,
                        };
                        break;
                    case "body_carousel_text":
                        //Text carousel
                        var value = {
                            type: "body_carousel_text",
                            gallery: carouselImagesArray,
                        };
                        break;
                    case "people":
                        //People block
                        var value = {
                            type: "people",
                            title: this.$(".people-title").val().trim(),
                            desc: this.$(".people-desc").val().trim(),
                        };
                        break;
                    case "logos":
                        //Logos block
                        var value = {
                            type: "logos",
                            title: this.$(".logos-title").val().trim(),
                            desc: this.$(".logos-desc").val().trim(),
                        };
                        break;
                    case "breather":
                        //Breather
                        var value = {
                            type: "breather",
                            title: this.$(".breather-title").val().trim(),
                            desc: this.$(".breather-desc").val().trim(),
                            button_text: this.$(".breather-button-text")
                                .val()
                                .trim(),
                            buttonb_text: this.$(".breather-buttonb-text")
                                .val()
                                .trim(),
                            image_bg: this.$(".breather-image").val().trim(),
                        };
                        var button_url = this.$(".breather-button-url").val();
                        var buttonb_url = this.$(".breather-buttonb-url").val();
                        break;
                    case "calendar":
                        //Calendar block
                        var value = {
                            type: "calendar",
                            title: this.$(".calendar-title").val().trim(),
                            events: calEventsArray,
                        };
                        break;
                }
                //Check if buttons have URL or embed code
                if (button_url && validator.isURL(button_url)) {
                    value.button_url = button_url;
                } else if (button_url) {
                    value.button_embed = button_url;
                }
                if (buttonb_url && validator.isURL(buttonb_url)) {
                    value.buttonb_url = buttonb_url;
                } else if (buttonb_url) {
                    value.buttonb_embed = buttonb_url;
                }
                //Order
                if ($(".one-block").hasClass("selected")) {
                    value.order = $(".one-block.selected").data("order") + 1;
                } else {
                    var num_blocks = $(".all-blocks .one-block").length;
                    value.order = num_blocks + 1;
                }
                //Page id
                value.page = $(".all-blocks").data("page");
                //Parent block
                if ($(".one-block").hasClass("selected-container")) {
                    value.block = $(".one-block.selected-container").data("id");
                }
                //Remove selected class
                $(".one-block.selected").removeClass("selected");
                $(".one-block.selected-container").removeClass("selected");
                //Save
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    if (!this.$(".block-body-h").hasClass("u-hide")) {
                        var $target = $(ev.currentTarget);
                        if ($target.hasClass("uploading")) {
                            return;
                        } else {
                            this.trigger("update:htmlBlock", value);
                        }
                    } else {
                        this.trigger("update:block", value);
                    }
                } else {
                    if (!this.$(".block-body-h").hasClass("u-hide")) {
                        var $target = $(ev.currentTarget);
                        if ($target.hasClass("uploading")) {
                            return;
                        } else {
                            this.trigger("save:htmlBlock", value);
                        }
                    } else {
                        this.trigger("save:block", value);
                    }
                }
            },
            deleteBlock: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (confirm("Are you sure you want to delete this block?")) {
                    this.trigger("delete:block");
                }
            },
        });
        //Sub block item view
        EntityViews.SubBlockItemView = Marionette.ItemView.extend({
            className: "sub-block",
            template: "subBlockItemTemplate",
            events: {
                "click .edit-block": "showEditBlockOverlay",
                "click .edit-theme": "showEditThemeOverlay",
                "click .move-up": "moveUp",
                "click .move-down": "moveDown",
            },
            showEditBlockOverlay: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                //Get container id
                var $target = $(ev.currentTarget);
                var container_id = $target.parents().eq(3).data("id");
                DashManager.vent.trigger(
                    "editBlockOverlay:show",
                    this.model.get("_id"),
                    container_id
                );
            },
            showEditThemeOverlay: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                //Get container id
                var $target = $(ev.currentTarget);
                var container_id = $target.parents().eq(3).data("id");
                DashManager.vent.trigger(
                    "editThemeOverlay:show",
                    this.model.get("_id"),
                    this.model.get("type"),
                    container_id
                );
            },
            moveUp: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                //Get container id
                var $target = $(ev.currentTarget);
                var container_id = $target.parents().eq(3).data("id");
                var value = {
                    block_id: this.model.get("_id"),
                    container_id: container_id,
                };
                this.trigger("move:up", value);
            },
            moveDown: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                //Get container id
                var $target = $(ev.currentTarget);
                var container_id = $target.parents().eq(3).data("id");
                var value = {
                    block_id: this.model.get("_id"),
                    container_id: container_id,
                };
                this.trigger("move:down", value);
            },
        });
        //Block item view
        EntityViews.BlockItemView = Marionette.CompositeView.extend({
            className: "one-block",
            template: "blockItemTemplate",
            childView: EntityViews.SubBlockItemView,
            childViewContainer: "div.sub-blocks",
            initialize: function () {
                this.$el.attr("data-id", this.model.get("_id"));
                this.$el.attr("data-order", this.model.get("order"));
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
                "click .add-below, .add-inside": "showAllBlocksOverlay",
                "click .add-tags": "showTagsOverlay",
                "click .move-up": "moveUp",
                "click .move-down": "moveDown",
                "click .edit-block": "showEditBlockOverlay",
                "click .edit-theme": "showEditThemeOverlay",
            },
            showAllBlocksOverlay: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("add-below")) {
                    $target.parent().parent().addClass("selected");
                    DashManager.vent.trigger("allBlocksOverlay:show");
                } else {
                    $target.parent().parent().addClass("selected-container");
                    DashManager.vent.trigger("allBlocksOverlay:show", 1);
                }
            },
            showTagsOverlay: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                DashManager.vent.trigger(
                    "blockTags:show",
                    this.model.get("_id")
                );
            },
            moveUp: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                this.trigger("move:up", this.model);
            },
            moveDown: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                this.trigger("move:down", this.model);
            },
            showEditBlockOverlay: function (ev) {
                DashManager.vent.trigger(
                    "editBlockOverlay:show",
                    this.model.get("_id")
                );
            },
            showEditThemeOverlay: function (ev) {
                DashManager.vent.trigger(
                    "editThemeOverlay:show",
                    this.model.get("_id"),
                    this.model.get("type")
                );
            },
        });
        //Page blocks view
        EntityViews.PageBlocksView = Marionette.CompositeView.extend({
            template: "pageBlocksTemplate",
            childView: EntityViews.BlockItemView,
            childViewContainer: "div.all-blocks",
            initialize: function () {
                var blocks = this.model.get("blocks");
                this.collection = new Backbone.Collection(blocks);
            },
            events: {
                "click .js-add-block": "showAllBlocksOverlay",
            },
            showAllBlocksOverlay: function (ev) {
                ev.preventDefault();
                DashManager.vent.trigger("allBlocksOverlay:show");
            },
        });
        //New article view
        EntityViews.NewArticleView = Marionette.ItemView.extend({
            template: "newArticleTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "click input, textarea": "showSelectImageModal",
                "click .content-choose span": "selectType",
                "click .select-style span": "selectStyle",
                "click .js-save-article": "saveArticle",
                "click .js-archive-article": "archiveArticle",
                "click .js-unarchive-article": "unarchiveArticle",
                "click .js-delete-article": "deleteArticle",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
            showSelectImageModal: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("js-select-image")) {
                    if (
                        $target.hasClass("selected") &&
                        $(".modal > div").length
                    )
                        return;
                    //Select current input
                    this.$(".js-select-image").removeClass("selected");
                    $target.addClass("selected");
                    //Show modal
                    if (!$(".modal > div").length)
                        DashManager.vent.trigger("selectImageModal:show");
                } else {
                    //Close modal
                    this.$(".js-selected-image").removeClass("selected");
                    DashManager.commands.execute("close:modal");
                }
            },
            selectType: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    $target.removeClass("selected");
                } else {
                    this.$(".content-choose span").removeClass("selected");
                    $target.addClass("selected");
                }
                //Close modal
                this.$(".js-select-image").removeClass("selected");
                DashManager.commands.execute("close:modal");
            },
            selectStyle: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    $target.removeClass("selected");
                    this.$(".choose-normal").addClass("selected");
                } else {
                    this.$(".select-style span").removeClass("selected");
                    $target.addClass("selected");
                }
                //Close modal
                this.$(".js-select-image").removeClass("selected");
                DashManager.commands.execute("close:modal");
            },
            saveArticle: function (ev) {
                ev.preventDefault();
                var value = {
                    title: this.$(".article-title").val().trim(),
                    desc: this.$(".article-desc").val().trim(),
                    slug: this.$(".article-slug").val().trim(),
                    image: this.$(".article-image").val(),
                    meta: this.$(".article-meta").val(),
                    feed: this.$(".article-feed").val(),
                    country: this.$(".article-country").val(),
                    lat: this.$(".article-lat").val(),
                    long: this.$(".article-long").val(),
                };
                //Category
                if (this.$(".choose-news").hasClass("selected")) {
                    value.category = "news";
                } else if (this.$(".choose-directors").hasClass("selected")) {
                    value.category = "directors";
                } else if (this.$(".choose-resources").hasClass("selected")) {
                    value.category = "resources";
                } else {
                    value.category = "blog";
                }
                //Style
                if (this.$(".choose-bold").hasClass("selected")) {
                    value.style = "bold";
                } else {
                    value.style = "normal";
                }
                //URL or embed code
                if (this.$(".article-url").val().trim()) {
                    var url = this.$(".article-url").val().trim();
                    if (validator.isURL(url)) {
                        value.ref = url;
                        //Get extension from url and check if image
                        var index = url.lastIndexOf(".");
                        if (index) {
                            var file_ext = url.substring(index + 1, url.length);
                            var image_extensions = [
                                "jpg",
                                "png",
                                "gif",
                                "jpeg",
                            ];
                            if (image_extensions.indexOf(file_ext) >= 0) {
                                value.image_l = url;
                            }
                        }
                    } else {
                        value.embed = url;
                    }
                } else {
                    value.ref = "";
                    value.embed = "";
                }
                //Folder id
                if ($(".all-items").data("folder")) {
                    value.folder = $(".all-items").data("folder");
                }
                //Create - Edit article
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    this.trigger("update:article", value);
                } else {
                    this.trigger("save:article", value);
                }
            },
            archiveArticle: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (
                    confirm(
                        "Are you sure you want to archive this article? This will make the article private."
                    )
                ) {
                    this.trigger("archive:article");
                }
            },
            unarchiveArticle: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (
                    confirm(
                        "Are you sure you want to unarchive this article? This will make the article public."
                    )
                ) {
                    this.trigger("unarchive:article");
                }
            },
            deleteArticle: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("js-delete-folder")) {
                    if (
                        confirm(
                            "Are you sure you want to delete this folder? Articles inside the folder will not be deleted."
                        )
                    ) {
                        this.trigger("delete:article", true);
                    }
                } else {
                    if (
                        confirm(
                            "Are you sure you want to delete this article and all its blocks?"
                        )
                    ) {
                        this.trigger("delete:article");
                    }
                }
            },
        });
        //Article content view
        EntityViews.ArticleContentView = Marionette.ItemView.extend({
            template: "articleContentTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "click .js-update-article": "updateArticleContent",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
            updateArticleContent: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("uploading")) {
                    return;
                } else {
                    this.trigger("update:articleContent");
                }
            },
        });
        //Article item view
        EntityViews.ArticleItemView = Marionette.ItemView.extend({
            template: "articleItemTemplate",
            className: "one-item",
            initialize: function () {
                this.$el.data("id", this.model.get("_id"));
                //Is archived
                if (this.model.get("is_archived")) {
                    this.$el.addClass("is-archived");
                }
            },
            events: {
                click: "showArticleBlocks",
                "click .js-view-folder": "showFolder",
                "click .js-edit-meta": "showEditArticleOverlay",
                "click .js-add-person": "showPersonsOverlay",
                "click .js-add-related": "showRelatedPagesOverlay",
                "click .js-add-tags": "showTagsOverlay",
                "click .js-edit-html": "showContentOverlay",
                "click .js-preview": "previewArticle",
                "click .select-item": "selectItem",
            },
            showArticleBlocks: function (ev) {
                ev.preventDefault();
                if ($(".one-item.selected-item").length) {
                    this.$(".select-item").click();
                } else {
                    if (this.model.get("is_folder")) {
                        DashManager.vent.trigger(
                            "editArticleOverlay:show",
                            this.model.get("_id"),
                            true
                        );
                    } else {
                        DashManager.vent.trigger(
                            "articleBlocks:show",
                            this.model.get("_id")
                        );
                    }
                }
            },
            showFolder: function (ev) {
                if (ev.metaKey || ev.ctrlKey) return;
                ev.preventDefault();
                ev.stopPropagation();
                DashManager.vent.trigger(
                    "articles:show",
                    "",
                    this.model.get("_id")
                );
            },
            showEditArticleOverlay: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                $target.parent().parent().addClass("selected-item");
                DashManager.vent.trigger(
                    "editArticleOverlay:show",
                    this.model.get("_id")
                );
            },
            showPersonsOverlay: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                DashManager.vent.trigger(
                    "articlePersons:show",
                    this.model.get("_id")
                );
            },
            showRelatedPagesOverlay: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                DashManager.vent.trigger(
                    "relatedPages:show",
                    this.model.get("_id")
                );
            },
            showTagsOverlay: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                DashManager.vent.trigger(
                    "articleTags:show",
                    this.model.get("_id")
                );
            },
            showContentOverlay: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                DashManager.vent.trigger(
                    "editContentOverlay:show",
                    this.model.get("_id")
                );
            },
            previewArticle: function (ev) {
                ev.stopPropagation();
            },
            selectItem: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    //Unselect item
                    $target.removeClass("selected");
                    this.$el.removeClass("selected-item");
                    //Get count
                    var selected_items = $(".one-item.selected-item").length;
                    if (!selected_items) {
                        //Hide toolbar
                        $(".mainWrap .toolbarWrap").slideUp("fast");
                    } else if (selected_items == 1) {
                        $(".toolbar-text .selected-text").html(
                            "<b>" + selected_items + "</b> article selected"
                        );
                    } else {
                        $(".toolbar-text .selected-text b").text(
                            selected_items
                        );
                    }
                } else {
                    //Select item
                    $target.addClass("selected");
                    this.$el.addClass("selected-item");
                    //Get count
                    var selected_items = $(".one-item.selected-item").length;
                    if (selected_items == 1) {
                        //Show toolbalr
                        $(".mainWrap .toolbarWrap").slideDown("fast");
                        $(".toolbar-text .selected-text").html(
                            "<b>1</b> article selected"
                        );
                    } else if (selected_items == 2) {
                        $(".toolbar-text .selected-text").html(
                            "<b>" + selected_items + "</b> articles selected"
                        );
                    } else {
                        $(".toolbar-text .selected-text b").text(
                            selected_items
                        );
                    }
                }
            },
        });
        //Articles view
        EntityViews.ArticlesView = Marionette.CompositeView.extend({
            template: "articlesTemplate",
            childView: EntityViews.ArticleItemView,
            childViewContainer: "div.all-items",
            events: {
                "click .js-add-article": "showNewArticleOverlay",
                "click .filter-items span": "filterArticles",
                "click .js-cancel-selection": "cancelSelection",
                "click .js-addto-folder": "showAddArticlesToFolderOverlay",
            },
            showNewArticleOverlay: function (ev) {
                ev.preventDefault();
                DashManager.vent.trigger("newArticleOverlay:show");
            },
            filterArticles: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    //Show all people
                    DashManager.vent.trigger("articles:show");
                } else {
                    //Select
                    if ($target.hasClass("filter-news")) {
                        DashManager.vent.trigger("articles:show", "news");
                    } else if ($target.hasClass("filter-blog")) {
                        DashManager.vent.trigger("articles:show", "blog");
                    } else if ($target.hasClass("filter-directors")) {
                        DashManager.vent.trigger("articles:show", "directors");
                    } else if ($target.hasClass("filter-resources")) {
                        DashManager.vent.trigger("articles:show", "resources");
                    }
                }
            },
            cancelSelection: function (ev) {
                ev.preventDefault();
                //Unselect item
                $(".one-item.selected-item .select-item").removeClass(
                    "selected"
                );
                $(".one-item.selected-item").removeClass("selected-item");
                //Hide toolbar
                $(".mainWrap .toolbarWrap").slideUp("fast");
            },
            showAddArticlesToFolderOverlay: function (ev) {
                ev.preventDefault();
                DashManager.vent.trigger(
                    "addArticlesToFolderOverlay:show",
                    this.$(".all-items").data("folder")
                );
            },
        });
        //All article blocks list view
        EntityViews.AllArticleBlocksView = Marionette.ItemView.extend({
            template: "allArticleBlocksTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "click .block-select": "selectBlock",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
            selectBlock: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("js-article-text-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "text"
                    );
                } else if ($target.hasClass("js-article-gallery-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "gallery"
                    );
                } else if ($target.hasClass("js-article-audio-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "audio"
                    );
                } else if ($target.hasClass("js-article-video-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "video"
                    );
                } else if ($target.hasClass("js-article-file-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "file"
                    );
                } else if ($target.hasClass("js-article-gif-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "gif"
                    );
                } else if ($target.hasClass("js-article-link-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "link"
                    );
                } else if ($target.hasClass("js-article-embed-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "embed"
                    );
                } else if ($target.hasClass("js-article-toggle-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "toggle"
                    );
                } else if ($target.hasClass("js-article-callout-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "callout"
                    );
                } else if ($target.hasClass("js-article-people-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "people"
                    );
                } else if ($target.hasClass("js-article-logos-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "logos"
                    );
                } else if ($target.hasClass("js-article-breather-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "breather"
                    );
                } else if ($target.hasClass("js-article-button-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "button"
                    );
                } else if ($target.hasClass("js-article-discussion-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "discussion"
                    );
                } else if ($target.hasClass("js-article-mcq-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "mcq"
                    );
                } else if ($target.hasClass("js-article-journal-block")) {
                    DashManager.vent.trigger(
                        "newArticleBlockOverlay:show",
                        "journal"
                    );
                }
            },
        });
        //New articleblock view
        EntityViews.NewArticleBlockView = Marionette.ItemView.extend({
            template: "newArticleBlockTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "click input, textarea": "showSelectImageModal",
                "input .link-embed": "showPreviewLink",
                "click .link-add": "embedLink",
                "click .one-shot": "selectImage",
                "click #drop": "openFileBrowser",
                "click .file-input": "doNothing",
                "click .block-callout-colors span": "selectCalloutColor",
                "click .block-button-colors span": "selectButtonColor",
                "click .select-journal span": "selectJournalType",
                "input .search-gifs": "findGIFResults",
                "click .one-gif": "saveGIFBlock",
                "click .remove-person": "removePerson",
                "click .js-add-image": "addImage",
                "click .remove-image": "removeImage",
                "click .js-save-block": "saveBlock",
                "click .js-delete-block": "deleteBlock",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
            showSelectImageModal: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("js-select-image")) {
                    if (
                        $target.hasClass("selected") &&
                        $(".modal > div").length
                    )
                        return;
                    //Select current input
                    this.$(".js-select-image").removeClass("selected");
                    $target.addClass("selected");
                    //Show modal
                    if (!$(".modal > div").length)
                        DashManager.vent.trigger("selectImageModal:show");
                } else {
                    //Close modal
                    this.$(".js-selected-image").removeClass("selected");
                    DashManager.commands.execute("close:modal");
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
                var fetchingLinkpreview = DashManager.request(
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
                    _this.$(".js-save").removeClass("u-disabled");
                });
            },
            selectImage: function (ev) {
                var $target = $(ev.currentTarget);
                this.$(".preview-shots .one-shot").removeClass("selected");
                $target.addClass("selected");
            },
            openFileBrowser: function (ev) {
                this.$(".block-file .file-input").click();
            },
            doNothing: function (ev) {
                ev.stopPropagation();
            },
            selectCalloutColor: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                this.$(".block-callout-colors span").removeClass("selected");
                $target.addClass("selected");
            },
            selectButtonColor: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                this.$(".block-button-colors span").removeClass("selected");
                $target.addClass("selected");
            },
            selectJournalType: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                this.$(".select-journal span").removeClass("selected");
                $target.addClass("selected");
            },
            findGIFResults: function (ev) {
                var text = this.$(".search-gifs").val().trim();
                var _this = this;
                if (!text) {
                    if (findTimer) {
                        clearTimeout(findTimer);
                        findTimer = null;
                    }
                    //Hide loading bar and empty results
                    this.$(".block-gif .throbber-loader").addClass("u-hide");
                    this.$(".search-gifs").html("");
                } else {
                    clearTimeout(findTimer);
                    findTimer = null;
                    findTimer = setTimeout(function () {
                        //Show loading bar
                        _this
                            .$(".block-gif .throbber-loader")
                            .removeClass("u-hide");
                        //Find gifs
                        var fetchingGIFResults = DashManager.request(
                            "appResults:entity",
                            "gifs",
                            text
                        );
                        $.when(fetchingGIFResults).done(function (results) {
                            var attrs = results.attributes.data;
                            //Save results data
                            resultsData = attrs;
                            _this
                                .$(".block-gif .throbber-loader")
                                .addClass("u-hide");
                            _this.$(".gif-results").html("").show();
                            for (var i = 0; i < 10; i++) {
                                var data = attrs[i];
                                if (!data) break;
                                var image = data.images.fixed_height.url;
                                var width =
                                    parseInt(data.images.fixed_height.width) +
                                    4;
                                width = width + "px";
                                _this
                                    .$(".gif-results")
                                    .append(
                                        "<div class='one-gif' style='width:" +
                                            width +
                                            "'><img src='" +
                                            image +
                                            "'></div>"
                                    );
                            }
                        });
                    }, 500);
                }
            },
            saveGIFBlock: function (ev) {
                var $target = $(ev.currentTarget);
                var index = $target.index();
                var data = resultsData[index];
                var value = {
                    type: "gif",
                    gif_url: data.url,
                    gif_embed: data.images.original.mp4,
                    width: data.images.original.width,
                    height: data.images.original.height,
                };
                //Block id
                value.block = $(".all-blocks").data("block");
                //Order
                if ($(".one-block").hasClass("selected")) {
                    value.order = $(".one-block.selected").data("order") + 1;
                } else {
                    var num_blocks = $(".all-blocks .one-block").length;
                    value.order = num_blocks + 1;
                }
                //Save
                this.trigger("save:articleBlock", value);
            },
            removePerson: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                var value = {
                    person_id: $target.parent().data("id"),
                };
                $target.parent().remove();
                //Save
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    this.trigger("removeCreated:person", value);
                } else {
                    this.trigger("remove:person", value);
                }
            },
            addImage: function (ev) {
                ev.preventDefault();
                if (this.$(".body-c-image").val().trim()) {
                    //Image
                    if (this.$(".overlay-box").hasClass("edit-box")) {
                        var value = {
                            title: this.$(".body-c-title").val().trim(),
                            image_m: this.$(".body-c-image").val().trim(),
                            image_l: this.$(".body-c-image").val().trim(),
                            button_url: this.$(".body-c-link").val().trim(),
                        };
                    } else {
                        var image_item = {
                            title: this.$(".body-c-title").val().trim(),
                            "file.m": this.$(".body-c-image").val().trim(),
                            "file.l": this.$(".body-c-image").val().trim(),
                            "button.url": this.$(".body-c-link").val().trim(),
                        };
                    }
                    var image_src = this.$(".body-c-image").val().trim();
                    //Get bound
                    var _this = this;
                    var image = new Image();
                    image.src = image_src;
                    image.onload = function () {
                        var bound =
                            (image.naturalWidth * 400) / image.naturalHeight;
                        if (bound) {
                            bound = parseInt(bound);
                            if (_this.$(".overlay-box").hasClass("edit-box")) {
                                value.bound = bound;
                            } else {
                                image_item.bound = bound;
                            }
                        }
                        window.URL.revokeObjectURL(image.src);
                        //Add image or add to array
                        if (_this.$(".overlay-box").hasClass("edit-box")) {
                            _this.trigger("add:image", value);
                        } else {
                            carouselImagesArray.push(image_item);
                            var title_label =
                                image_item.title || "Image: " + image_src;
                            _this
                                .$(".body-images-list")
                                .append(
                                    "<div class='one-image'><p class='title'>" +
                                        title_label +
                                        "</p><span class='remove-image u-delete'>Remove</span></div>"
                                );
                        }
                        //Empty states
                        _this.$(".body-c-title").val("");
                        _this.$(".body-c-image").val("");
                        _this.$(".body-c-link").val("");
                    };
                    image.onerror = function () {
                        if (_this.$(".overlay-box").hasClass("edit-box")) {
                            value.bound = 600;
                        } else {
                            image_item.bound = 600;
                        }
                        //Add image or add to array
                        if (_this.$(".overlay-box").hasClass("edit-box")) {
                            _this.trigger("add:image", value);
                        } else {
                            carouselImagesArray.push(image_item);
                            var title_label =
                                image_item.title || "Image: " + image_src;
                            _this
                                .$(".body-images-list")
                                .append(
                                    "<div class='one-image'><p class='title'>" +
                                        title_label +
                                        "</p><span class='remove-image u-delete'>Remove</span></div>"
                                );
                        }
                        //Empty states
                        _this.$(".body-c-title").val("");
                        _this.$(".body-c-image").val("");
                        _this.$(".body-c-link").val("");
                    };
                } else {
                    return;
                }
            },
            removeImage: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                //Save
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    var value = {
                        image_id: $target.parent().data("id"),
                    };
                    this.trigger("remove:image", value);
                } else {
                    var index = $target.parent().index();
                    //Remove from array
                    if (index > -1) {
                        carouselImagesArray.splice(index, 1);
                    }
                }
                //Remove element
                $target.parent().remove();
            },
            saveBlock: function (ev) {
                ev.preventDefault();
                if (!this.$(".block-text").hasClass("u-hide")) {
                    //Text
                    var value = {
                        type: "text",
                    };
                } else if (!this.$(".block-gallery").hasClass("u-hide")) {
                    //Gallery
                    var value = {
                        type: "gallery",
                        gallery: carouselImagesArray,
                    };
                } else if (!this.$(".block-file").hasClass("u-hide")) {
                    //File
                    var value = {
                        type: "file",
                        title: this.$(".block-file-title").val().trim(),
                    };
                } else if (!this.$(".block-link").hasClass("u-hide")) {
                    //Link
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
                } else if (!this.$(".block-embed").hasClass("u-hide")) {
                    //Embed
                    var value = {
                        type: "embed",
                        title: this.$(".block-embed-title").val().trim(),
                        embed: this.$(".block-embed-code").val(),
                    };
                } else if (!this.$(".block-toggle").hasClass("u-hide")) {
                    //Toggle
                    var value = {
                        type: "toggle",
                        title: this.$(".block-toggle-title").val().trim(),
                        desc: this.$(".block-toggle-desc").val(),
                    };
                } else if (!this.$(".block-callout").hasClass("u-hide")) {
                    //Callout
                    var value = {
                        type: "callout",
                        title: this.$(".block-callout-title").val().trim(),
                        desc: this.$(".block-callout-desc").val(),
                        color_back: this.$(
                            ".block-callout-colors span.selected"
                        ).css("backgroundColor"),
                        color_border: this.$(
                            ".block-callout-colors span.selected"
                        ).css("borderColor"),
                    };
                } else if (!this.$(".block-people").hasClass("u-hide")) {
                    //People
                    var value = {
                        type: "people",
                        title: this.$(".people-title").val().trim(),
                        desc: this.$(".people-desc").val(),
                    };
                } else if (!this.$(".block-logos").hasClass("u-hide")) {
                    //Logos
                    var value = {
                        type: "logos",
                        title: this.$(".logos-title").val().trim(),
                        desc: this.$(".logos-desc").val(),
                    };
                } else if (!this.$(".block-breather").hasClass("u-hide")) {
                    //Breather
                    var value = {
                        type: "breather",
                        title: this.$(".block-breather-title").val().trim(),
                        desc: this.$(".block-breather-desc").val(),
                        image_bg: this.$(".block-breather-image").val().trim(),
                        button_url: this.$(".block-breather-link").val(),
                    };
                } else if (!this.$(".block-button").hasClass("u-hide")) {
                    //Button
                    var value = {
                        type: "button",
                        button_text: this.$(".block-button-title").val().trim(),
                        button_url: this.$(".block-button-url").val().trim(),
                        back_color: this.$(
                            ".block-button-colors span.selected"
                        ).css("backgroundColor"),
                    };
                } else if (!this.$(".block-mcq").hasClass("u-hide")) {
                    //MCQ
                    var value = {
                        type: "mcq",
                        title: this.$(".block-mcq-title").val().trim(),
                    };
                    //Check if is_multiple
                    if (this.$(".is-multiple-label input").is(":checked")) {
                        value.is_multiple = true;
                    } else {
                        value.is_multiple = false;
                    }
                } else if (!this.$(".block-journal").hasClass("u-hide")) {
                    //Journal
                    var value = {
                        type: "journal",
                        title: this.$(".block-journaling-title").val().trim(),
                        text: this.$(".block-journaling-text").val().trim(),
                    };
                    //Select journal type
                    if (
                        this.$(".select-journal .journal-text").hasClass(
                            "selected"
                        )
                    ) {
                        value.journal_type = "text";
                    } else if (
                        this.$(".select-journal .journal-file").hasClass(
                            "selected"
                        )
                    ) {
                        value.journal_type = "file";
                    } else if (
                        this.$(".select-journal .journal-audio").hasClass(
                            "selected"
                        )
                    ) {
                        value.journal_type = "audio";
                    } else if (
                        this.$(".select-journal .journal-video").hasClass(
                            "selected"
                        )
                    ) {
                        value.journal_type = "video";
                    } else if (
                        this.$(".select-journal .journal-canvas").hasClass(
                            "selected"
                        )
                    ) {
                        value.journal_type = "canvas";
                    }
                }
                //Order
                if ($(".one-block").hasClass("selected")) {
                    value.order = $(".one-block.selected").data("order") + 1;
                } else {
                    var num_blocks = $(".all-blocks .one-block").length;
                    value.order = num_blocks + 1;
                }
                //Block id
                value.block = $(".all-blocks").data("block");
                //Remove selected class
                $(".one-block.selected").removeClass("selected");
                //Save
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    if (!this.$(".block-text").hasClass("u-hide")) {
                        var $target = $(ev.currentTarget);
                        if ($target.hasClass("uploading")) {
                            return;
                        } else {
                            this.trigger("update:articleHtmlBlock", value);
                        }
                    } else {
                        this.trigger("update:articleBlock", value);
                    }
                } else {
                    if (!this.$(".block-text").hasClass("u-hide")) {
                        var $target = $(ev.currentTarget);
                        if ($target.hasClass("uploading")) {
                            return;
                        } else {
                            this.trigger("save:articleHtmlBlock", value);
                        }
                    } else {
                        this.trigger("save:articleBlock", value);
                    }
                }
            },
            deleteBlock: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (confirm("Are you sure you want to delete this block?")) {
                    this.trigger("delete:articleBlock");
                }
            },
        });
        //Article Block item view
        EntityViews.ArticleBlockItemView = Marionette.ItemView.extend({
            className: "one-block",
            template: "articleBlockItemTemplate",
            initialize: function () {
                this.$el.attr("data-id", this.model.get("_id"));
                this.$el.attr("data-order", this.model.get("order"));
            },
            events: {
                "click .add-below, .add-inside": "showAllArticleBlocksOverlay",
                "click .move-up": "moveUp",
                "click .move-down": "moveDown",
                "click .edit-block": "showEditArticleBlockOverlay",
                "click .edit-options": "showEditOptionsOverlay",
            },
            showAllArticleBlocksOverlay: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("add-below")) {
                    $target.parent().parent().addClass("selected");
                } else {
                    $target.parent().parent().addClass("selected-container");
                }
                DashManager.vent.trigger("allArticleBlocksOverlay:show");
            },
            moveUp: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                this.trigger("move:up", this.model);
            },
            moveDown: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                this.trigger("move:down", this.model);
            },
            showEditArticleBlockOverlay: function (ev) {
                DashManager.vent.trigger(
                    "editArticleBlockOverlay:show",
                    this.model.get("_id")
                );
            },
            showEditOptionsOverlay: function (ev) {
                DashManager.vent.trigger(
                    "mcqOptions:show",
                    this.model.get("_id"),
                    true
                );
            },
        });
        //Article blocks view
        EntityViews.ArticleBlocksView = Marionette.CompositeView.extend({
            template: "articleBlocksTemplate",
            childView: EntityViews.ArticleBlockItemView,
            childViewContainer: "div.all-blocks",
            events: {
                "click .js-add-block": "showAllArticleBlocksOverlay",
            },
            showAllArticleBlocksOverlay: function (ev) {
                ev.preventDefault();
                DashManager.vent.trigger("allArticleBlocksOverlay:show");
            },
        });
        //Option item view
        EntityViews.McqOptionItemView = Marionette.ItemView.extend({
            tagName: "div",
            className: "one-mcq-option",
            template: "mcqOptionOneTemplate",
            events: {
                "click .remove-option": "removeMCQOption",
            },
            removeMCQOption: function (ev) {
                ev.preventDefault();
                var value = {
                    option_id: this.model.get("_id"),
                };
                this.trigger("remove:option", value);
            },
        });
        //MCQ options view
        EntityViews.McqOptionsView = Marionette.CompositeView.extend({
            template: "mcqOptionsTemplate",
            childView: EntityViews.McqOptionItemView,
            childViewContainer: "div.mcq-option-list",
            events: {
                "click .js-close, .js-done": "closeOverlay",
                "click #option-image": "openFileBrowser",
                "click .file-input": "doNothing",
                "click .mcq-add": "addMCQOption",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
            openFileBrowser: function (ev) {
                this.$("#option-image .file-input").click();
            },
            doNothing: function (ev) {
                ev.stopPropagation();
            },
            addMCQOption: function (ev) {
                if (!this.$(".option-text").val().trim()) return;
                var value = {
                    text: this.$(".option-text").val().trim(),
                };
                this.trigger("add:option", value);
            },
        });
        //File item view
        EntityViews.FileItemView = Marionette.ItemView.extend({
            template: "fileItemTemplate",
            className: "one-item",
            initialize: function () {
                this.$el.data("id", this.model.get("_id"));
            },
            events: {
                click: "showEditFileOverlay",
                "click .js-view-folder": "showFolder",
                "click .input-share-url, .input-image-m-url, .input-image-l-url":
                    "selectLink",
                "click .select-item": "selectItem",
            },
            showEditFileOverlay: function (ev) {
                if ($(".one-item.selected-item").length) {
                    this.$(".select-item").click();
                } else {
                    if (this.model.get("is_folder")) {
                        DashManager.vent.trigger(
                            "editFileOverlay:show",
                            this.model.get("_id"),
                            true
                        );
                    } else {
                        DashManager.vent.trigger(
                            "editFileOverlay:show",
                            this.model.get("_id")
                        );
                    }
                }
            },
            showFolder: function (ev) {
                if (ev.metaKey || ev.ctrlKey) return;
                ev.preventDefault();
                ev.stopPropagation();
                DashManager.vent.trigger("files:show", this.model.get("_id"));
            },
            selectLink: function (ev) {
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                $target.select();
            },
            selectItem: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    //Unselect item
                    $target.removeClass("selected");
                    this.$el.removeClass("selected-item");
                    //Get count
                    var selected_items = $(".one-item.selected-item").length;
                    if (!selected_items) {
                        //Hide toolbar
                        $(".mainWrap .toolbarWrap").slideUp("fast");
                    } else if (selected_items == 1) {
                        $(".toolbar-text .selected-text").html(
                            "<b>" + selected_items + "</b> file selected"
                        );
                    } else {
                        $(".toolbar-text .selected-text b").text(
                            selected_items
                        );
                    }
                } else {
                    //Select item
                    $target.addClass("selected");
                    this.$el.addClass("selected-item");
                    //Get count
                    var selected_items = $(".one-item.selected-item").length;
                    if (selected_items == 1) {
                        //Show toolbalr
                        $(".mainWrap .toolbarWrap").slideDown("fast");
                        $(".toolbar-text .selected-text").html(
                            "<b>1</b> file selected"
                        );
                    } else if (selected_items == 2) {
                        $(".toolbar-text .selected-text").html(
                            "<b>" + selected_items + "</b> files selected"
                        );
                    } else {
                        $(".toolbar-text .selected-text b").text(
                            selected_items
                        );
                    }
                }
            },
        });
        //Files view
        EntityViews.FilesView = Marionette.CompositeView.extend({
            template: "filesTemplate",
            childView: EntityViews.FileItemView,
            childViewContainer: "div.all-items",
            events: {
                "click #drop": "openFileBrowser",
                "click .file-input": "doNothing",
                "click .js-cancel-selection": "cancelSelection",
                "click .js-addto-folder": "showAddFilesToFolderOverlay",
            },
            openFileBrowser: function (ev) {
                this.$(".upload-file .file-input").click();
            },
            doNothing: function (ev) {
                ev.stopPropagation();
            },
            cancelSelection: function (ev) {
                ev.preventDefault();
                //Unselect item
                $(".one-item.selected-item .select-item").removeClass(
                    "selected"
                );
                $(".one-item.selected-item").removeClass("selected-item");
                //Hide toolbar
                $(".mainWrap .toolbarWrap").slideUp("fast");
            },
            showAddFilesToFolderOverlay: function (ev) {
                ev.preventDefault();
                DashManager.vent.trigger(
                    "addFilesToFolderOverlay:show",
                    this.$(".all-items").data("folder")
                );
            },
        });
        //Edit file view
        EntityViews.EditFileView = Marionette.ItemView.extend({
            template: "editFileTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "click .js-save-file": "saveFile",
                "click .js-delete-file": "deleteFile",
                "click .js-aspects p": "updateAspectRatio",
                "click .js-flip-h": "flipHorizontally",
                "click .js-flip-v": "flipVertically",
                "click .js-reset-crop": "resetCrop",
                "click .js-save-image:not(.uploading)": "updateImage",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
            saveFile: function (ev) {
                ev.preventDefault();
                var value = {
                    title: this.$(".file-title").val().trim(),
                };
                this.trigger("update:file", value);
            },
            deleteFile: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("js-delete-folder")) {
                    if (
                        confirm(
                            "Are you sure you want to delete this folder? Files inside the folder will not be deleted."
                        )
                    ) {
                        this.trigger("delete:file", true);
                    }
                } else {
                    if (confirm("Are you sure you want to delete this file?")) {
                        this.trigger("delete:file");
                    }
                }
            },
            updateAspectRatio: function (ev) {
                var $target = $(ev.currentTarget);
                this.$(".js-aspects p").removeClass("active");
                $target.addClass("active");
                if ($target.hasClass("js-aspect-3")) {
                    var value = {
                        ratio: 3 / 1,
                    };
                } else if ($target.hasClass("js-aspect-2")) {
                    var value = {
                        ratio: 2 / 1,
                    };
                } else if ($target.hasClass("js-aspect-1")) {
                    var value = {
                        ratio: 1 / 1,
                    };
                }
                this.trigger("update:aspectRatio", value);
            },
            flipHorizontally: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("active")) {
                    $target.removeClass("active");
                    var value = {
                        scale: 1,
                    };
                } else {
                    $target.addClass("active");
                    var value = {
                        scale: -1,
                    };
                }
                this.trigger("flip:horizontally", value);
            },
            flipVertically: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("active")) {
                    $target.removeClass("active");
                    var value = {
                        scale: 1,
                    };
                } else {
                    $target.addClass("active");
                    var value = {
                        scale: -1,
                    };
                }
                this.trigger("flip:vertically", value);
            },
            resetCrop: function (ev) {
                this.$(".js-flip-h, .js-flip-v").removeClass("active");
                this.trigger("reset:crop");
            },
            updateImage: function (ev) {
                if (this.$(".js-aspect-1").hasClass("active")) {
                    var value = {
                        width: 400,
                        height: 400,
                    };
                } else if (this.$(".js-aspect-2").hasClass("active")) {
                    var value = {
                        width: 800,
                        height: 400,
                    };
                } else if (this.$(".js-aspect-3").hasClass("active")) {
                    var value = {
                        width: 1500,
                        height: 500,
                    };
                }
                this.trigger("update:image", value);
            },
        });
        //New person view
        EntityViews.NewPersonView = Marionette.ItemView.extend({
            template: "newPersonTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "click .content-choose span": "selectType",
                "click .upload-btn": "uploadDp",
                "click .js-save-person": "savePerson",
                "click .js-delete-person": "deletePerson",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
            uploadDp: function (ev) {
                ev.preventDefault();
                this.$(".file-input").click();
            },
            selectType: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    $target.removeClass("selected");
                } else {
                    this.$(".content-choose span").removeClass("selected");
                    $target.addClass("selected");
                }
            },
            savePerson: function (ev) {
                ev.preventDefault();
                var value = {
                    name: this.$(".person-name").val().trim(),
                    about: this.$(".person-about").val().trim(),
                    desc: this.$(".person-desc").val(),
                    email: this.$(".person-email").val(),
                    url: this.$(".person-url").val(),
                };
                //Dp
                if (this.$(".person-image").data("image")) {
                    value.image = this.$(".person-image").data("image");
                }
                //Type
                if (this.$(".choose-team").hasClass("selected")) {
                    value.type = "team";
                } else if (this.$(".choose-partner").hasClass("selected")) {
                    value.type = "partner";
                } else {
                    value.type = "author";
                }
                //Create - Edit person
                if (this.$(".overlay-box").hasClass("edit-box")) {
                    this.trigger("update:person", value);
                } else {
                    this.trigger("save:person", value);
                }
            },
            deletePerson: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (confirm("Are you sure you want to delete this person?")) {
                    this.trigger("delete:person");
                }
            },
        });
        //Person item view
        EntityViews.PersonItemView = Marionette.ItemView.extend({
            template: "personItemTemplate",
            className: "one-item",
            events: {
                click: "showEditPersonOverlay",
            },
            showEditPersonOverlay: function (ev) {
                DashManager.vent.trigger(
                    "editPersonOverlay:show",
                    this.model.get("_id")
                );
            },
        });
        //Persons view
        EntityViews.PersonsView = Marionette.CompositeView.extend({
            template: "personsTemplate",
            childView: EntityViews.PersonItemView,
            childViewContainer: "div.all-items",
            events: {
                "click .js-add-person": "showNewPersonOverlay",
                "click .filter-items span": "filterPeople",
            },
            showNewPersonOverlay: function (ev) {
                ev.preventDefault();
                DashManager.vent.trigger("newPersonOverlay:show");
            },
            filterPeople: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    //Show all people
                    DashManager.vent.trigger("people:show");
                } else {
                    //Select
                    if ($target.hasClass("filter-team")) {
                        DashManager.vent.trigger("people:show", "team");
                    } else if ($target.hasClass("filter-partner")) {
                        DashManager.vent.trigger("people:show", "partner");
                    } else if ($target.hasClass("filter-author")) {
                        DashManager.vent.trigger("people:show", "author");
                    }
                }
            },
        });
        //Person list item view
        EntityViews.PersonListItemView = Marionette.ItemView.extend({
            tagName: "div",
            className: "one-person",
            template: "personOneTemplate",
            events: {
                "click .remove-person": "removePerson",
            },
            removePerson: function () {
                var value = {
                    person_id: this.model.get("_id"),
                };
                this.trigger("remove:person", value);
            },
        });
        //Persons list view
        EntityViews.PersonsListView = Marionette.CompositeView.extend({
            template: "personsListTemplate",
            childView: EntityViews.PersonListItemView,
            childViewContainer: "div.persons-list",
            events: {
                "click .js-close, .js-done": "closeOverlay",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
        });
        //Related page item view
        EntityViews.RelatedPageItemView = Marionette.ItemView.extend({
            tagName: "div",
            className: "one-related",
            template: "relatedPageOneTemplate",
            events: {
                "click .remove-related": "removeRelated",
            },
            removeRelated: function () {
                var value = {
                    page_id: this.model.get("_id"),
                };
                this.trigger("remove:related", value);
            },
        });
        //Related pages view
        EntityViews.RelatedPagesView = Marionette.CompositeView.extend({
            template: "relatedPagesTemplate",
            childView: EntityViews.RelatedPageItemView,
            childViewContainer: "div.related-list",
            events: {
                "click .js-close, .js-done": "closeOverlay",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
        });
        //Block theme view
        EntityViews.BlockThemeView = Marionette.ItemView.extend({
            template: "blockThemeTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "click .content-header": "expandSection",
                "click .content-choose span": "selectOption",
                "click .block-themes .one-theme": "selectTheme",
                "click .js-copy-theme": "copyOrSaveTheme",
                "click .js-paste-theme": "pasteTheme",
                "click .js-save-theme": "copyOrSaveTheme",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
            expandSection: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("active")) {
                    $target.parent().children("div").addClass("u-hide");
                    $target.removeClass("active");
                } else {
                    this.$(".expand-section > div").addClass("u-hide");
                    this.$(".content-header").removeClass("active");
                    $target.parent().children("div").removeClass("u-hide");
                    $target.addClass("active");
                }
            },
            selectOption: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    $target.removeClass("selected");
                } else {
                    $target
                        .parent()
                        .children()
                        .removeClass("selected")
                        .removeClass("selected");
                    $target.addClass("selected");
                }
            },
            selectTheme: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    $target.removeClass("selected");
                } else {
                    this.$(".block-themes .one-theme").removeClass("selected");
                    $target.addClass("selected");
                }
            },
            pasteTheme: function (ev) {
                if (Cookies.get("theme")) {
                    var value = JSON.parse(Cookies.get("theme"));
                    var block_type = this.model.get("type");
                    //Fill values
                    //Color
                    if (value.color_bg) {
                        this.$(".color-bg").val(value.color_bg);
                    }
                    if (value.color_text) {
                        this.$(".color-text").val(value.color_text);
                    }
                    if (value.color_btn_bg) {
                        this.$(".color-btn-bg").val(value.color_btn_bg);
                    }
                    if (value.color_btn_text) {
                        this.$(".color-btn-text").val(value.color_btn_text);
                    }
                    //Theme
                    if (value.theme) {
                        this.$(".block-themes ." + value.theme).addClass(
                            "selected"
                        );
                    }
                    //Gradient
                    if (value.gradient_angle >= 0) {
                        this.$(".gradient-angle").val(value.gradient_angle);
                    }
                    if (value.gradient_start) {
                        this.$(".gradient-start").val(value.gradient_start);
                    }
                    if (value.gradient_middle) {
                        this.$(".gradient-middle").val(value.gradient_middle);
                    }
                    if (value.gradient_end) {
                        this.$(".gradient-end").val(value.gradient_end);
                    }
                    //Padding
                    if (value.padding_top >= 0) {
                        this.$(".padding-top").val(value.padding_top);
                    }
                    if (value.padding_right >= 0) {
                        this.$(".padding-right").val(value.padding_right);
                    }
                    if (value.padding_bottom >= 0) {
                        this.$(".padding-bottom").val(value.padding_bottom);
                    }
                    if (value.padding_left >= 0) {
                        this.$(".padding-left").val(value.padding_left);
                    }
                    if (value.padding_btn_top >= 0) {
                        this.$(".padding-btn-top").val(value.padding_btn_top);
                    }
                    if (value.padding_btn_right >= 0) {
                        this.$(".padding-btn-right").val(
                            value.padding_btn_right
                        );
                    }
                    if (value.padding_btn_bottom >= 0) {
                        this.$(".padding-btn-bottom").val(
                            value.padding_btn_bottom
                        );
                    }
                    if (value.padding_btn_left >= 0) {
                        this.$(".padding-btn-left").val(value.padding_btn_left);
                    }
                    //Margin]
                    if (value.margin_top >= 0) {
                        this.$(".margin-top").val(value.margin_top);
                    }
                    if (value.margin_right >= 0) {
                        this.$(".margin-right").val(value.margin_right);
                    }
                    if (value.margin_bottom >= 0) {
                        this.$(".margin-bottom").val(value.margin_bottom);
                    }
                    if (value.margin_left >= 0) {
                        this.$(".margin-left").val(value.margin_left);
                    }
                    if (value.margin_btn_top >= 0) {
                        this.$(".margin-btn-top").val(value.margin_btn_top);
                    }
                    if (value.margin_btn_right >= 0) {
                        this.$(".margin-btn-right").val(value.margin_btn_right);
                    }
                    if (value.margin_btn_bottom >= 0) {
                        this.$(".margin-btn-bottom").val(
                            value.margin_btn_bottom
                        );
                    }
                    if (value.margin_btn_left >= 0) {
                        this.$(".margin-btn-left").val(value.margin_btn_left);
                    }
                    //Border
                    if (value.border_top >= 0) {
                        this.$(".border-top").val(value.border_top);
                    }
                    if (value.border_right >= 0) {
                        this.$(".border-right").val(value.border_right);
                    }
                    if (value.border_bottom >= 0) {
                        this.$(".border-bottom").val(value.border_bottom);
                    }
                    if (value.border_left >= 0) {
                        this.$(".border-left").val(value.border_left);
                    }
                    if (value.border_color) {
                        this.$(".border-color").val(value.border_color);
                    }
                    if (value.border_radius >= 0) {
                        this.$(".border-radius").val(value.border_radius);
                    }
                    if (value.border_btn_top >= 0) {
                        this.$(".border-btn-top").val(value.border_btn_top);
                    }
                    if (value.border_btn_right >= 0) {
                        this.$(".border-btn-right").val(value.border_btn_right);
                    }
                    if (value.border_btn_bottom >= 0) {
                        this.$(".border-btn-bottom").val(
                            value.border_btn_bottom
                        );
                    }
                    if (value.border_btn_left >= 0) {
                        this.$(".border-btn-left").val(value.border_btn_left);
                    }
                    if (value.border_btn_color) {
                        this.$(".border-btn-color").val(value.border_btn_color);
                    }
                    if (value.border_btn_radius >= 0) {
                        this.$(".border-btn-radius").val(
                            value.border_btn_radius
                        );
                    }
                    //Text style and size
                    if (
                        block_type == "body_text" ||
                        block_type == "body_embed" ||
                        block_type == "logos" ||
                        block_type == "calendar" ||
                        block_type == "people" ||
                        block_type == "breather"
                    ) {
                        if (value.font_style) {
                            this.$(
                                ".style-select .choose-" + value.font_style
                            ).addClass("selected");
                        }
                        if (value.font_size) {
                            this.$(".font-size").val(value.font_size);
                        }
                        if (value.alignment) {
                            this.$(
                                ".alignment-select .choose-" + value.alignment
                            ).addClass("selected");
                        }
                    }
                    //Width
                    if (
                        block_type == "body_text" ||
                        block_type == "body_embed" ||
                        block_type == "logos" ||
                        block_type == "calendar" ||
                        block_type == "body_html"
                    ) {
                        if (value.width) {
                            var elementClass = ".choose-" + value.width;
                            this.$(elementClass).addClass("selected");
                        }
                        //Width percentage
                        if (value.width_pct) {
                            this.$(".width-pct").val(value.width_pct);
                        }
                    }
                    //Container view
                    if (block_type == "container" || block_type == "people") {
                        if (value.container_view) {
                            this.$(
                                ".view-select .choose-" + value.container_view
                            ).addClass("selected");
                        }
                    }
                    //Update label
                    var $target = $(ev.currentTarget);
                    $target.text("Pasted");
                    setTimeout(function () {
                        $target.text("Paste theme");
                    }, 300);
                } else {
                    return;
                }
            },
            copyOrSaveTheme: function (ev) {
                ev.preventDefault();
                //Width
                var value = {};
                if (this.$(".choose-full").hasClass("selected")) {
                    value.width = "full";
                } else if (this.$(".choose-two-third").hasClass("selected")) {
                    value.width = "two-third";
                } else if (this.$(".choose-half").hasClass("selected")) {
                    value.width = "half";
                } else if (this.$(".choose-one-third").hasClass("selected")) {
                    value.width = "one-third";
                } else {
                    value.width = "";
                }
                //Width percentage
                if (this.$(".width-pct").val().trim()) {
                    value.width_pct = parseInt(
                        this.$(".width-pct").val().trim()
                    );
                } else {
                    value.width_pct = 0;
                }
                //Color
                value.color_bg = this.$(".color-bg").val().trim();
                value.color_text = this.$(".color-text").val().trim();
                value.color_btn_bg = this.$(".color-btn-bg").val().trim();
                value.color_btn_text = this.$(".color-btn-text").val().trim();
                //Theme
                if (this.$(".block-themes .one-theme.selected").length) {
                    value.theme = this.$(
                        ".block-themes .one-theme.selected"
                    ).data("theme");
                } else {
                    value.theme = "";
                }
                //Gradient
                if (this.$(".gradient-angle").val().trim()) {
                    var gradient_angle = parseInt(
                        this.$(".gradient-angle").val().trim()
                    );
                    if (gradient_angle >= 0 && gradient_angle <= 360) {
                        value.gradient_angle = gradient_angle;
                    } else {
                        value.gradient_angle = "";
                    }
                } else {
                    value.gradient_angle = "";
                }
                value.gradient_start = this.$(".gradient-start").val().trim();
                value.gradient_middle = this.$(".gradient-middle").val().trim();
                value.gradient_end = this.$(".gradient-end").val().trim();
                //Padding
                if (this.$(".padding-top").val().trim()) {
                    value.padding_top = parseInt(
                        this.$(".padding-top").val().trim()
                    );
                } else {
                    value.padding_top = "";
                }
                if (this.$(".padding-right").val().trim()) {
                    value.padding_right = parseInt(
                        this.$(".padding-right").val().trim()
                    );
                } else {
                    value.padding_right = "";
                }
                if (this.$(".padding-bottom").val().trim()) {
                    value.padding_bottom = parseInt(
                        this.$(".padding-bottom").val().trim()
                    );
                } else {
                    value.padding_bottom = "";
                }
                if (this.$(".padding-left").val().trim()) {
                    value.padding_left = parseInt(
                        this.$(".padding-left").val().trim()
                    );
                } else {
                    value.padding_left = "";
                }
                if (this.$(".padding-btn-top").val().trim()) {
                    value.padding_btn_top = parseInt(
                        this.$(".padding-btn-top").val().trim()
                    );
                } else {
                    value.padding_btn_top = "";
                }
                if (this.$(".padding-btn-right").val().trim()) {
                    value.padding_btn_right = parseInt(
                        this.$(".padding-btn-right").val().trim()
                    );
                } else {
                    value.padding_btn_right = "";
                }
                if (this.$(".padding-btn-bottom").val().trim()) {
                    value.padding_btn_bottom = parseInt(
                        this.$(".padding-btn-bottom").val().trim()
                    );
                } else {
                    value.padding_btn_bottom = "";
                }
                if (this.$(".padding-btn-left").val().trim()) {
                    value.padding_btn_left = parseInt(
                        this.$(".padding-btn-left").val().trim()
                    );
                } else {
                    value.padding_btn_left = "";
                }
                //Margin
                if (this.$(".margin-top").val().trim()) {
                    value.margin_top = parseInt(
                        this.$(".margin-top").val().trim()
                    );
                } else {
                    value.margin_top = "";
                }
                if (this.$(".margin-right").val().trim()) {
                    value.margin_right = parseInt(
                        this.$(".margin-right").val().trim()
                    );
                } else {
                    value.margin_right = "";
                }
                if (this.$(".margin-bottom").val().trim()) {
                    value.margin_bottom = parseInt(
                        this.$(".margin-bottom").val().trim()
                    );
                } else {
                    value.margin_bottom = "";
                }
                if (this.$(".margin-left").val().trim()) {
                    value.margin_left = parseInt(
                        this.$(".margin-left").val().trim()
                    );
                } else {
                    value.margin_left = "";
                }
                if (this.$(".margin-btn-top").val().trim()) {
                    value.margin_btn_top = parseInt(
                        this.$(".margin-btn-top").val().trim()
                    );
                } else {
                    value.margin_btn_top = "";
                }
                if (this.$(".margin-btn-right").val().trim()) {
                    value.margin_btn_right = parseInt(
                        this.$(".margin-btn-right").val().trim()
                    );
                } else {
                    value.margin_btn_right = "";
                }
                if (this.$(".margin-btn-bottom").val().trim()) {
                    value.margin_btn_bottom = parseInt(
                        this.$(".margin-btn-bottom").val().trim()
                    );
                } else {
                    value.margin_btn_bottom = "";
                }
                if (this.$(".margin-btn-left").val().trim()) {
                    value.margin_btn_left = parseInt(
                        this.$(".margin-btn-left").val().trim()
                    );
                } else {
                    value.margin_btn_left = "";
                }
                //Border
                if (this.$(".border-top").val().trim()) {
                    value.border_top = parseInt(
                        this.$(".border-top").val().trim()
                    );
                } else {
                    value.border_top = "";
                }
                if (this.$(".border-right").val().trim()) {
                    value.border_right = parseInt(
                        this.$(".border-right").val().trim()
                    );
                } else {
                    value.border_right = "";
                }
                if (this.$(".border-bottom").val().trim()) {
                    value.border_bottom = parseInt(
                        this.$(".border-bottom").val().trim()
                    );
                } else {
                    value.border_bottom = "";
                }
                if (this.$(".border-left").val().trim()) {
                    value.border_left = parseInt(
                        this.$(".border-left").val().trim()
                    );
                } else {
                    value.border_left = "";
                }
                value.border_color = this.$(".border-color").val().trim();
                if (this.$(".border-radius").val().trim()) {
                    value.border_radius = parseInt(
                        this.$(".border-radius").val().trim()
                    );
                } else {
                    value.border_radius = "";
                }
                //Button border
                if (this.$(".border-btn-top").val().trim()) {
                    value.border_btn_top = parseInt(
                        this.$(".border-btn-top").val().trim()
                    );
                } else {
                    value.border_btn_top = "";
                }
                if (this.$(".border-btn-right").val().trim()) {
                    value.border_btn_right = parseInt(
                        this.$(".border-btn-right").val().trim()
                    );
                } else {
                    value.border_btn_right = "";
                }
                if (this.$(".border-btn-bottom").val().trim()) {
                    value.border_btn_bottom = parseInt(
                        this.$(".border-btn-bottom").val().trim()
                    );
                } else {
                    value.border_btn_bottom = "";
                }
                if (this.$(".border-btn-left").val().trim()) {
                    value.border_btn_left = parseInt(
                        this.$(".border-btn-left").val().trim()
                    );
                } else {
                    value.border_btn_left = "";
                }
                value.border_btn_color = this.$(".border-btn-color")
                    .val()
                    .trim();
                if (this.$(".border-btn-radius").val().trim()) {
                    value.border_btn_radius = parseInt(
                        this.$(".border-btn-radius").val().trim()
                    );
                } else {
                    value.border_btn_radius = "";
                }
                //Text style
                if (this.$(".choose-regular").hasClass("selected")) {
                    value.font_style = "regular";
                } else if (this.$(".choose-italic").hasClass("selected")) {
                    value.font_style = "italic";
                } else if (this.$(".choose-bold").hasClass("selected")) {
                    value.font_style = "bold";
                } else if (this.$(".choose-bolditalic").hasClass("selected")) {
                    value.font_style = "bolditalic";
                } else {
                    value.font_style = "";
                }
                //Alignment
                if (this.$(".choose-left").hasClass("selected")) {
                    value.alignment = "left";
                } else if (this.$(".choose-center").hasClass("selected")) {
                    value.alignment = "center";
                } else if (this.$(".choose-right").hasClass("selected")) {
                    value.alignment = "right";
                } else {
                    value.alignment = "";
                }
                //Text size
                if (this.$(".font-size").val().trim()) {
                    value.font_size = parseInt(
                        this.$(".font-size").val().trim()
                    );
                } else {
                    value.font_size = "";
                }
                //View as
                if (this.$(".choose-card").hasClass("selected")) {
                    value.container_view = "card";
                } else if (this.$(".choose-list").hasClass("selected")) {
                    value.container_view = "list";
                } else if (this.$(".choose-mixed").hasClass("selected")) {
                    value.container_view = "mixed";
                } else if (this.$(".choose-carousel").hasClass("selected")) {
                    value.container_view = "carousel";
                } else {
                    value.container_view = "";
                }
                //Copy or save
                var $target = $(ev.currentTarget);
                if ($target.hasClass("js-copy-theme")) {
                    $target.text("Copied");
                    //Save in cookies
                    Cookies.set("theme", JSON.stringify(value), { expires: 7 });
                } else {
                    //Update
                    this.trigger("update:theme", value);
                }
            },
        });
        //Article tag item view
        EntityViews.ArticleTagItemView = Marionette.ItemView.extend({
            tagName: "div",
            className: "one-tag",
            template: "articleTagOneTemplate",
            events: {
                "click .remove-tag": "removeRelated",
            },
            removeRelated: function () {
                var value = {
                    tag_id: this.model.get("_id"),
                    tag_name: this.model.get("name"),
                };
                this.trigger("remove:tag", value);
            },
        });
        //Block tags view
        EntityViews.BlockTagsView = Marionette.CompositeView.extend({
            template: "blockTagsTemplate",
            childView: EntityViews.ArticleTagItemView,
            childViewContainer: "div.tag-list",
            events: {
                "click .js-close, .js-done": "closeOverlay",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
        });
        //Article tags view
        EntityViews.ArticleTagsView = Marionette.CompositeView.extend({
            template: "articleTagsTemplate",
            childView: EntityViews.ArticleTagItemView,
            childViewContainer: "div.tag-list",
            events: {
                "click .js-close, .js-done": "closeOverlay",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
        });
        //Site settings view
        EntityViews.SettingsView = Marionette.ItemView.extend({
            tagName: "div",
            className: "contentForm settings-panel",
            template: "settingsTemplate",
            events: {
                "click .js-update-settings": "updateSiteSettings",
                "keydown .site-admin": "addAdmin",
                "click .remove-admin": "removeAdmin",
            },
            updateSiteSettings: function (ev) {
                ev.preventDefault();
                if (this.$(".site-title").val().trim()) {
                    var value = {
                        title: this.$(".site-title").val().trim(),
                        desc: this.$(".site-desc").val().trim(),
                        contact: this.$(".site-contact").val(),
                        menu: this.$(".site-menu").val(),
                        facebook: this.$(".site-facebook").val().trim(),
                        twitter: this.$(".site-twitter").val().trim(),
                        instagram: this.$(".site-instagram").val().trim(),
                        youtube: this.$(".site-youtube").val().trim(),
                        linkedin: this.$(".site-linkedin").val().trim(),
                        meta: this.$(".site-image-meta").val().trim(),
                        notice_desc: this.$(".site-notice-desc").val().trim(),
                        notice_link: this.$(".site-notice-link").val().trim(),
                        theme: this.$(".site-theme").val().trim(),
                        back_color: this.$(".site-back-color").val().trim(),
                        text_color: this.$(".site-text-color").val().trim(),
                    };
                    //Ticker
                    if (this.$(".site-ticker").val().trim()) {
                        var ticker_data = this.$(".site-ticker").val().trim();
                        var all_tickers = ticker_data.split(";");
                        var tickers = [];
                        for (var i = 0; i < all_tickers.length; i++) {
                            var ticker_title = all_tickers[i]
                                .split(",")[0]
                                .trim();
                            var ticker_url = all_tickers[i]
                                .split(",")[1]
                                .trim();
                            tickers.push({
                                title: ticker_title,
                                url: ticker_url,
                            });
                            value.ticker = tickers;
                        }
                    } else {
                        value.ticker = "";
                    }
                    //Base number of kindness stories
                    if (this.$(".site-kindness").val().trim()) {
                        value.base_stories = parseInt(
                            this.$(".site-kindness").val().trim()
                        );
                    }
                    this.trigger("update:site", value);
                } else {
                    this.$(".site-title").focus();
                }
            },
            addAdmin: function (ev) {
                ev.stopPropagation();
                var $target = $(ev.target);
                if (
                    ev.keyCode == ENTER_KEY &&
                    !ev.shiftKey &&
                    $target.val().trim()
                ) {
                    ev.preventDefault();
                    var value = {
                        email: $target.val().replace(/\s+/g, ""),
                    };
                    this.trigger("add:admin", value);
                } else {
                    return;
                }
            },
            removeAdmin: function (ev) {
                ev.preventDefault();
                var $target = $(ev.currentTarget);
                var value = {
                    email: $target.prev().children("span").text(),
                };
                if (
                    confirm(
                        "Are you sure you want to revoke admin privileges of " +
                            value.email +
                            "?"
                    )
                ) {
                    $target.parent().remove();
                    this.trigger("remove:admin", value);
                }
            },
        });
        //File item view
        EntityViews.SelectImageItemView = Marionette.ItemView.extend({
            template: "selectImageItemTemplate",
            className: "one-item one-select-item",
            events: {
                click: "getImageURL",
            },
            getImageURL: function (ev) {
                ev.preventDefault();
                var image_url = this.model.get("image").l;
                $(".js-select-image.selected").val(image_url);
            },
        });
        //Select image view
        EntityViews.SelectImageView = Marionette.CompositeView.extend({
            template: "selectImageTemplate",
            childView: EntityViews.SelectImageItemView,
            childViewContainer: "div.all-items",
            events: {
                "click .js-close": "closeModal",
                "click #drop": "openFileBrowser",
                "click .file-input": "doNothing",
            },
            closeModal: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:modal");
            },
            openFileBrowser: function (ev) {
                this.$(".upload-file .file-input").click();
            },
            doNothing: function (ev) {
                ev.stopPropagation();
            },
        });
        //Add to folder view
        EntityViews.AddToFolderView = Marionette.ItemView.extend({
            template: "addToFolderTemplate",
            events: {
                "click .js-close": "closeOverlay",
                "click .content-choose span": "selectType",
                "click .js-save-folder": "saveFolder",
            },
            closeOverlay: function (ev) {
                ev.preventDefault();
                DashManager.commands.execute("close:overlay");
            },
            selectType: function (ev) {
                var $target = $(ev.currentTarget);
                if ($target.hasClass("selected")) {
                    $target.removeClass("selected");
                } else {
                    this.$(".content-choose span").removeClass("selected");
                    $target.addClass("selected");
                }
                //If new folder
                if (this.$(".choose-new").hasClass("selected")) {
                    this.$(".folder-existing").addClass("u-hide");
                    this.$(".folder-new, .folder-save").removeClass("u-hide");
                    this.$(".folder-title").focus();
                } else if (this.$(".choose-outside").hasClass("selected")) {
                    this.$(".folder-existing, .folder-new").addClass("u-hide");
                    this.$(".folder-save").removeClass("u-hide");
                } else {
                    this.$(".folder-new, .folder-save").addClass("u-hide");
                    this.$(".folder-existing").removeClass("u-hide");
                    this.$(".folder-search").focus();
                }
            },
            saveFolder: function (ev) {
                ev.preventDefault();
                if (this.$(".choose-new").hasClass("selected")) {
                    var value = {
                        title: this.$(".folder-title").val().trim(),
                    };
                    this.trigger("save:folder", value);
                } else if (this.$(".choose-outside").hasClass("selected")) {
                    this.trigger("move:outside");
                }
            },
        });
        //One activity view
        EntityViews.ActivityItemView = Marionette.ItemView.extend({
            className: "one-activity",
            template: "logOneTemplate",
        });
        //Activity for each date
        EntityViews.ActivityDateView = Marionette.CompositeView.extend({
            className: "activity-date",
            template: "logDateTemplate",
            childView: EntityViews.ActivityItemView,
            childViewContainer: "div.date-activities",
            initialize: function () {
                var activities = this.model.get("activities");
                this.collection = new Backbone.Collection(activities);
            },
        });
        //Activities View
        EntityViews.ActivitiesView = Marionette.CompositeView.extend({
            template: "logManyTemplate",
            childView: EntityViews.ActivityDateView,
            childViewContainer: "div.all-items",
        });
    }
);
//Common Views of the application - Loading
DashManager.module(
    "Common.Views",
    function (Views, DashManager, Backbone, Marionette, $, _) {
        //Loading page
        Views.Loading = Marionette.ItemView.extend({
            tagName: "div",
            className: "loading-area",
            template: "loadingTemplate",
        });
    }
);
//Controllers of the Application
DashManager.module(
    "DashApp.EntityController",
    function (EntityController, DashManager, Backbone, Marionette, $, _) {
        EntityController.Controller = {
            showNewPageOverlay: function () {
                $(".overlay").show();
                //New page view
                var newPageView =
                    new DashManager.DashApp.EntityViews.NewPageView();
                //Show
                newPageView.on("show", function () {
                    //Animate overlay box
                    setTimeout(function () {
                        newPageView.$(".overlay-box").addClass("animate");
                    }, 100);
                    //Hide scroll on main page
                    DashManager.commands.execute("show:overlay");
                    //Focus
                    newPageView.$(".page-title").focus();
                });
                //Save
                newPageView.on("save:page", function (value) {
                    var new_page = new DashManager.Entities.Page({
                        title: value.title,
                        desc: value.desc,
                        url: value.url,
                        ref_url: value.ref_url,
                        image: value.image,
                        meta: value.meta,
                        order: value.order,
                        level: value.level,
                        category: value.category,
                    });
                    new_page.save(
                        {},
                        {
                            success: function () {
                                DashManager.vent.trigger("add:page", new_page);
                                DashManager.commands.execute("close:overlay");
                            },
                        }
                    );
                });
                DashManager.overlayRegion.show(newPageView);
            },
            showEditPageOverlay: function (page_id) {
                $(".overlay").show();
                //Fetch page
                var fetchingPage = DashManager.request("page:entity", page_id);
                $.when(fetchingPage).done(function (page) {
                    var newPageView =
                        new DashManager.DashApp.EntityViews.NewPageView();
                    //Show
                    newPageView.on("show", function () {
                        //Add edit class
                        newPageView.$(".overlay-box").addClass("edit-box");
                        //Animate overlay box
                        setTimeout(function () {
                            newPageView.$(".overlay-box").addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        DashManager.commands.execute("show:overlay");
                        newPageView.$(".js-delete-page").removeClass("u-hide");
                        //Archive
                        if (page.get("about").is_archived) {
                            newPageView
                                .$(".archive-btn")
                                .removeClass("js-archive-page")
                                .addClass("js-unarchive-page")
                                .text("Unarchive");
                        }
                        newPageView.$(".archive-btn").removeClass("u-hide");
                        //Fill values
                        newPageView
                            .$(".page-title")
                            .val(page.get("about").title)
                            .focus();
                        newPageView.$(".page-desc").val(page.get("about").desc);
                        newPageView.$(".page-url").val(page.get("about").url);
                        newPageView
                            .$(".page-ref-url")
                            .val(page.get("about").ref_url);
                        if (page.get("about").image) {
                            newPageView
                                .$(".page-image")
                                .val(page.get("about").image.m);
                            newPageView
                                .$(".page-meta")
                                .val(page.get("about").image.meta);
                        }
                        //Menu
                        newPageView
                            .$(".page-custom-menu")
                            .removeClass("u-hide");
                        if (page.get("about").menu) {
                            newPageView
                                .$(".page-menu")
                                .val(page.get("about").menu.text);
                        }
                        //Show category
                        var category = page.get("about").category;
                        if (category == "institute") {
                            newPageView
                                .$(".choose-institute")
                                .addClass("selected");
                        } else if (category == "newsroom") {
                            newPageView
                                .$(".choose-newsroom")
                                .addClass("selected");
                        } else if (category == "project") {
                            newPageView
                                .$(".choose-project")
                                .addClass("selected");
                            newPageView
                                .$(".page-custom-url")
                                .removeClass("u-hide");
                            newPageView.$(".page-other").removeClass("u-hide");
                        } else if (category == "event") {
                            newPageView.$(".choose-event").addClass("selected");
                            newPageView
                                .$(".page-custom-url")
                                .removeClass("u-hide");
                        } else if (category == "external") {
                            newPageView
                                .$(".choose-external")
                                .addClass("selected");
                            newPageView.$(".page-ref").removeClass("u-hide");
                            newPageView
                                .$(".page-custom-url, .page-desc, .page-images")
                                .addClass("u-hide");
                        } else {
                            newPageView
                                .$(".page-custom-url")
                                .removeClass("u-hide");
                        }
                    });
                    //Update page
                    newPageView.on("update:page", function (value) {
                        var edit_page = new DashManager.Entities.Page({
                            _id: page_id,
                            _action: "edit",
                        });
                        edit_page.set({
                            title: value.title,
                            desc: value.desc,
                            url: value.url,
                            ref_url: value.ref_url,
                            image: value.image,
                            meta: value.meta,
                            menu: value.menu,
                            order: value.order,
                            level: value.level,
                            category: value.category,
                        });
                        edit_page.save(
                            {},
                            {
                                success: function () {
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                },
                            }
                        );
                    });
                    //Archive page
                    newPageView.on("archive:page", function (value) {
                        var edit_page = new DashManager.Entities.Page({
                            _id: page_id,
                            _action: "archive",
                        });
                        edit_page.set({});
                        edit_page.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    $(".selected-item").addClass("is-archived");
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                },
                            }
                        );
                    });
                    //Unarchive page
                    newPageView.on("unarchive:page", function (value) {
                        var edit_page = new DashManager.Entities.Page({
                            _id: page_id,
                            _action: "unarchive",
                        });
                        edit_page.set({});
                        edit_page.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    $(".selected-item").removeClass(
                                        "is-archived"
                                    );
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                },
                            }
                        );
                    });
                    //Delete page
                    newPageView.on("delete:page", function (value) {
                        var page = new DashManager.Entities.Page({
                            _id: page_id,
                        });
                        page.destroy({
                            dataType: "text",
                            success: function (model, response) {
                                DashManager.commands.execute("close:overlay");
                                DashManager.vent.trigger(
                                    "remove:page",
                                    page_id
                                );
                            },
                        });
                    });
                    DashManager.overlayRegion.show(newPageView);
                });
            },
            showPages: function (type, text) {
                $(window).off("scroll", scrollHandler);
                //Show search bar
                $(".searchWrap").removeClass("u-hide");
                //Show loading page
                var loadingView = new DashManager.Common.Views.Loading();
                DashManager.mainRegion.show(loadingView);
                //Select
                $(".nav-links a").removeClass("selected");
                $(".nav-links .js-pages").addClass("selected");
                //Fetching pages
                if (type == "search") {
                    var fetchingPages = DashManager.request(
                        "search:entities",
                        "pages",
                        text
                    );
                } else {
                    var fetchingPages = DashManager.request(
                        "page:entities",
                        "all"
                    );
                }
                //Fetch
                $.when(fetchingPages).done(function (pages) {
                    var pagesView =
                        new DashManager.DashApp.EntityViews.PagesView({
                            collection: pages,
                        });
                    //Add page
                    DashManager.vent.off("add:page");
                    DashManager.vent.on("add:page", function (page) {
                        var order = page.get("order");
                        pages.add(page, { at: order });
                    });
                    //Remove page
                    DashManager.vent.off("remove:page");
                    DashManager.vent.on("remove:page", function (page_id) {
                        var page = pages.get(page_id);
                        pages.remove(page);
                    });
                    //Move up
                    pagesView.on(
                        "childview:move:up",
                        function (childView, model) {
                            var page = new DashManager.Entities.Page({
                                _id: model.get("_id"),
                                _action: "move_up",
                            });
                            page.set({});
                            page.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        var index =
                                            pagesView.collection.indexOf(model);
                                        if (index) {
                                            //Remove page
                                            pagesView.collection.remove(model);
                                            //Add model at index-1
                                            pagesView.collection.add(model, {
                                                at: index - 1,
                                            });
                                            //Get new childView
                                            var level = model.get("level");
                                            var pageView =
                                                pagesView.children.findByModel(
                                                    model
                                                );
                                            //Update margin
                                            var margin =
                                                (level - 1) * 15 + "px";
                                            pageView.$el.css(
                                                "marginLeft",
                                                margin
                                            );
                                            //Update order
                                            var order =
                                                pageView.$el.data("order");
                                            pageView.$el.attr(
                                                "data-order",
                                                order - 1
                                            );
                                            pageView.$el
                                                .next()
                                                .attr("data-order", order);
                                        }
                                    },
                                }
                            );
                        }
                    );
                    //Move down
                    pagesView.on(
                        "childview:move:down",
                        function (childView, model) {
                            var page = new DashManager.Entities.Page({
                                _id: model.get("_id"),
                                _action: "move_down",
                            });
                            page.set({});
                            page.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        var index =
                                            pagesView.collection.indexOf(model);
                                        //Remove page
                                        pagesView.collection.remove(model);
                                        //Add model at index+1
                                        pagesView.collection.add(model, {
                                            at: index + 1,
                                        });
                                        //Get new childView
                                        var level = model.get("level");
                                        var pageView =
                                            pagesView.children.findByModel(
                                                model
                                            );
                                        //Update margin
                                        var margin = (level - 1) * 15 + "px";
                                        pageView.$el.css("marginLeft", margin);
                                        //Update order
                                        var order = pageView.$el.data("order");
                                        pageView.$el.attr(
                                            "data-order",
                                            order + 1
                                        );
                                        pageView.$el
                                            .prev()
                                            .attr("data-order", order);
                                    },
                                }
                            );
                        }
                    );
                    DashManager.mainRegion.show(pagesView);
                });
            },
            showPageBlocks: function (page_id) {
                //Hide search bar
                $(".searchWrap").addClass("u-hide");
                //Fetch page
                var fetchingPage = DashManager.request("page:entity", page_id);
                $.when(fetchingPage).done(function (page) {
                    var pageBlocksView =
                        new DashManager.DashApp.EntityViews.PageBlocksView({
                            model: page,
                        });
                    //Show
                    pageBlocksView.on("show", function () {});
                    //Move up
                    pageBlocksView.on(
                        "childview:move:up",
                        function (childView, model) {
                            var block = new DashManager.Entities.Block({
                                _id: model.get("_id"),
                                _action: "move_up",
                            });
                            block.set({});
                            block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        var index =
                                            pageBlocksView.collection.indexOf(
                                                model
                                            );
                                        if (index) {
                                            //Remove block
                                            pageBlocksView.collection.remove(
                                                model
                                            );
                                            //Add model at index-1
                                            pageBlocksView.collection.add(
                                                model,
                                                { at: index - 1 }
                                            );
                                            //Get new childView
                                            var blockView =
                                                pageBlocksView.children.findByModel(
                                                    model
                                                );
                                            //Update order
                                            var order =
                                                blockView.$el.data("order");
                                            blockView.$el.attr(
                                                "data-order",
                                                order - 1
                                            );
                                            blockView.$el
                                                .next()
                                                .attr("data-order", order);
                                        }
                                    },
                                }
                            );
                        }
                    );
                    //Move down
                    pageBlocksView.on(
                        "childview:move:down",
                        function (childView, model) {
                            var block = new DashManager.Entities.Block({
                                _id: model.get("_id"),
                                _action: "move_down",
                            });
                            block.set({});
                            block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        var index =
                                            pageBlocksView.collection.indexOf(
                                                model
                                            );
                                        //Remove block
                                        pageBlocksView.collection.remove(model);
                                        //Add model at index+1
                                        pageBlocksView.collection.add(model, {
                                            at: index + 1,
                                        });
                                        //Get new childView
                                        var blockView =
                                            pageBlocksView.children.findByModel(
                                                model
                                            );
                                        //Update order
                                        var order = blockView.$el.data("order");
                                        blockView.$el.attr(
                                            "data-order",
                                            order + 1
                                        );
                                        blockView.$el
                                            .prev()
                                            .attr("data-order", order);
                                    },
                                }
                            );
                        }
                    );
                    //Move subblock up
                    pageBlocksView.on(
                        "childview:childview:move:up",
                        function (childView, model, options) {
                            var block = new DashManager.Entities.Block({
                                _id: options.block_id,
                                _container: options.container_id,
                                _action: "move_up",
                            });
                            block.set({});
                            block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        location.reload();
                                    },
                                }
                            );
                        }
                    );
                    //Move subblock down
                    pageBlocksView.on(
                        "childview:childview:move:down",
                        function (childView, model, options) {
                            var block = new DashManager.Entities.Block({
                                _id: options.block_id,
                                _container: options.container_id,
                                _action: "move_down",
                            });
                            block.set({});
                            block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        location.reload();
                                    },
                                }
                            );
                        }
                    );
                    //Add block
                    DashManager.vent.off("add:block");
                    DashManager.vent.on("add:block", function (block) {
                        var order = block.get("order");
                        pageBlocksView.collection.add(block, { at: order });
                    });
                    //Remove block
                    DashManager.vent.off("remove:block");
                    DashManager.vent.on("remove:block", function () {
                        location.reload();
                    });
                    DashManager.mainRegion.show(pageBlocksView);
                });
            },
            showAllBlocksOverlay: function (showSubBlocks) {
                $(".overlay").show();
                //All blocks view
                var allBlocksView =
                    new DashManager.DashApp.EntityViews.AllBlocksView();
                //Show
                allBlocksView.on("show", function () {
                    //Animate overlay box
                    setTimeout(function () {
                        allBlocksView.$(".overlay-box").addClass("animate");
                    }, 100);
                    //Hide scroll on main page
                    DashManager.commands.execute("show:overlay");
                    //Show only sub blocks
                    if (showSubBlocks) {
                        allBlocksView
                            .$(".all-blocks-panel .content-text")
                            .addClass("u-hide");
                        allBlocksView.$(".block-list > div").addClass("u-hide");
                        allBlocksView
                            .$(
                                ".body-t-block, .body-h-block, .body-e-block, .logos-block, .calendar-block"
                            )
                            .removeClass("u-hide");
                        allBlocksView
                            .$(
                                ".area-header-blocks, .area-section-blocks, .area-carousel-blocks"
                            )
                            .addClass("u-hide");
                        //Show relevant blocks
                        allBlocksView
                            .$(".area-content-blocks .content-text")
                            .html(
                                "Content blocks: <em>Add text or embed other blocks</em>"
                            )
                            .removeClass("u-hide");
                        allBlocksView
                            .$(".area-other-blocks .content-text")
                            .html("Other blocks: <em>Logos and calendar</em>")
                            .removeClass("u-hide");
                    }
                });
                DashManager.overlayRegion.show(allBlocksView);
            },
            showNewBlockOverlay: function (type) {
                var excluded_ids = [];
                //New block view
                var newBlockView =
                    new DashManager.DashApp.EntityViews.NewBlockView();
                //Editor
                var richTextEditorFiles = [];
                //Show
                newBlockView.on("show", function () {
                    newBlockView.$(".overlay-box").addClass("animate");
                    //Add data type
                    newBlockView.$(".new-block-panel").data("type", type);
                    //Show section based on type
                    switch (type) {
                        case "header":
                            //Default header
                            newBlockView
                                .$(".new-block-panel .block-header")
                                .removeClass("u-hide");
                            //Update main text
                            newBlockView
                                .$(".block-header .main-text")
                                .text("Default header:");
                            //Show image
                            newBlockView
                                .$(".block-header .area-image")
                                .removeClass("u-hide");
                            //Show story
                            newBlockView
                                .$(".block-header .area-story")
                                .removeClass("u-hide");
                            //Focus on title
                            newBlockView
                                .$(".block-header .header-title")
                                .focus();
                            break;
                        case "header_video":
                            //Header with video
                            newBlockView
                                .$(".new-block-panel .block-header")
                                .removeClass("u-hide");
                            //Update main text
                            newBlockView
                                .$(".block-header .main-text")
                                .text("Header with video/embed:");
                            //Show embed
                            newBlockView
                                .$(".block-header .area-embed")
                                .removeClass("u-hide");
                            //Focus on title
                            newBlockView
                                .$(".block-header .header-title")
                                .focus();
                            break;
                        case "header_bg":
                            //Header with background image
                            newBlockView
                                .$(".new-block-panel .block-header")
                                .removeClass("u-hide");
                            //Update main text
                            newBlockView
                                .$(".block-header .main-text")
                                .text("Header with background image:");
                            //Show image
                            newBlockView
                                .$(".block-header .area-image")
                                .removeClass("u-hide");
                            //Focus on title
                            newBlockView
                                .$(".block-header .header-title")
                                .focus();
                            break;
                        case "header_media":
                            //Header with center-aligned media
                            newBlockView
                                .$(".new-block-panel .block-header")
                                .removeClass("u-hide");
                            //Update main text
                            newBlockView
                                .$(".block-header .main-text")
                                .text("Header with a hero image/video/embed:");
                            //Show image
                            newBlockView
                                .$(".block-header .area-image")
                                .removeClass("u-hide");
                            //Show embed
                            newBlockView
                                .$(".block-header .area-embed")
                                .removeClass("u-hide");
                            //Focus on title
                            newBlockView
                                .$(".block-header .header-title")
                                .focus();
                            break;
                        case "section":
                            //Default section
                            newBlockView
                                .$(".new-block-panel .block-section")
                                .removeClass("u-hide");
                            //Update main text
                            newBlockView
                                .$(".block-section .main-text")
                                .text("Default section:");
                            //Focus on title
                            newBlockView
                                .$(".block-section .section-title")
                                .focus();
                            break;
                        case "section_basic":
                            //Basic section
                            newBlockView
                                .$(".new-block-panel .block-section")
                                .removeClass("u-hide");
                            //Update main text
                            newBlockView
                                .$(".block-section .main-text")
                                .text("Text section:");
                            //Focus on title
                            newBlockView
                                .$(".block-section .section-title")
                                .focus();
                            break;
                        case "section_media":
                            //Section with media
                            newBlockView
                                .$(".new-block-panel .block-section")
                                .removeClass("u-hide");
                            //Update main text
                            newBlockView
                                .$(".block-section .main-text")
                                .text("Section with text, image or video:");
                            //Show image
                            newBlockView
                                .$(".block-section .area-image")
                                .removeClass("u-hide");
                            //Show embed
                            newBlockView
                                .$(".block-section .area-embed")
                                .removeClass("u-hide");
                            //Show orientation
                            newBlockView
                                .$(".block-section .area-orientation")
                                .removeClass("u-hide");
                            //Focus on title
                            newBlockView
                                .$(".block-section .section-title")
                                .focus();
                            break;
                        case "section_list":
                            //Section with a list of items
                            newBlockView
                                .$(".new-block-panel .block-section")
                                .removeClass("u-hide");
                            //Update main text
                            newBlockView
                                .$(".block-section .main-text")
                                .text("Section with a list of items:");
                            //Show image
                            newBlockView
                                .$(".block-section .area-image")
                                .removeClass("u-hide");
                            //Show embed
                            newBlockView
                                .$(".block-section .area-embed")
                                .removeClass("u-hide");
                            //Show items
                            newBlockView
                                .$(".block-section .area-items")
                                .removeClass("u-hide");
                            //Focus on title
                            newBlockView
                                .$(".block-section .section-title")
                                .focus();
                            break;
                        case "container":
                            //Container
                            newBlockView
                                .$(".new-block-panel .block-container")
                                .removeClass("u-hide");
                            break;
                        case "body_text":
                            //Body text block
                            newBlockView
                                .$(".new-block-panel .block-body-t")
                                .removeClass("u-hide");
                            //Focus on title
                            newBlockView
                                .$(".block-body-t .body-t-title")
                                .focus();
                            break;
                        case "body_html":
                            //Body HTML block
                            newBlockView
                                .$(".new-block-panel .block-body-h")
                                .removeClass("u-hide");
                            //Editor
                            $R(".body-h-content", {
                                focus: true,
                                toolbarFixedTarget: ".overlay",
                                buttons: editor_btns,
                                plugins: editor_plugins,
                                formatting: editor_formatting,
                                imageUpload: "/api/upload",
                                callbacks: {
                                    image: {
                                        uploaded: function (image, response) {
                                            richTextEditorFiles.push(
                                                response.file.url
                                            );
                                        },
                                    },
                                },
                            });
                            break;
                        case "body_embed":
                            //Body embed block
                            newBlockView
                                .$(".new-block-panel .block-body-e")
                                .removeClass("u-hide");
                            //Focus on embed
                            newBlockView
                                .$(".block-body-e .body-e-embed")
                                .focus();
                            break;
                        case "body_carousel":
                            //Default carousel
                            newBlockView
                                .$(".new-block-panel .block-body-c")
                                .removeClass("u-hide");
                            //Update main text
                            newBlockView
                                .$(".block-body-c .main-text")
                                .text("Default carousel:");
                            //Show link
                            newBlockView
                                .$(".block-body-c .area-link")
                                .removeClass("u-hide");
                            //Focus on title
                            newBlockView
                                .$(".block-body-c .body-c-title")
                                .focus();
                            break;
                        case "body_carousel_text":
                            //Text carousel
                            newBlockView
                                .$(".new-block-panel .block-body-c")
                                .removeClass("u-hide");
                            //Update main text
                            newBlockView
                                .$(".block-body-c .main-text")
                                .text("Text and media carousel:");
                            //Show description
                            newBlockView
                                .$(".block-body-c .body-c-desc")
                                .removeClass("u-hide");
                            //Show btns
                            newBlockView
                                .$(".block-body-c .area-btns")
                                .removeClass("u-hide");
                            //Show embed
                            newBlockView
                                .$(".block-body-c .area-embed")
                                .removeClass("u-hide");
                            //Focus on title
                            newBlockView
                                .$(".block-body-c .body-c-title")
                                .focus();
                            break;
                        case "people":
                            //People block
                            newBlockView
                                .$(".new-block-panel .block-people")
                                .removeClass("u-hide");
                            //Typeahead for persons
                            //Remote fetch person list
                            var personList = new Bloodhound({
                                datumTokenizer:
                                    Bloodhound.tokenizers.obj.whitespace(
                                        "value"
                                    ),
                                queryTokenizer:
                                    Bloodhound.tokenizers.obj.whitespace,
                                remote: {
                                    url: "/api/search/persons?text=%QUERY&excluded=%EXCLUDED",
                                    replace: function (url) {
                                        return url
                                            .replace(
                                                "%EXCLUDED",
                                                JSON.stringify(excluded_ids)
                                            )
                                            .replace(
                                                "%QUERY",
                                                newBlockView
                                                    .$(".person-input.tt-input")
                                                    .val()
                                            );
                                    },
                                    filter: function (parsedResponse) {
                                        return parsedResponse;
                                    },
                                },
                            });
                            //Initialize personlist
                            personList.initialize();
                            //Show typeahead
                            newBlockView.$(".person-input").typeahead(
                                {
                                    hint: true,
                                    highlight: true,
                                    minLength: 1,
                                },
                                {
                                    name: "email",
                                    displayKey: "name",
                                    limit: 5,
                                    source: personList.ttAdapter(),
                                    templates: {
                                        empty: [
                                            '<div class="no-find">',
                                            "No such user exists. Add new in People tab.",
                                            "</div>",
                                        ].join("\n"),
                                        suggestion: Handlebars.compile(
                                            "<p class='name'>{{name}}</p><p class='email'>{{email}}</p>"
                                        ),
                                    },
                                }
                            );
                            //Focus
                            newBlockView.$(".person-input").focus();
                            //Add new person on typeahead autocomplete
                            newBlockView
                                .$(".person-input")
                                .on(
                                    "typeahead:selected typeahead:autocompleted",
                                    function (e, datum) {
                                        var $input =
                                            newBlockView.$(".person-input");
                                        $input.typeahead("val", "").focus();
                                        newBlockView
                                            .$(".persons-list")
                                            .append(
                                                "<div class='one-person' data-id='" +
                                                    datum._id +
                                                    "'><p class='name'>" +
                                                    datum.name +
                                                    "<br><span>" +
                                                    datum.email +
                                                    "</span></p><span class='remove-person u-delete'>Remove</span></div>"
                                            );
                                        excluded_ids.push(datum._id);
                                    }
                                );
                            break;
                        case "logos":
                            //Logos block
                            newBlockView
                                .$(".new-block-panel .block-logos")
                                .removeClass("u-hide");
                            //Typeahead for partners
                            //Remote fetch partner list
                            var partnerList = new Bloodhound({
                                datumTokenizer:
                                    Bloodhound.tokenizers.obj.whitespace(
                                        "value"
                                    ),
                                queryTokenizer:
                                    Bloodhound.tokenizers.obj.whitespace,
                                remote: {
                                    url: "/api/search/partners?text=%QUERY&excluded=%EXCLUDED",
                                    replace: function (url) {
                                        return url
                                            .replace(
                                                "%EXCLUDED",
                                                JSON.stringify(excluded_ids)
                                            )
                                            .replace(
                                                "%QUERY",
                                                newBlockView
                                                    .$(
                                                        ".partner-input.tt-input"
                                                    )
                                                    .val()
                                            );
                                    },
                                    filter: function (parsedResponse) {
                                        return parsedResponse;
                                    },
                                },
                            });
                            //Initialize partnerList
                            partnerList.initialize();
                            //Show typeahead
                            newBlockView.$(".partner-input").typeahead(
                                {
                                    hint: true,
                                    highlight: true,
                                    minLength: 1,
                                },
                                {
                                    name: "email",
                                    displayKey: "name",
                                    limit: 5,
                                    source: partnerList.ttAdapter(),
                                    templates: {
                                        empty: [
                                            '<div class="no-find">',
                                            "No such partner exists. Add new in People tab.",
                                            "</div>",
                                        ].join("\n"),
                                        suggestion: Handlebars.compile(
                                            "<p class='name'>{{name}}</p>"
                                        ),
                                    },
                                }
                            );
                            //Focus
                            newBlockView.$(".partner-input").focus();
                            //Add new partner on typeahead autocomplete
                            newBlockView
                                .$(".partner-input")
                                .on(
                                    "typeahead:selected typeahead:autocompleted",
                                    function (e, datum) {
                                        var $input =
                                            newBlockView.$(".partner-input");
                                        $input.typeahead("val", "").focus();
                                        newBlockView
                                            .$(".partners-list")
                                            .append(
                                                "<div class='one-person' data-id='" +
                                                    datum._id +
                                                    "'><p class='name'>" +
                                                    datum.name +
                                                    "</p><span class='remove-person u-delete'>Remove</span></div>"
                                            );
                                        excluded_ids.push(datum._id);
                                    }
                                );
                            break;
                        case "breather":
                            //Breather block
                            newBlockView
                                .$(".new-block-panel .block-breather")
                                .removeClass("u-hide");
                            //Focus on title
                            newBlockView
                                .$(".block-breather .breather-title")
                                .focus();
                            break;
                        case "calendar":
                            //Calendar block
                            newBlockView
                                .$(".new-block-panel .block-calendar")
                                .removeClass("u-hide");
                            //Focus on title
                            newBlockView
                                .$(".block-calendar .calendar-title")
                                .focus();
                            //Show date picker
                            newBlockView
                                .$(".event-start, .event-end")
                                .datetimepicker({
                                    dateFormat: "dd-mm-yy",
                                    changeMonth: true,
                                    changeYear: true,
                                    minDate: 0,
                                    controlType: "select",
                                    oneLine: true,
                                    timeFormat: "hh:mm tt",
                                });
                            break;
                    }
                });
                //Save body HTML
                newBlockView.on("save:htmlBlock", function (value) {
                    if (newBlockView.$(".redactor-box").length) {
                        var html = $R(".body-h-content", "source.getCode");
                        var new_block = new DashManager.Entities.Block({
                            type: value.type,
                            html: html,
                            order: value.order,
                            block: value.block,
                            page: value.page,
                        });
                        //Images
                        if (richTextEditorFiles && richTextEditorFiles.length) {
                            new_block.set("images", richTextEditorFiles);
                        }
                        new_block.save(
                            {},
                            {
                                success: function () {
                                    $R(".body-h-content", "destroy");
                                    DashManager.vent.trigger(
                                        "add:block",
                                        new_block
                                    );
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                },
                            }
                        );
                    }
                });
                //Remove person
                newBlockView.on("remove:person", function (value) {
                    //Remove element from excluded ids
                    var index = excluded_ids.indexOf(value.person_id);
                    if (index > -1) {
                        excluded_ids.splice(index, 1);
                    }
                });
                //Save block
                newBlockView.on("save:block", function (value) {
                    var new_block = new DashManager.Entities.Block({
                        type: value.type,
                        title: value.title,
                        desc: value.desc,
                        label: value.label,
                        image_m: value.image_m,
                        image_l: value.image_l,
                        image_bg: value.image_bg,
                        icon: value.icon,
                        embed: value.embed,
                        button_text: value.button_text,
                        button_url: value.button_url,
                        button_embed: value.button_embed,
                        buttonb_text: value.buttonb_text,
                        buttonb_url: value.buttonb_url,
                        buttonb_embed: value.buttonb_embed,
                        story_title: value.story_title,
                        story_text: value.story_text,
                        story_url: value.story_url,
                        orientation: value.orientation,
                        items: value.items,
                        formula: value.formula,
                        row_count: value.row_count,
                        shape: value.shape,
                        people: excluded_ids,
                        events: value.events,
                        gallery: value.gallery,
                        order: value.order,
                        block: value.block,
                        page: value.page,
                    });
                    new_block.save(
                        {},
                        {
                            success: function () {
                                DashManager.vent.trigger(
                                    "add:block",
                                    new_block
                                );
                                //If events
                                if (value.events) {
                                    calEventsArray = [];
                                }
                                //If gallery
                                if (value.gallery) {
                                    carouselImagesArray = [];
                                }
                                //If formula is tags
                                if (value.formula == "tags") {
                                    DashManager.vent.trigger(
                                        "blockTags:show",
                                        new_block.get("_id")
                                    );
                                } else {
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                }
                            },
                        }
                    );
                });
                DashManager.overlayRegion.show(newBlockView);
            },
            showEditBlockOverlay: function (block_id, container_id) {
                var excluded_ids = [];
                $(".overlay").show();
                //Fetch block
                var fetchingBlock = DashManager.request(
                    "block:entity",
                    block_id,
                    container_id
                );
                $.when(fetchingBlock).done(function (block) {
                    var newBlockView =
                        new DashManager.DashApp.EntityViews.NewBlockView();
                    //Editor
                    var richTextEditorFiles = [];
                    //Show
                    newBlockView.on("show", function () {
                        //Add edit class
                        newBlockView.$(".overlay-box").addClass("edit-box");
                        //Animate overlay box
                        setTimeout(function () {
                            newBlockView.$(".overlay-box").addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        DashManager.commands.execute("show:overlay");
                        newBlockView
                            .$(".js-delete-block")
                            .removeClass("u-hide");
                        //Show section based on type
                        var type = block.get("type");
                        //Add data type
                        newBlockView.$(".new-block-panel").data("type", type);
                        //Fill values
                        switch (type) {
                            case "header":
                                //Default header
                                newBlockView
                                    .$(".new-block-panel .block-header")
                                    .removeClass("u-hide");
                                //Update main text
                                newBlockView
                                    .$(".block-header .main-text")
                                    .text("Default header:");
                                //Show image
                                newBlockView
                                    .$(".block-header .area-image")
                                    .removeClass("u-hide");
                                //Show story
                                newBlockView
                                    .$(".block-header .area-story")
                                    .removeClass("u-hide");
                                //Fill values
                                //Title
                                newBlockView
                                    .$(".block-header .header-title")
                                    .val(block.get("text").title)
                                    .focus();
                                //Desc
                                if (
                                    block.get("text") &&
                                    block.get("text").desc
                                ) {
                                    newBlockView
                                        .$(".header-desc")
                                        .val(block.get("text").desc);
                                }
                                //Buttons
                                if (block.get("button")) {
                                    if (block.get("button").text) {
                                        newBlockView
                                            .$(".header-button-text")
                                            .val(block.get("button").text);
                                    }
                                    if (
                                        block.get("button").url ||
                                        block.get("button").embed
                                    ) {
                                        var button_url =
                                            block.get("button").url ||
                                            block.get("button").embed;
                                        newBlockView
                                            .$(".header-button-url")
                                            .val(button_url);
                                    }
                                }
                                if (block.get("buttonb")) {
                                    if (block.get("buttonb").text) {
                                        newBlockView
                                            .$(".header-buttonb-text")
                                            .val(block.get("buttonb").text);
                                    }
                                    if (
                                        block.get("buttonb").url ||
                                        block.get("buttonb").embed
                                    ) {
                                        var buttonb_url =
                                            block.get("buttonb").url ||
                                            block.get("buttonb").embed;
                                        newBlockView
                                            .$(".header-buttonb-url")
                                            .val(buttonb_url);
                                    }
                                }
                                //Image
                                if (
                                    block.get("image") &&
                                    block.get("image").bg
                                ) {
                                    newBlockView
                                        .$(".header-image")
                                        .val(block.get("image").bg);
                                }
                                //Story
                                if (block.get("story")) {
                                    if (block.get("story").title) {
                                        newBlockView
                                            .$(".header-story-title")
                                            .val(block.get("story").title);
                                    }
                                    if (block.get("story").text) {
                                        newBlockView
                                            .$(".header-story-text")
                                            .val(block.get("story").text);
                                    }
                                    if (block.get("story").url) {
                                        newBlockView
                                            .$(".header-story-url")
                                            .val(block.get("story").url);
                                    }
                                }
                                break;
                            case "header_video":
                                //Header with video
                                newBlockView
                                    .$(".new-block-panel .block-header")
                                    .removeClass("u-hide");
                                //Update main text
                                newBlockView
                                    .$(".block-header .main-text")
                                    .text("Header with video/embed:");
                                //Show embed
                                newBlockView
                                    .$(".block-header .area-embed")
                                    .removeClass("u-hide");
                                //Fill values
                                //Title
                                newBlockView
                                    .$(".block-header .header-title")
                                    .val(block.get("text").title)
                                    .focus();
                                //Desc
                                if (
                                    block.get("text") &&
                                    block.get("text").desc
                                ) {
                                    newBlockView
                                        .$(".header-desc")
                                        .val(block.get("text").desc);
                                }
                                //Buttons
                                if (block.get("button")) {
                                    if (block.get("button").text) {
                                        newBlockView
                                            .$(".header-button-text")
                                            .val(block.get("button").text);
                                    }
                                    if (
                                        block.get("button").url ||
                                        block.get("button").embed
                                    ) {
                                        var button_url =
                                            block.get("button").url ||
                                            block.get("button").embed;
                                        newBlockView
                                            .$(".header-button-url")
                                            .val(button_url);
                                    }
                                }
                                if (block.get("buttonb")) {
                                    if (block.get("buttonb").text) {
                                        newBlockView
                                            .$(".header-buttonb-text")
                                            .val(block.get("buttonb").text);
                                    }
                                    if (
                                        block.get("buttonb").url ||
                                        block.get("buttonb").embed
                                    ) {
                                        var buttonb_url =
                                            block.get("buttonb").url ||
                                            block.get("buttonb").embed;
                                        newBlockView
                                            .$(".header-buttonb-url")
                                            .val(buttonb_url);
                                    }
                                }
                                //Embed
                                if (
                                    block.get("url") &&
                                    block.get("url").embed
                                ) {
                                    newBlockView
                                        .$(".header-embed")
                                        .val(block.get("url").embed);
                                }
                                break;
                            case "header_bg":
                                //Header with background image
                                newBlockView
                                    .$(".new-block-panel .block-header")
                                    .removeClass("u-hide");
                                //Update main text
                                newBlockView
                                    .$(".block-header .main-text")
                                    .text("Header with background image:");
                                //Show image
                                newBlockView
                                    .$(".block-header .area-image")
                                    .removeClass("u-hide");
                                //Fill values
                                //Title
                                newBlockView
                                    .$(".block-header .header-title")
                                    .val(block.get("text").title)
                                    .focus();
                                //Desc
                                if (
                                    block.get("text") &&
                                    block.get("text").desc
                                ) {
                                    newBlockView
                                        .$(".header-desc")
                                        .val(block.get("text").desc);
                                }
                                //Buttons
                                if (block.get("button")) {
                                    if (block.get("button").text) {
                                        newBlockView
                                            .$(".header-button-text")
                                            .val(block.get("button").text);
                                    }
                                    if (
                                        block.get("button").url ||
                                        block.get("button").embed
                                    ) {
                                        var button_url =
                                            block.get("button").url ||
                                            block.get("button").embed;
                                        newBlockView
                                            .$(".header-button-url")
                                            .val(button_url);
                                    }
                                }
                                if (block.get("buttonb")) {
                                    if (block.get("buttonb").text) {
                                        newBlockView
                                            .$(".header-buttonb-text")
                                            .val(block.get("buttonb").text);
                                    }
                                    if (
                                        block.get("buttonb").url ||
                                        block.get("buttonb").embed
                                    ) {
                                        var buttonb_url =
                                            block.get("buttonb").url ||
                                            block.get("buttonb").embed;
                                        newBlockView
                                            .$(".header-buttonb-url")
                                            .val(buttonb_url);
                                    }
                                }
                                //Image
                                if (
                                    block.get("image") &&
                                    block.get("image").bg
                                ) {
                                    newBlockView
                                        .$(".header-image")
                                        .val(block.get("image").bg);
                                }
                                break;
                            case "header_media":
                                //Header with center-aligned media
                                newBlockView
                                    .$(".new-block-panel .block-header")
                                    .removeClass("u-hide");
                                //Update main text
                                newBlockView
                                    .$(".block-header .main-text")
                                    .text(
                                        "Header with a hero image/video/embed:"
                                    );
                                //Show image
                                newBlockView
                                    .$(".block-header .area-image")
                                    .removeClass("u-hide");
                                //Show embed
                                newBlockView
                                    .$(".block-header .area-embed")
                                    .removeClass("u-hide");
                                //Fill values
                                //Title
                                newBlockView
                                    .$(".block-header .header-title")
                                    .val(block.get("text").title)
                                    .focus();
                                //Desc
                                if (
                                    block.get("text") &&
                                    block.get("text").desc
                                ) {
                                    newBlockView
                                        .$(".header-desc")
                                        .val(block.get("text").desc);
                                }
                                //Buttons
                                if (block.get("button")) {
                                    if (block.get("button").text) {
                                        newBlockView
                                            .$(".header-button-text")
                                            .val(block.get("button").text);
                                    }
                                    if (
                                        block.get("button").url ||
                                        block.get("button").embed
                                    ) {
                                        var button_url =
                                            block.get("button").url ||
                                            block.get("button").embed;
                                        newBlockView
                                            .$(".header-button-url")
                                            .val(button_url);
                                    }
                                }
                                if (block.get("buttonb")) {
                                    if (block.get("buttonb").text) {
                                        newBlockView
                                            .$(".header-buttonb-text")
                                            .val(block.get("buttonb").text);
                                    }
                                    if (
                                        block.get("buttonb").url ||
                                        block.get("buttonb").embed
                                    ) {
                                        var buttonb_url =
                                            block.get("buttonb").url ||
                                            block.get("buttonb").embed;
                                        newBlockView
                                            .$(".header-buttonb-url")
                                            .val(buttonb_url);
                                    }
                                }
                                //Image
                                if (
                                    block.get("image") &&
                                    block.get("image").m
                                ) {
                                    newBlockView
                                        .$(".header-image")
                                        .val(block.get("image").m);
                                }
                                //Embed
                                if (
                                    block.get("url") &&
                                    block.get("url").embed
                                ) {
                                    newBlockView
                                        .$(".header-embed")
                                        .val(block.get("url").embed);
                                }
                                break;
                            case "section":
                                //Default section
                                newBlockView
                                    .$(".new-block-panel .block-section")
                                    .removeClass("u-hide");
                                //Update main text
                                newBlockView
                                    .$(".block-section .main-text")
                                    .text("Default section:");
                                //Fill values
                                //Title
                                newBlockView
                                    .$(".block-section .section-title")
                                    .val(block.get("text").title)
                                    .focus();
                                //Desc
                                if (
                                    block.get("text") &&
                                    block.get("text").desc
                                ) {
                                    newBlockView
                                        .$(".section-desc")
                                        .val(block.get("text").desc);
                                }
                                //Buttons
                                if (block.get("button")) {
                                    if (block.get("button").text) {
                                        newBlockView
                                            .$(".section-button-text")
                                            .val(block.get("button").text);
                                    }
                                    if (
                                        block.get("button").url ||
                                        block.get("button").embed
                                    ) {
                                        var button_url =
                                            block.get("button").url ||
                                            block.get("button").embed;
                                        newBlockView
                                            .$(".section-button-url")
                                            .val(button_url);
                                    }
                                }
                                if (block.get("buttonb")) {
                                    if (block.get("buttonb").text) {
                                        newBlockView
                                            .$(".section-buttonb-text")
                                            .val(block.get("buttonb").text);
                                    }
                                    if (
                                        block.get("buttonb").url ||
                                        block.get("buttonb").embed
                                    ) {
                                        var buttonb_url =
                                            block.get("buttonb").url ||
                                            block.get("buttonb").embed;
                                        newBlockView
                                            .$(".section-buttonb-url")
                                            .val(buttonb_url);
                                    }
                                }
                                break;
                            case "section_basic":
                                //Basic section
                                newBlockView
                                    .$(".new-block-panel .block-section")
                                    .removeClass("u-hide");
                                //Update main text
                                newBlockView
                                    .$(".block-section .main-text")
                                    .text("Text section:");
                                //Fill values
                                //Title
                                newBlockView
                                    .$(".block-section .section-title")
                                    .val(block.get("text").title)
                                    .focus();
                                //Desc
                                if (
                                    block.get("text") &&
                                    block.get("text").desc
                                ) {
                                    newBlockView
                                        .$(".section-desc")
                                        .val(block.get("text").desc);
                                }
                                //Buttons
                                if (block.get("button")) {
                                    if (block.get("button").text) {
                                        newBlockView
                                            .$(".section-button-text")
                                            .val(block.get("button").text);
                                    }
                                    if (
                                        block.get("button").url ||
                                        block.get("button").embed
                                    ) {
                                        var button_url =
                                            block.get("button").url ||
                                            block.get("button").embed;
                                        newBlockView
                                            .$(".section-button-url")
                                            .val(button_url);
                                    }
                                }
                                if (block.get("buttonb")) {
                                    if (block.get("buttonb").text) {
                                        newBlockView
                                            .$(".section-buttonb-text")
                                            .val(block.get("buttonb").text);
                                    }
                                    if (
                                        block.get("buttonb").url ||
                                        block.get("buttonb").embed
                                    ) {
                                        var buttonb_url =
                                            block.get("buttonb").url ||
                                            block.get("buttonb").embed;
                                        newBlockView
                                            .$(".section-buttonb-url")
                                            .val(buttonb_url);
                                    }
                                }
                                break;
                            case "section_media":
                                //Section with media
                                newBlockView
                                    .$(".new-block-panel .block-section")
                                    .removeClass("u-hide");
                                //Update main text
                                newBlockView
                                    .$(".block-section .main-text")
                                    .text("Section with text, image or video:");
                                //Show image
                                newBlockView
                                    .$(".block-section .area-image")
                                    .removeClass("u-hide");
                                //Show embed
                                newBlockView
                                    .$(".block-section .area-embed")
                                    .removeClass("u-hide");
                                //Show orientation
                                newBlockView
                                    .$(".block-section .area-orientation")
                                    .removeClass("u-hide");
                                //Fill values
                                //Title
                                newBlockView
                                    .$(".block-section .section-title")
                                    .val(block.get("text").title)
                                    .focus();
                                //Desc
                                if (
                                    block.get("text") &&
                                    block.get("text").desc
                                ) {
                                    newBlockView
                                        .$(".section-desc")
                                        .val(block.get("text").desc);
                                }
                                //Buttons
                                if (block.get("button")) {
                                    if (block.get("button").text) {
                                        newBlockView
                                            .$(".section-button-text")
                                            .val(block.get("button").text);
                                    }
                                    if (
                                        block.get("button").url ||
                                        block.get("button").embed
                                    ) {
                                        var button_url =
                                            block.get("button").url ||
                                            block.get("button").embed;
                                        newBlockView
                                            .$(".section-button-url")
                                            .val(button_url);
                                    }
                                }
                                if (block.get("buttonb")) {
                                    if (block.get("buttonb").text) {
                                        newBlockView
                                            .$(".section-buttonb-text")
                                            .val(block.get("buttonb").text);
                                    }
                                    if (
                                        block.get("buttonb").url ||
                                        block.get("buttonb").embed
                                    ) {
                                        var buttonb_url =
                                            block.get("buttonb").url ||
                                            block.get("buttonb").embed;
                                        newBlockView
                                            .$(".section-buttonb-url")
                                            .val(buttonb_url);
                                    }
                                }
                                //Image
                                if (
                                    block.get("image") &&
                                    block.get("image").m
                                ) {
                                    newBlockView
                                        .$(".section-image")
                                        .val(block.get("image").m);
                                }
                                //Embed
                                if (
                                    block.get("url") &&
                                    block.get("url").embed
                                ) {
                                    newBlockView
                                        .$(".section-embed")
                                        .val(block.get("url").embed);
                                }
                                //Orientation
                                if (block.get("orientation")) {
                                    newBlockView
                                        .$(".choose-orientation span")
                                        .removeClass("selected");
                                    newBlockView
                                        .$(
                                            ".choose-media-" +
                                                block.get("orientation")
                                        )
                                        .addClass("selected");
                                }
                                break;
                            case "section_list":
                                //Section with a list of items
                                newBlockView
                                    .$(".new-block-panel .block-section")
                                    .removeClass("u-hide");
                                //Update main text
                                newBlockView
                                    .$(".block-section .main-text")
                                    .text("Section with a list of items:");
                                //Show image
                                newBlockView
                                    .$(".block-section .area-image")
                                    .removeClass("u-hide");
                                //Show embed
                                newBlockView
                                    .$(".block-section .area-embed")
                                    .removeClass("u-hide");
                                //Show items
                                newBlockView
                                    .$(".block-section .area-items")
                                    .removeClass("u-hide");
                                //Focus on title
                                newBlockView
                                    .$(".block-section .section-title")
                                    .focus();
                                //Fill values
                                var all_items = block.get("items");
                                if (all_items && all_items.length) {
                                    for (var i = 0; i < all_items.length; i++) {
                                        var item = all_items[i];
                                        newBlockView
                                            .$(".section-items-list")
                                            .append(
                                                "<div class='one-section-item' data-id='" +
                                                    item._id +
                                                    "'><p class='title'>" +
                                                    item.title +
                                                    "</p><span class='remove-item u-delete'>Remove</span></div>"
                                            );
                                    }
                                    //Sortable
                                    newBlockView
                                        .$(".section-items-list")
                                        .sortable({
                                            axis: "y",
                                            update: function (e, ui) {
                                                var new_index = ui.item.index();
                                                var item_id =
                                                    ui.item.attr("data-id");
                                                //Update order
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _action:
                                                                "item_order",
                                                        }
                                                    );
                                                //Set
                                                edit_block.set({
                                                    item: item_id,
                                                    order: new_index,
                                                });
                                                edit_block.save();
                                            },
                                        });
                                }
                                break;
                            case "container":
                                //Container
                                newBlockView
                                    .$(".new-block-panel .block-container")
                                    .removeClass("u-hide");
                                //Fill values
                                //Formula
                                if (block.get("formula")) {
                                    newBlockView
                                        .$(".choose-formula span")
                                        .removeClass("selected");
                                    newBlockView
                                        .$(".choose-" + block.get("formula"))
                                        .addClass("selected");
                                    if (
                                        block.get("formula") == "tags" &&
                                        block.get("row_count")
                                    ) {
                                        newBlockView
                                            .$(".container-rows")
                                            .val(block.get("row_count"))
                                            .removeClass("u-hide")
                                            .focus();
                                    }
                                }
                                break;
                            case "body_text":
                                //Body text block
                                newBlockView
                                    .$(".new-block-panel .block-body-t")
                                    .removeClass("u-hide");
                                //Fill values
                                //Title
                                if (
                                    block.get("text") &&
                                    block.get("text").title
                                ) {
                                    newBlockView
                                        .$(".block-body-t .body-t-title")
                                        .val(block.get("text").title)
                                        .focus();
                                }
                                //Desc
                                if (
                                    block.get("text") &&
                                    block.get("text").desc
                                ) {
                                    newBlockView
                                        .$(".body-t-desc")
                                        .val(block.get("text").desc);
                                }
                                //Label
                                if (
                                    block.get("text") &&
                                    block.get("text").label
                                ) {
                                    newBlockView
                                        .$(".body-t-label")
                                        .val(block.get("text").label);
                                }
                                //Button
                                if (block.get("button")) {
                                    if (block.get("button").text) {
                                        newBlockView
                                            .$(".body-t-button-text")
                                            .val(block.get("button").text);
                                    }
                                    if (
                                        block.get("button").url ||
                                        block.get("button").embed
                                    ) {
                                        var button_url =
                                            block.get("button").url ||
                                            block.get("button").embed;
                                        newBlockView
                                            .$(".body-t-button-url")
                                            .val(button_url);
                                    }
                                }
                                //Image
                                if (
                                    block.get("image") &&
                                    block.get("image").m
                                ) {
                                    newBlockView
                                        .$(".body-t-image")
                                        .val(block.get("image").m);
                                }
                                //Shape
                                if (block.get("shape")) {
                                    newBlockView
                                        .$(".choose-shape span")
                                        .removeClass("selected");
                                    newBlockView
                                        .$(".choose-" + block.get("shape"))
                                        .addClass("selected");
                                }
                                break;
                            case "body_html":
                                //Body HTML block
                                newBlockView
                                    .$(".new-block-panel .block-body-h")
                                    .removeClass("u-hide");
                                newBlockView
                                    .$(".body-h-content")
                                    .html(block.get("text").html);
                                //Editor
                                $R(".body-h-content", {
                                    focus: true,
                                    toolbarFixedTarget: ".overlay",
                                    buttons: editor_btns,
                                    plugins: editor_plugins,
                                    formatting: editor_formatting,
                                    imageUpload: "/api/upload",
                                    callbacks: {
                                        image: {
                                            uploaded: function (
                                                image,
                                                response
                                            ) {
                                                richTextEditorFiles.push(
                                                    response.file.url
                                                );
                                            },
                                        },
                                    },
                                });
                                break;
                            case "body_embed":
                                //Body embed block
                                newBlockView
                                    .$(".new-block-panel .block-body-e")
                                    .removeClass("u-hide");
                                //Fill values
                                //Title
                                if (
                                    block.get("text") &&
                                    block.get("text").title
                                ) {
                                    newBlockView
                                        .$(".block-body-e .body-e-title")
                                        .val(block.get("text").title)
                                        .focus();
                                } else {
                                    $(".block-body-e .body-e-title").focus();
                                }
                                //Desc
                                if (
                                    block.get("text") &&
                                    block.get("text").desc
                                ) {
                                    newBlockView
                                        .$(".body-e-desc")
                                        .val(block.get("text").desc);
                                }
                                //Buttons
                                if (block.get("button")) {
                                    if (block.get("button").text) {
                                        newBlockView
                                            .$(".body-e-button-text")
                                            .val(block.get("button").text);
                                    }
                                    if (
                                        block.get("button").url ||
                                        block.get("button").embed
                                    ) {
                                        var button_url =
                                            block.get("button").url ||
                                            block.get("button").embed;
                                        newBlockView
                                            .$(".body-e-button-url")
                                            .val(button_url);
                                    }
                                }
                                if (block.get("buttonb")) {
                                    if (block.get("buttonb").text) {
                                        newBlockView
                                            .$(".body-e-buttonb-text")
                                            .val(block.get("buttonb").text);
                                    }
                                    if (
                                        block.get("buttonb").url ||
                                        block.get("buttonb").embed
                                    ) {
                                        var buttonb_url =
                                            block.get("buttonb").url ||
                                            block.get("buttonb").embed;
                                        newBlockView
                                            .$(".body-e-buttonb-url")
                                            .val(buttonb_url);
                                    }
                                }
                                //Embed
                                if (
                                    block.get("url") &&
                                    block.get("url").embed
                                ) {
                                    newBlockView
                                        .$(".body-e-embed")
                                        .val(block.get("url").embed);
                                }
                                break;
                            case "body_carousel":
                                //Default carousel
                                newBlockView
                                    .$(".new-block-panel .block-body-c")
                                    .removeClass("u-hide");
                                //Update main text
                                newBlockView
                                    .$(".block-body-c .main-text")
                                    .text("Default carousel:");
                                //Show link
                                newBlockView
                                    .$(".block-body-c .area-link")
                                    .removeClass("u-hide");
                                //Focus on title
                                newBlockView
                                    .$(".block-body-c .body-c-title")
                                    .focus();
                                //Fill values
                                var all_images = block.get("gallery");
                                if (all_images && all_images.length) {
                                    for (
                                        var i = 0;
                                        i < all_images.length;
                                        i++
                                    ) {
                                        var image = all_images[i];
                                        var title_label =
                                            image.title ||
                                            "Image: " + image.file.l;
                                        newBlockView
                                            .$(".body-images-list")
                                            .append(
                                                "<div class='one-image' data-id='" +
                                                    image._id +
                                                    "'><p class='title'>" +
                                                    title_label +
                                                    "</p><span class='remove-image u-delete'>Remove</span></div>"
                                            );
                                    }
                                    //Sortable
                                    newBlockView
                                        .$(".body-images-list")
                                        .sortable({
                                            axis: "y",
                                            update: function (e, ui) {
                                                var new_index = ui.item.index();
                                                var image_id =
                                                    ui.item.attr("data-id");
                                                //Update order
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _action:
                                                                "image_order",
                                                        }
                                                    );
                                                //Set
                                                edit_block.set({
                                                    image: image_id,
                                                    order: new_index,
                                                });
                                                edit_block.save();
                                            },
                                        });
                                }
                                break;
                            case "body_carousel_text":
                                //Text carousel
                                newBlockView
                                    .$(".new-block-panel .block-body-c")
                                    .removeClass("u-hide");
                                //Update main text
                                newBlockView
                                    .$(".block-body-c .main-text")
                                    .text("Text and media carousel:");
                                //Show description
                                newBlockView
                                    .$(".block-body-c .body-c-desc")
                                    .removeClass("u-hide");
                                //Show btns
                                newBlockView
                                    .$(".block-body-c .area-btns")
                                    .removeClass("u-hide");
                                //Show embed
                                newBlockView
                                    .$(".block-body-c .area-embed")
                                    .removeClass("u-hide");
                                //Focus on title
                                newBlockView
                                    .$(".block-body-c .body-c-title")
                                    .focus();
                                //Fill values
                                var all_images = block.get("gallery");
                                if (all_images && all_images.length) {
                                    for (
                                        var i = 0;
                                        i < all_images.length;
                                        i++
                                    ) {
                                        var image = all_images[i];
                                        var title_label =
                                            image.title ||
                                            "Image: " + image.file.l;
                                        newBlockView
                                            .$(".body-images-list")
                                            .append(
                                                "<div class='one-image' data-id='" +
                                                    image._id +
                                                    "'><p class='title'>" +
                                                    title_label +
                                                    "</p><span class='remove-image u-delete'>Remove</span></div>"
                                            );
                                    }
                                    //Sortable
                                    newBlockView
                                        .$(".body-images-list")
                                        .sortable({
                                            axis: "y",
                                            update: function (e, ui) {
                                                var new_index = ui.item.index();
                                                var image_id =
                                                    ui.item.attr("data-id");
                                                //Update order
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _action:
                                                                "image_order",
                                                        }
                                                    );
                                                //Set
                                                edit_block.set({
                                                    image: image_id,
                                                    order: new_index,
                                                });
                                                edit_block.save();
                                            },
                                        });
                                }
                                break;
                            case "people":
                                //People block
                                newBlockView
                                    .$(".new-block-panel .block-people")
                                    .removeClass("u-hide");
                                //Fill values
                                //Title
                                if (
                                    block.get("text") &&
                                    block.get("text").title
                                ) {
                                    newBlockView
                                        .$(".block-people .people-title")
                                        .val(block.get("text").title);
                                }
                                //Desc
                                if (
                                    block.get("text") &&
                                    block.get("text").desc
                                ) {
                                    newBlockView
                                        .$(".people-desc")
                                        .val(block.get("text").desc);
                                }
                                //People list
                                var all_people = block.get("people");
                                if (all_people && all_people.length) {
                                    for (
                                        var i = 0;
                                        i < all_people.length;
                                        i++
                                    ) {
                                        var people = all_people[i];
                                        newBlockView
                                            .$(".persons-list")
                                            .append(
                                                "<div class='one-person' data-id='" +
                                                    people._id +
                                                    "'><p class='name'>" +
                                                    people.name +
                                                    "<br><span>" +
                                                    people.email +
                                                    "</span></p><span class='remove-person u-delete'>Remove</span></div>"
                                            );
                                        excluded_ids.push(people._id);
                                    }
                                    //Sortable
                                    newBlockView.$(".persons-list").sortable({
                                        axis: "y",
                                        update: function (e, ui) {
                                            var new_index = ui.item.index();
                                            var person_id =
                                                ui.item.attr("data-id");
                                            //Update order
                                            if (container_id) {
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _container:
                                                                container_id,
                                                            _action:
                                                                "person_order",
                                                        }
                                                    );
                                            } else {
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _action:
                                                                "person_order",
                                                        }
                                                    );
                                            }
                                            //Set
                                            edit_block.set({
                                                person: person_id,
                                                order: new_index,
                                            });
                                            edit_block.save();
                                        },
                                    });
                                }
                                //Typeahead for persons
                                //Remote fetch person list
                                var personList = new Bloodhound({
                                    datumTokenizer:
                                        Bloodhound.tokenizers.obj.whitespace(
                                            "value"
                                        ),
                                    queryTokenizer:
                                        Bloodhound.tokenizers.obj.whitespace,
                                    remote: {
                                        url: "/api/search/persons?text=%QUERY&excluded=%EXCLUDED",
                                        replace: function (url) {
                                            return url
                                                .replace(
                                                    "%EXCLUDED",
                                                    JSON.stringify(excluded_ids)
                                                )
                                                .replace(
                                                    "%QUERY",
                                                    newBlockView
                                                        .$(
                                                            ".person-input.tt-input"
                                                        )
                                                        .val()
                                                );
                                        },
                                        filter: function (parsedResponse) {
                                            return parsedResponse;
                                        },
                                    },
                                });
                                //Initialize personlist
                                personList.initialize();
                                //Show typeahead
                                newBlockView.$(".person-input").typeahead(
                                    {
                                        hint: true,
                                        highlight: true,
                                        minLength: 1,
                                    },
                                    {
                                        name: "email",
                                        displayKey: "name",
                                        limit: 5,
                                        source: personList.ttAdapter(),
                                        templates: {
                                            empty: [
                                                '<div class="no-find">',
                                                "No such user exists. Add new in People tab.",
                                                "</div>",
                                            ].join("\n"),
                                            suggestion: Handlebars.compile(
                                                "<p class='name'>{{name}}</p><p class='email'>{{email}}</p>"
                                            ),
                                        },
                                    }
                                );
                                //Focus
                                newBlockView.$(".person-input").focus();
                                //Add new person on typeahead autocomplete
                                newBlockView
                                    .$(".person-input")
                                    .on(
                                        "typeahead:selected typeahead:autocompleted",
                                        function (e, datum) {
                                            if (container_id) {
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _container:
                                                                container_id,
                                                            _action:
                                                                "add_person",
                                                        }
                                                    );
                                            } else {
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _action:
                                                                "add_person",
                                                        }
                                                    );
                                            }
                                            //Set
                                            edit_block.set({
                                                person: datum._id,
                                            });
                                            edit_block.save(
                                                {},
                                                {
                                                    success: function () {
                                                        var $input =
                                                            newBlockView.$(
                                                                ".person-input"
                                                            );
                                                        $input
                                                            .typeahead(
                                                                "val",
                                                                ""
                                                            )
                                                            .focus();
                                                        newBlockView
                                                            .$(".persons-list")
                                                            .append(
                                                                "<div class='one-person' data-id='" +
                                                                    datum._id +
                                                                    "'><p class='name'>" +
                                                                    datum.name +
                                                                    "<br><span>" +
                                                                    datum.email +
                                                                    "</span></p><span class='remove-person u-delete'>Remove</span></div>"
                                                            );
                                                        excluded_ids.push(
                                                            datum._id
                                                        );
                                                    },
                                                }
                                            );
                                        }
                                    );
                                break;
                            case "logos":
                                //Logos block
                                newBlockView
                                    .$(".new-block-panel .block-logos")
                                    .removeClass("u-hide");
                                //Fill values
                                //Title
                                if (
                                    block.get("text") &&
                                    block.get("text").title
                                ) {
                                    newBlockView
                                        .$(".block-logos .logos-title")
                                        .val(block.get("text").title);
                                }
                                //Desc
                                if (
                                    block.get("text") &&
                                    block.get("text").desc
                                ) {
                                    newBlockView
                                        .$(".logos-desc")
                                        .val(block.get("text").desc);
                                }
                                //Partner list
                                var all_partners = block.get("people");
                                if (all_partners && all_partners.length) {
                                    for (
                                        var i = 0;
                                        i < all_partners.length;
                                        i++
                                    ) {
                                        var partner = all_partners[i];
                                        newBlockView
                                            .$(".partners-list")
                                            .append(
                                                "<div class='one-person' data-id='" +
                                                    partner._id +
                                                    "'><p class='name'>" +
                                                    partner.name +
                                                    "<br><span>" +
                                                    partner.email +
                                                    "</span></p><span class='remove-person u-delete'>Remove</span></div>"
                                            );
                                        excluded_ids.push(partner._id);
                                    }
                                    //Sortable
                                    newBlockView.$(".partners-list").sortable({
                                        axis: "y",
                                        update: function (e, ui) {
                                            var new_index = ui.item.index();
                                            var person_id =
                                                ui.item.attr("data-id");
                                            //Update order
                                            if (container_id) {
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _container:
                                                                container_id,
                                                            _action:
                                                                "person_order",
                                                        }
                                                    );
                                            } else {
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _action:
                                                                "person_order",
                                                        }
                                                    );
                                            }
                                            //Set
                                            edit_block.set({
                                                person: person_id,
                                                order: new_index,
                                            });
                                            edit_block.save();
                                        },
                                    });
                                }
                                //Typeahead for partners
                                //Remote fetch partner list
                                var partnerList = new Bloodhound({
                                    datumTokenizer:
                                        Bloodhound.tokenizers.obj.whitespace(
                                            "value"
                                        ),
                                    queryTokenizer:
                                        Bloodhound.tokenizers.obj.whitespace,
                                    remote: {
                                        url: "/api/search/partners?text=%QUERY&excluded=%EXCLUDED",
                                        replace: function (url) {
                                            return url
                                                .replace(
                                                    "%EXCLUDED",
                                                    JSON.stringify(excluded_ids)
                                                )
                                                .replace(
                                                    "%QUERY",
                                                    newBlockView
                                                        .$(
                                                            ".partner-input.tt-input"
                                                        )
                                                        .val()
                                                );
                                        },
                                        filter: function (parsedResponse) {
                                            return parsedResponse;
                                        },
                                    },
                                });
                                //Initialize partnerList
                                partnerList.initialize();
                                //Show typeahead
                                newBlockView.$(".partner-input").typeahead(
                                    {
                                        hint: true,
                                        highlight: true,
                                        minLength: 1,
                                    },
                                    {
                                        name: "email",
                                        displayKey: "name",
                                        limit: 5,
                                        source: partnerList.ttAdapter(),
                                        templates: {
                                            empty: [
                                                '<div class="no-find">',
                                                "No such partner exists. Add new in People tab.",
                                                "</div>",
                                            ].join("\n"),
                                            suggestion: Handlebars.compile(
                                                "<p class='name'>{{name}}</p>"
                                            ),
                                        },
                                    }
                                );
                                //Focus
                                newBlockView.$(".partner-input").focus();
                                //Add new partner on typeahead autocomplete
                                newBlockView
                                    .$(".partner-input")
                                    .on(
                                        "typeahead:selected typeahead:autocompleted",
                                        function (e, datum) {
                                            if (container_id) {
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _container:
                                                                container_id,
                                                            _action:
                                                                "add_person",
                                                        }
                                                    );
                                            } else {
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _action:
                                                                "add_person",
                                                        }
                                                    );
                                            }
                                            //Set
                                            edit_block.set({
                                                person: datum._id,
                                            });
                                            edit_block.save(
                                                {},
                                                {
                                                    success: function () {
                                                        var $input =
                                                            newBlockView.$(
                                                                ".partner-input"
                                                            );
                                                        $input
                                                            .typeahead(
                                                                "val",
                                                                ""
                                                            )
                                                            .focus();
                                                        newBlockView
                                                            .$(".partners-list")
                                                            .append(
                                                                "<div class='one-person' data-id='" +
                                                                    datum._id +
                                                                    "'><p class='name'>" +
                                                                    datum.name +
                                                                    "<br><span>" +
                                                                    datum.email +
                                                                    "</span></p><span class='remove-person u-delete'>Remove</span></div>"
                                                            );
                                                        excluded_ids.push(
                                                            datum._id
                                                        );
                                                    },
                                                }
                                            );
                                        }
                                    );
                                break;
                            case "breather":
                                //Breather block
                                newBlockView
                                    .$(".new-block-panel .block-breather")
                                    .removeClass("u-hide");
                                //Fill values
                                //Title
                                newBlockView
                                    .$(".block-breather .breather-title")
                                    .val(block.get("text").title)
                                    .focus();
                                //Desc
                                if (
                                    block.get("text") &&
                                    block.get("text").desc
                                ) {
                                    newBlockView
                                        .$(".breather-desc")
                                        .val(block.get("text").desc);
                                }
                                //Buttons
                                if (block.get("button")) {
                                    if (block.get("button").text) {
                                        newBlockView
                                            .$(".breather-button-text")
                                            .val(block.get("button").text);
                                    }
                                    if (
                                        block.get("button").url ||
                                        block.get("button").embed
                                    ) {
                                        var button_url =
                                            block.get("button").url ||
                                            block.get("button").embed;
                                        newBlockView
                                            .$(".breather-button-url")
                                            .val(button_url);
                                    }
                                }
                                if (block.get("buttonb")) {
                                    if (block.get("buttonb").text) {
                                        newBlockView
                                            .$(".breather-buttonb-text")
                                            .val(block.get("buttonb").text);
                                    }
                                    if (
                                        block.get("buttonb").url ||
                                        block.get("buttonb").embed
                                    ) {
                                        var buttonb_url =
                                            block.get("buttonb").url ||
                                            block.get("buttonb").embed;
                                        newBlockView
                                            .$(".breather-buttonb-url")
                                            .val(buttonb_url);
                                    }
                                }
                                //Image
                                if (
                                    block.get("image") &&
                                    block.get("image").bg
                                ) {
                                    newBlockView
                                        .$(".breather-image")
                                        .val(block.get("image").bg);
                                }
                                break;
                            case "calendar":
                                //Calendar block
                                newBlockView
                                    .$(".new-block-panel .block-calendar")
                                    .removeClass("u-hide");
                                //Fill values
                                //Title
                                if (
                                    block.get("text") &&
                                    block.get("text").title
                                ) {
                                    newBlockView
                                        .$(".block-calendar .calendar-title")
                                        .val(block.get("text").title)
                                        .focus();
                                }
                                //Events
                                var all_events = block.get("events");
                                if (all_events && all_events.length) {
                                    for (
                                        var i = 0;
                                        i < all_events.length;
                                        i++
                                    ) {
                                        var event = all_events[i];
                                        newBlockView
                                            .$(".events-list")
                                            .append(
                                                "<div class='one-event' data-id='" +
                                                    event._id +
                                                    "'><p class='title'>" +
                                                    event.title +
                                                    "</p><span class='remove-event u-delete'>Remove</span></div>"
                                            );
                                    }
                                    //Sortable
                                    newBlockView.$(".events-list").sortable({
                                        axis: "y",
                                        update: function (e, ui) {
                                            var new_index = ui.item.index();
                                            var event_id =
                                                ui.item.attr("data-id");
                                            //Update order
                                            if (container_id) {
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _container:
                                                                container_id,
                                                            _action:
                                                                "event_order",
                                                        }
                                                    );
                                            } else {
                                                var edit_block =
                                                    new DashManager.Entities.Block(
                                                        {
                                                            _id: block_id,
                                                            _action:
                                                                "event_order",
                                                        }
                                                    );
                                            }
                                            //Set
                                            edit_block.set({
                                                event: event_id,
                                                order: new_index,
                                            });
                                            edit_block.save();
                                        },
                                    });
                                }
                                //Show date picker
                                newBlockView
                                    .$(".event-start, .event-end")
                                    .datetimepicker({
                                        dateFormat: "dd-mm-yy",
                                        changeMonth: true,
                                        changeYear: true,
                                        minDate: 0,
                                        controlType: "select",
                                        oneLine: true,
                                        timeFormat: "hh:mm tt",
                                    });
                                break;
                        }
                    });
                    //Remove person
                    newBlockView.on("removeCreated:person", function (value) {
                        if (container_id) {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _container: container_id,
                                _action: "remove_person",
                            });
                        } else {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _action: "remove_person",
                            });
                        }
                        //Set
                        edit_block.set({
                            person: value.person_id,
                        });
                        edit_block.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    //Remove element from excluded ids
                                    var index = excluded_ids.indexOf(
                                        value.person_id
                                    );
                                    if (index > -1) {
                                        excluded_ids.splice(index, 1);
                                    }
                                },
                            }
                        );
                    });
                    //Add item
                    newBlockView.on("add:item", function (value) {
                        var edit_block = new DashManager.Entities.Block({
                            _id: block_id,
                            _action: "add_item",
                        });
                        //Set
                        edit_block.set({
                            title: value.title,
                            desc: value.desc,
                            button_text: value.button_text,
                            button_url: value.button_url,
                            button_embed: value.button_embed,
                            buttonb_text: value.buttonb_text,
                            buttonb_url: value.buttonb_url,
                            buttonb_embed: value.buttonb_embed,
                            image_m: value.image_m,
                            image_l: value.image_l,
                            embed: value.embed,
                        });
                        edit_block.save(
                            {},
                            {
                                success: function () {
                                    newBlockView
                                        .$(".section-items-list")
                                        .append(
                                            "<div class='one-section-item' data-id='" +
                                                edit_block.get("_id") +
                                                "'><p class='title'>" +
                                                edit_block.get("title") +
                                                "</p><span class='remove-item u-delete'>Remove</span></div>"
                                        );
                                },
                            }
                        );
                    });
                    //Remove item
                    newBlockView.on("remove:item", function (value) {
                        var edit_block = new DashManager.Entities.Block({
                            _id: block_id,
                            _action: "remove_item",
                        });
                        //Set
                        edit_block.set({
                            item: value.item_id,
                        });
                        edit_block.save();
                    });
                    //Add image
                    newBlockView.on("add:image", function (value) {
                        if (container_id) {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _container: container_id,
                                _action: "add_image",
                            });
                        } else {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _action: "add_image",
                            });
                        }
                        //Set
                        edit_block.set({
                            title: value.title,
                            image_l: value.image_l,
                            image_m: value.image_m,
                            button_text: value.button_text,
                            button_url: value.button_url,
                            bound: value.bound,
                        });
                        edit_block.save(
                            {},
                            {
                                success: function () {
                                    var title_label =
                                        edit_block.get("title") ||
                                        "Image: " + edit_block.get("file").l;
                                    //Append
                                    newBlockView
                                        .$(".body-images-list")
                                        .append(
                                            "<div class='one-image' data-id='" +
                                                edit_block.get("_id") +
                                                "'><p class='title'>" +
                                                title_label +
                                                "</p><span class='remove-image u-delete'>Remove</span></div>"
                                        );
                                },
                            }
                        );
                    });
                    //Remove image
                    newBlockView.on("remove:image", function (value) {
                        if (container_id) {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _container: container_id,
                                _action: "remove_image",
                            });
                        } else {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _action: "remove_image",
                            });
                        }
                        //Set
                        edit_block.set({
                            image: value.image_id,
                        });
                        edit_block.save();
                    });
                    //Add event
                    newBlockView.on("add:event", function (value) {
                        if (container_id) {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _container: container_id,
                                _action: "add_event",
                            });
                        } else {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _action: "add_event",
                            });
                        }
                        //Set
                        edit_block.set({
                            title: value.title,
                            desc: value.desc,
                            start_date: value.start_date,
                            end_date: value.end_date,
                            image_l: value.image_l,
                            image_m: value.image_m,
                            url: value.url,
                            location: value.location,
                        });
                        edit_block.save(
                            {},
                            {
                                success: function () {
                                    newBlockView
                                        .$(".events-list")
                                        .append(
                                            "<div class='one-event' data-id='" +
                                                edit_block.get("_id") +
                                                "'><p class='title'>" +
                                                edit_block.get("title") +
                                                "</p><span class='remove-event u-delete'>Remove</span></div>"
                                        );
                                },
                            }
                        );
                    });
                    //Remove event
                    newBlockView.on("remove:event", function (value) {
                        if (container_id) {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _container: container_id,
                                _action: "remove_event",
                            });
                        } else {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _action: "remove_event",
                            });
                        }
                        //Set
                        edit_block.set({
                            event: value.event_id,
                        });
                        edit_block.save();
                    });
                    //Update block
                    newBlockView.on("update:block", function (value) {
                        if (container_id) {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _container: container_id,
                                _action: "edit",
                            });
                        } else {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _action: "edit",
                            });
                        }
                        //Set
                        edit_block.set({
                            title: value.title,
                            desc: value.desc,
                            label: value.label,
                            image_m: value.image_m,
                            image_l: value.image_l,
                            image_bg: value.image_bg,
                            embed: value.embed,
                            button_text: value.button_text,
                            button_url: value.button_url,
                            button_embed: value.button_embed,
                            buttonb_text: value.buttonb_text,
                            buttonb_url: value.buttonb_url,
                            buttonb_embed: value.buttonb_embed,
                            story_title: value.story_title,
                            story_text: value.story_text,
                            story_url: value.story_url,
                            orientation: value.orientation,
                            row_count: value.row_count,
                            shape: value.shape,
                        });
                        edit_block.save(
                            {},
                            {
                                success: function () {
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                },
                            }
                        );
                    });
                    //Update HTML block
                    newBlockView.on("update:htmlBlock", function (value) {
                        if (newBlockView.$(".redactor-box").length) {
                            var html = $R(".body-h-content", "source.getCode");
                            //Update
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _action: "edit",
                            });
                            edit_block.set({
                                html: html,
                            });
                            //Images
                            if (
                                richTextEditorFiles &&
                                richTextEditorFiles.length
                            ) {
                                edit_block.set("images", richTextEditorFiles);
                            }
                            edit_block.save(
                                {},
                                {
                                    success: function () {
                                        $R(".body-h-content", "destroy");
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                    },
                                }
                            );
                        }
                    });
                    //Delete block
                    newBlockView.on("delete:block", function (value) {
                        if (container_id) {
                            //Remove sub block
                            var block = new DashManager.Entities.Block({
                                _id: container_id,
                                _action: "remove_block",
                            });
                            block.set({
                                sub_block: block_id,
                            });
                            block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                        location.reload();
                                    },
                                }
                            );
                        } else {
                            //Delete block
                            var block = new DashManager.Entities.Block({
                                _id: block_id,
                            });
                            block.destroy({
                                dataType: "text",
                                success: function (model, response) {
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                    DashManager.vent.trigger("remove:block");
                                },
                            });
                        }
                    });
                    DashManager.overlayRegion.show(newBlockView);
                });
            },
            showEditThemeOverlay: function (
                block_id,
                block_type,
                container_id
            ) {
                $(".overlay").show();
                //Fetch block
                var fetchingBlock = DashManager.request(
                    "block:entity",
                    block_id,
                    container_id
                );
                $.when(fetchingBlock).done(function (block) {
                    var blockThemeView =
                        new DashManager.DashApp.EntityViews.BlockThemeView({
                            model: block,
                        });
                    //Show
                    blockThemeView.on("show", function () {
                        setTimeout(function () {
                            blockThemeView
                                .$(".overlay-box")
                                .addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        DashManager.commands.execute("show:overlay");
                        //Show sections based on type
                        switch (block_type) {
                            case "body_text":
                            case "body_embed":
                            case "logos":
                            case "calendar":
                                blockThemeView
                                    .$(".expand-font, .expand-width")
                                    .removeClass("u-hide");
                                break;
                            case "body_html":
                                blockThemeView
                                    .$(".expand-width")
                                    .removeClass("u-hide");
                                break;
                            case "people":
                            case "breather":
                                blockThemeView
                                    .$(".expand-font")
                                    .removeClass("u-hide");
                                break;
                        }
                        //Show paste theme
                        if (Cookies.get("theme")) {
                            blockThemeView
                                .$(".js-paste-theme")
                                .removeClass("u-hide");
                        }
                        //Show color picker
                        $(".js-show-colorpicker")
                            .ColorPicker({
                                onSubmit: function (hsb, hex, rgb, el) {
                                    $(el).val("#" + hex);
                                    $(el).ColorPickerHide();
                                },
                                onBeforeShow: function () {
                                    $(this).ColorPickerSetColor(this.value);
                                },
                            })
                            .bind("keyup", function () {
                                $(this).ColorPickerSetColor(this.value);
                            });
                        //Fill values
                        //Width
                        if (block.get("width")) {
                            var elementClass = ".choose-" + block.get("width");
                            blockThemeView.$(elementClass).addClass("selected");
                        }
                        //Width percentage
                        if (block.get("width_pct")) {
                            blockThemeView
                                .$(".width-pct")
                                .val(block.get("width_pct"));
                        }
                        //Color
                        if (block.get("color")) {
                            if (block.get("color").bg) {
                                blockThemeView
                                    .$(".color-bg")
                                    .val(block.get("color").bg);
                            }
                            if (block.get("color").text) {
                                blockThemeView
                                    .$(".color-text")
                                    .val(block.get("color").text);
                            }
                            if (block.get("color").btn_bg) {
                                blockThemeView
                                    .$(".color-btn-bg")
                                    .val(block.get("color").btn_bg);
                            }
                            if (block.get("color").btn_text) {
                                blockThemeView
                                    .$(".color-btn-text")
                                    .val(block.get("color").btn_text);
                            }
                        }
                        //Theme
                        if (block.get("theme")) {
                            blockThemeView
                                .$(".block-themes ." + block.get("theme"))
                                .addClass("selected");
                        }
                        //Gradient
                        if (block.get("gradient")) {
                            if (block.get("gradient").angle >= 0) {
                                blockThemeView
                                    .$(".gradient-angle")
                                    .val(block.get("gradient").angle);
                            }
                            if (block.get("gradient").start) {
                                blockThemeView
                                    .$(".gradient-start")
                                    .val(block.get("gradient").start);
                            }
                            if (block.get("gradient").middle) {
                                blockThemeView
                                    .$(".gradient-middle")
                                    .val(block.get("gradient").middle);
                            }
                            if (block.get("gradient").end) {
                                blockThemeView
                                    .$(".gradient-end")
                                    .val(block.get("gradient").end);
                            }
                        }
                        //Padding
                        if (block.get("padding")) {
                            if (block.get("padding").top >= 0) {
                                blockThemeView
                                    .$(".padding-top")
                                    .val(block.get("padding").top);
                            }
                            if (block.get("padding").right >= 0) {
                                blockThemeView
                                    .$(".padding-right")
                                    .val(block.get("padding").right);
                            }
                            if (block.get("padding").bottom >= 0) {
                                blockThemeView
                                    .$(".padding-bottom")
                                    .val(block.get("padding").bottom);
                            }
                            if (block.get("padding").left >= 0) {
                                blockThemeView
                                    .$(".padding-left")
                                    .val(block.get("padding").left);
                            }
                            if (block.get("padding").btn_top >= 0) {
                                blockThemeView
                                    .$(".padding-btn-top")
                                    .val(block.get("padding").btn_top);
                            }
                            if (block.get("padding").btn_right >= 0) {
                                blockThemeView
                                    .$(".padding-btn-right")
                                    .val(block.get("padding").btn_right);
                            }
                            if (block.get("padding").btn_bottom >= 0) {
                                blockThemeView
                                    .$(".padding-btn-bottom")
                                    .val(block.get("padding").btn_bottom);
                            }
                            if (block.get("padding").btn_left >= 0) {
                                blockThemeView
                                    .$(".padding-btn-left")
                                    .val(block.get("padding").btn_left);
                            }
                        }
                        //Margin
                        if (block.get("margin")) {
                            if (block.get("margin").top >= 0) {
                                blockThemeView
                                    .$(".margin-top")
                                    .val(block.get("margin").top);
                            }
                            if (block.get("margin").right >= 0) {
                                blockThemeView
                                    .$(".margin-right")
                                    .val(block.get("margin").right);
                            }
                            if (block.get("margin").bottom >= 0) {
                                blockThemeView
                                    .$(".margin-bottom")
                                    .val(block.get("margin").bottom);
                            }
                            if (block.get("margin").left >= 0) {
                                blockThemeView
                                    .$(".margin-left")
                                    .val(block.get("margin").left);
                            }
                            if (block.get("margin").btn_top >= 0) {
                                blockThemeView
                                    .$(".margin-btn-top")
                                    .val(block.get("margin").btn_top);
                            }
                            if (block.get("margin").btn_right >= 0) {
                                blockThemeView
                                    .$(".margin-btn-right")
                                    .val(block.get("margin").btn_right);
                            }
                            if (block.get("margin").btn_bottom >= 0) {
                                blockThemeView
                                    .$(".margin-btn-bottom")
                                    .val(block.get("margin").btn_bottom);
                            }
                            if (block.get("margin").btn_left >= 0) {
                                blockThemeView
                                    .$(".margin-btn-left")
                                    .val(block.get("margin").btn_left);
                            }
                        }
                        //Border
                        if (block.get("border")) {
                            if (block.get("border").top >= 0) {
                                blockThemeView
                                    .$(".border-top")
                                    .val(block.get("border").top);
                            }
                            if (block.get("border").right >= 0) {
                                blockThemeView
                                    .$(".border-right")
                                    .val(block.get("border").right);
                            }
                            if (block.get("border").bottom >= 0) {
                                blockThemeView
                                    .$(".border-bottom")
                                    .val(block.get("border").bottom);
                            }
                            if (block.get("border").left >= 0) {
                                blockThemeView
                                    .$(".border-left")
                                    .val(block.get("border").left);
                            }
                            if (block.get("border").color) {
                                blockThemeView
                                    .$(".border-color")
                                    .val(block.get("border").color);
                            }
                            if (block.get("border").radius >= 0) {
                                blockThemeView
                                    .$(".border-radius")
                                    .val(block.get("border").radius);
                            }
                            if (block.get("border").btn_top >= 0) {
                                blockThemeView
                                    .$(".border-btn-top")
                                    .val(block.get("border").btn_top);
                            }
                            if (block.get("border").btn_right >= 0) {
                                blockThemeView
                                    .$(".border-btn-right")
                                    .val(block.get("border").btn_right);
                            }
                            if (block.get("border").btn_bottom >= 0) {
                                blockThemeView
                                    .$(".border-btn-bottom")
                                    .val(block.get("border").btn_bottom);
                            }
                            if (block.get("border").btn_left >= 0) {
                                blockThemeView
                                    .$(".border-btn-left")
                                    .val(block.get("border").btn_left);
                            }
                            if (block.get("border").btn_color) {
                                blockThemeView
                                    .$(".border-btn-color")
                                    .val(block.get("border").btn_color);
                            }
                            if (block.get("border").btn_radius >= 0) {
                                blockThemeView
                                    .$(".border-btn-radius")
                                    .val(block.get("border").btn_radius);
                            }
                        }
                        //Text style and size
                        if (block.get("font")) {
                            if (block.get("font").style) {
                                blockThemeView
                                    .$(
                                        ".style-select .choose-" +
                                            block.get("font").style
                                    )
                                    .addClass("selected");
                            }
                            if (block.get("font").size) {
                                blockThemeView
                                    .$(".font-size")
                                    .val(block.get("font").size);
                            }
                        }
                        //Alignment
                        if (block.get("alignment")) {
                            blockThemeView
                                .$(
                                    ".alignment-select .choose-" +
                                        block.get("alignment")
                                )
                                .addClass("selected");
                        }
                        //Show view-select if container or people
                        if (
                            block.get("type") == "container" ||
                            block.get("type") == "people"
                        ) {
                            if (
                                block.get("formula") &&
                                block.get("formula") == "tags"
                            ) {
                                blockThemeView
                                    .$(".view-select .choose-list")
                                    .removeClass("u-hide");
                                blockThemeView
                                    .$(".view-select .choose-mixed")
                                    .removeClass("u-hide");
                            }
                            if (block.get("container_view")) {
                                blockThemeView
                                    .$(
                                        ".view-select .choose-" +
                                            block.get("container_view")
                                    )
                                    .addClass("selected");
                            }
                            blockThemeView
                                .$(".view-select")
                                .removeClass("u-hide");
                        }
                    });
                    //Update block theme
                    blockThemeView.on("update:theme", function (value) {
                        //Update
                        if (container_id) {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _container: container_id,
                                _action: "edit",
                            });
                        } else {
                            var edit_block = new DashManager.Entities.Block({
                                _id: block_id,
                                _action: "edit",
                            });
                        }
                        //Set
                        edit_block.set({
                            width: value.width,
                            width_pct: value.width_pct,
                            color_bg: value.color_bg,
                            color_text: value.color_text,
                            color_btn_bg: value.color_btn_bg,
                            color_btn_text: value.color_btn_text,
                            theme: value.theme,
                            gradient_angle: value.gradient_angle,
                            gradient_start: value.gradient_start,
                            gradient_middle: value.gradient_middle,
                            gradient_end: value.gradient_end,
                            padding_top: value.padding_top,
                            padding_right: value.padding_right,
                            padding_bottom: value.padding_bottom,
                            padding_left: value.padding_left,
                            padding_btn_top: value.padding_btn_top,
                            padding_btn_right: value.padding_btn_right,
                            padding_btn_bottom: value.padding_btn_bottom,
                            padding_btn_left: value.padding_btn_left,
                            margin_top: value.margin_top,
                            margin_right: value.margin_right,
                            margin_bottom: value.margin_bottom,
                            margin_left: value.margin_left,
                            margin_btn_top: value.margin_btn_top,
                            margin_btn_right: value.margin_btn_right,
                            margin_btn_bottom: value.margin_btn_bottom,
                            margin_btn_left: value.margin_btn_left,
                            border_top: value.border_top,
                            border_right: value.border_right,
                            border_bottom: value.border_bottom,
                            border_left: value.border_left,
                            border_color: value.border_color,
                            border_radius: value.border_radius,
                            border_btn_top: value.border_btn_top,
                            border_btn_right: value.border_btn_right,
                            border_btn_bottom: value.border_btn_bottom,
                            border_btn_left: value.border_btn_left,
                            border_btn_color: value.border_btn_color,
                            border_btn_radius: value.border_btn_radius,
                            font_size: value.font_size,
                            font_style: value.font_style,
                            alignment: value.alignment,
                            container_view: value.container_view,
                        });
                        edit_block.save(
                            {},
                            {
                                success: function () {
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                },
                            }
                        );
                    });
                    DashManager.overlayRegion.show(blockThemeView);
                });
            },
            showBlockTagsOverlay: function (block_id) {
                $(".overlay").show();
                var excluded_tags = [];
                //Fetch block
                var fetchingBlock = DashManager.request(
                    "block:entity",
                    block_id
                );
                $.when(fetchingBlock).done(function (block) {
                    var tags = new Backbone.Collection(block.get("tags"));
                    var blockTagsView =
                        new DashManager.DashApp.EntityViews.BlockTagsView({
                            collection: tags,
                        });
                    //Show
                    blockTagsView.on("show", function () {
                        //Animate overlay box
                        setTimeout(function () {
                            blockTagsView.$(".overlay-box").addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        DashManager.commands.execute("show:overlay");
                        //Add previous tag ids to excluded ids
                        if (block.get("tags") && block.get("tags").length) {
                            var all_tags = block.get("tags");
                            for (var i = 0; i < all_tags.length; i++) {
                                excluded_tags.push(all_tags[i].name);
                            }
                        }
                        //Typeahead for block tags
                        //Remote fetch tag list
                        var tagList = new Bloodhound({
                            datumTokenizer:
                                Bloodhound.tokenizers.obj.whitespace("value"),
                            queryTokenizer:
                                Bloodhound.tokenizers.obj.whitespace,
                            remote: {
                                url: "/api/search/articleTags?name=%QUERY&excluded=%EXCLUDED",
                                replace: function (url) {
                                    return url
                                        .replace(
                                            "%EXCLUDED",
                                            JSON.stringify(excluded_tags)
                                        )
                                        .replace(
                                            "%QUERY",
                                            blockTagsView
                                                .$(".tags-input.tt-input")
                                                .val()
                                        );
                                },
                                filter: function (parsedResponse) {
                                    return parsedResponse;
                                },
                            },
                        });
                        //Initialize tagList
                        tagList.initialize();
                        //Show typeahead
                        blockTagsView.$(".tags-input").typeahead(
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
                                        "No such tag found.",
                                        "</div>",
                                    ].join("\n"),
                                    suggestion: Handlebars.compile(
                                        "<p class='name'>{{name}}</p><p class='count'>{{count}} articles</p>"
                                    ),
                                },
                            }
                        );
                        //Focus
                        blockTagsView.$(".tags-input").focus();
                        //Add new related page on typeahead autocomplete
                        blockTagsView
                            .$(".tags-input")
                            .on(
                                "typeahead:selected typeahead:autocompleted",
                                function (e, datum) {
                                    var new_tag =
                                        new DashManager.Entities.Block({
                                            _id: block_id,
                                            _action: "add_tag",
                                        });
                                    new_tag.set({
                                        tag: datum.name,
                                    });
                                    new_tag.save(
                                        {},
                                        {
                                            success: function () {
                                                var $input =
                                                    blockTagsView.$(
                                                        ".tags-input"
                                                    );
                                                $input
                                                    .typeahead("val", "")
                                                    .focus();
                                                //Add tag
                                                var tag = new_tag.toJSON();
                                                tags.add(tag);
                                                //Add to excluded
                                                excluded_tags.push(datum.name);
                                            },
                                        }
                                    );
                                }
                            );
                    });
                    //Remove tag
                    blockTagsView.on(
                        "childview:remove:tag",
                        function (childView, model) {
                            var block = new DashManager.Entities.Block({
                                _id: block_id,
                                _action: "remove_tag",
                            });
                            block.set({
                                tag: model.tag_id,
                            });
                            block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        childView.$el.remove();
                                        var index = excluded_tags.indexOf(
                                            model.tag_name
                                        );
                                        if (index > -1) {
                                            excluded_tags.splice(index, 1);
                                        }
                                    },
                                }
                            );
                        }
                    );
                    DashManager.overlayRegion.show(blockTagsView);
                });
            },
            showNewArticleOverlay: function () {
                $(".overlay").show();
                //New article view
                var newArticleView =
                    new DashManager.DashApp.EntityViews.NewArticleView();
                //Show
                newArticleView.on("show", function () {
                    //Animate overlay box
                    setTimeout(function () {
                        newArticleView.$(".overlay-box").addClass("animate");
                    }, 100);
                    //Hide scroll on main page
                    DashManager.commands.execute("show:overlay");
                    //Focus
                    newArticleView.$(".article-title").focus();
                });
                //Save
                newArticleView.on("save:article", function (value) {
                    var new_article = new DashManager.Entities.Block({
                        type: "content",
                        title: value.title,
                        desc: value.desc,
                        image: value.image,
                        meta: value.meta,
                        ref: value.ref,
                        embed: value.embed,
                        category: value.category,
                        style: value.style,
                        feed: value.feed,
                        country: value.country,
                        lat: value.lat,
                        long: value.long,
                        folder: value.folder,
                    });
                    new_article.save(
                        {},
                        {
                            success: function () {
                                DashManager.vent.trigger(
                                    "add:article",
                                    new_article
                                );
                                DashManager.commands.execute("close:overlay");
                            },
                        }
                    );
                });
                DashManager.overlayRegion.show(newArticleView);
            },
            showArticlePersonsOverlay: function (article_id) {
                $(".overlay").show();
                var excluded_ids = [];
                //Fetch article
                var fetchingArticle = DashManager.request(
                    "block:entity",
                    article_id
                );
                $.when(fetchingArticle).done(function (article) {
                    var persons = new Backbone.Collection(
                        article.get("people")
                    );
                    var personsView =
                        new DashManager.DashApp.EntityViews.PersonsListView({
                            collection: persons,
                        });
                    //Show
                    personsView.on("show", function () {
                        //Animate overlay box
                        setTimeout(function () {
                            personsView.$(".overlay-box").addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        DashManager.commands.execute("show:overlay");
                        //Add previous persons ids to excluded ids
                        if (
                            article.get("people") &&
                            article.get("people").length
                        ) {
                            var article_persons = article.get("people");
                            for (var i = 0; i < article_persons.length; i++) {
                                excluded_ids.push(article_persons[i]._id);
                            }
                        }
                        //Typeahead for persons
                        //Remote fetch person list
                        var personList = new Bloodhound({
                            datumTokenizer:
                                Bloodhound.tokenizers.obj.whitespace("value"),
                            queryTokenizer:
                                Bloodhound.tokenizers.obj.whitespace,
                            remote: {
                                url: "/api/search/persons?text=%QUERY&excluded=%EXCLUDED",
                                replace: function (url) {
                                    return url
                                        .replace(
                                            "%EXCLUDED",
                                            JSON.stringify(excluded_ids)
                                        )
                                        .replace(
                                            "%QUERY",
                                            personsView
                                                .$(".person-input.tt-input")
                                                .val()
                                        );
                                },
                                filter: function (parsedResponse) {
                                    return parsedResponse;
                                },
                            },
                        });
                        //Initialize personlist
                        personList.initialize();
                        //Show typeahead
                        personsView.$(".person-input").typeahead(
                            {
                                hint: true,
                                highlight: true,
                                minLength: 1,
                            },
                            {
                                name: "email",
                                displayKey: "name",
                                limit: 5,
                                source: personList.ttAdapter(),
                                templates: {
                                    empty: [
                                        '<div class="no-find">',
                                        "No such user exists. Add new in People tab.",
                                        "</div>",
                                    ].join("\n"),
                                    suggestion: Handlebars.compile(
                                        "<p class='name'>{{name}}</p><p class='email'>{{email}}</p>"
                                    ),
                                },
                            }
                        );
                        //Focus
                        personsView.$(".person-input").focus();
                        //Add new person on typeahead autocomplete
                        personsView
                            .$(".person-input")
                            .on(
                                "typeahead:selected typeahead:autocompleted",
                                function (e, datum) {
                                    var new_person =
                                        new DashManager.Entities.Block({
                                            _id: article_id,
                                            _action: "add_person",
                                        });
                                    new_person.set({
                                        person: datum._id,
                                    });
                                    new_person.save(
                                        {},
                                        {
                                            success: function () {
                                                var $input =
                                                    personsView.$(
                                                        ".person-input"
                                                    );
                                                $input
                                                    .typeahead("val", "")
                                                    .focus();
                                                //Add person
                                                persons.add(new_person);
                                                //Add to excluded
                                                excluded_ids.push(datum._id);
                                            },
                                        }
                                    );
                                }
                            );
                    });
                    //Remove person
                    personsView.on(
                        "childview:remove:person",
                        function (childView, model) {
                            var block = new DashManager.Entities.Block({
                                _id: article_id,
                                _action: "remove_person",
                            });
                            block.set({
                                person: model.person_id,
                            });
                            block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        childView.$el.remove();
                                        var index = excluded_ids.indexOf(
                                            model.person_id
                                        );
                                        if (index > -1) {
                                            excluded_ids.splice(index, 1);
                                        }
                                    },
                                }
                            );
                        }
                    );
                    DashManager.overlayRegion.show(personsView);
                });
            },
            showRelatedPagesOverlay: function (article_id) {
                $(".overlay").show();
                var excluded_ids = [];
                //Fetch article
                var fetchingArticle = DashManager.request(
                    "block:entity",
                    article_id
                );
                $.when(fetchingArticle).done(function (article) {
                    var related_pages = new Backbone.Collection(
                        article.get("related")
                    );
                    var relatedPagesView =
                        new DashManager.DashApp.EntityViews.RelatedPagesView({
                            collection: related_pages,
                        });
                    //Show
                    relatedPagesView.on("show", function () {
                        //Animate overlay box
                        setTimeout(function () {
                            relatedPagesView
                                .$(".overlay-box")
                                .addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        DashManager.commands.execute("show:overlay");
                        //Add previous related page ids to excluded ids
                        if (
                            article.get("related") &&
                            article.get("related").length
                        ) {
                            var article_related = article.get("related");
                            for (var i = 0; i < article_related.length; i++) {
                                excluded_ids.push(article_related[i]._id);
                            }
                        }
                        //Typeahead for related page
                        //Remote fetch related pages list
                        var relatedList = new Bloodhound({
                            datumTokenizer:
                                Bloodhound.tokenizers.obj.whitespace("value"),
                            queryTokenizer:
                                Bloodhound.tokenizers.obj.whitespace,
                            remote: {
                                url: "/api/search/projectsAndEvents?text=%QUERY&excluded=%EXCLUDED",
                                replace: function (url) {
                                    return url
                                        .replace(
                                            "%EXCLUDED",
                                            JSON.stringify(excluded_ids)
                                        )
                                        .replace(
                                            "%QUERY",
                                            relatedPagesView
                                                .$(".related-input.tt-input")
                                                .val()
                                        );
                                },
                                filter: function (parsedResponse) {
                                    return parsedResponse;
                                },
                            },
                        });
                        //Initialize relatedlist
                        relatedList.initialize();
                        //Show typeahead
                        relatedPagesView.$(".related-input").typeahead(
                            {
                                hint: true,
                                highlight: true,
                                minLength: 1,
                            },
                            {
                                name: "title",
                                displayKey: "title",
                                limit: 5,
                                source: relatedList.ttAdapter(),
                                templates: {
                                    empty: [
                                        '<div class="no-find">',
                                        "No such project or event exists. Add new in Pages tab.",
                                        "</div>",
                                    ].join("\n"),
                                    suggestion: Handlebars.compile(
                                        "<p class='name'>{{title}}</p>"
                                    ),
                                },
                            }
                        );
                        //Focus
                        relatedPagesView.$(".related-input").focus();
                        //Add new related page on typeahead autocomplete
                        relatedPagesView
                            .$(".related-input")
                            .on(
                                "typeahead:selected typeahead:autocompleted",
                                function (e, datum) {
                                    var new_related =
                                        new DashManager.Entities.Block({
                                            _id: article_id,
                                            _action: "add_page",
                                        });
                                    new_related.set({
                                        page: datum._id,
                                    });
                                    new_related.save(
                                        {},
                                        {
                                            success: function () {
                                                var $input =
                                                    relatedPagesView.$(
                                                        ".related-input"
                                                    );
                                                $input
                                                    .typeahead("val", "")
                                                    .focus();
                                                //Add person
                                                related_pages.add(new_related);
                                                //Add to excluded
                                                excluded_ids.push(datum._id);
                                            },
                                        }
                                    );
                                }
                            );
                    });
                    //Remove related
                    relatedPagesView.on(
                        "childview:remove:related",
                        function (childView, model) {
                            var block = new DashManager.Entities.Block({
                                _id: article_id,
                                _action: "remove_page",
                            });
                            block.set({
                                page: model.page_id,
                            });
                            block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        childView.$el.remove();
                                        var index = excluded_ids.indexOf(
                                            model.page_id
                                        );
                                        if (index > -1) {
                                            excluded_ids.splice(index, 1);
                                        }
                                    },
                                }
                            );
                        }
                    );
                    DashManager.overlayRegion.show(relatedPagesView);
                });
            },
            showArticleTagsOverlay: function (article_id) {
                $(".overlay").show();
                var excluded_tags = [];
                //Fetch article
                var fetchingArticle = DashManager.request(
                    "block:entity",
                    article_id
                );
                $.when(fetchingArticle).done(function (article) {
                    var tags = new Backbone.Collection(article.get("tags"));
                    var articleTagsView =
                        new DashManager.DashApp.EntityViews.ArticleTagsView({
                            collection: tags,
                        });
                    //Show
                    articleTagsView.on("show", function () {
                        //Animate overlay box
                        setTimeout(function () {
                            articleTagsView
                                .$(".overlay-box")
                                .addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        DashManager.commands.execute("show:overlay");
                        //Add previous tag ids to excluded ids
                        if (article.get("tags") && article.get("tags").length) {
                            var all_tags = article.get("tags");
                            for (var i = 0; i < all_tags.length; i++) {
                                excluded_tags.push(all_tags[i].name);
                            }
                        }
                        //Typeahead for article tags
                        //Remote fetch tag list
                        var tagList = new Bloodhound({
                            datumTokenizer:
                                Bloodhound.tokenizers.obj.whitespace("value"),
                            queryTokenizer:
                                Bloodhound.tokenizers.obj.whitespace,
                            remote: {
                                url: "/api/search/articleTags?name=%QUERY&excluded=%EXCLUDED",
                                replace: function (url) {
                                    return url
                                        .replace(
                                            "%EXCLUDED",
                                            JSON.stringify(excluded_tags)
                                        )
                                        .replace(
                                            "%QUERY",
                                            articleTagsView
                                                .$(".tags-input.tt-input")
                                                .val()
                                        );
                                },
                                filter: function (parsedResponse) {
                                    return parsedResponse;
                                },
                            },
                        });
                        //Initialize tagList
                        tagList.initialize();
                        //Show typeahead
                        articleTagsView
                            .$(".tags-input")
                            .typeahead(
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
                                            "Press enter to add this tag.",
                                            "</div>",
                                        ].join("\n"),
                                        suggestion: Handlebars.compile(
                                            "<p class='name'>{{name}}</p><p class='count'>{{count}} articles</p>"
                                        ),
                                    },
                                }
                            )
                            .keyup(function (ev) {
                                var $input = articleTagsView.$(".tags-input");
                                var tag_name = $input.typeahead("val");
                                if (articleTagsView.$(".no-find").length) {
                                    if (ev.which == ENTER_KEY) {
                                        //Check if in excluded
                                        if (
                                            excluded_tags.indexOf(tag_name) > -1
                                        ) {
                                            $input.typeahead("val", "").focus();
                                            return;
                                        }
                                        //Add new tag
                                        var new_tag =
                                            new DashManager.Entities.Block({
                                                _id: article_id,
                                                _action: "add_tag",
                                            });
                                        new_tag.set({
                                            tag: tag_name,
                                        });
                                        new_tag.save(
                                            {},
                                            {
                                                success: function () {
                                                    $input
                                                        .typeahead("val", "")
                                                        .focus();
                                                    //Add tag
                                                    var tag = new_tag.toJSON();
                                                    tags.add(tag);
                                                    //Add to excluded
                                                    excluded_tags.push(
                                                        tag.name
                                                    );
                                                },
                                            }
                                        );
                                    }
                                }
                            });
                        //Focus
                        articleTagsView.$(".tags-input").focus();
                        //Add new related page on typeahead autocomplete
                        articleTagsView
                            .$(".tags-input")
                            .on(
                                "typeahead:selected typeahead:autocompleted",
                                function (e, datum) {
                                    var new_tag =
                                        new DashManager.Entities.Block({
                                            _id: article_id,
                                            _action: "add_tag",
                                        });
                                    new_tag.set({
                                        tag: datum.name,
                                    });
                                    new_tag.save(
                                        {},
                                        {
                                            success: function () {
                                                var $input =
                                                    articleTagsView.$(
                                                        ".tags-input"
                                                    );
                                                $input
                                                    .typeahead("val", "")
                                                    .focus();
                                                //Add tag
                                                var tag = new_tag.toJSON();
                                                tags.add(tag);
                                                //Add to excluded
                                                excluded_tags.push(tag.name);
                                            },
                                        }
                                    );
                                }
                            );
                    });
                    //Remove tag
                    articleTagsView.on(
                        "childview:remove:tag",
                        function (childView, model) {
                            var block = new DashManager.Entities.Block({
                                _id: article_id,
                                _action: "remove_tag",
                            });
                            block.set({
                                tag: model.tag_id,
                            });
                            block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        childView.$el.remove();
                                        var index = excluded_tags.indexOf(
                                            model.tag_name
                                        );
                                        if (index > -1) {
                                            excluded_tags.splice(index, 1);
                                        }
                                    },
                                }
                            );
                        }
                    );
                    DashManager.overlayRegion.show(articleTagsView);
                });
            },
            showEditArticleOverlay: function (article_id, is_folder) {
                $(".overlay").show();
                //Fetch article
                var fetchingArticle = DashManager.request(
                    "block:entity",
                    article_id
                );
                $.when(fetchingArticle).done(function (article) {
                    var newArticleView =
                        new DashManager.DashApp.EntityViews.NewArticleView();
                    //Show
                    newArticleView.on("show", function () {
                        //Add edit class
                        newArticleView.$(".overlay-box").addClass("edit-box");
                        //Animate overlay box
                        setTimeout(function () {
                            newArticleView
                                .$(".overlay-box")
                                .addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        DashManager.commands.execute("show:overlay");
                        //Check if folder
                        if (is_folder) {
                            newArticleView
                                .$(
                                    ".article-select, .article-desc, .article-urls, .article-images, .article-meta-image, .article-feed-label, .article-location"
                                )
                                .addClass("u-hide");
                            newArticleView
                                .$(".js-delete-article")
                                .removeClass("u-hide")
                                .addClass("js-delete-folder");
                            //Fill values
                            newArticleView
                                .$(".article-title")
                                .val(article.get("text").title)
                                .focus();
                        } else {
                            newArticleView
                                .$(".js-delete-article")
                                .removeClass("u-hide");
                            //Archive
                            if (article.get("is_archived")) {
                                newArticleView
                                    .$(".archive-btn")
                                    .removeClass("js-archive-article")
                                    .addClass("js-unarchive-article")
                                    .text("Unarchive");
                            }
                            newArticleView
                                .$(".archive-btn")
                                .removeClass("u-hide");
                            //Fill values
                            newArticleView
                                .$(".article-title")
                                .val(article.get("text").title)
                                .focus();
                            newArticleView
                                .$(".article-desc")
                                .val(article.get("text").desc);
                            newArticleView
                                .$(".article-image")
                                .val(article.get("image").m);
                            newArticleView
                                .$(".article-meta")
                                .val(article.get("image").meta);
                            newArticleView
                                .$(".article-feed")
                                .val(article.get("feed"));
                            //Location
                            if (article.get("location")) {
                                newArticleView
                                    .$(".article-country")
                                    .val(article.get("location").country);
                                newArticleView
                                    .$(".article-lat")
                                    .val(article.get("location").lat);
                                newArticleView
                                    .$(".article-long")
                                    .val(article.get("location").long);
                            }
                            //Slug
                            newArticleView
                                .$(".article-custom-url")
                                .removeClass("u-hide");
                            newArticleView
                                .$(".article-slug")
                                .val(article.get("slug"));
                            //Show category
                            var category = article.get("category");
                            if (category == "news") {
                                newArticleView
                                    .$(".choose-news")
                                    .addClass("selected");
                            } else if (category == "blog") {
                                newArticleView
                                    .$(".choose-blog")
                                    .addClass("selected");
                            } else if (category == "directors") {
                                newArticleView
                                    .$(".choose-directors")
                                    .addClass("selected");
                            } else if (category == "resources") {
                                newArticleView
                                    .$(".choose-resources")
                                    .addClass("selected");
                            }
                            //Show style
                            var style = article.get("style");
                            if (style == "normal") {
                                newArticleView
                                    .$(".choose-normal")
                                    .addClass("selected");
                            } else if (style == "bold") {
                                newArticleView
                                    .$(".choose-normal")
                                    .removeClass("selected");
                                newArticleView
                                    .$(".choose-bold")
                                    .addClass("selected");
                            }
                            //Show url
                            if (article.get("url")) {
                                var url =
                                    article.get("url").embed ||
                                    article.get("url").ref;
                                newArticleView.$(".article-url").val(url);
                            }
                        }
                    });
                    //Update article
                    newArticleView.on("update:article", function (value) {
                        var edit_article = new DashManager.Entities.Block({
                            _id: article_id,
                            _action: "edit",
                        });
                        edit_article.set({
                            title: value.title,
                            desc: value.desc,
                            slug: value.slug,
                            image: value.image,
                            meta: value.meta,
                            ref: value.ref,
                            embed: value.embed,
                            category: value.category,
                            style: value.style,
                            feed: value.feed,
                            country: value.country,
                            lat: value.lat,
                            long: value.long,
                        });
                        edit_article.save(
                            {},
                            {
                                success: function () {
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                },
                            }
                        );
                    });
                    //Archive article
                    newArticleView.on("archive:article", function (value) {
                        var edit_article = new DashManager.Entities.Block({
                            _id: article_id,
                            _action: "archive",
                        });
                        edit_article.set({});
                        edit_article.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    $(".selected-item").addClass("is-archived");
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                },
                            }
                        );
                    });
                    //Unarchive article
                    newArticleView.on("unarchive:article", function (value) {
                        var edit_article = new DashManager.Entities.Block({
                            _id: article_id,
                            _action: "unarchive",
                        });
                        edit_article.set({});
                        edit_article.save(
                            {},
                            {
                                dataType: "text",
                                success: function () {
                                    $(".selected-item").removeClass(
                                        "is-archived"
                                    );
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                },
                            }
                        );
                    });
                    //Delete article
                    newArticleView.on("delete:article", function (value) {
                        var block = new DashManager.Entities.Block({
                            _id: article_id,
                        });
                        block.destroy({
                            dataType: "text",
                            success: function (model, response) {
                                DashManager.commands.execute("close:overlay");
                                DashManager.vent.trigger(
                                    "remove:article",
                                    article_id
                                );
                                //Is folder
                                if (value) {
                                    DashManager.vent.trigger("articles:show");
                                }
                            },
                        });
                    });
                    DashManager.overlayRegion.show(newArticleView);
                });
            },
            showEditContentOverlay: function (article_id) {
                $(".overlay").show();
                //Fetch article
                var fetchingArticle = DashManager.request(
                    "block:entity",
                    article_id
                );
                $.when(fetchingArticle).done(function (article) {
                    var articleContentView =
                        new DashManager.DashApp.EntityViews.ArticleContentView({
                            model: article,
                        });
                    //Editor
                    var articleEditorFiles = [];
                    //Show
                    articleContentView.on("show", function () {
                        setTimeout(function () {
                            articleContentView
                                .$(".overlay-box")
                                .addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        DashManager.commands.execute("show:overlay");
                        //Editor
                        $R(".article-content", {
                            focus: true,
                            toolbarFixedTarget: ".overlay",
                            buttons: editor_btns,
                            plugins: editor_plugins,
                            formatting: editor_formatting,
                            imageUpload: "/api/upload",
                            callbacks: {
                                image: {
                                    uploaded: function (image, response) {
                                        articleEditorFiles.push(
                                            response.file.url
                                        );
                                    },
                                },
                            },
                        });
                    });
                    //Update article content
                    articleContentView.on("update:articleContent", function () {
                        if (articleContentView.$(".redactor-box").length) {
                            var html = $R(".article-content", "source.getCode");
                            //Update
                            var edit_article = new DashManager.Entities.Block({
                                _id: article_id,
                                _action: "edit",
                            });
                            edit_article.set({
                                html: html,
                            });
                            //Images
                            if (
                                articleEditorFiles &&
                                articleEditorFiles.length
                            ) {
                                var first_image = articleContentView
                                    .$(".article-content img")
                                    .attr("src");
                                edit_article.set("images", articleEditorFiles);
                                edit_article.set("thumbnail", first_image);
                            }
                            edit_article.save(
                                {},
                                {
                                    success: function () {
                                        $R(".article-content", "destroy");
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                    },
                                }
                            );
                        }
                    });
                    DashManager.overlayRegion.show(articleContentView);
                });
            },
            showArticles: function (type, text, folder_id) {
                $(window).off("scroll", scrollHandler);
                //Show search bar
                $(".searchWrap").removeClass("u-hide");
                //Show loading page
                var loadingView = new DashManager.Common.Views.Loading();
                DashManager.mainRegion.show(loadingView);
                //Select
                $(".nav-links a").removeClass("selected");
                $(".nav-links .js-articles").addClass("selected");
                //Fetching articles
                if (type == "search") {
                    var fetchingArticles = DashManager.request(
                        "search:entities",
                        "articles",
                        text
                    );
                } else {
                    var fetchingArticles = DashManager.request(
                        "article:entities",
                        type,
                        folder_id
                    );
                }
                //Fetch
                $.when(fetchingArticles).done(function (articles) {
                    var articlesView =
                        new DashManager.DashApp.EntityViews.ArticlesView({
                            collection: articles,
                        });
                    //Show
                    articlesView.on("show", function () {
                        //Add folder id
                        if (folder_id) {
                            articlesView
                                .$(".all-items")
                                .data("folder", folder_id);
                        }
                        //Masonry
                        articlesView.$(".all-items").masonry({
                            itemSelector: ".one-item",
                            columnWidth: 450,
                        });
                        //Choose filter
                        if (type != "search") {
                            var element = ".filter-items .filter-" + type;
                            articlesView.$(element).addClass("selected");
                        }
                        //Pagination
                        $(".loading-data")
                            .data("page", 1)
                            .removeClass("u-loaded");
                        //Check if less than page size
                        if (articles.length < PAGE_SIZE) {
                            $(".loading-data").addClass("u-loaded");
                        }
                        //Fetch more articles
                        scrollHandler = function () {
                            if (
                                $(window).scrollTop() + $(window).height() >
                                    $(document).height() - 50 &&
                                !$(".loading-data").hasClass("u-loaded") &&
                                !$(".loading-data").hasClass("u-loading")
                            ) {
                                $(".loading-data")
                                    .slideDown()
                                    .addClass("u-loading");
                                //Fetching more articles
                                if (type == "search") {
                                    var fetchingMoreArticles =
                                        DashManager.request(
                                            "search:entities",
                                            "articles",
                                            text,
                                            $(".loading-data").data("page") + 1
                                        );
                                } else {
                                    var fetchingMoreArticles =
                                        DashManager.request(
                                            "article:entities",
                                            type,
                                            folder_id,
                                            $(".loading-data").data("page") + 1
                                        );
                                }
                                //Fetch
                                $.when(fetchingMoreArticles).done(function (
                                    moreArticles
                                ) {
                                    articles.add(moreArticles.models);
                                    $(".loading-data")
                                        .data(
                                            "page",
                                            $(".loading-data").data("page") + 1
                                        )
                                        .slideUp()
                                        .removeClass("u-loading");
                                    if (moreArticles.length < PAGE_SIZE) {
                                        $(".loading-data").addClass("u-loaded");
                                    }
                                    //Find view by model and update masonry
                                    for (
                                        var i = 0;
                                        i < moreArticles.models.length;
                                        i++
                                    ) {
                                        var child =
                                            articlesView.children.findByModel(
                                                moreArticles.models[i]
                                            );
                                        articlesView
                                            .$(".all-items")
                                            .masonry("appended", child.$el);
                                    }
                                });
                            }
                        };
                        $(window).on("scroll", scrollHandler);
                    });
                    //Add article
                    DashManager.vent.off("add:article");
                    DashManager.vent.on("add:article", function (article) {
                        articles.add(article, { at: 0 });
                        articlesView
                            .$(".all-items")
                            .masonry("prepended", $(".one-item").eq(0));
                    });
                    //Remove article
                    DashManager.vent.off("remove:article");
                    DashManager.vent.on(
                        "remove:article",
                        function (article_id) {
                            var article = articles.get(article_id);
                            articles.remove(article);
                            //Update masonry
                            articlesView.$(".all-items").masonry("layout");
                        }
                    );
                    DashManager.mainRegion.show(articlesView);
                });
            },
            showArticleBlocks: function (article_id) {
                //Hide search bar
                $(".searchWrap").addClass("u-hide");
                //Show loading page
                var loadingView = new DashManager.Common.Views.Loading();
                DashManager.mainRegion.show(loadingView);
                //Select
                $(".nav-links a").removeClass("selected");
                $(".nav-links .js-articles").addClass("selected");
                //Fetch article
                var fetchingArticleBlocks = DashManager.request(
                    "articleBlock:entities",
                    article_id
                );
                $.when(fetchingArticleBlocks).done(function (articleBlocks) {
                    var articleBlocksView =
                        new DashManager.DashApp.EntityViews.ArticleBlocksView({
                            collection: articleBlocks,
                        });
                    //Show
                    articleBlocksView.on("show", function () {
                        articleBlocksView
                            .$(".all-blocks")
                            .data("block", article_id);
                    });
                    //Move up
                    articleBlocksView.on(
                        "childview:move:up",
                        function (childView, model) {
                            var block = new DashManager.Entities.ArticleBlock({
                                _id: model.get("_id"),
                                _action: "move_up",
                            });
                            block.set({});
                            block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        var index =
                                            articleBlocksView.collection.indexOf(
                                                model
                                            );
                                        if (index) {
                                            //Remove block
                                            articleBlocksView.collection.remove(
                                                model
                                            );
                                            //Add model at index-1
                                            articleBlocksView.collection.add(
                                                model,
                                                { at: index - 1 }
                                            );
                                            //Get new childView
                                            var blockView =
                                                articleBlocksView.children.findByModel(
                                                    model
                                                );
                                            //Update order
                                            var order =
                                                blockView.$el.data("order");
                                            blockView.$el.attr(
                                                "data-order",
                                                order - 1
                                            );
                                            blockView.$el
                                                .next()
                                                .attr("data-order", order);
                                        }
                                    },
                                }
                            );
                        }
                    );
                    //Move down
                    articleBlocksView.on(
                        "childview:move:down",
                        function (childView, model) {
                            var block = new DashManager.Entities.ArticleBlock({
                                _id: model.get("_id"),
                                _action: "move_down",
                            });
                            block.set({});
                            block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        var index =
                                            articleBlocks.indexOf(model);
                                        //Remove block
                                        articleBlocks.remove(model);
                                        //Add model at index+1
                                        articleBlocks.add(model, {
                                            at: index + 1,
                                        });
                                        //Get new childView
                                        var blockView =
                                            articleBlocksView.children.findByModel(
                                                model
                                            );
                                        //Update order
                                        var order = blockView.$el.data("order");
                                        blockView.$el.attr(
                                            "data-order",
                                            order + 1
                                        );
                                        blockView.$el
                                            .prev()
                                            .attr("data-order", order);
                                    },
                                }
                            );
                        }
                    );
                    //Add block
                    DashManager.vent.off("add:articleBlock");
                    DashManager.vent.on("add:articleBlock", function (block) {
                        var order = block.get("order");
                        articleBlocks.add(block, { at: order });
                    });
                    //Remove block
                    DashManager.vent.off("remove:articleBlock");
                    DashManager.vent.on("remove:articleBlock", function () {
                        location.reload();
                    });
                    DashManager.mainRegion.show(articleBlocksView);
                });
            },
            showAllArticleBlocksOverlay: function () {
                $(".overlay").show();
                //All article blocks view
                var allArticleBlocksView =
                    new DashManager.DashApp.EntityViews.AllArticleBlocksView();
                //Show
                allArticleBlocksView.on("show", function () {
                    //Animate overlay box
                    setTimeout(function () {
                        allArticleBlocksView
                            .$(".overlay-box")
                            .addClass("animate");
                    }, 100);
                    //Hide scroll on main page
                    DashManager.commands.execute("show:overlay");
                });
                DashManager.overlayRegion.show(allArticleBlocksView);
            },
            showNewArticleBlockOverlay: function (type) {
                var excluded_ids = [];
                //New article block view
                var newArticleBlockView =
                    new DashManager.DashApp.EntityViews.NewArticleBlockView();
                //Editor
                var richTextEditorFiles = [];
                //Show
                newArticleBlockView.on("show", function () {
                    newArticleBlockView.$(".overlay-box").addClass("animate");
                    //Show section based on type
                    var class_name = ".new-block-panel .block-" + type;
                    newArticleBlockView.$(class_name).removeClass("u-hide");
                    switch (type) {
                        case "text":
                            //Editor
                            $R(".body-h-content", {
                                focus: true,
                                toolbarFixedTarget: ".overlay",
                                buttons: editor_btns,
                                plugins: editor_plugins,
                                formatting: editor_formatting,
                                imageUpload: "/api/upload",
                                callbacks: {
                                    image: {
                                        uploaded: function (image, response) {
                                            richTextEditorFiles.push(
                                                response.file.url
                                            );
                                        },
                                    },
                                },
                            });
                            break;
                        case "gallery":
                            newArticleBlockView
                                .$(".block-gallery .body-c-title")
                                .focus();
                            break;
                        case "audio":
                        case "video":
                        case "file":
                            newArticleBlockView
                                .$(".block-file .block-file-title")
                                .focus();
                            //Upload
                            newArticleBlockView
                                .$(".direct-upload")
                                .each(function () {
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
                                            if (
                                                data.files[0].size >=
                                                MAX_FILE_SIZE
                                            )
                                                return;
                                            fileCount += 1;
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
                                            $("#drop span").html(
                                                "Uploaded <b></b>"
                                            );
                                        },
                                        progressall: function (e, data) {
                                            var progress = parseInt(
                                                (data.loaded / data.total) *
                                                    100,
                                                10
                                            );
                                            $("#drop span b").text(
                                                progress + "%"
                                            ); // Update progress bar percentage
                                        },
                                        fail: function (e, data) {
                                            $("#drop span").html(
                                                "Choose files or drag and drop them here"
                                            );
                                        },
                                        done: function (e, data) {
                                            var file_name = data.files[0].name;
                                            //Get extension of the file
                                            var index =
                                                file_name.lastIndexOf(".");
                                            var file_ext = file_name.substring(
                                                index + 1,
                                                file_name.length
                                            );
                                            //Get block title
                                            if (
                                                newArticleBlockView
                                                    .$(".block-file-title")
                                                    .val()
                                            ) {
                                                var block_title =
                                                    newArticleBlockView
                                                        .$(".block-file-title")
                                                        .val()
                                                        .trim();
                                            } else {
                                                var block_title =
                                                    decodeURIComponent(
                                                        file_name.substring(
                                                            0,
                                                            index
                                                        )
                                                    );
                                            }
                                            //Url
                                            var url =
                                                "https://d1c337161ud3pr.cloudfront.net/" +
                                                encodeURIComponent(
                                                    data.files[0].s3Url
                                                )
                                                    .replace(/'/g, "%27")
                                                    .replace(/"/g, "%22");
                                            //Get extension
                                            var image_extensions = [
                                                "jpg",
                                                "png",
                                                "gif",
                                                "jpeg",
                                            ];
                                            if (
                                                image_extensions.indexOf(
                                                    file_ext
                                                ) < 0
                                            ) {
                                                //Save file
                                                var new_block =
                                                    new DashManager.Entities.ArticleBlock(
                                                        {
                                                            type: type,
                                                            title: block_title,
                                                            provider: {
                                                                name: "MGIEP",
                                                                url: url,
                                                            },
                                                            file: {
                                                                size: data
                                                                    .files[0]
                                                                    .size,
                                                                ext: file_ext,
                                                            },
                                                            block: $(
                                                                ".all-blocks"
                                                            ).data("block"),
                                                        }
                                                    );
                                                //Order
                                                if (
                                                    $(".one-block").hasClass(
                                                        "selected"
                                                    )
                                                ) {
                                                    var order =
                                                        $(
                                                            ".one-block.selected"
                                                        ).data("order") + 1;
                                                } else {
                                                    var num_blocks = $(
                                                        ".all-blocks .one-block"
                                                    ).length;
                                                    var order = num_blocks + 1;
                                                }
                                                new_block.set("order", order);
                                                //Save block
                                                new_block.save(
                                                    {},
                                                    {
                                                        success: function () {
                                                            uploadCount += 1;
                                                            DashManager.commands.execute(
                                                                "close:overlay"
                                                            );
                                                            DashManager.vent.trigger(
                                                                "add:articleBlock",
                                                                new_block
                                                            );
                                                        },
                                                    }
                                                );
                                            } else {
                                                //Save image
                                                var new_block =
                                                    new DashManager.Entities.ArticleBlock(
                                                        {
                                                            type: "image",
                                                            title: block_title,
                                                            provider: {
                                                                name: "MGIEP",
                                                                url: url,
                                                            },
                                                            file: {
                                                                size: data
                                                                    .files[0]
                                                                    .size,
                                                                ext: file_ext,
                                                            },
                                                            image: url,
                                                            block: $(
                                                                ".all-blocks"
                                                            ).data("block"),
                                                        }
                                                    );
                                                //Order
                                                if (
                                                    $(".one-block").hasClass(
                                                        "selected"
                                                    )
                                                ) {
                                                    var order =
                                                        $(
                                                            ".one-block.selected"
                                                        ).data("order") + 1;
                                                } else {
                                                    var num_blocks = $(
                                                        ".all-blocks .one-block"
                                                    ).length;
                                                    var order = num_blocks + 1;
                                                }
                                                new_block.set("order", order);
                                                //Image
                                                var image = new Image();
                                                image.src =
                                                    window.URL.createObjectURL(
                                                        data.files[0]
                                                    );
                                                image.onload = function () {
                                                    var bound =
                                                        (image.naturalHeight *
                                                            400) /
                                                        image.naturalWidth;
                                                    if (bound) {
                                                        bound = parseInt(bound);
                                                        new_block.set(
                                                            "bound",
                                                            bound
                                                        );
                                                    }
                                                    window.URL.revokeObjectURL(
                                                        image.src
                                                    );
                                                    //Save block
                                                    new_block.save(
                                                        {},
                                                        {
                                                            success:
                                                                function () {
                                                                    uploadCount += 1;
                                                                    DashManager.commands.execute(
                                                                        "close:overlay"
                                                                    );
                                                                    DashManager.vent.trigger(
                                                                        "add:articleBlock",
                                                                        new_block
                                                                    );
                                                                },
                                                        }
                                                    );
                                                };
                                                image.onerror = function () {
                                                    //Save block
                                                    new_block.save(
                                                        {},
                                                        {
                                                            success:
                                                                function () {
                                                                    uploadCount += 1;
                                                                    DashManager.commands.execute(
                                                                        "close:overlay"
                                                                    );
                                                                    DashManager.vent.trigger(
                                                                        "add:articleBlock",
                                                                        new_block
                                                                    );
                                                                },
                                                        }
                                                    );
                                                };
                                            }
                                        },
                                    });
                                });
                            break;
                        case "gif":
                            newArticleBlockView
                                .$(".block-gif .search-gifs")
                                .focus();
                            break;
                        case "link":
                            newArticleBlockView
                                .$(".block-link .link-embed")
                                .focus();
                            break;
                        case "embed":
                            newArticleBlockView
                                .$(".block-embed .block-embed-code")
                                .focus();
                            break;
                        case "toggle":
                            newArticleBlockView
                                .$(".block-toggle .block-toggle-title")
                                .focus();
                            break;
                        case "callout":
                            newArticleBlockView
                                .$(".block-callout .block-callout-title")
                                .focus();
                            break;
                        case "people":
                            //Typeahead for persons
                            //Remote fetch person list
                            var personList = new Bloodhound({
                                datumTokenizer:
                                    Bloodhound.tokenizers.obj.whitespace(
                                        "value"
                                    ),
                                queryTokenizer:
                                    Bloodhound.tokenizers.obj.whitespace,
                                remote: {
                                    url: "/api/search/persons?text=%QUERY&excluded=%EXCLUDED",
                                    replace: function (url) {
                                        return url
                                            .replace(
                                                "%EXCLUDED",
                                                JSON.stringify(excluded_ids)
                                            )
                                            .replace(
                                                "%QUERY",
                                                newArticleBlockView
                                                    .$(".person-input.tt-input")
                                                    .val()
                                            );
                                    },
                                    filter: function (parsedResponse) {
                                        return parsedResponse;
                                    },
                                },
                            });
                            //Initialize personlist
                            personList.initialize();
                            //Show typeahead
                            newArticleBlockView.$(".person-input").typeahead(
                                {
                                    hint: true,
                                    highlight: true,
                                    minLength: 1,
                                },
                                {
                                    name: "email",
                                    displayKey: "name",
                                    limit: 5,
                                    source: personList.ttAdapter(),
                                    templates: {
                                        empty: [
                                            '<div class="no-find">',
                                            "No such user exists. Add new in People tab.",
                                            "</div>",
                                        ].join("\n"),
                                        suggestion: Handlebars.compile(
                                            "<p class='name'>{{name}}</p><p class='email'>{{email}}</p>"
                                        ),
                                    },
                                }
                            );
                            //Focus
                            newArticleBlockView.$(".person-input").focus();
                            //Add new person on typeahead autocomplete
                            newArticleBlockView
                                .$(".person-input")
                                .on(
                                    "typeahead:selected typeahead:autocompleted",
                                    function (e, datum) {
                                        var $input =
                                            newArticleBlockView.$(
                                                ".person-input"
                                            );
                                        $input.typeahead("val", "").focus();
                                        newArticleBlockView
                                            .$(".persons-list")
                                            .append(
                                                "<div class='one-person' data-id='" +
                                                    datum._id +
                                                    "'><p class='name'>" +
                                                    datum.name +
                                                    "<br><span>" +
                                                    datum.email +
                                                    "</span></p><span class='remove-person u-delete'>Remove</span></div>"
                                            );
                                        excluded_ids.push(datum._id);
                                    }
                                );
                            break;
                        case "logos":
                            //Typeahead for partners
                            //Remote fetch partner list
                            var partnerList = new Bloodhound({
                                datumTokenizer:
                                    Bloodhound.tokenizers.obj.whitespace(
                                        "value"
                                    ),
                                queryTokenizer:
                                    Bloodhound.tokenizers.obj.whitespace,
                                remote: {
                                    url: "/api/search/partners?text=%QUERY&excluded=%EXCLUDED",
                                    replace: function (url) {
                                        return url
                                            .replace(
                                                "%EXCLUDED",
                                                JSON.stringify(excluded_ids)
                                            )
                                            .replace(
                                                "%QUERY",
                                                newArticleBlockView
                                                    .$(
                                                        ".partner-input.tt-input"
                                                    )
                                                    .val()
                                            );
                                    },
                                    filter: function (parsedResponse) {
                                        return parsedResponse;
                                    },
                                },
                            });
                            //Initialize partnerList
                            partnerList.initialize();
                            //Show typeahead
                            newArticleBlockView.$(".partner-input").typeahead(
                                {
                                    hint: true,
                                    highlight: true,
                                    minLength: 1,
                                },
                                {
                                    name: "email",
                                    displayKey: "name",
                                    limit: 5,
                                    source: partnerList.ttAdapter(),
                                    templates: {
                                        empty: [
                                            '<div class="no-find">',
                                            "No such partner exists. Add new in People tab.",
                                            "</div>",
                                        ].join("\n"),
                                        suggestion: Handlebars.compile(
                                            "<p class='name'>{{name}}</p>"
                                        ),
                                    },
                                }
                            );
                            //Focus
                            newArticleBlockView.$(".partner-input").focus();
                            //Add new partner on typeahead autocomplete
                            newArticleBlockView
                                .$(".partner-input")
                                .on(
                                    "typeahead:selected typeahead:autocompleted",
                                    function (e, datum) {
                                        var $input =
                                            newArticleBlockView.$(
                                                ".partner-input"
                                            );
                                        $input.typeahead("val", "").focus();
                                        newArticleBlockView
                                            .$(".partners-list")
                                            .append(
                                                "<div class='one-person' data-id='" +
                                                    datum._id +
                                                    "'><p class='name'>" +
                                                    datum.name +
                                                    "</p><span class='remove-person u-delete'>Remove</span></div>"
                                            );
                                        excluded_ids.push(datum._id);
                                    }
                                );
                            break;
                        case "breather":
                            newArticleBlockView
                                .$(".block-breather .block-breather-title")
                                .focus();
                            break;
                        case "button":
                            newArticleBlockView
                                .$(".block-button .block-button-title")
                                .focus();
                            break;
                    }
                });
                //Remove person
                newArticleBlockView.on("remove:person", function (value) {
                    //Remove element from excluded ids
                    var index = excluded_ids.indexOf(value.person_id);
                    if (index > -1) {
                        excluded_ids.splice(index, 1);
                    }
                });
                //Save body HTML
                newArticleBlockView.on(
                    "save:articleHtmlBlock",
                    function (value) {
                        if (newArticleBlockView.$(".redactor-box").length) {
                            var text = $R(".body-h-content", "source.getCode");
                            //Update
                            var new_block =
                                new DashManager.Entities.ArticleBlock({
                                    type: value.type,
                                    title: value.title,
                                    text: text,
                                    order: value.order,
                                    block: value.block,
                                });
                            //Images
                            if (
                                richTextEditorFiles &&
                                richTextEditorFiles.length
                            ) {
                                new_block.set("images", richTextEditorFiles);
                            }
                            new_block.save(
                                {},
                                {
                                    success: function () {
                                        $R(".body-h-content", "destroy");
                                        DashManager.vent.trigger(
                                            "add:articleBlock",
                                            new_block
                                        );
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                    },
                                }
                            );
                        }
                    }
                );
                //Save articleBlock
                newArticleBlockView.on("save:articleBlock", function (value) {
                    var type = value.type;
                    switch (type) {
                        case "gallery":
                            //Gallery
                            var new_block =
                                new DashManager.Entities.ArticleBlock({
                                    type: "gallery",
                                    gallery: value.gallery,
                                    order: value.order,
                                    block: value.block,
                                });
                            new_block.save(
                                {},
                                {
                                    success: function () {
                                        carouselImagesArray = [];
                                        DashManager.vent.trigger(
                                            "add:articleBlock",
                                            new_block
                                        );
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                    },
                                }
                            );
                            break;
                        case "gif":
                            //GIF
                            var new_block =
                                new DashManager.Entities.ArticleBlock({
                                    type: "gif",
                                    gif_embed: value.gif_embed,
                                    gif_url: value.gif_url,
                                    width: value.width,
                                    height: value.height,
                                    order: value.order,
                                    block: value.block,
                                });
                            new_block.save(
                                {},
                                {
                                    success: function () {
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                        DashManager.vent.trigger(
                                            "add:articleBlock",
                                            new_block
                                        );
                                    },
                                }
                            );
                            break;
                        case "link":
                            //Link
                            if (!value.image) {
                                var new_block =
                                    new DashManager.Entities.ArticleBlock({
                                        type: "link",
                                        linkdata: value.linkdata,
                                        order: value.order,
                                        block: value.block,
                                    });
                                new_block.save(
                                    {},
                                    {
                                        success: function () {
                                            DashManager.commands.execute(
                                                "close:overlay"
                                            );
                                            DashManager.vent.trigger(
                                                "add:articleBlock",
                                                new_block
                                            );
                                        },
                                    }
                                );
                            } else {
                                var new_block =
                                    new DashManager.Entities.ArticleBlock({
                                        type: "link",
                                        linkdata: value.linkdata,
                                        image: value.image,
                                        order: value.order,
                                        block: value.block,
                                    });
                                //Get bound
                                var image = new Image();
                                image.src = value.image;
                                image.onload = function () {
                                    var bound =
                                        (this.height * 400) / this.width;
                                    if (bound) {
                                        bound = parseInt(bound);
                                        new_block.set("bound", bound);
                                    }
                                    new_block.save(
                                        {},
                                        {
                                            success: function () {
                                                DashManager.commands.execute(
                                                    "close:overlay"
                                                );
                                                DashManager.vent.trigger(
                                                    "add:articleBlock",
                                                    new_block
                                                );
                                            },
                                        }
                                    );
                                };
                                image.onerror = function () {
                                    new_block.save(
                                        {},
                                        {
                                            success: function () {
                                                DashManager.commands.execute(
                                                    "close:overlay"
                                                );
                                                DashManager.vent.trigger(
                                                    "add:articleBlock",
                                                    new_block
                                                );
                                            },
                                        }
                                    );
                                };
                            }
                            break;
                        case "embed":
                            //Embed
                            var new_block =
                                new DashManager.Entities.ArticleBlock({
                                    type: "embed",
                                    title: value.title,
                                    embed: value.embed,
                                    order: value.order,
                                    block: value.block,
                                });
                            new_block.save(
                                {},
                                {
                                    success: function () {
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                        DashManager.vent.trigger(
                                            "add:articleBlock",
                                            new_block
                                        );
                                    },
                                }
                            );
                            break;
                        case "toggle":
                            //Toggle
                            var new_block =
                                new DashManager.Entities.ArticleBlock({
                                    type: "toggle",
                                    title: value.title,
                                    desc: value.desc,
                                    order: value.order,
                                    block: value.block,
                                });
                            new_block.save(
                                {},
                                {
                                    success: function () {
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                        DashManager.vent.trigger(
                                            "add:articleBlock",
                                            new_block
                                        );
                                    },
                                }
                            );
                            break;
                        case "callout":
                            //Callout
                            var new_block =
                                new DashManager.Entities.ArticleBlock({
                                    type: "callout",
                                    title: value.title,
                                    desc: value.desc,
                                    color_back: value.color_back,
                                    color_border: value.color_border,
                                    order: value.order,
                                    block: value.block,
                                });
                            new_block.save(
                                {},
                                {
                                    success: function () {
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                        DashManager.vent.trigger(
                                            "add:articleBlock",
                                            new_block
                                        );
                                    },
                                }
                            );
                            break;
                        case "people":
                        case "logos":
                            //People or logos
                            var new_block =
                                new DashManager.Entities.ArticleBlock({
                                    type: value.type,
                                    title: value.title,
                                    desc: value.desc,
                                    people: excluded_ids,
                                    order: value.order,
                                    block: value.block,
                                });
                            new_block.save(
                                {},
                                {
                                    success: function () {
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                        DashManager.vent.trigger(
                                            "add:articleBlock",
                                            new_block
                                        );
                                    },
                                }
                            );
                            break;
                        case "breather":
                            //Breather
                            var new_block =
                                new DashManager.Entities.ArticleBlock({
                                    type: "breather",
                                    title: value.title,
                                    desc: value.desc,
                                    image_bg: value.image_bg,
                                    button_url: value.button_url,
                                    order: value.order,
                                    block: value.block,
                                });
                            new_block.save(
                                {},
                                {
                                    success: function () {
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                        DashManager.vent.trigger(
                                            "add:articleBlock",
                                            new_block
                                        );
                                    },
                                }
                            );
                            break;
                        case "button":
                            //Button
                            var new_block =
                                new DashManager.Entities.ArticleBlock({
                                    type: "button",
                                    button_text: value.button_text,
                                    button_url: value.button_url,
                                    back_color: value.back_color,
                                    order: value.order,
                                    block: value.block,
                                });
                            new_block.save(
                                {},
                                {
                                    success: function () {
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                        DashManager.vent.trigger(
                                            "add:articleBlock",
                                            new_block
                                        );
                                    },
                                }
                            );
                            break;
                        case "mcq":
                            //MCQ
                            var new_block =
                                new DashManager.Entities.ArticleBlock({
                                    type: "mcq",
                                    title: value.title,
                                    is_multiple: value.is_multiple,
                                    order: value.order,
                                    block: value.block,
                                });
                            new_block.save(
                                {},
                                {
                                    success: function () {
                                        DashManager.vent.trigger(
                                            "mcqOptions:show",
                                            new_block.get("_id")
                                        );
                                        DashManager.vent.trigger(
                                            "add:articleBlock",
                                            new_block
                                        );
                                    },
                                }
                            );
                            break;
                        case "journal":
                            //Journal
                            var new_block =
                                new DashManager.Entities.ArticleBlock({
                                    type: "journal",
                                    title: value.title,
                                    text: value.text,
                                    journal_type: value.journal_type,
                                    order: value.order,
                                    block: value.block,
                                });
                            new_block.save(
                                {},
                                {
                                    success: function () {
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                        DashManager.vent.trigger(
                                            "add:articleBlock",
                                            new_block
                                        );
                                    },
                                }
                            );
                            break;
                    }
                });
                DashManager.overlayRegion.show(newArticleBlockView);
            },
            showEditArticleBlockOverlay: function (block_id) {
                var excluded_ids = [];
                $(".overlay").show();
                //Fetch article block
                var fetchingArticleBlock = DashManager.request(
                    "articleBlock:entity",
                    block_id
                );
                $.when(fetchingArticleBlock).done(function (block) {
                    //New article block view
                    var newArticleBlockView =
                        new DashManager.DashApp.EntityViews.NewArticleBlockView();
                    //Editor
                    var richTextEditorFiles = [];
                    //Show
                    newArticleBlockView.on("show", function () {
                        //Add edit class
                        newArticleBlockView
                            .$(".overlay-box")
                            .addClass("edit-box");
                        //Animate overlay box
                        setTimeout(function () {
                            newArticleBlockView
                                .$(".overlay-box")
                                .addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        DashManager.commands.execute("show:overlay");
                        newArticleBlockView
                            .$(".js-delete-block")
                            .removeClass("u-hide");
                        //Show section based on type
                        var type = block.get("type");
                        var class_name = ".new-block-panel .block-" + type;
                        newArticleBlockView.$(class_name).removeClass("u-hide");
                        //Fill values
                        switch (type) {
                            case "text":
                                this.$(".body-h-content").html(
                                    block.get("text")
                                );
                                //Editor
                                $R(".body-h-content", {
                                    focus: true,
                                    toolbarFixedTarget: ".overlay",
                                    buttons: editor_btns,
                                    plugins: editor_plugins,
                                    formatting: editor_formatting,
                                    imageUpload: "/api/upload",
                                    callbacks: {
                                        image: {
                                            uploaded: function (
                                                image,
                                                response
                                            ) {
                                                richTextEditorFiles.push(
                                                    response.file.url
                                                );
                                            },
                                        },
                                    },
                                });
                                break;
                            case "gallery":
                                //Gallery
                                newArticleBlockView
                                    .$(".block-gallery .body-c-title")
                                    .focus();
                                var all_images = block.get("gallery");
                                if (all_images && all_images.length) {
                                    for (
                                        var i = 0;
                                        i < all_images.length;
                                        i++
                                    ) {
                                        var image = all_images[i];
                                        var title_label =
                                            image.title ||
                                            "Image: " + image.file.l;
                                        newArticleBlockView
                                            .$(".body-images-list")
                                            .append(
                                                "<div class='one-image' data-id='" +
                                                    image._id +
                                                    "'><p class='title'>" +
                                                    title_label +
                                                    "</p><span class='remove-image u-delete'>Remove</span></div>"
                                            );
                                    }
                                    //Sortable
                                    newArticleBlockView
                                        .$(".body-images-list")
                                        .sortable({
                                            axis: "y",
                                            update: function (e, ui) {
                                                var new_index = ui.item.index();
                                                var image_id =
                                                    ui.item.attr("data-id");
                                                //Update order
                                                var edit_block =
                                                    new DashManager.Entities.ArticleBlock(
                                                        {
                                                            _id: block_id,
                                                            _action:
                                                                "image_order",
                                                        }
                                                    );
                                                //Set
                                                edit_block.set({
                                                    image: image_id,
                                                    order: new_index,
                                                });
                                                edit_block.save();
                                            },
                                        });
                                }
                                break;
                            case "audio":
                            case "video":
                            case "file":
                                if (block.get("title")) {
                                    newArticleBlockView
                                        .$(".block-file .block-file-title")
                                        .val(block.get("title"))
                                        .focus();
                                } else {
                                    newArticleBlockView
                                        .$(".block-file .block-file-title")
                                        .focus();
                                }
                                newArticleBlockView
                                    .$(".direct-upload")
                                    .addClass("u-hide");
                                break;
                            case "gif":
                                newArticleBlockView
                                    .$(".search-gifs")
                                    .addClass("u-hide");
                                newArticleBlockView
                                    .$(".js-save-block")
                                    .addClass("u-hide");
                                break;
                            case "link":
                                newArticleBlockView
                                    .$(".link-embed")
                                    .addClass("u-hide");
                                newArticleBlockView
                                    .$(".js-save-block")
                                    .addClass("u-hide");
                                break;
                            case "embed":
                                if (block.get("title")) {
                                    newArticleBlockView
                                        .$(".block-embed-title")
                                        .val(block.get("title"));
                                }
                                newArticleBlockView
                                    .$(".block-embed-code")
                                    .val(block.get("embed"))
                                    .focus();
                                break;
                            case "toggle":
                                newArticleBlockView
                                    .$(".block-toggle-title")
                                    .val(block.get("title"))
                                    .focus();
                                newArticleBlockView
                                    .$(".block-toggle-desc")
                                    .val(block.get("desc"));
                                break;
                            case "callout":
                                if (block.get("title")) {
                                    newArticleBlockView
                                        .$(".block-callout-title")
                                        .val(block.get("title"))
                                        .focus();
                                } else {
                                    newArticleBlockView
                                        .$(".block-callout-title")
                                        .focus();
                                }
                                if (block.get("desc")) {
                                    newArticleBlockView
                                        .$(".block-callout-desc")
                                        .val(block.get("desc"));
                                }
                                break;
                            case "people":
                                newArticleBlockView
                                    .$(".people-title")
                                    .val(block.get("title"));
                                newArticleBlockView
                                    .$(".people-desc")
                                    .val(block.get("desc"));
                                var all_people = block.get("people");
                                if (all_people && all_people.length) {
                                    for (
                                        var i = 0;
                                        i < all_people.length;
                                        i++
                                    ) {
                                        var people = all_people[i];
                                        newArticleBlockView
                                            .$(".persons-list")
                                            .append(
                                                "<div class='one-person' data-id='" +
                                                    people._id +
                                                    "'><p class='name'>" +
                                                    people.name +
                                                    "<br><span>" +
                                                    people.email +
                                                    "</span></p><span class='remove-person u-delete'>Remove</span></div>"
                                            );
                                        excluded_ids.push(people._id);
                                    }
                                    //Sortable
                                    newArticleBlockView
                                        .$(".persons-list")
                                        .sortable({
                                            axis: "y",
                                            update: function (e, ui) {
                                                var new_index = ui.item.index();
                                                var person_id =
                                                    ui.item.attr("data-id");
                                                //Update order
                                                var edit_block =
                                                    new DashManager.Entities.ArticleBlock(
                                                        {
                                                            _id: block_id,
                                                            _action:
                                                                "person_order",
                                                        }
                                                    );
                                                //Set
                                                edit_block.set({
                                                    person: person_id,
                                                    order: new_index,
                                                });
                                                edit_block.save();
                                            },
                                        });
                                }
                                //Typeahead for persons
                                //Remote fetch person list
                                var personList = new Bloodhound({
                                    datumTokenizer:
                                        Bloodhound.tokenizers.obj.whitespace(
                                            "value"
                                        ),
                                    queryTokenizer:
                                        Bloodhound.tokenizers.obj.whitespace,
                                    remote: {
                                        url: "/api/search/persons?text=%QUERY&excluded=%EXCLUDED",
                                        replace: function (url) {
                                            return url
                                                .replace(
                                                    "%EXCLUDED",
                                                    JSON.stringify(excluded_ids)
                                                )
                                                .replace(
                                                    "%QUERY",
                                                    newArticleBlockView
                                                        .$(
                                                            ".person-input.tt-input"
                                                        )
                                                        .val()
                                                );
                                        },
                                        filter: function (parsedResponse) {
                                            return parsedResponse;
                                        },
                                    },
                                });
                                //Initialize personlist
                                personList.initialize();
                                //Show typeahead
                                newArticleBlockView
                                    .$(".person-input")
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
                                            source: personList.ttAdapter(),
                                            templates: {
                                                empty: [
                                                    '<div class="no-find">',
                                                    "No such user exists. Add new in People tab.",
                                                    "</div>",
                                                ].join("\n"),
                                                suggestion: Handlebars.compile(
                                                    "<p class='name'>{{name}}</p><p class='email'>{{email}}</p>"
                                                ),
                                            },
                                        }
                                    );
                                //Focus
                                newArticleBlockView.$(".person-input").focus();
                                //Add new person on typeahead autocomplete
                                newArticleBlockView
                                    .$(".person-input")
                                    .on(
                                        "typeahead:selected typeahead:autocompleted",
                                        function (e, datum) {
                                            var edit_block =
                                                new DashManager.Entities.ArticleBlock(
                                                    {
                                                        _id: block_id,
                                                        _action: "add_person",
                                                    }
                                                );
                                            //Set
                                            edit_block.set({
                                                person: datum._id,
                                            });
                                            edit_block.save(
                                                {},
                                                {
                                                    success: function () {
                                                        var $input =
                                                            newArticleBlockView.$(
                                                                ".person-input"
                                                            );
                                                        $input
                                                            .typeahead(
                                                                "val",
                                                                ""
                                                            )
                                                            .focus();
                                                        newArticleBlockView
                                                            .$(".persons-list")
                                                            .append(
                                                                "<div class='one-person' data-id='" +
                                                                    datum._id +
                                                                    "'><p class='name'>" +
                                                                    datum.name +
                                                                    "<br><span>" +
                                                                    datum.email +
                                                                    "</span></p><span class='remove-person u-delete'>Remove</span></div>"
                                                            );
                                                        excluded_ids.push(
                                                            datum._id
                                                        );
                                                    },
                                                }
                                            );
                                        }
                                    );
                                break;
                            case "logos":
                                //Logos
                                newArticleBlockView
                                    .$(".logos-title")
                                    .val(block.get("title"));
                                newArticleBlockView
                                    .$(".logos-desc")
                                    .val(block.get("desc"));
                                var all_partners = block.get("people");
                                if (all_partners && all_partners.length) {
                                    for (
                                        var i = 0;
                                        i < all_partners.length;
                                        i++
                                    ) {
                                        var partner = all_partners[i];
                                        newArticleBlockView
                                            .$(".partners-list")
                                            .append(
                                                "<div class='one-person' data-id='" +
                                                    partner._id +
                                                    "'><p class='name'>" +
                                                    partner.name +
                                                    "<br><span>" +
                                                    partner.email +
                                                    "</span></p><span class='remove-person u-delete'>Remove</span></div>"
                                            );
                                        excluded_ids.push(partner._id);
                                    }
                                    //Sortable
                                    newArticleBlockView
                                        .$(".partners-list")
                                        .sortable({
                                            axis: "y",
                                            update: function (e, ui) {
                                                var new_index = ui.item.index();
                                                var person_id =
                                                    ui.item.attr("data-id");
                                                //Update order
                                                var edit_block =
                                                    new DashManager.Entities.ArticleBlock(
                                                        {
                                                            _id: block_id,
                                                            _action:
                                                                "person_order",
                                                        }
                                                    );
                                                //Set
                                                edit_block.set({
                                                    person: person_id,
                                                    order: new_index,
                                                });
                                                edit_block.save();
                                            },
                                        });
                                }
                                //Typeahead for partners
                                //Remote fetch partner list
                                var partnerList = new Bloodhound({
                                    datumTokenizer:
                                        Bloodhound.tokenizers.obj.whitespace(
                                            "value"
                                        ),
                                    queryTokenizer:
                                        Bloodhound.tokenizers.obj.whitespace,
                                    remote: {
                                        url: "/api/search/partners?text=%QUERY&excluded=%EXCLUDED",
                                        replace: function (url) {
                                            return url
                                                .replace(
                                                    "%EXCLUDED",
                                                    JSON.stringify(excluded_ids)
                                                )
                                                .replace(
                                                    "%QUERY",
                                                    newArticleBlockView
                                                        .$(
                                                            ".partner-input.tt-input"
                                                        )
                                                        .val()
                                                );
                                        },
                                        filter: function (parsedResponse) {
                                            return parsedResponse;
                                        },
                                    },
                                });
                                //Initialize partnerList
                                partnerList.initialize();
                                //Show typeahead
                                newArticleBlockView
                                    .$(".partner-input")
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
                                            source: partnerList.ttAdapter(),
                                            templates: {
                                                empty: [
                                                    '<div class="no-find">',
                                                    "No such partner exists. Add new in People tab.",
                                                    "</div>",
                                                ].join("\n"),
                                                suggestion: Handlebars.compile(
                                                    "<p class='name'>{{name}}</p>"
                                                ),
                                            },
                                        }
                                    );
                                //Focus
                                newArticleBlockView.$(".partner-input").focus();
                                //Add new partner on typeahead autocomplete
                                newArticleBlockView
                                    .$(".partner-input")
                                    .on(
                                        "typeahead:selected typeahead:autocompleted",
                                        function (e, datum) {
                                            var edit_block =
                                                new DashManager.Entities.ArticleBlock(
                                                    {
                                                        _id: block_id,
                                                        _action: "add_person",
                                                    }
                                                );
                                            //Set
                                            edit_block.set({
                                                person: datum._id,
                                            });
                                            edit_block.save(
                                                {},
                                                {
                                                    success: function () {
                                                        var $input =
                                                            newArticleBlockView.$(
                                                                ".partner-input"
                                                            );
                                                        $input
                                                            .typeahead(
                                                                "val",
                                                                ""
                                                            )
                                                            .focus();
                                                        newArticleBlockView
                                                            .$(".partners-list")
                                                            .append(
                                                                "<div class='one-person' data-id='" +
                                                                    datum._id +
                                                                    "'><p class='name'>" +
                                                                    datum.name +
                                                                    "<br><span>" +
                                                                    datum.email +
                                                                    "</span></p><span class='remove-person u-delete'>Remove</span></div>"
                                                            );
                                                        excluded_ids.push(
                                                            datum._id
                                                        );
                                                    },
                                                }
                                            );
                                        }
                                    );
                                break;
                            case "breather":
                                newArticleBlockView
                                    .$(".block-breather-title")
                                    .val(block.get("title"))
                                    .focus();
                                if (block.get("desc")) {
                                    newArticleBlockView
                                        .$(".block-breather-desc")
                                        .val(block.get("desc"));
                                }
                                newArticleBlockView
                                    .$(".block-breather-image")
                                    .val(block.get("image").bg);
                                if (
                                    block.get("button") &&
                                    block.get("button").url
                                ) {
                                    newArticleBlockView
                                        .$(".block-breather-link")
                                        .val(block.get("button").url);
                                }
                                break;
                            case "button":
                                newArticleBlockView
                                    .$(".block-button-title")
                                    .val(block.get("button").text);
                                newArticleBlockView
                                    .$(".block-button-url")
                                    .val(block.get("button").url);
                                break;
                            case "mcq":
                                newArticleBlockView
                                    .$(".block-mcq-title")
                                    .val(block.get("title"));
                                //Check if is_multiple
                                if (block.get("is_multiple")) {
                                    newArticleBlockView
                                        .$(".is-multiple-label input")
                                        .prop("checked", true);
                                }
                                break;
                            case "journal":
                                newArticleBlockView
                                    .$(".block-journal")
                                    .removeClass("u-hide");
                                newArticleBlockView
                                    .$(".block-journaling-title")
                                    .val(block.get("title"));
                                //Show text
                                var html = block
                                    .get("text")
                                    .replace(/<br\s*[\/]?>/gi, "\n");
                                var tmp = document.createElement("div");
                                tmp.innerHTML = html;
                                var text =
                                    tmp.textContent || tmp.innerText || "";
                                newArticleBlockView
                                    .$(".block-journaling-text")
                                    .val(text);
                                //Hide other options
                                newArticleBlockView
                                    .$(".select-journal span")
                                    .addClass("u-hide");
                                newArticleBlockView
                                    .$(
                                        ".select-journal span.journal-" +
                                            block.get("journal_type")
                                    )
                                    .removeClass("u-hide")
                                    .addClass("selected");
                                break;
                        }
                    });
                    //Remove person
                    newArticleBlockView.on(
                        "removeCreated:person",
                        function (value) {
                            var edit_block =
                                new DashManager.Entities.ArticleBlock({
                                    _id: block_id,
                                    _action: "remove_person",
                                });
                            //Set
                            edit_block.set({
                                person: value.person_id,
                            });
                            edit_block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        //Remove element from excluded ids
                                        var index = excluded_ids.indexOf(
                                            value.person_id
                                        );
                                        if (index > -1) {
                                            excluded_ids.splice(index, 1);
                                        }
                                    },
                                }
                            );
                        }
                    );
                    //Add image
                    newArticleBlockView.on("add:image", function (value) {
                        var edit_block = new DashManager.Entities.ArticleBlock({
                            _id: block_id,
                            _action: "add_image",
                        });
                        //Set
                        edit_block.set({
                            title: value.title,
                            image_l: value.image_l,
                            image_m: value.image_m,
                            button_url: value.button_url,
                            bound: value.bound,
                        });
                        edit_block.save(
                            {},
                            {
                                success: function () {
                                    var title_label =
                                        edit_block.get("title") ||
                                        "Image: " + edit_block.get("file").l;
                                    //Append
                                    newArticleBlockView
                                        .$(".body-images-list")
                                        .append(
                                            "<div class='one-image' data-id='" +
                                                edit_block.get("_id") +
                                                "'><p class='title'>" +
                                                title_label +
                                                "</p><span class='remove-image u-delete'>Remove</span></div>"
                                        );
                                },
                            }
                        );
                    });
                    //Remove image
                    newArticleBlockView.on("remove:image", function (value) {
                        var edit_block = new DashManager.Entities.ArticleBlock({
                            _id: block_id,
                            _action: "remove_image",
                        });
                        //Set
                        edit_block.set({
                            image: value.image_id,
                        });
                        edit_block.save();
                    });
                    //Update HTML block
                    newArticleBlockView.on(
                        "update:articleHtmlBlock",
                        function (value) {
                            if (newArticleBlockView.$(".redactor-box").length) {
                                var text = $R(
                                    ".body-h-content",
                                    "source.getCode"
                                );
                                //Update
                                var edit_block =
                                    new DashManager.Entities.ArticleBlock({
                                        _id: block_id,
                                        _action: "edit",
                                    });
                                edit_block.set({
                                    text: text,
                                });
                                //Images
                                if (
                                    richTextEditorFiles &&
                                    richTextEditorFiles.length
                                ) {
                                    edit_block.set(
                                        "images",
                                        richTextEditorFiles
                                    );
                                }
                                edit_block.save(
                                    {},
                                    {
                                        success: function () {
                                            $R(".body-h-content", "destroy");
                                            DashManager.commands.execute(
                                                "close:overlay"
                                            );
                                        },
                                    }
                                );
                            }
                        }
                    );
                    //Update block
                    newArticleBlockView.on(
                        "update:articleBlock",
                        function (value) {
                            var edit_block =
                                new DashManager.Entities.ArticleBlock({
                                    _id: block_id,
                                    _action: "edit",
                                });
                            //Set
                            edit_block.set({
                                text: value.text,
                                title: value.title,
                                desc: value.desc,
                                image_bg: value.image_bg,
                                color_back: value.color_back,
                                color_border: value.color_border,
                                button_text: value.button_text,
                                button_url: value.button_url,
                                back_color: value.back_color,
                            });
                            edit_block.save(
                                {},
                                {
                                    success: function () {
                                        DashManager.commands.execute(
                                            "close:overlay"
                                        );
                                    },
                                }
                            );
                        }
                    );
                    //Delete block
                    newArticleBlockView.on(
                        "delete:articleBlock",
                        function (value) {
                            //Delete block
                            var block = new DashManager.Entities.ArticleBlock({
                                _id: block_id,
                            });
                            block.destroy({
                                dataType: "text",
                                success: function (model, response) {
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                    DashManager.vent.trigger(
                                        "remove:articleBlock"
                                    );
                                },
                            });
                        }
                    );
                    DashManager.overlayRegion.show(newArticleBlockView);
                });
            },
            showMcqOptionsOverlay: function (block_id, is_edit) {
                if (is_edit) $(".overlay").show();
                var image_url, bound;
                //Fetch block
                var fetchingArticleBlock = DashManager.request(
                    "articleBlock:entity",
                    block_id
                );
                $.when(fetchingArticleBlock).done(function (block) {
                    var options = new Backbone.Collection(block.get("mcqs"));
                    var optionsView =
                        new DashManager.DashApp.EntityViews.McqOptionsView({
                            collection: options,
                        });
                    //Show
                    optionsView.on("show", function () {
                        if (is_edit) {
                            optionsView.$(".overlay-box").addClass("edit-box");
                            //Animate overlay box
                            setTimeout(function () {
                                optionsView
                                    .$(".overlay-box")
                                    .addClass("animate");
                            }, 100);
                            //Hide scroll on main page
                            DashManager.commands.execute("show:overlay");
                        } else {
                            optionsView.$(".overlay-box").addClass("animate");
                        }
                        //Upload option image
                        $(".option-image-upload").each(function () {
                            /* For each file selected, process and upload */
                            var form = $(this);
                            $(this).fileupload({
                                dropZone: $("#option-image"),
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
                                    //Get bound
                                    var image = new Image();
                                    image.src = window.URL.createObjectURL(
                                        data.files[0]
                                    );
                                    image.onload = function () {
                                        bound =
                                            (image.naturalHeight * 200) /
                                            image.naturalWidth;
                                        if (bound) bound = parseInt(bound);
                                        window.URL.revokeObjectURL(image.src);
                                    };
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
                                    optionsView
                                        .$("#option-image span")
                                        .html("Uploading <b>...</b>");
                                    optionsView
                                        .$(".mcq-add")
                                        .addClass("u-hide");
                                    optionsView
                                        .$(".js-done")
                                        .addClass("u-disabled");
                                },
                                progress: function (e, data) {
                                    var percent = Math.round(
                                        (e.loaded / e.total) * 100
                                    );
                                    optionsView
                                        .$("#option-image span b")
                                        .text(percent + "%");
                                },
                                fail: function (e, data) {
                                    optionsView
                                        .$("#option-image span")
                                        .html("Optional image");
                                    optionsView
                                        .$(".mcq-add")
                                        .removeClass("u-hide");
                                    optionsView
                                        .$(".js-done")
                                        .removeClass("u-disabled");
                                },
                                success: function (data) {
                                    image_url =
                                        "https://d1c337161ud3pr.cloudfront.net/" +
                                        form.find("input[name=key]").val();
                                    image_url = encodeURI(image_url);
                                    optionsView
                                        .$("#option-image span")
                                        .addClass("u-hide");
                                    optionsView
                                        .$("#option-image")
                                        .css(
                                            "backgroundImage",
                                            "url(" + image_url + ")"
                                        );
                                    optionsView
                                        .$(".mcq-add")
                                        .removeClass("u-hide");
                                    optionsView
                                        .$(".js-done")
                                        .removeClass("u-disabled");
                                },
                            });
                        });
                    });
                    //Add option
                    optionsView.on("add:option", function (value) {
                        var new_option = new DashManager.Entities.ArticleBlock({
                            _id: block_id,
                            _action: "add_option",
                        });
                        new_option.set({
                            text: value.text,
                            image: image_url,
                            bound: bound,
                        });
                        new_option.save(
                            {},
                            {
                                success: function () {
                                    //Add option
                                    var option = new_option.toJSON();
                                    optionsView.collection.add(option);
                                    //Reset
                                    optionsView
                                        .$(".option-text")
                                        .val("")
                                        .focus();
                                    optionsView
                                        .$("#option-image")
                                        .css("backgroundImage", "");
                                    optionsView
                                        .$("#option-image span")
                                        .html("Optional image");
                                    optionsView
                                        .$(".mcq-add")
                                        .removeClass("u-hide");
                                    optionsView
                                        .$(".js-done")
                                        .removeClass("u-disabled");
                                },
                            }
                        );
                    });
                    //Remove option
                    optionsView.on(
                        "childview:remove:option",
                        function (childView, model) {
                            var block = new DashManager.Entities.ArticleBlock({
                                _id: block_id,
                                _action: "remove_option",
                            });
                            block.set({
                                option: model.option_id,
                            });
                            block.save(
                                {},
                                {
                                    dataType: "text",
                                    success: function () {
                                        childView.$el.remove();
                                    },
                                }
                            );
                        }
                    );
                    DashManager.overlayRegion.show(optionsView);
                });
            },
            showFiles: function (type, text, folder_id) {
                $(window).off("scroll", scrollHandler);
                //Show search bar
                $(".searchWrap").removeClass("u-hide");
                //Show loading page
                var loadingView = new DashManager.Common.Views.Loading();
                DashManager.mainRegion.show(loadingView);
                //Select
                $(".nav-links a").removeClass("selected");
                $(".nav-links .js-files").addClass("selected");
                //Fetching files
                if (type == "search") {
                    var fetchingFiles = DashManager.request(
                        "search:entities",
                        "files",
                        text
                    );
                } else {
                    var fetchingFiles = DashManager.request(
                        "file:entities",
                        "",
                        folder_id
                    );
                }
                //Fetch
                $.when(fetchingFiles).done(function (files) {
                    var filesView =
                        new DashManager.DashApp.EntityViews.FilesView({
                            collection: files,
                        });
                    //Show
                    filesView.on("show", function () {
                        //Add folder id
                        if (folder_id) {
                            filesView.$(".all-items").data("folder", folder_id);
                        }
                        //Masonry
                        filesView.$(".all-items").masonry({
                            itemSelector: ".one-item",
                            columnWidth: 450,
                        });
                        //Pagination
                        $(".loading-data")
                            .data("page", 1)
                            .removeClass("u-loaded");
                        //Check if less than page size
                        if (files.length < PAGE_SIZE) {
                            $(".loading-data").addClass("u-loaded");
                        }
                        //Fetch more files
                        scrollHandler = function () {
                            if (
                                $(window).scrollTop() + $(window).height() >
                                    $(document).height() - 50 &&
                                !$(".loading-data").hasClass("u-loaded") &&
                                !$(".loading-data").hasClass("u-loading")
                            ) {
                                $(".loading-data")
                                    .slideDown()
                                    .addClass("u-loading");
                                //Fetching more files
                                if (type == "search") {
                                    var fetchingMoreFiles = DashManager.request(
                                        "search:entities",
                                        "files",
                                        text,
                                        $(".loading-data").data("page") + 1
                                    );
                                } else {
                                    var fetchingMoreFiles = DashManager.request(
                                        "file:entities",
                                        "",
                                        folder_id,
                                        $(".loading-data").data("page") + 1
                                    );
                                }
                                //Fetch
                                $.when(fetchingMoreFiles).done(function (
                                    moreFiles
                                ) {
                                    files.add(moreFiles.models);
                                    $(".loading-data")
                                        .data(
                                            "page",
                                            $(".loading-data").data("page") + 1
                                        )
                                        .slideUp()
                                        .removeClass("u-loading");
                                    if (moreFiles.length < PAGE_SIZE) {
                                        $(".loading-data").addClass("u-loaded");
                                    }
                                    //Find view by model and update masonry
                                    for (
                                        var i = 0;
                                        i < moreFiles.models.length;
                                        i++
                                    ) {
                                        var child =
                                            filesView.children.findByModel(
                                                moreFiles.models[i]
                                            );
                                        filesView
                                            .$(".all-items")
                                            .masonry("appended", child.$el);
                                    }
                                });
                            }
                        };
                        $(window).on("scroll", scrollHandler);
                        //Upload file
                        filesView.$(".direct-upload").each(function () {
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
                                    if (data.files[0].size >= MAX_FILE_SIZE)
                                        return;
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
                                    var file_name = data.files[0].name;
                                    //Get extension of the file
                                    var index = file_name.lastIndexOf(".");
                                    var file_ext = file_name.substring(
                                        index + 1,
                                        file_name.length
                                    );
                                    var file_title = decodeURIComponent(
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
                                    if (
                                        image_extensions.indexOf(file_ext) < 0
                                    ) {
                                        //Save file
                                        var new_file =
                                            new DashManager.Entities.File({
                                                title: file_title,
                                                url: url,
                                                size: data.files[0].size,
                                                ext: file_ext,
                                            });
                                        //Folder id
                                        if ($(".all-items").data("folder")) {
                                            new_file.set(
                                                "folder",
                                                $(".all-items").data("folder")
                                            );
                                        }
                                        //Save file
                                        new_file.save(
                                            {},
                                            {
                                                success: function () {
                                                    uploadCount += 1;
                                                    //Add to view
                                                    files.add(new_file, {
                                                        at: 0,
                                                    });
                                                    filesView
                                                        .$(".all-items")
                                                        .masonry(
                                                            "prepended",
                                                            $(".one-item").eq(0)
                                                        );
                                                },
                                            }
                                        );
                                    } else {
                                        //Save image
                                        var new_file =
                                            new DashManager.Entities.File({
                                                title: file_title,
                                                url: url,
                                                image: url,
                                                size: data.files[0].size,
                                                ext: file_ext,
                                            });
                                        //Folder id
                                        if ($(".all-items").data("folder")) {
                                            new_file.set(
                                                "folder",
                                                $(".all-items").data("folder")
                                            );
                                        }
                                        //Get bound
                                        var image = new Image();
                                        image.src = window.URL.createObjectURL(
                                            data.files[0]
                                        );
                                        image.onload = function () {
                                            var bound =
                                                (image.naturalHeight * 400) /
                                                image.naturalWidth;
                                            if (bound) {
                                                bound = parseInt(bound);
                                                new_file.set("bound", bound);
                                            }
                                            window.URL.revokeObjectURL(
                                                image.src
                                            );
                                            //Save file
                                            new_file.save(
                                                {},
                                                {
                                                    success: function () {
                                                        uploadCount += 1;
                                                        //Add to view
                                                        files.add(new_file, {
                                                            at: 0,
                                                        });
                                                        filesView
                                                            .$(".all-items")
                                                            .masonry(
                                                                "prepended",
                                                                $(
                                                                    ".one-item"
                                                                ).eq(0)
                                                            );
                                                    },
                                                }
                                            );
                                        };
                                        image.onerror = function () {
                                            //Save file
                                            new_file.save(
                                                {},
                                                {
                                                    success: function () {
                                                        uploadCount += 1;
                                                        //Add to view
                                                        files.add(new_file, {
                                                            at: 0,
                                                        });
                                                        filesView
                                                            .$(".all-items")
                                                            .masonry(
                                                                "prepended",
                                                                $(
                                                                    ".one-item"
                                                                ).eq(0)
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
                    //Remove file
                    DashManager.vent.off("remove:file");
                    DashManager.vent.on("remove:file", function (file_id) {
                        var file = files.get(file_id);
                        files.remove(file);
                        //Update masonry
                        filesView.$(".all-items").masonry("layout");
                    });
                    DashManager.mainRegion.show(filesView);
                });
            },
            showEditFileOverlay: function (file_id, is_folder) {
                var $image;
                $(".overlay").show();
                //Fetch file
                var fetchingFile = DashManager.request("file:entity", file_id);
                $.when(fetchingFile).done(function (file) {
                    var editFileView =
                        new DashManager.DashApp.EntityViews.EditFileView({
                            model: file,
                        });
                    //Show
                    editFileView.on("show", function () {
                        //Animate overlay box
                        setTimeout(function () {
                            editFileView.$(".overlay-box").addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        DashManager.commands.execute("show:overlay");
                        //Check if folder
                        if (is_folder) {
                            editFileView
                                .$(".js-delete-file")
                                .addClass("js-delete-folder");
                        }
                        //Fill values
                        editFileView
                            .$(".file-title")
                            .val(file.get("title"))
                            .focus();
                        //Show cropper
                        if (file.get("image") && file.get("image").l) {
                            $image = editFileView.$("#main-image");
                            $image.cropper({
                                viewMode: 1,
                                aspectRatio: 2 / 1,
                            });
                            $image.on("ready", function (ev) {
                                editFileView
                                    .$(".image-editor-btns, .image-save")
                                    .removeClass("u-hide");
                            });
                        }
                    });
                    //Update file
                    editFileView.on("update:file", function (value) {
                        var edit_file = new DashManager.Entities.File({
                            _id: file_id,
                            _action: "edit",
                        });
                        edit_file.set({
                            title: value.title,
                        });
                        edit_file.save(
                            {},
                            {
                                success: function () {
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                },
                            }
                        );
                    });
                    //Delete file
                    editFileView.on("delete:file", function (value) {
                        var file = new DashManager.Entities.File({
                            _id: file_id,
                        });
                        file.destroy({
                            dataType: "text",
                            success: function (model, response) {
                                DashManager.commands.execute("close:overlay");
                                DashManager.vent.trigger(
                                    "remove:file",
                                    file_id
                                );
                                //Is folder
                                if (value) {
                                    DashManager.vent.trigger("files:show");
                                }
                            },
                        });
                    });
                    //Update aspect ratio
                    editFileView.on("update:aspectRatio", function (value) {
                        $image.cropper("setAspectRatio", value.ratio);
                    });
                    //Flip horizontally
                    editFileView.on("flip:horizontally", function (value) {
                        $image.cropper("scaleX", value.scale);
                    });
                    //Flip vertically
                    editFileView.on("flip:vertically", function (value) {
                        $image.cropper("scaleY", value.scale);
                    });
                    //Reset crop
                    editFileView.on("reset:crop", function () {
                        $image.cropper("reset");
                    });
                    //Update image
                    editFileView.on("update:image", function (value) {
                        $image
                            .cropper("getCroppedCanvas", {
                                width: value.width,
                                height: value.height,
                            })
                            .toBlob(function (blobData) {
                                //Hide image editor btns
                                editFileView
                                    .$(".image-editor-btns")
                                    .addClass("u-hide");
                                //Show uploading
                                editFileView
                                    .$(".js-save-image")
                                    .text("Uploading...")
                                    .addClass("uploading");
                                var file_name = generateRandomUUID() + ".png";
                                //Upload to S3
                                var key, policy, signature;
                                $.ajax({
                                    url: "/api/signed",
                                    type: "GET",
                                    dataType: "json",
                                    data: { title: file_name },
                                    async: false,
                                    success: function (data) {
                                        var finalUrl =
                                            "https://d1c337161ud3pr.cloudfront.net/" +
                                            data.key;
                                        //Create form data
                                        var fd = new FormData();
                                        fd.append("key", data.key);
                                        fd.append(
                                            "AWSAccessKeyId",
                                            "AKIAIT3BY3EDOZPAPDEQ"
                                        );
                                        fd.append("acl", "public-read");
                                        fd.append("Content-Type", "image/png");
                                        fd.append("policy", data.policy);
                                        fd.append("signature", data.signature);
                                        fd.append("success-action-status", 201);
                                        fd.append("file", blobData);
                                        //Send xhr request
                                        var xhr = new XMLHttpRequest();
                                        xhr.addEventListener(
                                            "load",
                                            function (ev) {
                                                //Save image
                                                var edit_file =
                                                    new DashManager.Entities.File(
                                                        {
                                                            _id: file_id,
                                                            _action: "edit",
                                                        }
                                                    );
                                                edit_file.set({
                                                    image: finalUrl,
                                                });
                                                edit_file.save(
                                                    {},
                                                    {
                                                        success: function () {
                                                            DashManager.commands.execute(
                                                                "close:overlay"
                                                            );
                                                        },
                                                    }
                                                );
                                            },
                                            false
                                        );
                                        xhr.addEventListener(
                                            "error",
                                            function (ev) {},
                                            false
                                        );
                                        xhr.addEventListener(
                                            "abort",
                                            function (ev) {},
                                            false
                                        );
                                        //Post
                                        xhr.open(
                                            "POST",
                                            "https://mgiep-files.s3.amazonaws.com/",
                                            true
                                        );
                                        xhr.send(fd);
                                    },
                                });
                            });
                    });
                    DashManager.overlayRegion.show(editFileView);
                });
            },
            showNewPersonOverlay: function () {
                $(".overlay").show();
                //New person view
                var newPersonView =
                    new DashManager.DashApp.EntityViews.NewPersonView();
                //Show
                newPersonView.on("show", function () {
                    setTimeout(function () {
                        newPersonView.$(".overlay-box").addClass("animate");
                    }, 100);
                    //Hide scroll on main page
                    DashManager.commands.execute("show:overlay");
                    //Focus
                    newPersonView.$(".person-name").focus();
                    //Upload dp
                    newPersonView.$(".dp-upload").each(function () {
                        /* For each file selected, process and upload */
                        var form = $(this);
                        $(this).fileupload({
                            dropZone: $(".person-dp"),
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
                                        form.find("input[name=signature]").val(
                                            data.signature
                                        );
                                        form.find(
                                            "input[name=Content-Type]"
                                        ).val(data.contentType);
                                    },
                                });
                                data.submit();
                            },
                            send: function (e, data) {
                                newPersonView
                                    .$(".upload-btn")
                                    .html("Uploading <span>...</span>");
                            },
                            progress: function (e, data) {
                                var percent = Math.round(
                                    (e.loaded / e.total) * 100
                                );
                                newPersonView
                                    .$(".upload-btn span")
                                    .text(percent + "%");
                            },
                            fail: function (e, data) {
                                newPersonView.$(".upload-btn").html("Upload");
                            },
                            success: function (data) {
                                var image_url =
                                    "https://d1c337161ud3pr.cloudfront.net/" +
                                    form.find("input[name=key]").val();
                                image_url = encodeURI(image_url);
                                //Show image
                                newPersonView
                                    .$(".person-image")
                                    .css(
                                        "backgroundImage",
                                        "url(" + image_url + ")"
                                    );
                                newPersonView
                                    .$(".person-image")
                                    .data("image", image_url);
                                newPersonView.$(".upload-btn").html("Upload");
                            },
                        });
                    });
                });
                //Save
                newPersonView.on("save:person", function (value) {
                    var new_person = new DashManager.Entities.Person({
                        name: value.name,
                        type: value.type,
                        about: value.about,
                        desc: value.desc,
                        email: value.email,
                        url: value.url,
                        image: value.image,
                    });
                    new_person.save(
                        {},
                        {
                            success: function () {
                                DashManager.vent.trigger(
                                    "add:person",
                                    new_person
                                );
                                DashManager.commands.execute("close:overlay");
                            },
                        }
                    );
                });
                DashManager.overlayRegion.show(newPersonView);
            },
            showEditPersonOverlay: function (person_id) {
                $(".overlay").show();
                //Fetch person
                var fetchingPerson = DashManager.request(
                    "person:entity",
                    person_id
                );
                $.when(fetchingPerson).done(function (person) {
                    var newPersonView =
                        new DashManager.DashApp.EntityViews.NewPersonView();
                    //Show
                    newPersonView.on("show", function () {
                        //Add edit class
                        newPersonView.$(".overlay-box").addClass("edit-box");
                        //Animate overlay box
                        setTimeout(function () {
                            newPersonView.$(".overlay-box").addClass("animate");
                        }, 100);
                        //Hide scroll on main page
                        DashManager.commands.execute("show:overlay");
                        newPersonView
                            .$(".js-delete-person")
                            .removeClass("u-hide");
                        //Fill values
                        newPersonView
                            .$(".person-name")
                            .val(person.get("name"))
                            .focus();
                        newPersonView
                            .$(".person-about")
                            .val(person.get("about"));
                        newPersonView
                            .$(".person-email")
                            .val(person.get("email"));
                        newPersonView.$(".person-url").val(person.get("url"));
                        //Show type
                        if (person.get("type") == "team") {
                            newPersonView
                                .$(".choose-team")
                                .addClass("selected");
                        } else if (person.get("type") == "partner") {
                            newPersonView
                                .$(".choose-partner")
                                .addClass("selected");
                        }
                        //Show description
                        var html = person
                            .get("desc")
                            .replace(/<br\s*[\/]?>/gi, "\n");
                        var tmp = document.createElement("div");
                        tmp.innerHTML = html;
                        var desc = tmp.textContent || tmp.innerText || "";
                        newPersonView.$(".person-desc").val(desc);
                        //Show image
                        if (person.get("image")) {
                            var image_url = person.get("image").m;
                            newPersonView
                                .$(".person-image")
                                .css(
                                    "backgroundImage",
                                    "url(" + image_url + ")"
                                );
                            newPersonView
                                .$(".person-image")
                                .data("image", image_url);
                        }
                        //Upload dp
                        newPersonView.$(".dp-upload").each(function () {
                            /* For each file selected, process and upload */
                            var form = $(this);
                            $(this).fileupload({
                                dropZone: $(".person-dp"),
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
                                    newPersonView
                                        .$(".upload-btn")
                                        .html("Uploading <span>...</span>");
                                },
                                progress: function (e, data) {
                                    var percent = Math.round(
                                        (e.loaded / e.total) * 100
                                    );
                                    newPersonView
                                        .$(".upload-btn span")
                                        .text(percent + "%");
                                },
                                fail: function (e, data) {
                                    newPersonView
                                        .$(".upload-btn")
                                        .html("Upload");
                                },
                                success: function (data) {
                                    var image_url =
                                        "https://d1c337161ud3pr.cloudfront.net/" +
                                        form.find("input[name=key]").val();
                                    image_url = encodeURI(image_url);
                                    //Edit person's image
                                    var edit_person =
                                        new DashManager.Entities.Person({
                                            _id: person_id,
                                            _action: "edit_image",
                                        });
                                    edit_person.set({
                                        image: image_url,
                                    });
                                    edit_person.save(
                                        {},
                                        {
                                            success: function () {
                                                //Show image
                                                newPersonView
                                                    .$(".person-image")
                                                    .css(
                                                        "backgroundImage",
                                                        "url(" + image_url + ")"
                                                    );
                                                newPersonView
                                                    .$(".person-image")
                                                    .data("image", image_url);
                                                newPersonView
                                                    .$(".upload-btn")
                                                    .html("Upload");
                                            },
                                        }
                                    );
                                },
                            });
                        });
                    });
                    //Update person
                    newPersonView.on("update:person", function (value) {
                        var edit_person = new DashManager.Entities.Person({
                            _id: person_id,
                            _action: "edit",
                        });
                        edit_person.set({
                            name: value.name,
                            type: value.type,
                            about: value.about,
                            desc: value.desc,
                            email: value.email,
                            url: value.url,
                        });
                        edit_person.save(
                            {},
                            {
                                success: function () {
                                    DashManager.commands.execute(
                                        "close:overlay"
                                    );
                                },
                            }
                        );
                    });
                    //Delete person
                    newPersonView.on("delete:person", function (value) {
                        var person = new DashManager.Entities.Person({
                            _id: person_id,
                        });
                        person.destroy({
                            dataType: "text",
                            success: function (model, response) {
                                DashManager.commands.execute("close:overlay");
                                DashManager.vent.trigger("remove:personCard");
                            },
                        });
                    });
                    DashManager.overlayRegion.show(newPersonView);
                });
            },
            showPeople: function (type, text) {
                $(window).off("scroll", scrollHandler);
                //Show search bar
                $(".searchWrap").removeClass("u-hide");
                //Show loading page
                var loadingView = new DashManager.Common.Views.Loading();
                DashManager.mainRegion.show(loadingView);
                //Select
                $(".nav-links a").removeClass("selected");
                $(".nav-links .js-people").addClass("selected");
                //Fetching persons
                if (type == "search") {
                    var fetchingPersons = DashManager.request(
                        "search:entities",
                        "persons",
                        text
                    );
                } else {
                    var fetchingPersons = DashManager.request(
                        "person:entities",
                        type
                    );
                }
                //Fetch
                $.when(fetchingPersons).done(function (persons) {
                    var personsView =
                        new DashManager.DashApp.EntityViews.PersonsView({
                            collection: persons,
                        });
                    //Show
                    personsView.on("show", function () {
                        //Masonry
                        $(".all-items").masonry({
                            itemSelector: ".one-item",
                            columnWidth: 450,
                        });
                        //Choose filter
                        if (type != "search") {
                            var element = ".filter-items .filter-" + type;
                            personsView.$(element).addClass("selected");
                        }
                        //Pagination
                        $(".loading-data")
                            .data("page", 1)
                            .removeClass("u-loaded");
                        //Check if less than page size
                        if (persons.length < PAGE_SIZE) {
                            $(".loading-data").addClass("u-loaded");
                        }
                        //Fetch more persons
                        scrollHandler = function () {
                            if (
                                $(window).scrollTop() + $(window).height() >
                                    $(document).height() - 50 &&
                                !$(".loading-data").hasClass("u-loaded") &&
                                !$(".loading-data").hasClass("u-loading")
                            ) {
                                $(".loading-data")
                                    .slideDown()
                                    .addClass("u-loading");
                                //Fetching more persons
                                if (type == "search") {
                                    var fetchingMorePersons =
                                        DashManager.request(
                                            "search:entities",
                                            "persons",
                                            text,
                                            $(".loading-data").data("page") + 1
                                        );
                                } else {
                                    var fetchingMorePersons =
                                        DashManager.request(
                                            "person:entities",
                                            type,
                                            $(".loading-data").data("page") + 1
                                        );
                                }
                                //Fetch
                                $.when(fetchingMorePersons).done(function (
                                    morePersons
                                ) {
                                    persons.add(morePersons.models);
                                    $(".loading-data")
                                        .data(
                                            "page",
                                            $(".loading-data").data("page") + 1
                                        )
                                        .slideUp()
                                        .removeClass("u-loading");
                                    if (morePersons.length < PAGE_SIZE) {
                                        $(".loading-data").addClass("u-loaded");
                                    }
                                    //Find view by model and update masonry
                                    for (
                                        var i = 0;
                                        i < morePersons.models.length;
                                        i++
                                    ) {
                                        var child =
                                            personsView.children.findByModel(
                                                morePersons.models[i]
                                            );
                                        $(".all-items").masonry(
                                            "appended",
                                            child.$el
                                        );
                                    }
                                });
                            }
                        };
                        $(window).on("scroll", scrollHandler);
                    });
                    //Add person
                    DashManager.vent.off("add:person");
                    DashManager.vent.on("add:person", function (person) {
                        persons.add(person, { at: 0 });
                        personsView
                            .$(".all-items")
                            .masonry("prepended", $(".one-item").eq(0));
                    });
                    //Remove personCard
                    DashManager.vent.off("remove:personCard");
                    DashManager.vent.on("remove:personCard", function () {
                        location.reload();
                    });
                    DashManager.mainRegion.show(personsView);
                });
            },
            showSettings: function () {
                $(window).off("scroll", scrollHandler);
                //Hide search bar
                $(".searchWrap").addClass("u-hide");
                //Show loading page
                var loadingView = new DashManager.Common.Views.Loading();
                DashManager.mainRegion.show(loadingView);
                //Select
                $(".nav-links a").removeClass("selected");
                $(".nav-links .js-settings").addClass("selected");
                //Fetch site details
                var fetchingSite = DashManager.request("siteDetails:entity");
                $.when(fetchingSite).done(function (site) {
                    var settingsView =
                        new DashManager.DashApp.EntityViews.SettingsView({
                            model: site,
                        });
                    //Show
                    settingsView.on("show", function () {
                        document.title = "Site settings - UNESCO MGIEP";
                        //Show contact
                        var html = site
                            .get("contact")
                            .replace(/<br\s*[\/]?>/gi, "\n");
                        var tmp = document.createElement("div");
                        tmp.innerHTML = html;
                        var contact = tmp.textContent || tmp.innerText || "";
                        settingsView.$(".site-contact").val(contact);
                        //Show menu text
                        settingsView.$(".site-menu").val(site.get("menu").text);
                        //Show ticker
                        var all_tickers = site.get("ticker");
                        var ticker_string = "";
                        for (var i = 0; i < all_tickers.length; i++) {
                            if (i == all_tickers.length - 1) {
                                ticker_string +=
                                    all_tickers[i].title +
                                    ", " +
                                    all_tickers[i].url;
                            } else {
                                ticker_string +=
                                    all_tickers[i].title +
                                    ", " +
                                    all_tickers[i].url +
                                    "; ";
                            }
                        }
                        settingsView.$(".site-ticker").val(ticker_string);
                    });
                    //Update settings
                    settingsView.on("update:site", function (value) {
                        var site_settings = new DashManager.Entities.Site({
                            _id: site.get("_id"),
                            _action: "edit",
                        });
                        site_settings.set({
                            title: value.title,
                            desc: value.desc,
                            contact: value.contact,
                            menu: value.menu,
                            facebook: value.facebook,
                            twitter: value.twitter,
                            instagram: value.instagram,
                            youtube: value.youtube,
                            linkedin: value.linkedin,
                            meta: value.meta,
                            notice_desc: value.notice_desc,
                            notice_link: value.notice_link,
                            ticker: value.ticker,
                            theme: value.theme,
                            back_color: value.back_color,
                            text_color: value.text_color,
                            base_stories: value.base_stories,
                        });
                        site_settings.save({}, { success: function () {} });
                    });
                    //Add admin
                    settingsView.on("add:admin", function (value) {
                        var edit_site = new DashManager.Entities.Site({
                            _id: site.get("_id"),
                            _action: "add_admin",
                        });
                        edit_site.set({
                            email: value.email,
                        });
                        edit_site.save(
                            {},
                            {
                                success: function (user) {
                                    settingsView.$(".site-admin").val("");
                                    settingsView
                                        .$(".admin-list")
                                        .prepend(
                                            "<div class='one-admin'><p class='name'>" +
                                                user.get("name") +
                                                "<br><span>" +
                                                user.get("email") +
                                                "</span></p><span class='remove-admin u-delete'>Remove</span></div>"
                                        );
                                },
                            }
                        );
                    });
                    //Remove admin
                    settingsView.on("remove:admin", function (value) {
                        var edit_site = new DashManager.Entities.Site({
                            _id: site.get("_id"),
                            _action: "remove_admin",
                        });
                        edit_site.set({
                            email: value.email,
                        });
                        edit_site.save();
                    });
                    DashManager.mainRegion.show(settingsView);
                });
            },
            showActivity: function () {
                $(window).off("scroll", scrollHandler);
                //Hide search bar
                $(".searchWrap").addClass("u-hide");
                //Show loading page
                var loadingView = new DashManager.Common.Views.Loading();
                DashManager.mainRegion.show(loadingView);
                //Select
                $(".nav-links a").removeClass("selected");
                $(".nav-links .js-activity").addClass("selected");
                //Fetch activities
                var fetchingActivities =
                    DashManager.request("activity:entities");
                $.when(fetchingActivities).done(function (activities) {
                    //Group activities by date
                    var activitiesByDate = groupActivitiesByDate(activities);
                    //Show view
                    var activitiesView =
                        new DashManager.DashApp.EntityViews.ActivitiesView({
                            collection: activitiesByDate,
                        });
                    //Show
                    activitiesView.on("show", function () {
                        //Update title
                        document.title = "Activity - UNESCO MGIEP";
                        //All activities
                        var allActivities = activities.toJSON();
                        var $loading = activitiesView.$(".loading-activity");
                        //Pagination
                        $loading.data("page", 1).removeClass("u-loaded");
                        //Check if less than page size
                        if (activities.length < PAGE_SIZE) {
                            $loading.addClass("u-loaded");
                        }
                        //Fetch more activities
                        scrollHandler = function () {
                            var docHeight = $(document).height() - 100;
                            if (
                                $(window).scrollTop() + $(window).height() >=
                                    docHeight &&
                                !$loading.hasClass("u-loaded") &&
                                !$loading.hasClass("u-loading")
                            ) {
                                $loading.show().addClass("u-loading");
                                var fetchingNextActivities =
                                    DashManager.request(
                                        "activity:entities",
                                        $loading.data("page") + 1
                                    );
                                $.when(fetchingNextActivities).done(function (
                                    nextActivities
                                ) {
                                    //Add new activities to all activities
                                    allActivities = allActivities.concat(
                                        nextActivities.toJSON()
                                    );
                                    var activityCollection =
                                        new Backbone.Collection(allActivities);
                                    var activityCollectionByDate =
                                        groupActivitiesByDate(
                                            activityCollection
                                        );
                                    //Reset view collection with new collection
                                    activitiesView.collection.reset(
                                        activityCollectionByDate.models
                                    );
                                    $loading
                                        .data("page", $loading.data("page") + 1)
                                        .hide()
                                        .removeClass("u-loading");
                                    if (nextActivities.length < PAGE_SIZE) {
                                        $loading.addClass("u-loaded");
                                    }
                                });
                            }
                        };
                        $(window).on("scroll", scrollHandler);
                    });
                    DashManager.mainRegion.show(activitiesView);
                });
            },
            showProfile: function () {},
            showSelectImageModal: function () {
                $(".modal").show();
                //Fetching files
                var fetchingFiles = DashManager.request(
                    "file:entities",
                    "images"
                );
                $.when(fetchingFiles).done(function (files) {
                    var filesView =
                        new DashManager.DashApp.EntityViews.SelectImageView({
                            collection: files,
                        });
                    //Show
                    filesView.on("show", function () {
                        //Animate overlay box
                        setTimeout(function () {
                            filesView.$(".modal-box").addClass("animate");
                        }, 100);
                        //Masonry
                        $(".all-items").masonry({
                            itemSelector: ".one-item",
                            columnWidth: 250,
                        });
                        //Upload file
                        filesView.$(".direct-upload").each(function () {
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
                                    if (data.files[0].size >= MAX_FILE_SIZE)
                                        return;
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
                                    var file_name = data.files[0].name;
                                    //Get extension of the file
                                    var index = file_name.lastIndexOf(".");
                                    var file_ext = file_name.substring(
                                        index + 1,
                                        file_name.length
                                    );
                                    var file_title = decodeURIComponent(
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
                                    if (
                                        image_extensions.indexOf(file_ext) < 0
                                    ) {
                                        //Save file
                                        var new_file =
                                            new DashManager.Entities.File({
                                                title: file_title,
                                                url: url,
                                                size: data.files[0].size,
                                                ext: file_ext,
                                            });
                                        //Save file
                                        new_file.save(
                                            {},
                                            {
                                                success: function () {
                                                    uploadCount += 1;
                                                    if (
                                                        new_file.get("image") &&
                                                        new_file.get("image").l
                                                    ) {
                                                        //Add to view
                                                        files.add(new_file, {
                                                            at: 0,
                                                        });
                                                        filesView
                                                            .$(".all-items")
                                                            .masonry(
                                                                "prepended",
                                                                $(
                                                                    ".one-item"
                                                                ).eq(0)
                                                            );
                                                    }
                                                },
                                            }
                                        );
                                    } else {
                                        //Save image
                                        var new_file =
                                            new DashManager.Entities.File({
                                                title: file_title,
                                                url: url,
                                                image: url,
                                                size: data.files[0].size,
                                                ext: file_ext,
                                            });
                                        var image = new Image();
                                        image.src = window.URL.createObjectURL(
                                            data.files[0]
                                        );
                                        image.onload = function () {
                                            var bound =
                                                (image.naturalHeight * 400) /
                                                image.naturalWidth;
                                            if (bound) {
                                                bound = parseInt(bound);
                                                new_file.set("bound", bound);
                                            }
                                            window.URL.revokeObjectURL(
                                                image.src
                                            );
                                            //Save file
                                            new_file.save(
                                                {},
                                                {
                                                    success: function () {
                                                        uploadCount += 1;
                                                        if (
                                                            new_file.get(
                                                                "image"
                                                            ) &&
                                                            new_file.get(
                                                                "image"
                                                            ).l
                                                        ) {
                                                            //Add to view
                                                            files.add(
                                                                new_file,
                                                                { at: 0 }
                                                            );
                                                            filesView
                                                                .$(".all-items")
                                                                .masonry(
                                                                    "prepended",
                                                                    $(
                                                                        ".one-item"
                                                                    ).eq(0)
                                                                );
                                                        }
                                                    },
                                                }
                                            );
                                        };
                                        image.onerror = function () {
                                            //Save file
                                            new_file.save(
                                                {},
                                                {
                                                    success: function () {
                                                        uploadCount += 1;
                                                        if (
                                                            new_file.get(
                                                                "image"
                                                            ) &&
                                                            new_file.get(
                                                                "image"
                                                            ).l
                                                        ) {
                                                            //Add to view
                                                            files.add(
                                                                new_file,
                                                                { at: 0 }
                                                            );
                                                            filesView
                                                                .$(".all-items")
                                                                .masonry(
                                                                    "prepended",
                                                                    $(
                                                                        ".one-item"
                                                                    ).eq(0)
                                                                );
                                                        }
                                                    },
                                                }
                                            );
                                        };
                                    }
                                },
                            });
                        });
                    });
                    DashManager.modalRegion.show(filesView);
                });
            },
            showAddArticlesToFolderOverlay: function (folder_id) {
                $(".overlay").show();
                //Add to folder view
                var addToFolderView =
                    new DashManager.DashApp.EntityViews.AddToFolderView();
                //Show
                addToFolderView.on("show", function () {
                    //Animate overlay box
                    setTimeout(function () {
                        addToFolderView.$(".overlay-box").addClass("animate");
                    }, 100);
                    //Hide scroll on main page
                    DashManager.commands.execute("show:overlay");
                    //If articles are outside of folder
                    if (folder_id)
                        addToFolderView
                            .$(".choose-outside")
                            .removeClass("u-hide");
                    //Typeahead for folders
                    //Remote fetch folder list
                    var folderList = new Bloodhound({
                        datumTokenizer:
                            Bloodhound.tokenizers.obj.whitespace("value"),
                        queryTokenizer: Bloodhound.tokenizers.obj.whitespace,
                        remote: {
                            url: "/api/search/articleFolders?text=%QUERY",
                            replace: function (url) {
                                return url.replace(
                                    "%QUERY",
                                    addToFolderView
                                        .$(".folder-search.tt-input")
                                        .val()
                                );
                            },
                            filter: function (parsedResponse) {
                                return parsedResponse;
                            },
                        },
                    });
                    //Initialize personlist
                    folderList.initialize();
                    //Show typeahead
                    addToFolderView.$(".folder-search").typeahead(
                        {
                            hint: true,
                            highlight: true,
                            minLength: 1,
                        },
                        {
                            name: "title",
                            displayKey: "title",
                            limit: 5,
                            source: folderList.ttAdapter(),
                            templates: {
                                empty: [
                                    '<div class="no-find">',
                                    "No such folder exists.",
                                    "</div>",
                                ].join("\n"),
                                suggestion: Handlebars.compile(
                                    "<p class='title'>{{text.title}}</p>"
                                ),
                            },
                        }
                    );
                    //Focus
                    addToFolderView.$(".folder-search").focus();
                    //Add items to folder on typeahead autocomplete
                    addToFolderView
                        .$(".folder-search")
                        .on(
                            "typeahead:selected typeahead:autocompleted",
                            function (e, datum) {
                                //Move items
                                var selected_items = $(
                                    ".one-item.selected-item"
                                );
                                //Each item
                                async.eachSeries(
                                    selected_items,
                                    function (item, callback) {
                                        var item_id = $(item).data("id");
                                        //Move
                                        var item =
                                            new DashManager.Entities.Block({
                                                _id: item_id,
                                                _action: "move",
                                            });
                                        item.set({
                                            folder: datum._id,
                                        });
                                        item.save(
                                            {},
                                            {
                                                success: function () {
                                                    callback();
                                                },
                                                error: function () {
                                                    callback();
                                                },
                                            }
                                        );
                                    },
                                    function (err) {
                                        if (!err) {
                                            //Unselect item
                                            $(
                                                ".one-item.selected-item .select-item"
                                            ).removeClass("selected");
                                            $(
                                                ".one-item.selected-item"
                                            ).removeClass("selected-item");
                                            //Hide toolbar
                                            $(".mainWrap .toolbarWrap").slideUp(
                                                "fast"
                                            );
                                            //Close overlay
                                            DashManager.commands.execute(
                                                "close:overlay"
                                            );
                                            //Show folder
                                            DashManager.vent.trigger(
                                                "articles:show",
                                                "",
                                                datum._id
                                            );
                                        }
                                    }
                                );
                            }
                        );
                });
                //Save new folder and add items
                addToFolderView.on("save:folder", function (value) {
                    var new_folder = new DashManager.Entities.Block({
                        type: "content",
                        title: value.title,
                        is_folder: true,
                    });
                    new_folder.save(
                        {},
                        {
                            success: function () {
                                //Move items
                                var selected_items = $(
                                    ".one-item.selected-item"
                                );
                                //Each item
                                async.eachSeries(
                                    selected_items,
                                    function (item, callback) {
                                        var item_id = $(item).data("id");
                                        //Move
                                        var item =
                                            new DashManager.Entities.Block({
                                                _id: item_id,
                                                _action: "move",
                                            });
                                        item.set({
                                            folder: new_folder.get("_id"),
                                        });
                                        item.save(
                                            {},
                                            {
                                                success: function () {
                                                    callback();
                                                },
                                                error: function () {
                                                    callback();
                                                },
                                            }
                                        );
                                    },
                                    function (err) {
                                        if (!err) {
                                            //Unselect item
                                            $(
                                                ".one-item.selected-item .select-item"
                                            ).removeClass("selected");
                                            $(
                                                ".one-item.selected-item"
                                            ).removeClass("selected-item");
                                            //Hide toolbar
                                            $(".mainWrap .toolbarWrap").slideUp(
                                                "fast"
                                            );
                                            //Close overlay
                                            DashManager.commands.execute(
                                                "close:overlay"
                                            );
                                            //Show folder
                                            DashManager.vent.trigger(
                                                "articles:show",
                                                "",
                                                new_folder.get("_id")
                                            );
                                        }
                                    }
                                );
                            },
                        }
                    );
                });
                //Move articles outside of folder
                addToFolderView.on("move:outside", function (value) {
                    //Move items
                    var selected_items = $(".one-item.selected-item");
                    //Each item
                    async.eachSeries(
                        selected_items,
                        function (item, callback) {
                            var item_id = $(item).data("id");
                            //Move
                            var item = new DashManager.Entities.Block({
                                _id: item_id,
                                _action: "move",
                            });
                            item.set();
                            item.save(
                                {},
                                {
                                    success: function () {
                                        callback();
                                    },
                                    error: function () {
                                        callback();
                                    },
                                }
                            );
                        },
                        function (err) {
                            if (!err) {
                                //Unselect item
                                $(
                                    ".one-item.selected-item .select-item"
                                ).removeClass("selected");
                                $(".one-item.selected-item").removeClass(
                                    "selected-item"
                                );
                                //Hide toolbar
                                $(".mainWrap .toolbarWrap").slideUp("fast");
                                //Close overlay
                                DashManager.commands.execute("close:overlay");
                                //Show all articles
                                DashManager.vent.trigger("articles:show");
                            }
                        }
                    );
                });
                DashManager.overlayRegion.show(addToFolderView);
            },
            showAddFilesToFolderOverlay: function (folder_id) {
                $(".overlay").show();
                //Add to folder view
                var addToFolderView =
                    new DashManager.DashApp.EntityViews.AddToFolderView();
                //Show
                addToFolderView.on("show", function () {
                    //Animate overlay box
                    setTimeout(function () {
                        addToFolderView.$(".overlay-box").addClass("animate");
                    }, 100);
                    //Hide scroll on main page
                    DashManager.commands.execute("show:overlay");
                    //If files are outside of folder
                    if (folder_id)
                        addToFolderView
                            .$(".choose-outside")
                            .removeClass("u-hide");
                    //Typeahead for folders
                    //Remote fetch folder list
                    var folderList = new Bloodhound({
                        datumTokenizer:
                            Bloodhound.tokenizers.obj.whitespace("value"),
                        queryTokenizer: Bloodhound.tokenizers.obj.whitespace,
                        remote: {
                            url: "/api/search/fileFolders?text=%QUERY",
                            replace: function (url) {
                                return url.replace(
                                    "%QUERY",
                                    addToFolderView
                                        .$(".folder-search.tt-input")
                                        .val()
                                );
                            },
                            filter: function (parsedResponse) {
                                return parsedResponse;
                            },
                        },
                    });
                    //Initialize personlist
                    folderList.initialize();
                    //Show typeahead
                    addToFolderView.$(".folder-search").typeahead(
                        {
                            hint: true,
                            highlight: true,
                            minLength: 1,
                        },
                        {
                            name: "title",
                            displayKey: "title",
                            limit: 5,
                            source: folderList.ttAdapter(),
                            templates: {
                                empty: [
                                    '<div class="no-find">',
                                    "No such folder exists.",
                                    "</div>",
                                ].join("\n"),
                                suggestion: Handlebars.compile(
                                    "<p class='title'>{{title}}</p>"
                                ),
                            },
                        }
                    );
                    //Focus
                    addToFolderView.$(".folder-search").focus();
                    //Add items to folder on typeahead autocomplete
                    addToFolderView
                        .$(".folder-search")
                        .on(
                            "typeahead:selected typeahead:autocompleted",
                            function (e, datum) {
                                //Move items
                                var selected_items = $(
                                    ".one-item.selected-item"
                                );
                                //Each item
                                async.eachSeries(
                                    selected_items,
                                    function (item, callback) {
                                        var item_id = $(item).data("id");
                                        //Move
                                        var item =
                                            new DashManager.Entities.File({
                                                _id: item_id,
                                                _action: "move",
                                            });
                                        item.set({
                                            folder: datum._id,
                                        });
                                        item.save(
                                            {},
                                            {
                                                success: function () {
                                                    callback();
                                                },
                                                error: function () {
                                                    callback();
                                                },
                                            }
                                        );
                                    },
                                    function (err) {
                                        if (!err) {
                                            //Unselect item
                                            $(
                                                ".one-item.selected-item .select-item"
                                            ).removeClass("selected");
                                            $(
                                                ".one-item.selected-item"
                                            ).removeClass("selected-item");
                                            //Hide toolbar
                                            $(".mainWrap .toolbarWrap").slideUp(
                                                "fast"
                                            );
                                            //Close overlay
                                            DashManager.commands.execute(
                                                "close:overlay"
                                            );
                                            //Show folder
                                            DashManager.vent.trigger(
                                                "files:show",
                                                datum._id
                                            );
                                        }
                                    }
                                );
                            }
                        );
                });
                //Save new folder and add items
                addToFolderView.on("save:folder", function (value) {
                    var new_folder = new DashManager.Entities.File({
                        title: value.title,
                    });
                    new_folder.save(
                        {},
                        {
                            success: function () {
                                //Move items
                                var selected_items = $(
                                    ".one-item.selected-item"
                                );
                                //Each item
                                async.eachSeries(
                                    selected_items,
                                    function (item, callback) {
                                        var item_id = $(item).data("id");
                                        //Move
                                        var item =
                                            new DashManager.Entities.File({
                                                _id: item_id,
                                                _action: "move",
                                            });
                                        item.set({
                                            folder: new_folder.get("_id"),
                                        });
                                        item.save(
                                            {},
                                            {
                                                success: function () {
                                                    callback();
                                                },
                                                error: function () {
                                                    callback();
                                                },
                                            }
                                        );
                                    },
                                    function (err) {
                                        if (!err) {
                                            //Unselect item
                                            $(
                                                ".one-item.selected-item .select-item"
                                            ).removeClass("selected");
                                            $(
                                                ".one-item.selected-item"
                                            ).removeClass("selected-item");
                                            //Hide toolbar
                                            $(".mainWrap .toolbarWrap").slideUp(
                                                "fast"
                                            );
                                            //Close overlay
                                            DashManager.commands.execute(
                                                "close:overlay"
                                            );
                                            //Show folder
                                            DashManager.vent.trigger(
                                                "files:show",
                                                new_folder.get("_id")
                                            );
                                        }
                                    }
                                );
                            },
                        }
                    );
                });
                //Move files outside of folder
                addToFolderView.on("move:outside", function (value) {
                    //Move items
                    var selected_items = $(".one-item.selected-item");
                    //Each item
                    async.eachSeries(
                        selected_items,
                        function (item, callback) {
                            var item_id = $(item).data("id");
                            //Move
                            var item = new DashManager.Entities.File({
                                _id: item_id,
                                _action: "move",
                            });
                            item.set();
                            item.save(
                                {},
                                {
                                    success: function () {
                                        callback();
                                    },
                                    error: function () {
                                        callback();
                                    },
                                }
                            );
                        },
                        function (err) {
                            if (!err) {
                                //Unselect item
                                $(
                                    ".one-item.selected-item .select-item"
                                ).removeClass("selected");
                                $(".one-item.selected-item").removeClass(
                                    "selected-item"
                                );
                                //Hide toolbar
                                $(".mainWrap .toolbarWrap").slideUp("fast");
                                //Close overlay
                                DashManager.commands.execute("close:overlay");
                                //Show all files
                                DashManager.vent.trigger("files:show");
                            }
                        }
                    );
                });
                DashManager.overlayRegion.show(addToFolderView);
            },
        };
    }
);
