//Schema for Pages, Blocks and related items
var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;
//User
var User = require("../models/user").User;
//Schema: Ticker
var TickerSchema = new Schema({
    title: { type: String, required: true },
    url: String,
});
//Schema: Site
var SiteSchema = new Schema({
    title: { type: String, required: true },
    desc: { type: String },
    image: {
        m: String,
        l: String,
        meta: String,
        favicon: String,
        apple: String,
    },
    menu: {
        text: String,
        html: String,
    },
    social: {
        facebook: String,
        twitter: String,
        instagram: String,
        youtube: String,
        linkedin: String,
    },
    notice: {
        desc: String,
        link: String,
    },
    ticker: [TickerSchema],
    theme: { type: String, enum: ["auto", "light", "dark"], default: "auto" },
    contact: String,
    subscribe: {
        title: String,
        desc: String,
    },
    stories: Number,
    base_stories: Number,
    color: {
        back: String,
        text: String,
    },
    /* Optional */
    admins: [{ type: ObjectId, ref: "User" }],
});
//Schema: Section item
var ItemSchema = new Schema({
    title: String,
    desc: String,
    button: {
        text: String,
        url: String,
        embed: String,
    },
    buttonb: {
        text: String,
        url: String,
        embed: String,
    },
    image: {
        m: String,
        l: String,
    },
    embed: String,
});
//Schema: Image
var ImageSchema = new Schema({
    title: String,
    desc: String,
    button: {
        text: String,
        url: String,
        embed: String,
    },
    buttonb: {
        text: String,
        url: String,
        embed: String,
    },
    file: {
        m: String,
        l: String,
    },
    bound: Number,
    embed: String,
});
//Schema: Event
var EventSchema = new Schema({
    title: String,
    desc: String,
    date: {
        start: Date,
        end: Date,
    },
    image: {
        m: String,
        l: String,
        icon: String,
    },
    url: String,
    location: String,
});
//Schema: Dummy Page
var DummyPageSchema = new Schema({
    title: String,
    url: String,
    category: String,
    /* Meta */
    desc: String,
    image: {
        m: String,
        l: String,
        meta: String,
        favicon: String,
        apple: String,
    },
    /* External */
    ref_url: String,
    /* User */
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
});
//Schema: Article tag
var ArticleTagSchema = new Schema({
    name: { type: String, required: true, index: true },
    color: String,
    creator: { type: ObjectId, ref: "User" },
    count: { type: Number, default: 0 },
});
//Schema: Journaling answers
var AnswerSchema = new Schema({
    text: String,
    file: {
        size: Number,
        icon: String,
        ext: String,
    },
    provider: {
        name: String,
        url: String,
        favicon: String,
    },
    /* User */
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
});
//Schema: Options
var OptionSchema = new Schema({
    text: String,
    image: {
        m: String,
        l: String,
    },
    bound: String,
    voters: [{ type: ObjectId, ref: "User" }],
});
//Schema: Article block
var ArticleBlockSchema = new Schema({
    order: { type: Number, index: true },
    slug: { type: String, index: true, unique: true, sparse: true },
    type: {
        type: String,
        required: true,
        enum: [
            "text",
            "gallery",
            "audio",
            "video",
            "file",
            "gif",
            "link",
            "embed",
            "toggle",
            "callout",
            "people",
            "logos",
            "breather",
            "button",
            "mcq",
            "journal",
            "discussion",
        ],
    },
    color: {
        back: String,
        text: String,
        border: String,
    },
    /* Reference */
    block: { type: ObjectId, ref: "Block" },
    /* Text */
    text: String,
    title: String,
    desc: String,
    image: {
        m: String,
        l: String,
        bg: String,
    },
    bound: Number,
    images: [String],
    /* Gallery */
    gallery: [ImageSchema],
    /* File, Audio, Video */
    file: {
        size: Number,
        icon: String,
        ext: String,
    },
    /* Link | File */
    provider: {
        name: String,
        url: String,
        favicon: String,
    },
    embed: String, //video code
    embed_type: String,
    publish_date: Date,
    /* MCQs | Image MCQs */
    mcqs: [OptionSchema],
    is_multiple: { type: Boolean, default: false },
    /* Journaling */
    journal_type: { type: String, enum: ["text", "audio", "video", "file"] },
    answers: [AnswerSchema],
    /* Discussion */
    discussion: { type: ObjectId, ref: "Discussion" },
    /* Button */
    button: {
        text: String,
        url: String,
        back_color: String,
    },
    /* GIF */
    gif: {
        embed: String,
        url: String,
        width: String,
        height: String,
    },
    /* People or logos block */
    people: [{ type: ObjectId, ref: "Person" }],
    /* User */
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
});
//Schema: Block
var BlockSchema = new Schema({
    order: { type: Number, index: true },
    slug: { type: String, index: true },
    type: {
        type: String,
        required: true,
        enum: [
            "header",
            "header_video",
            "header_bg",
            "header_media",
            "section",
            "section_basic",
            "section_media",
            "section_list",
            "container",
            "body_text",
            "body_html",
            "body_embed",
            "feed",
            "body_carousel",
            "body_carousel_text",
            "people",
            "logos",
            "breather",
            "calendar",
            "content",
        ],
    },
    category: {
        type: String,
        enum: ["news", "blog", "directors", "resources"],
        index: true,
    },
    style: { type: String, enum: ["normal", "bold"], default: "normal" },
    resource_type: {
        type: String,
        enum: ["file", "image", "video"],
        index: true,
    },
    /* Content */
    text: {
        title: String,
        desc: String,
        html: String,
        summary: String,
        label: String,
    },
    image: {
        m: String,
        l: String,
        meta: String,
        icon: String,
        bg: String,
    },
    imageb: {
        bg: String, //karubaki@dp
    },
    images: [String],
    url: {
        ref: String,
        embed: String,
    },
    button: {
        text: String,
        url: String,
        embed: String,
    },
    buttonb: {
        text: String,
        url: String,
        embed: String,
    },
    story: {
        title: String,
        text: String,
        url: String,
    },
    /* Section media orientation */
    orientation: { type: String, enum: ["left", "right"] },
    /* Section items */
    items: [ItemSchema],
    /* Static card image shape */
    shape: {
        type: String,
        enum: ["rectangle", "square", "circle", "background"],
    },
    /* Gallery */
    gallery: [ImageSchema],
    /* People */
    people: [{ type: ObjectId, ref: "Person" }],
    /* Events */
    events: [EventSchema],
    /* If dynamic */
    formula: {
        type: String,
        enum: [
            "empty",
            "tags",
            "projects",
            "events",
            "news",
            "blog",
            "directors",
            "resources",
        ],
        index: true,
    },
    row_count: { type: Number, default: 0 },
    /* Page */
    page: { type: ObjectId, ref: "Page", index: true },
    related: [{ type: ObjectId, ref: "Page", index: true }],
    tags: [{ type: ObjectId, ref: "ArticleTag" }],
    /* Style */
    width: { type: String, enum: ["full", "two-third", "half", "one-third"] },
    width_pct: Number, //Width percentage
    color: {
        bg: String,
        text: String,
        btn_bg: String,
        btn_text: String,
    },
    theme: String,
    gradient: {
        angle: Number,
        start: String,
        middle: String,
        end: String,
    },
    padding: {
        top: Number,
        right: Number,
        bottom: Number,
        left: Number,
        btn_top: Number,
        btn_right: Number,
        btn_bottom: Number,
        btn_left: Number,
    },
    margin: {
        top: Number,
        right: Number,
        bottom: Number,
        left: Number,
        btn_top: Number,
        btn_right: Number,
        btn_bottom: Number,
        btn_left: Number,
    },
    border: {
        top: Number,
        right: Number,
        bottom: Number,
        left: Number,
        color: String,
        radius: Number,
        btn_top: Number,
        btn_right: Number,
        btn_bottom: Number,
        btn_left: Number,
        btn_color: String,
        btn_radius: Number,
    },
    font: {
        size: Number,
        style: {
            type: String,
            enum: ["regular", "italic", "bold", "bolditalic"],
        },
    },
    alignment: { type: String, enum: ["left", "center", "right"] },
    /* If container */
    container_view: {
        type: String,
        enum: ["list", "card", "mixed", "carousel"],
    },
    /* Feed */
    feed: String,
    /* Location */
    location: {
        country: String,
        lat: String,
        long: String,
    },
    /* Folder */
    is_folder: { type: Boolean, default: false },
    folder: ObjectId,
    /* Actions */
    is_archived: { type: Boolean, default: false },
    /* User */
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
    /* Optional */
    pages: [DummyPageSchema],
});
//Sub blocks
BlockSchema.add({ blocks: [BlockSchema] });
//Schema: Page
var PageSchema = new Schema({
    title: { type: String, required: true, index: true },
    url: { type: String, index: true, unique: true },
    category: {
        type: String,
        index: true,
        enum: [
            "institute",
            "newsroom",
            "project",
            "publication",
            "event",
            "external",
            "other",
        ],
    },
    /* Meta */
    desc: String,
    image: {
        m: String,
        l: String,
        meta: String,
        favicon: String,
        apple: String,
    },
    /* Menu */
    menu: {
        text: String,
        html: String,
    },
    /* Order */
    order: { type: Number, index: true, default: 1 },
    level: { type: Number, default: 1 },
    /* External */
    ref_url: String,
    /* Actions */
    is_published: { type: Boolean, default: false },
    is_featured: { type: Boolean, default: false },
    is_archived: { type: Boolean, default: false },
    /* User */
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
    /* Optional fields */
    blocks: [BlockSchema],
});
//Schema: Person
var PersonSchema = new Schema({
    type: { type: String, enum: ["author", "team", "partner"], index: true },
    name: { type: String, required: true, index: true },
    about: String,
    desc: String,
    initials: String,
    image: {
        m: String,
        l: String,
    },
    email: { type: String, index: true },
    url: String,
    /* User */
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
});
//Schema: File
var FileSchema = new Schema({
    title: String,
    url: String,
    short_url: String,
    image: {
        m: String,
        l: String,
    },
    bound: Number,
    size: Number,
    ext: String,
    /* Folder */
    is_folder: { type: Boolean, default: false },
    folder: ObjectId,
    /* User */
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
});
//Schema: Log
var LogSchema = new Schema({
    action: String,
    type: String,
    /* User */
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    /* Entity */
    entity: {
        page: { type: ObjectId, ref: "Page", index: true },
        article: { type: ObjectId, ref: "Block", index: true },
        person: { type: ObjectId, ref: "Person", index: true },
        file: { type: ObjectId, ref: "File", index: true },
    },
    title: String,
});
//Schema: Members
var MemberSchema = new Schema({
    user: { type: ObjectId, ref: "User" },
    added_by: { type: ObjectId, ref: "User" },
    added_at: Date,
    email: { type: String, index: true },
    permit_val: {
        type: String,
        enum: ["moderator", "active", "inactive", "invited"],
    },
});
//Schema: Tags
var TagSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, index: true },
    desc: String,
    color: String,
    /* States */
    is_active: { type: Boolean, default: true },
    is_public: { type: Boolean, default: true },
    /* User */
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
    /* User actions */
    members: [MemberSchema],
    subscribers: [{ type: ObjectId, ref: "User" }],
    count: {
        members: { type: Number, default: 0 },
        subscribers: { type: Number, default: 0 },
    },
});
//Schema: Badge
var BadgeSchema = new Schema({
    name: { type: String, required: true },
    desc: String,
    color: String,
    count: { type: Number, default: 0 }, //discussions associated with badge,
    /* User */
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
});
//Schema: Reactions
var ReactionSchema = new Schema({
    name: { type: String, required: true },
    emoji: String,
    /* User */
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
});
//Schema: User reaction
var UserReactionSchema = new Schema({
    reaction: { type: ObjectId, ref: "Reaction" },
    user: { type: ObjectId, ref: "User" },
    added_at: { type: Date, default: Date.now },
});
//Schema: Comments on discussion
var CommentSchema = new Schema({
    comment: String,
    summary: String,
    images: [String],
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
    creator: { type: ObjectId, ref: "User" },
    anon: {
        id: String,
        name: String,
    },
    likes: [{ type: ObjectId, ref: "User" }],
    flag_count: { type: Number, default: 0 },
    is_recent: { type: Boolean },
    reply_to: ObjectId,
});
//Schema: Options for polls
var PollSchema = new Schema({
    text: String,
    voters: [{ type: ObjectId, ref: "User" }],
    order: Number,
});
//Schema: Discussion
var DiscussionSchema = new Schema({
    type: {
        type: String,
        enum: ["text", "link", "file", "image", "video", "poll"],
        index: true,
    },
    slug: { type: String, index: true },
    status: {
        type: String,
        index: true,
        enum: ["featured", "daily", "queued", "other"],
        default: "other",
    },
    /* Text */
    title: String,
    desc: String,
    summary: String,
    image: {
        m: String,
        l: String,
    },
    bound: Number,
    images: [String],
    /* Link | File */
    provider: {
        name: String,
        url: String,
        favicon: String,
    },
    embed: String, //video code
    publish_date: Date,
    /* File */
    file: {
        size: Number,
        icon: String,
        ext: String,
    },
    /* Polls */
    polls: [PollSchema],
    has_voted: { type: Boolean, default: false },
    /* Tags */
    tags: [{ type: ObjectId, ref: "Tag" }],
    /* User */
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    updated_at: Date,
    /* User actions */
    badge: { type: ObjectId, ref: "Badge", index: true },
    reactions: [UserReactionSchema],
    /* Admin actions */
    is_pinned: { type: Boolean, default: false },
    moderators: [{ type: ObjectId, ref: "User" }],
    /* Comments */
    comments: [CommentSchema],
    count: { type: Number, default: 0 },
});
//Schema: Streak
var StreakSchema = new Schema({
    user: { type: ObjectId, ref: "User", index: true },
    date: String, //A string in YYYY-MM-DD format
    count: { type: Number, default: 0 },
    discussions: [{ type: ObjectId, ref: "Discussion" }],
});
//Schema: User respective blocks
var UserBlockSchema = new Schema({
    user: { type: ObjectId, ref: "User", index: true },
    following: [{ type: ObjectId, ref: "User" }], //People whom I am following
    followers: [{ type: ObjectId, ref: "User" }], //People who are following me
});
//Schema: Activity
var ActivitySchema = new Schema({
    action: String,
    /* User */
    user_for: { type: ObjectId, ref: "User", index: true },
    creator: { type: ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
    /* Entity */
    entity: {
        tag: { type: ObjectId, ref: "Tag", index: true },
        discussion: { type: ObjectId, ref: "Discussion", index: true },
    },
    /* Comment */
    comment: {
        text: String,
        anon: String,
    },
    is_new: { type: Boolean, default: true },
});
//Schema: Form
var FormSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
});
//Create the model and expose it to app
module.exports.Ticker = mongoose.model("Ticker", TickerSchema);
module.exports.Site = mongoose.model("Site", SiteSchema);
module.exports.Item = mongoose.model("Item", ItemSchema);
module.exports.Image = mongoose.model("Image", ImageSchema);
module.exports.Event = mongoose.model("Event", EventSchema);
module.exports.DummyPage = mongoose.model("DummyPage", DummyPageSchema);
module.exports.ArticleTag = mongoose.model("ArticleTag", ArticleTagSchema);
module.exports.Answer = mongoose.model("Answer", AnswerSchema);
module.exports.Option = mongoose.model("Option", OptionSchema);
module.exports.ArticleBlock = mongoose.model(
    "ArticleBlock",
    ArticleBlockSchema
);
module.exports.Block = mongoose.model("Block", BlockSchema);
module.exports.Page = mongoose.model("Page", PageSchema);
module.exports.Person = mongoose.model("Person", PersonSchema);
module.exports.File = mongoose.model("File", FileSchema);
module.exports.Log = mongoose.model("Log", LogSchema);
module.exports.Tag = mongoose.model("Tag", TagSchema);
module.exports.Badge = mongoose.model("Badge", BadgeSchema);
module.exports.Member = mongoose.model("Member", MemberSchema);
module.exports.Reaction = mongoose.model("Reaction", ReactionSchema);
module.exports.UserReaction = mongoose.model(
    "UserReaction",
    UserReactionSchema
);
module.exports.Comment = mongoose.model("Comment", CommentSchema);
module.exports.Poll = mongoose.model("Poll", PollSchema);
module.exports.Discussion = mongoose.model("Discussion", DiscussionSchema);
module.exports.Streak = mongoose.model("Streak", StreakSchema);
module.exports.UserBlock = mongoose.model("UserBlock", UserBlockSchema);
module.exports.Activity = mongoose.model("Activity", ActivitySchema);
module.exports.Form = mongoose.model("Form", FormSchema);
