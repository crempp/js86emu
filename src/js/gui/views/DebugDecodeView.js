/**
 * GUI Debug Opcode Decode view
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
    var DebugDecodeView = Backbone.View.extend({
        template: GuiTemplate['DebugDecodeTemplate'],

        render : function ()
        {
            this.$el.html(this.template({model: this.model}));

            if (SettingsModel.get("emuSettings")["decodeToConsole"])
            {
                this.toConsole();
            }

            return this;
        },

        toConsole : function ()
        {
            console.log("" +
                "--------------------------------------------------------------------[decode]\n" +
                "instruction : " + this.model._padHexByte(this.model.get('instruction')) + "\n" +
                "opcode_byte = " + this.model._padHexByte(this.model.get('opcode_byte')) + " [" + this.model._padBinaryByte(this.model.get('opcode_byte')) + "]\n" +
                "    op : " + this.model._padHexByte(this.model.get('opcode')) + " [" + this.model._padBinary(this.model.get('opcode'), 6) + "]\n" +
                "    d  : " + this.model._padHexByte(this.model.get('d')) + " [" + this.model._padBinary(this.model.get('d'), 1) + "]\n" +
                "    w  : " + this.model._padHexByte(this.model.get('w')) + " [" + this.model._padBinary(this.model.get('w'), 1) + "]\n" +
                "addressing_byte = " + this.model._padHexByte(this.model.get('addressing_byte')) + " [" + this.model._padBinaryByte(this.model.get('addressing_byte')) + "]\n" +
                "    mod : " + this.model._padHexByte(this.model.get('mod')) + " [" + this.model._padBinary(this.model.get('mod'), 2) + "]\n" +
                "    reg : " + this.model._padHexByte(this.model.get('reg')) + " [" + this.model._padBinary(this.model.get('reg'), 3) + "]\n" +
                "    rm  : " + this.model._padHexByte(this.model.get('rm'))  + " [" + this.model._padBinary(this.model.get('rm'), 3) + "]"
            );
        }
    });

    return DebugDecodeView;
});