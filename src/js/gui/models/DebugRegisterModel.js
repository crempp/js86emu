/**
 * GUI Register data model
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
    var RegisterModel = Backbone.Model.extend(
    _.extend({}, PadMixin, {

        defaults : {
            AX : 0x00,
            BX : 0x00,
            CX : 0x00,
            DX : 0x00,
            SI : 0x00,
            DI : 0x00,
            BP : 0x00,
            SP : 0x00,
            CS : 0x00,
            DS : 0x00,
            ES : 0x00,
            SS : 0x00,
            IP : 0x00,
            FLAGS : 0x00
        },

        initialize: function(regObj) {
            this.set(regObj);
        }


    }));

    return RegisterModel;
});