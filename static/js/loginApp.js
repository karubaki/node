$(function () {
    //Show password
    $(".show-password").click(function (ev) {
        if ($(".show-password").hasClass("active")) {
            $(".js-password input").attr("type", "password");
        } else {
            $(".js-password input").attr("type", "text");
        }
        $(".show-password").toggleClass("active");
    });
});
