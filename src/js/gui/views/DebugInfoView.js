/**
 * GUI Debug Information view
 *
 * @module GUI
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "gui/templates/GuiTemplate",
    "gui/models/SettingsModel",
    "emu/gfx"],
    function(
        $,
        _,
        Backbone,
        GuiTemplate,
        SettingsModel,
        Gfx)
    {
        var DebugInfoView = Backbone.View.extend({

            template: GuiTemplate['DebugInfoTemplate'],

            events: {
                "click .button-vidtest"  : "vidTest",
                "click .button-forcedraw"  : "forceDraw"
            },

            initialize : function (options) {
                this.options = options || {};
            },

            render : function ()
            {
                //this.$el.html(this.template({model: this.model}));
                this.$el.html(this.template({data : this.options }));

//                if (SettingsModel.get("emuSettings")["decodeToConsole"])
//                {
//                    this.toConsole();
//                }

                return this;
            },

            vidTest : function ()
            {
                Gfx.debugVideoTestPattern();
                Gfx.drawGraphics();
            },

            forceDraw : function ()
            {
                Gfx.drawGraphics();
            },

            error : function ()
            {

            }
        });

        return DebugInfoView;
    });