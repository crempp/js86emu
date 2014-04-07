/**
 * GUI loader view
 *
 * @module GUI
 * @author Chad Rempp <crempp@gmail.com>
 */

define([
    "gui/views/ModalView",
    "gui/templates/GuiTemplate"],
    function(
        ModalView,
        GuiTemplate)
    {

        var LoaderView = ModalView.extend({

            id : "modalContent-loader",

            className : "modal",

            template: GuiTemplate['LoaderTemplate']

        });

        return LoaderView;
    });