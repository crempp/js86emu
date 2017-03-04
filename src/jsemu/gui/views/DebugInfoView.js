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
    "emu/gfx",
    "emu/cpu"],
    function(
        $,
        _,
        Backbone,
        GuiTemplate,
        SettingsModel,
        Gfx,
        Cpu)
    {
        var DebugInfoView = Backbone.View.extend({

            template: GuiTemplate['DebugInfoTemplate'],

            events: {
                "click .button-vidtest"    : "vidTest",
                "click .button-forcedraw"  : "forceDraw",
                "click .button-runcycles"    : "cycleTo",
                "keyup   #debug-info-runcycles" : "keyUp",
                "keydown #debug-info-runcycles" : "keyDown",
            },

            initialize : function (options) {
                this.options = options || {};
            },

            render : function ()
            {
                this.$el.html(this.template({data : this.options }));

                return this;
            },

            disable : function ()
            {
                this.$el.hide();
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

            cycleTo : function ()
            {

                var $runCyclesEl = this.$el.find("#debug-info-runcycles");
                var cycles = parseInt($runCyclesEl[0].value, 10);

                // Ignore non-numeric inputs
                // Stupid NaN makes the final condition awkward
                if (typeof cycles !== "number" || !(cycles > 0)) return;

                Cpu.run(cycles);
                Gfx.drawGraphics();
            },

            keyUp : function(event){

            },

            keyDown : function(event){
                if(event.keyCode == 13){
                    event.preventDefault();
                    this.cycleTo();
                }
            },

            error : function ()
            {

            }
        });

        return DebugInfoView;
    });
