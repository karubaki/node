//jQuery pretty date
Handlebars.registerHelper("prettyDate", function (date) {
    return $.format.prettyDate(date);
});
//jQuery date in D MMM format
Handlebars.registerHelper("pageDate", function (date) {
    return $.format.date(date, "MMMM D, yyyy");
});
//Check if current user is creator
Handlebars.registerHelper("isCreator", function (userId, options) {
    var currentUser =
        $(".pageWrap").data("user") || $(".mainWrap").data("user");
    if (currentUser == userId) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
//Check if current user is creator or admin
Handlebars.registerHelper("isCreatorOrAdmin", function (userId, options) {
    var currentUser =
        $(".pageWrap").data("user") || $(".mainWrap").data("user");
    if (currentUser == userId || $(".mainWrap").data("type") == "admin") {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
//Check if not creator
Handlebars.registerHelper("isNotCreator", function (userId, options) {
    if (!userId) return options.inverse(this);
    var currentUser =
        $(".pageWrap").data("user") || $(".mainWrap").data("user");
    if (currentUser != userId) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
//Check if not creator or member
Handlebars.registerHelper(
    "isNotCreatorOrMember",
    function (creator, members, options) {
        if (!creator) return options.inverse(this);
        var creator_id = creator._id || creator;
        var member_ids = [creator_id];
        for (var i = 0; i < members.length; i++) {
            if (members[i].user) member_ids.push(members[i].user._id);
        }
        //Check if current user exists
        var currentUser =
            $(".pageWrap").data("user") || $(".mainWrap").data("user");
        if (member_ids.indexOf(currentUser) < 0) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    }
);
//Check if current user is in the array
Handlebars.registerHelper("hasCurrentUser", function (arr, options) {
    var currentUser =
        $(".pageWrap").data("user") || $(".mainWrap").data("user");
    if (arr.indexOf(currentUser) > -1) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
//Check if current user is in the members array
Handlebars.registerHelper(
    "hasCurrentUserInMembers",
    function (members, options) {
        var currentUser =
            $(".pageWrap").data("user") || $(".mainWrap").data("user");
        if (members && members.length) {
            for (var i = 0; i < members.length; i++) {
                if (members[i].user._id == currentUser) {
                    return options.fn(this);
                }
            }
            return options.inverse(this);
        } else {
            return options.inverse(this);
        }
    }
);
//Check if current user is inactive in members array
Handlebars.registerHelper(
    "isCurrentMemberInactive",
    function (members, options) {
        var currentUser = $(".mainWrap").data("user");
        if (members && members.length) {
            for (var i = 0; i < members.length; i++) {
                if (
                    members[i].user._id == currentUser &&
                    members[i].permit_val == "inactive"
                ) {
                    return options.fn(this);
                }
            }
            return options.inverse(this);
        } else {
            return options.inverse(this);
        }
    }
);
//Get file icon
Handlebars.registerHelper("getFileIcon", function (extension) {
    var icon;
    switch (extension) {
        case "pdf":
            icon = "file-pdf";
            break;
        case "docx":
        case "doc":
        case "pages":
            icon = "file-doc";
            break;
        case "pptx":
        case "ppt":
        case "posx":
        case "key":
            icon = "file-ppt";
            break;
        case "xlsx":
        case "xls":
        case "sheet":
        case "csv":
            icon = "file-xls";
            break;
        case "zip":
        case "tar":
        case "tar.gz":
        case "gz":
        case "rar":
            icon = "file-zip";
            break;
        case "mp3":
        case "mp4":
            icon = "file-song";
            break;
        case "mov":
        case "mpeg":
        case "avi":
            icon = "file-video";
            break;
        case "ai":
            icon = "file-ai";
            break;
        case "sketch":
            icon = "file-sketch";
            break;
        case "psd":
            icon = "file-psd";
            break;
        case "html":
        case "php":
            icon = "file-code";
            break;
        case "js":
        case "css":
            icon = "file-css";
            break;
        default:
            icon = "file-normal";
    }
    return new Handlebars.SafeString(icon);
});
//Handlebars get file size
Handlebars.registerHelper("getFileSize", function (bytes) {
    if (bytes == 0) return "0 Bytes";
    var k = 1000,
        dm = 1,
        sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    var string =
        parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    return new Handlebars.SafeString(string);
});
//Handlebars get half height
Handlebars.registerHelper("getHalfHeight", function (height) {
    var half_height = parseInt(height / 2);
    return new Handlebars.SafeString(half_height);
});
//Get first character
Handlebars.registerHelper("getFirstChar", function (string) {
    if (string) var string = string.charAt(0).toUpperCase();
    return new Handlebars.SafeString(string);
});
//Handlebars get first name
Handlebars.registerHelper("getFirstName", function (string) {
    if (string) var string = string.split(" ")[0];
    return new Handlebars.SafeString(string);
});
//Handlebars get blocks for each row
Handlebars.registerHelper("getRowsOfBlocks", function (blocks, options) {
    var blocks_arr = [];
    var index = 0;
    for (var i = 0; i < blocks.length; i++) {
        if (i == 0) {
            blocks_arr.push([blocks[i]]);
        } else {
            if (i % 3 == 0) {
                blocks_arr.push([blocks[i]]);
                index += 1;
            } else {
                blocks_arr[index].push(blocks[i]);
            }
        }
    }
    return options.fn(blocks_arr);
});
//Get full date
Handlebars.registerHelper("fullDate", function (startDate, endDate) {
    var fullDateString;
    var timeZoneOffset = new Date().getTimezoneOffset();
    if (endDate) {
        var startDate = new Date(
            new Date(startDate).getTime() - timeZoneOffset * 60 * 1000
        );
        var endDate = new Date(
            new Date(endDate).getTime() - timeZoneOffset * 60 * 1000
        );
        if (startDate.getMonth() == endDate.getMonth()) {
            fullDateString =
                $.format.date(startDate, "MMMM D") +
                " - " +
                $.format.date(endDate, "D");
        } else {
            fullDateString =
                $.format.date(startDate, "MMMM D") +
                " - " +
                $.format.date(endDate, "MMMM D");
        }
    } else {
        var startDate = new Date(
            new Date(startDate).getTime() - timeZoneOffset * 60 * 1000
        );
        fullDateString = $.format.date(startDate, "MMMM D");
    }
    return new Handlebars.SafeString(fullDateString);
});
//jQuery discussion month
Handlebars.registerHelper("getDiscussionMonth", function (date) {
    if (!date) return new Handlebars.SafeString("");
    if (date == "Today" || date == "Yesterday") {
        return new Handlebars.SafeString(date);
    } else {
        var monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        var p = date.split("-");
        //Get current year
        var currentYear = new Date().getFullYear();
        if (currentYear != p[1]) {
            var string = monthNames[p[0] - 1] + ", " + p[1];
        } else {
            var string = monthNames[p[0] - 1];
        }
        return new Handlebars.SafeString(string);
    }
});
//Handlebars get count
Handlebars.registerHelper("getCounts", function (num, string) {
    if (num == 0) {
        var count = "";
    } else if (num == 1) {
        if (string) var count = "<b>1</b> " + string;
        else var count = "<b>1</b>";
    } else {
        if (string) var count = "<b>" + num + "</b> " + string + "s";
        else var count = "<b>" + num + "</b>";
    }
    return new Handlebars.SafeString(count);
});
//Handlebars has user voted
Handlebars.registerHelper("hasUserVoted", function (arr, options) {
    var currentUser = $(".mainWrap").data("user");
    var users = [];
    for (var i = 0; i < arr.length; i++) {
        users = users.concat(arr[i].voters);
    }
    if (users.indexOf(currentUser) > -1) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
//Handlebars get percentage votes
Handlebars.registerHelper("getPercentageVotes", function (arr, id) {
    var count = 0;
    var current;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i]._id == id) {
            current = arr[i].voters.length;
        }
        count += arr[i].voters.length;
    }
    var percentage = (current / count) * 100;
    return new Handlebars.SafeString(percentage);
});
//Handlebars get total votes
Handlebars.registerHelper("getTotalVotes", function (arr) {
    var count = 0;
    for (var i = 0; i < arr.length; i++) {
        count += arr[i].voters.length;
    }
    if (count == 0) {
        var string = "<b> No </b> votes";
    } else if (count == 1) {
        var string = "<b> 1 </b> vote";
    } else {
        var string = "<b> " + count + "</b> votes";
    }
    return new Handlebars.SafeString(string);
});
//Check if current user has tag edit access
Handlebars.registerHelper(
    "hasTagEditAccess",
    function (creator, members, options) {
        var currentUser = $(".mainWrap").data("user");
        if (currentUser == creator._id) {
            return options.fn(this);
        } else {
            if (members && members.length) {
                for (var i = 0; i < members.length; i++) {
                    if (
                        members[i].user._id == currentUser &&
                        members[i].permit_val == "moderator"
                    ) {
                        return options.fn(this);
                    }
                }
                return options.inverse(this);
            } else {
                return options.inverse(this);
            }
        }
    }
);
//Check if current user is anon
Handlebars.registerHelper("isAnon", function (userId, options) {
    var anonUser = $(".mainWrap").data("anon");
    if (anonUser == userId) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
//Check if current user is admin
Handlebars.registerHelper("isAdmin", function (options) {
    var userType = $(".mainWrap").data("type");
    if (userType == "admin") {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
//Handlebars get S3 Image Url
Handlebars.registerHelper("getS3ImageUrl", function (url) {
    var string = url.replace(
        "d1c337161ud3pr.cloudfront.net",
        "mgiep-files.s3.amazonaws.com"
    );
    return new Handlebars.SafeString(string);
});
//jQuery activity date
Handlebars.registerHelper("activityDate", function (date) {
    if (!date) return new Handlebars.SafeString("");
    if (date == "Today" || date == "Yesterday") {
        return new Handlebars.SafeString(date);
    } else {
        var monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        var p = date.split("-");
        //Get current year
        var currentYear = new Date().getFullYear();
        if (currentYear != p[2]) {
            var string = monthNames[p[1] - 1] + " " + p[0] + ", " + p[2];
        } else {
            var string = monthNames[p[1] - 1] + " " + p[0];
        }
        return new Handlebars.SafeString(string);
    }
});
//jQuery activity time
Handlebars.registerHelper("activityTime", function (date) {
    if (!date) return new Handlebars.SafeString("");
    var date = new Date(date);
    var string = $.format.date(date, "hh:mm a");
    return new Handlebars.SafeString(string);
});
//Handlebars get first name
Handlebars.registerHelper("getSignature", function (string) {
    if (string) {
        var firstName = string.split(" ")[0];
        var lastName = string.split(" ")[1];
        if (lastName) {
            lastName = lastName.charAt(0);
            firstName = firstName + " " + lastName + ".";
        }
    }
    return new Handlebars.SafeString(firstName);
});
//Remove HTML tags
Handlebars.registerHelper("stripScripts", function (param) {
    if (!param) return "";
    var regex = /(<([^>]+)>)/gi;
    return param.replace(regex, "");
});
//Pluralize
Handlebars.registerHelper("pluralize", function (number, singular, plural) {
    if (number === 1) return singular;
    else return typeof plural === "string" ? plural : singular + "s";
});
//Plural count
Handlebars.registerHelper("pluralCount", function (number, singular, plural) {
    return number + " " + Handlebars.helpers.pluralize.apply(this, arguments);
});

//karubaki@dp
Handlebars.registerHelper("isMobDevice",function(options){
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        // true for mobile device
         return options.fn(this);;
      }else{
        // false for not mobile device
        return options.inverse(this);
      }
});
