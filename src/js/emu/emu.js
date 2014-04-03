/**
 *
 *
 * @module Emu
 * @author Chad Rempp <crempp@gmail.com>
 */


//window.onload = main;


// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function animloop(){
    requestAnimFrame(animloop);
    gfx.drawGraphics();
};

/**
 *
 */
function main () 
{
    // Setup the gui
    gui.initialize();

    // Enable debugging
    cpu.toggleDebug();

    // Initialize the CPU
    cpu.reset();
    
    // Set up render system and register input callbacks
    gfx.setupGraphics(document.getElementById('gfx-port'),
        function () {
            input.setupInput();

            // ... storage init??
            storage.load();

            // Boot the CPU
            cpu.boot();

            //animloop();
        }
    );

}
