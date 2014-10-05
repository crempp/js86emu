/**
 * GUI generic modal view. This view is meant to be extended
 *
 * @module GUI
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "jquery",
    "backbone"],
function(
    $,
    Backbone)
{
    var ModalView = Backbone.View.extend({

        className : "modal",

        tagName:  "div",

        modalContainer : $('#gui-overlay'),

        events: {
            "click .modal-close": "hide"
        },

        initialize : function (options) {
            this.options = options || {};

            this.options.container = this.options.container || $("#gui-modal");
        },

        render: function ()
        {
            var data;
            if (this.model) data = {data:this.model.attributes};
            else data = {};

            console.log(data);

            this.$el.html(this.template(data));

            return this;
        },

        show : function()
        {
            this.options.container.html(this.render().el);

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

            this.remove();
        },

        center : function ()
        {
            this.$el.css('left', $(window).width()/2  - this.$el.width()/2);
            this.$el.css('top',  $(window).height()/2 - this.$el.height()/2);
        }
    });

    return ModalView;
});