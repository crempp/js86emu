/**
 * GUI settings data model
 *
 * @module GUI
 * @author Chad Rempp <crempp@gmail.com>
 */

define(["backbone"], function(Backbone)
{

    var SettingsModel = Backbone.Model.extend({
        defaults : {
            "emuSettings" : {
                "blobProgram"       : null,
                "breakOnError"      : true,
                "startInDebug"      : true,
                "decodeToConsole"   : true,
                "registerToConsole" : true
            }
        },

        urlRoot : 'files/data/data.json'
    });

    var settingsSingleton = new SettingsModel();

    return SettingsModel;
    return settingsSingleton;
});

