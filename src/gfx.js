var gfx = {

    _canvas      : null,
    _glcanvas    : null,
    _canvasCTX2D : null,

    fxData : {},

    // Sizes
    _fontWidth       : null,
    _fontHeight      : null,
    _screenWidth     : null,
    _screenHeight    : null,
    _textModeColumns : null,
    _textModeRows    : null,

    _font_path : "bin/fonts/",
    _fonts : {},

    _FONT_FG_LIGHT : 0xAA,
    _FONT_BG_DARK  : 0x00,

    // This should be set to true for memory models with attributes (normal operation)
    _use_attribute_bit : false,

    // Graphics memory - still needed???
    _gfxMemStart : 0x8000,
    _gfxMemSize  : 4 * 1024, // 4k

    _frameImg : null,

    _hasData : false,

    _fx : {
        "FakeCRT"    : false,
        "FakeStatic" : false,
        "FakeGlow"   : false
    },
    
    setupGraphics : function (canvas, cb)
    {
        console.log("setupGraphics");

        // The following lines should be moved into the graphics card class since their card dependant
        this._fontWidth       = 9;
        this._fontHeight      = 14;
        this._screenWidth     = 720;
        this._screenHeight    = 350;
        this._textModeColumns = 80;
        this._textModeRows    = 25;

        this._canvas = canvas;

        // Setup size
        this._canvas.width = this._screenWidth;
        this._canvas.height = this._screenHeight;

        this._canvasCTX2D = this._canvas.getContext('2d');

        // Reset graphics memory
        // TODO: Find the default attribute value
        console.log("  clearing video memory...");
        var gfxMem = new Uint8Array(this._gfxMemSize);
        for (var i = 0; i <= this._gfxMemSize; i += 2)
        {
            gfxMem[i] = 0x00; // Character code
            if (this._use_attribute_bit) gfxMem[i + 1] = 0x02; // Attribute
            else  gfxMem[i + 1] = 0x00; // Character code
        }
        cpu.setMemoryBlock(gfxMem, this._gfxMemStart);

        // Load font
        console.log("  loading font table...");
        this.loadFont("mda_cp_437", cb);

        // Setup FX
        console.log("  setting up effects...");
        for (var fx in this._fx)
        {
            if (this._fx[fx])
            {
                this.fxData[fx] = this["_fx_" + fx + "_init"]();
            }
            else
            {
                this.fxData[fx] = null;
            }
        }
    },

    /**
     * Draw the data in graphics memory
     *
     * Currently only text mode
     */
    drawGraphics : function()
    {
        console.log("drawGraphics");

        var attribute_offset;
        if (this._use_attribute_bit) attribute_offset = 2;
        else attribute_offset = 1;

        // Get the graphics memory from system memory
        var gfxMem = cpu.getMemoryBlock(this._gfxMemStart, this._gfxMemSize);

        // Get the canvas data
        var imageData = this._canvasCTX2D.getImageData(0, 0, this._screenWidth, this._screenHeight);

        // Variable access optimizations
        var tmr = this._textModeRows,
            tmc = this._textModeColumns;

        for ( var r = 0; r < this._textModeRows; r++)
        {
            for ( var c = 0; c < this._textModeColumns; c++)
            {
                var memoryOffset = ( (r * this._textModeColumns) + c ) * attribute_offset;

                var glyph = this._fonts[gfxMem[memoryOffset]],
                    attr  = gfxMem[memoryOffset + 1];

                //console.log("off = ", memoryOffset, " val=(", gfxMem[memoryOffset], ",", gfxMem[memoryOffset + 1], ")");

                // Now loop through the pixels of the font
                for ( var fy = 0; fy < this._fontHeight; fy++)
                {
                    // Build an array for this row of the font
                    //var glyphRow = new Uint8Array(this._fontWidth);
                    var glyphRow = glyph[fy];

                    for ( var fx = 0; fx < this._fontWidth; fx++)
                    {
                        // Calculate the memory offset
                        var canvasOffset = ( ((r * this._fontHeight) + fy) * imageData.width + ((c * this._fontWidth) + fx) ) * 4;

                        //var value = fx * fy & 0xff;
                        var value = (0xFF === glyphRow[fx]) ? this._FONT_FG_LIGHT : this._FONT_BG_DARK;

                        //imageData.data[canvasOffset] = glyphRow[fx];
                        imageData.data[canvasOffset]     = value; // Red
                        imageData.data[canvasOffset + 1] = value; // Blue
                        imageData.data[canvasOffset + 2] = value; // Green
                        imageData.data[canvasOffset + 3] = 255;   // Alpha
                    }
                }
            }
        }

        // Run FX
        for (var fx in this._fx)
        {
            if (this._fx[fx])
            {
                imageData = this["_fx" + fx + "_draw"](imageData);
            }
        }

        this._canvasCTX2D.putImageData(imageData, 0, 0);
    },

    /**
     * Load the font file and build the font table
     *
     * @param font
     * @param cb
     */
    loadFont : function (font, cb)
    {
        var canvas = document.getElementById('font-table');
        var context = canvas.getContext('2d');

        var path = this._font_path + font + ".png";

        // load image from data url
        var imageObj = new Image();
        var _this = this;
        imageObj.onload = function() {
            context.drawImage(this, 0, 0);
            _this.buildFontTable(context.getImageData(0, 0, this.width, this.height));
            cb();
        };

        imageObj.src = path;
    },

    /**
     * Build the font table for the adapter
     * @param context
     */
    buildFontTable : function (imageData)
    {
        var fontCounter = 0,
            fontsAcross = (imageData.width / this._fontWidth),
            fontsDown   = (imageData.height / this._fontHeight);

        for ( var y = 0; y < fontsDown; y++)
        {
            for ( var x = 0; x < fontsAcross; x++)
            {
                var glyph = [];

                // Now loop through the pixels of the font
                for ( var fy = 0; fy < this._fontHeight; fy++)
                {
                    // Build an array for this row of the font
                    var glyphRow = new Uint8Array(this._fontWidth);

                    for ( var fx = 0; fx < this._fontWidth; fx++)
                    {
                        // Calculate the memory offset
                        var glyphOffset = ( ((y * this._fontHeight) + fy) * imageData.width + ((x * this._fontWidth) + fx) ) * 4;

                        // The font files should be black & white so we just need
                        // to check of one channel has a non-zero value
                        if (imageData.data[glyphOffset] !== 0)
                        {
                            glyphRow[fx] = 0;
                        }
                        else
                        {
                            glyphRow[fx] = 255;
                        }
                    }
                    glyph[fy] = glyphRow;
                }

                this._fonts[fontCounter] = glyph
                fontCounter++;
            }
        }
    },

    /**
     * Print a character from the font table out to the console.
     *
     * @param char
     */
    debugPrintChar : function (char)
    {
        // see http://www.ascii-codes.com/
        for (var i = 0; i < this._fonts[char].length; i++)
        {
            row = "";
            for (var j = 0; j < this._fonts[char][i].length; j++)
            {
                if (0 === this._fonts[char][i][j])
                {
                    row += String.fromCharCode(0x2588);
                }
                else
                {
                    row += String.fromCharCode(0x00B7);
                }
            }
            console.log(row);
        }
    },

    /**
     * Fill the graphics memory with a debug pattern
     */
    debugVideoTestPattern : function () {
        var gfxMem = new Uint8Array(this._gfxMemSize);
        var charCounter = 0;
        var attrCounter = 0;
        for (var i = 0; i <= this._gfxMemSize; i += 2)
        {
            gfxMem[i] = charCounter++ % 0xFF; // Character code
            if (this._use_attribute_bit) gfxMem[i + 1] = attrCounter++ % 0xFF; // Attribute
            else gfxMem[i + 1] = charCounter++ % 0xFF; // Character code
        }
        cpu.setMemoryBlock(gfxMem, this._gfxMemStart);
    },

    /**
     * http://www.zachstronaut.com/posts/2012/08/17/webgl-fake-crt-html5.html
     *
     * Make sure you've included the glfx.js script in your code!
     *
     * @private
     */
    _fx_FakeCRT_init : function ()
    {
        // Here I load a PNG with scanlines that I overwrite onto the 2D game's canvas.
        // This file happens to be customized for the demo game, so to make this a
        // general solution we'll need a generic scanline image or we'll generate them
        // procedurally.
        // Start loading the image right away, not after the onload event.
        var lines = new Image();
        lines.src = 'assets/img/scanlines-vignette-4gl.png';

        var texture, w, h, hw, hh, w75;

        // This tells glfx what to use as a source image
        texture = this._glcanvas.texture(this._canvas);

        // Just setting up some details to tweak the bulgePinch effect
        w = this._canvas.width;
        h = this._canvas.height;
        hw = w / 2;
        hh = h / 2;
        w75 = w * 0.75;

        var fxData = {
            lines   : lines,
            texture : texture,
            w       : w,
            h       : h,
            hw      : hw,
            hh      : hh,
            w75     : w75
        }

        return fxData;
    },

    _fx_FakeCRT_draw : function ()
    {
        // Give the source scanlines
        this._canvasCTX2D.drawImage(this.fxData.fakecrt.lines, 0, 0, this.fxData.fakecrt.w, this.fxData.fakecrt.h);

        // Load the latest source frame
        this.fxData.fakecrt.texture.loadContentsOf(this._canvas);

        // Apply WebGL magic
        this._glcanvas.draw(this.fxData.fakecrt.texture)
            .bulgePinch(this.fxData.fakecrt.hw, this.fxData.fakecrt.hh, this.fxData.fakecrt.w75, 0.12)
            .vignette(0.25, 0.74);
    },

    /**
     * Draw fake static when the screen is not recieving video
     *
     * @private
     */
    _fx_FakeStatic_init : function () {
        return {};
    },

    _fx_FakeStatic_draw : function ()
    {
        canvas.draw(texture)
        this._glcanvas.noise(1);
    },

    /**
     * http://jsfiddle.net/AbdiasSoftware/dEya9/
     *
     * @private
     */
    _fx_FakeGlow_init : function () {
        return {};
    },

    _fx_FakeGlow_draw : function ()
    {
        this._glcanvas.hueSaturation(0.1888, 0.64);
    }

};
