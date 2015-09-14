define([], function(){
    var DEFINITION_PATH = "config/definitions";

    var DEFAULT_PATH = "config/defaults";

    /**
     * List of setting definition files
     *
     * @type {string[]}
     */
    var definitions = {
        'general'  : DEFINITION_PATH + '/general',
        'system'   : DEFINITION_PATH + '/system',
        'display'  : DEFINITION_PATH + '/display',
        'audio'    : DEFINITION_PATH + '/audio',
        'keyboard' : DEFINITION_PATH + '/keyboard',
        'mouse'    : DEFINITION_PATH + '/mouse',
        'storage'  : DEFINITION_PATH + '/storage'
    };

    var defaults = {
        'general'  : DEFAULT_PATH + '/general',
        'system'   : DEFAULT_PATH + '/system',
        'display'  : DEFAULT_PATH + '/display',
        'audio'    : DEFAULT_PATH + '/audio',
        'keyboard' : DEFAULT_PATH + '/keyboard',
        'mouse'    : DEFAULT_PATH + '/mouse',
        'storage'  : DEFAULT_PATH + '/storage'
    };

    var _definitionsRegistry = {};

    var _loadSettings = function () {
        for (section in definitions) {
            require([definitions[section]], function(){

            });
        }

    };

    var SettingsLoader = {
        definition : {}
    };

    for (section in definitions) {

        SettingsLoader.definition.__defineGetter__(section, function() {
//            if (! _definitionsRegistry.hasOwnProperty(section)) {
//                var sectionDef = require([definitions[section]]);
//                console.log("done loading", sectionDef);
//            }
        })
    }

    return SettingsLoader;
});