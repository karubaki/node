//API - v1 - MGIEP
var util = require("util"),
    async = require("async"),
    mongoose = require("mongoose"),
    validator = require("validator"),
    getSlug = require("speakingurl"),
    shortid = require("shortid"),
    randomColor = require("randomcolor"),
    fileUpload = require("express-fileupload"),
    xlsx = require("json-as-xlsx"),
    _ = require("lodash");
//UUID
const { v4: uuidv4 } = require("uuid");
//Models
var User = require("../app/models/user").User;
var Ticker = require("../app/models/entity").Ticker,
    Site = require("../app/models/entity").Site,
    Item = require("../app/models/entity").Item,
    Image = require("../app/models/entity").Image,
    Event = require("../app/models/entity").Event,
    ArticleTag = require("../app/models/entity").ArticleTag,
    Answer = require("../app/models/entity").Answer,
    Option = require("../app/models/entity").Option,
    ArticleBlock = require("../app/models/entity").ArticleBlock,
    Block = require("../app/models/entity").Block,
    Page = require("../app/models/entity").Page,
    Person = require("../app/models/entity").Person,
    File = require("../app/models/entity").File,
    Log = require("../app/models/entity").Log,
    Tag = require("../app/models/entity").Tag,
    Badge = require("../app/models/entity").Badge,
    Member = require("../app/models/entity").Member,
    Reaction = require("../app/models/entity").Reaction,
    UserReaction = require("../app/models/entity").UserReaction,
    Comment = require("../app/models/entity").Comment,
    Poll = require("../app/models/entity").Poll,
    Discussion = require("../app/models/entity").Discussion,
    Streak = require("../app/models/entity").Streak,
    UserBlock = require("../app/models/entity").UserBlock,
    Activity = require("../app/models/entity").Activity,
    Form = require("../app/models/entity").Form;
//Utilities
var Utility = require("../app/utility");
//Email
var Email = require("../config/mail.js");
//Variables for file upload
var mime = require("mime"),
    moment = require("moment"),
    crypto = require("crypto"),
    aws = require("aws-sdk");
//CORS
var cors = require("cors");
var corsOptions = {
    origin: "https://kindnessglobe.com",
    optionsSuccessStatus: 200,
};
//Realtime functions
var IO;
//Page size
var PAGE_SIZE = 20;
//Export all API functions
module.exports = function (app, passport, io) {
    IO = io;
    /* ----------------- SITE API ------------------ */
    //GET Requests
    //Get site details
    app.get("/api/site", _getSiteDetails);
    //PUT Requests
    //Update a site
    app.put(
        "/api/site/:_id/:_action",
        isLoggedIn,
        isAdmin,
        function (req, res) {
            switch (req.params._action) {
                case "edit":
                    _editSite(req, res);
                    break;
                case "add_admin":
                    _addAdmin(req, res);
                    break;
                case "remove_admin":
                    _removeAdmin(req, res);
                    break;
                default:
                    _editSite(req, res);
            }
        }
    );
    /* ----------------- PAGE API ------------------ */
    //GET Requests
    //Get pages
    app.get("/api/pages/:_type", isLoggedIn, isAdmin, function (req, res) {
        switch (req.params._type) {
            case "all":
                _getAllPages(req, res);
                break;
            case "public":
                _getPublicPages(req, res);
                break;
            default:
                _getAllPages(req, res);
        }
    });
    //Get hidden page details
    app.get("/api/page/:_id", isLoggedIn, isAdmin, _getPageById);
    //POST Requests
    //Create a page
    app.post("/api/page", isLoggedIn, isAdmin, _createPage);
    //PUT Requests
    //Update a page or actions on a page
    app.put("/api/page/:_id/:_action", isLoggedIn, function (req, res) {
        switch (req.params._action) {
            case "edit":
                _editPage(req, res);
                break;
            case "inc_level":
                _increaseLevel(req, res);
                break;
            case "dec_level":
                _decreaseLevel(req, res);
                break;
            case "move_up":
                _moveUp(req, res);
                break;
            case "move_down":
                _moveDown(req, res);
                break;
            case "publish":
                _publishPage(req, res);
                break;
            case "unpublish":
                _unpublishPage(req, res);
                break;
            case "featured_on":
                _featurePage(req, res);
                break;
            case "featured_off":
                _unFeaturePage(req, res);
                break;
            case "archive":
                _archivePage(req, res);
                break;
            case "unarchive":
                _unarchivePage(req, res);
                break;
            default:
                _editPage(req, res);
        }
    });
    //DELETE Requests
    //Delete a page
    app.delete("/api/page/:_id", isLoggedIn, isAdmin, _deletePage);
    /* ----------------- BLOCK API ------------------ */
    //GET Requests
    //Get all blocks
    app.get("/api/blocks/:_type", isLoggedIn, isAdmin, function (req, res) {
        switch (req.params._type) {
            case "page":
                _getPageBlocks(req, res);
                break;
            case "content":
                _getContentBlocks(req, res);
                break;
            default:
                _getPageBlocks(req, res);
        }
    });
    //Get block details
    app.get("/api/block/:_id", isLoggedIn, isAdmin, _getBlockById);
    //Get subblock details
    app.get(
        "/api/subblock/:_container/:_id",
        isLoggedIn,
        isAdmin,
        _getSubBlockById
    );
    //POST Requests
    //Create a block
    app.post("/api/block/:_type", isLoggedIn, isAdmin, function (req, res) {
        switch (req.params._type) {
            case "header":
                _addHeaderBlock(req, res);
                break;
            case "header_video":
                _addHeaderVideoBlock(req, res);
                break;
            case "header_bg":
                _addHeaderBackgroundBlock(req, res);
                break;
            case "header_media":
                _addHeaderMediaBlock(req, res);
                break;
            case "section":
            case "section_basic":
                _addSectionBlock(req, res);
                break;
            case "section_media":
                _addSectionMediaBlock(req, res);
                break;
            case "section_list":
                _addSectionListBlock(req, res);
                break;
            case "container":
                _addContainerBlock(req, res);
                break;
            case "body_text":
                _addBodyTextBlock(req, res);
                break;
            case "body_html":
                _addBodyHTMLBlock(req, res);
                break;
            case "body_embed":
                _addBodyEmbedBlock(req, res);
                break;
            case "body_carousel":
            case "body_carousel_text":
                _addBodyCarouselBlock(req, res);
                break;
            case "people":
            case "logos":
                _addPeopleBlock(req, res);
                break;
            case "breather":
                _addBreatherBlock(req, res);
                break;
            case "calendar":
                _addCalendarBlock(req, res);
                break;
            case "feed":
                _addFeedBlock(req, res);
                break;
            case "content":
                _addContentBlock(req, res);
                break;
            default:
                _addContainerBlock(req, res);
        }
    });
    //PUT Requests
    //Update a block or actions on a block
    app.put(
        "/api/block/:_id/:_action",
        isLoggedIn,
        isAdmin,
        function (req, res) {
            switch (req.params._action) {
                case "edit":
                    _editBlock(req, res);
                    break;
                case "move_up":
                    _moveBlockUp(req, res);
                    break;
                case "move_down":
                    _moveBlockDown(req, res);
                    break;
                case "add_item":
                    _addItemToBlock(req, res);
                    break;
                case "remove_item":
                    _removeItemFromBlock(req, res);
                    break;
                case "item_order":
                    _updateItemOrderInBlock(req, res);
                    break;
                case "add_image":
                    _addImageToBlock(req, res);
                    break;
                case "remove_image":
                    _removeImageFromBlock(req, res);
                    break;
                case "image_order":
                    _updateImageOrderInBlock(req, res);
                    break;
                case "add_person":
                    _addPersonToBlock(req, res);
                    break;
                case "remove_person":
                    _removePersonFromBlock(req, res);
                    break;
                case "person_order":
                    _updatePersonOrderInBlock(req, res);
                    break;
                case "add_event":
                    _addEventToBlock(req, res);
                    break;
                case "remove_event":
                    _removeEventFromBlock(req, res);
                    break;
                case "event_order":
                    _updateEventOrderInBlock(req, res);
                    break;
                case "add_page":
                    _addRelatedPage(req, res);
                    break;
                case "remove_page":
                    _removeRelatedPage(req, res);
                    break;
                case "add_tag":
                    _addTagToBlock(req, res);
                    break;
                case "remove_tag":
                    _removeTagFromBlock(req, res);
                    break;
                case "update_formula":
                    _updateDynamicFormula(req, res);
                    break;
                case "update_size":
                    _updateSizeBlock(req, res);
                    break;
                case "remove_block":
                    _removeSubBlock(req, res);
                    break;
                case "archive":
                    _archiveBlock(req, res);
                    break;
                case "unarchive":
                    _unarchiveBlock(req, res);
                    break;
                case "move":
                    _moveArticle(req, res);
                    break;
                default:
                    _editBlock(req, res);
            }
        }
    );
    //Update a subblock or actions on a subblock
    app.put(
        "/api/subblock/:_container/:_id/:_action",
        isLoggedIn,
        isAdmin,
        function (req, res) {
            switch (req.params._action) {
                case "edit":
                    _editSubBlock(req, res);
                    break;
                case "move_up":
                    _moveSubBlockUp(req, res);
                    break;
                case "move_down":
                    _moveSubBlockDown(req, res);
                    break;
                case "add_person":
                    _addPersonToSubBlock(req, res);
                    break;
                case "remove_person":
                    _removePersonFromSubBlock(req, res);
                    break;
                case "person_order":
                    _updatePersonOrderInSubBlock(req, res);
                    break;
                case "add_event":
                    _addEventToSubBlock(req, res);
                    break;
                case "remove_event":
                    _removeEventFromSubBlock(req, res);
                    break;
                case "event_order":
                    _updateEventOrderInSubBlock(req, res);
                    break;
                default:
                    _editSubBlock(req, res);
            }
        }
    );
    //DELETE Requests
    //Delete a block
    app.delete("/api/block/:_id", isLoggedIn, isAdmin, _deleteBlock);
    /* ----------------- ARTICLE BLOCK API ------------------ */
    //GET Requests
    //Get all article blocks
    app.get("/api/articleblocks/:_id", isLoggedIn, isAdmin, _getArticleBlocks);
    //Get article block details
    app.get(
        "/api/articleblock/:_id",
        isLoggedIn,
        isAdmin,
        _getArticleBlockById
    );
    //POST Requests
    //Create an article block
    app.post(
        "/api/articleblock/:_type",
        isLoggedIn,
        isAdmin,
        function (req, res) {
            switch (req.params._type) {
                case "text":
                    _createTextBlock(req, res);
                    break;
                case "gallery":
                    _createGalleryBlock(req, res);
                    break;
                case "file":
                case "image":
                case "audio":
                case "video":
                    _createFileBlock(req, res);
                    break;
                case "gif":
                    _createGIFBlock(req, res);
                    break;
                case "link":
                    _createLinkBlock(req, res);
                    break;
                case "embed":
                    _createEmbedBlock(req, res);
                    break;
                case "toggle":
                    _createToggleBlock(req, res);
                    break;
                case "callout":
                    _createCalloutBlock(req, res);
                    break;
                case "people":
                case "logos":
                    _createPeopleBlock(req, res);
                    break;
                case "breather":
                    _createBreatherBlock(req, res);
                    break;
                case "button":
                    _createButtonBlock(req, res);
                    break;
                case "mcq":
                    _createMCQBlock(req, res);
                    break;
                case "journal":
                    _createJournalBlock(req, res);
                    break;
                case "discussion":
                    _createDiscussionBlock(req, res);
                    break;
                default:
                    res.status(500).send({ error: "Invalid query type" });
            }
        }
    );
    //PUT Requests
    //Update an article block or actions on a block
    app.put(
        "/api/articleblock/:_id/:_action",
        isLoggedIn,
        isAdmin,
        function (req, res) {
            switch (req.params._action) {
                case "edit":
                    _editArticleBlock(req, res);
                    break;
                case "add_image":
                    _addImageToGallery(req, res);
                    break;
                case "remove_image":
                    _removeImageFromGallery(req, res);
                    break;
                case "image_order":
                    _updateImageOrderInGallery(req, res);
                    break;
                case "add_option":
                    _addOption(req, res);
                    break;
                case "edit_option":
                    _editOption(req, res);
                    break;
                case "remove_option":
                    _removeOption(req, res);
                    break;
                case "add_journaling":
                    _addJournalingResponse(req, res);
                    break;
                case "edit_text_journaling":
                    _editTextJournalingResponse(req, res);
                    break;
                case "remove_journaling":
                    _removeJournalingResponse(req, res);
                    break;
                case "add_person":
                    _addPersonToArticleBlock(req, res);
                    break;
                case "remove_person":
                    _removePersonFromArticleBlock(req, res);
                    break;
                case "person_order":
                    _updatePersonOrderInArticleBlock(req, res);
                    break;
                case "move_up":
                    _moveArticleBlockUp(req, res);
                    break;
                case "move_down":
                    _moveArticleBlockDown(req, res);
                    break;
                default:
                    _editArticleBlock(req, res);
            }
        }
    );
    //DELETE Requests
    //Delete an block
    app.delete(
        "/api/articleblock/:_id",
        isLoggedIn,
        isAdmin,
        _deleteArticleBlock
    );
    /* ----------------- FILE API ------------------ */
    //GET Requests
    //Get all files
    app.get("/api/files", isLoggedIn, isAdmin, _getFiles);
    //Get file details
    app.get("/api/file/:_id", isLoggedIn, isAdmin, _getFileById);
    //POST Requests
    //Create a file
    app.post("/api/file", isLoggedIn, isAdmin, _addFile);
    //PUT Requests
    //Update a file or actions on a file
    app.put(
        "/api/file/:_id/:_action",
        isLoggedIn,
        isAdmin,
        function (req, res) {
            switch (req.params._action) {
                case "edit":
                    _editFile(req, res);
                    break;
                case "move":
                    _moveFile(req, res);
                    break;
                default:
                    _editFile(req, res);
            }
        }
    );
    //DELETE Requests
    //Delete a file
    app.delete("/api/file/:_id", isLoggedIn, isAdmin, _deleteFile);
    /* ----------------- PERSON API ------------------ */
    //GET Requests
    //Get all persons
    app.get("/api/persons", isLoggedIn, isAdmin, _getPersons);
    //Get person details
    app.get("/api/person/:_id", isLoggedIn, isAdmin, _getPersonById);
    //POST Requests
    //Create a person
    app.post("/api/person", isLoggedIn, isAdmin, _addPerson);
    //PUT Requests
    //Update a person or actions on a person
    app.put(
        "/api/person/:_id/:_action",
        isLoggedIn,
        isAdmin,
        function (req, res) {
            switch (req.params._action) {
                case "edit":
                    _editPerson(req, res);
                    break;
                case "edit_image":
                    _editPersonImage(req, res);
                    break;
                default:
                    _editPerson(req, res);
            }
        }
    );
    //DELETE Requests
    //Delete a person
    app.delete("/api/person/:_id", isLoggedIn, isAdmin, _deletePerson);
    /* ----------------- USER API  ------------------ */
    //Get current user details
    app.get("/api/me", isLoggedIn, _getCurrentUser);
    //Get public user details
    app.get("/api/user/:_id", _getPublicUser);
    //Get all users for admin
    app.get("/api/list/users", _getAllUsers);
    //Update current user
    app.post("/api/me", isLoggedIn, _updateCurrentUser);
    /* ----------------- FOLLOWING API ------------------------- */
    //Show all following
    app.get("/api/following", isLoggedIn, _showFollowing);
    //Add new user to your following list
    app.post("/api/following", isLoggedIn, _addFollowing);
    //Remove user from your following list
    app.delete("/api/following/:_id", isLoggedIn, _removeFollowing);
    /* ----------------- FOLLOWERS API ------------------------- */
    //Show all followers
    app.get("/api/followers", isLoggedIn, _showFollowers);
    /* ----------------- SEARCH API  ------------------ */
    //Get search results in dashboard
    app.get("/api/search/:_type", isLoggedIn, isAdmin, function (req, res) {
        switch (req.params._type) {
            case "pages":
                _searchPages(req, res);
                break;
            case "files":
                _searchFiles(req, res);
                break;
            case "articles":
                _searchArticles(req, res);
                break;
            case "persons":
                _searchPersons(req, res);
                break;
            case "team":
                _searchTeamMembers(req, res);
                break;
            case "partners":
                _searchPartners(req, res);
                break;
            case "projectsAndEvents":
                _searchProjectsAndEvents(req, res);
                break;
            case "articleTags":
                _searchArticleTags(req, res);
                break;
            case "users":
                _searchUsers(req, res);
                break;
            case "tags":
                _searchTags(req, res);
                break;
            case "articleFolders":
                _searchArticleFolders(req, res);
                break;
            case "fileFolders":
                _searchFileFolders(req, res);
                break;
            case "gifs":
                _searchGifs(req, res);
                break;
            default:
                _searchPages(req, res);
        }
    });
    /* ----------------- LOG API  ------------------ */
    //Get logs
    app.get("/api/logs", isLoggedIn, isAdmin, _getLogs);
    /* ----------------- TAG API ------------------ */
    //GET Requests
    //Get all public tags
    app.get("/api/tags", _getAllPublicTags);
    //Get tags
    app.get("/api/tags/:_type", isLoggedIn, function (req, res) {
        switch (req.params._type) {
            case "all":
                _getAllMyTags(req, res);
                break;
            case "my":
                _getMyCreatedTags(req, res);
                break;
            case "explore":
                _getExploringTags(req, res);
                break;
            default:
                _getAllMyTags(req, res);
        }
    });
    //Get tag by _id or slug
    app.get("/api/tag/:_id", isLoggedIn, _getTagByIdOrSlug);
    //POST Requests
    app.post("/api/tag", isLoggedIn, _createTag);
    //PUT Requests
    app.put("/api/tag/:_id/:_action", isLoggedIn, function (req, res) {
        switch (req.params._action) {
            case "edit":
                _editTag(req, res);
                break;
            case "subscribe":
                _subscribeToTag(req, res);
                break;
            case "unsubscribe":
                _unsubscribeFromTag(req, res);
                break;
            case "join":
                _joinTag(req, res);
                break;
            case "unjoin":
                _unjoinTag(req, res);
                break;
            case "add_member":
                _addMemberToTag(req, res);
                break;
            case "remove_member":
                _removeMemberFromTag(req, res);
                break;
            case "activate":
                _activateTag(req, res);
                break;
            case "deactivate":
                _deactivateTag(req, res);
                break;
            default:
                _editTag(req, res);
        }
    });
    //DELETE Requests
    //Delete a tag
    app.delete("/api/tag/:_id", isLoggedIn, _deleteTag);
    /* ----------------- DISCUSSIONS API ------------------------- */
    //Get Requests
    //Get all public discussions
    app.get("/api/discussions", _getDailyDiscussions);
    //Get all discussions
    app.get("/api/discussions/:_type", isLoggedIn, function (req, res) {
        switch (req.params._type) {
            case "daily":
                _getDailyDiscussions(req, res);
                break;
            case "recent":
                _getAllDiscussionsByRecency(req, res);
                break;
            case "top":
                _getAllDiscussionsByTop(req, res);
                break;
            case "queued":
                _getQueuedDiscussions(req, res);
                break;
            case "reacted":
                _getReactedDiscussions(req, res);
                break;
            case "my":
                _getMyDiscussions(req, res);
                break;
            case "user":
                _getUserDiscussions(req, res);
                break;
            default:
                _getDailyDiscussions(req, res);
        }
    });
    //Get featured discussion
    app.get("/api/discussion", _getFeaturedDiscussion);
    //Get discussion by _id or slug
    app.get("/api/discussion/:_id", isLoggedIn, _getDiscussionByIdOrSlug);
    //POST Requests
    //Create a discussion
    app.post("/api/discussion/:_type", isLoggedIn, function (req, res) {
        switch (req.params._type) {
            case "text":
                _createTextDiscussion(req, res);
                break;
            case "link":
                _createLinkDiscussion(req, res);
                break;
            case "file":
            case "image":
                _createFileDiscussion(req, res);
                break;
            case "poll":
                _createPollDiscussion(req, res);
                break;
            default:
                res.status(500).send({ error: "Invalid query type" });
        }
    });
    // PUT Requests
    // Update a discussion or actions on a discussion
    app.put("/api/discussion/:_id/:_action", isLoggedIn, function (req, res) {
        switch (req.params._action) {
            case "edit":
                _editDiscussion(req, res);
                break;
            case "edit_poll":
                _editPoll(req, res);
                break;
            case "feature":
                _featureDiscussion(req, res);
                break;
            case "pin":
                _pinDiscussion(req, res);
                break;
            case "unpin":
                _unPinDiscussion(req, res);
                break;
            case "add_moderator":
                _addModeratorToDiscussion(req, res);
                break;
            case "remove_moderator":
                _removeModeratorFromDiscussion(req, res);
                break;
            case "add_badge":
                _addBadgeToDiscussion(req, res);
                break;
            case "remove_badge":
                _removeBadgeFromDiscussion(req, res);
                break;
            case "add_reaction":
                _addReactionToDiscussion(req, res);
                break;
            case "remove_reaction":
                _removeReactionFromDiscussion(req, res);
                break;
            case "add_tag":
                _addTagToDiscussion(req, res);
                break;
            case "remove_tag":
                _removeTagFromDiscussion(req, res);
                break;
            default:
                _editDiscussion(req, res);
        }
    });
    //DELETE Requests
    //Delete a discussion
    app.delete("/api/discussion/:_id", isLoggedIn, _deleteDiscussion);
    /* ----------------- COMMENTS API ------------------------- */
    //Get Requests
    //Get all comments
    app.get("/api/discussion/:_id/comments", isLoggedIn, _showComments);
    //Get a comment by id
    app.get("/api/comment/:_id", isLoggedIn, _getCommentById);
    //POST Requests
    //Add a comment
    app.post("/api/comment", isLoggedIn, _addComment);
    // PUT Requests
    // Update a comment or actions on a comment
    app.put("/api/comment/:_id/:_action", isLoggedIn, function (req, res) {
        switch (req.params._action) {
            case "edit":
                _editComment(req, res);
                break;
            case "like":
                _likeComment(req, res);
                break;
            case "unlike":
                _unlikeComment(req, res);
                break;
            default:
                _editComment(req, res);
        }
    });
    //DELETE Requests
    //Delete a comment
    app.delete("/api/comment/:_id", isLoggedIn, _deleteComment);
    /* ----------------- BADGES API ------------------------- */
    //Get Requests
    //Get all badges
    app.get("/api/badges", isLoggedIn, _getBadges);
    //Get an badge by id
    app.get("/api/badge/:_id", isLoggedIn, _getBadgeById);
    //POST Requests
    //Add a badge
    app.post("/api/badge", isLoggedIn, _addBadge);
    // PUT Requests
    // Edit a badge
    app.put("/api/badge/:_id", isLoggedIn, _editBadge);
    //DELETE Requests
    //Delete a badge
    app.delete("/api/badge/:_id", isLoggedIn, _deleteBadge);
    /* ----------------- REACTIONS API ------------------------- */
    //Get Requests
    //Get all reactions
    app.get("/api/reactions", isLoggedIn, _getReactions);
    //Get an reaction by id
    app.get("/api/reaction/:_id", isLoggedIn, _getReactionById);
    //POST Requests
    //Add a reaction
    app.post("/api/reaction", isLoggedIn, _addReaction);
    // PUT Requests
    // Edit a reaction
    app.put("/api/reaction/:_id", isLoggedIn, _editReaction);
    //DELETE Requests
    //Delete a reaction
    app.delete("/api/reaction/:_id", isLoggedIn, _deleteReaction);
    /* ----------------- PUBLIC API ------------------ */
    //Get public pages
    app.get("/api/public/pages", _getPublicPages);
    //Get public page
    app.get("/api/public/page/:_id", _getPageById);
    //Get article blocks
    app.get("/api/public/articleblocks/:slug", _getPublicArticleBlocks);
    //Get feed
    app.get("/api/public/feed", _getPublicFeed);
    //Get search results
    app.get("/api/public/search", _searchPagesAndArticles);
    /* ----------------- GET LINK DETAILS ------------------ */
    app.get("/api/embedlink", isLoggedIn, _getLinkPreview);
    /* ----------------- GET KINDNESS STORIES ------------------ */
    //Get kindness stories count
    app.get("/api/stories", _getKindnessStories);
    //Get kindness stories in geojson format
    app.get("/api/kindness", cors(corsOptions), _getKindnessGeoJSON);
    /* ----------------- ACTIVITY API  ------------------ */
    //Get current user activities
    app.get("/api/activity", isLoggedIn, _getActivity);
    /* ----------------- FORM API ------------------ */
    //GET Requests
    //Get all form data
    app.get("/api/form", isLoggedIn, isAdmin, _getForm);
    //POST Requests
    //Create a form data
    app.post("/api/form", _addForm);
    /* ----------------- GET STREAK ------------------ */
    app.get("/api/streak", isLoggedIn, _getStreak);
    /* ----------------- UPLOAD TO S3 ------------------ */
    app.get("/api/signed", isLoggedIn, _uploadS3);
    app.post(
        "/api/upload",
        isLoggedIn,
        fileUpload({
            useTempFiles: true,
            tempFileDir: "/tmp/",
            limits: { fileSize: 100 * 1024 * 1024 },
        }),
        _uploadFile
    );
    /* ----------------- CREATE MGIEP Site ------------------ */
    app.get("/api/createmgiepsite", isLoggedIn, isAdmin, _createMGIEPSite);
};
/*---------------- SITE FUNCTION -------------------------*/
//GET Request functions - Site
//Get site details
var _getSiteDetails = function (req, res) {
    Site.findOne({}, function (err, site) {
        //Get admins
        User.find({ type: "admin" })
            .select("username name about email dp karma")
            .sort({ accountCreated: -1 })
            .exec(function (err, users) {
                site.admins = users;
                res.send(site);
            });
    });
};
//PUT Requests functions - Site
//Edit basic details of site like title, desc and image
var _editSite = function (req, res) {
    Site.findOne({ _id: req.params._id }, function (err, site) {
        if (req.body.title) {
            site.title = req.body.title;
        }
        if (req.body.desc) {
            site.desc = req.body.desc;
        }
        if (req.body.menu) {
            site.menu.text = req.body.menu;
            site.menu.html = Utility.get_menu_html(req.body.menu);
        }
        if (req.body.contact != null) {
            site.contact = Utility.get_linkified_text(req.body.contact);
        }
        site.image.meta = req.body.meta;
        site.favicon = req.body.favicon;
        site.apple = req.body.apple;
        site.social.facebook = req.body.facebook;
        site.social.twitter = req.body.twitter;
        site.social.instagram = req.body.instagram;
        site.social.youtube = req.body.youtube;
        site.social.linkedin = req.body.linkedin;
        site.notice.desc = req.body.notice_desc;
        site.notice.link = req.body.notice_link;
        site.subscribe.title = req.body.subscribe_title;
        site.subscribe.desc = req.body.subscribe_desc;
        site.color.back = req.body.back_color;
        site.color.text = req.body.text_color;
        //Ticker
        if (req.body.ticker != null) {
            if (req.body.ticker) {
                site.ticker = req.body.ticker;
            } else {
                site.ticker = undefined;
            }
        }
        //Theme
        if (req.body.theme) {
            site.theme = req.body.theme.toLowerCase();
        }
        //Base stories
        if (req.body.base_stories != null) {
            site.base_stories = req.body.base_stories;
        }
        site.save(function (err) {
            if (!err) {
                res.status(200).send(site);
            } else {
                res.sendStatus(400);
            }
        });
    });
};
//Add admin
var _addAdmin = function (req, res) {
    if (!req.body.email)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a user email.",
        });
    User.findOne({
        email: req.body.email,
        type: { $in: ["editor", "normal", "verified"] },
    })
        .select("username name about email dp karma")
        .exec(function (err, user) {
            if (!user)
                return res.status(400).send({ error: "No such user exists." });
            user.type = "admin";
            user.save(function (err) {
                res.send(user);
            });
        });
};
//Remove admin
var _removeAdmin = function (req, res) {
    if (!req.body.email)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a user email.",
        });
    User.updateOne(
        { email: req.body.email },
        { $set: { type: "normal" } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
/*---------------- PAGE FUNCTION -------------------------*/
//GET Request functions - Page
//Get all pages - public + hidden
var _getAllPages = function (req, res) {
    if (req.query.category) {
        Page.find({ category: req.query.category })
            .sort({ order: 1 })
            .exec(function (err, pages) {
                res.send(pages);
            });
    } else {
        Page.find({})
            .sort({ updated_at: -1 })
            .exec(function (err, pages) {
                //Filter home and newsroom
                var home_page = _.filter(pages, { category: "institute" });
                var newsroom = _.filter(pages, { category: "newsroom" });
                var other_pages = _.filter(pages, function (p) {
                    return (
                        p.category != "institute" && p.category != "newsroom"
                    );
                });
                var all_pages = home_page.concat(newsroom, other_pages);
                res.send(all_pages);
            });
    }
};
//Get public pages
var _getPublicPages = function (req, res) {
    if (req.query.category) {
        Page.find({ category: req.query.category, is_published: true })
            .select("category title url ref_url order level")
            .sort({ order: 1 })
            .exec(function (err, pages) {
                res.send(pages);
            });
    } else {
        Page.find({ is_published: true })
            .sort({ order: 1 })
            .select("category title url ref_url order level")
            .exec(function (err, pages) {
                res.send(pages);
            });
    }
};
//Get one page details
var _getPageById = function (req, res) {
    Page.findOne({ _id: req.params._id }).exec(function (err, page) {
        if (!page) return res.sendStatus(404);
        Block.find({ page: page._id })
            .populate(
                "people",
                "type name about desc initials image email url",
                "Person"
            )
            .populate(
                "blocks.people",
                "type name about desc initials image email url",
                "Person"
            )
            .sort({ order: 1 })
            .exec(function (err, blocks) {
                var block_arr = [];
                async.eachSeries(
                    blocks,
                    function (block, callback) {
                        if (block.formula && block.formula != "empty") {
                            if (block.row_count) {
                                var limit_count = 3 * block.row_count;
                            }
                            //Category name
                            if (block.formula == "projects") {
                                var category_name = "project";
                            } else if (block.formula == "events") {
                                var category_name = "event";
                            } else {
                                var category_name = block.formula;
                            }
                            //Get
                            if (
                                block.formula == "tags" &&
                                block.tags &&
                                block.tags.length
                            ) {
                                if (limit_count) {
                                    Block.find({
                                        type: "content",
                                        tags: { $all: block.tags },
                                    })
                                        .sort({ updated_at: -1 })
                                        .limit(limit_count)
                                        .exec(function (err, blocks) {
                                            block.blocks = blocks;
                                            block_arr.push(block);
                                            callback();
                                        });
                                } else {
                                    Block.find({
                                        type: "content",
                                        tags: { $all: block.tags },
                                    })
                                        .sort({ updated_at: -1 })
                                        .exec(function (err, blocks) {
                                            block.blocks = blocks;
                                            block_arr.push(block);
                                            callback();
                                        });
                                }
                            } else if (
                                block.formula == "projects" ||
                                block.formula == "events"
                            ) {
                                if (limit_count) {
                                    Page.find({ category: category_name })
                                        .sort({ updated_at: -1 })
                                        .limit(limit_count)
                                        .exec(function (err, pages) {
                                            block.pages = pages;
                                            block_arr.push(block);
                                            callback();
                                        });
                                } else {
                                    Page.find({ category: category_name })
                                        .sort({ updated_at: -1 })
                                        .exec(function (err, pages) {
                                            block.pages = pages;
                                            block_arr.push(block);
                                            callback();
                                        });
                                }
                            } else {
                                if (
                                    page.category == "project" ||
                                    page.category == "event" ||
                                    page.category == "publication"
                                ) {
                                    if (limit_count) {
                                        Block.find({
                                            category: category_name,
                                            related: page,
                                        })
                                            .sort({ updated_at: -1 })
                                            .limit(limit_count)
                                            .exec(function (err, blocks) {
                                                block.blocks = blocks;
                                                block_arr.push(block);
                                                callback();
                                            });
                                    } else {
                                        Block.find({
                                            category: category_name,
                                            related: page,
                                        })
                                            .sort({ updated_at: -1 })
                                            .exec(function (err, blocks) {
                                                block.blocks = blocks;
                                                block_arr.push(block);
                                                callback();
                                            });
                                    }
                                } else {
                                    if (limit_count) {
                                        Block.find({ category: category_name })
                                            .sort({ updated_at: -1 })
                                            .limit(limit_count)
                                            .exec(function (err, blocks) {
                                                block.blocks = blocks;
                                                block_arr.push(block);
                                                callback();
                                            });
                                    } else {
                                        Block.find({ category: category_name })
                                            .sort({ updated_at: -1 })
                                            .exec(function (err, blocks) {
                                                block.blocks = blocks;
                                                block_arr.push(block);
                                                callback();
                                            });
                                    }
                                }
                            }
                        } else {
                            block_arr.push(block);
                            callback();
                        }
                    },
                    function (err) {
                        res.send({
                            about: page,
                            blocks: blocks,
                        });
                    }
                );
            });
    });
};
//POST Requests function - Page
//Create a page
var _createPage = function (req, res) {
    if (!req.body.title) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page title.",
        });
    }
    //URL
    if (req.body.url) {
        var url = getSlug(req.body.url);
    } else {
        var url = getSlug(req.body.title);
    }
    //Institute home or Newsroom
    if (req.body.category == "institute") {
        var url = "";
    } else if (req.body.category == "newsroom") {
        var url = "newsroom";
    }
    //Find
    Page.findOne({ url: url }, function (err, page) {
        if (page)
            return res.status(400).send({ error: "Page already exists." });
        var new_page = new Page({
            title: req.body.title,
            url: url,
            desc: req.body.desc,
            "image.m": req.body.image,
            "image.l": req.body.image,
            "image.meta": req.body.meta,
            "image.favicon": req.body.favicon,
            "image.apple": req.body.apple,
            order: req.body.order,
            level: req.body.level,
            ref_url: req.body.ref_url,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Category
        if (req.body.category) {
            new_page.category = req.body.category;
        } else {
            new_page.category = "other";
        }
        //Save
        new_page.save(function (err) {
            if (!err) {
                //Update order of other pages
                if (req.body.order) {
                    Page.updateMany(
                        {
                            _id: { $ne: new_page._id },
                            order: { $gte: req.body.order },
                        },
                        { $inc: { order: 1 } },
                        function (err, numAffected) {
                            res.send(new_page);
                        }
                    );
                } else {
                    res.send(new_page);
                }
                //Save log
                saveLog("add", "page", req.user.id, { page: new_page._id });
            }
        });
    });
};
//PUT Requests functions - Page
//Edit basic details of page like title, url etc.
var _editPage = function (req, res) {
    Page.findOne({ _id: req.params._id }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Title
        if (req.body.title) {
            page.title = req.body.title;
        }
        //Url
        if (req.body.url) {
            var slug_url = getSlug(req.body.url);
            if (page.url != slug_url) {
                page.url = slug_url;
            }
        }
        //Desc
        if (req.body.desc != null) {
            page.desc = req.body.desc;
        }
        //Menu
        if (req.body.menu != null) {
            if (req.body.menu) {
                page.menu.text = req.body.menu;
                page.menu.html = Utility.get_menu_html(req.body.menu);
            } else {
                page.menu.text = "";
                page.menu.html = "";
            }
        }
        //Images
        if (req.body.image != null) {
            page.image.m = req.body.image;
            page.image.l = req.body.image;
        }
        if (req.body.favicon != null) {
            page.image.favicon = req.body.favicon;
        }
        if (req.body.apple != null) {
            page.image.apple = req.body.apple;
        }
        //Meta
        if (req.body.meta != null) {
            page.image.meta = req.body.meta;
        }
        //External url
        if (req.body.ref_url != null) {
            page.ref_url = req.body.ref_url;
        }
        //Category
        if (req.body.category) {
            page.category = req.body.category;
        }
        //Save
        page.updated_at = new Date(Date.now());
        page.save(function (err) {
            if (!err) {
                res.status(200).send(page);
            } else {
                res.sendStatus(400);
            }
        });
    });
};
//Increment level of page
var _increaseLevel = function (req, res) {
    Page.updateOne(
        { _id: req.params._id },
        { $inc: { level: 1 } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//Decrease level of page
var _decreaseLevel = function (req, res) {
    Page.updateOne(
        { _id: req.params._id },
        { $inc: { level: -1 } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//Move up
var _moveUp = function (req, res) {
    Page.findOne({ _id: req.params._id }, function (err, page) {
        if (!page) return res.sendStatus(404);
        var current_order = page.order;
        if (current_order == 1)
            return res.status(400).send({ error: "Page already at the top." });
        var prev_order = current_order - 1;
        //Update
        Page.updateOne(
            { order: prev_order },
            { $inc: { order: 1 } },
            function (err, numAffected) {
                page.order = current_order - 1;
                page.save(function (err) {
                    if (!err) {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(400);
                    }
                });
            }
        );
    });
};
//Mode down
var _moveDown = function (req, res) {
    Page.findOne({ _id: req.params._id }, function (err, page) {
        if (!page) return res.sendStatus(404);
        var current_order = page.order;
        var next_order = current_order + 1;
        //Update
        Page.updateOne(
            { order: next_order },
            { $inc: { order: -1 } },
            function (err, numAffected) {
                page.order = current_order + 1;
                page.save(function (err) {
                    if (!err) {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(400);
                    }
                });
            }
        );
    });
};
var _updateOrder = function (req, res) {
    if (!req.query.order)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an order number.",
        });
    Page.findOne({ _id: req.params._id }, function (err, page) {
        var prev_order = page.order;
        var new_order = req.query.order;
        //Update order of every page in the category
        Page.updateMany(
            { category: page.category, order: { $gte: new_order } },
            { inc: { order: 1 } },
            function (err, numAffected) {
                page.order = new_order;
                page.save(function (err) {
                    if (!err) {
                        res.status(200).send(page);
                    } else {
                        res.sendStatus(200);
                    }
                });
            }
        );
    });
};
//Publish page
var _publishPage = function (req, res) {
    Page.updateOne(
        { _id: req.params._id, is_published: false },
        { $set: { is_published: true } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//Unpublish page
var _unpublishPage = function (req, res) {
    Page.updateOne(
        { _id: req.params._id, is_published: true },
        { $set: { is_published: false } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//Feature page
var _featurePage = function (req, res) {
    Page.updateOne(
        { _id: req.params._id, is_featured: false },
        { $set: { is_featured: true } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//Unfeature page
var _unfeaturePage = function (req, res) {
    Page.updateOne(
        { _id: req.params._id, is_featured: true },
        { $set: { is_featured: false } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//Archive page
var _archivePage = function (req, res) {
    Page.updateOne(
        { _id: req.params._id },
        { $set: { is_archived: true } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//Unarchive page
var _unarchivePage = function (req, res) {
    Page.updateOne(
        { _id: req.params._id },
        { $set: { is_archived: false } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//DELETE request function - Page
//Delete page - Delete Blocks
var _deletePage = function (req, res) {
    Page.findOne({ _id: req.params._id }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Get previous title
        var prev_title = page.title;
        //Delete all blocks
        Block.find({ page: page._id }, function (err, blocks) {
            if (blocks && blocks.length) {
                //All s3 image keys
                var keys = [];
                async.each(
                    blocks,
                    function (block, callback) {
                        if (block.blocks && block.blocks.length) {
                            async.each(
                                block.blocks,
                                function (subblock, callback2) {
                                    if (subblock.type == "body_html") {
                                        var image_keys = Utility.get_image_keys(
                                            subblock.images
                                        );
                                        keys = keys.concat(image_keys);
                                    }
                                    callback2();
                                },
                                function (err) {
                                    //Get image keys from rich text
                                    if (block.type == "body_html") {
                                        var image_keys = Utility.get_image_keys(
                                            block.images
                                        );
                                        keys = keys.concat(image_keys);
                                    }
                                    //Remove block
                                    block.remove(function (err) {
                                        callback();
                                    });
                                }
                            );
                        } else {
                            //Get image keys from rich text
                            if (block.type == "body_html") {
                                var image_keys = Utility.get_image_keys(
                                    block.images
                                );
                                keys = keys.concat(image_keys);
                            }
                            //Remove block
                            block.remove(function (err) {
                                callback();
                            });
                        }
                    },
                    function (err) {
                        //Change order of other pages
                        var next_order = page.order + 1;
                        Page.updateMany(
                            { order: { $gte: next_order } },
                            { $inc: { order: -1 } },
                            function (err, numAffected) {
                                //Delete page
                                page.remove(function (err) {
                                    if (!err) {
                                        res.sendStatus(200);
                                        //Finally delete all keys
                                        if (keys.length)
                                            Utility.delete_keys(keys);
                                        //Save log
                                        Log.deleteMany(
                                            {
                                                type: "page",
                                                "entity.page": req.params._id,
                                            },
                                            function (err, numAffected) {
                                                saveLog(
                                                    "delete",
                                                    "page",
                                                    req.user.id,
                                                    "",
                                                    prev_title
                                                );
                                            }
                                        );
                                    } else {
                                        res.sendStatus(400);
                                    }
                                });
                            }
                        );
                    }
                );
            } else {
                //Change order of other pages
                var next_order = page.order + 1;
                Page.updateMany(
                    { order: { $gte: next_order } },
                    { $inc: { order: -1 } },
                    function (err, numAffected) {
                        //Delete page
                        page.remove(function (err) {
                            if (!err) {
                                res.sendStatus(200);
                                //Save log
                                Log.deleteMany(
                                    {
                                        type: "page",
                                        "entity.page": req.params._id,
                                    },
                                    function (err, numAffected) {
                                        saveLog(
                                            "delete",
                                            "page",
                                            req.user.id,
                                            "",
                                            prev_title
                                        );
                                    }
                                );
                            } else {
                                res.sendStatus(400);
                            }
                        });
                    }
                );
            }
        });
    });
};
/* ------------------- BLOCKS FUNCTION ------------------------- */
//GET Request functions - Block
//Get page blocks
var _getPageBlocks = function (req, res) {
    if (!req.query.page)
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a page id." });
    Page.find({ _id: req.query.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        Block.find({ page: page._id })
            .sort({ order: 1 })
            .exec(function (blocks) {
                res.send(blocks);
            });
    });
};
//Get content blocks
var _getContentBlocks = function (req, res) {
    var page = req.query.page;
    if (req.query.category) {
        Block.find({
            type: "content",
            category: req.query.category,
            folder: null,
        })
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, blocks) {
                res.send(blocks);
            });
    } else if (req.query.feed) {
        Block.find({ type: "content", feed: { $ne: null }, folder: null })
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, blocks) {
                res.send(blocks);
            });
    } else if (req.query.folder) {
        Block.find({ type: "content", folder: req.query.folder })
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, blocks) {
                res.send(blocks);
            });
    } else {
        Block.find({ type: "content", folder: null })
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, blocks) {
                res.send(blocks);
            });
    }
};
//Get feed
var _getPublicFeed = function (req, res) {
    var page = req.query.page;
    Block.find({ type: "content", feed: { $ne: null } })
        .sort({ updated_at: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec(function (err, blocks) {
            res.send(blocks);
        });
};
//Get one block details
var _getBlockById = function (req, res) {
    Block.findOne({ _id: req.params._id })
        .populate(
            "people",
            "type name about desc initials image email url",
            "Person"
        )
        .populate("related", "title", "Page")
        .populate("tags", "name color count", "ArticleTag")
        .exec(function (err, block) {
            if (!block) return res.sendStatus(404);
            res.send(block);
        });
};
//Get one subblock details
var _getSubBlockById = function (req, res) {
    Block.findOne({ _id: req.params._container, type: "container" })
        .populate(
            "blocks.people",
            "type name about desc initials image email url",
            "Person"
        )
        .exec(function (err, containerBlock) {
            if (!containerBlock) return res.sendStatus(404);
            var sub_block = containerBlock.blocks.id(req.params._id);
            res.send(sub_block);
        });
};
//POST Request functions - Block
//Add default header block
var _addHeaderBlock = function (req, res) {
    if (!req.body.page || !req.body.order || !req.body.title) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order and title.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "header",
            "text.title": req.body.title,
            "text.desc": req.body.desc,
            "button.text": req.body.button_text,
            "button.url": req.body.button_url,
            "button.embed": req.body.button_embed,
            "buttonb.text": req.body.buttonb_text,
            "buttonb.url": req.body.buttonb_url,
            "buttonb.embed": req.body.buttonb_embed,
            "image.bg": req.body.image_bg,
            "story.title": req.body.story_title,
            "story.text": req.body.story_text,
            "story.url": req.body.story_url,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Save
        new_block.save(function (err) {
            if (!err) {
                //Update order of other blocks
                if (req.body.order) {
                    Block.updateMany(
                        {
                            _id: { $ne: new_block._id },
                            page: req.body.page,
                            order: { $gte: req.body.order },
                        },
                        { $inc: { order: 1 } },
                        function (err, numAffected) {
                            res.send(new_block);
                        }
                    );
                } else {
                    res.send(new_block);
                }
            }
        });
    });
};
//Add header video block
var _addHeaderVideoBlock = function (req, res) {
    if (
        !req.body.page ||
        !req.body.order ||
        !req.body.title ||
        !req.body.embed
    ) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order, title and embed code.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "header_video",
            "text.title": req.body.title,
            "text.desc": req.body.desc,
            "button.text": req.body.button_text,
            "button.url": req.body.button_url,
            "button.embed": req.body.button_embed,
            "buttonb.text": req.body.buttonb_text,
            "buttonb.url": req.body.buttonb_url,
            "buttonb.embed": req.body.buttonb_embed,
            "url.embed": req.body.embed,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Save
        new_block.save(function (err) {
            if (!err) {
                //Update order of other blocks
                if (req.body.order) {
                    Block.updateMany(
                        {
                            _id: { $ne: new_block._id },
                            page: req.body.page,
                            order: { $gte: req.body.order },
                        },
                        { $inc: { order: 1 } },
                        function (err, numAffected) {
                            res.send(new_block);
                        }
                    );
                } else {
                    res.send(new_block);
                }
            }
        });
    });
};
//Add header background block
var _addHeaderBackgroundBlock = function (req, res) {
    if (
        !req.body.page ||
        !req.body.order ||
        !req.body.title ||
        !req.body.image_bg
    ) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order, title and background image.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "header_bg",
            "text.title": req.body.title,
            "text.desc": req.body.desc,
            "button.text": req.body.button_text,
            "button.url": req.body.button_url,
            "button.embed": req.body.button_embed,
            "buttonb.text": req.body.buttonb_text,
            "buttonb.url": req.body.buttonb_url,
            "buttonb.embed": req.body.buttonb_embed,
            "image.bg": req.body.image_bg,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Save
        new_block.save(function (err) {
            if (!err) {
                //Update order of other blocks
                if (req.body.order) {
                    Block.updateMany(
                        {
                            _id: { $ne: new_block._id },
                            page: req.body.page,
                            order: { $gte: req.body.order },
                        },
                        { $inc: { order: 1 } },
                        function (err, numAffected) {
                            res.send(new_block);
                        }
                    );
                } else {
                    res.send(new_block);
                }
            }
        });
    });
};
//Add header media block
var _addHeaderMediaBlock = function (req, res) {
    if (!req.body.page || !req.body.order || !req.body.title) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order and title.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "header_media",
            "text.title": req.body.title,
            "text.desc": req.body.desc,
            "button.text": req.body.button_text,
            "button.url": req.body.button_url,
            "button.embed": req.body.button_embed,
            "buttonb.text": req.body.buttonb_text,
            "buttonb.url": req.body.buttonb_url,
            "buttonb.embed": req.body.buttonb_embed,
            "image.m": req.body.image_m,
            "url.embed": req.body.embed,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Save
        new_block.save(function (err) {
            if (!err) {
                //Update order of other blocks
                if (req.body.order) {
                    Block.updateMany(
                        {
                            _id: { $ne: new_block._id },
                            page: req.body.page,
                            order: { $gte: req.body.order },
                        },
                        { $inc: { order: 1 } },
                        function (err, numAffected) {
                            res.send(new_block);
                        }
                    );
                } else {
                    res.send(new_block);
                }
            }
        });
    });
};
//Add default or basic section block
var _addSectionBlock = function (req, res) {
    if (!req.body.page || !req.body.order || !req.body.title) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order and title.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: req.params._type,
            "text.title": req.body.title,
            "button.text": req.body.button_text,
            "button.url": req.body.button_url,
            "button.embed": req.body.button_embed,
            "buttonb.text": req.body.buttonb_text,
            "buttonb.url": req.body.buttonb_url,
            "buttonb.embed": req.body.buttonb_embed,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Description
        if (req.body.desc) {
            new_block.text.desc = Utility.get_linkified_text(req.body.desc);
        }
        //Save
        new_block.save(function (err) {
            if (!err) {
                //Update order of other blocks
                if (req.body.order) {
                    Block.updateMany(
                        {
                            _id: { $ne: new_block._id },
                            page: req.body.page,
                            order: { $gte: req.body.order },
                        },
                        { $inc: { order: 1 } },
                        function (err, numAffected) {
                            res.send(new_block);
                        }
                    );
                } else {
                    res.send(new_block);
                }
            }
        });
    });
};
//Add media section block
var _addSectionMediaBlock = function (req, res) {
    if (!req.body.page || !req.body.order || !req.body.title) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order and title.",
        });
    }
    if (!req.body.image_m && !req.body.embed) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an image url or an embed code.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "section_media",
            "text.title": req.body.title,
            "button.text": req.body.button_text,
            "button.url": req.body.button_url,
            "button.embed": req.body.button_embed,
            "buttonb.text": req.body.buttonb_text,
            "buttonb.url": req.body.buttonb_url,
            "buttonb.embed": req.body.buttonb_embed,
            "image.m": req.body.image_m,
            "url.embed": req.body.embed,
            orientation: req.body.orientation || "left",
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Description
        if (req.body.desc) {
            new_block.text.desc = Utility.get_linkified_text(req.body.desc);
        }
        //Save
        new_block.save(function (err) {
            if (!err) {
                //Update order of other blocks
                if (req.body.order) {
                    Block.updateMany(
                        {
                            _id: { $ne: new_block._id },
                            page: req.body.page,
                            order: { $gte: req.body.order },
                        },
                        { $inc: { order: 1 } },
                        function (err, numAffected) {
                            res.send(new_block);
                        }
                    );
                } else {
                    res.send(new_block);
                }
            }
        });
    });
};
//Add list section block
var _addSectionListBlock = function (req, res) {
    if (
        !req.body.page ||
        !req.body.order ||
        !req.body.items ||
        !req.body.items.length
    ) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order and an items array.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "section_list",
            items: req.body.items,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Save
        new_block.save(function (err) {
            if (!err) {
                //Update order of other blocks
                if (req.body.order) {
                    Block.updateMany(
                        {
                            _id: { $ne: new_block._id },
                            page: req.body.page,
                            order: { $gte: req.body.order },
                        },
                        { $inc: { order: 1 } },
                        function (err, numAffected) {
                            res.send(new_block);
                        }
                    );
                } else {
                    res.send(new_block);
                }
            }
        });
    });
};
//Add container block
var _addContainerBlock = function (req, res) {
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "container",
            formula: req.body.formula,
            row_count: req.body.row_count,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Save
        new_block.save(function (err) {
            if (!err) {
                //Update order of other blocks
                if (req.body.order) {
                    Block.updateMany(
                        {
                            _id: { $ne: new_block._id },
                            page: req.body.page,
                            order: { $gte: req.body.order },
                        },
                        { $inc: { order: 1 } },
                        function (err, numAffected) {
                            res.send(new_block);
                        }
                    );
                } else {
                    res.send(new_block);
                }
            }
        });
    });
};
//Add body text block
var _addBodyTextBlock = function (req, res) {
    if (!req.body.page || !req.body.order) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id and block order.",
        });
    }
    if (!req.body.title && !req.body.desc) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a block title or desc.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "body_text",
            "text.title": req.body.title,
            "text.label": req.body.label,
            "image.m": req.body.image_m,
            "image.icon": req.body.icon,
            "button.text": req.body.button_text,
            "button.url": req.body.button_url,
            "button.embed": req.body.button_embed,
            shape: req.body.shape || "rectangle",
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Description
        if (req.body.desc) {
            new_block.text.desc = Utility.get_linkified_text(req.body.desc);
        }
        //If part of container block
        if (req.body.block) {
            Block.findOne(
                { _id: req.body.block, type: "container", page: req.body.page },
                function (err, parentBlock) {
                    if (!parentBlock) return res.sendStatus(404);
                    parentBlock.blocks.push(new_block);
                    parentBlock.save(function (err) {
                        if (!err) res.send(new_block);
                    });
                }
            );
        } else {
            //Save
            new_block.save(function (err) {
                if (!err) {
                    //Update order of other blocks
                    if (req.body.order) {
                        Block.updateMany(
                            {
                                _id: { $ne: new_block._id },
                                page: req.body.page,
                                order: { $gte: req.body.order },
                            },
                            { $inc: { order: 1 } },
                            function (err, numAffected) {
                                res.send(new_block);
                            }
                        );
                    } else {
                        res.send(new_block);
                    }
                }
            });
        }
    });
};
//Add body html block
var _addBodyHTMLBlock = function (req, res) {
    if (!req.body.page || !req.body.order || !req.body.html) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order and html",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "body_html",
            "text.html": req.body.html,
            images: req.body.images,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //If part of container block
        if (req.body.block) {
            Block.findOne(
                { _id: req.body.block, type: "container", page: req.body.page },
                function (err, parentBlock) {
                    if (!parentBlock) return res.sendStatus(404);
                    parentBlock.blocks.push(new_block);
                    parentBlock.save(function (err) {
                        if (!err) res.send(new_block);
                    });
                }
            );
        } else {
            //Save
            new_block.save(function (err) {
                if (!err) {
                    //Update order of other blocks
                    if (req.body.order) {
                        Block.updateMany(
                            {
                                _id: { $ne: new_block._id },
                                page: req.body.page,
                                order: { $gte: req.body.order },
                            },
                            { $inc: { order: 1 } },
                            function (err, numAffected) {
                                res.send(new_block);
                            }
                        );
                    } else {
                        res.send(new_block);
                    }
                }
            });
        }
    });
};
//Add body embed block
var _addBodyEmbedBlock = function (req, res) {
    if (!req.body.page || !req.body.order || !req.body.embed) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order and embed code.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "body_embed",
            "text.title": req.body.title,
            "button.text": req.body.button_text,
            "button.url": req.body.button_url,
            "button.embed": req.body.button_embed,
            "buttonb.text": req.body.buttonb_text,
            "buttonb.url": req.body.buttonb_url,
            "buttonb.embed": req.body.buttonb_embed,
            "url.embed": req.body.embed,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Description
        if (req.body.desc) {
            new_block.text.desc = Utility.get_linkified_text(req.body.desc);
        }
        //If part of container block
        if (req.body.block) {
            Block.findOne(
                { _id: req.body.block, type: "container", page: req.body.page },
                function (err, parentBlock) {
                    if (!parentBlock) return res.sendStatus(404);
                    parentBlock.blocks.push(new_block);
                    parentBlock.save(function (err) {
                        if (!err) res.send(new_block);
                    });
                }
            );
        } else {
            //Save
            new_block.save(function (err) {
                if (!err) {
                    //Update order of other blocks
                    if (req.body.order) {
                        Block.updateMany(
                            {
                                _id: { $ne: new_block._id },
                                page: req.body.page,
                                order: { $gte: req.body.order },
                            },
                            { $inc: { order: 1 } },
                            function (err, numAffected) {
                                res.send(new_block);
                            }
                        );
                    } else {
                        res.send(new_block);
                    }
                }
            });
        }
    });
};
//Add body carousel block
var _addBodyCarouselBlock = function (req, res) {
    if (
        !req.body.page ||
        !req.body.order ||
        !req.body.gallery ||
        !req.body.gallery.length
    ) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order and a gallery array.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: req.params._type,
            gallery: req.body.gallery,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //If part of container block
        if (req.body.block) {
            Block.findOne(
                { _id: req.body.block, type: "container", page: req.body.page },
                function (err, parentBlock) {
                    if (!parentBlock) return res.sendStatus(404);
                    parentBlock.blocks.push(new_block);
                    parentBlock.save(function (err) {
                        if (!err) res.send(new_block);
                    });
                }
            );
        } else {
            //Save
            new_block.save(function (err) {
                if (!err) {
                    //Update order of other blocks
                    if (req.body.order) {
                        Block.updateMany(
                            {
                                _id: { $ne: new_block._id },
                                page: req.body.page,
                                order: { $gte: req.body.order },
                            },
                            { $inc: { order: 1 } },
                            function (err, numAffected) {
                                res.send(new_block);
                            }
                        );
                    } else {
                        res.send(new_block);
                    }
                }
            });
        }
    });
};
//Add people block
var _addPeopleBlock = function (req, res) {
    if (!req.body.page || !req.body.order || !req.body.people) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order and a people array.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: req.params._type,
            "text.title": req.body.title,
            people: req.body.people,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Description
        if (req.body.desc) {
            new_block.text.desc = Utility.get_linkified_text(req.body.desc);
        }
        //If part of container block
        if (req.body.block) {
            Block.findOne(
                { _id: req.body.block, type: "container", page: req.body.page },
                function (err, parentBlock) {
                    if (!parentBlock) return res.sendStatus(404);
                    parentBlock.blocks.push(new_block);
                    parentBlock.save(function (err) {
                        if (!err) res.send(new_block);
                    });
                }
            );
        } else {
            //Save
            new_block.save(function (err) {
                if (!err) {
                    //Update order of other blocks
                    if (req.body.order) {
                        Block.updateMany(
                            {
                                _id: { $ne: new_block._id },
                                page: req.body.page,
                                order: { $gte: req.body.order },
                            },
                            { $inc: { order: 1 } },
                            function (err, numAffected) {
                                res.send(new_block);
                            }
                        );
                    } else {
                        res.send(new_block);
                    }
                }
            });
        }
    });
};
//Add breather block
var _addBreatherBlock = function (req, res) {
    if (
        !req.body.page ||
        !req.body.order ||
        !req.body.title ||
        !req.body.image_bg
    ) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order, title and background image.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "breather",
            "text.title": req.body.title,
            "text.desc": req.body.desc,
            "button.text": req.body.button_text,
            "button.url": req.body.button_url,
            "button.embed": req.body.button_embed,
            "buttonb.text": req.body.buttonb_text,
            "buttonb.url": req.body.buttonb_url,
            "buttonb.embed": req.body.buttonb_embed,
            "image.bg": req.body.image_bg,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Save
        new_block.save(function (err) {
            if (!err) {
                //Update order of other blocks
                if (req.body.order) {
                    Block.updateMany(
                        {
                            _id: { $ne: new_block._id },
                            page: req.body.page,
                            order: { $gte: req.body.order },
                        },
                        { $inc: { order: 1 } },
                        function (err, numAffected) {
                            res.send(new_block);
                        }
                    );
                } else {
                    res.send(new_block);
                }
            }
        });
    });
};
//Add calendar block
var _addCalendarBlock = function (req, res) {
    if (!req.body.page || !req.body.order || !req.body.events) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order and an events array.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "calendar",
            "text.title": req.body.title,
            events: req.body.events,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //If part of container block
        if (req.body.block) {
            Block.findOne(
                { _id: req.body.block, type: "container", page: req.body.page },
                function (err, parentBlock) {
                    if (!parentBlock) return res.sendStatus(404);
                    parentBlock.blocks.push(new_block);
                    parentBlock.save(function (err) {
                        if (!err) res.send(new_block);
                    });
                }
            );
        } else {
            //Save
            new_block.save(function (err) {
                if (!err) {
                    //Update order of other blocks
                    if (req.body.order) {
                        Block.updateMany(
                            {
                                _id: { $ne: new_block._id },
                                page: req.body.page,
                                order: { $gte: req.body.order },
                            },
                            { $inc: { order: 1 } },
                            function (err, numAffected) {
                                res.send(new_block);
                            }
                        );
                    } else {
                        res.send(new_block);
                    }
                }
            });
        }
    });
};
//Add feed block
var _addFeedBlock = function (req, res) {
    if (!req.body.page || !req.body.order || !req.body.embed) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a page id, block order and embed code.",
        });
    }
    Page.find({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        //Add block
        var new_block = new Block({
            order: req.body.order,
            type: "feed",
            "text.title": req.body.title,
            "url.embed": req.body.embed,
            page: req.body.page,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //If part of container block
        if (req.body.block) {
            Block.findOne(
                { _id: req.body.block, type: "container", page: req.body.page },
                function (err, parentBlock) {
                    if (!parentBlock) return res.sendStatus(404);
                    parentBlock.blocks.push(new_block);
                    parentBlock.save(function (err) {
                        if (!err) res.send(new_block);
                    });
                }
            );
        } else {
            //Save
            new_block.save(function (err) {
                if (!err) {
                    //Update order of other blocks
                    if (req.body.order) {
                        Block.updateMany(
                            {
                                _id: { $ne: new_block._id },
                                page: req.body.page,
                                order: { $gte: req.body.order },
                            },
                            { $inc: { order: 1 } },
                            function (err, numAffected) {
                                res.send(new_block);
                            }
                        );
                    } else {
                        res.send(new_block);
                    }
                }
            });
        }
    });
};
//Add dynamic content
var _addContentBlock = function (req, res) {
    if (!req.body.title) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a title." });
    }
    //Folder or Article
    if (req.body.is_folder) {
        //Add block
        var new_block = new Block({
            type: "content",
            "text.title": req.body.title,
            is_folder: true,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Slug
        var slug = getSlug(req.body.title);
        new_block.slug = slug;
        //Save
        new_block.save(function (err) {
            if (!err) res.send(new_block);
        });
    } else {
        //Add block
        var new_block = new Block({
            type: "content",
            "text.title": req.body.title,
            "text.desc": req.body.desc,
            "image.m": req.body.image,
            "image.icon": req.body.icon,
            "image.meta": req.body.meta,
            "url.ref": req.body.ref,
            "url.embed": req.body.embed,
            style: req.body.style,
            folder: req.body.folder,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Category
        if (!req.body.category) {
            new_block.category = "blog";
        } else {
            new_block.category = req.body.category;
        }
        //Type
        if (req.body.category == "resources") {
            if (req.body.embed) {
                new_block.resource_type = "video";
            } else if (req.body.image_l) {
                new_block.resource_type = "image";
                new_block.image_l = req.body.image_l;
            } else if (req.body.ref) {
                new_block.resource_type = "file";
            }
        }
        //Feed
        if (req.body.feed) {
            new_block.feed = req.body.feed.toLowerCase();
        }
        //Location
        if (req.body.country && req.body.lat && req.body.long) {
            new_block.location.country = req.body.country;
            new_block.location.lat = req.body.lat;
            new_block.location.long = req.body.long;
        }
        //Slug
        var slug = getSlug(req.body.title);
        new_block.slug = slug;
        //Save
        new_block.save(function (err) {
            if (!err) res.send(new_block);
            //Save log
            saveLog("add", "article", req.user.id, { article: new_block._id });
        });
    }
};
//PUT Requests functions - Block
//Edit basic details of block
var _editBlock = function (req, res) {
    Block.findOne({ _id: req.params._id }, function (err, block) {
        if (!block) return res.sendStatus(404);
        //Slug
        if (req.body.slug) {
            var slug_url = getSlug(req.body.slug);
            if (block.slug != slug_url) {
                block.slug = slug_url;
            }
        }
        //Title
        if (req.body.title != null) {
            block.text.title = req.body.title;
        }
        //Desc
        if (req.body.desc != null) {
            block.text.desc = req.body.desc;
        }
        //HTML and summary
        if (req.body.html != null) {
            block.text.html = req.body.html;
            if (req.body.html) {
                if (block.type != "body_html")
                    block.text.summary = Utility.get_text_summary(
                        req.body.html
                    );
                //Update images
                if (req.body.images) {
                    block.images = _.union(block.images, req.body.images);
                }
            } else {
                block.text.summary = null;
            }
        }
        //Label
        if (req.body.label != null) {
            block.text.label = req.body.label;
        }
        //Images
        if (req.body.image_l != null) {
            block.image.l = req.body.image_l;
        }
        if (req.body.image_m != null) {
            block.image.m = req.body.image_m;
        }
        if (req.body.image_bg != null) {
            block.image.bg = req.body.image_bg;
        }
        if (req.body.icon != null) {
            block.image.icon = req.body.icon;
        }
        //Image
        if (req.body.image != null) {
            block.image.m = req.body.image;
        }
        //Meta
        if (req.body.meta != null) {
            block.image.meta = req.body.meta;
        }
        //URL
        if (req.body.ref != null) {
            block.url.ref = req.body.ref;
            if (req.body.ref) block.url.embed = undefined;
        }
        if (req.body.embed != null) {
            block.url.embed = req.body.embed;
            if (req.body.embed) block.url.ref = undefined;
        }
        //Button
        if (req.body.button_text != null) {
            if (
                req.body.button_text &&
                (req.body.button_url || req.body.button_embed)
            ) {
                block.button.text = req.body.button_text;
                if (req.body.button_url) {
                    block.button.url = req.body.button_url;
                    block.button.embed = undefined;
                } else if (req.body.button_embed) {
                    block.button.embed = req.body.button_embed;
                    block.button.url = undefined;
                }
            } else {
                block.button.text = undefined;
                block.button.embed = undefined;
                block.button.url = undefined;
            }
        }
        //Button B
        if (req.body.buttonb_text != null) {
            if (
                req.body.buttonb_text &&
                (req.body.buttonb_url || req.body.buttonb_embed)
            ) {
                block.buttonb.text = req.body.buttonb_text;
                if (req.body.buttonb_url) {
                    block.buttonb.url = req.body.buttonb_url;
                    block.buttonb.embed = undefined;
                } else if (req.body.buttonb_embed) {
                    block.buttonb.embed = req.body.buttonb_embed;
                    block.buttonb.url = undefined;
                }
            } else {
                block.buttonb.text = undefined;
                block.buttonb.embed = undefined;
                block.buttonb.url = undefined;
            }
        }
        //Story
        if (req.body.story_title != null) {
            block.story.title = req.body.story_title;
        }
        if (req.body.story_text != null) {
            block.story.text = req.body.story_text;
        }
        if (req.body.story_url != null) {
            block.story.url = req.body.story_url;
        }
        // Image shape
        if (block.type == "body_text" && req.body.shape) {
            block.shape = req.body.shape;
        }
        //Orientation
        if (block.type == "section_media" && req.body.orientation) {
            block.orientation = req.body.orientation;
        }
        //In content block
        if (block.type == "content") {
            if (req.body.category) {
                block.category = req.body.category;
            }
            //Style
            if (req.body.style) {
                block.style = req.body.style;
            }
            //Change resource type
            if (block.category == "resources") {
                if (block.url.embed) {
                    block.resource_type = "video";
                } else if (block.image.l) {
                    block.resource_type = "image";
                } else if (block.url.ref) {
                    block.resource_type = "file";
                }
            } else if (req.body.thumbnail && !block.image.m) {
                //Change thumbnail
                block.image.l = req.body.thumbnail;
                block.image.m = req.body.thumbnail;
            }
            //Remove resource type if category is not resources
            if (block.category != "resources") {
                block.resource_type = undefined;
            }
            //Update feed
            if (req.body.feed != null) {
                if (req.body.feed) {
                    block.feed = req.body.feed.toLowerCase();
                } else {
                    block.feed = undefined;
                }
            }
            //Update location
            if (
                req.body.country != null ||
                req.body.lat != null ||
                req.body.long != null
            ) {
                if (!req.body.country || !req.body.lat || !req.body.long) {
                    block.location.country = undefined;
                    block.location.lat = undefined;
                    block.location.long = undefined;
                } else {
                    if (req.body.country) {
                        block.location.country = req.body.country;
                    }
                    if (req.body.lat) {
                        block.location.lat = req.body.lat;
                    }
                    if (req.body.long) {
                        block.location.long = req.body.long;
                    }
                }
            }
        }
        //Style
        //Color
        if (req.body.color_bg != null) {
            if (validator.isHexColor(req.body.color_bg)) {
                block.color.bg = req.body.color_bg;
            } else {
                block.color.bg = undefined;
            }
        }
        if (req.body.color_text != null) {
            if (validator.isHexColor(req.body.color_text)) {
                block.color.text = req.body.color_text;
            } else {
                block.color.text = undefined;
            }
        }
        if (req.body.color_btn_bg != null) {
            if (validator.isHexColor(req.body.color_btn_bg)) {
                block.color.btn_bg = req.body.color_btn_bg;
            } else {
                block.color.btn_bg = undefined;
            }
        }
        if (req.body.color_btn_text != null) {
            if (validator.isHexColor(req.body.color_btn_text)) {
                block.color.btn_text = req.body.color_btn_text;
            } else {
                block.color.btn_text = undefined;
            }
        }
        //Theme
        if (req.body.theme != null) {
            if (req.body.theme) {
                block.theme = req.body.theme;
            } else {
                block.theme = undefined;
            }
        }
        //Gradient
        if (req.body.gradient_angle != null) {
            if (
                req.body.gradient_angle >= 0 &&
                req.body.gradient_angle <= 360
            ) {
                block.gradient.angle = req.body.gradient_angle;
            } else {
                block.gradient.angle = undefined;
            }
        }
        if (req.body.gradient_start != null) {
            if (validator.isHexColor(req.body.gradient_start)) {
                block.gradient.start = req.body.gradient_start;
            } else {
                block.gradient.start = undefined;
            }
        }
        if (req.body.gradient_middle != null) {
            if (validator.isHexColor(req.body.gradient_middle)) {
                block.gradient.middle = req.body.gradient_middle;
            } else {
                block.gradient.middle = undefined;
            }
        }
        if (req.body.gradient_end != null) {
            if (validator.isHexColor(req.body.gradient_end)) {
                block.gradient.end = req.body.gradient_end;
            } else {
                block.gradient.end = undefined;
            }
        }
        //Padding
        if (req.body.padding_top != null) {
            if (req.body.padding_top >= 0) {
                block.padding.top = req.body.padding_top;
            } else {
                block.padding.top = undefined;
            }
        }
        if (req.body.padding_right != null) {
            if (req.body.padding_right >= 0) {
                block.padding.right = req.body.padding_right;
            } else {
                block.padding.right = undefined;
            }
        }
        if (req.body.padding_bottom != null) {
            if (req.body.padding_bottom >= 0) {
                block.padding.bottom = req.body.padding_bottom;
            } else {
                block.padding.bottom = undefined;
            }
        }
        if (req.body.padding_left != null) {
            if (req.body.padding_left >= 0) {
                block.padding.left = req.body.padding_left;
            } else {
                block.padding.left = undefined;
            }
        }
        if (req.body.padding_btn_top != null) {
            if (req.body.padding_btn_top >= 0) {
                block.padding.btn_top = req.body.padding_btn_top;
            } else {
                block.padding.btn_top = undefined;
            }
        }
        if (req.body.padding_btn_right != null) {
            if (req.body.padding_btn_right >= 0) {
                block.padding.btn_right = req.body.padding_btn_right;
            } else {
                block.padding.btn_right = undefined;
            }
        }
        if (req.body.padding_btn_bottom != null) {
            if (req.body.padding_btn_bottom >= 0) {
                block.padding.btn_bottom = req.body.padding_btn_bottom;
            } else {
                block.padding.btn_bottom = undefined;
            }
        }
        if (req.body.padding_btn_left != null) {
            if (req.body.padding_btn_left >= 0) {
                block.padding.btn_left = req.body.padding_btn_left;
            } else {
                block.padding.btn_left = undefined;
            }
        }
        //Margin
        if (req.body.margin_top != null) {
            if (req.body.margin_top >= 0) {
                block.margin.top = req.body.margin_top;
            } else {
                block.margin.top = undefined;
            }
        }
        if (req.body.margin_right != null) {
            if (req.body.margin_right >= 0) {
                block.margin.right = req.body.margin_right;
            } else {
                block.margin.right = undefined;
            }
        }
        if (req.body.margin_bottom != null) {
            if (req.body.margin_bottom >= 0) {
                block.margin.bottom = req.body.margin_bottom;
            } else {
                block.margin.bottom = undefined;
            }
        }
        if (req.body.margin_left != null) {
            if (req.body.margin_left >= 0) {
                block.margin.left = req.body.margin_left;
            } else {
                block.margin.left = undefined;
            }
        }
        if (req.body.margin_btn_top != null) {
            if (req.body.margin_btn_top >= 0) {
                block.margin.btn_top = req.body.margin_btn_top;
            } else {
                block.margin.btn_top = undefined;
            }
        }
        if (req.body.margin_btn_right != null) {
            if (req.body.margin_btn_right >= 0) {
                block.margin.btn_right = req.body.margin_btn_right;
            } else {
                block.margin.btn_right = undefined;
            }
        }
        if (req.body.margin_btn_bottom != null) {
            if (req.body.margin_btn_bottom >= 0) {
                block.margin.btn_bottom = req.body.margin_btn_bottom;
            } else {
                block.margin.btn_bottom = undefined;
            }
        }
        if (req.body.margin_btn_left != null) {
            if (req.body.margin_btn_left >= 0) {
                block.margin.btn_left = req.body.margin_btn_left;
            } else {
                block.margin.btn_left = undefined;
            }
        }
        //Border
        if (req.body.border_top != null) {
            if (req.body.border_top >= 0) {
                block.border.top = req.body.border_top;
            } else {
                block.border.top = undefined;
            }
        }
        if (req.body.border_right != null) {
            if (req.body.border_right >= 0) {
                block.border.right = req.body.border_right;
            } else {
                block.border.right = undefined;
            }
        }
        if (req.body.border_bottom != null) {
            if (req.body.border_bottom >= 0) {
                block.border.bottom = req.body.border_bottom;
            } else {
                block.border.bottom = undefined;
            }
        }
        if (req.body.border_left != null) {
            if (req.body.border_left >= 0) {
                block.border.left = req.body.border_left;
            } else {
                block.border.left = undefined;
            }
        }
        if (req.body.border_color != null) {
            if (validator.isHexColor(req.body.border_color)) {
                block.border.color = req.body.border_color;
            } else {
                block.border.color = undefined;
            }
        }
        if (req.body.border_radius != null) {
            if (req.body.border_radius >= 0) {
                block.border.radius = req.body.border_radius;
            } else {
                block.border.radius = undefined;
            }
        }
        if (req.body.border_btn_top != null) {
            if (req.body.border_btn_top >= 0) {
                block.border.btn_top = req.body.border_btn_top;
            } else {
                block.border.btn_top = undefined;
            }
        }
        if (req.body.border_btn_right != null) {
            if (req.body.border_btn_right >= 0) {
                block.border.btn_right = req.body.border_btn_right;
            } else {
                block.border.btn_right = undefined;
            }
        }
        if (req.body.border_btn_bottom != null) {
            if (req.body.border_btn_bottom >= 0) {
                block.border.btn_bottom = req.body.border_btn_bottom;
            } else {
                block.border.btn_bottom = undefined;
            }
        }
        if (req.body.border_btn_left != null) {
            if (req.body.border_btn_left >= 0) {
                block.border.btn_left = req.body.border_btn_left;
            } else {
                block.border.btn_left = undefined;
            }
        }
        if (req.body.border_btn_color != null) {
            if (validator.isHexColor(req.body.border_btn_color)) {
                block.border.btn_color = req.body.border_btn_color;
            } else {
                block.border.btn_color = undefined;
            }
        }
        if (req.body.border_btn_radius != null) {
            if (req.body.border_btn_radius >= 0) {
                block.border.btn_radius = req.body.border_btn_radius;
            } else {
                block.border.btn_radius = undefined;
            }
        }
        //Font
        if (req.body.font_size != null) {
            if (req.body.font_size >= 10 && req.body.font_size <= 100) {
                block.font.size = req.body.font_size;
            } else {
                block.font.size = undefined;
            }
        }
        if (req.body.font_style != null) {
            if (req.body.font_style) {
                block.font.style = req.body.font_style.toLowerCase();
            } else {
                block.font.style = undefined;
            }
        }
        //Update alignment
        if (req.body.alignment != null) {
            if (req.body.alignment) {
                block.alignment = req.body.alignment.toLowerCase();
            } else {
                block.alignment = undefined;
            }
        }
        //Width
        if (req.body.width != null) {
            if (req.body.width) {
                block.width = req.body.width.toLowerCase();
            } else {
                block.width = undefined;
            }
        }
        //Width percentage
        if (req.body.width_pct != null) {
            if (req.body.width_pct) {
                block.width_pct = req.body.width_pct;
                block.width = undefined;
            } else {
                block.width_pct = undefined;
            }
        }
        //Container view
        if (req.body.container_view != null) {
            if (
                req.body.container_view &&
                (block.type == "container" || block.type == "people")
            ) {
                block.container_view = req.body.container_view.toLowerCase();
            } else {
                block.container_view = undefined;
            }
        }
        //Save
        block.updated_at = new Date(Date.now());
        block.save(function (err) {
            if (!err) {
                res.status(200).send(block);
                //Update thumbnail
                if (
                    block.type == "content" &&
                    block.category != "resources" &&
                    req.body.thumbnail &&
                    block.image.m == req.body.thumbnail
                ) {
                    var key = shortid.generate();
                    var file_name = key + "-" + getSlug(block.text.title);
                    var image = req.body.thumbnail.replace(
                        /^https:\/\//i,
                        "http://"
                    );
                    //Resize and upload image
                    Utility.get_resized_image(
                        file_name,
                        image,
                        400,
                        function (resized) {
                            Utility.upload_file(
                                resized,
                                file_name,
                                function (image_url) {
                                    Block.updateOne(
                                        { _id: block._id },
                                        { $set: { "image.m": image_url } }
                                    ).exec();
                                }
                            );
                        }
                    );
                }
            } else {
                res.sendStatus(400);
            }
        });
    });
};
//Move block up
var _moveBlockUp = function (req, res) {
    Block.findOne({ _id: req.params._id }, function (err, block) {
        if (!block) return res.sendStatus(404);
        var current_order = block.order;
        if (current_order == 1)
            return res.status(400).send({ error: "Block already at the top." });
        var prev_order = current_order - 1;
        //Update
        Block.updateOne(
            { page: block.page, order: prev_order },
            { $inc: { order: 1 } },
            function (err, numAffected) {
                block.order = current_order - 1;
                block.save(function (err) {
                    if (!err) {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(400);
                    }
                });
            }
        );
    });
};
//Mode down
var _moveBlockDown = function (req, res) {
    Block.findOne({ _id: req.params._id }, function (err, block) {
        if (!block) return res.sendStatus(404);
        var current_order = block.order;
        var next_order = current_order + 1;
        //Update
        Block.updateOne(
            { page: block.page, order: next_order },
            { $inc: { order: -1 } },
            function (err, numAffected) {
                block.order = current_order + 1;
                block.save(function (err) {
                    if (!err) {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(400);
                    }
                });
            }
        );
    });
};
//Add item to section block
var _addItemToBlock = function (req, res) {
    if (!req.body.title) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an item title.",
        });
    }
    if (!req.body.image_m && !req.body.embed) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an image url or an embed code.",
        });
    }
    //New item
    var new_item = new Item({
        title: req.body.title,
        "button.text": req.body.button_text,
        "button.url": req.body.button_url,
        "button.embed": req.body.button_embed,
        "buttonb.text": req.body.buttonb_text,
        "buttonb.url": req.body.buttonb_url,
        "buttonb.embed": req.body.buttonb_embed,
        "image.m": req.body.image_m,
        "image.l": req.body.image_l,
        embed: req.body.embed,
    });
    //Description
    if (req.body.desc) {
        new_item.desc = Utility.get_linkified_text(req.body.desc);
    }
    //Save
    Block.updateOne(
        { _id: req.params._id, type: "section_list" },
        { $push: { items: new_item } },
        function (err, numAffected) {
            res.send(new_item);
        }
    );
};
//Remove item from section block
var _removeItemFromBlock = function (req, res) {
    if (!req.body.item)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an item id.",
        });
    Block.updateOne(
        { _id: req.params._id, type: "section_list" },
        { $pull: { items: { _id: req.body.item } } },
        function (err, numAffected) {
            if (!err) res.sendStatus(200);
        }
    );
};
//Update item order in section block
var _updateItemOrderInBlock = function (req, res) {
    if (req.body.order == null)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an order number.",
        });
    if (!req.body.item)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an item id.",
        });
    Block.findOne(
        { _id: req.params._id, type: "section_list" },
        function (err, block) {
            if (!block) return res.sendStatus(404);
            //Get item
            var items = block.items.filter(function (item) {
                return item._id == req.body.item;
            });
            if (!items || !items.length)
                return res
                    .status(400)
                    .send({ error: "Invalid parameters. Nothing to update." });
            else var item = items[0];
            //Remove item
            Block.updateOne(
                { _id: req.params._id },
                { $pull: { items: { _id: req.body.item } } },
                function (err, numAffected) {
                    //Add item at new position
                    Block.updateOne(
                        { _id: req.params._id },
                        {
                            $push: {
                                items: {
                                    $each: [item],
                                    $position: req.body.order,
                                },
                            },
                        },
                        function (err, numAffected) {
                            if (!err) res.sendStatus(200);
                        }
                    );
                }
            );
        }
    );
};
//Add image or video to carousel block
var _addImageToBlock = function (req, res) {
    if (!req.body.image_m && !req.body.embed) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an image url or an embed code.",
        });
    }
    var new_image = new Image({
        title: req.body.title,
        "button.text": req.body.button_text,
        "button.url": req.body.button_url,
        "button.embed": req.body.button_embed,
        "buttonb.text": req.body.buttonb_text,
        "buttonb.url": req.body.buttonb_url,
        "buttonb.embed": req.body.buttonb_embed,
        "file.l": req.body.image_l,
        "file.m": req.body.image_m,
        bound: req.body.bound,
        embed: req.body.embed,
    });
    //Description
    if (req.body.desc) {
        new_image.desc = Utility.get_linkified_text(req.body.desc);
    }
    //Save
    Block.updateOne(
        {
            _id: req.params._id,
            type: { $in: ["body_carousel", "body_carousel_text"] },
        },
        { $push: { gallery: new_image } },
        function (err, numAffected) {
            res.send(new_image);
        }
    );
};
//Remove image from carousel block
var _removeImageFromBlock = function (req, res) {
    if (!req.body.image)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an image id.",
        });
    Block.updateOne(
        { _id: req.params._id },
        { $pull: { gallery: { _id: req.body.image } } },
        function (err, numAffected) {
            if (!err) res.sendStatus(200);
        }
    );
};
//Update image order in carousel block
var _updateImageOrderInBlock = function (req, res) {
    if (req.body.order == null)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an order number.",
        });
    if (!req.body.image)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an image id.",
        });
    Block.findOne(
        {
            _id: req.params._id,
            type: { $in: ["body_carousel", "body_carousel_text"] },
        },
        function (err, block) {
            if (!block) return res.sendStatus(404);
            //Get image
            var images = block.gallery.filter(function (image) {
                return image._id == req.body.image;
            });
            if (!images || !images.length)
                return res
                    .status(400)
                    .send({ error: "Invalid parameters. Nothing to update." });
            else var image = images[0];
            //Remove image
            Block.updateOne(
                { _id: req.params._id },
                { $pull: { gallery: { _id: req.body.image } } },
                function (err, numAffected) {
                    //Add image at new position
                    Block.updateOne(
                        { _id: req.params._id },
                        {
                            $push: {
                                gallery: {
                                    $each: [image],
                                    $position: req.body.order,
                                },
                            },
                        },
                        function (err, numAffected) {
                            if (!err) res.sendStatus(200);
                        }
                    );
                }
            );
        }
    );
};
//Add person to block
var _addPersonToBlock = function (req, res) {
    if (!req.body.person)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a person id.",
        });
    Person.findOne({ _id: req.body.person }, function (err, person) {
        if (!person) return res.sendStatus(404);
        Block.updateOne(
            { _id: req.params._id },
            { $addToSet: { people: person._id } },
            function (err, numAffected) {
                res.send(person);
            }
        );
    });
};
//Remove person from block
var _removePersonFromBlock = function (req, res) {
    if (!req.body.person)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a person id.",
        });
    Block.updateOne(
        { _id: req.params._id },
        { $pull: { people: req.body.person } },
        function (err, numAffected) {
            if (!err) res.sendStatus(200);
        }
    );
};
//Update person order in people or logos block
var _updatePersonOrderInBlock = function (req, res) {
    if (req.body.order == null)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an order number.",
        });
    if (!req.body.person)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a person id.",
        });
    Block.findOne(
        { _id: req.params._id, type: { $in: ["people", "logos"] } },
        function (err, block) {
            if (!block) return res.sendStatus(404);
            //Get person
            var persons = block.people.filter(function (person) {
                return person == req.body.person;
            });
            if (!persons || !persons.length)
                return res
                    .status(400)
                    .send({ error: "Invalid parameters. Nothing to update." });
            else var person = persons[0];
            //Remove person
            Block.updateOne(
                { _id: req.params._id },
                { $pull: { people: req.body.person } },
                function (err, numAffected) {
                    //Add person at new position
                    Block.updateOne(
                        { _id: req.params._id },
                        {
                            $push: {
                                people: {
                                    $each: [person],
                                    $position: req.body.order,
                                },
                            },
                        },
                        function (err, numAffected) {
                            if (!err) res.sendStatus(200);
                        }
                    );
                }
            );
        }
    );
};
//Add event to calendar block
var _addEventToBlock = function (req, res) {
    if (!req.body.title || !req.body.start_date)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an event title and event date.",
        });
    var new_event = new Event({
        title: req.body.title,
        desc: req.body.desc,
        "date.start": req.body.start_date,
        "date.end": req.body.end_date,
        "image.m": req.body.image_m,
        "image.l": req.body.image_l,
        icon: req.body.icon,
        url: req.body.url,
        location: req.body.location,
    });
    //Save
    Block.updateOne(
        { _id: req.params._id, type: "calendar" },
        { $push: { events: new_event } },
        function (err, numAffected) {
            res.send(new_event);
        }
    );
};
//Remove event from calendar block
var _removeEventFromBlock = function (req, res) {
    if (!req.body.event)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an event id.",
        });
    Block.updateOne(
        { _id: req.params._id },
        { $pull: { events: { _id: req.body.event } } },
        function (err, numAffected) {
            if (!err) res.sendStatus(200);
        }
    );
};
//Update event order in calendar block
var _updateEventOrderInBlock = function (req, res) {
    if (req.body.order == null)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an order number.",
        });
    if (!req.body.event)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an event id.",
        });
    Block.findOne(
        { _id: req.params._id, type: "calendar" },
        function (err, block) {
            if (!block) return res.sendStatus(404);
            //Get event
            var events = block.events.filter(function (event) {
                return event._id == req.body.event;
            });
            if (!events || !events.length)
                return res
                    .status(400)
                    .send({ error: "Invalid parameters. Nothing to update." });
            else var event = events[0];
            //Remove event
            Block.updateOne(
                { _id: req.params._id },
                { $pull: { events: { _id: req.body.event } } },
                function (err, numAffected) {
                    //Add event at new position
                    Block.updateOne(
                        { _id: req.params._id },
                        {
                            $push: {
                                events: {
                                    $each: [event],
                                    $position: req.body.order,
                                },
                            },
                        },
                        function (err, numAffected) {
                            if (!err) res.sendStatus(200);
                        }
                    );
                }
            );
        }
    );
};
//Add related page to block
var _addRelatedPage = function (req, res) {
    if (!req.body.page)
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a page id." });
    Page.findOne({ _id: req.body.page }, function (err, page) {
        if (!page) return res.sendStatus(404);
        Block.updateOne(
            { _id: req.params._id },
            { $addToSet: { related: page._id } },
            function (err, numAffected) {
                res.send(page);
            }
        );
    });
};
//Remove related page from block
var _removeRelatedPage = function (req, res) {
    if (!req.body.page)
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a page id." });
    Block.updateOne(
        { _id: req.params._id },
        { $pull: { related: req.body.page } },
        function (err, numAffected) {
            if (!err) res.sendStatus(200);
        }
    );
};
//Add tag to block
var _addTagToBlock = function (req, res) {
    if (!req.body.tag)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a tag name.",
        });
    Block.findOne({ _id: req.params._id }, function (err, block) {
        if (!block) return res.sendStatus(404);
        //Convert tag to lowercase
        var tag_name = req.body.tag.toLowerCase();
        ArticleTag.findOne({ name: tag_name }, function (err, prev_tag) {
            if (!prev_tag) {
                var tag_color = randomColor({ luminosity: "dark" });
                var new_tag = new ArticleTag({
                    name: tag_name,
                    color: tag_color,
                    creator: req.user.id,
                    count: 1,
                });
                new_tag.save(function (err) {
                    if (!err) {
                        //Update block
                        Block.updateOne(
                            { _id: block._id },
                            { $addToSet: { tags: new_tag._id } },
                            function (err, numAffected) {
                                res.send(new_tag);
                            }
                        );
                    }
                });
            } else {
                //Update block and tag count
                if (block.tags.indexOf(prev_tag._id) > -1)
                    return res.status(400).send({ error: "Already added." });
                Block.updateOne(
                    { _id: block._id },
                    { $addToSet: { tags: prev_tag._id } },
                    function (err, numAffected) {
                        //Update count if article
                        if (block.type == "content") {
                            ArticleTag.updateOne(
                                { _id: prev_tag._id },
                                { $inc: { count: 1 } }
                            ).exec();
                        }
                        res.send(prev_tag);
                    }
                );
            }
        });
    });
};
//Remove tag from block
var _removeTagFromBlock = function (req, res) {
    if (!req.body.tag)
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a tag id" });
    ArticleTag.findOne({ _id: req.body.tag }, function (err, tag) {
        if (!tag) return res.sendStatus(404);
        //Update block and tag count
        Block.findByIdAndUpdate(
            req.params._id,
            { $pull: { tags: tag._id } },
            function (err, block) {
                if (!err) {
                    //Update count if article
                    if (block.type == "content") {
                        if (tag.count == 1) {
                            //Remove tag from container blocks
                            Block.updateMany(
                                {
                                    type: "container",
                                    formula: "tags",
                                    tags: tag._id,
                                },
                                { $pull: { tags: tag._id } },
                                function (err, numAffected) {
                                    //Remove tag
                                    tag.remove(function (err) {
                                        res.sendStatus(200);
                                    });
                                }
                            );
                        } else {
                            //Update count
                            tag.count = tag.count - 1;
                            tag.save(function (err) {
                                res.sendStatus(200);
                            });
                        }
                    } else {
                        res.sendStatus(200);
                    }
                } else {
                    res.sendStatus(400);
                }
            }
        );
    });
};
//Update dynamic formula
var _updateDynamicFormula = function (req, res) {};
//Update size of block
var _updateSizeBlock = function (req, res) {};
//Remove sub block
var _removeSubBlock = function (req, res) {
    if (!req.body.sub_block)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an sub_block id.",
        });
    //Update
    Block.updateOne(
        { _id: req.params._id, type: "container" },
        { $pull: { blocks: { _id: req.body.sub_block } } },
        function (err, numAffected) {
            if (!err) {
                res.sendStatus(200);
            } else {
                res.sendStatus(400);
            }
        }
    );
};
//Archive block
var _archiveBlock = function (req, res) {
    Block.updateOne(
        { _id: req.params._id, type: "content" },
        { $set: { is_archived: true } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//Unarchive block
var _unarchiveBlock = function (req, res) {
    Block.updateOne(
        { _id: req.params._id, type: "content" },
        { $set: { is_archived: false } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//Move article to folder or outside of folder
var _moveArticle = function (req, res) {
    if (req.body.folder) {
        //Move to an existing folder
        Block.findOne(
            { _id: req.params._id, type: "content", is_folder: false },
            function (err, article) {
                if (!article) return res.sendStatus(404);
                if (req.body.folder == article.folder) {
                    return res.status(400).send({
                        error: "Thanks for trying, but article is already in this folder.",
                    });
                }
                Block.findOne(
                    { _id: req.body.folder, type: "content", is_folder: true },
                    function (err, folder) {
                        if (!folder) return res.sendStatus(404);
                        article.folder = folder._id;
                        folder.updated_at = new Date(Date.now());
                        //Save folder
                        folder.save(function (err) {
                            if (!err) {
                                //Save article
                                article.save(function (err) {
                                    if (!err) {
                                        res.status(200).send(article);
                                    } else res.sendStatus(400);
                                });
                            }
                        });
                    }
                );
            }
        );
    } else {
        //Move outside of folder
        Block.findOne(
            { _id: req.params._id, type: "content", is_folder: false },
            function (err, article) {
                if (!article) return res.sendStatus(404);
                if (!article.folder) {
                    return res.status(400).send({
                        error: "Thanks for trying, but article is already outside of folder.",
                    });
                }
                article.folder = undefined;
                //Save article
                article.save(function (err) {
                    if (!err) {
                        res.status(200).send(article);
                    } else res.sendStatus(400);
                });
            }
        );
    }
};
//Edit subblock
var _editSubBlock = function (req, res) {
    Block.findOne(
        { _id: req.params._container, type: "container" },
        function (err, containerBlock) {
            if (!containerBlock) return res.sendStatus(404);
            //Title
            if (req.body.title != null) {
                Block.updateOne(
                    { _id: containerBlock._id, "blocks._id": req.params._id },
                    { $set: { "blocks.$.text.title": req.body.title } }
                ).exec();
            }
            //Desc
            if (req.body.desc != null) {
                Block.updateOne(
                    { _id: containerBlock._id, "blocks._id": req.params._id },
                    { $set: { "blocks.$.text.desc": req.body.desc } }
                ).exec();
            }
            //HTML and summary
            if (req.body.html != null) {
                Block.updateOne(
                    { _id: containerBlock._id, "blocks._id": req.params._id },
                    { $set: { "blocks.$.text.html": req.body.html } }
                ).exec();
                if (req.body.html) {
                    var summary = Utility.get_text_summary(req.body.html);
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $set: { "blocks.$.text.summary": summary } }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $set: { "blocks.$.text.summary": null } }
                    ).exec();
                }
            }
            //Label
            if (req.body.label != null) {
                Block.updateOne(
                    { _id: containerBlock._id, "blocks._id": req.params._id },
                    { $set: { "blocks.$.text.label": req.body.label } }
                ).exec();
            }
            //Images
            if (req.body.image_l != null) {
                Block.updateOne(
                    { _id: containerBlock._id, "blocks._id": req.params._id },
                    { $set: { "blocks.$.image.l": req.body.image_l } }
                ).exec();
            }
            if (req.body.image_m != null) {
                Block.updateOne(
                    { _id: containerBlock._id, "blocks._id": req.params._id },
                    { $set: { "blocks.$.image.m": req.body.image_m } }
                ).exec();
            }
            if (req.body.icon != null) {
                Block.updateOne(
                    { _id: containerBlock._id, "blocks._id": req.params._id },
                    { $set: { "blocks.$.image.icon": req.body.icon } }
                ).exec();
            }
            //URL
            if (req.body.ref != null) {
                Block.updateOne(
                    { _id: containerBlock._id, "blocks._id": req.params._id },
                    { $set: { "blocks.$.url.ref": req.body.ref } }
                ).exec();
                if (req.body.ref) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.url.embed": 1 } }
                    ).exec();
                }
            }
            if (req.body.embed != null) {
                Block.updateOne(
                    { _id: containerBlock._id, "blocks._id": req.params._id },
                    { $set: { "blocks.$.url.embed": req.body.embed } }
                ).exec();
                if (req.body.embed) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.url.ref": 1 } }
                    ).exec();
                }
            }
            //Button
            if (req.body.button_text != null) {
                if (
                    req.body.button_text &&
                    (req.body.button_url || req.body.button_embed)
                ) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.button.text": req.body.button_text,
                            },
                        }
                    ).exec();
                    if (req.body.button_url) {
                        Block.updateOne(
                            {
                                _id: containerBlock._id,
                                "blocks._id": req.params._id,
                            },
                            {
                                $set: {
                                    "blocks.$.button.url": req.body.button_url,
                                },
                                $unset: { "blocks.$.button.embed": 1 },
                            }
                        ).exec();
                    } else if (req.body.button_embed) {
                        Block.updateOne(
                            {
                                _id: containerBlock._id,
                                "blocks._id": req.params._id,
                            },
                            {
                                $set: {
                                    "blocks.$.button.embed":
                                        req.body.button_embed,
                                },
                                $unset: { "blocks.$.button.url": 1 },
                            }
                        ).exec();
                    }
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.button.text": 1,
                                "blocks.$.button.embed": 1,
                                "blocks.$.button.url": 1,
                            },
                        }
                    ).exec();
                }
            }
            //Button B
            if (req.body.buttonb_text != null) {
                if (
                    req.body.buttonb_text &&
                    (req.body.buttonb_url || req.body.buttonb_embed)
                ) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.buttonb.text": req.body.buttonb_text,
                            },
                        }
                    ).exec();
                    if (req.body.buttonb_url) {
                        Block.updateOne(
                            {
                                _id: containerBlock._id,
                                "blocks._id": req.params._id,
                            },
                            {
                                $set: {
                                    "blocks.$.buttonb.url":
                                        req.body.buttonb_url,
                                },
                                $unset: { "blocks.$.buttonb.embed": 1 },
                            }
                        ).exec();
                    } else if (req.body.buttonb_embed) {
                        Block.updateOne(
                            {
                                _id: containerBlock._id,
                                "blocks._id": req.params._id,
                            },
                            {
                                $set: {
                                    "blocks.$.buttonb.embed":
                                        req.body.buttonb_embed,
                                },
                                $unset: { "blocks.$.buttonb.url": 1 },
                            }
                        ).exec();
                    }
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.buttonb.text": 1,
                                "blocks.$.buttonb.embed": 1,
                                "blocks.$.buttonb.url": 1,
                            },
                        }
                    ).exec();
                }
            }
            //Shape
            if (req.body.shape) {
                Block.updateOne(
                    { _id: containerBlock._id, "blocks._id": req.params._id },
                    { $set: { "blocks.$.shape": req.body.shape } }
                ).exec();
            }
            //Color
            if (req.body.color_bg != null) {
                if (validator.isHexColor(req.body.color_bg)) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $set: { "blocks.$.color.bg": req.body.color_bg } }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.color.bg": 1 } }
                    ).exec();
                }
            }
            if (req.body.color_text != null) {
                if (validator.isHexColor(req.body.color_text)) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $set: { "blocks.$.color.text": req.body.color_text } }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.color.text": 1 } }
                    ).exec();
                }
            }
            if (req.body.color_btn_bg != null) {
                if (validator.isHexColor(req.body.color_btn_bg)) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.color.btn_bg": req.body.color_btn_bg,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.color.btn_bg": 1 } }
                    ).exec();
                }
            }
            if (req.body.color_btn_text != null) {
                if (validator.isHexColor(req.body.color_btn_text)) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.color.btn_text":
                                    req.body.color_btn_text,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.color.btn_text": 1 } }
                    ).exec();
                }
            }
            //Theme
            if (req.body.theme != null) {
                if (req.body.theme) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $set: { "blocks.$.theme": req.body.theme } }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.theme": 1 } }
                    ).exec();
                }
            }
            //Gradient
            if (req.body.gradient_angle != null) {
                if (
                    req.body.gradient_angle >= 0 &&
                    req.body.gradient_angle <= 360
                ) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.gradient.angle":
                                    req.body.gradient_angle,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.gradient.angle": 1 } }
                    ).exec();
                }
            }
            if (req.body.gradient_start != null) {
                if (validator.isHexColor(req.body.gradient_start)) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.gradient.start":
                                    req.body.gradient_start,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.gradient.start": 1 } }
                    ).exec();
                }
            }
            if (req.body.gradient_middle != null) {
                if (validator.isHexColor(req.body.gradient_middle)) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.gradient.middle":
                                    req.body.gradient_middle,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.gradient.middle": 1 } }
                    ).exec();
                }
            }
            if (req.body.gradient_end != null) {
                if (validator.isHexColor(req.body.gradient_end)) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.gradient.end": req.body.gradient_end,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.gradient.end": 1 } }
                    ).exec();
                }
            }
            //Padding
            if (req.body.padding_top != null) {
                if (req.body.padding_top >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.padding.top": req.body.padding_top,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.padding.top": 1 } }
                    ).exec();
                }
            }
            if (req.body.padding_right != null) {
                if (req.body.padding_right >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.padding.right":
                                    req.body.padding_right,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.padding.right": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.padding_bottom != null) {
                if (req.body.padding_bottom >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.padding.bottom":
                                    req.body.padding_bottom,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.padding.bottom": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.padding_left != null) {
                if (req.body.padding_left >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.padding.left": req.body.padding_left,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.padding.left": 1 } }
                    ).exec();
                }
            }
            if (req.body.padding_btn_top != null) {
                if (req.body.padding_btn_top >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.padding.btn_top":
                                    req.body.padding_btn_top,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.padding.btn_top": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.padding_btn_right != null) {
                if (req.body.padding_btn_right >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.padding.btn_right":
                                    req.body.padding_btn_right,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.padding.btn_right": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.padding_btn_bottom != null) {
                if (req.body.padding_btn_bottom >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.padding.btn_bottom":
                                    req.body.padding_btn_bottom,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.padding.btn_bottom": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.padding_btn_left != null) {
                if (req.body.padding_btn_left >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.padding.btn_left":
                                    req.body.padding_btn_left,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.padding.btn_left": 1,
                            },
                        }
                    ).exec();
                }
            }
            //Margin
            if (req.body.margin_top != null) {
                if (req.body.margin_top >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.margin.top": req.body.margin_top,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.margin.top": 1 } }
                    ).exec();
                }
            }
            if (req.body.margin_right != null) {
                if (req.body.margin_right >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.margin.right": req.body.margin_right,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.margin.right": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.margin_bottom != null) {
                if (req.body.margin_bottom >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.margin.bottom":
                                    req.body.margin_bottom,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.margin.bottom": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.margin_left != null) {
                if (req.body.margin_left >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.margin.left": req.body.margin_left,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.margin.left": 1 } }
                    ).exec();
                }
            }
            if (req.body.margin_btn_top != null) {
                if (req.body.margin_btn_top >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.margin.btn_top":
                                    req.body.margin_btn_top,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.margin.btn_top": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.margin_btn_right != null) {
                if (req.body.margin_btn_right >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.margin.btn_right":
                                    req.body.margin_btn_right,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.margin.btn_right": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.margin_btn_bottom != null) {
                if (req.body.margin_btn_bottom >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.margin.btn_bottom":
                                    req.body.margin_btn_bottom,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.margin.btn_bottom": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.margin_btn_left != null) {
                if (req.body.margin_btn_left >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.margin.btn_left":
                                    req.body.margin_btn_left,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.margin.btn_left": 1,
                            },
                        }
                    ).exec();
                }
            }
            //Border
            if (req.body.border_top != null) {
                if (req.body.border_top >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.border.top": req.body.border_top,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.border.top": 1 } }
                    ).exec();
                }
            }
            if (req.body.border_right != null) {
                if (req.body.border_right >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.border.right": req.body.border_right,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.border.right": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.border_bottom != null) {
                if (req.body.border_bottom >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.border.bottom":
                                    req.body.border_bottom,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.border.bottom": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.border_left != null) {
                if (req.body.border_left >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.border.left": req.body.border_left,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.border.left": 1 } }
                    ).exec();
                }
            }
            if (req.body.border_color != null) {
                if (validator.isHexColor(req.body.border_color)) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.border.color": req.body.border_color,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.border.color": 1 } }
                    ).exec();
                }
            }
            if (req.body.border_radius != null) {
                if (req.body.border_radius >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.border.radius":
                                    req.body.border_radius,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.border.radius": 1 } }
                    ).exec();
                }
            }
            if (req.body.border_btn_top != null) {
                if (req.body.border_btn_top >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.border.btn_top":
                                    req.body.border_btn_top,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.border.btn_top": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.border_btn_right != null) {
                if (req.body.border_btn_right >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.border.btn_right":
                                    req.body.border_btn_right,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.border.btn_right": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.border_btn_bottom != null) {
                if (req.body.border_btn_bottom >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.border.btn_bottom":
                                    req.body.border_btn_bottom,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.border.btn_bottom": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.border_btn_left != null) {
                if (req.body.border_btn_left >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.border.btn_left":
                                    req.body.border_btn_left,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.border.btn_left": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.border_btn_color != null) {
                if (validator.isHexColor(req.body.border_btn_color)) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.border.btn_color":
                                    req.body.border_btn_color,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.border.btn_color": 1,
                            },
                        }
                    ).exec();
                }
            }
            if (req.body.border_btn_radius != null) {
                if (req.body.border_btn_radius >= 0) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.border.btn_radius":
                                    req.body.border_btn_radius,
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $unset: {
                                "blocks.$.border.btn_radius": 1,
                            },
                        }
                    ).exec();
                }
            }
            //Font
            if (req.body.font_size != null) {
                if (req.body.font_size >= 10 && req.body.font_size <= 100) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $set: { "blocks.$.font.size": req.body.font_size } }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.font.size": 1 } }
                    ).exec();
                }
            }
            if (req.body.font_style != null) {
                if (req.body.font_style) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.font.style":
                                    req.body.font_style.toLowerCase(),
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.font.style": 1 } }
                    ).exec();
                }
            }
            //Alignment
            if (req.body.alignment != null) {
                if (req.body.alignment) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.alignment":
                                    req.body.alignment.toLowerCase(),
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.alignment": 1 } }
                    ).exec();
                }
            }
            //Width
            if (req.body.width != null) {
                if (req.body.width) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: {
                                "blocks.$.width": req.body.width.toLowerCase(),
                            },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.width": 1 } }
                    ).exec();
                }
            }
            //Width percentage
            if (req.body.width_pct != null) {
                if (req.body.width_pct) {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        {
                            $set: { "blocks.$.width_pct": req.body.width_pct },
                            $unset: { "blocks.$.width": 1 },
                        }
                    ).exec();
                } else {
                    Block.updateOne(
                        {
                            _id: containerBlock._id,
                            "blocks._id": req.params._id,
                        },
                        { $unset: { "blocks.$.width_pct": 1 } }
                    ).exec();
                }
            }
            //Save
            Block.updateOne(
                { _id: containerBlock._id, "blocks._id": req.params._id },
                { $set: { "blocks.$.updated_at": new Date(Date.now()) } },
                function (err, numAffected) {
                    if (!err) {
                        var sub_block = containerBlock.blocks.id(
                            req.params._id
                        );
                        res.status(200).send(sub_block);
                    } else {
                        res.sendStatus(400);
                    }
                }
            );
        }
    );
};
//Move subblock up
var _moveSubBlockUp = function (req, res) {
    Block.findOne({ _id: req.params._container, type: "container" }).exec(
        function (err, containerBlock) {
            if (!containerBlock) return res.sendStatus(404);
            //Get sub block and its position
            var blocks = containerBlock.blocks;
            var current_order, sub_block;
            for (var i = 0; i < blocks.length; i++) {
                if (blocks[i]._id.toString() == req.params._id) {
                    current_order = i;
                    sub_block = blocks[i];
                }
            }
            //Order
            if (!current_order)
                return res
                    .status(400)
                    .send({ error: "Block already at the top." });
            current_order = current_order - 1;
            //Pull subblock
            Block.updateOne(
                { _id: containerBlock._id, type: "container" },
                { $pull: { blocks: { _id: sub_block._id } } },
                function (err, numAffected) {
                    if (!err) {
                        //Push at current_order
                        Block.updateOne(
                            { _id: containerBlock._id, type: "container" },
                            {
                                $push: {
                                    blocks: {
                                        $each: [sub_block],
                                        $position: current_order,
                                    },
                                },
                            },
                            function (err, numAffected) {
                                if (!err) res.sendStatus(200);
                            }
                        );
                    } else {
                        res.sendStatus(400);
                    }
                }
            );
        }
    );
};
//Move subblock down
var _moveSubBlockDown = function (req, res) {
    Block.findOne({ _id: req.params._container, type: "container" }).exec(
        function (err, containerBlock) {
            if (!containerBlock) return res.sendStatus(404);
            //Get sub block and its position
            var blocks = containerBlock.blocks;
            var current_order, sub_block;
            for (var i = 0; i < blocks.length; i++) {
                if (blocks[i]._id.toString() == req.params._id) {
                    current_order = i;
                    sub_block = blocks[i];
                }
            }
            //Order
            if (current_order == blocks.length - 1)
                return res
                    .status(400)
                    .send({ error: "Block already at the bottom." });
            current_order = current_order + 1;
            //Pull subblock
            Block.updateOne(
                { _id: containerBlock._id, type: "container" },
                { $pull: { blocks: { _id: sub_block._id } } },
                function (err, numAffected) {
                    if (!err) {
                        //Push at current_order
                        Block.updateOne(
                            { _id: containerBlock._id, type: "container" },
                            {
                                $push: {
                                    blocks: {
                                        $each: [sub_block],
                                        $position: current_order,
                                    },
                                },
                            },
                            function (err, numAffected) {
                                if (!err) res.sendStatus(200);
                            }
                        );
                    } else {
                        res.sendStatus(400);
                    }
                }
            );
        }
    );
};
//Add person to subblock
var _addPersonToSubBlock = function (req, res) {
    if (!req.body.person)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a person id.",
        });
    Person.findOne({ _id: req.body.person }, function (err, person) {
        if (!person) return res.sendStatus(404);
        Block.findOne({ _id: req.params._container, type: "container" }).exec(
            function (err, containerBlock) {
                if (!containerBlock) return res.sendStatus(404);
                //Get sub block and its position
                var blocks = containerBlock.blocks;
                var current_order, sub_block;
                for (var i = 0; i < blocks.length; i++) {
                    if (blocks[i]._id.toString() == req.params._id) {
                        current_order = i;
                        sub_block = blocks[i];
                    }
                }
                //Add new people
                sub_block.people.addToSet(person._id);
                //Pull subblock
                Block.updateOne(
                    { _id: containerBlock._id, type: "container" },
                    { $pull: { blocks: { _id: sub_block._id } } },
                    function (err, numAffected) {
                        if (!err) {
                            //Push at current_order
                            Block.updateOne(
                                { _id: containerBlock._id, type: "container" },
                                {
                                    $push: {
                                        blocks: {
                                            $each: [sub_block],
                                            $position: current_order,
                                        },
                                    },
                                },
                                function (err, numAffected) {
                                    if (!err) res.send(person);
                                }
                            );
                        } else {
                            res.sendStatus(400);
                        }
                    }
                );
            }
        );
    });
};
//Remove person from subblock
var _removePersonFromSubBlock = function (req, res) {
    if (!req.body.person)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a person id.",
        });
    Block.findOne({ _id: req.params._container, type: "container" }).exec(
        function (err, containerBlock) {
            if (!containerBlock) return res.sendStatus(404);
            //Get sub block and its position
            var blocks = containerBlock.blocks;
            var current_order, sub_block;
            for (var i = 0; i < blocks.length; i++) {
                if (blocks[i]._id.toString() == req.params._id) {
                    current_order = i;
                    sub_block = blocks[i];
                }
            }
            //Pull person
            sub_block.people.pull(req.body.person);
            //Pull subblock
            Block.updateOne(
                { _id: containerBlock._id, type: "container" },
                { $pull: { blocks: { _id: sub_block._id } } },
                function (err, numAffected) {
                    if (!err) {
                        //Push at current_order
                        Block.updateOne(
                            { _id: containerBlock._id, type: "container" },
                            {
                                $push: {
                                    blocks: {
                                        $each: [sub_block],
                                        $position: current_order,
                                    },
                                },
                            },
                            function (err, numAffected) {
                                if (!err) res.sendStatus(200);
                            }
                        );
                    } else {
                        res.sendStatus(400);
                    }
                }
            );
        }
    );
};
//Update person order in people or logos subblock
var _updatePersonOrderInSubBlock = function (req, res) {
    if (req.body.order == null)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an order number.",
        });
    if (!req.body.person)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a person id.",
        });
    Block.findOne({ _id: req.params._container, type: "container" }).exec(
        function (err, containerBlock) {
            if (!containerBlock) return res.sendStatus(404);
            //Get sub block and its position
            var blocks = containerBlock.blocks;
            var sub_block;
            for (var i = 0; i < blocks.length; i++) {
                if (blocks[i]._id.toString() == req.params._id) {
                    sub_block = blocks[i];
                }
            }
            //Check if people or logos
            if (sub_block.type != "people" && sub_block.type != "logos") {
                return res
                    .status(400)
                    .send({ error: "Is not a people or logos subblock." });
            }
            //Get person
            var persons = sub_block.people.filter(function (person) {
                return person == req.body.person;
            });
            if (!persons || !persons.length)
                return res
                    .status(400)
                    .send({ error: "Invalid parameters. Nothing to update." });
            else var person = persons[0];
            //Get other persons
            var other_persons = sub_block.people.filter(function (person) {
                return person != req.body.person;
            });
            other_persons.splice(req.body.order, 0, person);
            //Set
            Block.updateOne(
                {
                    _id: containerBlock._id,
                    type: "container",
                    "blocks._id": sub_block._id,
                },
                { $set: { "blocks.$.people": other_persons } },
                function (err, numAffected) {
                    if (!err) res.sendStatus(200);
                }
            );
        }
    );
};
//Add event to calendar subblock
var _addEventToSubBlock = function (req, res) {
    if (!req.body.title || !req.body.start_date)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an event title and event date.",
        });
    Block.findOne({ _id: req.params._container, type: "container" }).exec(
        function (err, containerBlock) {
            if (!containerBlock) return res.sendStatus(404);
            //Get sub block and its position
            var blocks = containerBlock.blocks;
            var current_order, sub_block;
            for (var i = 0; i < blocks.length; i++) {
                if (blocks[i]._id.toString() == req.params._id) {
                    current_order = i;
                    sub_block = blocks[i];
                }
            }
            //Check if calendar
            if (sub_block.type != "calendar") {
                return res
                    .status(400)
                    .send({ error: "Is not a calendar subblock." });
            }
            //New event
            var new_event = new Event({
                title: req.body.title,
                desc: req.body.desc,
                "date.start": req.body.start_date,
                "date.end": req.body.end_date,
                "image.m": req.body.image_m,
                "image.l": req.body.image_l,
                icon: req.body.icon,
                url: req.body.url,
                location: req.body.location,
            });
            sub_block.events.push(new_event);
            //Pull subblock
            Block.updateOne(
                { _id: containerBlock._id, type: "container" },
                { $pull: { blocks: { _id: sub_block._id } } },
                function (err, numAffected) {
                    if (!err) {
                        //Push at current_order
                        Block.updateOne(
                            { _id: containerBlock._id, type: "container" },
                            {
                                $push: {
                                    blocks: {
                                        $each: [sub_block],
                                        $position: current_order,
                                    },
                                },
                            },
                            function (err, numAffected) {
                                if (!err) res.send(new_event);
                            }
                        );
                    } else {
                        res.sendStatus(400);
                    }
                }
            );
        }
    );
};
//Remove event from calendar subblock
var _removeEventFromSubBlock = function (req, res) {
    if (!req.body.event)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an event id.",
        });
    Block.findOne({ _id: req.params._container, type: "container" }).exec(
        function (err, containerBlock) {
            if (!containerBlock) return res.sendStatus(404);
            //Get sub block and its position
            var blocks = containerBlock.blocks;
            var current_order, sub_block;
            for (var i = 0; i < blocks.length; i++) {
                if (blocks[i]._id.toString() == req.params._id) {
                    current_order = i;
                    sub_block = blocks[i];
                }
            }
            //Pull event
            sub_block.events.pull(req.body.event);
            //Pull subblock
            Block.updateOne(
                { _id: containerBlock._id, type: "container" },
                { $pull: { blocks: { _id: sub_block._id } } },
                function (err, numAffected) {
                    if (!err) {
                        //Push at current_order
                        Block.updateOne(
                            { _id: containerBlock._id, type: "container" },
                            {
                                $push: {
                                    blocks: {
                                        $each: [sub_block],
                                        $position: current_order,
                                    },
                                },
                            },
                            function (err, numAffected) {
                                if (!err) res.sendStatus(200);
                            }
                        );
                    } else {
                        res.sendStatus(400);
                    }
                }
            );
        }
    );
};
//Update event order in calendar subblock
var _updateEventOrderInSubBlock = function (req, res) {
    if (req.body.order == null)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an order number.",
        });
    if (!req.body.event)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an event id.",
        });
    Block.findOne({ _id: req.params._container, type: "container" }).exec(
        function (err, containerBlock) {
            if (!containerBlock) return res.sendStatus(404);
            //Get sub block and its position
            var blocks = containerBlock.blocks;
            var sub_block;
            for (var i = 0; i < blocks.length; i++) {
                if (blocks[i]._id.toString() == req.params._id) {
                    sub_block = blocks[i];
                }
            }
            //Check if calendar
            if (sub_block.type != "calendar") {
                return res
                    .status(400)
                    .send({ error: "Is not a calendar subblock." });
            }
            //Get event
            var events = sub_block.events.filter(function (event) {
                return event._id == req.body.event;
            });
            if (!events || !events.length)
                return res
                    .status(400)
                    .send({ error: "Invalid parameters. Nothing to update." });
            else var event = events[0];
            //Get other events
            var other_events = sub_block.events.filter(function (event) {
                return event._id != req.body.event;
            });
            other_events.splice(req.body.order, 0, event);
            //Set
            Block.updateOne(
                {
                    _id: containerBlock._id,
                    type: "container",
                    "blocks._id": sub_block._id,
                },
                { $set: { "blocks.$.events": other_events } },
                function (err, numAffected) {
                    if (!err) res.sendStatus(200);
                }
            );
        }
    );
};
//Delete request function - Block
//Delete block
var _deleteBlock = function (req, res) {
    Block.findOne({ _id: req.params._id }, function (err, block) {
        if (!block) return res.sendStatus(404);
        //All s3 image keys
        var keys = [];
        if (block.type == "content") {
            //Check if folder
            if (block.is_folder) {
                Block.updateMany(
                    { folder: block._id },
                    { $unset: { folder: 1 } },
                    function (err, numAffected) {
                        //Remove folder
                        block.remove(function (err) {
                            if (!err) {
                                res.sendStatus(200);
                            } else {
                                res.sendStatus(400);
                            }
                        });
                    }
                );
            } else {
                //Get previous title
                var prev_title = block.text.title;
                //Article - Delete articleblocks and update count of article tag
                async.parallel(
                    [
                        function (callback) {
                            ArticleBlock.find(
                                { block: req.params._id },
                                function (err, ablocks) {
                                    if (ablocks && ablocks.length) {
                                        async.each(
                                            ablocks,
                                            function (ablock, callback2) {
                                                async.parallel(
                                                    [
                                                        function (callback3) {
                                                            //Delete provider files
                                                            if (ablock.image) {
                                                                var provider_key =
                                                                    Utility.get_provider_key(
                                                                        ablock.provider,
                                                                        ablock
                                                                            .image
                                                                            .m
                                                                    );
                                                            } else {
                                                                var provider_key =
                                                                    Utility.get_provider_key(
                                                                        ablock.provider
                                                                    );
                                                            }
                                                            if (provider_key)
                                                                keys.push(
                                                                    provider_key
                                                                );
                                                            callback3();
                                                        },
                                                        function (callback3) {
                                                            //Delete images
                                                            if (
                                                                ablock.type ==
                                                                    "text" &&
                                                                ablock.images
                                                            ) {
                                                                var image_keys =
                                                                    Utility.get_image_keys(
                                                                        ablock.images
                                                                    );
                                                            } else if (
                                                                ablock.image
                                                            ) {
                                                                var image_keys =
                                                                    Utility.get_image_keys(
                                                                        [
                                                                            ablock
                                                                                .image
                                                                                .l,
                                                                        ],
                                                                        ablock
                                                                            .image
                                                                            .m
                                                                    );
                                                            }
                                                            keys =
                                                                keys.concat(
                                                                    image_keys
                                                                );
                                                            callback3();
                                                        },
                                                    ],
                                                    function (err) {
                                                        //Delete article block
                                                        ablock.remove(function (
                                                            err
                                                        ) {
                                                            callback2();
                                                        });
                                                    }
                                                );
                                            },
                                            function (err) {
                                                callback();
                                            }
                                        );
                                    } else {
                                        callback();
                                    }
                                }
                            );
                        },
                        function (callback) {
                            if (block.tags && block.tags.length) {
                                ArticleTag.updateMany(
                                    { _id: { $in: block.tags } },
                                    { $inc: { count: -1 } },
                                    function (err, numAffected) {
                                        ArticleTag.deleteMany(
                                            {
                                                _id: { $in: block.tags },
                                                count: 0,
                                            },
                                            function (err, numAffected) {
                                                callback();
                                            }
                                        );
                                    }
                                );
                            } else {
                                callback();
                            }
                        },
                    ],
                    function (err) {
                        //Get image
                        if (block.image) {
                            block.images.push(block.image.l);
                            var image_keys = Utility.get_image_keys(
                                block.images
                            );
                        } else {
                            var image_keys = Utility.get_image_keys(
                                block.images
                            );
                        }
                        keys = keys.concat(image_keys);
                        //Delete block
                        block.remove(function (err) {
                            if (!err) {
                                res.sendStatus(200);
                                //Finally delete all keys
                                if (keys.length) Utility.delete_keys(keys);
                                //Save log
                                Log.deleteMany(
                                    {
                                        type: "article",
                                        "entity.article": req.params._id,
                                    },
                                    function (err, numAffected) {
                                        saveLog(
                                            "delete",
                                            "article",
                                            req.user.id,
                                            "",
                                            prev_title
                                        );
                                    }
                                );
                            } else {
                                res.sendStatus(400);
                            }
                        });
                    }
                );
            }
        } else {
            //Delete block and subblocks
            async.parallel(
                [
                    function (callback) {
                        if (block.blocks && block.blocks.length) {
                            async.each(
                                block.blocks,
                                function (subblock, callback2) {
                                    if (subblock.type == "body_html") {
                                        var image_keys = Utility.get_image_keys(
                                            subblock.images
                                        );
                                        keys = keys.concat(image_keys);
                                    }
                                    callback2();
                                },
                                function (err) {
                                    callback();
                                }
                            );
                        } else {
                            callback();
                        }
                    },
                ],
                function (err) {
                    //Get image keys from rich text
                    if (block.type == "body_html") {
                        var image_keys = Utility.get_image_keys(block.images);
                        keys = keys.concat(image_keys);
                    }
                    //Change order of other blocks
                    var next_order = block.order + 1;
                    Block.updateMany(
                        { page: block.page, order: { $gte: next_order } },
                        { $inc: { order: -1 } },
                        function (err, numAffected) {
                            //Delete block
                            block.remove(function (err) {
                                if (!err) {
                                    res.sendStatus(200);
                                    //Finally delete all keys
                                    if (keys.length) Utility.delete_keys(keys);
                                } else {
                                    res.sendStatus(400);
                                }
                            });
                        }
                    );
                }
            );
        }
    });
};
/* ------------------- ARTICLE BLOCK FUNCTION ------------------------- */
//GET Request functions - ArticleBlock
//Get articleblocks
var _getArticleBlocks = function (req, res) {
    ArticleBlock.find({ block: req.params._id })
        .sort({ order: 1 })
        .exec(function (err, blocks) {
            res.send(blocks);
        });
};
//Get public article blocks
var _getPublicArticleBlocks = function (req, res) {
    Block.findOne(
        { slug: req.params.slug, type: "content" },
        function (err, block) {
            if (!block) res.send([]);
            ArticleBlock.find({ block: block._id })
                .sort({ order: 1 })
                .populate(
                    "people",
                    "type name about desc initials image email url",
                    "Person"
                )
                .exec(function (err, blocks) {
                    res.send(blocks);
                });
        }
    );
};
//Get one article block
var _getArticleBlockById = function (req, res) {
    ArticleBlock.findOne({ _id: req.params._id })
        .populate(
            "people",
            "type name about desc initials image email url",
            "Person"
        )
        .exec(function (err, block) {
            if (!block) return res.sendStatus(404);
            res.send(block);
        });
};
//POST Request functions - ArticleBlock
//Create text block
var _createTextBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (!req.body.title && !req.body.text) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a title or a text.",
        });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var slug = shortid.generate();
            //Create new block
            var new_block = new ArticleBlock({
                slug: slug,
                order: req.body.order,
                type: "text",
                block: req.body.block,
                title: req.body.title,
                text: req.body.text,
                images: req.body.images,
                creator: req.user.id,
                updated_at: new Date(Date.now()),
            });
            //Save block
            new_block.save(function (err) {
                if (!err) res.send(new_block);
            });
        }
    );
};
//Create gallery block
var _createGalleryBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (!req.body.gallery) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a gallery array.",
        });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var slug = shortid.generate();
            //Create new block
            var new_block = new ArticleBlock({
                slug: slug,
                order: req.body.order,
                type: "gallery",
                block: req.body.block,
                gallery: req.body.gallery,
                creator: req.user.id,
                updated_at: new Date(Date.now()),
            });
            //Save block
            new_block.save(function (err) {
                if (!err) res.send(new_block);
            });
        }
    );
};
//Create image, file, audio or video block
var _createFileBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (!req.body.provider.url) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting an url." });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var slug = shortid.generate();
            //Create new block
            var new_block = new ArticleBlock({
                slug: slug,
                order: req.body.order,
                type: req.params._type,
                block: req.body.block,
                title: req.body.title,
                text: req.body.text,
                provider: req.body.provider,
                "image.m": req.body.image,
                "image.l": req.body.image,
                bound: req.body.bound,
                file: req.body.file,
                creator: req.user.id,
                updated_at: new Date(Date.now()),
            });
            //Save block
            new_block.save(function (err) {
                if (!err) res.send(new_block);
                //Resize image
                if (req.body.image) {
                    var file_name = slug;
                    if (req.body.provider.name == "MGIEP") {
                        var image = req.body.image.replace(
                            /^https:\/\//i,
                            "http://"
                        );
                        //Resize and upload image
                        Utility.get_resized_image(
                            file_name,
                            image,
                            400,
                            function (resized) {
                                Utility.upload_file(
                                    resized,
                                    file_name,
                                    function (image_url) {
                                        ArticleBlock.updateOne(
                                            { _id: new_block._id },
                                            { $set: { "image.m": image_url } }
                                        ).exec();
                                    }
                                );
                            }
                        );
                    } else {
                        //Download and upload image
                        Utility.download_file(
                            req.body.image,
                            file_name,
                            function (file) {
                                Utility.upload_file(
                                    file,
                                    file_name,
                                    function (image_url) {
                                        ArticleBlock.updateOne(
                                            { _id: new_block._id },
                                            { $set: { "image.m": image_url } }
                                        ).exec();
                                    }
                                );
                            }
                        );
                    }
                }
            });
        }
    );
};
//Create gif block
var _createGIFBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (!req.body.gif_embed) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a gif_embed.",
        });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var slug = shortid.generate();
            //Create new block
            var new_block = new ArticleBlock({
                slug: slug,
                order: req.body.order,
                type: "gif",
                block: req.body.block,
                "gif.embed": req.body.gif_embed,
                "gif.url": req.body.gif_url,
                "gif.width": req.body.width,
                "gif.height": req.body.height,
                creator: req.user.id,
                updated_at: new Date(Date.now()),
            });
            //Save block
            new_block.save(function (err) {
                if (!err) res.send(new_block);
            });
        }
    );
};
//Create link block
var _createLinkBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (
        (!req.body.url || !validator.isURL(req.body.url)) &&
        !req.body.linkdata
    ) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a valid url or link data",
        });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var linkdata;
            async.series(
                [
                    //Get link metadata
                    function (callback) {
                        if (req.body.linkdata) {
                            linkdata = req.body.linkdata;
                            callback();
                        } else {
                            Utility.get_link_metadata(
                                req.body.url,
                                function (data) {
                                    linkdata = data;
                                    //Get image
                                    var images = data.images;
                                    var imageURL;
                                    if (images && images.length) {
                                        for (
                                            var i = 0;
                                            i < images.length;
                                            i++
                                        ) {
                                            if (
                                                images[i].width > 200 &&
                                                images[i].height > 100
                                            ) {
                                                req.body.image = images[
                                                    i
                                                ].url.replace(
                                                    /^https:\/\//i,
                                                    "http://"
                                                );
                                                //Set bound
                                                var bound =
                                                    (images[i].height * 400) /
                                                    images[i].width;
                                                if (bound) {
                                                    bound = parseInt(bound);
                                                    req.body.bound = bound;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                    callback();
                                }
                            );
                        }
                    },
                ],
                function (err) {
                    //Slug
                    var slug = shortid.generate();
                    //Create new block
                    var new_block = new ArticleBlock({
                        slug: slug,
                        order: req.body.order,
                        type: "link",
                        block: req.body.block,
                        title: linkdata.title || linkdata.url,
                        text: linkdata.description || req.body.summary,
                        "provider.name": linkdata.provider_name,
                        "provider.url": linkdata.url,
                        "provider.favicon": linkdata.favicon_url,
                        embed: linkdata.media.html,
                        embed_type: linkdata.media.type || linkdata.type,
                        publish_date: linkdata.published,
                        "image.m": req.body.image,
                        "image.l": req.body.image,
                        bound: req.body.bound,
                        creator: req.user.id,
                        updated_at: new Date(Date.now()),
                    });
                    //Save block
                    new_block.save(function (err) {
                        if (!err) res.send(new_block);
                        //Update image
                        if (req.body.image) {
                            var image = req.body.image.replace(
                                /^https:\/\//i,
                                "http://"
                            );
                            var file_name = slug;
                            var m_file_name = "m-" + file_name;
                            //Download and update original file
                            Utility.download_file(
                                image,
                                file_name,
                                function (file) {
                                    Utility.upload_file(
                                        file,
                                        file_name,
                                        function (image_url) {
                                            ArticleBlock.updateOne(
                                                { _id: new_block._id },
                                                {
                                                    $set: {
                                                        "image.l": image_url,
                                                    },
                                                }
                                            ).exec();
                                        }
                                    );
                                }
                            );
                            //Update image (medium size)
                            Utility.get_resized_image(
                                m_file_name,
                                image,
                                400,
                                function (resized) {
                                    Utility.upload_file(
                                        resized,
                                        m_file_name,
                                        function (image_url) {
                                            ArticleBlock.updateOne(
                                                { _id: new_block._id },
                                                {
                                                    $set: {
                                                        "image.m": image_url,
                                                    },
                                                }
                                            ).exec();
                                        }
                                    );
                                }
                            );
                        }
                    });
                }
            );
        }
    );
};
//Create embed block
var _createEmbedBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (!req.body.embed) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an embed code.",
        });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var slug = shortid.generate();
            //Create new block
            var new_block = new ArticleBlock({
                slug: slug,
                order: req.body.order,
                type: "embed",
                block: req.body.block,
                title: req.body.title,
                embed: req.body.embed,
                embed_type: req.body.embed_type,
                creator: req.user.id,
                updated_at: new Date(Date.now()),
            });
            //Save block
            new_block.save(function (err) {
                if (!err) res.send(new_block);
            });
        }
    );
};
//Create toggle block
var _createToggleBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (!req.body.title || !req.body.desc) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a title and a desc.",
        });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var slug = shortid.generate();
            //Create new block
            var new_block = new ArticleBlock({
                slug: slug,
                order: req.body.order,
                type: "toggle",
                block: req.body.block,
                title: req.body.title,
                creator: req.user.id,
                updated_at: new Date(Date.now()),
            });
            new_block.desc = Utility.get_linkified_text(req.body.desc);
            //Save block
            new_block.save(function (err) {
                if (!err) res.send(new_block);
            });
        }
    );
};
//Create callout block
var _createCalloutBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (!req.body.title && !req.body.desc) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a title or a desc.",
        });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var slug = shortid.generate();
            //Create new block
            var new_block = new ArticleBlock({
                slug: slug,
                order: req.body.order,
                type: "callout",
                block: req.body.block,
                title: req.body.title,
                "color.back": req.body.color_back,
                "color.border": req.body.color_border,
                creator: req.user.id,
                updated_at: new Date(Date.now()),
            });
            //Description
            if (req.body.desc) {
                new_block.desc = Utility.get_linkified_text(req.body.desc);
            }
            //Save block
            new_block.save(function (err) {
                if (!err) res.send(new_block);
            });
        }
    );
};
//Create people/logos block
var _createPeopleBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (!req.body.people) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a people array.",
        });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var slug = shortid.generate();
            //Create new block
            var new_block = new ArticleBlock({
                slug: slug,
                order: req.body.order,
                type: req.params._type,
                block: req.body.block,
                title: req.body.title,
                people: req.body.people,
                creator: req.user.id,
                updated_at: new Date(Date.now()),
            });
            //Description
            if (req.body.desc) {
                new_block.desc = Utility.get_linkified_text(req.body.desc);
            }
            //Save block
            new_block.save(function (err) {
                if (!err) res.send(new_block);
            });
        }
    );
};
//Create breather block
var _createBreatherBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (!req.body.title || !req.body.image_bg) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a title and a background image.",
        });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var slug = shortid.generate();
            //Create new block
            var new_block = new ArticleBlock({
                slug: slug,
                order: req.body.order,
                type: "breather",
                block: req.body.block,
                title: req.body.title,
                desc: req.body.desc,
                "image.bg": req.body.image_bg,
                "button.url": req.body.button_url,
                creator: req.user.id,
                updated_at: new Date(Date.now()),
            });
            //Save block
            new_block.save(function (err) {
                if (!err) res.send(new_block);
            });
        }
    );
};
//Create button block
var _createButtonBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (!req.body.button_text) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a button_text.",
        });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var slug = shortid.generate();
            //Create new block
            var new_block = new ArticleBlock({
                slug: slug,
                order: req.body.order,
                type: "button",
                block: req.body.block,
                "button.text": req.body.button_text,
                "button.url": req.body.button_url,
                "button.back_color": req.body.back_color,
                creator: req.user.id,
                updated_at: new Date(Date.now()),
            });
            //Save block
            new_block.save(function (err) {
                if (!err) res.send(new_block);
            });
        }
    );
};
//Create MCQ and Image MCQ Block
var _createMCQBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (!req.body.title && !req.body.text) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a title or a text.",
        });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var slug = shortid.generate();
            //Create new block
            var new_block = new ArticleBlock({
                slug: slug,
                order: req.body.order,
                type: req.params._type,
                block: req.body.block,
                title: req.body.title,
                is_multiple: req.body.is_multiple,
                creator: req.user.id,
                updated_at: new Date(Date.now()),
            });
            //Block text
            if (req.body.text) {
                new_block.text = Utility.get_linkified_text(req.body.text);
            }
            //Save block
            new_block.save(function (err) {
                if (!err) res.send(new_block);
            });
        }
    );
};
//Create journal block
var _createJournalBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    if (!req.body.title && !req.body.text) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a title or a text.",
        });
    }
    if (!req.body.journal_type) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a journal type.",
        });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
            var slug = shortid.generate();
            //Create new block
            var new_block = new ArticleBlock({
                slug: slug,
                order: req.body.order,
                type: "journal",
                block: req.body.block,
                title: req.body.title,
                journal_type: req.body.journal_type,
                creator: req.user.id,
                updated_at: new Date(Date.now()),
            });
            //Block text
            if (req.body.text) {
                new_block.text = Utility.get_linkified_text(req.body.text);
            }
            //Save block
            new_block.save(function (err) {
                if (!err) res.send(new_block);
            });
        }
    );
};
//Create discussion block
var _createDiscussionBlock = function (req, res) {
    if (!req.body.block) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a block id" });
    }
    Block.findOne(
        { _id: req.body.block, type: "content" },
        function (err, block) {
            if (!block)
                return res.status(400).send({
                    error: "Unauthorized user. Cannot add block to this article.",
                });
        }
    );
};
//PUT Request functions - ArticleBlock
//Edit basic details of a block like color, title etc.
var _editArticleBlock = function (req, res) {
    ArticleBlock.findOne({ _id: req.params._id }, function (err, block) {
        if (!block) return res.sendStatus(404);
        //Update text
        if (req.body.text) {
            block.text = req.body.text;
        }
        //Update images
        if (req.body.images) {
            block.images = _.union(block.images, req.body.images);
        }
        //Update title
        if (req.body.title != null) {
            block.title = req.body.title;
        }
        //Update desc
        if (req.body.desc != null) {
            block.desc = req.body.desc;
        }
        //Update image
        if (req.body.image_bg != null) {
            block.image.bg = req.body.image_bg;
        }
        //Update color
        if (req.body.color_back != null) {
            block.color.back = req.body.color_back;
        }
        if (req.body.color_border != null) {
            block.color.border = req.body.color_border;
        }
        //Update button
        if (req.body.button_text) {
            block.button.text = req.body.button_text;
        }
        if (req.body.button_url != null) {
            block.button.url = req.body.button_url;
        }
        if (req.body.back_color != null) {
            block.button.back_color = req.body.back_color;
        }
        block.updated_at = new Date(Date.now());
        //Save
        block.save(function (err) {
            if (!err) {
                res.status(200).send(block);
            } else res.sendStatus(400);
        });
    });
};
//Add image to gallery
var _addImageToGallery = function (req, res) {
    if (!req.body.image_m)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an image url.",
        });
    var new_image = new Image({
        title: req.body.title,
        "file.m": req.body.image_m,
        "file.l": req.body.image_l,
        bound: req.body.bound,
        "button.url": req.body.button_url,
    });
    //Save
    ArticleBlock.updateOne(
        { _id: req.params._id, type: "gallery" },
        { $push: { gallery: new_image } },
        function (err, numAffected) {
            res.send(new_image);
        }
    );
};
//Remove image from gallery
var _removeImageFromGallery = function (req, res) {
    if (!req.body.image)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an image id.",
        });
    ArticleBlock.updateOne(
        { _id: req.params._id },
        { $pull: { gallery: { _id: req.body.image } } },
        function (err, numAffected) {
            if (!err) res.sendStatus(200);
        }
    );
};
//Update image order in gallery
var _updateImageOrderInGallery = function (req, res) {
    if (req.body.order == null)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an order number.",
        });
    if (!req.body.image)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an image id.",
        });
    ArticleBlock.findOne(
        { _id: req.params._id, type: "gallery" },
        function (err, block) {
            if (!block) return res.sendStatus(404);
            //Get image
            var images = block.gallery.filter(function (image) {
                return image._id == req.body.image;
            });
            if (!images || !images.length)
                return res
                    .status(400)
                    .send({ error: "Invalid parameters. Nothing to update." });
            else var image = images[0];
            //Remove image
            ArticleBlock.updateOne(
                { _id: req.params._id },
                { $pull: { gallery: { _id: req.body.image } } },
                function (err, numAffected) {
                    //Add image at new position
                    ArticleBlock.updateOne(
                        { _id: req.params._id },
                        {
                            $push: {
                                gallery: {
                                    $each: [image],
                                    $position: req.body.order,
                                },
                            },
                        },
                        function (err, numAffected) {
                            if (!err) res.sendStatus(200);
                        }
                    );
                }
            );
        }
    );
};
//Add option to MCQ
var _addOption = function (req, res) {
    if (!req.body.text) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an option text.",
        });
    }
    ArticleBlock.findOne({ _id: req.params._id }, function (err, block) {
        if (!block) return res.sendStatus(404);
        //Add new option
        var new_option = new Option({
            text: req.body.text,
            "image.m": req.body.image,
            "image.l": req.body.image,
            bound: req.body.bound,
        });
        block.mcqs.push(new_option);
        //Save
        block.save(function (err) {
            if (!err) {
                res.status(200).send(new_option);
                //Update image
                if (req.body.image) {
                    var image = req.body.image.replace(
                        /^https:\/\//i,
                        "http://"
                    );
                    var slug = shortid.generate();
                    var m_file_name = "m-" + slug;
                    //Update image (medium size)
                    Utility.get_resized_image(
                        m_file_name,
                        image,
                        200,
                        function (resized) {
                            Utility.upload_file(
                                resized,
                                m_file_name,
                                function (image_url) {
                                    if (block.type == "mcq") {
                                        ArticleBlock.updateOne(
                                            {
                                                _id: req.params._id,
                                                "mcqs._id": new_option._id,
                                            },
                                            {
                                                $set: {
                                                    "mcqs.$.image.m": image_url,
                                                },
                                            }
                                        ).exec();
                                    } else if (block.type == "match") {
                                        ArticleBlock.updateOne(
                                            {
                                                _id: req.params._id,
                                                "options._id": new_option._id,
                                            },
                                            {
                                                $set: {
                                                    "options.$.image.m":
                                                        image_url,
                                                },
                                            }
                                        ).exec();
                                    }
                                }
                            );
                        }
                    );
                }
            } else res.sendStatus(400);
        });
    });
};
//Edit MCQ Option
var _editOption = function (req, res) {
    if (!req.body.option) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an option id.",
        });
    }
    if (!req.body.text) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an option text.",
        });
    }
    ArticleBlock.updateOne(
        { _id: req.params._id, "mcqs._id": req.body.option },
        { $set: { "mcqs.$.text": req.body.text } },
        function (err, numAffected) {
            if (!err) res.send({ text: req.body.text });
        }
    );
};
//Remove option from MCQ
var _removeOption = function (req, res) {
    if (!req.body.option) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an option id.",
        });
    }
    ArticleBlock.updateOne(
        { _id: req.params._id, "mcqs._id": req.body.option },
        { $pull: { mcqs: { _id: req.body.option } } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//Add journaling response
var _addJournalingResponse = function (req, res) {
    if (!req.body.text && !req.body.provider.url) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a response text or a response url.",
        });
    }
    ArticleBlock.findOne({ _id: req.params._id }, function (err, block) {
        if (!block) return res.sendStatus(404);
        //Add new answer
        var new_answer = new Answer({
            text: req.body.text,
            file: req.body.file,
            provider: req.body.provider,
            creator: req.user.id,
            updated_at: new Date(Date.now),
        });
        block.answers.push(new_answer);
        //Save
        block.save(function (err) {
            if (!err) {
                res.status(200).send(block);
            } else res.sendStatus(400);
        });
    });
};
//Edit journaling response
var _editTextJournalingResponse = function (req, res) {
    if (!req.body.text) {
        return res.status(400).send({
            error: "Invalid parameters. We were expecting an answer text.",
        });
    }
    ArticleBlock.updateOne(
        {
            _id: req.params._id,
            journal_type: "text",
            "answers.creator": req.user.id,
        },
        { $set: { "answers.$.text": req.body.text } },
        function (err, numAffected) {
            if (!err) res.send({ text: req.body.text });
        }
    );
};
//Remove journaling response
var _removeJournalingResponse = function (req, res) {
    ArticleBlock.findOne({ _id: req.params._id }, function (err, block) {
        if (!block) return res.sendStatus(404);
        if (!block.answers || !block.answers.length)
            return res.status(400).send({ error: "Cannot remove response." });
        //Find provider url if any
        var keys = [];
        for (var i = 0; i < block.answers.length; i++) {
            if (
                block.answers[i].creator == req.user.id &&
                block.answers[i].provider
            ) {
                var provider_key = Utility.get_provider_key(
                    block.answers[i].provider
                );
                keys.push(provider_key);
                break;
            }
        }
        //Update block
        ArticleBlock.updateOne(
            {
                _id: req.params._id,
                "answers.creator": req.user.id,
            },
            { $pull: { answers: { creator: req.user.id } } },
            function (err, numAffected) {
                if (!err) {
                    res.sendStatus(200);
                    //Finally delete all keys
                    Utility.delete_keys(keys);
                } else {
                    res.sendStatus(400);
                }
            }
        );
    });
};
//Add person to articleblock
var _addPersonToArticleBlock = function (req, res) {
    if (!req.body.person)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a person id.",
        });
    Person.findOne({ _id: req.body.person }, function (err, person) {
        if (!person) return res.sendStatus(404);
        ArticleBlock.updateOne(
            { _id: req.params._id },
            { $addToSet: { people: person._id } },
            function (err, numAffected) {
                res.send(person);
            }
        );
    });
};
//Remove person from article block
var _removePersonFromArticleBlock = function (req, res) {
    if (!req.body.person)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a person id.",
        });
    ArticleBlock.updateOne(
        { _id: req.params._id },
        { $pull: { people: req.body.person } },
        function (err, numAffected) {
            if (!err) res.sendStatus(200);
        }
    );
};
//Update person order in people or logos article block
var _updatePersonOrderInArticleBlock = function (req, res) {
    if (req.body.order == null)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting an order number.",
        });
    if (!req.body.person)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a person id.",
        });
    ArticleBlock.findOne(
        { _id: req.params._id, type: { $in: ["people", "logos"] } },
        function (err, block) {
            if (!block) return res.sendStatus(404);
            //Get person
            var persons = block.people.filter(function (person) {
                return person == req.body.person;
            });
            if (!persons || !persons.length)
                return res
                    .status(400)
                    .send({ error: "Invalid parameters. Nothing to update." });
            else var person = persons[0];
            //Remove person
            ArticleBlock.updateOne(
                { _id: req.params._id },
                { $pull: { people: req.body.person } },
                function (err, numAffected) {
                    //Add person at new position
                    ArticleBlock.updateOne(
                        { _id: req.params._id },
                        {
                            $push: {
                                people: {
                                    $each: [person],
                                    $position: req.body.order,
                                },
                            },
                        },
                        function (err, numAffected) {
                            if (!err) res.sendStatus(200);
                        }
                    );
                }
            );
        }
    );
};
//Move article block up
var _moveArticleBlockUp = function (req, res) {
    ArticleBlock.findOne({ _id: req.params._id }, function (err, block) {
        if (!block) return res.sendStatus(404);
        var current_order = block.order;
        if (current_order == 1)
            return res.status(400).send({ error: "Block already at the top." });
        var prev_order = current_order - 1;
        //Update
        ArticleBlock.updateOne(
            { block: block.block, order: prev_order },
            { $inc: { order: 1 } },
            function (err, numAffected) {
                block.order = current_order - 1;
                block.save(function (err) {
                    if (!err) {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(400);
                    }
                });
            }
        );
    });
};
//Mode article block down
var _moveArticleBlockDown = function (req, res) {
    ArticleBlock.findOne({ _id: req.params._id }, function (err, block) {
        if (!block) return res.sendStatus(404);
        var current_order = block.order;
        var next_order = current_order + 1;
        //Update
        ArticleBlock.updateOne(
            { block: block.block, order: next_order },
            { $inc: { order: -1 } },
            function (err, numAffected) {
                block.order = current_order + 1;
                block.save(function (err) {
                    if (!err) {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(400);
                    }
                });
            }
        );
    });
};
//Delete request function - Block
//Delete articleblock
var _deleteArticleBlock = function (req, res) {
    ArticleBlock.findOne({ _id: req.params._id }, function (err, block) {
        if (!block) return res.sendStatus(404);
        //All s3 image keys
        var keys = [];
        async.parallel(
            [
                function (callback) {
                    //Delete provider files
                    if (block.image) {
                        var provider_key = Utility.get_provider_key(
                            block.provider,
                            block.image.m
                        );
                    } else {
                        var provider_key = Utility.get_provider_key(
                            block.provider
                        );
                    }
                    if (provider_key) keys.push(provider_key);
                    callback();
                },
                function (callback) {
                    //Delete images
                    if (block.type == "text" && block.images) {
                        var image_keys = Utility.get_image_keys(block.images);
                    } else if (block.image) {
                        var image_keys = Utility.get_image_keys(
                            [block.image.l],
                            block.image.m
                        );
                    }
                    keys = keys.concat(image_keys);
                    callback();
                },
                function (callback) {
                    //Update order of other blocks
                    var current_order = block.order;
                    ArticleBlock.updateMany(
                        { block: block.block, order: { $gt: current_order } },
                        { $inc: { order: -1 } },
                        function (err, numAffected) {
                            callback();
                        }
                    );
                },
            ],
            function (err) {
                if (!err) {
                    //Delete block finally
                    block.remove(function (err) {
                        if (!err) {
                            res.sendStatus(200);
                            //Finally delete all keys
                            Utility.delete_keys(keys);
                        } else {
                            res.sendStatus(400);
                        }
                    });
                } else {
                    res.sendStatus(400);
                }
            }
        );
    });
};
/* ------------------- FILES FUNCTION ------------------------- */
//GET Request functions - File
//Get files
var _getFiles = function (req, res) {
    var page = req.query.page;
    if (req.query.type && req.query.type == "images") {
        File.find({ "image.m": { $ne: null }, is_folder: false })
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE * 5)
            .limit(PAGE_SIZE * 5)
            .exec(function (err, files) {
                res.send(files);
            });
    } else if (req.query.folder) {
        File.find({ folder: req.query.folder })
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, files) {
                res.send(files);
            });
    } else {
        File.find({ folder: null })
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, files) {
                res.send(files);
            });
    }
};
//Get one file details
var _getFileById = function (req, res) {
    File.findOne({ _id: req.params._id }, function (err, file) {
        if (!file) return res.sendStatus(404);
        res.send(file);
    });
};
//POST Request functions - File
//Add file
var _addFile = function (req, res) {
    if (!req.body.url && !req.body.title)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a file url or folder title.",
        });
    //File or Folder
    if (req.body.url) {
        var new_file = new File({
            title: req.body.title,
            url: req.body.url,
            "image.m": req.body.image,
            "image.l": req.body.image,
            bound: req.body.bound,
            size: req.body.size,
            ext: req.body.ext,
            folder: req.body.folder,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        //Shorten url
        Utility.get_short_url(req.body.url, function (short_url) {
            if (short_url) new_file.short_url = short_url;
            //Save file
            new_file.save(function (err) {
                if (!err) res.send(new_file);
                //Resize image
                if (req.body.image) {
                    var key = shortid.generate();
                    var file_name =
                        key + "-" + getSlug(req.body.title || "Untitled image");
                    var image = req.body.image.replace(
                        /^https:\/\//i,
                        "http://"
                    );
                    //Resize and upload image
                    Utility.get_resized_image(
                        file_name,
                        image,
                        400,
                        function (resized) {
                            Utility.upload_file(
                                resized,
                                file_name,
                                function (image_url) {
                                    File.updateOne(
                                        { _id: new_file._id },
                                        { $set: { "image.m": image_url } }
                                    ).exec();
                                }
                            );
                        }
                    );
                }
                //Save log
                saveLog("add", "file", req.user.id, { file: new_file._id });
            });
        });
    } else {
        var new_file = new File({
            title: req.body.title,
            is_folder: true,
            creator: req.user.id,
            updated_at: new Date(Date.now()),
        });
        new_file.save(function (err) {
            if (!err) res.send(new_file);
        });
    }
};
//PUT Requests functions - File
//Edit basic details of file
var _editFile = function (req, res) {
    if (!req.body.title && !req.body.image) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a file title or an image url.",
        });
    }
    File.findOne({ _id: req.params._id }, function (err, file) {
        if (!file) return res.sendStatus(404);
        //Title
        if (req.body.title) {
            file.title = req.body.title;
        }
        //Image
        if (
            req.body.image &&
            file.image &&
            file.image.l &&
            file.image.l == file.url
        ) {
            var keys = Utility.get_image_keys([file.url]);
            file.url = req.body.image;
            file.image.l = req.body.image;
        }
        file.updated_at = new Date(Date.now());
        //Update
        if (keys && keys.length) {
            //Shorten url
            Utility.get_short_url(req.body.image, function (short_url) {
                if (short_url) file.short_url = short_url;
                //Save file
                file.save(function (err) {
                    if (!err) {
                        res.status(200).send(file);
                        //Finally delete all keys
                        Utility.delete_keys(keys);
                    } else {
                        res.sendStatus(400);
                    }
                });
            });
        } else {
            //Save file
            file.save(function (err) {
                if (!err) {
                    res.status(200).send(file);
                } else {
                    res.sendStatus(400);
                }
            });
        }
    });
};
//Move file to folder or outside of folder
var _moveFile = function (req, res) {
    if (req.body.folder) {
        //Move to an existing folder
        File.findOne(
            { _id: req.params._id, is_folder: false },
            function (err, file) {
                if (!file) return res.sendStatus(404);
                if (req.body.folder == file.folder) {
                    return res.status(400).send({
                        error: "Thanks for trying, but file is already in this folder.",
                    });
                }
                File.findOne(
                    { _id: req.body.folder, is_folder: true },
                    function (err, folder) {
                        if (!folder) return res.sendStatus(404);
                        file.folder = folder._id;
                        folder.updated_at = new Date(Date.now());
                        //Save folder
                        folder.save(function (err) {
                            if (!err) {
                                //Save file
                                file.save(function (err) {
                                    if (!err) {
                                        res.status(200).send(file);
                                    } else res.sendStatus(400);
                                });
                            }
                        });
                    }
                );
            }
        );
    } else {
        //Move outside of folder
        File.findOne(
            { _id: req.params._id, is_folder: false },
            function (err, file) {
                if (!file) return res.sendStatus(404);
                if (!file.folder) {
                    return res.status(400).send({
                        error: "Thanks for trying, but file is already outside of folder.",
                    });
                }
                file.folder = undefined;
                //Save file
                file.save(function (err) {
                    if (!err) {
                        res.status(200).send(file);
                    } else res.sendStatus(400);
                });
            }
        );
    }
};
//Delete request function - File
//Delete file
var _deleteFile = function (req, res) {
    File.findOne({ _id: req.params._id }, function (err, file) {
        if (!file) return res.sendStatus(404);
        //Check if folder
        if (file.is_folder) {
            File.updateMany(
                { folder: file._id },
                { $unset: { folder: 1 } },
                function (err, numAffected) {
                    //Remove folder
                    file.remove(function (err) {
                        if (!err) {
                            res.sendStatus(200);
                        } else {
                            res.sendStatus(400);
                        }
                    });
                }
            );
        } else {
            //Get previous title
            var prev_title = file.title;
            //All s3 image keys
            var keys = [];
            //Get image url or url
            if (file.image && file.image.m) {
                var image_keys = Utility.get_image_keys(
                    [file.url],
                    file.image.m
                );
            } else {
                var image_keys = Utility.get_image_keys([file.url]);
            }
            keys = keys.concat(image_keys);
            //Remove from block and delete images
            file.remove(function (err) {
                if (!err) {
                    res.sendStatus(200);
                    //Finally delete all keys
                    Utility.delete_keys(keys);
                    //Save log
                    Log.deleteMany(
                        { type: "file", "entity.file": req.params._id },
                        function (err, numAffected) {
                            saveLog(
                                "delete",
                                "file",
                                req.user.id,
                                "",
                                prev_title
                            );
                        }
                    );
                } else {
                    res.sendStatus(400);
                }
            });
        }
    });
};
/* ------------------- PERSONS FUNCTION ------------------------- */
//GET Request functions - Person
//Get persons
var _getPersons = function (req, res) {
    var page = req.query.page;
    if (req.query.type) {
        Person.find({ type: req.query.type })
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, persons) {
                res.send(persons);
            });
    } else {
        Person.find({})
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, persons) {
                res.send(persons);
            });
    }
};
//Get one person details
var _getPersonById = function (req, res) {
    Person.findOne({ _id: req.params._id }, function (err, person) {
        if (!person) return res.sendStatus(404);
        res.send(person);
    });
};
//POST Request functions - Person
//Add person
var _addPerson = function (req, res) {
    if (!req.body.name)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a person name.",
        });
    var new_person = new Person({
        name: req.body.name,
        about: req.body.about,
        initials: req.body.name
            .split(" ")
            .map(function (s) {
                return s.charAt(0);
            })
            .join("")
            .toUpperCase(),
        "image.m": req.body.image,
        "image.l": req.body.image,
        email: req.body.email,
        url: req.body.url,
        creator: req.user.id,
        updated_at: new Date(Date.now()),
    });
    //Type
    if (!req.body.type) {
        new_person.type = "author";
    } else {
        new_person.type = req.body.type;
    }
    //Description
    if (req.body.desc != null) {
        new_person.desc = Utility.get_linkified_text(req.body.desc);
    }
    //Save person
    new_person.save(function (err) {
        if (!err) res.send(new_person);
        //Resize image
        if (req.body.image) {
            var key = shortid.generate();
            var file_name = key + "-" + getSlug(req.body.name);
            var image = req.body.image.replace(/^https:\/\//i, "http://");
            //Resize and upload image
            Utility.get_resized_image(
                file_name,
                image,
                400,
                function (resized) {
                    Utility.upload_file(
                        resized,
                        file_name,
                        function (image_url) {
                            Person.updateOne(
                                { _id: new_person._id },
                                { $set: { "image.m": image_url } }
                            ).exec();
                        }
                    );
                }
            );
        }
        //Save log
        saveLog("add", "person", req.user.id, { person: new_person._id });
    });
};
//PUT Requests functions - Person
//Edit basic details of person
var _editPerson = function (req, res) {
    Person.findOne({ _id: req.params._id }, function (err, person) {
        if (!person) return res.sendStatus(404);
        if (req.body.type != null) {
            if (!req.body.type) {
                person.type = "author";
            } else {
                person.type = req.body.type;
            }
        }
        if (req.body.name) {
            person.name = req.body.name;
            person.initials = req.body.name
                .split(" ")
                .map(function (s) {
                    return s.charAt(0);
                })
                .join("")
                .toUpperCase();
        }
        if (req.body.about != null) {
            person.about = req.body.about;
        }
        if (req.body.desc != null) {
            person.desc = Utility.get_linkified_text(req.body.desc);
        }
        if (req.body.email != null) {
            person.email = req.body.email;
        }
        if (req.body.url != null) {
            person.url = req.body.url;
        }
        person.updated_at = new Date(Date.now());
        person.save(function (err) {
            if (!err) {
                res.status(200).send(person);
            } else {
                res.sendStatus(400);
            }
        });
    });
};
//Edit person image
var _editPersonImage = function (req, res) {
    if (!req.body.image)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a image url.",
        });
    Person.findOne({ _id: req.params._id }, function (err, person) {
        if (!person) return res.sendStatus(404);
        if (person.image && person.image.l == req.body.image)
            return res
                .status(400)
                .send({ error: "Invalid parameters. Nothing to update." });
        person.image.m = req.body.image;
        person.image.l = req.body.image;
        person.updated_at = new Date(Date.now());
        person.save(function (err) {
            if (!err) {
                res.status(200).send(person);
                //Resize image
                var key = shortid.generate();
                var file_name = key + "-" + getSlug(req.body.name);
                var image = req.body.image.replace(/^https:\/\//i, "http://");
                //Resize and upload image
                Utility.get_resized_image(
                    file_name,
                    image,
                    400,
                    function (resized) {
                        Utility.upload_file(
                            resized,
                            file_name,
                            function (image_url) {
                                Person.updateOne(
                                    { _id: person._id },
                                    { $set: { "image.m": image_url } }
                                ).exec();
                            }
                        );
                    }
                );
            } else {
                res.sendStatus(400);
            }
        });
    });
};
//Delete request function - Person
//Delete person
var _deletePerson = function (req, res) {
    Person.findOne({ _id: req.params._id }, function (err, person) {
        if (!person) return res.sendStatus(404);
        //Get previous title
        var prev_title = person.name;
        //All s3 image keys
        var keys = [];
        //Remove from block and delete images
        async.parallel(
            [
                function (callback) {
                    if (person.image) {
                        var image_keys = Utility.get_image_keys(
                            [person.image.l],
                            person.image.m
                        );
                        keys = keys.concat(image_keys);
                        callback();
                    } else {
                        callback();
                    }
                },
                function (callback) {
                    Block.updateMany(
                        { people: person._id },
                        { $pull: { people: person._id } },
                        function (err, numAffected) {
                            callback();
                        }
                    );
                },
            ],
            function (err) {
                if (!err) {
                    //Delete person finally
                    person.remove(function (err) {
                        if (!err) {
                            res.sendStatus(200);
                            //Finally delete all keys
                            Utility.delete_keys(keys);
                            //Save log
                            Log.deleteMany(
                                {
                                    type: "person",
                                    "entity.person": req.params._id,
                                },
                                function (err, numAffected) {
                                    saveLog(
                                        "delete",
                                        "person",
                                        req.user.id,
                                        "",
                                        prev_title
                                    );
                                }
                            );
                        } else {
                            res.sendStatus(400);
                        }
                    });
                } else {
                    res.sendStatus(400);
                }
            }
        );
    });
};
/* ----------------- USER FUNCTION ------------------ */
//GET Request functions - User
//Get details of current user
var _getCurrentUser = function (req, res) {
    User.findOne({ _id: req.user.id })
        .select(
            "-prev_password -loginAttempts -lockUntil -requestToken -resetPasswordToken -resetPasswordExpires"
        )
        .exec(function (err, user) {
            UserBlock.findOne({ user: req.user.id }).exec(function (
                err,
                userblock
            ) {
                //Add following and follower
                user.following = userblock.following.length;
                user.followers = userblock.followers.length;
                if (user.password) {
                    user.password = "";
                    user.is_local = true;
                }
                res.send(user);
            });
        });
};
//Get user details
var _getPublicUser = function (req, res) {
    //Match if object id or not
    if (req.params._id.match(/^[0-9a-fA-F]{24}$/)) {
        var query = {
            _id: req.params._id,
        };
    } else {
        var query = {
            username: req.params._id,
        };
    }
    //Find
    User.findOne(query)
        .select(
            "name accountCreated initials username about dp job city country karma"
        )
        .exec(function (err, user) {
            if (!user)
                return res.status(400).send({ error: "No such user exists" });
            UserBlock.findOne({ user: user._id }, function (err, userblock) {
                user.following = userblock.following.length;
                user.followers = userblock.followers.length;
                var followers = userblock.followers;
                //Check if current user follows this user or not
                if (followers.length && req.user) {
                    if (followers.indexOf(req.user.id.toString()) > -1) {
                        user.is_follower = true;
                    } else {
                        user.is_follower = false;
                    }
                    res.send(user);
                } else {
                    res.send(user);
                }
            });
        });
};
//Get all users for admin
var _getAllUsers = function (req, res) {
    //Check if admin
    if (req.user.type != "admin") {
        return res
            .status(400)
            .send({ error: "Unauthorized user. Cannot view" });
    }
    User.find({})
        .select("-_id username name about email dp karma")
        .sort({ accountCreated: -1 })
        .exec(function (err, users) {
            res.send(users);
        });
};
//POST Request functions - User
//Update current user
var _updateCurrentUser = function (req, res) {
    User.findOne({ _id: req.user.id })
        .select("name initials about email dp password")
        .exec(function (err, user) {
            if (
                req.body.oldpwd &&
                req.body.newpwd &&
                user.validPassword(req.body.oldpwd) &&
                req.body.name
            ) {
                user.name = req.body.name;
                user.initials = req.body.name
                    .split(" ")
                    .map(function (s) {
                        return s.charAt(0);
                    })
                    .join("")
                    .toUpperCase();
                if (req.body.about != null) {
                    user.about = Utility.get_linkified_text(req.body.about);
                }
                user.job.title = req.body.job.title;
                user.job.org = req.body.job.org;
                user.country = req.body.country;
                user.city = req.body.city;
                user.phone = req.body.phone;
                if (req.body.sex) {
                    user.sex = req.body.sex;
                }
                user.prev_password = user.password;
                user.password = user.generateHash(req.body.newpwd);
                user.save(function (err) {
                    user.password = null;
                    user.prev_password = null;
                    res.send(user);
                });
            } else if (req.body.name) {
                user.name = req.body.name;
                user.initials = req.body.name
                    .split(" ")
                    .map(function (s) {
                        return s.charAt(0);
                    })
                    .join("")
                    .toUpperCase();
                if (req.body.about != null) {
                    user.about = Utility.get_linkified_text(req.body.about);
                }
                user.job.title = req.body.job.title;
                user.job.org = req.body.job.org;
                user.country = req.body.country;
                user.city = req.body.city;
                user.phone = req.body.phone;
                if (req.body.sex) {
                    user.sex = req.body.sex;
                }
                user.save(function (err) {
                    user.password = null;
                    res.send(user);
                });
            } else if (req.body.dp) {
                user.dp.m = req.body.dp;
                user.dp.s = req.body.dp;
                user.save(function (err) {
                    if (!err) {
                        user.password = null;
                        res.send(user);
                    }
                    //Resize image
                    var key = uuidv4();
                    var file_name = key + "-" + getSlug(user.name);
                    var dp = req.body.dp.replace(/^https:\/\//i, "http://");
                    Utility.get_resized_image(
                        file_name,
                        dp,
                        100,
                        function (resized) {
                            Utility.upload_file(
                                resized,
                                file_name,
                                function (image_url) {
                                    User.updateOne(
                                        { _id: req.user.id },
                                        { $set: { "dp.s": image_url } }
                                    ).exec();
                                }
                            );
                        }
                    );
                });
            }
        });
};
/*---------------- FOLLOWING FUNCTION -------------------------*/
//GET Request functions
//Show all following
var _showFollowing = function (req, res) {
    var user = req.query.user || req.user.id;
    UserBlock.findOne({ user: user }, function (err, userblock) {
        if (!userblock)
            return res.status(400).send({ error: "No such user exists." });
        var following = userblock.following;
        User.find({ _id: { $in: following } })
            .select("name initials username about dp")
            .exec(function (err, users) {
                //Get current user's block
                UserBlock.findOne(
                    { user: req.user.id },
                    function (err, currentBlock) {
                        //Add is_follower to users current user follows
                        var following = currentBlock.following;
                        for (var i = 0; i < users.length; i++) {
                            if (following.indexOf(users[i]._id) > -1) {
                                users[i].is_follower = true;
                            } else {
                                users[i].is_follower = false;
                            }
                        }
                        res.send(users);
                    }
                );
            });
    });
};
//POST Requests function
//Follow new user
var _addFollowing = function (req, res) {
    if (!req.body.user_id)
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a user id." });
    if (req.body.user_id == req.user.id)
        return res.status(400).send({ error: "Cannot follow yourself." });
    UserBlock.findOne({ user: req.body.user_id }, function (err, userblock) {
        if (!userblock)
            return res.status(400).send({ error: "No such user exists" });
        //Follow
        UserBlock.updateOne(
            { user: req.user.id },
            { $addToSet: { following: req.body.user_id } },
            function (err, numAffected) {
                UserBlock.updateOne(
                    { user: req.body.user_id },
                    { $addToSet: { followers: req.user.id } },
                    function (err, numAffected) {
                        res.sendStatus(200);
                        //Save activity
                        saveActivity(
                            "follow_user",
                            req.body.user_id,
                            req.user.id
                        );
                    }
                );
            }
        );
    });
};
//DELETE Request function
//Remove from following list
var _removeFollowing = function (req, res) {
    UserBlock.updateOne(
        { user: req.user.id },
        { $pull: { following: req.params._id } },
        function (err, numAffected) {
            UserBlock.updateOne(
                { user: req.params._id },
                { $pull: { followers: req.user.id } },
                function (err, numAffected) {
                    res.sendStatus(200);
                }
            );
        }
    );
};
/*---------------- FOLLOWERS FUNCTION -------------------------*/
//GET Request functions
//Show all followers
var _showFollowers = function (req, res) {
    var user = req.query.user || req.user.id;
    UserBlock.findOne({ user: user }, function (err, userblock) {
        if (!userblock)
            return res.status(400).send({ error: "No such user exists." });
        var followers = userblock.followers;
        User.find({ _id: { $in: followers } })
            .select("name initials username about dp")
            .exec(function (err, users) {
                //Get current user's block
                UserBlock.findOne(
                    { user: req.user.id },
                    function (err, currentBlock) {
                        //Add is_follower to users current user follows
                        var following = currentBlock.following;
                        for (var i = 0; i < users.length; i++) {
                            if (following.indexOf(users[i]._id) > -1) {
                                users[i].is_follower = true;
                            } else {
                                users[i].is_follower = false;
                            }
                        }
                        res.send(users);
                    }
                );
            });
    });
};
/*---------------- TAG FUNCTION -------------------------*/
//GET Request functions - Tag
//All public tags sorted by name - before login
var _getAllPublicTags = function (req, res) {
    Tag.find({ is_active: true, is_public: true })
        .select("-members -subscribers")
        .sort({ name: 1 })
        .exec(function (err, tags) {
            res.send(tags);
        });
};
//All created + member + subscribed tags - after login
var _getAllMyTags = function (req, res) {
    Tag.find({
        $or: [
            { creator: req.user.id },
            { subscribers: req.user.id },
            {
                members: {
                    $elemMatch: {
                        user: mongoose.Types.ObjectId(req.user.id),
                        permit_val: { $in: ["moderator", "active"] },
                    },
                },
            },
        ],
    })
        .select("-members -subscribers")
        .sort({ name: 1 })
        .exec(function (err, tags) {
            res.send(tags);
        });
};
//All created + member tags
var _getMyCreatedTags = function (req, res) {
    Tag.find({
        $or: [
            { creator: req.user.id },
            {
                members: {
                    $elemMatch: {
                        user: mongoose.Types.ObjectId(req.user.id),
                        permit_val: { $in: ["moderator", "active"] },
                    },
                },
            },
        ],
    })
        .select("-members -subscribers")
        .sort({ name: 1 })
        .exec(function (err, tags) {
            res.send(tags);
        });
};
//All public tags that user is not subscribed to
var _getExploringTags = function (req, res) {
    Tag.find({
        is_public: true,
        is_active: true,
        $nor: [{ creator: req.user.id }, { subscribers: req.user.id }],
    })
        .select("-members -subscribers")
        .sort({ updated_at: 1 })
        .limit(PAGE_SIZE)
        .exec(function (err, tags) {
            res.send(tags);
        });
};
//Get one tag details
var _getTagByIdOrSlug = function (req, res) {
    //Match if object id or not
    if (req.params._id.match(/^[0-9a-fA-F]{24}$/)) {
        var query = {
            _id: req.params._id,
            $or: [
                { is_public: true },
                { is_public: false, is_active: true },
                { creator: req.user.id },
                {
                    members: {
                        $elemMatch: {
                            user: mongoose.Types.ObjectId(req.user.id),
                            permit_val: { $in: ["moderator", "active"] },
                        },
                    },
                },
            ],
        };
    } else {
        var query = {
            slug: req.params._id,
            $or: [
                { is_public: true },
                { is_public: false, is_active: true },
                { creator: req.user.id },
                {
                    members: {
                        $elemMatch: {
                            user: mongoose.Types.ObjectId(req.user.id),
                            permit_val: { $in: ["moderator", "active"] },
                        },
                    },
                },
            ],
        };
    }
    //Find
    Tag.findOne(query)
        .populate("creator", "name initials username dp job", "User")
        .populate("members.user", "name initials username dp job", "User")
        .exec(function (err, tag) {
            if (!tag) return res.sendStatus(404);
            res.send(tag);
        });
};
//POST Requests function
//Create a tag
var _createTag = function (req, res) {
    if (!req.body.name) {
        return res.status(400).send({
            error: "Invalid parameters. We were expecting a tag name.",
        });
    }
    //Slug
    var key = shortid.generate();
    var slug = key + "-" + getSlug(req.body.name);
    //Create new tag
    var new_tag = new Tag({
        name: req.body.name,
        slug: slug,
        is_public: req.body.is_public,
        creator: req.user.id,
        updated_at: new Date(Date.now()),
    });
    //Add description
    if (req.body.desc) {
        new_tag.desc = Utility.get_linkified_text(req.body.desc);
    }
    //Color
    if (req.body.color) {
        new_tag.color = req.body.color;
    } else {
        new_tag.color = randomColor({ luminosity: "dark" });
    }
    //Make tag active
    if (req.user.type == "admin") {
        new_tag.is_active = true;
    }
    //Save tag
    new_tag.save(function (err) {
        if (!err) {
            res.send(new_tag);
        }
    });
};
//PUT Requests function
//Edit basic details of tag like name, color
var _editTag = function (req, res) {
    Tag.findOne({
        _id: req.params._id,
        $or: [
            { creator: req.user.id },
            {
                members: {
                    $elemMatch: {
                        user: mongoose.Types.ObjectId(req.user.id),
                        permit_val: "moderator",
                    },
                },
            },
        ],
    }).exec(function (err, tag) {
        if (!tag)
            return res
                .status(400)
                .send({ error: "Unauthorized user. Cannot edit tag." });
        if (
            tag.name == req.body.name &&
            tag.desc == req.body.desc &&
            tag.color == req.body.color &&
            req.body.is_public != null &&
            tag.is_public == req.body.is_public
        )
            return res
                .status(400)
                .send({ error: "Invalid parameters. Nothing to update." });
        //Update
        if (req.body.name) {
            tag.name = req.body.name;
        }
        if (req.body.desc) {
            tag.desc = Utility.get_linkified_text(req.body.desc);
        }
        if (req.body.color) {
            tag.color = req.body.color;
        }
        if (req.body.is_public != null) {
            if (req.body.is_public) {
                tag.is_public = true;
            } else {
                tag.is_public = false;
            }
        }
        tag.updated_at = new Date(Date.now());
        tag.save(function (err) {
            if (!err) {
                res.status(200).send(tag);
            }
        });
    });
};
//Add subscriber to public tag - creators and members cannot subscribe to tag again
var _subscribeToTag = function (req, res) {
    Tag.findOneAndUpdate(
        {
            _id: req.params._id,
            is_public: true,
            $and: [
                { creator: { $ne: req.user.id } },
                { "members.user": { $ne: req.user.id } },
            ],
        },
        {
            $addToSet: { subscribers: req.user.id },
            $inc: { "count.subscribers": 1 },
        },
        function (err, tag) {
            if (!err) {
                res.sendStatus(200);
                //Save activity
                saveActivity("subscribed_to_tag", tag.creator, req.user.id, {
                    tag: tag._id,
                });
            } else {
                return res.sendStatus(400);
            }
        }
    );
};
//Remove subscriber from tag
var _unsubscribeFromTag = function (req, res) {
    Tag.updateOne(
        { _id: req.params._id },
        {
            $pull: { subscribers: req.user.id },
            $inc: { "count.subscribers": -1 },
        },
        function (err, numAffected) {
            if (!err) {
                res.sendStatus(200);
            }
        }
    );
};
//Join tag
var _joinTag = function (req, res) {
    Tag.findOne({ _id: req.params._id }, function (err, tag) {
        if (!tag) return res.status(400).send({ error: "No such tag exists" });
        //Get all tag members
        var member_ids = [];
        for (var i = 0; i < tag.members.length; i++) {
            if (tag.members[i].user)
                member_ids.push(tag.members[i].user.toString());
        }
        if (member_ids.indexOf(req.user.id.toString()) > -1) {
            return res.status(400).send({ error: "Already joined" });
        } else if (req.user.id.toString() == tag.creator) {
            return res
                .status(400)
                .send({ error: "Cannot add creator to members list" });
        } else {
            //Add new member in inactive state
            var new_member = new Member({
                user: req.user.id,
                added_at: new Date(Date.now()),
                permit_val: "inactive",
            });
            //Make user active if admin
            if (req.user.type == "admin") {
                new_member.permit_val = "active";
                new_member.added_by = req.user.id;
                tag.count.members += 1;
            }
            tag.members.push(new_member);
            tag.save(function (err) {
                if (!err) {
                    if (req.user.type == "admin") {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(200);
                        //Save activity
                        saveActivity("join", tag.creator, req.user.id, {
                            tag: tag._id,
                        });
                    }
                }
            });
        }
    });
};
//Unjoin tag
var _unjoinTag = function (req, res) {
    Tag.updateOne(
        { _id: req.params._id },
        {
            $pull: {
                members: {
                    user: mongoose.Types.ObjectId(req.user.id),
                    permit_val: "inactive",
                },
            },
        },
        function (err, numberAffected) {
            if (!err) res.sendStatus(200);
            else return res.sendStatus(400);
        }
    );
};
//Add member
var _addMemberToTag = function (req, res) {
    if (!req.body.email && !req.body.user_id) {
        //Expecting a email id or user_id
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a user_id or user email.",
        });
    } else if (
        req.body.email == req.user.email ||
        req.body.user_id == req.user.id
    ) {
        //Cannot collaborate to current user
        return res.status(400).send({ error: "Cannot add yourself." });
    }
    //Check for folder
    var user_id, user_email;
    async.series(
        [
            function (callback) {
                if (req.body.user_id) {
                    user_id = req.body.user_id;
                    callback();
                } else if (req.body.email) {
                    User.findOne(
                        { email: req.body.email },
                        function (err, user) {
                            if (!user) {
                                user_email = req.body.email;
                                callback();
                            } else {
                                user_id = user._id;
                                callback();
                            }
                        }
                    );
                }
            },
        ],
        function (err) {
            //Find tag
            Tag.findOne(
                {
                    _id: req.params._id,
                    $or: [
                        { creator: req.user.id },
                        {
                            members: {
                                $elemMatch: {
                                    user: mongoose.Types.ObjectId(req.user.id),
                                    permit_val: "moderator",
                                },
                            },
                        },
                    ],
                },
                function (err, tag) {
                    if (!tag)
                        return res.status(400).send({
                            error: "No such tag exists or Unauthorized user.",
                        });
                    if (user_id) {
                        //Remove member from inactive state if present
                        Tag.updateOne(
                            { _id: tag._id },
                            {
                                $pull: {
                                    members: {
                                        user: mongoose.Types.ObjectId(user_id),
                                        permit_val: "inactive",
                                    },
                                },
                            },
                            function (err, numberAffected) {
                                //Get all tag members
                                var member_ids = [];
                                for (var i = 0; i < tag.members.length; i++) {
                                    if (
                                        tag.members[i].user &&
                                        !(
                                            tag.members[i].user == user_id &&
                                            tag.members[i].permit_val ==
                                                "inactive"
                                        )
                                    ) {
                                        member_ids.push(
                                            tag.members[i].user.toString()
                                        );
                                    }
                                }
                                if (
                                    member_ids.indexOf(user_id.toString()) > -1
                                ) {
                                    return res
                                        .status(400)
                                        .send({ error: "Already added." });
                                } else if (user_id.toString() == tag.creator) {
                                    return res.status(400).send({
                                        error: "Cannot add creator to collaborator list",
                                    });
                                } else {
                                    var new_member = new Member({
                                        user: user_id,
                                        added_by: req.user.id,
                                        added_at: new Date(Date.now()),
                                        permit_val: "active",
                                    });
                                    tag.members.push(new_member);
                                    tag.count.members += 1;
                                    tag.save(function (err) {
                                        if (!err) {
                                            new_member.populate(
                                                {
                                                    path: "user",
                                                    select: "name initials username dp job",
                                                },
                                                function (err, member) {
                                                    res.send(member);
                                                    //Save activity
                                                    saveActivity(
                                                        "invited",
                                                        user_id,
                                                        req.user.id,
                                                        { tag: tag._id }
                                                    );
                                                    //Send email
                                                    User.findOne(
                                                        { _id: user_id },
                                                        function (err, user) {
                                                            if (!user.email)
                                                                return;
                                                            var content = {
                                                                email: user.email,
                                                                name: user.name,
                                                                firstName:
                                                                    user.name.split(
                                                                        " "
                                                                    )[0],
                                                                fromName:
                                                                    req.user
                                                                        .name,
                                                                subject:
                                                                    req.user.name.split(
                                                                        " "
                                                                    )[0] +
                                                                    " has added you to a private tag on UNESCO MGIEP's Social",
                                                                title: tag.name,
                                                                redirectURL:
                                                                    tag.slug,
                                                            };
                                                            Email.sendOneMail(
                                                                "invite",
                                                                content,
                                                                function (
                                                                    err,
                                                                    responseStatus
                                                                ) {}
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    });
                                }
                            }
                        );
                    } else if (user_email) {
                        var member_ids = [];
                        for (var i = 0; i < tag.members.length; i++) {
                            if (tag.members[i].email)
                                member_ids.push(tag.members[i].email);
                        }
                        if (member_ids.indexOf(user_email) > -1) {
                            return res
                                .status(400)
                                .send({ error: "Already invited." });
                        } else {
                            //Save member
                            var new_member = new Member({
                                permit_val: "invited",
                                email: user_email,
                                added_by: req.user.id,
                            });
                            tag.members.push(new_member);
                            tag.save(function (err) {
                                res.send(new_member);
                                //Send email
                                var content = {
                                    email: user_email,
                                    fromName: req.user.name,
                                    subject:
                                        req.user.name.split(" ")[0] +
                                        " has invited you to join a private tag on UNESCO MGIEP's Social",
                                    title: tag.name,
                                    redirectURL: tag.slug,
                                };
                                Email.sendOneMail(
                                    "invite_new",
                                    content,
                                    function (err, responseStatus) {}
                                );
                            });
                        }
                    }
                }
            );
        }
    );
};
//Remove member or Leave
var _removeMemberFromTag = function (req, res) {
    if (req.body.email) {
        //Remove invited user
        Tag.updateOne(
            {
                _id: req.params._id,
                $or: [
                    { creator: req.user.id },
                    {
                        members: {
                            $elemMatch: {
                                user: mongoose.Types.ObjectId(req.user.id),
                                permit_val: "moderator",
                            },
                        },
                    },
                ],
            },
            { $pull: { members: { email: req.body.email } } },
            function (err, numAffected) {
                if (!err) res.sendStatus(200);
                else return res.sendStatus(400);
            }
        );
    } else if (req.body.user_id) {
        //Remove user
        Tag.updateOne(
            {
                _id: req.params._id,
                $or: [
                    { creator: req.user.id },
                    {
                        members: {
                            $elemMatch: {
                                user: mongoose.Types.ObjectId(req.user.id),
                                permit_val: "moderator",
                            },
                        },
                    },
                ],
            },
            {
                $pull: {
                    members: {
                        user: mongoose.Types.ObjectId(req.body.user_id),
                    },
                    $inc: { "count.members": -1 },
                },
            },
            function (err, numAffected) {
                if (!err) {
                    res.sendStatus(200);
                } else return res.sendStatus(400);
            }
        );
    } else {
        //Leave
        Tag.updateOne(
            { _id: req.params._id },
            {
                $pull: {
                    members: { user: mongoose.Types.ObjectId(req.user.id) },
                    $inc: { "count.members": -1 },
                },
            },
            function (err, numAffected) {
                if (!err) {
                    res.sendStatus(200);
                } else return res.sendStatus(400);
            }
        );
    }
};
//Activate tag
var _activateTag = function (req, res) {
    Tag.updateOne(
        { _id: req.params._id, creator: req.user.id },
        { $set: { is_active: true } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//Deactivate tag
var _deactivateTag = function (req, res) {
    Tag.updateOne(
        { _id: req.params._id, creator: req.user.id },
        { $set: { is_active: false } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//DELETE Request function
//Delete tag
var _deleteTag = function (req, res) {};
/*---------------- DISCUSSION FUNCTION -------------------------*/
//GET Request functions - Discussion
//Get daily discussions
var _getDailyDiscussions = function (req, res) {
    var page = req.query.page;
    Discussion.find({
        status: "daily",
    })
        .select({
            type: 1,
            slug: 1,
            status: 1,
            title: 1,
            desc: 1,
            summary: 1,
            image: 1,
            bound: 1,
            provider: 1,
            media_type: 1,
            file: 1,
            polls: 1,
            has_voted: 1,
            tags: 1,
            creator: 1,
            created_at: 1,
            updated_at: 1,
            badge: 1,
            reactions: 1,
            is_pinned: 1,
            count: 1,
            comments: { $elemMatch: { is_recent: true } },
        })
        .populate("creator", "name initials username dp job", "User")
        .populate("tags", "name slug desc color", "Tag")
        .populate("badge", "name desc color", "Badge")
        .populate("comments.creator", "name initials username dp job", "User")
        .sort({ updated_at: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec(function (err, discussions) {
            res.send(discussions);
        });
};
//All Discussions sorted by recency
var _getAllDiscussionsByRecency = function (req, res) {
    var page = req.query.page;
    if (req.query.tag) {
        Tag.findOne(
            {
                _id: req.query.tag,
                $or: [
                    { is_public: true },
                    { creator: req.user.id },
                    {
                        is_active: true,
                        members: {
                            $elemMatch: {
                                user: mongoose.Types.ObjectId(req.user.id),
                                permit_val: { $in: ["moderator", "active"] },
                            },
                        },
                    },
                ],
            },
            function (err, tag) {
                if (!tag) return res.send([]);
                //Show all discussions part of this tag
                Discussion.find({
                    status: { $ne: "queued" },
                    tags: tag._id,
                })
                    .select({
                        type: 1,
                        slug: 1,
                        status: 1,
                        title: 1,
                        desc: 1,
                        summary: 1,
                        image: 1,
                        bound: 1,
                        provider: 1,
                        media_type: 1,
                        file: 1,
                        polls: 1,
                        has_voted: 1,
                        tags: 1,
                        creator: 1,
                        created_at: 1,
                        updated_at: 1,
                        badge: 1,
                        reactions: 1,
                        is_pinned: 1,
                        count: 1,
                        comments: { $elemMatch: { is_recent: true } },
                    })
                    .populate(
                        "creator",
                        "name initials username dp job",
                        "User"
                    )
                    .populate("tags", "name slug desc color", "Tag")
                    .populate("badge", "name desc color", "Badge")
                    .populate(
                        "comments.creator",
                        "name initials username dp job",
                        "User"
                    )
                    .sort({ updated_at: -1 })
                    .skip((page - 1) * PAGE_SIZE)
                    .limit(PAGE_SIZE)
                    .exec(function (err, discussions) {
                        res.send(discussions);
                    });
            }
        );
    } else {
        //Find all tags user has access to
        Tag.find(
            {
                is_active: true,
                $or: [
                    { creator: req.user.id },
                    { is_public: true, subscribers: req.user.id },
                    {
                        members: {
                            $elemMatch: {
                                user: mongoose.Types.ObjectId(req.user.id),
                                permit_val: { $in: ["moderator", "active"] },
                            },
                        },
                    },
                ],
            },
            function (err, tags) {
                //Get tag_ids
                var tag_ids = [];
                if (tags && tags.length) {
                    for (var i = 0; i < tags.length; i++) {
                        tag_ids.push(tags[i]._id);
                    }
                }
                //Show all discussions part of these tags or no tags
                Discussion.find({
                    $or: [
                        { status: { $in: ["featured", "daily"] } },
                        { status: "other", tags: { $in: tag_ids } },
                        { status: "other", tags: { $exists: true, $size: 0 } },
                    ],
                })
                    .select({
                        type: 1,
                        slug: 1,
                        status: 1,
                        title: 1,
                        desc: 1,
                        summary: 1,
                        image: 1,
                        bound: 1,
                        provider: 1,
                        media_type: 1,
                        file: 1,
                        polls: 1,
                        has_voted: 1,
                        tags: 1,
                        creator: 1,
                        created_at: 1,
                        updated_at: 1,
                        badge: 1,
                        reactions: 1,
                        is_pinned: 1,
                        count: 1,
                        comments: { $elemMatch: { is_recent: true } },
                    })
                    .populate(
                        "creator",
                        "name initials username dp job",
                        "User"
                    )
                    .populate("tags", "name slug desc color", "Tag")
                    .populate("badge", "name desc color", "Badge")
                    .populate(
                        "comments.creator",
                        "name initials username dp job",
                        "User"
                    )
                    .sort({ updated_at: -1 })
                    .skip((page - 1) * PAGE_SIZE)
                    .limit(PAGE_SIZE)
                    .exec(function (err, discussions) {
                        res.send(discussions);
                    });
            }
        );
    }
};
//Discussions sorted by comment count
var _getAllDiscussionsByTop = function (req, res) {
    var page = req.query.page;
    if (req.query.tag) {
        Tag.findOne(
            {
                _id: req.query.tag,
                $or: [
                    { is_public: true },
                    { creator: req.user.id },
                    { is_active: true, subscribers: req.user.id },
                    {
                        is_active: true,
                        members: {
                            $elemMatch: {
                                user: mongoose.Types.ObjectId(req.user.id),
                                permit_val: { $in: ["moderator", "active"] },
                            },
                        },
                    },
                ],
            },
            function (err, tag) {
                if (!tag) return res.send([]);
                //Show all discussions part of this tag
                Discussion.find({
                    status: { $ne: "queued" },
                    tags: tag._id,
                })
                    .select({
                        type: 1,
                        slug: 1,
                        status: 1,
                        title: 1,
                        desc: 1,
                        summary: 1,
                        image: 1,
                        bound: 1,
                        provider: 1,
                        media_type: 1,
                        file: 1,
                        polls: 1,
                        has_voted: 1,
                        tags: 1,
                        creator: 1,
                        created_at: 1,
                        updated_at: 1,
                        badge: 1,
                        reactions: 1,
                        is_pinned: 1,
                        count: 1,
                        comments: { $elemMatch: { is_recent: true } },
                    })
                    .populate(
                        "creator",
                        "name initials username dp job",
                        "User"
                    )
                    .populate("tags", "name slug desc color", "Tag")
                    .populate("badge", "name desc color", "Badge")
                    .populate(
                        "comments.creator",
                        "name initials username dp job",
                        "User"
                    )
                    .sort({ count: -1 })
                    .skip((page - 1) * PAGE_SIZE)
                    .limit(PAGE_SIZE)
                    .exec(function (err, discussions) {
                        res.send(discussions);
                    });
            }
        );
    } else {
        //Find all tags user has access to
        Tag.find(
            {
                is_active: true,
                $or: [
                    { is_public: true },
                    { creator: req.user.id },
                    {
                        members: {
                            $elemMatch: {
                                user: mongoose.Types.ObjectId(req.user.id),
                                permit_val: { $in: ["moderator", "active"] },
                            },
                        },
                    },
                ],
            },
            function (err, tags) {
                //Get tag_ids
                var tag_ids = [];
                if (tags && tags.length) {
                    for (var i = 0; i < tags.length; i++) {
                        tag_ids.push(tags[i]._id);
                    }
                }
                //Show all discussions part of these tags or no tags
                Discussion.find({
                    $or: [
                        { status: { $in: ["featured", "daily"] } },
                        { status: "other", tags: { $in: tag_ids } },
                        { status: "other", tags: { $exists: true, $size: 0 } },
                    ],
                })
                    .select({
                        type: 1,
                        slug: 1,
                        status: 1,
                        title: 1,
                        desc: 1,
                        summary: 1,
                        image: 1,
                        bound: 1,
                        provider: 1,
                        media_type: 1,
                        file: 1,
                        polls: 1,
                        has_voted: 1,
                        tags: 1,
                        creator: 1,
                        created_at: 1,
                        updated_at: 1,
                        badge: 1,
                        reactions: 1,
                        is_pinned: 1,
                        count: 1,
                        comments: { $elemMatch: { is_recent: true } },
                    })
                    .populate(
                        "creator",
                        "name initials username dp job",
                        "User"
                    )
                    .populate("tags", "name slug desc color", "Tag")
                    .populate("badge", "name desc color", "Badge")
                    .populate(
                        "comments.creator",
                        "name initials username dp job",
                        "User"
                    )
                    .sort({ count: -1 })
                    .skip((page - 1) * PAGE_SIZE)
                    .limit(PAGE_SIZE)
                    .exec(function (err, discussions) {
                        res.send(discussions);
                    });
            }
        );
    }
};
//Get queued discussions
var _getQueuedDiscussions = function (req, res) {
    var page = req.query.page;
    if (req.user.type == "admin") {
        Discussion.find({
            status: "queued",
        })
            .select({
                type: 1,
                slug: 1,
                status: 1,
                title: 1,
                desc: 1,
                summary: 1,
                image: 1,
                bound: 1,
                provider: 1,
                media_type: 1,
                file: 1,
                polls: 1,
                has_voted: 1,
                tags: 1,
                creator: 1,
                created_at: 1,
                updated_at: 1,
                badge: 1,
                reactions: 1,
                is_pinned: 1,
                count: 1,
                comments: { $elemMatch: { is_recent: true } },
            })
            .populate("creator", "name initials username dp job", "User")
            .populate("tags", "name slug desc color", "Tag")
            .populate("badge", "name desc color", "Badge")
            .populate(
                "comments.creator",
                "name initials username dp job",
                "User"
            )
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, discussions) {
                res.send(discussions);
            });
    } else {
        Discussion.find({
            creator: req.user.id,
            status: "queued",
        })
            .select({
                type: 1,
                slug: 1,
                status: 1,
                title: 1,
                desc: 1,
                summary: 1,
                image: 1,
                bound: 1,
                provider: 1,
                media_type: 1,
                file: 1,
                polls: 1,
                has_voted: 1,
                tags: 1,
                creator: 1,
                created_at: 1,
                updated_at: 1,
                badge: 1,
                reactions: 1,
                is_pinned: 1,
                count: 1,
                comments: { $elemMatch: { is_recent: true } },
            })
            .populate("creator", "name initials username dp job", "User")
            .populate("tags", "name slug desc color", "Tag")
            .populate("badge", "name desc color", "Badge")
            .populate(
                "comments.creator",
                "name initials username dp job",
                "User"
            )
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, discussions) {
                res.send(discussions);
            });
    }
};
//Get reacted discussions
var _getReactedDiscussions = function (req, res) {};
//Get my discussions
var _getMyDiscussions = function (req, res) {
    var page = req.query.page;
    if (req.query.tag) {
        Tag.findOne(
            {
                _id: req.query.tag,
                $or: [
                    { is_public: true },
                    { creator: req.user.id },
                    { is_active: true, subscribers: req.user.id },
                    {
                        is_active: true,
                        members: {
                            $elemMatch: {
                                user: mongoose.Types.ObjectId(req.user.id),
                                permit_val: { $in: ["moderator", "active"] },
                            },
                        },
                    },
                ],
            },
            function (err, tag) {
                if (!tag) return res.send([]);
                //Show all discussions part of this tag
                Discussion.find({
                    status: { $ne: "queued" },
                    creator: req.user.id,
                    tags: tag._id,
                })
                    .select({
                        type: 1,
                        slug: 1,
                        title: 1,
                        desc: 1,
                        summary: 1,
                        image: 1,
                        bound: 1,
                        provider: 1,
                        media_type: 1,
                        file: 1,
                        polls: 1,
                        has_voted: 1,
                        tags: 1,
                        creator: 1,
                        created_at: 1,
                        updated_at: 1,
                        badge: 1,
                        reactions: 1,
                        is_pinned: 1,
                        count: 1,
                        comments: { $elemMatch: { is_recent: true } },
                    })
                    .populate(
                        "creator",
                        "name initials username dp job",
                        "User"
                    )
                    .populate("tags", "name slug desc color", "Tag")
                    .populate("badge", "name desc color", "Badge")
                    .populate(
                        "comments.creator",
                        "name initials username dp job",
                        "User"
                    )
                    .sort({ updated_at: -1 })
                    .skip((page - 1) * PAGE_SIZE)
                    .limit(PAGE_SIZE)
                    .exec(function (err, discussions) {
                        res.send(discussions);
                    });
            }
        );
    } else {
        Discussion.find({
            status: { $ne: "queued" },
            creator: req.user.id,
        })
            .select({
                type: 1,
                slug: 1,
                title: 1,
                desc: 1,
                summary: 1,
                image: 1,
                bound: 1,
                provider: 1,
                media_type: 1,
                file: 1,
                polls: 1,
                has_voted: 1,
                tags: 1,
                creator: 1,
                created_at: 1,
                updated_at: 1,
                badge: 1,
                reactions: 1,
                is_pinned: 1,
                count: 1,
                comments: { $elemMatch: { is_recent: true } },
            })
            .populate("creator", "name initials username dp job", "User")
            .populate("tags", "name slug desc color", "Tag")
            .populate("badge", "name desc color", "Badge")
            .populate(
                "comments.creator",
                "name initials username dp job",
                "User"
            )
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, discussions) {
                res.send(discussions);
            });
    }
};
//Get user discussions
var _getUserDiscussions = function (req, res) {
    if (!req.query.user)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a valid user id",
        });
    var page = req.query.page;
    //Find all tags user has access to
    Tag.find(
        {
            is_active: true,
            $or: [
                { is_public: true },
                { creator: req.user.id },
                {
                    members: {
                        $elemMatch: {
                            user: mongoose.Types.ObjectId(req.user.id),
                            permit_val: { $in: ["moderator", "active"] },
                        },
                    },
                },
            ],
        },
        function (err, tags) {
            //Get tag_ids
            var tag_ids = [];
            if (tags && tags.length) {
                for (var i = 0; i < tags.length; i++) {
                    tag_ids.push(tags[i]._id);
                }
            }
            //Show all discussions part of these tags or no tags, created by user
            Discussion.find({
                creator: req.query.user,
                $or: [
                    { status: { $in: ["featured", "daily"] } },
                    { tags: { $in: tag_ids } },
                    { tags: { $exists: true, $size: 0 } },
                ],
            })
                .select({
                    type: 1,
                    slug: 1,
                    status: 1,
                    title: 1,
                    desc: 1,
                    summary: 1,
                    image: 1,
                    bound: 1,
                    provider: 1,
                    media_type: 1,
                    file: 1,
                    polls: 1,
                    has_voted: 1,
                    tags: 1,
                    creator: 1,
                    created_at: 1,
                    updated_at: 1,
                    badge: 1,
                    reactions: 1,
                    is_pinned: 1,
                    count: 1,
                    comments: { $elemMatch: { is_recent: true } },
                })
                .populate("creator", "name initials username dp job", "User")
                .populate("tags", "name slug desc color", "Tag")
                .populate(
                    "comments.creator",
                    "name initials username dp job",
                    "User"
                )
                .sort({ updated_at: -1 })
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE)
                .exec(function (err, discussions) {
                    res.send(discussions);
                });
        }
    );
};
//Get featured discussion
var _getFeaturedDiscussion = function (req, res) {
    Discussion.findOne({
        status: "featured",
    })
        .populate("creator", "name initials username dp job", "User")
        .populate("tags", "name slug desc color", "Tag")
        .populate("badge", "name desc color", "Badge")
        .populate("moderators", "name initials username dp job", "User")
        .populate("comments.creator", "name initials username dp job", "User")
        .exec(function (err, discussion) {
            if (!discussion) return res.sendStatus(404);
            res.send(discussion);
        });
};
//Get one discussion
var _getDiscussionByIdOrSlug = function (req, res) {
    //Find all tags user has access to
    Tag.find(
        {
            is_active: true,
            $or: [
                { is_public: true },
                { creator: req.user.id },
                {
                    members: {
                        $elemMatch: {
                            user: mongoose.Types.ObjectId(req.user.id),
                            permit_val: { $in: ["moderator", "active"] },
                        },
                    },
                },
            ],
        },
        function (err, tags) {
            //Get tag_ids
            var tag_ids = [];
            if (tags && tags.length) {
                for (var i = 0; i < tags.length; i++) {
                    tag_ids.push(tags[i]._id);
                }
            }
            //Match if object id or not
            if (req.params._id.match(/^[0-9a-fA-F]{24}$/)) {
                var query = {
                    _id: req.params._id,
                    $or: [
                        { status: { $in: ["featured", "daily"] } },
                        { tags: { $in: tag_ids } },
                        { tags: { $exists: true, $size: 0 } },
                    ],
                };
            } else {
                var query = {
                    slug: req.params._id,
                    $or: [
                        { status: { $in: ["featured", "daily"] } },
                        { tags: { $in: tag_ids } },
                        { tags: { $exists: true, $size: 0 } },
                    ],
                };
            }
            //Show discussion part of these tags or no tags
            Discussion.findOne(query)
                .populate("creator", "name initials username dp job", "User")
                .populate("tags", "name slug desc color", "Tag")
                .populate("badge", "name desc color", "Badge")
                .populate("moderators", "name initials username dp job", "User")
                .populate(
                    "comments.creator",
                    "name initials username dp job",
                    "User"
                )
                .exec(function (err, discussion) {
                    if (!discussion) return res.sendStatus(404);
                    res.send(discussion);
                });
        }
    );
};
//POST Requests function
//Create text discussion
var _createTextDiscussion = function (req, res) {
    if (!req.body.title || !req.body.desc) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a title and a desc",
        });
    }
    var new_discussion;
    var key = shortid.generate();
    var slug = key + "-" + getSlug(req.body.title);
    async.series(
        [
            function (callback) {
                //Create new discussion
                new_discussion = new Discussion({
                    slug: slug,
                    type: "text",
                    title: req.body.title,
                    desc: req.body.desc,
                    "image.m": req.body.image,
                    "image.l": req.body.image,
                    bound: req.body.bound,
                    images: req.body.images,
                    creator: req.user.id,
                    updated_at: new Date(Date.now()),
                });
                //Update summary
                if (req.body.summary) {
                    new_discussion.summary = req.body.summary;
                } else {
                    new_discussion.summary = Utility.get_text_summary(
                        new_discussion.desc
                    );
                }
                //Add status
                if (req.body.status == "queued") {
                    new_discussion.status = "queued";
                } else {
                    new_discussion.status = "other";
                }
                //Check tags
                if (req.body.tags) {
                    Tag.find({
                        _id: { $in: req.body.tags },
                        is_active: true,
                        $or: [
                            { is_public: true },
                            { creator: req.user.id },
                            {
                                members: {
                                    $elemMatch: {
                                        user: mongoose.Types.ObjectId(
                                            req.user.id
                                        ),
                                        permit_val: {
                                            $in: ["moderator", "active"],
                                        },
                                    },
                                },
                            },
                        ],
                    }).exec(function (err, tags) {
                        if (!tags || !tags.length) callback();
                        else {
                            var tag_ids = [];
                            for (var i = 0; i < tags.length; i++) {
                                tag_ids.push(tags[i]._id);
                            }
                            new_discussion.tags = tag_ids;
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            },
        ],
        function (err) {
            //Save text discussion
            new_discussion.save(function (err) {
                if (!err) res.send(new_discussion);
                //Increase karma point of discussion creator
                User.updateOne(
                    { _id: req.user.id },
                    { $inc: { karma: 5 } }
                ).exec();
                //Update image
                if (req.body.image) {
                    var image = req.body.image.replace(
                        /^https:\/\//i,
                        "http://"
                    );
                    var m_file_name = "m-" + slug;
                    //Update image (medium size)
                    Utility.get_resized_image(
                        m_file_name,
                        image,
                        270,
                        function (resized) {
                            Utility.upload_file(
                                resized,
                                m_file_name,
                                function (image_url) {
                                    Discussion.updateOne(
                                        { _id: new_discussion._id },
                                        { $set: { "image.m": image_url } }
                                    ).exec();
                                }
                            );
                        }
                    );
                }
            });
        }
    );
};
//Create link discussion
var _createLinkDiscussion = function (req, res) {
    if ((!req.body.url || !validator.isURL(req.body.url)) && !req.body.linkdata)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a valid url or link data",
        });
    var linkdata, new_discussion, media_type;
    //Slug
    var key = shortid.generate();
    var slug;
    async.series(
        [
            //Get link metadata
            function (callback) {
                if (req.body.linkdata) {
                    linkdata = req.body.linkdata;
                    callback();
                } else {
                    Utility.get_link_metadata(req.body.url, function (data) {
                        linkdata = data;
                        //Get image
                        var images = data.images;
                        var imageURL;
                        if (images && images.length) {
                            for (var i = 0; i < images.length; i++) {
                                if (
                                    images[i].width > 200 &&
                                    images[i].height > 100
                                ) {
                                    req.body.image = images[i].url.replace(
                                        /^https:\/\//i,
                                        "http://"
                                    );
                                    //Set bound
                                    var bound =
                                        (images[i].height * 270) /
                                        images[i].width;
                                    if (bound) {
                                        bound = parseInt(bound);
                                        req.body.bound = bound;
                                    }
                                    break;
                                }
                            }
                        }
                        callback();
                    });
                }
            },
            //Create discussion
            function (callback) {
                //Media type
                var media_type = linkdata.media.type || linkdata.type;
                if (media_type == "video") {
                    var type = "video";
                } else {
                    var type = "link";
                }
                //Slug
                slug = key + "-" + getSlug(linkdata.title || "Untitled link");
                //Create new discussion
                new_discussion = new Discussion({
                    slug: slug,
                    type: type,
                    title: linkdata.title || linkdata.url,
                    desc: req.body.desc,
                    summary: linkdata.description || req.body.summary,
                    "provider.name": linkdata.provider_name,
                    "provider.url": linkdata.url,
                    "provider.favicon": linkdata.favicon_url,
                    embed: linkdata.media.html,
                    publish_date: linkdata.published,
                    "image.m": req.body.image,
                    "image.l": req.body.image,
                    bound: req.body.bound,
                    creator: req.user.id,
                    updated_at: new Date(Date.now()),
                });
                //Add status
                if (req.body.status == "queued") {
                    new_discussion.status = "queued";
                } else {
                    new_discussion.status = "other";
                }
                //Check tags
                if (req.body.tags) {
                    Tag.find({
                        _id: { $in: req.body.tags },
                        is_active: true,
                        $or: [
                            { is_public: true },
                            { creator: req.user.id },
                            {
                                members: {
                                    $elemMatch: {
                                        user: mongoose.Types.ObjectId(
                                            req.user.id
                                        ),
                                        permit_val: {
                                            $in: ["moderator", "active"],
                                        },
                                    },
                                },
                            },
                        ],
                    }).exec(function (err, tags) {
                        if (!tags || !tags.length) callback();
                        else {
                            var tag_ids = [];
                            for (var i = 0; i < tags.length; i++) {
                                tag_ids.push(tags[i]._id);
                            }
                            new_discussion.tags = tag_ids;
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            },
        ],
        function (err) {
            //Save link discussion
            new_discussion.save(function (err) {
                if (!err) res.send(new_discussion);
                //Increase karma point of discussion creator
                User.updateOne(
                    { _id: req.user.id },
                    { $inc: { karma: 5 } }
                ).exec();
                //Update image
                if (req.body.image) {
                    var image = req.body.image.replace(
                        /^https:\/\//i,
                        "http://"
                    );
                    var file_name = slug;
                    var m_file_name = "m-" + file_name;
                    //Download and update original file
                    Utility.download_file(image, file_name, function (file) {
                        Utility.upload_file(
                            file,
                            file_name,
                            function (image_url) {
                                Discussion.updateOne(
                                    { _id: new_discussion._id },
                                    { $set: { "image.l": image_url } }
                                ).exec();
                            }
                        );
                    });
                    //Update image (medium size)
                    Utility.get_resized_image(
                        m_file_name,
                        image,
                        270,
                        function (resized) {
                            Utility.upload_file(
                                resized,
                                m_file_name,
                                function (image_url) {
                                    Discussion.updateOne(
                                        { _id: new_discussion._id },
                                        { $set: { "image.m": image_url } }
                                    ).exec();
                                }
                            );
                        }
                    );
                }
            });
        }
    );
};
//Create file discussion
var _createFileDiscussion = function (req, res) {
    if (!req.body.provider.url)
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting an url." });
    var new_discussion;
    var key = shortid.generate();
    //Type of media
    var type = req.body.type;
    var slug = key + "-" + getSlug(req.body.title || "Untitled " + type);
    async.series(
        [
            function (callback) {
                //Create new discussion
                new_discussion = new Discussion({
                    slug: slug,
                    type: type,
                    title: req.body.title,
                    desc: req.body.desc,
                    provider: req.body.provider,
                    "image.m": req.body.image,
                    "image.l": req.body.image,
                    bound: req.body.bound,
                    file: req.body.file,
                    creator: req.user.id,
                    updated_at: new Date(Date.now()),
                });
                //Add status
                if (req.body.status == "queued") {
                    new_discussion.status = "queued";
                } else {
                    new_discussion.status = "other";
                }
                //Check tags
                if (req.body.tags) {
                    Tag.find({
                        _id: { $in: req.body.tags },
                        is_active: true,
                        $or: [
                            { is_public: true },
                            { creator: req.user.id },
                            {
                                members: {
                                    $elemMatch: {
                                        user: mongoose.Types.ObjectId(
                                            req.user.id
                                        ),
                                        permit_val: {
                                            $in: ["moderator", "active"],
                                        },
                                    },
                                },
                            },
                        ],
                    }).exec(function (err, tags) {
                        if (!tags || !tags.length) callback();
                        else {
                            var tag_ids = [];
                            for (var i = 0; i < tags.length; i++) {
                                tag_ids.push(tags[i]._id);
                            }
                            new_discussion.tags = tag_ids;
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            },
        ],
        function (err) {
            new_discussion.save(function (err) {
                if (!err) res.send(new_discussion);
                //Increase karma point of discussion creator
                User.updateOne(
                    { _id: req.user.id },
                    { $inc: { karma: 5 } }
                ).exec();
                //Resize image
                if (req.body.image) {
                    var file_name = slug;
                    if (req.body.provider.name == "MGIEP") {
                        var image = req.body.image.replace(
                            /^https:\/\//i,
                            "http://"
                        );
                        //Resize and upload image
                        Utility.get_resized_image(
                            file_name,
                            image,
                            270,
                            function (resized) {
                                Utility.upload_file(
                                    resized,
                                    file_name,
                                    function (image_url) {
                                        Discussion.updateOne(
                                            { _id: new_discussion._id },
                                            { $set: { "image.m": image_url } }
                                        ).exec();
                                    }
                                );
                            }
                        );
                    } else {
                        //Download and upload image
                        Utility.download_file(
                            req.body.image,
                            file_name,
                            function (file) {
                                Utility.upload_file(
                                    file,
                                    file_name,
                                    function (image_url) {
                                        Discussion.updateOne(
                                            { _id: new_discussion._id },
                                            { $set: { "image.m": image_url } }
                                        ).exec();
                                    }
                                );
                            }
                        );
                    }
                }
            });
        }
    );
};
//Create poll discussion
var _createPollDiscussion = function (req, res) {
    if (!req.body.title || !req.body.polls || !req.body.polls.length)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a polls array and a discussion title",
        });
    var new_discussion;
    var key = shortid.generate();
    //Type of media
    var type = req.body.type;
    var slug = key + "-" + getSlug(req.body.title || "Untitled " + type);
    async.series(
        [
            function (callback) {
                //Create new discussion
                new_discussion = new Discussion({
                    slug: slug,
                    type: type,
                    title: req.body.title,
                    desc: req.body.desc,
                    "image.m": req.body.image,
                    "image.l": req.body.image,
                    bound: req.body.bound,
                    creator: req.user.id,
                    updated_at: new Date(Date.now()),
                });
                //Add polls
                for (var i = 0; i < req.body.polls.length; i++) {
                    var new_poll = new Poll({
                        text: req.body.polls[i],
                        order: i,
                    });
                    new_discussion.polls.push(new_poll);
                }
                //Add status
                if (req.body.status == "queued") {
                    new_discussion.status = "queued";
                } else {
                    new_discussion.status = "other";
                }
                //Check tags
                if (req.body.tags) {
                    Tag.find({
                        _id: { $in: req.body.tags },
                        is_active: true,
                        $or: [
                            { is_public: true },
                            { creator: req.user.id },
                            {
                                members: {
                                    $elemMatch: {
                                        user: mongoose.Types.ObjectId(
                                            req.user.id
                                        ),
                                        permit_val: {
                                            $in: ["moderator", "active"],
                                        },
                                    },
                                },
                            },
                        ],
                    }).exec(function (err, tags) {
                        if (!tags || !tags.length) callback();
                        else {
                            var tag_ids = [];
                            for (var i = 0; i < tags.length; i++) {
                                tag_ids.push(tags[i]._id);
                            }
                            new_discussion.tags = tag_ids;
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            },
        ],
        function (err) {
            new_discussion.save(function (err) {
                if (!err) res.send(new_discussion);
                //Increase karma point of discussion creator
                User.updateOne(
                    { _id: req.user.id },
                    { $inc: { karma: 5 } }
                ).exec();
                //Update image
                if (req.body.image) {
                    var image = req.body.image.replace(
                        /^https:\/\//i,
                        "http://"
                    );
                    var m_file_name = "m-" + slug;
                    //Update image (medium size)
                    Utility.get_resized_image(
                        m_file_name,
                        image,
                        270,
                        function (resized) {
                            Utility.upload_file(
                                resized,
                                m_file_name,
                                function (image_url) {
                                    Discussion.updateOne(
                                        { _id: new_discussion._id },
                                        { $set: { "image.m": image_url } }
                                    ).exec();
                                }
                            );
                        }
                    );
                }
            });
        }
    );
};
//PUT Requests function
//Edit basic details of discussion like title, text etc
var _editDiscussion = function (req, res) {
    Discussion.findOne(
        { _id: req.params._id, creator: req.user.id },
        function (err, discussion) {
            if (!discussion) return res.sendStatus(404);
            if (
                req.body.title == null &&
                req.body.desc == null &&
                req.body.summary == null &&
                req.body.image == null
            ) {
                return res.status(400).send({
                    error: "Invalid parameters. We are expecting a title, summary, image or desc.",
                });
            } else {
                if (req.body.title != null) {
                    discussion.title = req.body.title;
                }
                if (discussion.type == "text" || discussion.type == "poll") {
                    if (req.body.desc != null) {
                        discussion.desc = req.body.desc;
                        if (req.body.desc) {
                            discussion.summary = Utility.get_text_summary(
                                discussion.desc
                            );
                            //Update images
                            if (req.body.images) {
                                discussion.images = _.union(
                                    discussion.images,
                                    req.body.images
                                );
                            }
                            //Update image
                            if (
                                req.body.image &&
                                (!discussion.image ||
                                    (discussion.image &&
                                        discussion.image.l != req.body.image))
                            ) {
                                //Add previous thumbnail in images
                                if (discussion.image.m)
                                    discussion.images.push(discussion.image.m);
                                //Update image
                                discussion.image.l = req.body.image;
                                discussion.image.m = req.body.image;
                                if (req.body.bound)
                                    discussion.bound = req.body.bound;
                            } else {
                                req.body.image = "";
                            }
                        } else {
                            discussion.summary = null;
                        }
                    }
                } else {
                    if (req.body.summary != null) {
                        discussion.summary = req.body.summary;
                    }
                }
                discussion.updated_at = new Date(Date.now());
            }
            //Save
            discussion.save(function (err) {
                if (!err) {
                    res.status(200).send(discussion);
                    //Update image
                    if (
                        req.body.image &&
                        (discussion.type == "text" || discussion.type == "poll")
                    ) {
                        var image = req.body.image.replace(
                            /^https:\/\//i,
                            "http://"
                        );
                        var m_file_name = "m-" + discussion.slug;
                        //Update image (medium size)
                        Utility.get_resized_image(
                            m_file_name,
                            image,
                            270,
                            function (resized) {
                                Utility.upload_file(
                                    resized,
                                    m_file_name,
                                    function (image_url) {
                                        Discussion.updateOne(
                                            { _id: discussion._id },
                                            { $set: { "image.m": image_url } }
                                        ).exec();
                                    }
                                );
                            }
                        );
                    }
                } else res.sendStatus(400);
            });
        }
    );
};
//Edit poll
var _editPoll = function (req, res) {
    Discussion.findOne(
        { _id: req.params._id, type: "poll" },
        function (err, discussion) {
            if (!discussion)
                return res
                    .status(400)
                    .send({ error: "No such discussion exists" });
            var polls = discussion.polls;
            //Position variable gives us the location where user wants to update a poll.
            var position = parseInt(req.body.position);
            var ids = [];
            //Create new poll
            if (req.body.poll) {
                for (var i = 0; i < polls.length; i++) {
                    ids.push(polls[i]._id.toString());
                }
                var new_poll = new Poll({
                    text: req.body.poll,
                    order: polls.length,
                });
            }
            switch (position) {
                //1: Append
                case 1:
                    Discussion.updateOne(
                        { _id: req.params._id, creator: req.user.id },
                        { $push: { polls: new_poll } },
                        function (err, numAffected) {
                            if (!err) res.sendStatus(200);
                        }
                    );
                    break;
                //2: Prepend
                case 2:
                    Discussion.updateOne(
                        { _id: req.params._id, creator: req.user.id },
                        {
                            $push: {
                                polls: { $each: [new_poll], $position: 0 },
                            },
                        },
                        function (err, numAffected) {
                            if (!err) res.sendStatus(200);
                        }
                    );
                    break;
                //3: After poll
                case 3:
                    var poll_order = ids.indexOf(req.body.ref_id);
                    if (poll_order > -1) {
                        Discussion.updateOne(
                            { _id: req.params._id, creator: req.user.id },
                            {
                                $push: {
                                    polls: {
                                        $each: [new_poll],
                                        $position: poll_order + 1,
                                    },
                                },
                            },
                            function (err, numAffected) {
                                if (!err) res.sendStatus(200);
                            }
                        );
                    }
                    break;
                //4: Before poll
                case 4:
                    var poll_order = ids.indexOf(req.body.ref_id);
                    if (poll_order > -1) {
                        Discussion.updateOne(
                            { _id: req.params._id, creator: req.user.id },
                            {
                                $push: {
                                    polls: {
                                        $each: [new_poll],
                                        $position: poll_order,
                                    },
                                },
                            },
                            function (err, numAffected) {
                                if (!err) res.sendStatus(200);
                            }
                        );
                    }
                    break;
                //5: Edit text of poll
                case 5:
                    if (req.body.text != null) {
                        Discussion.updateOne(
                            {
                                _id: req.params._id,
                                creator: req.user.id,
                                "polls._id": req.body.ref_id,
                            },
                            { $set: { "polls.$.text": req.body.text } },
                            function (err, numAffected) {
                                if (!err) res.sendStatus(200);
                            }
                        );
                    }
                    break;
                //6: Add vote to poll
                case 6:
                    //Remove all previous votes
                    Discussion.updateOne(
                        { _id: req.params._id, "polls.voters": req.user.id },
                        { $pull: { "polls.$.voters": req.user.id } },
                        function (err, numAffected) {
                            //Add new vote
                            Discussion.updateOne(
                                {
                                    _id: req.params._id,
                                    "polls._id": req.body.ref_id,
                                },
                                {
                                    $addToSet: {
                                        "polls.$.voters": req.user.id,
                                    },
                                },
                                function (err, numAffected) {
                                    if (!err) {
                                        res.sendStatus(200);
                                        //Save activity
                                        var poll_text;
                                        for (var i = 0; i < polls.length; i++) {
                                            if (
                                                polls[i]._id.toString() ==
                                                req.body.ref_id
                                            ) {
                                                poll_text = polls[i].text;
                                                break;
                                            }
                                        }
                                        if (
                                            discussion.creator.toString() !=
                                            req.user.id.toString()
                                        ) {
                                            saveActivity(
                                                "voted",
                                                discussion.creator,
                                                req.user.id,
                                                { discussion: discussion._id },
                                                { text: poll_text }
                                            );
                                        }
                                    }
                                }
                            );
                        }
                    );
                    break;
                //7: Remove vote from poll
                case 7:
                    Discussion.updateOne(
                        { _id: req.params._id, "polls._id": req.body.ref_id },
                        { $pull: { "polls.$.voters": req.user.id } },
                        function (err, numAffected) {
                            if (!err) res.sendStatus(200);
                        }
                    );
                    break;
                //8: Delete poll
                case 8:
                    Discussion.updateOne(
                        { _id: req.params._id, creator: req.user.id },
                        { $pull: { polls: { _id: req.body.ref_id } } },
                        function (err, numAffected) {
                            if (!err) res.sendStatus(200);
                        }
                    );
                    break;
            }
        }
    );
};
//Feature discussion from queue or other. Remove previously featured to daily
var _featureDiscussion = function (req, res) {
    //Check if admin
    if (req.user.type != "admin") {
        return res
            .status(400)
            .send({ error: "Unauthorized user. Cannot feature discussion." });
    }
    //Remove previously featured to daily
    Discussion.updateMany(
        { status: "featured" },
        { $set: { status: "daily" } },
        function (err, numAffected) {
            Discussion.updateOne(
                { _id: req.params._id },
                {
                    $set: {
                        status: "featured",
                        updated_at: new Date(Date.now()),
                    },
                },
                function (err, numAffected) {
                    res.sendStatus(200);
                }
            );
        }
    );
};
//Pin discussion
var _pinDiscussion = function (req, res) {};
//Unpin discussion
var _unPinDiscussion = function (req, res) {};
//Add moderator to discussion
var _addModeratorToDiscussion = function (req, res) {
    if (!req.body.user_id)
        return res
            .status(400)
            .send({ error: "Invalid parameters. We are expecting a user id." });
    //Find user
    User.findOne({ _id: req.body.user_id })
        .select("name initials username dp job")
        .exec(function (err, user) {
            if (!user) return res.sendStatus(404);
            //Check if admin
            if (req.user.type == "admin") {
                Discussion.updateOne(
                    { _id: req.params._id },
                    { $addToSet: { moderators: user._id } },
                    function (err, numAffected) {
                        if (!err) {
                            res.send(user);
                        }
                    }
                );
            } else {
                Discussion.updateOne(
                    { _id: req.params._id, creator: req.user.id },
                    { $addToSet: { moderators: user._id } },
                    function (err, numAffected) {
                        if (!err) {
                            res.send(user);
                        }
                    }
                );
            }
        });
};
//Remove moderator from discussion
var _removeModeratorFromDiscussion = function (req, res) {
    //Check if admin
    if (req.user.type == "admin") {
        Discussion.updateOne(
            { _id: req.params._id },
            { $pull: { moderators: req.body.user_id } },
            function (err, numAffected) {
                if (!err) {
                    res.sendStatus(200);
                }
            }
        );
    } else {
        Discussion.updateOne(
            { _id: req.params._id, creator: req.user.id },
            { $pull: { moderators: req.body.user_id } },
            function (err, numAffected) {
                if (!err) {
                    res.sendStatus(200);
                }
            }
        );
    }
};
//Add badge to discussion
var _addBadgeToDiscussion = function (req, res) {
    if (!req.body.badge)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a badge id.",
        });
    Discussion.findOne(
        { _id: req.params._id, creator: req.user.id },
        function (err, discussion) {
            if (!discussion) return res.sendStatus(404);
            Badge.findOne({ _id: req.body.badge }, function (err, badge) {
                if (!badge) return res.sendStatus(404);
                //Check if badge already present
                if (discussion.badge && discussion.badge != req.body.badge)
                    var prev_badge = discussion.badge;
                //Update discussion
                discussion.badge = badge._id;
                discussion.updated_at = new Date(Date.now());
                //Update badge
                badge.count += 1;
                badge.updated_at = new Date(Date.now());
                //Save discussion
                discussion.save(function (err) {
                    //Save badge
                    badge.save(function (err) {
                        if (prev_badge) {
                            //Update previous badge count
                            Badge.updateOne(
                                { _id: prev_badge },
                                { $inc: { count: -1 } },
                                function (err, numAffected) {
                                    res.send(badge);
                                }
                            );
                        } else {
                            res.send(badge);
                        }
                    });
                });
            });
        }
    );
};
//Remove badge from discussion
var _removeBadgeFromDiscussion = function (req, res) {
    if (!req.body.badge)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a badge id.",
        });
    Discussion.updateOne(
        { _id: req.params._id, badge: req.body.badge },
        { $unset: { badge: 1 } },
        function (err, numAffected) {
            if (!err) {
                //Update badge count
                Badge.updateOne(
                    { _id: req.body.badge },
                    { $inc: { count: -1 } },
                    function (err, numAffected) {
                        res.sendStatus(200);
                    }
                );
            } else {
                res.sendStatus(400);
            }
        }
    );
};
//Add user reaction
var _addReactionToDiscussion = function (req, res) {
    if (!req.body.reaction) {
        return res.status(400).send({
            error: "Invalid parameters. We were expecting a reaction id.",
        });
    }
    //Find all tags user has access to
    Tag.find(
        {
            is_active: true,
            $or: [
                { is_public: true },
                { creator: req.user.id },
                {
                    members: {
                        $elemMatch: {
                            user: mongoose.Types.ObjectId(req.user.id),
                            permit_val: { $in: ["moderator", "active"] },
                        },
                    },
                },
            ],
        },
        function (err, tags) {
            //Get tag_ids
            var tag_ids = [];
            if (tags && tags.length) {
                for (var i = 0; i < tags.length; i++) {
                    tag_ids.push(tags[i]._id);
                }
            }
            //Get discussion
            Discussion.findOne({
                _id: req.params._id,
                $or: [
                    { status: { $in: ["featured", "daily"] } },
                    { tags: { $in: tag_ids } },
                    { tags: { $exists: true, $size: 0 } },
                ],
            }).exec(function (err, discussion) {
                if (!discussion)
                    return res
                        .status(400)
                        .send({ error: "No such discussion exists." });
                //Remove previous reaction if any
                Discussion.updateOne(
                    { _id: discussion._id },
                    { $pull: { reactions: { user: req.user.id } } },
                    function (err, numAffected) {
                        //Add new reaction
                        var new_reaction = new UserReaction({
                            reaction: req.body.reaction,
                            user: req.user.id,
                        });
                        //Push
                        discussion.reactions.push(new_reaction);
                        //Save
                        discussion.save(function (err) {
                            res.send(new_reaction);
                        });
                    }
                );
            });
        }
    );
};
//Remove my reaction from discussion
var _removeReactionFromDiscussion = function (req, res) {
    Discussion.updateOne(
        { _id: req.params._id },
        { $pull: { reactions: { user: req.user.id } } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//Add tag to discussion
var _addTagToDiscussion = function (req, res) {
    if (!req.body.tag) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We were expecting a tag id." });
    }
    //Find tag
    Tag.findOne(
        {
            _id: req.body.tag,
            is_active: true,
            $or: [
                { is_public: true },
                { creator: req.user.id },
                {
                    members: {
                        $elemMatch: {
                            user: mongoose.Types.ObjectId(req.user.id),
                            permit_val: { $in: ["moderator", "active"] },
                        },
                    },
                },
            ],
        },
        function (err, tag) {
            if (!tag)
                return res
                    .status(400)
                    .send({ error: "Unauthorized user. Cannot add tag." });
            if (req.user.type == "admin") {
                Discussion.updateOne(
                    { _id: req.params._id },
                    { $addToSet: { tags: tag._id } },
                    function (err, numAffected) {
                        res.send(tag);
                    }
                );
            } else {
                Discussion.updateOne(
                    { _id: req.params._id, creator: req.user.id },
                    { $addToSet: { tags: tag._id } },
                    function (err, numAffected) {
                        res.send(tag);
                    }
                );
            }
        }
    );
};
//Remove tag from discussion
var _removeTagFromDiscussion = function (req, res) {
    if (!req.body.tag) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We were expecting a tag id." });
    }
    //Remove
    Discussion.updateOne(
        { _id: req.params._id, creator: req.user.id },
        { $pull: { tags: req.body.tag } },
        function (err, numAffected) {
            res.sendStatus(200);
        }
    );
};
//DELETE Request function
//Delete discussion
var _deleteDiscussion = function (req, res) {
    Discussion.findOne(
        {
            _id: req.params._id,
            status: { $ne: "featured" },
        },
        function (err, discussion) {
            if (!discussion) return res.sendStatus(404);
            if (
                req.user.type != "admin" &&
                discussion.creator.toString() != req.user.id
            )
                return res.status(400).send({
                    error: "Unauthorized user. Cannot delete discussion.",
                });
            //All s3 image keys
            var keys = [];
            async.parallel(
                [
                    function (callback) {
                        //Delete social provider files
                        if (discussion.image) {
                            var provider_key = Utility.get_provider_key(
                                discussion.provider,
                                discussion.image.m
                            );
                        } else {
                            var provider_key = Utility.get_provider_key(
                                discussion.provider
                            );
                        }
                        if (provider_key) keys.push(provider_key);
                        callback();
                    },
                    function (callback) {
                        //Delete images
                        if (discussion.type == "text" && discussion.images) {
                            if (discussion.image) {
                                var image_keys = Utility.get_image_keys(
                                    discussion.images,
                                    discussion.image.m
                                );
                            } else {
                                var image_keys = Utility.get_image_keys(
                                    discussion.images
                                );
                            }
                        } else if (discussion.image) {
                            var image_keys = Utility.get_image_keys(
                                [discussion.image.l],
                                discussion.image.m
                            );
                        }
                        keys = keys.concat(image_keys);
                        callback();
                    },
                    function (callback) {
                        //Delete all comments images
                        for (var i = 0; i < discussion.comments.length; i++) {
                            if (
                                discussion.comments[i].images &&
                                discussion.comments[i].images.length
                            ) {
                                var image_keys = Utility.get_image_keys(
                                    discussion.comments[i].images
                                );
                                keys = keys.concat(image_keys);
                            }
                        }
                        callback();
                    },
                    function (callback) {
                        //Update badge count
                        if (discussion.badge) {
                            Badge.updateOne(
                                { _id: discussion.badge },
                                { $inc: { count: -1 } },
                                function (err, numAffected) {
                                    callback();
                                }
                            );
                        } else {
                            callback();
                        }
                    },
                    function (callback) {
                        //Update streak
                        Streak.updateMany(
                            { discussions: discussion._id },
                            { $pull: { discussions: discussion._id } },
                            function (err, numAffected) {
                                callback();
                            }
                        );
                    },
                ],
                function (err) {
                    if (!err) {
                        //Delete discussion finally
                        discussion.remove(function (err) {
                            if (!err) {
                                res.sendStatus(200);
                                //Finally delete all keys
                                Utility.delete_keys(keys);
                                //Delete activity
                                Activity.remove({
                                    "entity.discussion": discussion._id,
                                }).exec();
                            } else {
                                res.sendStatus(400);
                            }
                        });
                    } else {
                        res.sendStatus(400);
                    }
                }
            );
        }
    );
};
/*---------------- COMMENTS FUNCTION -------------------------*/
//GET Request functions - Comments
//All comments of a discussion
var _showComments = function (req, res) {};
//Get a single comment
var _getCommentById = function (req, res) {};
//POST Requests function
//Add a comment
var _addComment = function (req, res) {
    if (!req.body.comment || !req.body.discussion_id) {
        return res.status(400).send({
            error: "Invalid parameters. We were expecting a comment and a discussion id",
        });
    }
    //Anon comment
    if (req.body.anon) {
        //Find all tags user has access to
        Tag.find(
            {
                is_active: true,
                $or: [
                    { is_public: true },
                    { creator: req.user.id },
                    {
                        members: {
                            $elemMatch: {
                                user: mongoose.Types.ObjectId(req.user.id),
                                permit_val: { $in: ["moderator", "active"] },
                            },
                        },
                    },
                ],
            },
            function (err, tags) {
                //Get tag_ids
                var tag_ids = [];
                if (tags && tags.length) {
                    for (var i = 0; i < tags.length; i++) {
                        tag_ids.push(tags[i]._id);
                    }
                }
                //Get discussion
                Discussion.findOne({
                    _id: req.body.discussion_id,
                    $or: [
                        { status: { $in: ["featured", "daily"] } },
                        { tags: { $in: tag_ids } },
                        { tags: { $exists: true, $size: 0 } },
                    ],
                })
                    .populate("creator", "name email", "User")
                    .populate("comments.creator", "name email", "User")
                    .exec(function (err, discussion) {
                        if (!discussion)
                            return res
                                .status(400)
                                .send({ error: "No such discussion exists." });
                        if (req.body.reply_to) {
                            //Add indented reply
                            var comments = discussion.comments;
                            var ids = [],
                                json = {};
                            for (var i = 0; i < comments.length; i++) {
                                ids.push(comments[i]._id.toString());
                                //Get reply count
                                if (comments[i].reply_to) {
                                    if (
                                        json.hasOwnProperty(
                                            comments[i].reply_to
                                        )
                                    ) {
                                        json[comments[i].reply_to]++;
                                    } else {
                                        json[comments[i].reply_to] = 1;
                                    }
                                }
                            }
                            var new_reply = new Comment({
                                comment: req.body.comment,
                                images: req.body.images,
                                reply_to: req.body.reply_to,
                                "anon.id": req.user.anon.id,
                                "anon.name": req.user.anon.name,
                                updated_at: new Date(Date.now()),
                            });
                            new_reply.summary = Utility.get_text_summary(
                                new_reply.comment
                            );
                            //Get comment order
                            if (json.hasOwnProperty(req.body.reply_to)) {
                                var comment_order =
                                    ids.indexOf(req.body.reply_to) +
                                    json[req.body.reply_to];
                            } else {
                                var comment_order = ids.indexOf(
                                    req.body.reply_to
                                );
                            }
                            if (comment_order > -1) {
                                Discussion.updateOne(
                                    { _id: req.body.discussion_id },
                                    {
                                        $push: {
                                            comments: {
                                                $each: [new_reply],
                                                $position: comment_order + 1,
                                            },
                                        },
                                    },
                                    function (err, numAffected) {
                                        if (!err) {
                                            //Update streak
                                            Streak.findOne(
                                                {
                                                    user: req.user.id,
                                                    date: req.body.date,
                                                },
                                                function (err, streak) {
                                                    if (!streak) {
                                                        var new_streak =
                                                            new Streak({
                                                                user: req.user
                                                                    .id,
                                                                date: req.body
                                                                    .date,
                                                                count: 1,
                                                                discussions: [
                                                                    discussion._id,
                                                                ],
                                                            });
                                                        new_streak.save(
                                                            function (err) {
                                                                res.send(
                                                                    new_reply
                                                                );
                                                            }
                                                        );
                                                    } else {
                                                        streak.count += 1;
                                                        streak.discussions.addToSet(
                                                            discussion._id
                                                        );
                                                        streak.save(function (
                                                            err
                                                        ) {
                                                            res.send(new_reply);
                                                        });
                                                    }
                                                }
                                            );
                                            //Update karma point
                                            if (
                                                discussion.creator._id.toString() !=
                                                req.user.id
                                            ) {
                                                User.updateOne(
                                                    { _id: req.user.id },
                                                    { $inc: { karma: 5 } }
                                                ).exec();
                                                User.updateOne(
                                                    {
                                                        _id: discussion.creator
                                                            ._id,
                                                    },
                                                    { $inc: { karma: 2 } }
                                                ).exec();
                                            }
                                            //Send email
                                            if (comments && comments.length) {
                                                var users = [];
                                                for (
                                                    var i = 0;
                                                    i < comments.length;
                                                    i++
                                                ) {
                                                    if (!comments[i].creator)
                                                        continue;
                                                    var comment_creator =
                                                        comments[
                                                            i
                                                        ].creator._id.toString();
                                                    if (
                                                        comments[i].creator
                                                            .email &&
                                                        (comments[i].reply_to ==
                                                            req.body.reply_to ||
                                                            comments[i]._id ==
                                                                req.body
                                                                    .reply_to) &&
                                                        comment_creator !=
                                                            req.user.id &&
                                                        users.indexOf(
                                                            comment_creator
                                                        ) < 0
                                                    ) {
                                                        users.push(
                                                            comment_creator
                                                        );
                                                        //Save activity
                                                        saveActivity(
                                                            "reply",
                                                            comments[i].creator
                                                                ._id,
                                                            "",
                                                            {
                                                                discussion:
                                                                    discussion._id,
                                                            },
                                                            {
                                                                text: new_reply.summary,
                                                                anon: req.user
                                                                    .anon.name,
                                                            }
                                                        );
                                                        //Send email
                                                        var comment_text =
                                                            Utility.get_only_text(
                                                                new_reply.comment
                                                            );
                                                        var content = {
                                                            email: comments[i]
                                                                .creator.email,
                                                            name: comments[i]
                                                                .creator.name,
                                                            firstName:
                                                                comments[
                                                                    i
                                                                ].creator.name.split(
                                                                    " "
                                                                )[0],
                                                            fromName:
                                                                "Anonymous User",
                                                            comment:
                                                                comment_text,
                                                            title: discussion.title,
                                                            subject:
                                                                "Anonymous user commented on your discussion on UNESCO MGIEP's Social",
                                                            redirectURL:
                                                                discussion.slug,
                                                        };
                                                        Email.sendOneMail(
                                                            "new_reply",
                                                            content,
                                                            function (
                                                                err,
                                                                responseStatus
                                                            ) {}
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                    }
                                );
                            }
                        } else {
                            //Remove previous recent
                            Discussion.updateOne(
                                {
                                    _id: req.body.discussion_id,
                                    "comments.is_recent": true,
                                },
                                { $unset: { "comments.$.is_recent": 1 } },
                                function (err, numAffected) {
                                    var new_comment = new Comment({
                                        comment: req.body.comment,
                                        images: req.body.images,
                                        "anon.id": req.user.anon.id,
                                        "anon.name": req.user.anon.name,
                                        updated_at: new Date(Date.now()),
                                        is_recent: true,
                                    });
                                    new_comment.summary =
                                        Utility.get_text_summary(
                                            new_comment.comment
                                        );
                                    discussion.count += 1;
                                    discussion.comments.push(new_comment);
                                    discussion.save(function (err) {
                                        //Update streak
                                        Streak.findOne(
                                            {
                                                user: req.user.id,
                                                date: req.body.date,
                                            },
                                            function (err, streak) {
                                                if (!streak) {
                                                    var new_streak = new Streak(
                                                        {
                                                            user: req.user.id,
                                                            date: req.body.date,
                                                            count: 1,
                                                            discussions: [
                                                                discussion._id,
                                                            ],
                                                        }
                                                    );
                                                    new_streak.save(function (
                                                        err
                                                    ) {
                                                        res.send(new_comment);
                                                    });
                                                } else {
                                                    streak.count += 1;
                                                    streak.discussions.addToSet(
                                                        discussion._id
                                                    );
                                                    streak.save(function (err) {
                                                        res.send(new_comment);
                                                    });
                                                }
                                            }
                                        );
                                        //Update karma point
                                        if (
                                            discussion.creator._id.toString() !=
                                            req.user.id
                                        ) {
                                            User.updateOne(
                                                { _id: req.user.id },
                                                { $inc: { karma: 5 } }
                                            ).exec();
                                            User.updateOne(
                                                { _id: discussion.creator._id },
                                                { $inc: { karma: 2 } }
                                            ).exec();
                                        }
                                        //Save activity
                                        if (
                                            discussion.creator._id !=
                                            req.user.id
                                        ) {
                                            saveActivity(
                                                "comment",
                                                discussion.creator._id,
                                                "",
                                                { discussion: discussion._id },
                                                {
                                                    text: new_comment.summary,
                                                    anon: req.user.anon.name,
                                                }
                                            );
                                            //Send email
                                            if (!discussion.creator.email)
                                                return;
                                            var comment_text =
                                                Utility.get_only_text(
                                                    new_comment.comment
                                                );
                                            var content = {
                                                email: discussion.creator.email,
                                                name: discussion.creator.name,
                                                firstName:
                                                    discussion.creator.name.split(
                                                        " "
                                                    )[0],
                                                fromName: "Anonymous User",
                                                comment: comment_text,
                                                title: discussion.title,
                                                subject:
                                                    "Anonymous user commented on your discussion on UNESCO MGIEP's Social",
                                                redirectURL: discussion.slug,
                                            };
                                            Email.sendOneMail(
                                                "new_comment",
                                                content,
                                                function (
                                                    err,
                                                    responseStatus
                                                ) {}
                                            );
                                        }
                                    });
                                }
                            );
                        }
                    });
            }
        );
    } else {
        //Find all tags user has access to
        Tag.find(
            {
                is_active: true,
                $or: [
                    { is_public: true },
                    { creator: req.user.id },
                    {
                        members: {
                            $elemMatch: {
                                user: mongoose.Types.ObjectId(req.user.id),
                                permit_val: { $in: ["moderator", "active"] },
                            },
                        },
                    },
                ],
            },
            function (err, tags) {
                //Get tag_ids
                var tag_ids = [];
                if (tags && tags.length) {
                    for (var i = 0; i < tags.length; i++) {
                        tag_ids.push(tags[i]._id);
                    }
                }
                //Get discussion
                Discussion.findOne({
                    _id: req.body.discussion_id,
                    $or: [
                        { status: { $in: ["featured", "daily"] } },
                        { tags: { $in: tag_ids } },
                        { tags: { $exists: true, $size: 0 } },
                    ],
                })
                    .populate("creator", "name email", "User")
                    .populate("comments.creator", "name email", "User")
                    .exec(function (err, discussion) {
                        if (!discussion)
                            return res
                                .status(400)
                                .send({ error: "No such discussion exists." });
                        if (req.body.reply_to) {
                            //Add indented reply
                            var comments = discussion.comments;
                            var ids = [],
                                json = {};
                            for (var i = 0; i < comments.length; i++) {
                                ids.push(comments[i]._id.toString());
                                //Get reply count
                                if (comments[i].reply_to) {
                                    if (
                                        json.hasOwnProperty(
                                            comments[i].reply_to
                                        )
                                    ) {
                                        json[comments[i].reply_to]++;
                                    } else {
                                        json[comments[i].reply_to] = 1;
                                    }
                                }
                            }
                            var new_reply = new Comment({
                                comment: req.body.comment,
                                images: req.body.images,
                                reply_to: req.body.reply_to,
                                creator: req.user.id,
                                updated_at: new Date(Date.now()),
                            });
                            new_reply.summary = Utility.get_text_summary(
                                new_reply.comment
                            );
                            //Get comment order
                            if (json.hasOwnProperty(req.body.reply_to)) {
                                var comment_order =
                                    ids.indexOf(req.body.reply_to) +
                                    json[req.body.reply_to];
                            } else {
                                var comment_order = ids.indexOf(
                                    req.body.reply_to
                                );
                            }
                            if (comment_order > -1) {
                                Discussion.updateOne(
                                    { _id: req.body.discussion_id },
                                    {
                                        $push: {
                                            comments: {
                                                $each: [new_reply],
                                                $position: comment_order + 1,
                                            },
                                        },
                                    },
                                    function (err, numAffected) {
                                        if (!err) {
                                            new_reply.populate(
                                                {
                                                    path: "creator",
                                                    select: "name initials username dp",
                                                },
                                                function (err, reply) {
                                                    //Update streak
                                                    Streak.findOne(
                                                        {
                                                            user: req.user.id,
                                                            date: req.body.date,
                                                        },
                                                        function (err, streak) {
                                                            if (!streak) {
                                                                var new_streak =
                                                                    new Streak({
                                                                        user: req
                                                                            .user
                                                                            .id,
                                                                        date: req
                                                                            .body
                                                                            .date,
                                                                        count: 1,
                                                                        discussions:
                                                                            [
                                                                                discussion._id,
                                                                            ],
                                                                    });
                                                                new_streak.save(
                                                                    function (
                                                                        err
                                                                    ) {
                                                                        res.send(
                                                                            reply
                                                                        );
                                                                    }
                                                                );
                                                            } else {
                                                                streak.count += 1;
                                                                streak.discussions.addToSet(
                                                                    discussion._id
                                                                );
                                                                streak.save(
                                                                    function (
                                                                        err
                                                                    ) {
                                                                        res.send(
                                                                            reply
                                                                        );
                                                                    }
                                                                );
                                                            }
                                                        }
                                                    );
                                                    //Update karma point
                                                    if (
                                                        discussion.creator._id.toString() !=
                                                        req.user.id
                                                    ) {
                                                        User.updateOne(
                                                            {
                                                                _id: req.user
                                                                    .id,
                                                            },
                                                            {
                                                                $inc: {
                                                                    karma: 5,
                                                                },
                                                            }
                                                        ).exec();
                                                        User.updateOne(
                                                            {
                                                                _id: discussion
                                                                    .creator
                                                                    ._id,
                                                            },
                                                            {
                                                                $inc: {
                                                                    karma: 2,
                                                                },
                                                            }
                                                        ).exec();
                                                    }
                                                    //Send email
                                                    if (
                                                        comments &&
                                                        comments.length
                                                    ) {
                                                        var users = [];
                                                        for (
                                                            var i = 0;
                                                            i < comments.length;
                                                            i++
                                                        ) {
                                                            if (
                                                                !comments[i]
                                                                    .creator
                                                            )
                                                                continue;
                                                            var comment_creator =
                                                                comments[
                                                                    i
                                                                ].creator._id.toString();
                                                            if (
                                                                comments[i]
                                                                    .creator
                                                                    .email &&
                                                                (comments[i]
                                                                    .reply_to ==
                                                                    req.body
                                                                        .reply_to ||
                                                                    comments[i]
                                                                        ._id ==
                                                                        req.body
                                                                            .reply_to) &&
                                                                comment_creator !=
                                                                    req.user
                                                                        .id &&
                                                                users.indexOf(
                                                                    comment_creator
                                                                ) < 0
                                                            ) {
                                                                users.push(
                                                                    comment_creator
                                                                );
                                                                //Save activity
                                                                saveActivity(
                                                                    "reply",
                                                                    comments[i]
                                                                        .creator
                                                                        ._id,
                                                                    req.user.id,
                                                                    {
                                                                        discussion:
                                                                            discussion._id,
                                                                    },
                                                                    {
                                                                        text: reply.summary,
                                                                    }
                                                                );
                                                                //Send email
                                                                var comment_text =
                                                                    Utility.get_only_text(
                                                                        reply.comment
                                                                    );
                                                                var content = {
                                                                    email: comments[
                                                                        i
                                                                    ].creator
                                                                        .email,
                                                                    name: comments[
                                                                        i
                                                                    ].creator
                                                                        .name,
                                                                    firstName:
                                                                        comments[
                                                                            i
                                                                        ].creator.name.split(
                                                                            " "
                                                                        )[0],
                                                                    fromName:
                                                                        req.user
                                                                            .name,
                                                                    comment:
                                                                        comment_text,
                                                                    title: discussion.title,
                                                                    subject:
                                                                        req.user.name.split(
                                                                            " "
                                                                        )[0] +
                                                                        " replied to your comment on UNESCO MGIEP's Social",
                                                                    redirectURL:
                                                                        discussion.slug,
                                                                };
                                                                Email.sendOneMail(
                                                                    "new_reply",
                                                                    content,
                                                                    function (
                                                                        err,
                                                                        responseStatus
                                                                    ) {}
                                                                );
                                                            }
                                                        }
                                                    }
                                                }
                                            );
                                        }
                                    }
                                );
                            }
                        } else {
                            //Remove previous recent
                            Discussion.updateOne(
                                {
                                    _id: req.body.discussion_id,
                                    "comments.is_recent": true,
                                },
                                { $unset: { "comments.$.is_recent": 1 } },
                                function (err, numAffected) {
                                    var new_comment = new Comment({
                                        comment: req.body.comment,
                                        images: req.body.images,
                                        creator: req.user.id,
                                        updated_at: new Date(Date.now()),
                                        is_recent: true,
                                    });
                                    new_comment.summary =
                                        Utility.get_text_summary(
                                            new_comment.comment
                                        );
                                    discussion.count += 1;
                                    discussion.comments.push(new_comment);
                                    discussion.save(function (err) {
                                        new_comment.populate(
                                            {
                                                path: "creator",
                                                select: "name initials username dp job",
                                            },
                                            function (err, comment) {
                                                //Update streak
                                                Streak.findOne(
                                                    {
                                                        user: req.user.id,
                                                        date: req.body.date,
                                                    },
                                                    function (err, streak) {
                                                        if (!streak) {
                                                            var new_streak =
                                                                new Streak({
                                                                    user: req
                                                                        .user
                                                                        .id,
                                                                    date: req
                                                                        .body
                                                                        .date,
                                                                    count: 1,
                                                                    discussions:
                                                                        [
                                                                            discussion._id,
                                                                        ],
                                                                });
                                                            new_streak.save(
                                                                function (err) {
                                                                    res.send(
                                                                        comment
                                                                    );
                                                                }
                                                            );
                                                        } else {
                                                            streak.count += 1;
                                                            streak.discussions.addToSet(
                                                                discussion._id
                                                            );
                                                            streak.save(
                                                                function (err) {
                                                                    res.send(
                                                                        comment
                                                                    );
                                                                }
                                                            );
                                                        }
                                                    }
                                                );
                                                //Update karma point
                                                if (
                                                    discussion.creator._id.toString() !=
                                                    req.user.id
                                                ) {
                                                    User.updateOne(
                                                        { _id: req.user.id },
                                                        { $inc: { karma: 5 } }
                                                    ).exec();
                                                    User.updateOne(
                                                        {
                                                            _id: discussion
                                                                .creator._id,
                                                        },
                                                        { $inc: { karma: 2 } }
                                                    ).exec();
                                                }
                                                //Save activity
                                                if (
                                                    discussion.creator._id !=
                                                    req.user.id
                                                ) {
                                                    saveActivity(
                                                        "comment",
                                                        discussion.creator._id,
                                                        req.user.id,
                                                        {
                                                            discussion:
                                                                discussion._id,
                                                        },
                                                        {
                                                            text: comment.summary,
                                                        }
                                                    );
                                                    //Send email
                                                    if (
                                                        !discussion.creator
                                                            .email
                                                    )
                                                        return;
                                                    var comment_text =
                                                        Utility.get_only_text(
                                                            comment.comment
                                                        );
                                                    var content = {
                                                        email: discussion
                                                            .creator.email,
                                                        name: discussion.creator
                                                            .name,
                                                        firstName:
                                                            discussion.creator.name.split(
                                                                " "
                                                            )[0],
                                                        fromName: req.user.name,
                                                        comment: comment_text,
                                                        title: discussion.title,
                                                        subject:
                                                            req.user.name.split(
                                                                " "
                                                            )[0] +
                                                            " commented on your discussion on UNESCO MGIEP's Social",
                                                        redirectURL:
                                                            discussion.slug,
                                                    };
                                                    Email.sendOneMail(
                                                        "new_comment",
                                                        content,
                                                        function (
                                                            err,
                                                            responseStatus
                                                        ) {}
                                                    );
                                                }
                                            }
                                        );
                                    });
                                }
                            );
                        }
                    });
            }
        );
    }
};
//PUT Requests function
//Edit comment
var _editComment = function (req, res) {
    if (!req.body.comment) {
        return res
            .status(400)
            .send({ error: "Invalid parameters. We were expecting a comment" });
    }
    //Get comment
    Discussion.findOne(
        {
            "comments._id": req.params._id,
            $or: [
                { "comments.creator": req.user.id },
                { "comments.anon.id": req.user.anon.id },
            ],
        },
        function (err, discussion) {
            if (!discussion)
                return res
                    .status(400)
                    .send({ error: "Unauthorized user. Cannot edit comment." });
            //Get comment
            var comments = discussion.comments;
            var comment;
            for (var i = 0; i < comments.length; i++) {
                if (comments[i]._id.toString() == req.params._id) {
                    comment = comments[i];
                }
            }
            //Get images
            var comment_images = [];
            if (req.body.images) {
                if (comment.images) {
                    var comment_images = comment.images;
                }
                comment_images = _.union(comment_images, req.body.images);
            }
            //Get summary
            var summary = Utility.get_text_summary(req.body.comment);
            //Update
            Discussion.updateOne(
                {
                    "comments._id": req.params._id,
                    $or: [
                        { "comments.creator": req.user.id },
                        { "comments.anon.id": req.user.anon.id },
                    ],
                },
                {
                    $set: {
                        "comments.$.comment": req.body.comment,
                        "comments.$.summary": summary,
                        "comments.$.images": comment_images,
                    },
                },
                function (err, numAffected) {
                    if (!err)
                        res.send({
                            summary: summary,
                            comment: req.body.comment,
                        });
                }
            );
        }
    );
};
//Like comment
var _likeComment = function (req, res) {
    //Find all tags user has access to
    Tag.find(
        {
            is_active: true,
            $or: [
                { is_public: true },
                { creator: req.user.id },
                {
                    members: {
                        $elemMatch: {
                            user: mongoose.Types.ObjectId(req.user.id),
                            permit_val: { $in: ["moderator", "active"] },
                        },
                    },
                },
            ],
        },
        function (err, tags) {
            //Get tag_ids
            var tag_ids = [];
            if (tags && tags.length) {
                for (var i = 0; i < tags.length; i++) {
                    tag_ids.push(tags[i]._id);
                }
            }
            //Get discussion
            Discussion.updateOne(
                {
                    "comments._id": req.params._id,
                    $or: [
                        { status: { $in: ["featured", "daily"] } },
                        { tags: { $in: tag_ids } },
                        { tags: { $exists: true, $size: 0 } },
                    ],
                },
                { $addToSet: { "comments.$.likes": req.user.id } }
            ).exec(function (err, discussion) {
                if (!err) {
                    res.sendStatus(200);
                    //Update karma point
                    Discussion.findOne({
                        "comments._id": req.params._id,
                    })
                        .select({
                            title: 1,
                            creator: 1,
                            comments: { $elemMatch: { _id: req.params._id } },
                        })
                        .exec(function (err, discussion) {
                            if (
                                !discussion.comments ||
                                !discussion.comments.length
                            )
                                return;
                            if (
                                discussion.comments[0].creator &&
                                discussion.comments[0].creator.toString() !=
                                    req.user.id.toString()
                            ) {
                                //Save activity
                                saveActivity(
                                    "like_comment",
                                    discussion.comments[0].creator,
                                    req.user.id,
                                    { discussion: discussion._id },
                                    { text: discussion.comments[0].comment }
                                );
                                //Update karma point
                                User.updateOne(
                                    { _id: discussion.comments[0].creator },
                                    { $inc: { karma: 2 } }
                                ).exec();
                            }
                        });
                }
            });
        }
    );
};
//Unlike comment
var _unlikeComment = function (req, res) {
    Discussion.updateOne(
        { "comments._id": req.params._id },
        { $pull: { "comments.$.likes": req.user.id } },
        function (err, numAffected) {
            if (!err) res.sendStatus(200);
        }
    );
};
//DELETE Request function
//Delete comment
var _deleteComment = function (req, res) {
    var discussion;
    async.series(
        [
            function (callback) {
                if (req.user.type == "admin") {
                    Discussion.findOne(
                        {
                            "comments._id": req.params._id,
                        },
                        function (err, d) {
                            if (d) {
                                discussion = d;
                                callback();
                            }
                        }
                    );
                } else {
                    Discussion.findOne(
                        {
                            "comments._id": req.params._id,
                            $or: [
                                { "comments.creator": req.user.id },
                                { "comments.anon.id": req.user.id },
                            ],
                        },
                        function (err, d) {
                            if (d) {
                                discussion = d;
                                callback();
                            }
                        }
                    );
                }
            },
        ],
        function (err) {
            var only_comments = [],
                is_reply;
            for (var i = 0; i < discussion.comments.length; i++) {
                if (!discussion.comments[i].reply_to) {
                    only_comments.push(discussion.comments[i]);
                } else if (
                    discussion.comments[i]._id.toString() == req.params._id
                ) {
                    is_reply = true;
                    break;
                }
            }
            //Get image keys
            var keys = [];
            for (var i = 0; i < discussion.comments.length; i++) {
                if (
                    discussion.comments[i]._id.toString() == req.params._id ||
                    (discussion.comments[i].reply_to &&
                        discussion.comments[i].reply_to.toString() ==
                            req.params._id)
                ) {
                    if (
                        discussion.comments[i].images &&
                        discussion.comments[i].images.length
                    ) {
                        var image_keys = Utility.get_image_keys(
                            discussion.comments[i].images
                        );
                        keys = keys.concat(image_keys);
                    }
                }
            }
            //Find replies
            if (is_reply) {
                //Delete reply
                Discussion.updateOne(
                    { "comments._id": req.params._id },
                    { $pull: { comments: { _id: req.params._id } } },
                    function (err, numAffected) {
                        if (!err) res.sendStatus(200);
                        //Finally delete all keys
                        Utility.delete_keys(keys);
                    }
                );
            } else {
                //Delete comment and its replies
                Discussion.updateOne(
                    { "comments.reply_to": req.params._id },
                    { $pull: { comments: { reply_to: req.params._id } } },
                    function (err, numAffected) {
                        Discussion.updateOne(
                            { "comments._id": req.params._id },
                            {
                                $pull: { comments: { _id: req.params._id } },
                                $inc: { count: -1 },
                            },
                            function (err, numAffected) {
                                if (!err) {
                                    //Make previous comment active
                                    if (
                                        only_comments.length > 1 &&
                                        only_comments[
                                            only_comments.length - 1
                                        ]._id.toString() == req.params._id
                                    ) {
                                        var prev_id =
                                            only_comments[
                                                only_comments.length - 2
                                            ]._id;
                                        Discussion.updateOne(
                                            { "comments._id": prev_id },
                                            {
                                                $set: {
                                                    "comments.$.is_recent": true,
                                                },
                                            },
                                            function (err, numAffected) {
                                                res.sendStatus(200);
                                                //Finally delete all keys
                                                Utility.delete_keys(keys);
                                            }
                                        );
                                    } else {
                                        res.sendStatus(200);
                                        //Finally delete all keys
                                        Utility.delete_keys(keys);
                                    }
                                }
                            }
                        );
                    }
                );
            }
        }
    );
};
/*---------------- BADGES FUNCTION -------------------------*/
//GET Request functions - Badges
//Get all badges
var _getBadges = function (req, res) {
    Badge.find({})
        .sort({ name: 1 })
        .exec(function (err, badges) {
            res.send(badges);
        });
};
//Get a single badge
var _getBadgeById = function (req, res) {
    Badge.findOne({ _id: req.params._id }, function (err, badge) {
        if (!badge) return res.sendStatus(404);
        res.send(badge);
    });
};
//POST Request functions
//Add a badge
var _addBadge = function (req, res) {
    //Check if admin
    if (req.user.type != "admin") {
        return res
            .status(400)
            .send({ error: "Unauthorized user. Cannot add badge." });
    }
    if (!req.body.name) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a badge name.",
        });
    }
    //Add new badge
    var new_badge = new Badge({
        name: req.body.name,
        desc: req.body.desc,
        creator: req.user.id,
        updated_at: new Date(Date.now()),
    });
    //Color
    if (req.body.color) {
        new_badge.color = req.body.color;
    } else {
        new_badge.color = randomColor({ luminosity: "dark" });
    }
    //Save
    new_badge.save(function (err) {
        if (!err) res.send(new_badge);
    });
};
//PUT Requests function
//Edit badge
var _editBadge = function (req, res) {
    //Check if admin
    if (req.user.type != "admin") {
        return res
            .status(400)
            .send({ error: "Unauthorized user. Cannot edit badge." });
    }
    //Edit badge
    Badge.findOne({ _id: req.params._id }).exec(function (err, badge) {
        if (!badge) return res.sendStatus(404);
        if (badge.name == req.body.name && badge.color == req.body.color)
            return res
                .status(400)
                .send({ error: "Invalid parameters. Nothing to update." });
        //Update
        if (req.body.name) {
            badge.name = req.body.name;
        }
        if (req.body.desc != null) {
            badge.desc = req.body.desc;
        }
        if (req.body.color) {
            badge.color = req.body.color;
        }
        badge.updated_at = new Date(Date.now());
        badge.save(function (err) {
            if (!err) {
                res.status(200).send(badge);
            }
        });
    });
};
//DELETE Requests function
//Delete badge
var _deleteBadge = function (req, res) {};
/*---------------- REACTIONS FUNCTION -------------------------*/
//GET Request functions - Reactions
//All reactions
var _getReactions = function (req, res) {
    Reaction.find({})
        .sort({ order: 1 })
        .select("name emoji count")
        .exec(function (err, pages) {
            res.send(pages);
        });
};
//Get a single reaction
var _getReactionById = function (req, res) {
    Reaction.findOne({ _id: req.params._id }, function (err, reaction) {
        if (!reaction) return res.sendStatus(404);
        res.send(reaction);
    });
};
//POST Request functions
//Add a reaction
var _addReaction = function (req, res) {
    if (req.user.type != "admin") {
        return res
            .status(400)
            .send({ error: "Unauthorized user. Cannot add reaction." });
    }
    if (!req.body.name && !req.body.emoji) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a reaction name or emoji.",
        });
    }
    //Add new reaction
    var new_reaction = new Reaction({
        name: req.body.name,
        emoji: req.body.emoji,
        creator: req.user.id,
        updated_at: new Date(Date.now()),
    });
    //Save
    new_reaction.save(function (err) {
        if (!err) res.send(new_reaction);
    });
};
//PUT Request functions
//Edit reaction
var _editReaction = function (req, res) {
    if (req.user.type != "admin") {
        return res
            .status(400)
            .send({ error: "Unauthorized user. Cannot edit reaction." });
    }
    if (!req.body.name && !req.body.emoji) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a reaction name or emoji.",
        });
    }
    //Find reaction
    Reaction.findOne({ _id: req.params._id }).exec(function (err, reaction) {
        if (!reaction) return res.sendStatus(404);
        if (reaction.name == req.body.name && reaction.emoji == req.body.emoji)
            return res
                .status(400)
                .send({ error: "Invalid parameters. Nothing to update." });
        //Update
        reaction.name = req.body.name;
        reaction.emoji = req.body.emoji;
        reaction.updated_at = new Date(Date.now());
        reaction.save(function (err) {
            if (!err) {
                res.status(200).send(reaction);
            }
        });
    });
};
//DELETE Request functions
//Delete reaction
var _deleteReaction = function (req, res) {};
/*---------------- SEARCH FUNCTION -------------------------*/
//GET Request functions
//Search pages
var _searchPages = function (req, res) {
    if (!req.query.text)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a search text.",
        });
    //Find
    Page.find({
        $or: [
            { title: new RegExp("" + req.query.text + "", "i") },
            { desc: new RegExp("" + req.query.text + "", "i") },
        ],
    })
        .sort({ order: 1 })
        .exec(function (err, pages) {
            res.send(pages);
        });
};
//Search files
var _searchFiles = function (req, res) {
    if (!req.query.text)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a search text.",
        });
    var page = req.query.page;
    //Find
    File.find({
        $or: [
            { title: new RegExp("" + req.query.text + "", "i") },
            { ext: new RegExp("" + req.query.text + "", "i") },
        ],
    })
        .sort({ updated_at: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec(function (err, files) {
            res.send(files);
        });
};
//Search articles
var _searchArticles = function (req, res) {
    if (!req.query.text)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a search text.",
        });
    var page = req.query.page;
    //Find
    if (req.query.text.charAt(0) == "@") {
        var text = req.query.text.substr(1);
        //Find persons
        Person.find({
            name: new RegExp("" + text + "", "i"),
        }).exec(function (err, persons) {
            if (persons && persons.length) {
                var person_ids = [];
                for (var i = 0; i < persons.length; i++) {
                    person_ids.push(persons[i]._id);
                }
                //Find by people
                Block.find({
                    type: "content",
                    people: { $in: person_ids },
                })
                    .sort({ updated_at: -1 })
                    .skip((page - 1) * PAGE_SIZE)
                    .limit(PAGE_SIZE)
                    .exec(function (err, articles) {
                        res.send(articles);
                    });
            } else {
                res.send([]);
            }
        });
    } else if (req.query.text.charAt(0) == "#") {
        var text = req.query.text.substr(1);
        //Find tags
        ArticleTag.find({
            name: new RegExp("" + text + "", "i"),
        }).exec(function (err, tags) {
            if (tags && tags.length) {
                var tag_ids = [];
                for (var i = 0; i < tags.length; i++) {
                    tag_ids.push(tags[i]._id);
                }
                //Find by tags
                Block.find({
                    type: "content",
                    tags: { $in: tag_ids },
                })
                    .sort({ updated_at: -1 })
                    .skip((page - 1) * PAGE_SIZE)
                    .limit(PAGE_SIZE)
                    .exec(function (err, articles) {
                        res.send(articles);
                    });
            } else {
                res.send([]);
            }
        });
    } else {
        //Find by title or desc
        Block.find({
            type: "content",
            $or: [
                { "text.title": new RegExp("" + req.query.text + "", "i") },
                { "text.desc": new RegExp("" + req.query.text + "", "i") },
            ],
        })
            .sort({ updated_at: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, articles) {
                res.send(articles);
            });
    }
};
//Search pages and articles
var _searchPagesAndArticles = function (req, res) {
    if (!req.query.text)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a search text.",
        });
    var page = req.query.page;
    //Find
    if (req.query.text.charAt(0) == "@") {
        var text = req.query.text.substr(1);
        //Find persons
        Person.find({
            name: new RegExp("" + text + "", "i"),
        }).exec(function (err, persons) {
            if (persons && persons.length) {
                var person_ids = [];
                for (var i = 0; i < persons.length; i++) {
                    person_ids.push(persons[i]._id);
                }
                //Find by people
                Block.find({
                    type: "content",
                    is_archived: false,
                    people: { $in: person_ids },
                })
                    .select({
                        slug: 1,
                        category: 1,
                        resource_type: 1,
                        "text.title": 1,
                        "text.desc": 1,
                        "image.m": 1,
                        url: 1,
                        updated_at: 1,
                    })
                    .sort({ updated_at: -1 })
                    .skip((page - 1) * PAGE_SIZE)
                    .limit(PAGE_SIZE)
                    .exec(function (err, articles) {
                        res.send({
                            pages: [],
                            articles: articles,
                        });
                    });
            } else {
                res.send([]);
            }
        });
    } else {
        //Find pages by title or desc
        Page.find({
            is_archived: { $ne: true },
            $or: [
                { title: new RegExp("" + req.query.text + "", "i") },
                { desc: new RegExp("" + req.query.text + "", "i") },
            ],
        })
            .select({ title: 1, url: 1, desc: 1, order: 1, ref_url: 1 })
            .sort({ order: 1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .exec(function (err, pages) {
                //Find articles by title or desc
                Block.find({
                    type: "content",
                    is_archived: false,
                    $or: [
                        {
                            "text.title": new RegExp(
                                "" + req.query.text + "",
                                "i"
                            ),
                        },
                        {
                            "text.desc": new RegExp(
                                "" + req.query.text + "",
                                "i"
                            ),
                        },
                    ],
                })
                    .select({
                        slug: 1,
                        category: 1,
                        resource_type: 1,
                        "text.title": 1,
                        "text.desc": 1,
                        "image.m": 1,
                        url: 1,
                        updated_at: 1,
                    })
                    .sort({ updated_at: -1 })
                    .skip((page - 1) * PAGE_SIZE)
                    .limit(PAGE_SIZE)
                    .exec(function (err, articles) {
                        res.send({
                            pages: pages,
                            articles: articles,
                        });
                    });
            });
    }
};
//Search persons
var _searchPersons = function (req, res) {
    if (!req.query.text)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a search text.",
        });
    var page = req.query.page;
    //Excluded
    if (req.query.excluded) {
        var excluded = JSON.parse(req.query.excluded);
    }
    //Find
    Person.find({
        _id: { $nin: excluded },
        $or: [
            { name: new RegExp("" + req.query.text + "", "i") },
            { email: new RegExp("" + req.query.text + "", "i") },
        ],
    })
        .sort({ updated_at: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec(function (err, persons) {
            res.send(persons);
        });
};
//Search team members
var _searchTeamMembers = function (req, res) {
    if (!req.query.text)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a search text.",
        });
    var page = req.query.page;
    //Find
    Person.find({
        type: "team",
        $or: [
            { name: new RegExp("" + req.query.text + "", "i") },
            { email: new RegExp("" + req.query.text + "", "i") },
        ],
    })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec(function (err, persons) {
            res.send(persons);
        });
};
//Search partners
var _searchPartners = function (req, res) {
    if (!req.query.text)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a search text.",
        });
    var page = req.query.page;
    //Excluded
    if (req.query.excluded) {
        var excluded = JSON.parse(req.query.excluded);
    }
    //Find
    Person.find({
        type: "partner",
        _id: { $nin: excluded },
        $or: [
            { name: new RegExp("" + req.query.text + "", "i") },
            { email: new RegExp("" + req.query.text + "", "i") },
        ],
    })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec(function (err, persons) {
            res.send(persons);
        });
};
//Search projects and events
var _searchProjectsAndEvents = function (req, res) {
    if (!req.query.text)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a search text.",
        });
    var page = req.query.page;
    //Excluded
    if (req.query.excluded) {
        var excluded = JSON.parse(req.query.excluded);
    }
    //Find
    Page.find({
        category: { $in: ["project", "event", "publication"] },
        _id: { $nin: excluded },
        title: new RegExp("" + req.query.text + "", "i"),
    })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec(function (err, pages) {
            res.send(pages);
        });
};
//Search article tags
var _searchArticleTags = function (req, res) {
    if (!req.query.name)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a tag name.",
        });
    //Excluded
    if (req.query.excluded) {
        var excluded = JSON.parse(req.query.excluded);
    }
    //Find
    ArticleTag.find({
        $and: [
            { name: new RegExp("" + req.query.name + "", "i") },
            { name: { $nin: excluded } },
        ],
    })
        .select("name color count")
        .exec(function (err, tags) {
            res.send(tags);
        });
};
//Search users to add them to tags
var _searchUsers = function (req, res) {
    if (!req.query.text)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a search text.",
        });
    var page = req.query.page;
    //Excluded
    if (req.query.excluded) {
        var excluded = JSON.parse(req.query.excluded);
    }
    //Find
    User.find({
        _id: { $nin: excluded },
        $or: [
            { name: new RegExp("" + req.query.text + "", "i") },
            { email: new RegExp("" + req.query.text + "", "i") },
        ],
    })
        .select("name initials username dp job")
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec(function (err, users) {
            res.send(users);
        });
};
//Search tags user has access to
var _searchTags = function (req, res) {
    //Excluded
    if (req.query.excluded) {
        var excluded = JSON.parse(req.query.excluded);
    }
    //Find
    Tag.find({
        _id: { $nin: excluded },
        name: new RegExp("" + req.query.name + "", "i"),
        is_active: true,
        $or: [
            { is_public: true },
            { creator: req.user.id },
            {
                members: {
                    $elemMatch: {
                        user: mongoose.Types.ObjectId(req.user.id),
                        permit_val: { $in: ["moderator", "active"] },
                    },
                },
            },
        ],
    })
        .select("name slug desc color")
        .exec(function (err, tags) {
            res.send(tags);
        });
};
//Search article folders
var _searchArticleFolders = function (req, res) {
    if (!req.query.text)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a search text.",
        });
    var page = req.query.page;
    //Find
    Block.find({
        type: "content",
        is_folder: true,
        "text.title": new RegExp("" + req.query.text + "", "i"),
    })
        .select({ "text.title": 1, is_folder: 1 })
        .sort({ "text.title": 1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec(function (err, articles) {
            res.send(articles);
        });
};
//Search file folders
var _searchFileFolders = function (req, res) {
    if (!req.query.text)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a search text.",
        });
    var page = req.query.page;
    //Find
    File.find({
        is_folder: true,
        title: new RegExp("" + req.query.text + "", "i"),
    })
        .select({ title: 1, is_folder: 1 })
        .sort({ title: 1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec(function (err, files) {
            res.send(files);
        });
};
//Search gifs
var _searchGifs = function (req, res) {
    if (!req.query.search)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a search text",
        });
    Utility.get_gifs_results(req.query.search, function (data) {
        res.status(200).send(data);
    });
};
/*---------------- LOG FUNCTION -------------------------*/
//GET Request functions
//Get logs
var _getLogs = function (req, res) {
    var page = req.query.page;
    //Log
    Log.find()
        .populate("creator", "name initials username dp", "User")
        .populate("entity.page", "title url category", "Page")
        .populate("entity.article", "slug text url", "Block")
        .populate("entity.person", "type name", "Person")
        .populate("entity.file", "title url", "File")
        .sort({ created_at: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec(function (err, logs) {
            res.send(logs);
        });
};
/* ------------------- LINK PREVIEW FUNCTION ------------- */
var _getLinkPreview = function (req, res) {
    if (!req.query.url && !validator.isURL(req.query.url))
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a valid url",
        });
    Utility.get_link_metadata(req.query.url, function (data) {
        res.status(200).send(data);
    });
};
/* ------------------- KINDNESS STORIES FUNCTION ------------- */
var _getKindnessStories = function (req, res) {
    Site.findOne({}, function (err, site) {
        var sheet_id = "1footlrY8UMOEj4KuHrv8Q5lHtsj9udsnHNi-sZY1hBg";
        Utility.get_google_sheet_rows(
            site.base_stories,
            sheet_id,
            function (stories) {
                //Update site
                site.stories = stories;
                site.save(function (err) {
                    res.status(200).send({ stories: stories });
                });
            }
        );
    });
};
//Get kindness stories in geojson format
var _getKindnessGeoJSON = function (req, res) {
    Block.find({ type: "content", "location.country": { $ne: null } })
        .select("slug text image location")
        .sort({ updated_at: -1 })
        .exec(function (err, blocks) {
            var stories = Utility.get_kindness_geojson(blocks);
            res.send(stories);
        });
};
/*---------------- ACTIVITY FUNCTION -------------------------*/
//GET Request functions
//Get activity
var _getActivity = function (req, res) {
    var page = req.query.page;
    //Activity
    Activity.find({ user_for: req.user.id })
        .populate("creator", "name initials username dp", "User")
        .populate("entity.tag", "name color slug", "Tag")
        .populate(
            "entity.discussion",
            "title type slug summary image bound provider file",
            "Discussion"
        )
        .sort({ created_at: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec(function (err, activities) {
            //Reset activity count
            Activity.updateMany(
                { user_for: req.user.id },
                { $set: { is_new: false } },
                function (err, numAffected) {
                    res.send(activities);
                }
            );
        });
};
/*---------------- FORM FUNCTION -------------------------*/
//GET Request functions
//Get form
var _getForm = function (req, res) {
    Form.find()
        .select("-_id name email")
        .exec(function (err, formdata) {
            var data = [
                {
                    sheet: "Subscribed users",
                    columns: [
                        { label: "Name", value: "name" },
                        { label: "Email", value: "email" },
                    ],
                    content: formdata,
                },
            ];
            let settings = {
                writeOptions: {
                    type: "buffer",
                    bookType: "xlsx",
                },
            };
            const buffer = xlsx(data, settings);
            res.writeHead(200, {
                "Content-Type": "application/octet-stream",
                "Content-disposition": "attachment; filename=Users.xlsx",
            });
            res.end(buffer);
        });
};
//Add form
var _addForm = function (req, res) {
    if (!req.body.name || !req.body.email)
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a name and email.",
        });
    Form.findOne({ email: req.body.email.toLowerCase() }, function (err, form) {
        if (form) return res.send("");
        else {
            var new_form = new Form({
                email: req.body.email,
                name: req.body.name,
            });
            new_form.save(function (err) {
                if (!err) res.send(new_form);
            });
        }
    });
};
/* ----------------- STREAK FUNCTION------------------ */
var _getStreak = function (req, res) {
    Streak.find({ user: req.user.id }, function (err, streak) {
        res.send(streak);
    });
};
/* ------------------- UPLOAD TO S3 ------------- */
var _uploadS3 = function (req, res) {
    var mime_type = mime.getType(req.query.title);
    var expire = moment().utc().add(1, "hour").toJSON("YYYY-MM-DDTHH:mm:ss Z");
    var policy = JSON.stringify({
        expiration: expire,
        conditions: [
            { bucket: process.env.AWS_BUCKET },
            ["starts-with", "$key", process.env.BUCKET_DIR],
            { acl: "public-read" },
            { "success-action-status": "201" },
            ["starts-with", "$Content-Type", mime_type],
            ["content-length-range", 0, process.env.MAX_FILE_SIZE],
        ],
    });
    var base64policy = new Buffer(policy).toString("base64");
    var signature = crypto
        .createHmac("sha1", process.env.AWS_SECRET)
        .update(base64policy)
        .digest("base64");
    var file_key = uuidv4();
    res.json({
        policy: base64policy,
        signature: signature,
        key: process.env.BUCKET_DIR + file_key + "_" + req.query.title,
        success_action_redirect: "/",
        contentType: mime_type,
    });
};
//Upload directly
var _uploadFile = function (req, res) {
    if (!req.files) {
        return res.status(400).send({
            error: "Invalid parameters. We are expecting a files array.",
        });
    }
    var file = req.files["file[]"];
    var file_name = file.name.split(".")[0];
    var file_path = file.tempFilePath;
    Utility.upload_file(file_path, file_name, function (image_url) {
        res.send(image_url);
    });
};
/* ------------------- CREATE MGIEP SITE ------------- */
var _createMGIEPSite = function (req, res) {
    Site.findOne({}, function (err, site) {
        if (site)
            return res.status(400).send({ error: "Site already created." });
        var new_site = new Site({
            title: "UNESCO MGIEP | Building Social and Emotional Learning for Education 2030",
        });
        new_site.save(function (err) {
            if (!err) res.send(new_site);
        });
    });
};
//Save activity
function saveActivity(action, user_for, creator, entity, comment) {
    if (creator) {
        var new_activity = new Activity({
            action: action,
            user_for: user_for,
            creator: creator,
            entity: entity,
            comment: comment,
        });
    } else {
        var new_activity = new Activity({
            action: action,
            user_for: user_for,
            entity: entity,
            comment: comment,
        });
    }
    new_activity.save();
}
//Save log
function saveLog(action, type, creator, entity, title) {
    var new_log = new Log({
        action: action,
        type: type,
        creator: creator,
        entity: entity,
        title: title,
    });
    new_log.save();
}
//Route middleware to check if user is loggedIn
function isLoggedIn(req, res, next) {
    //passport function to check session and cookie
    if (req.isAuthenticated()) return next();
    //redirect to login page if not loggedin
    res.redirect("/#login");
}
//Route middleware to check if user is admin
function isAdmin(req, res, next) {
    //passport function to check session and cookie
    if (req.user.type == "admin") return next();
    //redirect to login page if not loggedin
    res.redirect("/#login");
}
