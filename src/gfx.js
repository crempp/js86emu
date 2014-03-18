var gfx = {

    _canvas      : null,
    _glcanvas    : null,
    _canvasCTX2D : null,

    fxData : {},

    _w: 64,
    _h: 32,

    _gfxMem  : null,
    _gfxMemV : null,
    _gfxMemD : null,

    _frameImg : null,

    _hasData : false,
    
    setupGraphics : function (canvas)
    {
        console.log("setupGraphics");

        this._canvas = canvas;

        // Try to create a WebGL canvas (will fail if WebGL isn't supported)
        try
        {
            this._glcanvas = fx.canvas();
        }
        catch (e)
        {
            alert ("WebGL not supported");
            return;
        }

        this._canvasCTX2D = this._canvas.getContext('2d');

        // Reset graphics memory
        this._gfxMem  = new ArrayBuffer(this._w * this._h);
        this._gfxMemV = new Uint8ClampedArray(this._gfxMem);
        this._gfxMemD = new Uint32Array(this._gfxMem);
        //this._gfxMemV = new Uint8ClampedArray(this._w * this._h);

        for (var i = 0; i <= (this._w * this._h); i++)
        {
            this._gfxMemV[i] = 0;
        }

        // Setup glfx.js
        this._canvas.parentNode.insertBefore(this._glcanvas, this._canvas);
        this._canvas.style.display = 'none';
        this._glcanvas.className = this._canvas.className;
        this._glcanvas.id = this._canvas.id;
        this._canvas.id = 'old_' + this._canvas.id;

        // Setup FX
        this.fxData["fakecrt"]    = this._fx_FakeCRT_init();
        this.fxData["fakestatic"] = this._fx_FakeStatic_init();
        this.fxData["fakeglow"]   = this._fx_FakeGlow_init();
    },

    drawGraphics : function()
    {
        if (this._hasData)
        {
            // draw gfx data
        }
        else
        {
            var imageData = this._canvasCTX2D.getImageData(0, 0, this._w, this._h);

            for (var y = 0; y < this._h; ++y) {
                for (var x = 0; x < this._w; ++x) {
                    var value = x * y & 0xff;
                    this._gfxMemD[y * this._w + x] =
                            (255   << 24) |    // alpha
                            (value << 16) |    // blue
                            (value <<  8) |    // green
                            value;             // red
                }
            }
            imageData.data.set(this._gfxMemV);

            //this._canvasCTX2D.putImageData(imageData, 0, 0);

            // Put static in mem for cool fx :)
//            for (var i = 0; i <= (this._w * this._h); i++)
//            {
//                this._gfxMemV[i] = (0 === Math.floor(Math.random() * (2))) ? 0x00 : 0xFF ;
//                //this._gfxMemV[i] = 0xFF;
//                console.log(this._gfxMemV[i]);
//            }
//            console.log(this._gfxMemV);
        }

        // Render gfx memory to bitmap
//        this._frameImg = new Image();
//        var base64Data = btoa(String.fromCharCode.apply(null, this._gfxMemV));
//        this._frameImg.src = 'data:image/png;base64,' + base64Data;

        // Draw to canvas
        //this._glcanvas.draw(this._frameImg);
        this._glcanvas.draw(imageData);

        // Run FX
        //this._fx_FakeCRT_draw();
        //this._fx_FakeStatic_draw();
        //this._fx_FakeGlow_draw();

        // Update canvas
        this._glcanvas.update();
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
