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
                "blobProgram"  : null,
                "breakOnError" : true,
                "startInDebug" : true
            }
        },

        urlRoot : 'files/data/data.json'
    });

    return SettingsModel;
});

