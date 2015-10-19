function initDoomWadTexture(context) {
  /**
   * Constructor
   */

  var renderFlat = function(stream, lumpHeader, texture, palette) {
    if (lumpHeader.size != 4096) {
      console.log("WARNING: FLAT '" + lumpHeader.name + "': lump size is not 4096, it is " + lumpHeader.size);
    }

    stream.seek(lumpHeader.offset);

    // Make FLAT lump data similar to PATCH lump data:
    texture._width  = 64;
    texture._height = 64;
    texture._left   = 0;
    texture._top    = 0;

    texture._rgbaBuffer = new Array(4 * texture._width * texture._height);

    // Decode
    //texture._rgbaBuffer.fill(255);

    for (var y = 0; y < texture._width; y++) {
      for (var x = 0; x < texture._height; x++) {
        var pixel = stream.read8u(y + (x*64));

        // Look up pixel value in palette.
        var realPixel = palette.fromId(pixel);

        // Write to buffer
        texture._rgbaBuffer[(x + y * texture._width) * 4 + 0] = realPixel.red;
        texture._rgbaBuffer[(x + y * texture._width) * 4 + 1] = realPixel.green;
        texture._rgbaBuffer[(x + y * texture._width) * 4 + 2] = realPixel.blue;
        texture._rgbaBuffer[(x + y * texture._width) * 4 + 3] = 255;

        // Using uints:
        // texture._rgbaBuffer[x + y * this.width] = palette.asUInt32(pixel);
      }
    }
  }

  var Texture = context.DoomWad.Texture = function(stream, lumpHeader, palette) {
    var self = this;

    // Record the total size of the texture
    self._size = lumpHeader['size'];

    // Record the name
    self._name = lumpHeader['name'];

    // Record the namespace
    self._namespace = lumpHeader['namespace'];

    // Decompress texture
    renderFlat(stream, lumpHeader, self, palette);

    return self;
  };

  Texture.prototype.size = function() {
    return this._size;
  };

  Texture.prototype.width = function() {
    return this._width;
  };

  Texture.prototype.height = function() {
    return this._height;
  };

  Texture.prototype.rgbaBuffer = function() {
    return this._rgbaBuffer;
  };

  Texture.prototype.name = function() {
    return this._name;
  };

  Texture.prototype.namespace = function() {
    return this._namespace;
  };
}