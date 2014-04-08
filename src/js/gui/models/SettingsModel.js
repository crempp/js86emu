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
                "run-type"          : null,
                "blobProgram"       : null,
                "blobSettings"      : {
                    "address"  : 0x00,
                    "cpu-init" : {
                        "registers": {
                            "sp": 0x00
                        },
                        "type": null
                    },
                    "file"     : "",
                    "id"       : "",
                    "name"     : ""
                },
                "breakOnError"      : true,
                "startInDebug"      : true,
                "decodeToConsole"   : true,
                "registerToConsole" : true
            },
            "blobFiles"  : {},
            "components" : {
                bios   : [],
                cpu    : [],
                floppy : [],
                gfx    : [],
                hd     : [],
                input  : {}
            }
        },

        urlRoot : 'files/data/data.json'
    });

    var settingsSingleton = new SettingsModel();

    return settingsSingleton;
});

