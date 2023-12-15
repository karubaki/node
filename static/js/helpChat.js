//Help chat
if ($(".mainWrap").data("user")) {
    var username = $(".mainWrap").data("username");
    var name = $(".mainWrap").data("name");
    var firstName = name.split(" ")[0];
    var lastName = name.split(" ")[1];
    var email = $(".mainWrap").data("email");
    window.fcWidget.init({
        token: "0ccee8b7-ea94-4c72-87e9-1b7dbc1e7281",
        host: "https://wchat.freshchat.com",
        externalId: username,
        firstName: firstName,
        lastName: lastName,
        email: email,
    });
} else {
    window.fcWidget.init({
        token: "0ccee8b7-ea94-4c72-87e9-1b7dbc1e7281",
        host: "https://wchat.freshchat.com",
    });
}
