/*
*   Author: Solveig Hansen 2014
*/
var DatabaseHandler = function(){
    this.fetch_url = 'http://hakestad.io/threethings/php/content_fetcher.php?';
    this.admin_url = 'http://hakestad.io/threethings/php/admin.php?'
};

DatabaseHandler.prototype.init = function(config){
    this.template = config.template;
    this.container = config.container;
    //this.setupScrollHandler();
    this.loadPage();
};

DatabaseHandler.prototype.loadPage = function(){
    var self = this;
    var query = location.search; //get's the search params in the link
    //If there's no query for a person, then load startpage
    if(query == null || query ==''){
        console.log("Should load start page");
    }
    else{
        //Get the name that comes after the ?user= in the search parameters in the link
        var username = query.match(/user=(.+)/)[1];
        //console.log(this.fetch_url + 'user=' + username);
        $.getJSON(this.fetch_url + 'user=' + username, function(data){
            if(data.status == "OK"){
                self.result = $.map(data.result, function(res){ 
                    return {
                        id: res.id,
                        date: res.date,
                        thing1: res.thing1,
                        thing2: res.thing2,
                        thing3: res.thing3,
                        likes: res.likes,
                        color1: rainbow(1.0, 0.8),
                        color2: get_random_color(),
                        color3: rainbow(0.8, 0.9)
                    };
                });
                self.attachTemplate();
            }
        })
        .fail(function(d, textStatus, error){
            console.error("getJSON failed, status: " + textStatus + ", error: "+error);
        });
    }
};

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

DatabaseHandler.prototype.attachTemplate = function(){
    var template = Handlebars.compile(this.template);
    this.container.append(template(this.result));
};

DatabaseHandler.prototype.handleContactForm = function(button, form, feedback){
    var self = this;
    button.on('click', function(e){
        e.preventDefault();
        //couldn't get form.serialize() to work for some reason
        var data = {
            'name':$('#name').val(),
            'email':$('#email').val(),
            'message':$('#message').val()
        }
        $.post("php/process_contact_form.php", data, function(response){
            feedback.html(response.msg);
            feedback.slideDown(400);
            if(response.status == "OK"){
                button.attr('disabled','disabled');
                self.clearFormFields();
            }
            setTimeout(function(){
                feedback.slideUp(400);
            }, 4000);
        })
        .fail(function(d, textStatus, error){
            console.error("Sending form failed, status: " + textStatus + ", error: " + error);
        });
    });
};

DatabaseHandler.prototype.clearFormFields = function(){
    $('#name').val('');
    $('#email').val('');
    $('#message').val('');
};

DatabaseHandler.prototype.setupScrollHandler = function(){
    var self = this;
    var toTopVisible = false;

    $(window).scroll(function(event){
        var scrollTop = $(window).scrollTop();
        if(scrollTop > 300 && toTopVisible == false){
            self.toggleScrollToTop();
            toTopVisible = true;
        }
        else if(scrollTop < 100 && toTopVisible == true){
            self.toggleScrollToTop();
            toTopVisible = false;
        }
    });
};

DatabaseHandler.prototype.toggleScrollToTop = function(){
    if($.backToTopButton({
        'message' : 'Back to top?',
        'bottom' : 10,
        'left' : 5 
    }) == false){
        $.backToTopButton.hide();
    }
};