/*
*   Author: Solveig Hansen 2014
*/
var DatabaseHandler = function(){
    this.api_url = 'http://hakestad.io/threethings/php/content_fetcher.php?';
};

DatabaseHandler.prototype.init = function(config){
    this.template = config.template;
    this.container = config.container;
    //this.setupScrollHandler();
    this.fetch();
};

DatabaseHandler.prototype.fetch = function(){
    var self = this;
    $.getJSON(this.api_url + 'req=fetch', function(data){
        if(data.status == "OK"){
            self.result = $.map(data.result, function(res){ 
                return {
                    date: res.date,
                    thing1: res.thing1,
                    thing2: res.thing2,
                    thing3: res.thing3,
                    likes: res.likes
                };
            });
            self.attachTemplate();
        }
    })
    .fail(function(d, textStatus, error){
        console.error("getJSON failed, status: " + textStatus + ", error: "+error);
    });
};

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