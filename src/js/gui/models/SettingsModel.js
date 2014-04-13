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
                            "ah": 0x00,
                            "al": 0x00,
                            "bh": 0x00,
                            "bl": 0x00,
                            "ch": 0x00,
                            "cl": 0x00,
                            "dh": 0x00,
                            "dl": 0x00,
                            "si": 0x00,
                            "di": 0x00,
                            "bp": 0x00,
                            "sp": 0x00,
                            "ip": 0x00,
                            "cs": 0x00,
                            "ds": 0x00,
                            "es": 0x00,
                            "ss": 0x00
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

        urlRoot : 'files/data/data.json',
    });

    var settingsSingleton = new SettingsModel();

    return settingsSingleton;
});

