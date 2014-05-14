(function($){
    /*  Creates an info box that toggles on/off display of content
        Depends on css site-plugins-style.css
        options:
        options.title, options.message1, options.message2 ---> content
        options.appendLocation, options.left, options.top, options.right, options.bottom --> placement
    */
    $.infoToggleBox = function(options){
        var defaults = {
            'title' : 'Title',
            'message1' : 'This is the default message',
            'message2' : '',
            'appendLocation' : 'body',
            'left' : 10,
            'top' : 10,
            'right' : 0,
            'bottom' : 0,
            'position' : 'absolute'
        };

        var params = $.extend(defaults, options);
        //Main content
        var markupMain = [
            '<div id="infoBoxId">' +
                '<div id="infoCloseButton">X</div>' + 
                '<h4 class="infoStyleTitle">' + params.title + '</h4>' +
                '<p class="infoStyleMessage">' + params.message1 + '</p>' +
                '<p class="infoStyleMessage">' + params.message2 + '</p>' +
            '</div>'
        ].join('');

        //Toggle button to show main content
        var markupToggleButton = [
            '<div id="infoToggleButtonId">' +
                '<h4 class="infoStyleTitle">' + params.title + '</h4>' +
            '</div>'
        ].join('');

        $(markupToggleButton).hide().appendTo(params.appendLocation).show();
        $(markupMain).hide().appendTo(params.appendLocation);

        var mainElem = $('#infoBoxId'),
            toggleElem = $('#infoToggleButtonId'),
            closeButton = $('#infoCloseButton');

        mainElem.placement({'top' : params.top, 'left' : params.left, 'bottom' : params.bottom,
                            'right' : params.right, 'position' : params.position});
        toggleElem.placement({'top' : params.top, 'left' : params.left, 'bottom' : params.bottom,
                              'right' : params.right, 'position' : params.position});

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