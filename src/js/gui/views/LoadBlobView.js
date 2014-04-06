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
    "gui/templates/GuiTemplate"],
function(
    $,
    _,
    Backbone,
    SettingsModel,
    ModalView,
    GuiTemplate)
{
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
                    "breakOnError" : this.$el.find('#settings-breakOnError').prop('checked')
                }
            });

            //console.log("Set", this.model.attributes);

            this.hide();
        }
    });

    return LoadBlobView;
});