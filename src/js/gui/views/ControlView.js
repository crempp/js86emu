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
    "gui/models/SettingsModel",
    "gui/templates/GuiTemplate",
    "gui/views/SettingsView",
    "gui/views/LoadBlobView"],
function(
    $,
    _,
    Backbone,
    SettingsModel,
    GuiTemplate,
    SettingsView,
    LoadBlobView)
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
            //case 'settings' :
            //    _buttonStates['settings'] = !_buttonStates['settings'];
            //    break;
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
            "click .button-run":      "run",
            "click .button-reset":    "reset",
            "click .button-pause":    "pause",
            "click .button-halt":     "halt",
            "click .button-step":     "step",
            "click .button-settings": "settings"
        },

        settingsModel : null,

        settingsView : null,

        initialize : function () {
            this.settingsModel = new SettingsModel();
            this.settingsView = new LoadBlobView({
                //el: $("#modal-settings"),
                el: $("#gui-modal"),
                model: this.settingsModel
            });
        },

        render: function ()
        {
            this.$el.html(this.template());
            return this;
        },

        run : function ()
        {
            _toggleState("run", this.$el);

        },

        reset : function ()
        {
            _toggleState("reset", this.$el);
        },

        pause : function ()
        {
            _toggleState("pause", this.$el);
        },

        halt : function ()
        {
            _toggleState("halt", this.$el);
        },

        step : function ()
        {
            _toggleState("step", this.$el);
        },

        settings : function ()
        {
            _toggleState("settings", this.$el);

            this.settingsView.show();
        }
    });

    return ControlView;
});