/**
 * GUI Memory data model
 *
 * @module GUI
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "underscore",
    "backbone",
    "gui/models/PadMixin"],
    function(
        _,
        Backbone,
        PadMixin)
    {
        var MemoryModel = Backbone.Model.extend(
            _.extend({}, PadMixin, {

                defaults : {
                    mem : 0x00
                },

                initialize: function(memObj) {
                    this.set(memObj);
                }


            }));

        return MemoryModel;
    });