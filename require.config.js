var config = {
	config: {
		app:{
			dataStash: ['a','b','c']
		},
        paths: {
            // the left side is the module ID,
            // the right side is the path to
            // the jQuery file, relative to baseUrl.
            // Also, the path should NOT include
            // the '.js' file extension. This example
            // is using jQuery 1.9.0 located at
            // js/lib/jquery-1.9.0.js, relative to
            // the HTML page.
            //jquery: 'libs/require_jquery',
            //react: 'libs/require_react'
        }
	}
};

if(typeof module !== 'undefined'){
	module.exports = config;
}
else if (typeof require.config !== 'undefined'){
	require.config(config);
}