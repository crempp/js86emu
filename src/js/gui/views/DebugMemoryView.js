/**
 * GUI Debug Memory view
 *
 * @module GUI
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "gui/templates/GuiTemplate",
    "emu/gfx"],
function(
    $,
    _,
    Backbone,
    GuiTemplate,
    Gfx)
{
    var center = 0x20;

    var DebugMemoryView = Backbone.View.extend({
        template: GuiTemplate['DebugMemoryTemplate'],

        events: {
            "click  .gui-button-centermem" : "doCenter",
            "keyup   #debug-memory-center" : "keyUp",
            "keydown #debug-memory-center" : "keyDown",
            "click  .gui-button-gotoip"    : "doGotoIP",
            "click  .gui-button-gotogfx"   : "doGotoGfx"
        },

        initialize : function (options) {
            this.options = options || {};

            _.bindAll(this, "keyDown", "keyUp");
        },

        render : function ()
        {
            this.model.updateRows();

            this.$el.html(this.template({model: this.model}));

            return this;
        },

        disable : function ()
        {
            this.$el.hide();
        },

        doCenter : function ()
        {
            var addr = $("#debug-memory-center").val();

            this.model.center(parseInt(addr, 16));

            this.render();
        },

        doGotoIP : function ()
        {
            // To force the memory view to center on the IP remove the center value
            // in the model
            this.model.set({'center' : null});
            this.model.center();
            this.render();
        },

        doGotoGfx : function ()
        {
            this.model.center(Gfx.getGfxMemStart());

            this.render();
        },

        keyUp : function(event){

        },

        keyDown : function(event){
            if(event.keyCode == 13){
                event.preventDefault();
                this.doCenter();
            }
        }

    });

    return DebugMemoryView;
});