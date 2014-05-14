/*
 *  Some popup, dialog and tip boxes
 *  Author: Solveig Hansen 2014
 */

(function($){

    $.dialogbox = function(config){
        if($('#dialogOverlay').length){
            // A box is already shown on the page:
            return false;
        }
        var buttonHTML = '';
        $.each(config.buttons,function(name,obj){
            // Generating the markup for the buttons:
            buttonHTML += '<a href="#" class="button '+obj['class']+'">'+name+'<span></span></a>';

            if(!obj.action){
                obj.action = function(){};
            }
        });
        var markup = [
            '<div id="dialogOverlay">',
            '<div id="dialogBox">',
            '<p>',config.message,'</p>',
            '<div id="dialogButtons">',
            buttonHTML,
            '</div></div></div>'
        ].join('');

        $(markup).hide().appendTo('body').fadeIn();
        $('#dialogBox').center({
            'divideW' : 2,
            'divideH' : 3
        });

        var buttons = $('#dialogBox .button'),
            i = 0;

        buttons[buttons.length-1].focus();

        $.each(config.buttons,function(name,obj){
            buttons.eq(i++).click(function(){
                // Calling the action attribute when a click occurs, and hiding the dialogbox.
                obj.action();
                $.dialogbox.hide();
                return false;
            });
        });
        return this;
    };
    $.dialogbox.hide = function(){
        $('#dialogOverlay').fadeOut(function(){
            $(this).remove();
        });
    };


    /*************************** Popup message box ************************************/

    $.popupbox = function(options){
        if($('#popupBox').length){
            return false;
        }
        var defaults = {
            'message' : 'Default message',
            'appendLocation' : 'body',
            'time' : 3000
        };
        var params = $.extend(defaults, options);
        var markup = [
            '<div id="popupBox"><p>' + params.message +'</p></div>'
        ].join('');

        $(markup).hide().appendTo(params.appendLocation).fadeIn();
        $('#popupBox').center({
            'divideW' : 2,
            'divideH' : 3
        });

        setTimeout(function(){
            $.popupbox.hide();
        }, params.time);

        return this;
    };

    $.popupbox.hide = function(){
        $('#popupBox').fadeOut(function(){
            $(this).remove();
        });
    };

    /************************* Popup tip  ****************************/

    /* User sends in options.message, and optionally options.title, options.top and options.left displacement values 
        and options.time (how longit should show on screen) */
    $.tipbox = function(options){
        if($('#tipBox').length){
            return false;
        }
        var defaults = {
            'title' : '',
            'message' : 'Default message',
            'appendLocation' : 'body',
            'left' : 500,
            'top' : 100,
            'bottom' : 0,
            'right' : 0,
            'position' : 'absolute',
            'time' : 10000 //10 sec
        };
        var params = $.extend(defaults, options);

        var markup = [
            '<div id="tipBox"><h2>' + params.title + '</h2><p>' + params.message + '</p></div>'
        ].join('');

        $(markup).hide().appendTo('body').fadeIn();
        var elem = $('#tipBox').placement({'top' : params.top, 'left' : params.left, 'bottom' : params.bottom,
                                           'right' : params.right, 'position' : params.position});
       
        setTimeout(function(){
            $.tipbox.hide();
        }, config.time || 10000);

        return this;
    };
    $.tipbox.hide = function(){
        $('#tipBox').fadeOut(function(){
            $(this).remove();
        });
    };

    /************************* back to top button ****************************/

    /* options: options.message, options displacement values */
    $.backToTopButton = function(options){
        if($('#scrollTop').length){
            return false;
        }
        var defaults = {
            'message' : 'Back to top?',
            'appendLocation':'body',
            'left' : 500,
            'top' : 100,
            'bottom' : 0,
            'right' : 0,
            'position' : 'fixed',
            'time' : 800
        };
        var params = $.extend(defaults, options);

        var markup = [
            '<div id="scrollTop">' + params.message + '</div>'
        ].join('');

        $(markup).hide().appendTo(params.appendLocation).fadeIn();
        var elem = $('#scrollTop');

        //default position is bottom right corner, with position:fixed (last param true)
        elem.placement({'top' : params.top, 'left' : params.left, 'bottom' : params.bottom,
                        'right' : params.right, 'position' : params.position});

        // scroll body back to top on click
        elem.on('click', function(e){
            $('body,html').animate({
                scrollTop: 0,
                complete: function(){
                    $.backToTopButton.hide();
                }
            }, params.time);
            e.preventDefault();
        });
        return this;
    };
    $.backToTopButton.hide = function(){
        $('#scrollTop').fadeOut(function(){
            $('#scrollTop').off();
            $(this).remove();
        });
    };

    /*************************** Loadingbar ************************************/

    $.loadingbar = function(config){
        if($('#loadingbar').length){
            // A confirm is already shown on the page:
            return false;
        }

        var markup = [
            '<div id="loadingbar"><p>' + config.message + '</div>'
        ].join('');

        $(markup).hide().appendTo('body').show();
        $('#loadingbar').center();
        return this;
    };

    $.loadingbar.hide = function(){
        $('#loadingbar').hide(function(){
            $(this).remove();
        });
    };

    /******************* Log in popup **********************************/
    $.loginpopup = function(config){
        if($('#dialogOverlay').length){
            return false;
        }
        var buttonHTML = '';
        $.each(config.buttons,function(name,obj){
            buttonHTML += '<a href="#" class="button '+obj['class']+'">'+name+'<span></span></a>';
            if(!obj.action){
                obj.action = function(){};
            }
        });

        var markup = [
            '<div id="dialogOverlay">',
            '<div id="loginBox">',
            '<p>',config.message,'</p>',
            '<form id="loginform" action="">',
                '<input class="form-control add" id="username" placeholder="Username">',
                '<input type="password" class="form-control add" id="password" placeholder="Password">',
            '</form>',
            '<p id="loginMsgErr"></p>',
            '<div id="dialogButtons">',
            buttonHTML,
            '</div></div></div>'
        ].join('');

        $(markup).hide().appendTo('body').fadeIn();
        $('#loginBox').center({
            'divideW' : 2,
            'divideH' : 3
        });

        var buttons = $('#loginBox .button'),
            i = 0;

        buttons[buttons.length-1].focus();

        $.each(config.buttons,function(name,obj){
            buttons.eq(i++).click(function(){
                if(obj.action()){
                    $.loginpopup.hide();
                    return false;
                }
            });
        });

        return this;
    };

    $.loginpopup.hide = function(){
        $('#dialogOverlay').fadeOut(function(){
            $(this).remove();
        });
    };

})(jQuery);
