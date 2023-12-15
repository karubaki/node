(function () {
    window.addEventListener("scroll", function (event) {
        var depth, i, layer, layers, len, movement, topDistance, translate3d;
        topDistance = this.pageYOffset;
        layers = document.querySelectorAll("[data-type='parallax']");
        for (i = 0, len = layers.length; i < len; i++) {
            layer = layers[i];
            depth = layer.getAttribute("data-depth");
            movement = -(topDistance * depth);
            translate3d = "translate3d(0, " + movement + "px, 0)";
            layer.style["-webkit-transform"] = translate3d;
            layer.style["-moz-transform"] = translate3d;
            layer.style["-ms-transform"] = translate3d;
            layer.style["-o-transform"] = translate3d;
            layer.style.transform = translate3d;
        }
        if ($("body").width() < 720) {
            if (topDistance > 80) {
                $(".headerWrap").addClass("u-sticky");
            } else {
                $(".headerWrap").removeClass("u-sticky");
            }
        } else {
            if (topDistance > 800) {
                $(".headerWrap").addClass("u-sticky");
            } else {
                $(".headerWrap").removeClass("u-sticky");
            }
        }
    });
    // Show key findings
    $(".one-question.question-1").click(function (ev) {
        $(".keyFindings .one-finding").addClass("u-hide");
        $(".one-finding.finding-1").removeClass("u-hide");
        $(".keyQuestions .one-question").removeClass("selected");
        $(".one-question.question-1").addClass("selected");
    });
    $(".one-question.question-2").click(function (ev) {
        $(".keyFindings .one-finding").addClass("u-hide");
        $(".one-finding.finding-2").removeClass("u-hide");
        $(".keyQuestions .one-question").removeClass("selected");
        $(".one-question.question-2").addClass("selected");
    });
    $(".one-question.question-3").click(function (ev) {
        $(".keyFindings .one-finding").addClass("u-hide");
        $(".one-finding.finding-3").removeClass("u-hide");
        $(".keyQuestions .one-question").removeClass("selected");
        $(".one-question.question-3").addClass("selected");
    });
    $(".one-question.question-4").click(function (ev) {
        $(".keyFindings .one-finding").addClass("u-hide");
        $(".one-finding.finding-4").removeClass("u-hide");
        $(".keyQuestions .one-question").removeClass("selected");
        $(".one-question.question-4").addClass("selected");
    });
    $(".one-question.question-5").click(function (ev) {
        $(".keyFindings .one-finding").addClass("u-hide");
        $(".one-finding.finding-5").removeClass("u-hide");
        $(".keyQuestions .one-question").removeClass("selected");
        $(".one-question.question-5").addClass("selected");
    });
    //Show chapters
    $(".wg-box").hover(function () {
        $(this).find(".wg-chapters").removeClass("u-transparent");
    });
    //Nav Menu
    function scrollToSelectedBlock(elem) {
        var offset = elem.offset().top;
        offset -= 200;
        $("html, body").animate({ scrollTop: offset }, 800);
        $(".menu-bar").slideUp();
        $(".nav-icon").toggleClass("open");
    }
    $(".link-home").click(function (ev) {
        ev.preventDefault();
        scrollToSelectedBlock($("#home"));
    });
    $(".link-headliners").click(function (ev) {
        ev.preventDefault();
        scrollToSelectedBlock($("#headliners"));
    });
    $(".link-sdm").click(function (ev) {
        ev.preventDefault();
        scrollToSelectedBlock($("#sdm"));
    });
    $(".link-wgs").click(function (ev) {
        ev.preventDefault();
        scrollToSelectedBlock($("#wgs"));
    });
}).call(this);
