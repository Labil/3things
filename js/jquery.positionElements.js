jQuery.extend(jQuery.fn,{
	//@options - obj literal specifying 
	//@divideW and @divideH
	//values to divide the width and height placement
	//Default is to divide by 2, which places the element in dead center. 
	//If divide by 3, it will be higher up etc
	center: function(options){
		var defaults = {
			'divideW' : 2,
			'divideH' : 2
		};
		var params = $.extend(defaults, options);

		return this.each(function(){
			var $this = $(this);

			$this.css("position", "fixed")
				 .css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / params.divideH)) + "px")
				 .css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / params.divideW)) + "px");
		});
	},
	//@options can specify appropriate values for position, top, left, bottom & right, and what unit (%, px etc)
	//If bottom and right is not specified or have the value of 0, then the element is placed using top and left
	placement: function(options){
		var defaults = {
			'position':'fixed',
			'top' : 50,
			'left' : 50,
			'bottom' : 0,
			'right' : 0,
			'unit' : 'px'
		};
		var params = $.extend(defaults, options);

		return this.each(function(){
			var $this = $(this);
			$this.css('position', params.position);
			//If bottom is not defined, then placement from the top as default
			if(params.bottom != 0){
				$this.css("bottom", params.bottom + params.unit);
			}else{
				$this.css("top", Math.max(0, (params.top + $(window).scrollTop())) + params.unit);
			}
			//If right is not defined by user, then placement from left as default
			if(params.right != 0){
				$this.css("right", params.right + params.unit);
			}else{
				$this.css("left", Math.max(0, (params.left + $(window).scrollLeft())) + params.unit);
			}
		});
	}
});