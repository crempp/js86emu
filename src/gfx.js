var gfx = {
    
    _w: 64,
    _h: 32,
    
    _gfxMem : [],
    
    setupGraphics : function ()
    {
        console.log("setupGraphics");
        
        // Reset graphics memory
        for (var i = 0; i <= (this._w * this._h); i++) this._gfxMem[i] = 0;
    },

    drawGraphics : function()
    {
        //console.log("drawGraphics");
    }
};
