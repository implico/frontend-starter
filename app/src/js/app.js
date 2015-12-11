var NATQA = NATQA || {};

(function($, NATQA) {
	
	NATQA.modules = {
			
		layout: {
			
			init: function() {
				
			}
		}
	}
	
	NATQA.resize = function() {
		
	}
	
	
	NATQA.modules.layout.init();
	
	
	$(window).on('resize', NATQA.resize);
	
})(jQuery, NATQA);