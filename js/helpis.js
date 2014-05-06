/*
 * Library of helper functions that I've either written or found online, as noted
 */

//jQuery extension to make an object of input form data, written by Tobian Cohen
//http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

////////////////////////////////////////  Placement functions ////////////////////////////////////////////////////////

$.fn.center = function () {
    this.css("position","fixed");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2)) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2)) + "px");
    return this;
}

$.fn.centerHigh = function () {
    this.css("position","fixed");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 3)) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2)) + "px");
    return this;
}

/* User can specify displacement either from (default)top/left, top/right, bottom/left, bottom/right
   Only if first two params is null (or no value sent in), then bottom and right will be used. 
   @fixed decides position type fixed instead of default absolute */
$.fn.placement = function (top, left, bottom, right, fixed) {
    if(fixed != null && fixed === true){
        this.css("position","fixed");
    }
    else this.css("position","absolute");

    if(top != null){
        this.css("top", Math.max(0, (top + $(window).scrollTop())) + "px");
    }
    else if(bottom != null){
        this.css("bottom", bottom + "px");
    }
    if(left != null){
        this.css("left", Math.max(0, (left + $(window).scrollLeft())) + "px");
    }
    else if(right != null){
        this.css("right", right + "px");   
    }
    return this;
}

/* User can specify displacement either from (default)top/left, top/right, bottom/left, bottom/right
   Only if first two params is null (or no value sent in), then bottom and right will be used. 
   @fixed decides position type fixed instead of default absolute */
$.fn.placementPercent = function (top, left, bottom, right, fixed) {
    if(fixed != null && fixed === true){
        this.css("position","fixed");
    }
    else this.css("position","absolute");

    if(top != null){
        console.log("top is not null");
        this.css("top", Math.max(0, (top + $(window).scrollTop())) + "%");
    }
    else if(bottom != null){
        this.css("bottom", bottom + "%");
    }
    if(left != null){
        this.css("left", Math.max(0, (left + $(window).scrollLeft())) + "%");
    }
    else if(right != null){
        this.css("right", right + "%");   
    }
    return this;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

function rainbow(sat, light) {
  // 30 random hues with step of 12 degrees
  var hue = Math.floor(Math.random() * 30) * 12;

    return $.Color({
        hue: hue,
        saturation: sat,
        lightness: light,
        alpha: 1
    }).toHexString();
};

function get_random_color() {
    var letters = 'ABCDE'.split('');
    var color = '#';
    for (var i=0; i<3; i++ ) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

//Stolen from http://www.mediacollege.com/internet/javascript/form/limit-characters.html
function limitText(limitField, limitCount, limitNum) {
    if (limitField.value.length > limitNum) {
        limitField.value = limitField.value.substring(0, limitNum);
    } else {
        limitCount.value = limitNum - limitField.value.length;
    }
}