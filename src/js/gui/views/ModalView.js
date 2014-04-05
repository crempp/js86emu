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

        render: function ()
        {
            console.log("ModalView::render()");
            console.log(this.$el);

            //this.$el.html(this.template({data:data}));
            //$("#gui-modal").append(v.el);

            //$("#gui-modal").html(this.template({data:data}));

            this.$el.html(this.template({data:this.model.attributes}));


            return this;
        },

        show : function()
        {
            console.log("ModalView::show()");
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
            this.$el.css('left', $(window).width()/2  - this.$el.width()/2);
            this.$el.css('top',  $(window).height()/2 - this.$el.height()/2);
        }
    });

    return ModalView;
});