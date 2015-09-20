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
                            "ah": 0x0000,
                            "al": 0x0000,
                            "bh": 0x0000,
                            "bl": 0x0000,
                            "ch": 0x0000,
                            "cl": 0x0000,
                            "dh": 0x0000,
                            "dl": 0x0000,
                            "si": 0x0000,
                            "di": 0x0000,
                            "bp": 0x0000,
                            "sp": 0xFFFF,
                            "ip": 0xFC21F,
                            "cs": 0xF000,
                            "ds": 0xF000,
                            "es": 0xF000,
                            "ss": 0xF000
                        },
                        "type": null
                    },
                    "file"     : "",
                    "id"       : "",
                    "name"     : ""
                },
                "breakOnError"      : true,
                "startInDebug"      : true,
                "decodeToConsole"   : false,
                "registerToConsole" : false
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

