//Utility functions to be used in API.
var fs = require("fs"),
    request = require("request"),
    embedly = require("embedly"),
    im = require("imagemagick"),
    linkify = require("linkifyjs"),
    linkifyHtml = require("linkifyjs/html"),
    htmlToText = require("html-to-text"),
    giphy = require("giphy")(process.env.GIPHY_KEY),
    aws = require("aws-sdk"),
    Uploader = require("s3-streaming-upload").Uploader,
    GeoJSON = require("geojson"),
    _ = require("lodash");
//UUID
const { v4: uuidv4 } = require("uuid");
//Bitly
const BitlyClient = require("bitly").BitlyClient;
const bitly = new BitlyClient(process.env.BITLY);
//Google spreadsheet
const { GoogleSpreadsheet } = require("google-spreadsheet");
//Get linkified text
var get_linkified_text = function (text) {
    var linkifiedText = linkifyHtml(text, {
        target: "_blank",
    });
    linkifiedText = linkifiedText.replace(/\n\r?/g, "<br />");
    return linkifiedText;
};
//Get text summary
var get_text_summary = function (html) {
    //Get summary
    var summary_text = htmlToText.fromString(html, {
        ignoreImage: true,
        ignoreHref: true,
        preserveNewlines: true,
        wordwrap: null,
    });
    summary_text = summary_text.substring(0, 600);
    summary_text = summary_text.replace(/(?:\r\n|\r|\n)/g, "<br />");
    return summary_text;
};
//Get only text
var get_only_text = function (html) {
    var summary_text = htmlToText.fromString(html, {
        ignoreImage: true,
        ignoreHref: true,
        preserveNewlines: true,
        wordwrap: null,
    });
    return summary_text;
};
//Extract link data using embedly
var get_link_metadata = function (link, callback) {
    var EMBEDLY_KEY = process.env.EMBEDLY_KEY;
    var api = new embedly({ key: EMBEDLY_KEY });
    api.extract({ url: link }, function (err, objs) {
        if (!!err) return;
        var link_data = objs[0];
        callback(link_data);
    });
};
//Resize image
var get_resized_image = function (file_name, url, resizelength, callback) {
    var key = uuidv4();
    var original = url;
    var resized = "/tmp/" + key + "_" + file_name + "_resized.png";
    im.resize(
        { srcPath: original, dstPath: resized, width: resizelength },
        function (err, stdout, stderr) {
            if (err) {
                fs.unlink(resized, function (err) {});
                return "";
            }
            //Unlink original as we are only using resized to upload
            fs.unlink(original, function (err) {});
            callback(resized);
        }
    );
};
//Resize and crop image
var get_cropped_image = function (file_name, url, width, height, callback) {
    var key = uuidv4();
    var original = url;
    var cropped = "/tmp/" + key + "_" + file_name + "_cropped.png";
    im.crop(
        {
            srcPath: original,
            dstPath: cropped,
            width: width,
            height: height,
            gravity: "North",
        },
        function (err, stdout, stderr) {
            if (err) {
                fs.unlink(cropped, function (err) {});
                return "";
            }
            //Unlink original as we are only using cropped to upload.
            fs.unlink(original, function (err) {});
            callback(cropped);
        }
    );
};
//Upload file
var upload_file = function (file, file_name, callback) {
    var key = uuidv4();
    var upload = new Uploader({
        accessKey: process.env.AWS_KEY,
        secretKey: process.env.AWS_SECRET,
        bucket: process.env.AWS_BUCKET,
        objectName: process.env.THUMB_DIR + key + "_" + file_name + ".png",
        stream: fs.createReadStream(file),
        objectParams: {
            ACL: "public-read",
        },
    });
    upload.send(function (err) {
        if (!err) {
            fs.unlink(file, function (err) {});
            callback(
                "https://" +
                    process.env.CLOUDFRONT +
                    "/" +
                    process.env.THUMB_DIR +
                    key +
                    "_" +
                    file_name +
                    ".png"
            );
        } else {
            callback("");
        }
    });
};
//Download file from URL
var download_file = function (url, file_name, callback) {
    var key = uuidv4();
    var file = "/tmp/" + key + "_" + file_name + ".png";
    request.head(url, function (err, res, body) {
        var stream = request(url).pipe(fs.createWriteStream(file));
        stream.on("close", function () {
            callback(file);
        });
    });
};
//Get provider key from provider
var get_provider_key = function (provider, image) {
    var key;
    if (
        provider &&
        (provider.name == "Social" || provider.name == "MGIEP") &&
        provider.url != image
    ) {
        key = {
            Key: decodeURIComponent(
                provider.url.split("https://" + process.env.CLOUDFRONT + "/")[1]
            ),
        };
    }
    return key;
};
//Get keys from images
var get_image_keys = function (images, thumbnail) {
    var keys = [];
    if (images && images.length) {
        for (var i = 0; i < images.length; ++i) {
            if (
                images[i] &&
                images[i].indexOf("https://" + process.env.CLOUDFRONT + "/") >
                    -1
            ) {
                keys.push({
                    Key: decodeURIComponent(
                        images[i].split(
                            "https://" + process.env.CLOUDFRONT + "/"
                        )[1]
                    ),
                });
            } else if (
                images[i] &&
                images[i].indexOf(
                    "https://" + process.env.AWS_BUCKET + ".s3.amazonaws.com/"
                ) > -1
            ) {
                keys.push({
                    Key: decodeURIComponent(
                        images[i].split(
                            "https://" +
                                process.env.AWS_BUCKET +
                                ".s3.amazonaws.com/"
                        )[1]
                    ),
                });
            }
        }
    }
    if (
        thumbnail &&
        thumbnail.indexOf("https://" + process.env.CLOUDFRONT + "/") > -1
    ) {
        keys.push({
            Key: decodeURIComponent(
                thumbnail.split("https://" + process.env.CLOUDFRONT + "/")[1]
            ),
        });
    } else if (
        thumbnail &&
        thumbnail.indexOf(
            "https://" + process.env.AWS_BUCKET + ".s3.amazonaws.com/"
        ) > -1
    ) {
        keys.push({
            Key: decodeURIComponent(
                thumbnail.split(
                    "https://" + process.env.AWS_BUCKET + ".s3.amazonaws.com/"
                )[1]
            ),
        });
    }
    return keys;
};
//Delete all s3 image keys
var delete_keys = function (keys) {
    if (keys && keys.length) {
        //Delete s3 objects
        var s3 = new aws.S3();
        s3.deleteObjects(
            {
                Bucket: process.env.AWS_BUCKET,
                Delete: {
                    Objects: keys,
                },
            },
            function (err, data) {}
        );
    }
};
//Get short url
var get_short_url = function (url, callback) {
    bitly
        .shorten(url)
        .then(function (result) {
            var short_url = result.link;
            callback(short_url);
        })
        .catch(function (error) {
            callback("");
        });
};
//Get gifs
var get_gifs_results = function (search_text, callback) {
    giphy.search({ q: search_text, rating: "g" }, function (err, data) {
        callback(data);
    });
};
//Get menu html
var get_menu_html = function (menu_text) {
    var menu_html = "";
    var menu_arr = menu_text.split("\n");
    var is_level_2 = false; //Is level 2 open
    var prev_level;
    var already_closed = false;
    if (menu_arr && menu_arr.length) {
        for (var i = 0; i < menu_arr.length; i++) {
            var one_menu_arr = menu_arr[i].split(",");
            if (one_menu_arr[0].trim() == "1") {
                if (!is_level_2) {
                    if (prev_level == 1) {
                        if (one_menu_arr[3]) {
                            menu_html +=
                                "</div><div class='menu-level level-1'><a href='" +
                                one_menu_arr[2].trim() +
                                "'>" +
                                one_menu_arr[1].trim() +
                                " <span class='new'>New</span></a>";
                        } else {
                            menu_html +=
                                "</div><div class='menu-level level-1'><a href='" +
                                one_menu_arr[2].trim() +
                                "'>" +
                                one_menu_arr[1].trim() +
                                "</a>";
                        }
                        //If last menu item
                        if (i == menu_arr.length - 1) {
                            menu_html += "</div>";
                            already_closed = true;
                        }
                    } else {
                        if (one_menu_arr[3]) {
                            menu_html +=
                                "<div class='menu-level level-1'><a href='" +
                                one_menu_arr[2].trim() +
                                "'>" +
                                one_menu_arr[1].trim() +
                                " <span class='new'>New</span></a>";
                        } else {
                            menu_html +=
                                "<div class='menu-level level-1'><a href='" +
                                one_menu_arr[2].trim() +
                                "'>" +
                                one_menu_arr[1].trim() +
                                "</a>";
                        }
                    }
                } else {
                    if (one_menu_arr[3]) {
                        menu_html +=
                            "</div></div><div class='menu-level level-1'><a href='" +
                            one_menu_arr[2].trim() +
                            "'>" +
                            one_menu_arr[1].trim() +
                            " <span class='new'>New</span></a>";
                    } else {
                        menu_html +=
                            "</div></div><div class='menu-level level-1'><a href='" +
                            one_menu_arr[2].trim() +
                            "'>" +
                            one_menu_arr[1].trim() +
                            "</a>";
                    }
                    is_level_2 = false;
                }
                prev_level = 1;
            } else {
                if (!is_level_2) {
                    if (one_menu_arr[3]) {
                        menu_html +=
                            "<div class='menu-level level-2'><a href='" +
                            one_menu_arr[2].trim() +
                            "'>" +
                            one_menu_arr[1].trim() +
                            " <span class='new'>New</span></a>";
                    } else {
                        menu_html +=
                            "<div class='menu-level level-2'><a href='" +
                            one_menu_arr[2].trim() +
                            "'>" +
                            one_menu_arr[1].trim() +
                            "</a>";
                    }
                    is_level_2 = true;
                } else {
                    if (one_menu_arr[3]) {
                        menu_html +=
                            "<a href='" +
                            one_menu_arr[2].trim() +
                            "'>" +
                            one_menu_arr[1].trim() +
                            " <span class='new'>New</span></a>";
                    } else {
                        menu_html +=
                            "<a href='" +
                            one_menu_arr[2].trim() +
                            "'>" +
                            one_menu_arr[1].trim() +
                            "</a>";
                    }
                }
                prev_level = 2;
            }
        }
    }
    //Finally close the html
    if (!already_closed) menu_html += "</div></div>";
    return menu_html;
};
//Get kindness stories
var get_kindness_stories = function (form_id, callback) {
    var stories = 8300;
    var r = request(
        "https://api.typeform.com/forms/" + form_id + "/responses",
        { auth: { bearer: process.env.TYPEFORM_TOKEN } },
        function (err, response, body) {
            var json_body = JSON.parse(body);
            var total_items = json_body.total_items;
            //Add new stories
            if (json_body && total_items) {
                stories += total_items;
            }
            callback(stories);
        }
    );
};
//Get rows of google sheet
var get_google_sheet_rows = function (base_stories, sheet_id, callback) {
    var stories = base_stories;
    (async function () {
        const doc = new GoogleSpreadsheet(sheet_id);
        doc.useApiKey(process.env.GOOGLE_SHEETS_KEY);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        //Add new stories
        if (sheet && sheet.rowCount) {
            stories = stories + sheet.rowCount - 1;
        }
        //New stories from sheet2
        const sheet2 = doc.sheetsByIndex[1];
        if (sheet2 && sheet2.rowCount) {
            stories = stories + sheet2.rowCount - 1;
        }
        callback(stories);
    })();
};
//Get kindness stories in geojson format
var get_kindness_geojson = function (blocks) {
    var stories = blocks.map(function (b) {
        return {
            lat: b.location.lat,
            long: b.location.long,
            name: b.location.country,
            imageUrl: b.image.m,
            title: b.text.title,
            summary: b.text.desc,
            sourceUrl: "https://mgiep.unesco.org/article/" + b.slug,
        };
    });
    var stories_geojson = GeoJSON.parse(stories, { Point: ["lat", "long"] });
    return stories_geojson;
};
//Export all functions
module.exports.get_linkified_text = get_linkified_text;
module.exports.get_text_summary = get_text_summary;
module.exports.get_only_text = get_only_text;
module.exports.get_link_metadata = get_link_metadata;
module.exports.get_resized_image = get_resized_image;
module.exports.get_cropped_image = get_cropped_image;
module.exports.upload_file = upload_file;
module.exports.download_file = download_file;
module.exports.get_provider_key = get_provider_key;
module.exports.get_image_keys = get_image_keys;
module.exports.delete_keys = delete_keys;
module.exports.get_short_url = get_short_url;
module.exports.get_gifs_results = get_gifs_results;
module.exports.get_menu_html = get_menu_html;
module.exports.get_kindness_stories = get_kindness_stories;
module.exports.get_google_sheet_rows = get_google_sheet_rows;
module.exports.get_kindness_geojson = get_kindness_geojson;
