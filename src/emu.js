window.onload = main;

/**
 *
 */
function main () 
{
    // Setup the page
    setup();
    
    // Set up render system and register input callbacks
    gfx.setupGraphics();
    input.setupInput();

    // Initialize the Chip8 system and load the game into the memory  
    cpu.reset();
    storage.load();
    cpu.boot();

    // Enable debugging
    cpu.toggleDebug();
    // Emulation loop
    //cpu.run();
}

function setup ()
{
    document.getElementById('files').addEventListener('change', storage.handleSelectedDiskImg, false);
}
