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
    this.loggedInMenu = config.loggedInMenu;
    this.loggedOutMenu = config.loggedOutMenu;
    this.user = null;
    this.viewUser = null;
    //this.setupScrollHandler();
    this.loadPage();
    this.setupLoginButton();
    this.setupSignupButton();
    this.setupLogoutButton();
    this.updatePage();
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
        self.viewUser = username;
        //console.log(this.fetch_url + 'user=' + username);
        $.getJSON(self.fetch_url + 'user=' + username, function(data){
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
            //If error, should load start page or 404 page
            console.log("Should load start page?");
            console.error("getJSON failed, status: " + textStatus + ", error: "+error);
        });
    }
};

DatabaseHandler.prototype.attachTemplate = function(){
    var template = Handlebars.compile(this.template);
    this.container.append(template(this.result));
};

//This function handles what should be displayed in the menues and such.
DatabaseHandler.prototype.updatePage = function(){
    var self = this;
    $.getJSON(this.admin_url + 'req=checkLoggedIn', function(data){
        if(data.logged_in == 'YES'){
            self.user = data.username;
            self.toggleUserMenu(true);
            return true;
        }
        else{
            self.user = null;
            self.toggleUserMenu(false);
            return false;
        }
    })
    .fail(function(d, textStatus, error){
        console.error("Checking if logged in failed in admin.php, status: " + textStatus + ", error: "+error);
        self.toggleUserMenu(false);
        return false;
    });
};

DatabaseHandler.prototype.setupLoginButton = function(){
    var self = this;
    //Button to open login prompt
    $('#login').on('click', function(e){
        e.preventDefault();
        var notDoneMsg = 'Please fill in both fields :)';
        
        $.loginpopup({
            'message'   : 'Input username and password.',
            'buttons'   : {
                'Log in'   : {
                    //Now this is dependent on flatUI for the button styling, 
                    //should be specified in the dialogbox.css instead, but I'm lazy for the moment
                    'class' : 'btn btn-block btn-lg btn-success',
                    'action': function(){
                        var username = $('#loginBox').find('#username').val();
                        var password = $('#loginBox').find('#password').val();

                        if(username == "" || password == ""){
                            this.displayMsg(notDoneMsg);
                            return false;
                        }
                        self.checkLogin(username, password);
                        return true;
                    },
                    'displayMsg' : function(msg){
                        $('#loginMsgErr').text(msg);
                    }
                },
                'Cancel'    : {
                    'class' : 'btn btn-block btn-lg btn-default',
                    'action': function(){ return true; }  //Returns true to close the popup
                }
            }
        });
    });
};

DatabaseHandler.prototype.checkLogin = function(username, password){
    var self = this;
    var successMsg = 'Hooray, you\'re logged in!';
    var notLoggedInMsg = 'Sorry, the username and/or password was incorrect.';
    var failMsg = 'Wops, something went awry... Try again or ask Solveig for help is the problem persists. :)';
    
    var data = {
        'user' : username,
        'p' : password
    };
    $.getJSON(self.admin_url + "req=login", data, function(response) {
        console.log(response.logged_in);
        if(response.logged_in == 'YES'){
            self.popupMessage(successMsg);
            self.updatePage();
        }
        else {
            self.popupMessage(notLoggedInMsg);
            self.updatePage();
            //Opens back up again the login form
            setTimeout(function(){
                $('#login').trigger("click");
            }, 1000);
            
        }
    })
    .fail(function(d, textStatus, error) {
        self.popupMessage(failMsg);
        self.updatePage();
        console.error("The request failed, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.setupLogoutButton = function(){
    var self = this;
    $('#logout').on('click', function(e){
        e.preventDefault();
        self.logout();
    });
};

DatabaseHandler.prototype.setupSignupButton = function(){
    var self = this;
    $('#signup').on('click', function(e){
        e.preventDefault();
        
        $.loginpopup({
            'message'   : 'Create a username and password. Username can be 2-20 characters long. Password must be 8-20 characters long.',
            'buttons'   : {
                'Create user'   : {
                    //Now this is dependent on flatUI for the button styling, 
                    //should be specified in the dialogbox.css instead, but I'm lazy for the moment
                    'class' : 'btn btn-block btn-lg btn-success',
                    'action': function(){
                        var username = $('#loginBox').find('#username').val();
                        var password = $('#loginBox').find('#password').val();
                        var objThis = this;
                        if(username == "" || password == ""){
                            this.displayMsg('Please fill in both fields :)');
                            return false;
                        }
                        else if(username.length < 2 || username.length > 20){
                            this.displayMsg("Your username must be 2-20 characters long.");
                            return false;
                        }
                        else if(password.length < 8 || password.length > 20){
                            this.displayMsg("Your password must contain from 8 to 20 characters.");
                            return false;
                        }
                        $.getJSON(self.admin_url + "req=checkUsername", {'user' : username}, function(res){
                            if(res.status == "OK"){
                                self.signUp(username, password);
                                return true;
                            }
                            else{
                                objThis.displayMsg("That username is already taken. Try a different one!");
                                return false;
                            }
                        });
                        return true; //To make sure it closes after reaching end of function
                    },
                    'displayMsg' : function(msg){
                        $('#loginMsgErr').text(msg);
                    }
                },
                'Cancel'    : {
                    'class' : 'btn btn-block btn-lg btn-default',
                    'action': function(){
                        return true;
                    }  // Return true to trigger closing of the popup
                }
            }
        });
    });
};

DatabaseHandler.prototype.logout = function(){
    var self = this;
    $.getJSON(this.admin_url + "req=logout", function(response) {
        console.log(response.status);
        if(response.status == "OK"){
            self.popupMessage("You successfully logged out! Good job.");
            self.updatePage();
        }
    })
    .fail(function(d, textStatus, error) {
        self.popupMessage("Something went wrong with your request. Try again!");
        console.error("The request failed, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.signUp = function(username, password){
    var self = this;
    var data = {
        'user' : username,
        'p' : password
    };
    $.getJSON(this.admin_url + "req=signup", data, function(response){
        console.log(response.logged_in + ", " + response.username);
        self.popupMessage("You are now signed up and logged in. Woo =)");
        self.updatePage();
    });
};

DatabaseHandler.prototype.toggleUserMenu = function(loggedIn){
    if(loggedIn){
        this.loggedOutMenu.hide();
        this.loggedInMenu.find('p').remove();
        this.loggedInMenu.prepend('<a href="http://hakestad.io/threethings/?user=' + this.user + '"><p class="userGreeting">Hi, ' + this.user + '!</p></a>' );
        this.loggedInMenu.show();

    }
    else{
        this.loggedInMenu.hide();
        this.loggedOutMenu.show();
    }
};

DatabaseHandler.prototype.popupMessage = function(message){
    $.popupbox({
        'message'   : message
    });
};

/*************************** Extra functions, should be moved ****************************/
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


/*DatabaseHandler.prototype.handleContactForm = function(button, form, feedback){
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
};*/
