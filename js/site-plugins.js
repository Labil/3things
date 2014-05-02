
//jQuery plugins
(function($){

    /* User can specify displacement either from (default)top/left, top/right, bottom/left, bottom/right
       Only if first two params is null (or no value sent in), then bottom and right will be used. 
       @fixed decides position type fixed instead of default absolute */
   /* $.fn.placement = function (top, left, bottom, right, fixed) {
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
    }*/

    /* Config:
     * config.message, config.title,
     * and optionally: config.infoBoxId, config.toggleButtonId, config.styleTitle, config.styleMessage, config.appendLocation,
                       msg to be displayed on infobox when in collapsed state,
                       config.direction, a string that indicates which side the box should slide out from
                       config.top/config.left/config.bottom, config.right displacement values 
     */
    $.infoToggleBox = function(config){
        if(config.message2 == null) config.message2 = '';
        //Main content
        var markupMain = [
            '<div id="infoBoxId">' +
                '<div id="infoCloseButton">X</div>' + 
                '<h4 class="infoStyleTitle">' + config.title + '</h4>' +
                '<p class="infoStyleMessage">' + config.message1 + '</p>' +
                '<p class="infoStyleMessage">' + config.message2 + '</p>' +
            '</div>'
        ].join('');

        //Tobble button to show main content
        var markupToggleButton = [
            '<div id="infoToggleButtonId">' +
                '<h4 class="infoStyleTitle">' + config.title + '</h4>' +
            '</div>'
        ].join('');

        $(markupToggleButton).hide().appendTo(config.appendLocation || 'body').show();
        $(markupMain).hide().appendTo(config.appendLocation || 'body');

        var mainElem = $('#infoBoxId');
        var toggleElem = $('#infoToggleButtonId');
        var closeButton = $('#infoCloseButton');


        //default position is bottom right corner, with position:fixed (last param true)...uh that's a weird default placement, solveig
        mainElem.placement(config.top || 10, config.left || 10, config.bottom || null, config.right || null, config.fixed || true);
        toggleElem.placement(config.top || 10, config.left || 10, config.bottom || null, config.right || null, config.fixed || true);

        // show hidden elem 
        toggleElem.on('click', function(e){
            $(this).hide();
            mainElem.fadeIn(200);
            e.preventDefault();
        });
        //re-hide elem and show button
        closeButton.on('click', function(e){
            mainElem.fadeOut(200);
            setTimeout(function(){
                toggleElem.show();
            }, 100);
            e.preventDefault();
        });
    };

})(jQuery);