//Editor buttons
var editor_btns = [
    "format",
    "bold",
    "italic",
    "underline",
    "deleted",
    "link",
    "lists",
    "line",
    "image",
];
var editor_plugins = [
    "alignment",
    "fontcolor",
    "fontfamily",
    "fontsize",
    "inlinestyle",
    "table",
    "video",
];
var editor_formatting = ["p", "blockquote", "pre", "h1", "h2", "h3"];
//Global functions
//Generate random uuid
function generateRandomUUID() {
    return uuidv1();
}
//Format date
function formatDateInDDMMYYYY(date) {
    var formattedDate =
        date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    return formattedDate;
}
function formatDateInMMYYYY(date) {
    var formattedDate = date.getMonth() + 1 + "-" + date.getFullYear();
    return formattedDate;
}
//Function to group activities by date
function groupActivitiesByDate(activities) {
    var dateToday = new Date();
    var today = formatDateInDDMMYYYY(dateToday);
    //Yesterday
    dateToday.setDate(dateToday.getDate() - 1);
    var yesterday = formatDateInDDMMYYYY(dateToday);
    //Dates collection
    var dates = new Backbone.Collection();
    var dateArray = [];
    activities.each(function (activity) {
        //Get activity object
        var activityObj = activity.toJSON();
        //Update time to local
        var activity_date = formatDateInDDMMYYYY(
            new Date(activity.get("created_at"))
        );
        if (dateArray.indexOf(activity_date) > -1) {
            //Get date model
            if (activity_date == today) {
                var dateModel = dates.where({ date: "Today" });
            } else if (activity_date == yesterday) {
                var dateModel = dates.where({ date: "Yesterday" });
            } else {
                var dateModel = dates.where({ date: activity_date });
            }
            dateModel = dateModel[0];
            //Add project and activity
            dateModel.get("activities").push(activityObj);
        } else {
            //Push to dateArray
            dateArray.push(activity_date);
            //Create date model
            var dateModel = new Backbone.Model();
            //Set date
            if (activity_date == today) {
                dateModel.set("date", "Today");
            } else if (activity_date == yesterday) {
                dateModel.set("date", "Yesterday");
            } else {
                dateModel.set("date", activity_date);
            }
            //Set project to dateModel
            dateModel.set("activities", [activityObj]);
            //Add to dates collection
            dates.push(dateModel);
        }
    });
    return dates;
}
//Function to group discussions by sections on basis of date
function groupDiscussionsByDate(discussions) {
    var dateToday = new Date();
    var today = formatDateInDDMMYYYY(dateToday);
    //Yesterday
    dateToday.setDate(dateToday.getDate() - 1);
    var yesterday = formatDateInDDMMYYYY(dateToday);
    //Sections collection
    var sections = new Backbone.Collection();
    var sectionArray = [];
    discussions.each(function (discussion) {
        //Get discussion object
        var discussionObj = discussion.toJSON();
        //Update time to local
        var discussion_date = formatDateInDDMMYYYY(
            new Date(discussion.get("updated_at"))
        );
        var discussion_month = formatDateInMMYYYY(
            new Date(discussion.get("updated_at"))
        );
        //Group
        if (
            sectionArray.indexOf(discussion_date) > -1 ||
            sectionArray.indexOf(discussion_month) > -1
        ) {
            //Get section model
            if (discussion_date == today) {
                var sectionModel = sections.where({ date: "Today" });
            } else if (discussion_date == yesterday) {
                var sectionModel = sections.where({ date: "Yesterday" });
            } else {
                var sectionModel = sections.where({ date: discussion_month });
            }
            sectionModel = sectionModel[0];
            //Add discussion
            sectionModel.get("discussions").push(discussionObj);
        } else {
            //Create section model
            var sectionModel = new Backbone.Model();
            //Set date
            if (discussion_date == today) {
                sectionModel.set("date", "Today");
                sectionArray.push(discussion_date);
            } else if (discussion_date == yesterday) {
                sectionModel.set("date", "Yesterday");
                sectionArray.push(discussion_date);
            } else {
                sectionModel.set("date", discussion_month);
                sectionArray.push(discussion_month);
            }
            //Add discussion
            sectionModel.set("discussions", [discussionObj]);
            //Add to sections collection
            sections.push(sectionModel);
        }
    });
    return sections;
}
//Function to group discussions by sections on basis of comment count
function groupDiscussionsByTop(discussions) {
    //Sections collection
    var sections = new Backbone.Collection();
    var index = 0;
    var lastSectionModel;
    discussions.each(function (discussion) {
        //Get discussion object
        var discussionObj = discussion.toJSON();
        //Group
        if (index % 20 == 0) {
            //Create section model
            var sectionModel = new Backbone.Model();
            //Get range
            var startIndex = index + 1;
            var endIndex = index + 20;
            var range = "Top: " + startIndex + " - " + endIndex;
            //Set range
            sectionModel.set("range", range);
            //Add discussion
            sectionModel.set("discussions", [discussionObj]);
            //Add to sections collection
            sections.push(sectionModel);
            lastSectionModel = sectionModel;
        } else {
            //Push discussion
            lastSectionModel.get("discussions").push(discussionObj);
        }
        index++;
    });
    return sections;
}
//Place caret at end of contenteditable
function placeCaretAtEnd(el) {
    el.focus();
    if (
        typeof window.getSelection != "undefined" &&
        typeof document.createRange != "undefined"
    ) {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}
//Function to get caret position
function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}
//Insert text at cursor without changing cursor position
function insertTextAtCursor(text) {
    var sel, range, html;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        }
    } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = text;
    }
}
//Scroll to selected
function scrollToSelectedBlock(index) {
    var offset = $(".one-block").eq(index).offset().top - $(window).scrollTop();
    offset -= 50;
    $("html, body").animate({ scrollTop: offset }, 800);
}
//Get block style
function getBlockStyle(style) {
    var string = "";
    //Width
    if (style.width_pct) {
        string += "width: " + style.width_pct + "%;";
    }
    //Color
    if (style.color) {
        if (style.color.bg) {
            string += "background-color: " + style.color.bg + " !important;";
        }
        if (style.color.text) {
            string += "color: " + style.color.text + " !important;";
        }
    }
    //Linear gradient
    if (
        style.gradient &&
        style.gradient.angle != null &&
        style.gradient.start &&
        style.gradient.end
    ) {
        if (style.gradient.middle) {
            string +=
                "background: linear-gradient(" +
                style.gradient.angle +
                "deg, " +
                style.gradient.start +
                " 0%, " +
                style.gradient.middle +
                " 50%, " +
                style.gradient.end +
                " 100%) !important;";
        } else {
            string +=
                "background: linear-gradient(" +
                style.gradient.angle +
                "deg, " +
                style.gradient.start +
                " 0%, " +
                style.gradient.end +
                " 100%) !important;";
        }
    }
    //Padding
    if (style.padding) {
        if (style.padding.top != null) {
            string += "padding-top: " + style.padding.top + "px;";
        }
        if (style.padding.right != null) {
            string += "padding-right: " + style.padding.right + "px;";
        }
        if (style.padding.bottom != null) {
            string += "padding-bottom: " + style.padding.bottom + "px;";
        }
        if (style.padding.left != null) {
            string += "padding-left: " + style.padding.left + "px;";
        }
    }
    //Margin
    if (style.margin) {
        if (style.margin.top != null) {
            string += "margin-top: " + style.margin.top + "px;";
        }
        if (style.margin.right != null) {
            string += "margin-right: " + style.margin.right + "px;";
        }
        if (style.margin.bottom != null) {
            string += "margin-bottom: " + style.margin.bottom + "px;";
        }
        if (style.margin.left != null) {
            string += "margin-left: " + style.margin.left + "px;";
        }
    }
    //Border
    if (style.border) {
        if (style.border.top != null) {
            string += "border-top: " + style.border.top + "px solid;";
        }
        if (style.border.right != null) {
            string += "border-right: " + style.border.right + "px solid;";
        }
        if (style.border.bottom != null) {
            string += "border-bottom: " + style.border.bottom + "px solid;";
        }
        if (style.border.left != null) {
            string += "border-left: " + style.border.left + "px solid;";
        }
        if (style.border.color) {
            string += "border-color: " + style.border.color + ";";
        }
        if (style.border.radius != null) {
            string += "border-radius: " + style.border.radius + "px;";
        }
    }
    //Font
    if (style.font) {
        if (style.font.size) {
            string += "font-size: " + style.font.size + "px;";
        }
        if (style.font.style == "regular") {
            string += "font-weight: normal;";
            string += "font-style: normal;";
        } else if (style.font.style == "italic") {
            string += "font-weight: normal;";
            string += "font-style: italic;";
        } else if (style.font.style == "bold") {
            string += "font-weight: 600;";
            string += "font-style: normal;";
        } else if (style.font.style == "bolditalic") {
            string += "font-weight: 600;";
            string += "font-style: italic;";
        }
    }
    //Alignment
    if (style.alignment) {
        string += "text-align: " + style.alignment + ";";
    }
    return string;
}
//Get button style
function getButtonStyle(style) {
    var string = "";
    //Color
    if (style.color) {
        if (style.color.btn_bg) {
            string +=
                "background-color: " + style.color.btn_bg + " !important;";
        }
        if (style.color.btn_text) {
            string += "color: " + style.color.btn_text + " !important;";
        }
    }
    //Padding
    if (style.padding) {
        if (style.padding.btn_top != null) {
            string += "padding-top: " + style.padding.btn_top + "px;";
        }
        if (style.padding.btn_right != null) {
            string += "padding-right: " + style.padding.btn_right + "px;";
        }
        if (style.padding.btn_bottom != null) {
            string += "padding-bottom: " + style.padding.btn_bottom + "px;";
        }
        if (style.padding.btn_left != null) {
            string += "padding-left: " + style.padding.btn_left + "px;";
        }
    }
    //Margin
    if (style.margin) {
        if (style.margin.btn_top != null) {
            string += "margin-top: " + style.margin.btn_top + "px;";
        }
        if (style.margin.btn_right != null) {
            string += "margin-right: " + style.margin.btn_right + "px;";
        }
        if (style.margin.btn_bottom != null) {
            string += "margin-bottom: " + style.margin.btn_bottom + "px;";
        }
        if (style.margin.btn_left != null) {
            string += "margin-left: " + style.margin.btn_left + "px;";
        }
    }
    //Border
    if (style.border) {
        if (style.border.btn_top != null) {
            string += "border-top: " + style.border.btn_top + "px solid;";
        }
        if (style.border.btn_right != null) {
            string += "border-right: " + style.border.btn_right + "px solid;";
        }
        if (style.border.btn_bottom != null) {
            string += "border-bottom: " + style.border.btn_bottom + "px solid;";
        }
        if (style.border.btn_left != null) {
            string += "border-left: " + style.border.btn_left + "px solid;";
        }
        if (style.border.btn_color) {
            string += "border-color: " + style.border.btn_color + ";";
        }
        if (style.border.btn_radius != null) {
            string += "border-radius: " + style.border.btn_radius + "px;";
        }
    }
    return string;
}
//Add button style
function addButtonStyle(block, element) {
    var border_styles = {
        color: block.get("color"),
        padding: block.get("padding"),
        margin: block.get("margin"),
        border: block.get("border"),
    };
    var buttons = element.find(".block-btn");
    if (buttons.length) {
        buttons.each(function () {
            $(this).attr("style", getButtonStyle(border_styles));
        });
    }
}
//Add block style
function addBlockStyle(block, element) {
    //Type
    var type = block.get("type");
    switch (type) {
        case "header":
            //Header block
            var header_block = element.find(".header-block")[0];
            $(header_block).attr(
                "style",
                getBlockStyle({
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            //Header content
            var header_content = element.find(".header-content")[0];
            $(header_content).attr(
                "style",
                getBlockStyle({
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                })
            );
            //Button style
            addButtonStyle(block, element);
            //Add theme
            if (block.get("theme")) {
                $(header_content).addClass("themed-block");
                $(header_content).addClass(block.get("theme"));
            }
            break;
        case "header_video":
            //Header block
            var header_block = element.find(".header-block")[0];
            $(header_block).attr(
                "style",
                getBlockStyle({
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            //Embed block
            if (block.get("padding") && block.get("padding").right) {
                var embed_block = element.find(".embed-block")[0];
                $(embed_block).attr(
                    "style",
                    "right: " + block.get("padding").right + "px;"
                );
            }
            //Button style
            addButtonStyle(block, element);
            //Add theme
            if (block.get("theme")) {
                $(header_block).addClass("themed-block");
                $(header_block).addClass(block.get("theme"));
            }
            break;
        case "header_bg":
            var header_block = element.find(".header-block")[0];
            $(header_block).attr(
                "style",
                getBlockStyle({
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            //Button style
            addButtonStyle(block, element);
            //Add theme
            if (block.get("theme")) {
                $(header_block).addClass("themed-block");
                $(header_block).addClass(block.get("theme"));
            }
            break;
        case "header_media":
            //Header block
            var header_block = element.find(".header-block")[0];
            $(header_block).attr(
                "style",
                getBlockStyle({
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            //Button style
            addButtonStyle(block, element);
            //Add theme
            if (block.get("theme")) {
                $(header_block).addClass("themed-block");
                $(header_block).addClass(block.get("theme"));
            }
            break;
        case "section":
        case "section_basic":
        case "section_media":
            //Section block
            var section_block = element.find(".section-block")[0];
            $(section_block).attr(
                "style",
                getBlockStyle({
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            //Button style
            addButtonStyle(block, element);
            //Add theme
            if (block.get("theme")) {
                $(section_block).addClass("themed-block");
                $(section_block).addClass(block.get("theme"));
            }
            break;
        case "section_list":
            //Section block
            var section_block = element.find(".section-block")[0];
            $(section_block).attr(
                "style",
                getBlockStyle({
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            //Title color
            if (block.get("color") && block.get("color").text) {
                var items = element.find(".section-left-item");
                if (items.length) {
                    items.each(function () {
                        $(this).attr(
                            "style",
                            "border-color: " +
                                block.get("color").text +
                                " !important;"
                        );
                        var section_title = $(this).find(".section-title")[0];
                        $(section_title).attr(
                            "style",
                            "color: " + block.get("color").text + " !important;"
                        );
                    });
                }
            }
            //Button style
            addButtonStyle(block, element);
            //Add theme
            if (block.get("theme")) {
                $(section_block).addClass("themed-block");
                $(section_block).addClass(block.get("theme"));
            }
            break;
        case "container":
            //Container block
            var container_block = element.find(".container-block")[0];
            $(container_block).attr(
                "style",
                getBlockStyle({
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            //Add theme
            if (block.get("theme")) {
                $(container_block).addClass("themed-block");
                $(container_block).addClass(block.get("theme"));
            }
            //If custom view
            var custom_view = element.find(".container-block .custom-view")[0];
            if (custom_view) {
                var items = element.find(".body-text-block");
                if (items.length) {
                    items.each(function () {
                        $(this).attr(
                            "style",
                            getBlockStyle({
                                color: block.get("color"),
                                gradient: block.get("gradient"),
                            })
                        );
                    });
                }
            }
            //If mixed view
            var mixed_view = element.find(".container-block .view-as-mixed")[0];
            if (mixed_view) {
                var mixed_first = element.find(".mixed-first");
                var mixed_others = element.find(".mixed-others");
                $(mixed_first).attr(
                    "style",
                    getBlockStyle({
                        color: block.get("color"),
                        gradient: block.get("gradient"),
                    })
                );
                $(mixed_others).attr(
                    "style",
                    getBlockStyle({
                        color: block.get("color"),
                        gradient: block.get("gradient"),
                    })
                );
            }
            break;
        case "body_text":
            var card_content = element.find(".container-block")[0];
            $(card_content).attr(
                "style",
                getBlockStyle({
                    width_pct: block.get("width_pct"),
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                    alignment: block.get("alignment"),
                })
            );
            var card_title = element.find(".body-text-block .text-title")[0];
            $(card_title).attr(
                "style",
                getBlockStyle({
                    font: block.get("font"),
                })
            );
            //Button style
            addButtonStyle(block, element);
            //Add theme
            var body_text_block = element.find(".body-text-block")[0];
            if (block.get("theme")) {
                $(body_text_block).addClass("themed-block");
                $(body_text_block).addClass(block.get("theme"));
            }
            //Width
            if (block.get("width")) {
                $(body_text_block).addClass("width-" + block.get("width"));
            }
            break;
        case "body_html":
            //HTML block
            var html_block = element.find(".html-block")[0];
            $(html_block).attr(
                "style",
                getBlockStyle({
                    width_pct: block.get("width_pct"),
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            //Add theme
            if (block.get("theme")) {
                $(html_block).addClass("themed-block");
                $(html_block).addClass(block.get("theme"));
            }
            //Width
            if (block.get("width")) {
                $(html_block).addClass("width-" + block.get("width"));
            }
            break;
        case "body_embed":
            //Embed content
            var embed_content = element.find(".body-embed-block")[0];
            $(embed_content).attr(
                "style",
                getBlockStyle({
                    width_pct: block.get("width_pct"),
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                    alignment: block.get("alignment"),
                })
            );
            var embed_title = element.find(".body-embed-block .text-title")[0];
            $(embed_title).attr(
                "style",
                getBlockStyle({
                    font: block.get("font"),
                })
            );
            //Button style
            addButtonStyle(block, element);
            //Add theme
            if (block.get("theme")) {
                $(embed_content).addClass("themed-block");
                $(embed_content).addClass(block.get("theme"));
            }
            //Width
            if (block.get("width")) {
                $(embed_content).addClass("width-" + block.get("width"));
            }
            break;
        case "body_carousel":
            //Gallery block
            var gallery_block = element.find(".gallery-block")[0];
            $(gallery_block).attr(
                "style",
                getBlockStyle({
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            //Title color
            var items = element.find(".gallery-title");
            if (items.length) {
                items.each(function () {
                    $(this).attr(
                        "style",
                        getBlockStyle({
                            color: block.get("color"),
                            gradient: block.get("gradient"),
                        })
                    );
                    //Apply color to title
                    if (block.get("color") && block.get("color").text) {
                        var title_link = $(this).find("a");
                        if (title_link.length) {
                            $(title_link[0]).attr(
                                "style",
                                "color: " +
                                    block.get("color").text +
                                    " !important;"
                            );
                        }
                    }
                });
            }
            //Add theme
            if (block.get("theme")) {
                $(gallery_block).addClass("themed-block");
                $(gallery_block).addClass(block.get("theme"));
            }
            break;
        case "body_carousel_text":
            //Carousel blocks
            var carousel_blocks = element.find(".carousel-blocks")[0];
            $(carousel_blocks).attr(
                "data-style",
                getBlockStyle({
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            //Items
            var items = element.find(".carousel-block");
            if (items.length) {
                items.each(function () {
                    $(this).attr(
                        "style",
                        getBlockStyle({
                            color: block.get("color"),
                            gradient: block.get("gradient"),
                        })
                    );
                });
            }
            //Button style
            addButtonStyle(block, element);
            //Add theme
            if (block.get("theme")) {
                $(carousel_blocks).addClass("themed-block");
                $(carousel_blocks).addClass(block.get("theme"));
            }
            break;
        case "people":
            //People block
            var people_block = element.find(".people-block")[0];
            $(people_block).attr(
                "style",
                getBlockStyle({
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            var people_title = element.find(".people-block .text-title")[0];
            $(people_title).attr(
                "style",
                getBlockStyle({
                    font: block.get("font"),
                    alignment: block.get("alignment"),
                })
            );
            //Add theme
            if (block.get("theme")) {
                $(people_block).addClass("themed-block");
                $(people_block).addClass(block.get("theme"));
            }
            break;
        case "logos":
            //Logos block
            var logos_block = element.find(".logos-block")[0];
            $(logos_block).attr(
                "style",
                getBlockStyle({
                    width_pct: block.get("width_pct"),
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            var logos_title = element.find(".logos-block .text-title")[0];
            $(logos_title).attr(
                "style",
                getBlockStyle({
                    font: block.get("font"),
                    alignment: block.get("alignment"),
                })
            );
            //Add theme
            if (block.get("theme")) {
                $(logos_block).addClass("themed-block");
                $(logos_block).addClass(block.get("theme"));
            }
            break;
        case "breather":
            var breather_content = element.find(".breather-content")[0];
            $(breather_content).attr(
                "style",
                getBlockStyle({
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                    alignment: block.get("alignment"),
                })
            );
            var breather_title = element.find(
                ".breather-content .text-title"
            )[0];
            $(breather_title).attr(
                "style",
                getBlockStyle({
                    font: block.get("font"),
                })
            );
            //Button style
            addButtonStyle(block, element);
            //Add theme
            if (block.get("theme")) {
                $(breather_content).addClass("themed-block");
                $(breather_content).addClass(block.get("theme"));
            }
            break;
        case "calendar":
            //Calendar block
            var calendar_block = element.find(".calendar-block")[0];
            $(calendar_block).attr(
                "style",
                getBlockStyle({
                    width_pct: block.get("width_pct"),
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            var calendar_title = element.find(".calendar-block .text-title")[0];
            $(calendar_title).attr(
                "style",
                getBlockStyle({
                    font: block.get("font"),
                    alignment: block.get("alignment"),
                })
            );
            //Add theme
            if (block.get("theme")) {
                $(calendar_block).addClass("themed-block");
                $(calendar_block).addClass(block.get("theme"));
            }
            break;
    }
}
//Add sub block style
function addSubBlockStyle(block, element) {
    //Type
    var type = block.get("type");
    switch (type) {
        case "body_text":
            var card_content = element;
            $(card_content).attr(
                "style",
                getBlockStyle({
                    width_pct: block.get("width_pct"),
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                    alignment: block.get("alignment"),
                })
            );
            var card_title = element.find(".text-title")[0];
            $(card_title).attr(
                "style",
                getBlockStyle({
                    font: block.get("font"),
                })
            );
            //Button style
            addButtonStyle(block, element);
            //Add theme
            if (block.get("theme")) {
                $(card_content).addClass("themed-block");
                $(card_content).addClass(block.get("theme"));
            }
            //Width
            if (block.get("width")) {
                $(card_content).addClass("width-" + block.get("width"));
            }
            //Button
            if (block.get("button") && block.get("button").url) {
                $(card_content).addClass("with-btn");
            }
            break;
        case "body_html":
            //HTML block
            var html_block = element;
            $(html_block).attr(
                "style",
                getBlockStyle({
                    width_pct: block.get("width_pct"),
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            //Add theme
            if (block.get("theme")) {
                $(html_block).addClass("themed-block");
                $(html_block).addClass(block.get("theme"));
            }
            //Width
            if (block.get("width")) {
                $(html_block).addClass("width-" + block.get("width"));
            }
            break;
        case "body_embed":
            //Embed content
            var embed_content = element;
            $(embed_content).attr(
                "style",
                getBlockStyle({
                    width_pct: block.get("width_pct"),
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                    alignment: block.get("alignment"),
                })
            );
            var embed_title = element.find(".text-title")[0];
            $(embed_title).attr(
                "style",
                getBlockStyle({
                    font: block.get("font"),
                })
            );
            //Button style
            addButtonStyle(block, element);
            //Add theme
            if (block.get("theme")) {
                $(embed_content).addClass("themed-block");
                $(embed_content).addClass(block.get("theme"));
            }
            //Width
            if (block.get("width")) {
                $(embed_content).addClass("width-" + block.get("width"));
            }
            break;
        case "logos":
            //Logos block
            var logos_block = element;
            $(logos_block).attr(
                "style",
                getBlockStyle({
                    width_pct: block.get("width_pct"),
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            var logos_title = element.find(".text-title")[0];
            $(logos_title).attr(
                "style",
                getBlockStyle({
                    font: block.get("font"),
                    alignment: block.get("alignment"),
                })
            );
            //Add theme
            if (block.get("theme")) {
                $(logos_block).addClass("themed-block");
                $(logos_block).addClass(block.get("theme"));
            }
            break;
        case "calendar":
            //Calendar block
            var calendar_block = element;
            $(calendar_block).attr(
                "style",
                getBlockStyle({
                    width_pct: block.get("width_pct"),
                    color: block.get("color"),
                    gradient: block.get("gradient"),
                    padding: block.get("padding"),
                    margin: block.get("margin"),
                    border: block.get("border"),
                })
            );
            var calendar_title = element.find(".text-title")[0];
            $(calendar_title).attr(
                "style",
                getBlockStyle({
                    font: block.get("font"),
                    alignment: block.get("alignment"),
                })
            );
            //Add theme
            if (block.get("theme")) {
                $(calendar_block).addClass("themed-block");
                $(calendar_block).addClass(block.get("theme"));
            }
            break;
    }
}
