/**
 * GUI control view
 *
 * @module GUI
 * @author Chad Rempp <crempp@gmail.com>
 *
 * TODO: Make Modal class and then inherit from it
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "gui/templates/GuiTemplate"],
function(
    $,
    _,
    backbone,
    GuiTemplate)
{
    var SettingsView = Backbone.View.extend({
        id : "modalContent",

        className : "modal",

        tagName:  "div",

        template: GuiTemplate['SettingsTemplate'],

        events: {
            "click .modal-close": "hide",
        },

        modalContainer : $('#gui-overlay'),

        render: function ()
        {
            this.$el.html(this.template());
            return this;
        },

        show : function()
        {
            this.modalContainer.show();

            // Center
            this.center(this.$el);

            // Setup window resize handler
            $(window).on('resize.settings', $.proxy( this.center, this ));

        },

        hide : function()
        {
            this.modalContainer.hide();

            // Remove window resize handler
            $(window).off('resize.settings');
        },

        center : function ()
        {
            console.log("center");
            this.$el.css('left', $(window).width()/2  - this.$el.width()/2);
            this.$el.css('top',  $(window).height()/2 - this.$el.height()/2);
        }
    });

    return SettingsView;
});