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
    "gui/templates/GuiTemplate"],
function(
    $,
    _,
    Backbone,
    GuiTemplate)
{
    var DebugDecodeView = Backbone.View.extend({
        template: GuiTemplate['DebugDecodeTemplate'],

        render : function ()
        {
            console.log("DebugDecodeView::render()");
            this.$el.html(this.template({model: this.model}));

            return this;
        },

        toConsole : function ()
        {
            console.log("" +
                "--------------------------------------------------------------------[decode]\n" +
                "instruction : " + decodedInst + "\n" +
                "opcode_byte = 0x" + opcode_byte.toString(16) + " [" + opcode_byte.toString(2) + "]\n" +
                "    op : 0x" + opcode.opcode.toString(16) + " [" + opcode.opcode.toString(2) + "]\n" +
                "    d  : 0x" + opcode.d.toString(16) + " [" + opcode.d.toString(2) + "]\n" +
                "    w  : 0x" + opcode.w.toString(16) + " [" + opcode.w.toString(2) + "]\n" +
                "addressing_byte = 0x" + addressing_byte.toString(16) + " [" + addressing_byte.toString(2) + "]\n" +
                "    mod : 0x" + opcode.mod.toString(16) + " [" + opcode.mod.toString(2) + "]\n" +
                "    reg : 0x" + opcode.reg.toString(16) + " [" + opcode.reg.toString(2) + "]\n" +
                "    rm  : 0x" + opcode.rm.toString(16)  + " [" + opcode.rm.toString(2) + "]"
            );
        }
    });

    return DebugDecodeView;
});