/**
 * GUI load blob view
 *
 * @module GUI
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "gui/models/SettingsModel",
    "gui/views/ModalView",
    "gui/views/LoaderView",
    "gui/templates/GuiTemplate",
    "emu/emu"],
function(
    $,
    _,
    Backbone,
    SettingsModel,
    ModalView,
    LoaderView,
    GuiTemplate,
    Emu)
{
    var _basePath = "files/program-blobs/";

    /**
     *  Load a binary file via Ajax
     *
     * @param fileName
     * @param cb
     * @private
     */
    var _loadBlob = function (fileName, cb)
    {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", _basePath + fileName, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText

            if (cb) cb(arrayBuffer);
        };

        oReq.send(null);
    }

    var LoadBlobView = ModalView.extend({

        id : "modalContent-loadblob",

        className : "modal",

        template: GuiTemplate['LoadBlobTemplate'],

        events: {
            "click .modal-close": "hide",
            "click .button-settings-submit": "submit"
        },

        initialize : function (options) {
            ModalView.prototype.initialize.call(this, options);

            this.model.on('change', this.render, this);
            this.model.fetch();
        },

        submit : function ()
        {
            var blobProgram = this.$el.find('#settings-blobProgram').val();

            this.model.set({
                emuSettings : {
                    "blobProgram"  : ('none' === blobProgram) ? null : blobProgram,
                    "breakOnError" : this.$el.find('#settings-breakOnError').prop('checked'),
                    "startInDebug" : this.$el.find('#settings-startInDebug').prop('checked'),
                    "decodeToConsole"   : this.$el.find('#settings-decodeToConsole').prop('checked'),
                    "registerToConsole" : this.$el.find('#settings-registerToConsole').prop('checked')
                }
            });

            var emuSettings = this.model.get('emuSettings');
            var blobfiles = this.model.get('blobfiles');
            var blobSettings = null;

            for (var i = 0; i < blobfiles.length; i++ )
            {
                if (blobfiles[i].id === emuSettings.blobProgram)
                {
                    blobSettings = blobfiles[i];
                    break;
                }
            }

            if (emuSettings.blobProgram)
            {
                var loaderView = new LoaderView();
                loaderView.show();

                // Assemble emulator settings
                var settings = {
                    "run-type"       : "blob",
                    "blob-settings"  : blobSettings,
                    "debug-settings" : {
                        "breakOnError"      : emuSettings.breakOnError,
                        "startInDebug"      : emuSettings.startInDebug,
                        "decodeToConsole"   : emuSettings.decodeToConsole,
                        "registerToConsole" : emuSettings.registerToConsole
                    },
                    "gui" : this
                };

                // Load blob
                var _this = this;
                _loadBlob(emuSettings.blobProgram, function(arrayBuffer){
                    if (arrayBuffer) {
                        Emu.runBlob(settings, arrayBuffer)
                    }
                    loaderView.hide();
                });
            }
            else
            {
                this.hide();
            }
        }
    });

    return LoadBlobView;
});