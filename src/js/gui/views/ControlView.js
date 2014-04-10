/**
 * GUI control view
 *
 * @module GUI
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "gui/templates/GuiTemplate",
    "gui/views/SettingsView",
    "gui/views/LoadBlobView",
    "emu/emu"],
function(
    $,
    _,
    Backbone,
    GuiTemplate,
    SettingsView,
    LoadBlobView,
    Emu)
{
    var _buttonStates = {
        run      : false,
        reset    : false,
        pause    : false,
        halt     : false,
        step     : false,
        settings : false
    }

    /**
     * Toggle button states based on button clicked and existing state
     *
     * @param button
     * @param $el
     * @private
     */
    var _toggleState = function (button, $el)
    {
        switch (button)
        {
            case 'run' :
                _buttonStates['run']   = true;
                _buttonStates['pause'] = false;
                _buttonStates['halt']  = false;
                break;
            case 'pause' :
                _buttonStates['run']   = false;
                _buttonStates['pause'] = true;
                _buttonStates['halt']  = false;
                break;
            case 'halt' :
                _buttonStates['run']   = false;
                _buttonStates['pause'] = false;
                _buttonStates['halt']  = true;
                break;
        }

        for (b in _buttonStates)
        {
            if ( _buttonStates[b] )
            {
                $el.find('.button-' + b).addClass('active');
            }
            else
            {
                $el.find('.button-' + b).removeClass('active');
            }
        }
    }

    /**
     * Control View
     *
     * @type {*}
     */
    var ControlView = Backbone.View.extend({

        template: GuiTemplate['ControlTemplate'],

        tagName:  "div",

        events: {
            "click .button-run"      : "run",
            "click .button-reset"    : "reset",
            "click .button-pause"    : "pause",
            "click .button-halt"     : "halt",
            "click .button-step"     : "step",
            "click .button-settings" : "settings"
        },

        settingsModel : null,

        initialize: function() {
            // bind all methods to `this` scope
            _.bindAll(this, "keydown", "keyup");
            $(document).on('keydown', this.keydown);
            $(document).on('keyup', this.keyup);
        },

        render: function ()
        {
            this.$el.html(this.template());
            return this;
        },

        run : function ()
        {
            _toggleState("run", this.$el);

            Emu.run();
        },

        reset : function ()
        {
            _toggleState("reset", this.$el);

            Emu.reset();
        },

        pause : function ()
        {
            _toggleState("pause", this.$el);

            Emu.pause();
        },

        halt : function ()
        {
            _toggleState("halt", this.$el);

            Emu.halt();
        },

        step : function ()
        {
            _toggleState("step", this.$el);

            Emu.step();
        },

        settings : function ()
        {
            _toggleState("settings", this.$el);

            var settingsView = new LoadBlobView({ container : $("#gui-modal") });
            settingsView.show();
        },

        keydown : function (event)
        {
            // F7 - pause
            if (118 === event.keyCode)
            {
                event.preventDefault();
                this.pause();
            }
            // F8 - stop
            else if (119 === event.keyCode)
            {
                event.preventDefault();
                this.halt();
            }
            // F9 - step
            else if (Emu.isDebug() && 120 === event.keyCode)
            {
                event.preventDefault();
                this.step();
            }

            // F10 - 121
        },

        keyup : function (event)
        {

        }
    });

    return ControlView;
});