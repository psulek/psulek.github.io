//var serverUrl = "http://localhost:5000/help/"; //localhost url, je potrebna absolute path zacinajuc http (treba nastavit podla nasadenia)
var serverUrl = location.origin + "/help/"; //localhost url, je potrebna absolute path zacinajuc http (treba nastavit podla nasadenia)
var scrollToHeadingMarginTop = 16; //bez tejto konstanty by po kliknuti na bocne menu odscrollovalo content presne na dany heading, ale my ho chceme kusok nizsie (hlavne kvoli prvemu h1 nadpisu, aby slider vytiahlo uplne hore)
var liObject = null;
var reusables = [
"resourceParameters","valueValidation","exportingResourcesFromCategoryOrProject","primaryLanguage","countrySpecific","communityEdition","untranslatedMarker","multipleCodeGenerators","exportPurpose"
];

function injectReusables() {
    if (reusables.count === 0) {
        injectCallback();
    } else {
        injectReusable(0);
    }
}

function injectReusable(id) {
    if ($('#' + reusables[id]).length > 0) {
        $('#' + reusables[id]).load('contentParts/' + reusables[id] + '.html', function () {
            if (id + 1 < reusables.length) {
                injectReusable(id + 1);
            } else {
                injectCallback();
            }
        })
    } else {
        if (id + 1 < reusables.length) {
            injectReusable(id + 1);
        } else {
            injectCallback();
        }
    }
}

function injectCallback() {
    //clear topics element
    $("#topics").empty();

    //toto musi ist predtym ako sa zbuildia h1 a h2 texty v bocnom menu, aby sa tam dostali "pretransformovane" texty so sipkou, pretoze pri scrollovani sa hlada presne taky isty text headingu, a keby ho nenaslo, tak v konzole zobrazi error a scrolling nefunguje
    //$('#rightArrow').html('&rarr;');
    $('#rightArrow').html('&#x21E8;'); //add arrow symbol to the content title when required by span, e.g. Operations -> Editing something
    $('#rightArrowNested').html('&#x21E8;'); //toto je v pripade ked v nadpise chceme nested level a teda su dve sipky, kazda moze byt odlisna, pricom je to element ID, cize moze byt v stranke iba raz (zatial som to nedaval ako class)

    //parse all h1 titles
    var h12Elements = $("h1, h2");
    //console.log(h12Elements);
    if (h12Elements.length > 0) {
        for (let i = 0; i < h12Elements.length; i++) {
            if ($(h12Elements[i]).is('h1')) {
                $("<h1 onclick=\"h1scroll(this)\"></h1>").text(h12Elements[i].textContent).appendTo($("#topics"));
            } else if ($(h12Elements[i]).is('h2')) {
                $("<h2 onclick=\"h2scroll(this)\"></h2>").text(h12Elements[i].textContent).appendTo($("#topics"));
            }
        }

        if (!$("#topics").is(":visible")) {
            //if topics is not visible
            $("#topics").show();
        }
    } else {
        //there are no h1 elements
        $("#topics").hide(); //hide the topics element
    }

    liSetTitleStuff(liObject);

    var $main = $('#content-wrapper');
    $main.animate({ scrollTop: 0 }, 0); //scroll up (bez toho by po kliknuti na link zobrazilo novu stranku nascrollovanu tam kde bola nascrollovana predosla stranka)
}

//clicking on li elements
$(function () {
    //debugger;
    $("#tree-nav").find("li").on("click", function () {

        //take care of collapsing and expanding
        /*console.log(this);
        console.log($(this).next().length);*/
        if ($(this).next().length === 1) { //has next element
            if ($(this).next().is('ul')) { //next element is ul
                /*            console.log('UL');*/
                /*            $(this).next().slideToggle();*/
                if ($(this).next().is(':visible')) { //toggle visibility
                    //    $(this).next().hide('slow', function() {});
                    $(this).next().slideUp();
                } else {
                    //    $(this).next().show('slow', function() {});
                    $(this).next().slideDown();
                }
            }
        }

        //take care of loading appropriate content when clicked on li
        /*
            console.log($(this).text());
            console.log($(this).attr("key"));
        */
        if ($(this).attr("key") !== undefined) { //key atrribute in the element exists

            window.history.pushState("", "", serverUrl + "index.html?page=" + $(this).attr("key"));

            liClick(this);

        } else {
            //if there is no key, hide the topics element
            $("#topics").hide();
        }
        //liSetTitleStuff(this);

        onloadFunction();
    });
});

function h1scroll(h1element) {
    //console.log(h1element.textContent);
    // console.log($('#content-wrapper').find("h1:contains('" + h1element.textContent + "')").offset().top);

    // $("#content-wrapper").animate({
    //     scrollTop: $("h1:contains('" + h1element.textContent + "')").offset().top - 64
    //    }, 1000);

    var offset = $('#content-wrapper').find("h1:contains('" + h1element.textContent + "')").offset();
    var $main = $('#content-wrapper');
    $main.animate({
        scrollTop: offset.top - ($main.offset().top - $main.scrollTop()) - scrollToHeadingMarginTop
    }, 1000);
}

function h2scroll(h2element) {
    //console.log(h1element.textContent);
    //console.log($('#content-wrapper').find("h2:contains('" + h2element.textContent + "')").offset().top);

    // $("#content-wrapper").animate({
    //     scrollTop: $("h1:contains('" + h1element.textContent + "')").offset().top - 64
    //    }, 1000);

    var offset = $('#content-wrapper').find("h2:contains('" + h2element.textContent + "')").offset();
    var $main = $('#content-wrapper');
    $main.animate({
        scrollTop: offset.top - ($main.offset().top - $main.scrollTop()) - scrollToHeadingMarginTop
    }, 1000);
}

//set up content wrapper width minus scrollwidth minus nav minus padding
$(function () {
    resizeFunction();
});

//look after content wrapper width when resizing
function resizeFunction() {
    var actualInnerWidth = $("body").prop("scrollWidth") - 256 - 64; //256 = nav width, 64 = 2 * 32 content padding (left right)
    /*console.log(actualInnerWidth);*/
    $("#content-wrapper").width(actualInnerWidth);
};

//when loading page with parameter, we need to load the appropriate content and also expand the correct li item
function onloadFunction() {
    var topicLiElement = "welcome";

    if (getParameterByName("page") !== null) {
        if (getParameterByName("page") !== '') {
            //find menu item and simulate on click event
            var topicLiElement = getParameterByName("page");
        }
    }

    liObject = $("[key=" + topicLiElement + "]");
    liClick(liObject);
    liSetTitleStuff(liObject);
    $("[key=" + topicLiElement + "]").parents("ul").show(); //all lu parents should expand

    $('#footerNote').html((new Date()).getFullYear()); //inject the current year to the page footer
}

//gets the parameter from the url
function getParameterByName(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function liClick(li) {
    //var url = serverUrl + "content/" + $(li).attr("key") + ".html";
    var url = "content/" + $(li).attr("key") + ".html" + " #container";

    //loadPage(url, function () {
    //$("#content-help").load(serverUrl + "content/" + $(li).attr("key") + ".html #container", function () {
    $("#content-help").load(url, function () {
        injectReusables();
    }); //load the respective content html to the content div
}

function liSetTitleStuff(li) {
    //set the title text
    $("#title-text").text($(li).text()); //set the title text

    //set all li items to black
    $("#tree-nav").find("li").css({ "color": "black", "font-weight": 100 });

    //set the title color and headings color (extracted from the li element)
    if ($(li).attr("color") !== undefined) { //color attirbute in the element exists
        var liAttributeColor = $(li).attr("color");
        $("#content-wrapper").find("h1, h2, h3").css({ "color": liAttributeColor }); //set h1 to custom color
        $("#topics").find("h1, h2").css({ "border-left-color": liAttributeColor }); //topics border-left color
        $("#topics").css({ "color": liAttributeColor }); //set topics text color
        $("#top-nav").css({ "background-color": liAttributeColor }); //set topnav bkg color
        $(li).css({ "color": liAttributeColor, "font-weight": 900 }); //set this menu item to custom color as well

        //ofarbickovanie url odkazov v ramci contentu    
        var liAttributeColorBright = increase_brightness(liAttributeColor, 32); //vypocitaj jasnejsiu farbu

        $("#content-wrapper").find(".url").css({ "color": liAttributeColorBright }); //prirad jasnejsiu farbu aj .url objektom

        $("#exportingResourcesFromCategoryOrProject").find(".url").css({ "color": liAttributeColorBright }); //prirad jasnejsiu farbu aj .url objektom

        //console.log($("#content-wrapper"));

        $(".url").hover(function () { //pre vsetky .url objekty nastav hover funkciu, aby premalovala farbicky ako je potrebne
            $(this).css("color", liAttributeColor);
        }, function () {
            $(this).css("color", liAttributeColorBright);
        });
    }
}

function increase_brightness(hex, percent) {
    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (hex.length == 3) {
        hex = hex.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
        ((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}