/*
*   Author: Solveig Hansen 2014
*/
var DatabaseHandler = function(){
    this.db_url = 'http://hakestad.io/threethings/php/db_handler.php?';
    this.admin_url = 'http://hakestad.io/threethings/php/admin.php?';
};

/* Fetches the posts by the given user, and calls the callback functions
    that was sent in by the siteManager with the appropriate data or null
    if no data was found or there was an error.
*/
DatabaseHandler.prototype.fetch = function(username, callback){
    //console.log(this.db_url + 'req=fetch&user=' + username);
    $.getJSON(this.db_url + 'req=fetch&user=' + username, function(data){
        if(data.status == "OK" && data.result.length > 0){
            //return callback?
            callback(data);
        }
        else {
            callback(null);
        }
    })
    .fail(function(d, textStatus, error){
        callback(null);
        console.error("getJSON failed, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.checkIsLoggedIn = function(callback){
    $.getJSON(this.admin_url + 'req=checkLoggedIn', function(data){
        if(data.logged_in == 'YES'){
            callback(data.username);
        }
        else{
            callback(null);
        }
    })
    .fail(function(d, textStatus, error){
        console.error("Checking if logged in failed in admin.php, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.insertLike = function(data, callback){
    $.getJSON(this.db_url + 'req=like', data, function(response){
        if(response.status == 'OK'){
            callback("OK");
        }
        else{
            callback("NO");
        }
    });
};   

DatabaseHandler.prototype.editPost = function(postId, data, callback){
    $.post(this.db_url + "req=edit&postId=" + postId, data, function(response){
        if(response.status == "OK") {
            callback("OK");
        }
        else{
            callback("NO");
        }
    })
    .fail(function(d, textStatus, error) {
        callback("NO");
        console.error("The request failed, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.login = function(data, callback){
    $.getJSON(this.admin_url + "req=login", data, function(response) {
        if(response.logged_in == 'YES'){
            callback("YES");
        }
        else {
            callback("NO");
        }
    })
    .fail(function(d, textStatus, error) {
        callback("NO");
        console.error("The request failed, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.logout = function(callback){
    var self = this;
    $.getJSON(this.admin_url + "req=logout", function(response) {
        if(response.status == "OK"){
            callback("OK");
        }
        else{
            callback("NO");
        }
    })
    .fail(function(d, textStatus, error) {
        callback("NO");
        console.error("The request failed, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.signUp = function(data, callback){
    var self = this;
    $.getJSON(this.admin_url + "req=signup", data, function(response){
        //console.log(response.logged_in + ", " + response.username);
    })
    .done(function(){
        $.getJSON(self.db_url + "req=insertFirstPost", {'user':data.user}, function(response){
            if(response.status == 'OK'){
                callback("OK");
            }
            else{
                callback('NO');
            }
        });
    });
};

DatabaseHandler.prototype.checkUsernameTaken = function(username, callback){
    $.getJSON(this.admin_url + "req=checkUsername", {'user' : username}, function(res){
        if(res.status == "OK"){
            callback("OK");
        }
        else{
            callback("NO");
        }
    });
};

DatabaseHandler.prototype.follow = function(data, callback){
    $.getJSON(this.db_url + 'req=follow', data, function(response){
        if(response.status == 'OK'){
            callback({
                'status' : 'OK',
                'message' : 'Success! You are now following ' + data.following
            });
        }
        else{
            callback({
                'status':'NO',
                'message': 'It seems you are already following that person. Like the enthusiasm, tho!'
            });
        }
    })
    .fail(function(d, textStatus, error){
        callback({
            'status':'NO',
            'message' : 'Hmz...something went wrong. Dust yourself off and try again, try again !'
        });
        console.error("The request failed, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.getFollowing = function(user, callback){
    $.getJSON(this.db_url + 'req=following&user=' + user, function(response){
        if(response.status == 'OK'){
            if(response.result != null && response.result.length > 0){
                callback({
                    'status': 'OK',
                    'result' : response.result
                });
            }
        }
    })
    .fail(function(d, textStatus, error){
        console.error("The request failed, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.getFollowers = function(user, callback){
    $.getJSON(this.db_url + 'req=followers&user=' + user, function(response){
        if(response.status == 'OK'){
            if(response.result != null && response.result.length > 0){
                callback({
                    'status': 'OK',
                    'result' : response.result
                });
            }
        }
    })
    .fail(function(d, textStatus, error){
        console.error("The request failed, status: " + textStatus + ", error: "+error);
    });
};

