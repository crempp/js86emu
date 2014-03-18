window.onload = main;


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
    // Setup the page
    setup();
    
    // Set up render system and register input callbacks
    gfx.setupGraphics(document.getElementById('gfx-port'));
    input.setupInput();

    // Initialize the Chip8 system and load the game into the memory  
    cpu.reset();
    storage.load();
    cpu.boot();

    //animloop();

    // Enable debugging
    cpu.toggleDebug();
}

function setup ()
{
    document.getElementById('files').addEventListener('change', storage.handleSelectedDiskImg, false);
}
