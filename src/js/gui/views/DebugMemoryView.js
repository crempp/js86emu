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
    "gui/templates/GuiTemplate"],
    function(
        $,
        _,
        Backbone,
        GuiTemplate)
    {
        var DebugMemoryView = Backbone.View.extend({
            template: GuiTemplate['DebugMemoryTemplate'],

            render : function ()
            {
                console.log("DebugMemoryView::render()");
                this.$el.html(this.template());

                return this;
            }
        });

        return DebugMemoryView;
    });