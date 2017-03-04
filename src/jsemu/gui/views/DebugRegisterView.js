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
    "gui/templates/GuiTemplate",
    "gui/models/SettingsModel"],
function(
    $,
    _,
    Backbone,
    GuiTemplate,
    SettingsModel)
{
    var DebugRegisterView = Backbone.View.extend({
        template: GuiTemplate['DebugRegisterTemplate'],

        render : function ()
        {
            this.$el.html(this.template({model: this.model}));

            if (SettingsModel.get("emuSettings")["registerToConsole"])
            {
                this.toConsole();
            }

            return this;
        },

        disable : function ()
        {
            this.$el.hide();
        },

        toConsole : function ()
        {
            var regObj = this.model.attributes;
            console.log(
                "--------------------------------------------------------------------[registers]\n" +
                    "  AX: " + this.model._padHexWord(regObj.AX) + "  BX: " + this.model._padHexWord(regObj.BX) + "  CX: " + this.model._padHexWord(regObj.CX) + "  DX: " + this.model._padHexWord(regObj.DX) + "\n" +
                    "  SI: " + this.model._padHexWord(regObj.SI) + "  DI: " + this.model._padHexWord(regObj.DI) + "  BP: " + this.model._padHexWord(regObj.BP) + "  SP: " + this.model._padHexWord(regObj.SP) + "\n" +
                    "  CS: " + this.model._padHexWord(regObj.CS) + "  DS: " + this.model._padHexWord(regObj.DS) + "  ES: " + this.model._padHexWord(regObj.ES) + "  SS: " + this.model._padHexWord(regObj.SS) + "\n" +
                    "  IP: " + this.model._padHexWord(regObj.IP) + "  FLAGS : " + this.model._padHexWord(regObj.FLAGS) + " [" + this.model._padBinaryWord(regObj.FLAGS) + "]"
            );
        }
    });

    return DebugRegisterView;
});