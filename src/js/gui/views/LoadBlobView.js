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

        initialize : function () {
                console.log("LoadBlobView::initialize()");
                this.model.on('change', this.render, this);
                this.model.fetch();
        },

        show : function () {
            console.log("LoadBlobView::show()");

            this.render();
            ModalView.prototype.show.call(this);
        },

//        render : function ()
//        {
//            console.log("LoadBlobView::render()");
//
//            var v = ModalView.prototype.render.call(this, this.model.attributes);
//            //$("#gui-modal").append(v.el);
//            //v.show();
//        },

        submit : function ()
        {
            var blobProgram = this.$el.find('#settings-blobProgram').val();

            this.model.set({
                emuSettings : {
                    "blobProgram"  : ('none' === blobProgram) ? null : blobProgram,
                    "breakOnError" : this.$el.find('#settings-breakOnError').prop('checked')
                }
            });

            console.log("Set", this.model.attributes);
        }
    });

    return LoadBlobView;
});