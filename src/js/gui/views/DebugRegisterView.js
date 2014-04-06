/**
 * GUI Debug Register view
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
    var DebugRegisterView = Backbone.View.extend({
        template: GuiTemplate['DebugRegisterTemplate'],

        render : function ()
        {
            console.log("DebugRegisterView::render()");
            this.$el.html(this.template({model: this.model}));

            return this;
        },

        toConsole : function ()
        {
            var regObj = this.model.attributes;
            console.log(
                "--------------------------------------------------------------------[registers]\n" +
                    "  AX: " + this._padHexWord(regObj.AX) + "  BX: " + this._padHexWord(regObj.BX) + "  CX: " + this._padHexWord(regObj.CX) + "  DX: " + this._padHexWord(regObj.DX) + "\n" +
                    "  SI: " + this._padHexWord(regObj.SI) + "  DI: " + this._padHexWord(regObj.DI) + "  BP: " + this._padHexWord(regObj.BP) + "  SP: " + this._padHexWord(regObj.SP) + "\n" +
                    "  CS: " + this._padHexWord(regObj.CS) + "  DS: " + this._padHexWord(regObj.DS) + "  ES: " + this._padHexWord(regObj.ES) + "  SS: " + this._padHexWord(regObj.SS) + "\n" +
                    "  IP: " + this._padHexWord(regObj.IP) + "  FLAGS : " + this._padHexWord(regObj.FLAGS) + " [" + this._padBinaryWord(regObj.FLAGS) + "]"
            );
        }
    });

    return DebugRegisterView;
});