//Sending mail in Node.js
var app_root = __dirname,
    path = require("path"),
    fs = require("fs"),
    _ = require("lodash"),
    templatesDir = path.resolve(app_root, "..", "email_templates"),
    htmlToText = require("html-to-text"),
    cheerio = require("cheerio");
//Sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_KEY);
//Export
module.exports = {
    sendOneMail: function (templateName, content, cb) {
        //Interpolate UnderscoreJS settings provided by Lodash to behave like Handlebar templates
        _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
        //Read template file
        fs.readFile(
            templatesDir + "/" + templateName + ".html",
            { encoding: "utf8" },
            function (err, fileContent) {
                if (err) return cb(err);
                var compiled = _.template(fileContent);
                var htmlContent = compiled({
                        resetUrl: content.resetUrl,
                        pageUrl: content.pageUrl,
                        email: content.email,
                        fromName: content.fromName,
                        title: content.title,
                        summary: content.summary,
                        firstName: content.firstName,
                        comment: content.comment,
                        redirectURL: content.redirectURL,
                    }),
                    textContent;
                //Remove img and footer. Get a plain text version of email.
                $ = cheerio.load(htmlContent);
                $("img, .footer").remove();
                textContent = htmlToText.fromString($.html(), {
                    tables: ["#textContent"],
                });
                //Setup e-mail data with unicode symbols
                var mailOptions = {
                    from: "UNESCO MGIEP <no-reply@mgiep.tech>", // sender address
                    to: content.email, // list of receivers
                    subject: content.subject, // Subject line
                    text: textContent, // plaintext body
                    html: htmlContent, // html body
                };
                //Send mail
                sgMail.send(mailOptions, function (error, responseStatus) {
                    if (error) {
                        return cb(error);
                    } else {
                        return cb(null, responseStatus);
                    }
                });
            }
        );
    },
};
