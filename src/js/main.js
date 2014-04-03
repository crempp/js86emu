/**
 * Main application module loader
 *
 * @author Chad Rempp <crempp@gmail.com>
 */

require.config({
    baseUrl: "build/js",
    paths: {
        'jquery'     : '../lib/jquery-1.11.0',
        'backbone'   : '../lib/backbone-1.1.2',
        'underscore' : '../lib/underscore-1.6.0'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        }
    }
});

//the "main" function to bootstrap your code
require([
    'jquery',
    'underscore',
    'backbone',
    'gui/gui'],
function (
    $,
    _,
    Backbone,
    GUI)
{
    GUI.init();
});