/*
*   Author: Solveig Hansen 2014
*/
var DatabaseHandler = function(){
    this.db_url = 'http://hakestad.io/threethings/php/db_handler.php?';
    this.admin_url = 'http://hakestad.io/threethings/php/admin.php?';
    this.user = null;
    this.viewUser = null;
    this.followers = {};
    this.following = {};
    var d = new Date();
    var month = d.getMonth() + 1;
    var date = d.getDate();
    this.today = d.getFullYear() + "-" + (month.length == 1 ? month : ("0" + month)) + "-" + (date.length == 1 ? date : ("0" + date)); //Y-M-D
};

DatabaseHandler.prototype.init = function(config){
    this.postsTemplate = config.postsTemplate;
    this.postsContainer = config.postsContainer;
    this.pageInfoTemplate = config.pageInfoTemplate;
    this.pageInfoContainer = config.pageInfoContainer;
    this.userMenuTemplate = config.userMenuTemplate;
    this.userMenuContainer = config.userMenuContainer;
    this.editorTemplate = config.editorTemplate;
    this.followingTemplate = config.followingTemplate;
    this.followingContainer = config.followingContainer;
    this.followersTemplate = config.followersTemplate;
    this.followersContainer = config.followersContainer;
    
    this.loadPage();
    this.updatePage();
};

DatabaseHandler.prototype.loadPage = function(){
    var self = this;
    var query = location.search; //get's the search params in the link

    //If there's no query for a person, then load startpage
    if(query == null || query ==''){
        this.result = {
            'shouldDisplayWelcomePage' : true
        };
        this.attachPostsTemplate();
    }
    else{
        //Get the name that comes after the ?user= in the search parameters in the link
        //var username = query.match(/user=(.+)/)[1];
        var username = query.substr(6);
        var colOutline, heartIconSrc, col1, col2, col3;

        //console.log(this.db_url + 'req=fetch&user=' + username);
        $.getJSON(self.db_url + 'req=fetch&user=' + username, function(data){
            if(data.status == "OK"){
                
                if(data.result.length > 0){
                    //Setting viewUser when we are sure the user exist aka has posts
                    self.viewUser = username;
                    self.result = $.map(data.result, function(res){ 
                        //Adding appropiate graphics and color styles to the posts
                        res.date == self.today ? colOutline = "#9aeaed" : colOutline = "#d6d6d6";
                        res.likes > 0 ? heartIconSrc = "assets/heart_likes.png" : heartIconSrc = "assets/heart_nolikes.png";
                        res.thing1 == "" ? col1 = "#d6d6d6" : col1 = rainbow(1.0, 0.8);
                        res.thing2 == "" ? col2 = "#d6d6d6" : col2 = get_random_color();
                        res.thing3 == "" ? col3 = "#d6d6d6" : col3 = rainbow(0.8, 0.9);

                        return {
                            id: res.id,
                            user: res.user,
                            date: res.date,
                            thing1: res.thing1,
                            thing2: res.thing2,
                            thing3: res.thing3,
                            likes: res.likes,
                            color1: col1,
                            color2: col2,
                            color3: col3,
                            colorOutline: colOutline,
                            heart: heartIconSrc
                        };
                    });
                }
                else{
                    self.result = {
                        'shouldDisplayNoUserFound' : true
                    };
                }
                self.attachPostsTemplate();
            }
        })
        .fail(function(d, textStatus, error){
            //If error, should load start page or 404 page
            this.result = {
                'shouldDisplayWelcomePage' : true
            };
            self.attachPostsTemplate();
            console.error("getJSON failed, status: " + textStatus + ", error: "+error);
        });
    }
};

DatabaseHandler.prototype.attachPostsTemplate = function(){
    var template = Handlebars.compile(this.postsTemplate);
    this.postsContainer.append(template(this.result));
};

DatabaseHandler.prototype.attachPageInfoTemplate = function(){
    //console.log(this.user);
    //console.log(this.viewUser);
    this.pageInfoContainer.html('');
    var data = { 'follow' : (this.user == null || this.user == this.viewUser) ? false : true, 'userProfile' : this.viewUser };
    var template = Handlebars.compile(this.pageInfoTemplate);
    this.pageInfoContainer.append(template(data));
};

DatabaseHandler.prototype.attachUserMenuTemplate = function(){
    this.userMenuContainer.html('');
    var data = {
        'user' : this.user
    };
    var template = Handlebars.compile(this.userMenuTemplate);
    this.userMenuContainer.append(template(data));
};

DatabaseHandler.prototype.attachFollowers = function(){
    this.followersContainer.html('');
    var data = {
        'followersArray' : this.followers
    };
    var template = Handlebars.compile(this.followersTemplate);
    this.followersContainer.append(template(data));
};

DatabaseHandler.prototype.attachFollowing = function(){
    this.followingContainer.html('');
    var data = {
        'followingArray' : this.following
    };
    var template = Handlebars.compile(this.followingTemplate);
    this.followingContainer.append(template(data));
};

//This function handles what should be displayed in the menues and such.
DatabaseHandler.prototype.updatePage = function(){
    var self = this;
    $.getJSON(this.admin_url + 'req=checkLoggedIn', function(data){
        if(data.logged_in == 'YES')self.user = data.username;
        else self.user = null;
        self.attachPageInfoTemplate();
        self.attachUserMenuTemplate();
        self.getFollowing();
        self.getFollowers();
        //Hack to make sure posts are loaded, since handlebars doesn't have a good callback system that I could find atm
        setTimeout(function(){
            self.setupLogoutButton();
            self.setupLoginButton();
            self.setupSignupButton();
            self.toggleEditPosts();
            self.toggleLikes();
            self.toggleFollow();
        }, 500);
    })
    .fail(function(d, textStatus, error){
        console.error("Checking if logged in failed in admin.php, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.toggleLikes = function(){
    var self = this;
    //first, remove all listeners
    $('.heart').off();
    if(this.user == null){
        $('.heart').on('click', function(){
            self.popupMessage('You must be logged in to favorite posts!');
        });
    }
    else if(this.viewUser != null && this.viewUser != this.user){
        $('.heart').on('click', function(){
            $this = $(this);
            var postId = $this.data('id');
            var data = {
                'user' : self.user,
                'postId': postId
            };
            $.getJSON(self.db_url + 'req=like', data, function(response){
                if(response.status == 'OK'){
                    var p = $this.find('p.like');
                    var numLikes = parseInt(p.text());
                    var newNumLikes = numLikes + 1;
                    p.text(newNumLikes);
                    $this.find('img.hearticon').attr("src", "assets/heart_likes.png");
                }
                else{
                    self.popupMessage('Chill on the likes, you\'ve already hit that one.');
                }
            });
        });    
    }
    else if(this.viewUser == this.user){
        $('.heart').on('click', function(){
            self.popupMessage('Sorry, you can\'t favorite your own posts!');
        });
    }
};   

DatabaseHandler.prototype.toggleEditPosts = function(){
    var self = this;
    //If not logged in or not viewing your own profile
    if(this.user == null || this.user != this.viewUser){
        //Removes the pointer cursor, click listener and turning off edit possibilities
         $('.editable-post').css("cursor", "default").off().removeClass('editable-post');
    }
    else{
        //Filters out the post that has today's date and belongs to logged in user.
        //Add a class to indicate that this post can be edited, thus making it easier to find when I wanna turn editing off
         $('.posts').filter(function(index){
             var $post = $(this);
             return ($post.data('date') == self.today);
         }).css("cursor", "pointer").addClass('editable-post').on('click', function(){
             var $post = $(this);
             var texts = [3];
             $post.children('p.thing').each(function(index){
                 var $p = $(this);
                 var txt = $p.text().replace(/[0-9]\./, "").trim();
                 texts[index] = {
                     'textnum' : (index + 1),
                     'text' : txt
                 };
             });
             self.spawnEditor($post, texts);
         });
    }
};

DatabaseHandler.prototype.spawnEditor = function($post, texts){
    var self = this;
    var templateData = {
        'date' : $post.data('date'),
        'texts' : texts,
        'postId' : $post.data('id')
    }
    var template = Handlebars.compile(this.editorTemplate);
    $('body').append(template(templateData));
    $('#editor').centerHigh();

    var form = $('#edit-form');
    var postId = form.data('id');

    $('.editCancel').on('click', function(e){
        e.preventDefault();
        $('#dialogOverlay').remove();
        $('#editor').remove();
    });

    form.submit(function(e){
        e.preventDefault();
        var data = {
            'edit1': $('#edit1').val(),
            'edit2': $('#edit2').val(),
            'edit3': $('#edit3').val()
        };
        $.post(self.db_url + "req=edit&postId=" + postId, data, function(response){
            if(response.status == "OK") {
                $('#dialogOverlay').remove()
                $('#editor').remove();
                self.popupMessage("Your post was updated! :D");
                $post.children('p.thing').each(function(index){
                    var t = data["edit" + (index + 1)];
                    var $this = $(this);
                    $this.text((index + 1) + ". " + data["edit" + (index + 1)]);
                    if(t != '')
                        $this.css('background-color', get_random_color());
                });
            }
        })
        .fail(function(d, textStatus, error) {
            console.error("The request failed, status: " + textStatus + ", error: "+error);
        });
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
        if(response.status == "OK"){
            self.popupMessage("You successfully logged out! Good job.");
            self.updatePage();
        }
    })
    .fail(function(d, textStatus, error) {
        self.popupMessage("Hmz...something went wrong. Dust yourself off and try again, try again!");
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
        //console.log(response.logged_in + ", " + response.username);
        self.popupMessage("You are now signed up and logged in. Woo =)");
    })
    .done(function(){
        $.getJSON(self.db_url + "req=insertFirstPost", {'user':username}, function(response){
            if(response.status == 'OK'){

                setTimeout(function(){
                    location.search = '?user=' + username; 
                }, 1500);
            }
        });
    });
};

DatabaseHandler.prototype.toggleFollow = function(){
    var self = this;
    //First turn off event, and only add if user is logged in and not viewing it's own profile
    $('.follow').off();
    if(this.user != null && this.viewUser != this.user){
        $('.follow').on('click', function(e){
            e.preventDefault();
            $this = $(this);
            var userToFollow = $this.data('profile');
            var data = {
                'user' : self.user,
                'following' : userToFollow
            };
            self.follow(data);
        });
    }
};

DatabaseHandler.prototype.follow = function(data){
    var self = this;
    $.getJSON(self.db_url + 'req=follow', data, function(response){
        if(response.status == 'OK'){
            self.popupMessage('Success! You are now following ' + userToFollow);
        }
        else{
            self.popupMessage('It seems you are already following that person. Like the enthusiasm, tho!');
        }
    })
    .fail(function(d, textStatus, error){
        self.popupMessage('Hmz...something went wrong. Dust yourself off and try again, try again !');
        console.error("The request failed, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.getFollowing = function(){
    var self = this;
    $.getJSON(self.db_url + 'req=following&user=' + this.user, function(response){
        if(response.status == 'OK'){
            console.log(response.result.length);
            if(response.result.length > 0){
                self.following = $.map(response.result, function(res){ 
                    return {
                        following: res.following,
                        color: rainbow(1.0, 1.0)
                    };
                });
            }
            self.attachFollowing();
        }
    })
    .fail(function(d, textStatus, error){
        console.error("The request failed, status: " + textStatus + ", error: "+error);
    });

};

DatabaseHandler.prototype.getFollowers = function(){
    var self = this;
    $.getJSON(self.db_url + 'req=followers&user=' + this.user, function(response){
        if(response.status == 'OK'){
            console.log(response.result.length);
            if(response.result.length > 0){
                self.followers = $.map(response.result, function(res){ 
                    return {
                        follower: res.follower,
                        color: rainbow(1.0, 1.0)
                    };
                });
            }
            self.attachFollowers();
        }
    })
    .fail(function(d, textStatus, error){
        console.error("The request failed, status: " + textStatus + ", error: "+error);
    });

};

DatabaseHandler.prototype.popupMessage = function(message){
    $.popupbox({
        'message': message
    });
};